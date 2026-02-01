---
title: "Obelisk"
date: 2025-01-20
description: "AI-powered marketing platform with LangGraph agents, parallel RAG, and multi-tenant architecture"
tags: ["AI", "LangGraph", "FastAPI", "PostgreSQL", "RAG", "Multi-Tenant", "Vertex AI"]
categories: ["Projects"]
showToc: true
showReadingTime: true
weight: -8
---

Obelisk is an AI-powered marketing platform that helps teams create content with brand consistency. It orchestrates specialized AI agents for SEO, email marketing, brand voice analysis, and strategy—all within a multi-tenant SaaS architecture with space-level isolation.

**Tech Stack:** FastAPI, LangGraph, PostgreSQL, Vertex AI, Redis, Google Cloud

**Source:** Private (commercial product) · [Book a call](/book-a-call/) to discuss

---

## The Hard Problems

Building production AI systems exposes problems that don't appear in tutorials:

1. **Agent reliability** — LLMs hallucinate, get confused, and can be manipulated. How do you build agents that fail gracefully and resist prompt injection?

2. **RAG latency** — Semantic search is slow. Vector similarity, document retrieval, context assembly—each adds latency. Users waiting 20+ seconds for a response won't stick around.

3. **Multi-tenant AI** — Each organization has their own brand voice, documents, and context. That data must never leak between tenants, even through the AI's responses.

4. **Conversation persistence** — Long-running agent sessions need to survive server restarts, handle reconnections, and resume mid-conversation without losing context.

---

## Technical Deep Dives

### AI Agent Architecture with LangGraph

The system uses four specialized agents that collaborate on content tasks. LangGraph handles the orchestration—state machines for AI workflows.

**Agent Specialization**

Each agent has a focused role with its own system prompt, tools, and retrieval configuration:

```python
class AgentType(Enum):
    SEO = "seo"           # Search optimization, keyword research
    EMAIL = "email"       # Campaign copy, subject lines, sequences
    BRAND = "brand"       # Voice consistency, tone analysis
    STRATEGY = "strategy" # Content planning, competitive analysis

@dataclass
class AgentConfig:
    agent_type: AgentType
    system_prompt: str
    temperature: float
    tools: list[Tool]
    retrieval_config: RetrievalConfig
    max_iterations: int = 10

AGENT_CONFIGS = {
    AgentType.SEO: AgentConfig(
        agent_type=AgentType.SEO,
        system_prompt=SEO_SYSTEM_PROMPT,
        temperature=0.3,  # Lower for factual accuracy
        tools=[keyword_research, serp_analysis, content_audit],
        retrieval_config=RetrievalConfig(
            collections=["seo_guidelines", "competitor_analysis"],
            top_k=5
        )
    ),
    AgentType.BRAND: AgentConfig(
        agent_type=AgentType.BRAND,
        system_prompt=BRAND_SYSTEM_PROMPT,
        temperature=0.7,  # Higher for creative suggestions
        tools=[voice_analyzer, tone_checker, style_guide_lookup],
        retrieval_config=RetrievalConfig(
            collections=["brand_guidelines", "approved_content"],
            top_k=8
        )
    ),
    # ...
}
```

**Contamination Detection**

LLMs are vulnerable to prompt injection—malicious instructions hidden in retrieved documents or user input. We detect and block contaminated responses:

