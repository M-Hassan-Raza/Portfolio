---
title: "LangChain in Production: What the Tutorials Don't Tell You"
date: 2025-06-20T10:00:00+05:00
draft: false
tags: ["LangChain", "Python", "AI", "Production", "RAG", "LLM", "Backend Development", "LCEL"]
categories: ["AI Development"]
showComments: true
cover:
  image: "/assets/langchain-prod.jpg"
  alt: "LangChain Production Architecture"
  caption: "The gap between tutorials and production is wider than you think"
  relative: false
ShowToc: true
---

<div style="text-align: justify;">

Every LangChain tutorial ends right where the real work begins. You see a neat 50-line script that queries a PDF, and you think, "Cool, I'll ship this by Friday." Three weeks later, you're debugging memory leaks, wondering why your chain silently returns empty strings, and questioning every decision that led you here.

I've shipped LangChain-based features to production at multiple companies. Here's what I wish someone had told me before I started.

---

## <span style="color:#8ac7db">When to Use LangChain (And When Not To)</span>

Let's start with the uncomfortable truth: **you probably don't need LangChain**.

LangChain is an abstraction layer. Abstractions are great when they simplify common patterns and terrible when they obscure what's actually happening. For LangChain, it depends entirely on your use case.

### Use LangChain when:

- You're building complex chains with multiple LLM calls, tools, and conditional logic
- You need observability and tracing (LangSmith integration is genuinely good)
- You're prototyping rapidly and might switch LLM providers
- Your team is already familiar with the framework

### Skip LangChain when:

- You're making simple API calls to one model
- You need fine-grained control over request/response handling
- Your use case doesn't fit LangChain's mental model
- Bundle size or cold start time matters (serverless)

At Entropy Labs, we use a hybrid approach: LangChain for complex agentic workflows, raw SDK calls for simple completions. The overhead isn't worth it for a straightforward "summarize this text" endpoint.

---

## <span style="color:#FFB4A2">LCEL: The Good Parts</span>

LangChain Expression Language (LCEL) was a massive improvement over the legacy chain syntax. Here's a pattern that actually works well in production:

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_anthropic import ChatAnthropic
from langchain_core.runnables import RunnablePassthrough

# Clean, composable chain
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a technical writer. Be concise."),
    ("human", "{input}")
])

model = ChatAnthropic(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    timeout=30.0,  # Always set timeouts
)

chain = (
    {"input": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)

# With retry logic
from langchain_core.runnables import RunnableRetry

robust_chain = chain.with_retry(
    stop_after_attempt=3,
    wait_exponential_jitter=True
)
```

The pipe syntax makes composition clear. You can see data flow. That's the good part.

### Streaming that actually works

```python
async def stream_response(query: str):
    async for chunk in chain.astream(query):
        yield chunk
```

Simple, clean, no surprises. Until you add memory.

---

## <span style="color:#8ac7db">The Problems Nobody Warns You About</span>

### 1. Memory management is a minefield

LangChain's conversation memory abstractions look elegant in docs. In production, they're a footgun.

```python
# This looks innocent
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory()
chain = ConversationChain(llm=llm, memory=memory)
```

Problems:
- Memory is stored in-process by default. Restart your server? Gone.
- No TTL. Chat histories grow unbounded.
- The memory object isn't thread-safe. Concurrent requests? Corruption.

What we actually use:

```python
from langchain_community.chat_message_histories import RedisChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

def get_session_history(session_id: str):
    return RedisChatMessageHistory(
        session_id,
        url=settings.REDIS_URL,
        ttl=3600  # 1 hour TTL
    )

chain_with_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
)
```

Redis handles persistence, TTL, and concurrency. LangChain's memory abstractions are just wrappers.

### 2. Silent failures everywhere

This one cost me 8 hours of debugging:

```python
# Looks fine, right?
result = await chain.ainvoke({"query": user_input})
```

The chain returned an empty string. No error. No exception. Nothing in logs.

The cause? A malformed prompt template that resulted in an empty message list. The LLM received nothing, returned nothing. LangChain happily passed it through.

**Always validate chain outputs:**

```python
result = await chain.ainvoke({"query": user_input})
if not result or not result.strip():
    logger.error(f"Empty response for query: {user_input[:100]}")
    raise ValueError("LLM returned empty response")
```

### 3. Version churn is exhausting

LangChain's API changes frequently. Code that worked in 0.1.x might not compile in 0.2.x. Import paths move. Classes get renamed.

```python
# v0.1.x
from langchain.chat_models import ChatAnthropic

# v0.2.x
from langchain_anthropic import ChatAnthropic

# v0.3.x
# Who knows? Check the migration guide.
```

**Pin your versions aggressively:**

```toml
# pyproject.toml
langchain = "==0.2.14"
langchain-core = "==0.2.33"
langchain-anthropic = "==0.1.23"
```

And read the changelogs before upgrading.

---

## <span style="color:#FFB4A2">Cost Tracking and Observability</span>

If you're not tracking costs, you're flying blind. LangSmith is the easiest path:

```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your-key"
os.environ["LANGCHAIN_PROJECT"] = "production"
```

Every chain execution gets traced. You see latency, token counts, and costs. The callback system also lets you build custom tracking:

```python
from langchain_core.callbacks import BaseCallbackHandler
from typing import Any

class CostTracker(BaseCallbackHandler):
    def __init__(self):
        self.total_tokens = 0
        self.total_cost = 0.0

    def on_llm_end(self, response: Any, **kwargs):
        usage = response.llm_output.get("token_usage", {})
        input_tokens = usage.get("prompt_tokens", 0)
        output_tokens = usage.get("completion_tokens", 0)

        # Claude Sonnet pricing (example)
        cost = (input_tokens * 0.003 + output_tokens * 0.015) / 1000
        self.total_cost += cost

        logger.info(f"LLM call cost: ${cost:.4f}")
```

At Entropy Labs, we alert when daily spend exceeds thresholds. One runaway loop can burn through hundreds of dollars.

---

## <span style="color:#8ac7db">Alternatives and When to Use Them</span>

### LlamaIndex for pure RAG

If your use case is "query documents and return answers," LlamaIndex is more focused. Less abstraction, more batteries included for retrieval.

### Direct SDK calls

For simple use cases, the Anthropic/OpenAI SDKs are cleaner:

```python
from anthropic import Anthropic

client = Anthropic()
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": query}]
)
```

No framework, no magic, full control.

### Haystack

If you need more structure than raw SDKs but less opinion than LangChain, Haystack hits a middle ground. Worth evaluating for production RAG pipelines.

---

## <span style="color:#FFB4A2">My Production Stack</span>

Here's what I actually deploy:

```
Simple completions: Anthropic SDK directly
Complex chains: LangChain + LCEL
Retrieval: LlamaIndex or custom (depending on scale)
Memory: Redis with manual management
Observability: LangSmith + custom Prometheus metrics
Rate limiting: Redis-based token bucket
Caching: Response caching for deterministic queries
```

The theme: use LangChain where it adds value, bypass it where it adds complexity.

---

## <span style="color:#8ac7db">The Bottom Line</span>

LangChain is a powerful framework with rough edges. The tutorials show the happy path; production is everything else.

Before adopting it:

1. Understand what abstraction you're buying and what control you're giving up
2. Set up observability from day one
3. Plan for version upgrades (they're frequent and breaking)
4. Build escape hatches for when the framework fights you

The best LangChain code I've written is the code that uses it sparingly—for the problems it solves well, not for everything.

</div>
