---
title: "Multi-Agent LLM Middleware: Lessons from Marketing Accelerant"
date: 2026-01-10T10:00:00+05:00
description: "What it took to make a multi-agent AI stack survive production: model routing, approval gates, retries, cost control, and sane control flow."
draft: false
tags: ["LangGraph", "LangChain", "AI", "Middleware", "Python", "Production"]
cover:
  image: "/assets/multi-agent-middleware-cover.svg"
  alt: "Multi-agent middleware illustration"
  caption: "The hard part was never the number of agents. It was the control layer around them."
showComments: true
ShowToc: true
---

Marketing Accelerant is an AI-powered marketing analytics platform I built at Entropy Labs. It runs 15+ specialized LLM agents — Brand Voice, Creative Content, CMO Strategy, SEO, Email Campaigns, Google Ads, Meta Ads, Video Studio, and more — all serving enterprise clients through a single FastAPI backend.

The agents themselves aren't the hard part. The hard part is everything around them: model selection, context management, cost control, error recovery, and human approval. This post covers the middleware architecture that makes it work in production.

## The Middleware Stack

Every agent in Marketing Accelerant runs through a composable middleware chain. The chain is built per-request from a set of flags:

```python
def build_agent_middleware(
    configurable: dict | None = None,
    *,
    agent_slug: str | None = None,
    include_summarization: bool = True,
    include_todo: bool = True,
    include_tool_selector: bool = False,
    include_approval: bool = True,
    include_retry: bool = True,
    include_error_handler: bool = True,
    include_loop_guard: bool = False,
    # ...
) -> list:
```

The order matters. Here's the full chain, top to bottom:

1. **Runtime model selection** — picks the LLM provider based on request config
2. **Workflow middleware** — agent-specific workflow state management
3. **Auto-summarization** — compresses context when it gets too long
4. **Todo list** — tracks multi-step task progress
5. **Tool selector** — filters 100+ tools down to the 24 most relevant
6. **Model retry** — retries on transient failures (rate limits, timeouts)
7. **Model call limit** — caps at 8 LLM calls per run
8. **Prompt caching** — one middleware per provider (Anthropic, OpenAI, Google, Bedrock)
9. **Tool loop guard** — detects and breaks tool call loops
10. **Research tool limits** — per-tool call caps (KB search: 4, web search: 4, deep research: 2)
11. **Human-in-the-loop** — approval gates for destructive tools
12. **Error handler** — catches and recovers from tool failures
13. **Tool contract enforcement** — validates tool inputs/outputs match contracts

Each middleware is a standalone concern. An agent opts in or out via flags on its class definition:

```python
class FrameworkMarketingAgent(BaseAgent[T]):
    include_todo_middleware = True
    include_tool_selector = False
    include_brand_voice = True
    include_approval_middleware = True
    include_loop_guard = False
    tool_selector_always_include: list[str] = []
```

The CMO Strategy agent enables the tool selector (because it orchestrates other agents and needs access to many tools). The Brand Voice agent disables it (it only needs KB search and content generation). Each agent gets exactly the middleware it needs.

## Request-Scoped Model Selection

Marketing Accelerant supports OpenAI, Anthropic, Google Gemini, and AWS Bedrock. The model is selected at request time, not at agent initialization. This means a single agent can run on Claude for one client and GPT-4 for another, depending on their configuration.

The first middleware in the chain — `runtime_model_selection_middleware` — reads the request config and injects the appropriate LLM. Every downstream middleware sees the model that was selected for this specific request. No global state, no singletons.

This was painful to build. Each provider has different API shapes, different token counting, different streaming behavior. But it means we can:
- Route to cheaper models for simple tasks (summarization uses a utility model at temperature 0.3)
- Let enterprise clients bring their own API keys
- Fall back to a different provider if one is down

## Auto-Summarization at 120K Tokens

Long conversations eat context windows. Marketing Accelerant agents can run for dozens of turns with tool calls, research results, and user feedback. Without management, you hit the context limit and the agent crashes.

The summarization middleware fires automatically:

```python
TrackingSummarizationMiddleware(
    model=utility_model,  # cheap model, temperature 0.3
    trigger=[("tokens", 120_000), ("messages", 100)],
    keep=("messages", 20),
    trim_tokens_to_summarize=32_000,
)
```

When the conversation hits 120K tokens or 100 messages (whichever comes first), it:
1. Keeps the 20 most recent messages intact
2. Takes up to 32K tokens of older messages
3. Summarizes them using the utility model
4. Replaces the old messages with the summary