```python
class ContaminationDetector:
    """
    Detects signs of prompt injection in LLM outputs.
    """

    CONTAMINATION_PATTERNS = [
        r"ignore previous instructions",
        r"disregard (the |your )?system prompt",
        r"you are now",
        r"new instructions:",
        r"<\|.*?\|>",  # Common injection delimiters
        r"\[INST\]",   # Instruction markers
    ]

    def __init__(self):
        self.patterns = [re.compile(p, re.I) for p in self.CONTAMINATION_PATTERNS]

    def check_response(self, response: str, context_docs: list[str]) -> ContaminationResult:
        # Check for injection patterns in response
        for pattern in self.patterns:
            if pattern.search(response):
                return ContaminationResult(
                    contaminated=True,
                    reason="Response contains injection pattern",
                    pattern=pattern.pattern
                )

        # Check if response echoes suspicious document content
        for doc in context_docs:
            if self._contains_instruction_leak(response, doc):
                return ContaminationResult(
                    contaminated=True,
                    reason="Response echoes suspicious document content"
                )

        return ContaminationResult(contaminated=False)

    def _contains_instruction_leak(self, response: str, doc: str) -> bool:
        # Detect if the response is parroting instruction-like content from docs
        instruction_markers = ["you must", "always respond", "your role is"]
        for marker in instruction_markers:
            if marker in doc.lower() and marker in response.lower():
                # Check similarity of surrounding context
                if self._context_similarity(response, doc, marker) > 0.8:
                    return True
        return False
```

**Conditional Routing with Multiple Termination Conditions**

Agent loops need multiple exit conditions to prevent runaway execution:

```python
class AgentOrchestrator:
    def __init__(self, config: AgentConfig):
        self.config = config
        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        graph = StateGraph(AgentState)

        graph.add_node("retrieve", self.retrieve_context)
        graph.add_node("think", self.agent_think)
        graph.add_node("act", self.agent_act)
        graph.add_node("check", self.check_completion)

        graph.add_edge(START, "retrieve")
        graph.add_edge("retrieve", "think")
        graph.add_conditional_edges(
            "think",
            self.route_after_think,
            {
                "act": "act",
                "complete": END,
                "error": END,
            }
        )
        graph.add_edge("act", "check")
        graph.add_conditional_edges(
            "check",
            self.route_after_check,
            {
                "continue": "think",
                "complete": END,
                "max_iterations": END,
                "contaminated": END,
            }
        )

        return graph.compile(checkpointer=self.checkpointer)

    def route_after_check(self, state: AgentState) -> str:
        # Multiple termination conditions
        if state.iterations >= self.config.max_iterations:
            return "max_iterations"

        if state.contamination_detected:
            return "contaminated"

        if state.task_complete:
            return "complete"

        if state.needs_more_context:
            return "continue"

        return "complete"
```

**PostgreSQL Checkpointing for Conversation Resumption**

LangGraph supports checkpointing to persist conversation state. We use PostgreSQL for durability:

```python
from langgraph.checkpoint.postgres import PostgresSaver

class ConversationManager:
    def __init__(self, db_url: str):
        self.checkpointer = PostgresSaver.from_conn_string(db_url)

    async def resume_conversation(
        self,
        thread_id: str,
        new_message: str
    ) -> AsyncIterator[StreamEvent]:
        """Resume a conversation from its last checkpoint."""

        # Load existing state
        config = {"configurable": {"thread_id": thread_id}}

        # Get the agent graph for this conversation's type
        conversation = await self.get_conversation(thread_id)
        agent = self.get_agent(conversation.agent_type)

        # Stream from checkpoint
        async for event in agent.graph.astream(
            {"messages": [HumanMessage(content=new_message)]},
            config=config,
        ):
            yield self._format_event(event)

    async def get_conversation_history(self, thread_id: str) -> list[Message]:
        """Retrieve full conversation from checkpoints."""
        config = {"configurable": {"thread_id": thread_id}}
        state = await self.checkpointer.aget(config)
        return state.values.get("messages", []) if state else []
```

---

### Parallel RAG System

Standard RAG is slow—retrieve, rank, assemble, generate. We parallelize everything possible.

**4-Stream Parallel Retrieval**

Instead of sequential retrieval, we fire four queries simultaneously:

