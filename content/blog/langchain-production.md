---
title: "LangChain in Production: What the Tutorials Leave Out"
date: 2026-02-01T10:00:00+05:00
lastmod: 2026-09-25T10:00:00+05:00
description: "Where LangChain earns its place, where it gets in the way, and the handful of habits that kept our AI features from failing quietly: timeouts, validation, real persistence, tracing and pinned versions."
tags: ["LangChain", "LangGraph", "Python", "AI", "Production"]
categories: ["AI systems"]
ShowToc: true
cover:
  ascii: "post-langchain"
  alt: "LangChain in production"
---

Every LangChain tutorial ends where the real work starts. A tidy script queries a PDF, you think you'll ship it by Friday, and a few weeks later you're working out why a chain returns an empty string with no error.

I've shipped LangChain-based features at WebNoodle and at Entropy Labs, and we still use it for Obelisk's agents. So this is about where I've found it pays for itself, and what I now do by default when it does.

## Use it where it saves you work

LangChain is worth it when there's real orchestration: several model calls, tools, branching, approvals, state that has to survive a pause. The agent and middleware layer handles a lot of plumbing you'd otherwise write badly yourself, and the tracing integration is good.

It isn't worth it for "summarize this text". A direct SDK call is shorter, easier to debug and one less dependency to upgrade. At Entropy we do both: the framework for agent workflows, the provider SDK for simple completions.

## Always set a timeout, and retry only what's safe

A model call without a timeout will eventually hang a worker. Set one on every model you construct, and put retries on the calls that can safely be repeated:

```python
model = init_chat_model(MODEL_NAME, timeout=30, max_retries=2)
```

Be careful what "retry" means once tools are involved. Retrying a timeout is fine. Retrying a tool call that sent an email means sending it twice. In agents, retries belong in middleware that knows which errors are transient; I wrote about that in [agent middleware](/blog/langgraph-multi-agent-middleware/).

## Validate the input and the output

The worst LangChain bug I shipped didn't raise anything. A prompt template rendered an empty message list, the model returned nothing, and the chain reported success. The [war stories](/blog/war-stories-from-production/) have the details. Since then, two checks go around anything important: the rendered prompt isn't empty before the call, and the result is non-empty and parses into the shape you expected after it. Structured output with a schema does most of the second part for you.

## Keep conversation state out of the process

The old in-memory conversation helpers were convenient and wrong for production. State vanished on restart, grew without limit and wasn't safe across concurrent requests. They've since moved to the legacy package in LangChain 1.0, which says enough.

Persist state somewhere that outlives a deploy. For agents that means a checkpointer backed by PostgreSQL, keyed by a thread ID, so a conversation can pause for a human approval and pick up hours later. For plain chat history, Redis with an expiry is fine. Either way, you decide how long history lives and when it's trimmed, not the framework.

## Trace everything from day one

You can't fix what you can't see. Turn tracing on before the first user, not after the first incident: every call with its latency, token counts, inputs and outputs. LangSmith is the easy path. We also send our own structured events with a request ID, so a trace, a log line and a user's complaint can be matched to each other. And alert on spend. A tool loop that nobody caps will find your budget before you do.

## Pin versions and read the changelog

LangChain moves quickly. Import paths change, classes move between packages, defaults shift. Pin exact versions, upgrade on purpose, read the release notes, and keep a small smoke test that runs a real chain end to end, so an upgrade breaks in CI instead of in production.

## The short version

- Use the framework where there's orchestration to do, and the SDK where there isn't.
- Timeouts everywhere, retries only where repeating is harmless.
- Check the prompt before sending it and the answer before trusting it.
- State lives in a database, not in memory.
- Trace from day one, and pin your versions.