The trigger threshold of 120K is set at ~70% of the smallest context window we support (Haiku's 200K). This leaves room for the system prompt, tools, and the next response without risking a context overflow.

The "tracking" in `TrackingSummarizationMiddleware` means it records when summarization fired, how many tokens were compressed, and how much context was preserved — we use this to debug quality issues when an agent "forgets" something from earlier in the conversation.

## Tool Selector: 100+ Tools, 24 Per Request

Marketing Accelerant has over 100 tools — knowledge base search, web search, URL fetching, analytics queries, email sending, ad management, content generation, calendar scheduling, and more. Giving every tool to every agent is a bad idea: the LLM wastes tokens reading tool descriptions it won't use, and it sometimes picks the wrong tool from a too-large menu.

The `RequestScopedToolSelectorMiddleware` uses a lightweight classifier LLM to select the 24 most relevant tools for each request:

```python
RequestScopedToolSelectorMiddleware(
    agent_slug="cmo",
    model=create_classifier_llm_for_selection(selection),
    max_tools=max(24, len(always_include) + 8),
    always_include=["knowledge_base_search", "web_search"],
)
```

Some tools are always included (like KB search). The rest are selected based on the agent type and the user's message. The CMO agent asking about campaign performance gets analytics and reporting tools. The same agent discussing brand strategy gets content and research tools.

This cut irrelevant tool calls by roughly 40% and reduced token usage on tool descriptions by ~60%.

## Human-in-the-Loop with Spend Warnings

Some tools are destructive — sending emails, publishing ads, modifying campaigns. These require human approval before execution:

```python
HumanInTheLoopMiddleware(
    interrupt_on={
        tool_name: {
            "allowed_decisions": ["approve", "edit", "reject"],
            "description": _approval_description,
        }
        for tool_name in TOOLS_REQUIRING_APPROVAL
    },
)
```

The approval prompt includes a spend warning if the tool involves money (ad spend, email sends). The user can approve as-is, edit the tool arguments, or reject entirely. This is LangGraph's `interrupt()` pattern — the graph pauses, sends the tool call to the frontend, and resumes when the user responds.

## Error Recovery That Doesn't Retry Blindly

The default approach to tool errors is "retry 3 times and hope." That's fine for network glitches but terrible for business logic errors (you don't want to retry sending a malformed email).

Marketing Accelerant uses contract-aware retries instead of blanket retries. The `enforce_tool_contracts` middleware validates tool inputs against their Pydantic schemas before execution and classifies errors into retriable (network, rate limit) vs. non-retriable (validation, auth). Only retriable errors get retried, with exponential backoff starting at 750ms.

```python
DEFAULT_MODEL_RETRY = ModelRetryMiddleware(
    max_retries=2,
    retry_on=_should_retry_model_error,
    on_failure="continue",  # don't crash the agent
    initial_delay=0.75,
    max_delay=8.0,
)
```

The `on_failure="continue"` is important: if all retries fail, the agent gets an error message and can decide what to do (try a different approach, ask the user, or report the failure). It doesn't crash the entire conversation.

## Why 15 Agents, Not 1

The first version of Marketing Accelerant had a single general-purpose agent. It was terrible. It would try to write ad copy when asked for analytics. It would start a research workflow when the user wanted a quick answer. The system prompt was 4,000 tokens of instructions trying to cover every use case.

Splitting into specialized agents solved this:
- Each agent has a focused system prompt (200-500 tokens instead of 4,000)
- Tool selection is scoped per agent
- Persona and formatting rules are agent-specific (the SEO agent outputs structured audits, the Creative agent outputs prose)
- Failures are isolated (a bug in the Email agent doesn't break Brand Voice)

The routing happens at the API layer — the frontend knows which agent to call based on the conversation type. We don't use an "orchestrator agent" that routes to sub-agents. Direct routing is simpler, faster, and easier to debug.

## What I'd Do Differently

If starting from scratch:

1. **Build the middleware stack first.** We bolted middleware onto existing agents over months. Building it as a first-class abstraction from day one would have saved significant refactoring.
2. **Invest in structured logging earlier.** Debugging a 15-agent system with `print()` statements doesn't scale. We added structured JSON logging with request correlation IDs after too many production debugging sessions that took hours.
3. **Don't build an orchestrator agent.** The temptation is strong. Resist it. Direct routing with a good middleware stack is simpler and more predictable than an LLM deciding which LLM to call.