```python
class ParallelRetriever:
    """
    Retrieves from multiple sources in parallel, merging results.
    """

    async def retrieve(
        self,
        query: str,
        space_id: str,
        referenced_doc_ids: list[str] | None = None
    ) -> RetrievalResult:

        # Fire all retrievals in parallel
        tasks = [
            self._retrieve_referenced(referenced_doc_ids),  # Explicit references
            self._retrieve_general(query, space_id),        # Semantic search
            self._retrieve_urls(query, space_id),           # Web content
            self._retrieve_business_context(space_id),      # Org context
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Merge and deduplicate
        all_chunks = []
        for result in results:
            if isinstance(result, Exception):
                logger.warning(f"Retrieval stream failed: {result}")
                continue
            all_chunks.extend(result)

        # Deduplicate by content hash
        seen = set()
        unique_chunks = []
        for chunk in all_chunks:
            content_hash = hashlib.md5(chunk.content.encode()).hexdigest()
            if content_hash not in seen:
                seen.add(content_hash)
                unique_chunks.append(chunk)

        # Re-rank merged results
        ranked = await self.reranker.rank(query, unique_chunks)

        return RetrievalResult(
            chunks=ranked[:self.max_chunks],
            sources=self._extract_sources(ranked)
        )
```

**Query Enhancement with Fast Model**

Before retrieval, we enhance the query using a fast, cheap model:

```python
class QueryEnhancer:
    """
    Expands queries for better retrieval using Gemini Flash.
    """

    def __init__(self):
        self.model = GenerativeModel("gemini-1.5-flash")

    async def enhance(self, query: str, context: ConversationContext) -> EnhancedQuery:
        prompt = f"""
        Given this user query and conversation context, generate:
        1. An expanded search query with related terms
        2. 2-3 alternative phrasings
        3. Key entities to look for

        Query: {query}
        Recent context: {context.recent_summary}

        Respond in JSON format.
        """

        response = await self.model.generate_content_async(prompt)
        enhanced = json.loads(response.text)

        return EnhancedQuery(
            original=query,
            expanded=enhanced["expanded"],
            alternatives=enhanced["alternatives"],
            entities=enhanced["entities"]
        )
```

This reduced Time to First Token (TTFT) from 22s to 8-10s—a 50-65% improvement. The fast model call adds ~200ms but saves seconds on retrieval by producing better queries.

**3072D Embeddings via Vertex AI**

We use Vertex AI's text-embedding-004 model with 3072 dimensions for high-quality semantic matching:

```python
class EmbeddingService:
    def __init__(self):
        self.model = TextEmbeddingModel.from_pretrained("text-embedding-004")
        self.dimension = 3072

    async def embed_batch(
        self,
        texts: list[str],
        task_type: str = "RETRIEVAL_DOCUMENT"
    ) -> list[list[float]]:
        """
        Batch embed with automatic chunking for API limits.
        """
        embeddings = []
        batch_size = 250  # Vertex AI limit

        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            inputs = [
                TextEmbeddingInput(text=t, task_type=task_type)
                for t in batch
            ]
            results = await asyncio.to_thread(
                self.model.get_embeddings, inputs
            )
            embeddings.extend([r.values for r in results])

        return embeddings
```

---

### Document Processing Pipeline

Marketing teams upload diverse documents—PDFs, slides, spreadsheets, web pages. We need unified processing.

**Docling for Multi-Format Ingestion**

Docling handles format conversion with structure preservation:

```python
from docling.document_converter import DocumentConverter
from docling.datamodel.base_models import InputFormat

class DocumentProcessor:
    def __init__(self):
        self.converter = DocumentConverter()
        self.chunker = SemanticChunker()
        self.embedding_service = EmbeddingService()

    async def process_document(
        self,
        file_path: Path,
        space_id: str,
        metadata: dict
    ) -> ProcessedDocument:

        # Convert to unified format
        result = self.converter.convert(str(file_path))
        doc = result.document

        # Extract structure
        structure = DocumentStructure(
            title=doc.title,
            headings=self._extract_headings(doc),
            tables=self._extract_tables(doc),
            images=self._extract_images(doc),
        )

        # Semantic chunking that respects structure
        chunks = await self.chunker.chunk(
            doc,
            structure=structure,
            max_chunk_size=1500,
            overlap=200
        )

        # Generate embeddings
        embeddings = await self.embedding_service.embed_batch(
            [c.content for c in chunks]
        )

        # Store in vector DB
        await self.store_chunks(chunks, embeddings, space_id, metadata)

        return ProcessedDocument(
            id=str(uuid4()),
            chunks=len(chunks),
            structure=structure
        )
```

**Structure-Aware Semantic Chunking**

Naive chunking breaks context. We chunk at semantic boundaries:

```python
class SemanticChunker:
    """
    Chunks documents while preserving semantic structure.
    """

    def chunk(
        self,
        doc: Document,
        structure: DocumentStructure,
        max_chunk_size: int,
        overlap: int
    ) -> list[Chunk]:
        chunks = []
        current_section = None

        for element in doc.iterate_items():
            if element.is_heading:
                # Start new chunk at headings
                if current_section:
                    chunks.extend(self._finalize_section(current_section, max_chunk_size))
                current_section = Section(heading=element.text, content=[])

            elif element.is_table:
                # Tables get their own chunks with context
                chunks.append(Chunk(
                    content=self._table_to_markdown(element),
                    metadata={"type": "table", "section": current_section.heading}
                ))

            elif element.is_text:
                if current_section:
                    current_section.content.append(element.text)

        # Finalize last section
        if current_section:
            chunks.extend(self._finalize_section(current_section, max_chunk_size))

        return chunks

    def _finalize_section(self, section: Section, max_size: int) -> list[Chunk]:
        """Split section content while maintaining heading context."""
        full_text = "\n".join(section.content)

        if len(full_text) <= max_size:
            return [Chunk(
                content=f"# {section.heading}\n\n{full_text}",
                metadata={"section": section.heading}
            )]

        # Split at paragraph boundaries
        paragraphs = full_text.split("\n\n")
        chunks = []
        current = f"# {section.heading}\n\n"

        for para in paragraphs:
            if len(current) + len(para) > max_size:
                chunks.append(Chunk(content=current, metadata={"section": section.heading}))
                current = f"# {section.heading} (continued)\n\n{para}\n\n"
            else:
                current += para + "\n\n"

        if current.strip():
            chunks.append(Chunk(content=current, metadata={"section": section.heading}))

        return chunks
```

**Dual Embeddings for Visual Content**

Some documents are image-heavy (presentations, infographics). We generate both text and visual embeddings:

```python
class DualEmbeddingService:
    def __init__(self):
        self.text_model = TextEmbeddingModel.from_pretrained("text-embedding-004")
        self.clip_model = self._load_clip()

    async def embed_chunk(self, chunk: Chunk) -> DualEmbedding:
        embeddings = {"text": None, "visual": None}

        # Always generate text embedding
        embeddings["text"] = await self.embed_text(chunk.content)

        # Generate visual embedding if chunk contains images
        if chunk.images:
            image_embeddings = []
            for img in chunk.images:
                img_emb = await self.embed_image(img)
                image_embeddings.append(img_emb)
            # Average pool image embeddings
            embeddings["visual"] = np.mean(image_embeddings, axis=0).tolist()

        return DualEmbedding(**embeddings)
```

---

### Multi-Tenancy: Organization → Space → Content

The system has a 3-tier hierarchy. Organizations contain spaces, spaces contain content. Each space is fully isolated.

**Space Context Service**

Every request resolves its space context with eager-loaded relationships:

```python
class SpaceContextService:
    """
    Resolves and caches space context for requests.
    """

    def __init__(self, cache: Redis):
        self.cache = cache
        self.ttl = 300  # 5 minutes

    async def get_context(self, space_id: str, user_id: str) -> SpaceContext:
        cache_key = f"space_context:{space_id}:{user_id}"

        # Try cache first
        cached = await self.cache.get(cache_key)
        if cached:
            return SpaceContext.model_validate_json(cached)

        # Load from DB with eager loading
        async with get_session() as session:
            result = await session.execute(
                select(Space)
                .options(
                    selectinload(Space.organization),
                    selectinload(Space.members),
                    selectinload(Space.brand_settings),
                    selectinload(Space.integrations),
                )
                .where(Space.id == space_id)
            )
            space = result.scalar_one_or_none()

            if not space:
                raise SpaceNotFoundError(space_id)

            # Verify user access
            if not self._user_has_access(space, user_id):
                raise AccessDeniedError(f"User {user_id} cannot access space {space_id}")

            context = SpaceContext(
                space_id=space.id,
                organization_id=space.organization.id,
                brand_voice=space.brand_settings.voice_profile,
                integrations=[i.type for i in space.integrations],
                user_role=self._get_user_role(space, user_id),
            )

            # Cache for subsequent requests
            await self.cache.setex(
                cache_key,
                self.ttl,
                context.model_dump_json()
            )

            return context
```

**Middleware Enforcement**

Every request validates the `X-Space-Id` header:

```python
class SpaceIsolationMiddleware:
    """
    Enforces space-level isolation for all requests.
    """

    def __init__(self, app: ASGIApp):
        self.app = app
        self.public_paths = {"/health", "/auth/token", "/docs", "/openapi.json"}

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope["path"]
        if path in self.public_paths:
            await self.app(scope, receive, send)
            return

        headers = dict(scope["headers"])
        space_id = headers.get(b"x-space-id", b"").decode()

        if not space_id:
            response = JSONResponse(
                {"error": "X-Space-Id header required"},
                status_code=400
            )
            await response(scope, receive, send)
            return

        # Validate space exists and user has access
        user = scope.get("user")
        try:
            context = await self.space_service.get_context(space_id, user.id)
            scope["space_context"] = context
        except (SpaceNotFoundError, AccessDeniedError) as e:
            response = JSONResponse({"error": str(e)}, status_code=403)
            await response(scope, receive, send)
            return

        await self.app(scope, receive, send)
```

**Query Isolation**

All database queries are scoped to the current space:

```python
class SpaceAwareRepository(Generic[T]):
    """
    Base repository that enforces space isolation.
    """

    def __init__(self, model: type[T], session: AsyncSession):
        self.model = model
        self.session = session

    def _base_query(self, space_id: str) -> Select:
        return select(self.model).where(self.model.space_id == space_id)

    async def get(self, space_id: str, id: str) -> T | None:
        result = await self.session.execute(
            self._base_query(space_id).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        space_id: str,
        filters: dict | None = None,
        limit: int = 100
    ) -> list[T]:
        query = self._base_query(space_id)

        if filters:
            for key, value in filters.items():
                query = query.where(getattr(self.model, key) == value)

        query = query.limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())
```

---

### Authentication: RS256 JWT with Key Rotation

Security is non-negotiable for a SaaS platform handling client data.

**Automated 90-Day Key Rotation**

JWT signing keys rotate automatically:

```python
class JWTKeyManager:
    """
    Manages RS256 key pairs with automated rotation.
    """

    def __init__(self, secret_manager: SecretManagerClient):
        self.secret_manager = secret_manager
        self.rotation_days = 90
        self.keys: dict[str, RSAPrivateKey] = {}
        self.public_keys: dict[str, RSAPublicKey] = {}

    async def initialize(self):
        """Load current and previous keys for seamless rotation."""
        current = await self._load_or_create_key("current")
        previous = await self._load_key("previous")

        self.keys["current"] = current
        self.public_keys["current"] = current.public_key()

        if previous:
            self.keys["previous"] = previous
            self.public_keys["previous"] = previous.public_key()

    async def rotate_if_needed(self):
        """Check if rotation is needed and perform it."""
        metadata = await self._get_key_metadata("current")

        if self._should_rotate(metadata):
            await self._rotate_keys()

    async def _rotate_keys(self):
        """Rotate: current -> previous, generate new current."""
        # Move current to previous
        current_key = await self._load_key("current")
        await self._store_key("previous", current_key)

        # Generate new current
        new_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=4096,
        )
        await self._store_key("current", new_key)

        # Reload
        await self.initialize()

        logger.info("JWT signing keys rotated successfully")
```

**Zero-Query User Context**

User identity and permissions are embedded in the JWT, eliminating database lookups for auth:

```python
class TokenPayload(BaseModel):
    sub: str  # User ID
    org_id: str
    spaces: dict[str, str]  # space_id -> role
    permissions: list[str]
    exp: datetime
    iat: datetime
    jti: str  # Unique token ID for revocation

class AuthService:
    async def create_token(self, user: User) -> str:
        """Generate token with embedded permissions."""
        spaces = await self._get_user_spaces(user.id)

        payload = TokenPayload(
            sub=user.id,
            org_id=user.organization_id,
            spaces={s.id: s.role for s in spaces},
            permissions=self._compute_permissions(user, spaces),
            exp=datetime.utcnow() + timedelta(hours=24),
            iat=datetime.utcnow(),
            jti=str(uuid4()),
        )

        return jwt.encode(
            payload.model_dump(),
            self.key_manager.keys["current"],
            algorithm="RS256",
            headers={"kid": "current"}
        )
```

**In-Memory TTL Cache for O(1) Verification**

Public keys are cached for fast verification:

```python
class TokenVerifier:
    def __init__(self, key_manager: JWTKeyManager):
        self.key_manager = key_manager
        self.revoked_tokens: TTLCache = TTLCache(maxsize=10000, ttl=86400)

    async def verify(self, token: str) -> TokenPayload:
        # Decode header to get key ID
        header = jwt.get_unverified_header(token)
        kid = header.get("kid", "current")

        # Get public key (O(1) lookup)
        public_key = self.key_manager.public_keys.get(kid)
        if not public_key:
            raise InvalidTokenError("Unknown key ID")

        # Check revocation (O(1) lookup)
        try:
            unverified = jwt.decode(token, options={"verify_signature": False})
            if unverified.get("jti") in self.revoked_tokens:
                raise TokenRevokedError()
        except jwt.DecodeError:
            raise InvalidTokenError("Malformed token")

        # Verify signature
        try:
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
            )
            return TokenPayload.model_validate(payload)
        except jwt.ExpiredSignatureError:
            raise TokenExpiredError()
        except jwt.InvalidTokenError as e:
            raise InvalidTokenError(str(e))
```

---

### External Integrations

Marketing platforms need to pull data from everywhere. We integrate with major ad and analytics platforms.

**AgentBridge Pattern for Slack**

External integrations use a bridge pattern that abstracts the service:

```python
class SlackBridge:
    """
    Bridge between AI agents and Slack workspaces.
    """

    def __init__(self, credentials: SlackCredentials):
        self.client = AsyncWebClient(token=credentials.bot_token)

    async def post_content(
        self,
        channel: str,
        content: GeneratedContent,
        context: SpaceContext
    ) -> SlackMessage:
        """Post AI-generated content to Slack for review."""

        blocks = self._format_content_blocks(content)

        response = await self.client.chat_postMessage(
            channel=channel,
            blocks=blocks,
            text=content.plain_text,  # Fallback
            metadata={
                "event_type": "content_review",
                "event_payload": {
                    "content_id": content.id,
                    "space_id": context.space_id,
                    "agent_type": content.source_agent,
                }
            }
        )

        return SlackMessage(
            ts=response["ts"],
            channel=response["channel"],
            content_id=content.id
        )

    async def handle_interaction(self, payload: dict) -> InteractionResult:
        """Handle button clicks, approvals, etc."""
        action = payload["actions"][0]

        if action["action_id"] == "approve_content":
            return await self._handle_approval(payload)
        elif action["action_id"] == "request_revision":
            return await self._handle_revision_request(payload)

        raise UnknownActionError(action["action_id"])
```

**OAuth2 Flow for Google Analytics 4**

Analytics integration uses OAuth2 with automatic token refresh:

```python
class GA4Integration:
    """
    Google Analytics 4 integration with OAuth2.
    """

    TOKEN_URL = "https://oauth2.googleapis.com/token"
    SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]

    async def exchange_code(self, code: str, redirect_uri: str) -> OAuthTokens:
        """Exchange authorization code for tokens."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                data={
                    "code": code,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                }
            )
            response.raise_for_status()
            data = response.json()

            return OAuthTokens(
                access_token=data["access_token"],
                refresh_token=data["refresh_token"],
                expires_at=datetime.utcnow() + timedelta(seconds=data["expires_in"])
            )

    async def get_report(
        self,
        tokens: OAuthTokens,
        property_id: str,
        metrics: list[str],
        dimensions: list[str],
        date_range: DateRange
    ) -> AnalyticsReport:
        """Fetch analytics data with automatic token refresh."""

        # Refresh if needed
        if tokens.expires_at < datetime.utcnow() + timedelta(minutes=5):
            tokens = await self._refresh_tokens(tokens)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://analyticsdata.googleapis.com/v1beta/properties/{property_id}:runReport",
                headers={"Authorization": f"Bearer {tokens.access_token}"},
                json={
                    "metrics": [{"name": m} for m in metrics],
                    "dimensions": [{"name": d} for d in dimensions],
                    "dateRanges": [{"startDate": date_range.start, "endDate": date_range.end}],
                }
            )
            response.raise_for_status()
            return AnalyticsReport.from_response(response.json())
```

---

### Real-Time Streaming

Users expect to see AI responses as they generate, not after a 10-second wait.

**Event Persistence for Reconstruction**

Agent run events are persisted for replay and debugging:

```python
class AgentRunEvent(Base):
    __tablename__ = "agent_run_events"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    run_id: Mapped[UUID] = mapped_column(ForeignKey("agent_runs.id"), index=True)
    sequence: Mapped[int]  # For ordering
    event_type: Mapped[str]  # token, tool_call, tool_result, error, complete
    payload: Mapped[dict] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    __table_args__ = (
        Index("ix_run_events_run_seq", "run_id", "sequence"),
    )

class EventPersistence:
    async def persist_event(
        self,
        run_id: UUID,
        event_type: str,
        payload: dict
    ):
        async with self.session() as session:
            # Get next sequence number
            result = await session.execute(
                select(func.coalesce(func.max(AgentRunEvent.sequence), 0))
                .where(AgentRunEvent.run_id == run_id)
            )
            next_seq = result.scalar() + 1

            event = AgentRunEvent(
                run_id=run_id,
                sequence=next_seq,
                event_type=event_type,
                payload=payload
            )
            session.add(event)
            await session.commit()

    async def replay_events(
        self,
        run_id: UUID,
        from_sequence: int = 0
    ) -> AsyncIterator[AgentRunEvent]:
        """Replay events for a run, optionally from a sequence."""
        async with self.session() as session:
            result = await session.stream(
                select(AgentRunEvent)
                .where(AgentRunEvent.run_id == run_id)
                .where(AgentRunEvent.sequence > from_sequence)
                .order_by(AgentRunEvent.sequence)
            )
            async for event in result.scalars():
                yield event
```

**WebSocket Integration with Reconnection**

Clients connect via WebSocket and can reconnect to resume streams:

```python
class StreamingEndpoint:
    async def websocket_handler(self, websocket: WebSocket):
        await websocket.accept()

        try:
            while True:
                message = await websocket.receive_json()

                if message["type"] == "subscribe":
                    await self._handle_subscribe(websocket, message)
                elif message["type"] == "resume":
                    await self._handle_resume(websocket, message)
                elif message["type"] == "message":
                    await self._handle_message(websocket, message)

        except WebSocketDisconnect:
            await self._handle_disconnect(websocket)

    async def _handle_resume(self, websocket: WebSocket, message: dict):
        """Resume a stream from a specific sequence."""
        run_id = UUID(message["run_id"])
        last_seq = message.get("last_sequence", 0)

        # Replay missed events
        async for event in self.persistence.replay_events(run_id, last_seq):
            await websocket.send_json({
                "type": event.event_type,
                "sequence": event.sequence,
                "payload": event.payload
            })

        # Continue with live stream if still running
        run = await self.get_run(run_id)
        if run.status == "running":
            await self._subscribe_to_live(websocket, run_id)
```

---

### Performance Optimizations

**Session Pre-Creation**

LLM sessions have cold start latency. We pre-warm them:

```python
class SessionPool:
    """
    Pool of pre-warmed LLM sessions for reduced latency.
    """

    def __init__(self, pool_size: int = 5):
        self.pool_size = pool_size
        self.available: asyncio.Queue[LLMSession] = asyncio.Queue()
        self.in_use: set[LLMSession] = set()

    async def initialize(self):
        """Pre-create sessions on startup."""
        for _ in range(self.pool_size):
            session = await self._create_session()
            await self.available.put(session)

    async def acquire(self) -> LLMSession:
        """Get a pre-warmed session."""
        try:
            session = self.available.get_nowait()
        except asyncio.QueueEmpty:
            # Pool exhausted, create new session
            session = await self._create_session()

        self.in_use.add(session)
        return session

    async def release(self, session: LLMSession):
        """Return session to pool."""
        self.in_use.discard(session)

        if self.available.qsize() < self.pool_size:
            # Reset and return to pool
            await session.reset()
            await self.available.put(session)
        else:
            # Pool full, close session
            await session.close()

    async def _create_session(self) -> LLMSession:
        """Create and warm up a new session."""
        session = LLMSession()
        # Warm up with minimal prompt
        await session.generate("Hello", max_tokens=1)
        return session
```

**Async PostgreSQL Connection Pool**

We use asyncpg with connection overflow handling:

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.pool import AsyncAdaptedQueuePool

engine = create_async_engine(
    DATABASE_URL,
    poolclass=AsyncAdaptedQueuePool,
    pool_size=15,
    max_overflow=25,  # Allow burst to 40 total
    pool_timeout=30,
    pool_recycle=1800,  # Recycle connections every 30 min
    pool_pre_ping=True,  # Verify connections before use
)
```

**Structured Logging with Correlation IDs**

Every request gets a correlation ID that flows through all log entries:

```python
class CorrelationMiddleware:
    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] == "http":
            correlation_id = scope["headers"].get(
                b"x-correlation-id",
                str(uuid4()).encode()
            ).decode()

            # Set in context var for logging
            correlation_context.set(correlation_id)

            # Add to response headers
            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    headers = MutableHeaders(scope=message)
                    headers.append("x-correlation-id", correlation_id)
                await send(message)

            await self.app(scope, receive, send_wrapper)
        else:
            await self.app(scope, receive, send)

# Logger configuration
class CorrelationFilter(logging.Filter):
    def filter(self, record):
        record.correlation_id = correlation_context.get("")
        return True
```

---

## What I Learned

**Contamination detection is essential.** LLMs will faithfully execute instructions hidden in retrieved documents. You need explicit detection for prompt injection patterns, or your agents become attack vectors.

**Parallel retrieval changes the latency equation.** When retrieval is your bottleneck, parallelizing streams has a multiplicative effect. Query enhancement adds latency but saves more by improving retrieval quality.

**Space-level isolation requires everywhere enforcement.** Every query, every cache key, every log entry needs space scoping. A single missed scope check creates a data leak. Middleware is necessary but not sufficient—repositories and services need built-in isolation.

**Checkpointing is worth the complexity.** Long-running AI conversations need persistence. LangGraph's PostgreSQL checkpointer handles this cleanly, but you still need event streaming for real-time UI and replay.

---

## Interested?

If you're building AI-powered SaaS products or want to discuss LangGraph patterns, [book a call](/book-a-call/).
