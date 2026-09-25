---
title: "Agent Middleware: What Kept Obelisk's Agents in Line"
date: 2026-04-08T10:00:00+05:00
lastmod: 2026-09-25T10:00:00+05:00
description: "Obelisk runs more than fifteen specialist agents. The agents were the easy part. Model choice, context, cost, retries and approvals all ended up in a middleware layer, and that layer is what made it work."
tags: ["LangChain", "LangGraph", "AI", "Agents", "Production"]
categories: ["AI systems"]
ShowToc: true
cover:
  ascii: "post-middleware"
  alt: "Agent middleware"
---

[Obelisk](/projects/obelisk/) is the AI marketing platform we build at Entropy Labs. It runs more than fifteen specialist agents: brand voice, SEO, email, paid ads, strategy and so on, all behind one API.

Writing an agent turned out to be the easy part. The hard part was everything wrapped around each model call: which model to use, what to do when the conversation gets long, how to stop an agent calling the same tool forever, when to ask a human before spending money, and what to do when something fails. Early on, each agent handled those things its own way. That didn't last.

What worked was pulling every one of those concerns into middleware: small, separate layers that run around every model and tool call, which each agent opts in or out of. LangChain's agent middleware gave us the hooks. The decisions below are the ones that mattered. I've left out our actual thresholds and routing rules, because those are ours, but the shape is the useful part.

## One concern per layer

Each middleware does one thing: pick the model, trim the context, cap the calls, gate the dangerous tools, recover from errors. An agent declares which ones it wants. The SEO agent, which uses a handful of tools, doesn't need tool filtering. The strategy agent, which can reach dozens of tools, does.

Order matters more than I expected. Model selection has to run first, so every later layer knows which model it's dealing with. Context trimming has to run before the call-limit check, or a long conversation burns its budget on retries. Approval gates have to sit close to the tool call, so nothing downstream can reroute around them. We found most of those orderings by getting them wrong.

## Choose the model per request, not per agent

Obelisk supports several model providers. The model is chosen when a request arrives, not when the agent is built. The same agent can run on one provider for one customer and another for a customer with a different contract or their own keys.

That was painful to build, because every provider streams, counts tokens and reports errors a little differently. It paid off three ways: cheap models for cheap jobs like summarizing, customer-supplied keys, and a fallback when one provider has a bad afternoon.

## Summarize before the smallest window fills up

Long sessions with tool calls and research results fill context windows faster than you'd think. When a conversation gets close to a threshold, a summarization layer compresses the older messages with a cheap model and keeps the recent ones as they are.

Two details made it work. The threshold is set well below the *smallest* context window we support, not the largest, so switching models mid-conversation never overflows. And every summarization is recorded: when it fired, how much it compressed. When an agent "forgets" something, that record is the first thing we check.

## Give each request only the tools it needs

Obelisk has a lot of tools. Handing all of them to every call is a bad idea: the model spends tokens reading descriptions it won't use, and a longer menu means more wrong picks. For agents with large toolsets, a cheap classifier picks a small relevant subset per request, with a few tools, like knowledge-base search, always included.

The effect was obvious in the logs: fewer irrelevant tool calls and a lot less prompt spent on tool descriptions.

## Ask a human before spending money

Anything that sends, publishes or spends goes through an approval gate. The agent proposes the call, the graph pauses, and the person sees exactly what's about to happen, including a spend warning when there's money involved. They can approve it, edit the arguments, or reject it.

```python
HumanInTheLoopMiddleware(
    interrupt_on={
        "send_campaign_email": {"allowed_decisions": ["approve", "edit", "reject"]},
        "publish_ad": {"allowed_decisions": ["approve", "reject"]},
        "search_knowledge_base": False,
    },
)
```

This needs a checkpointer, because the conversation has to survive the pause, sometimes for hours. It's also the single feature that made people comfortable letting agents touch real accounts.

## Retry what can be retried, and nothing else

The default instinct with errors is "retry three times and hope". That's fine for a timeout and terrible for a malformed email, which you'd just send malformed three times.

So errors get classified first. Timeouts and rate limits get retried with backoff. Validation and auth failures don't. When retries run out, the agent gets the error as a message and decides what to do (try something else, ask the user, say it failed) instead of the whole conversation crashing.

```python
@wrap_tool_call
def retry_transient(request, handler):
    for attempt in range(MAX_ATTEMPTS):
        try:
            return handler(request)
        except TransientError:
            if attempt == MAX_ATTEMPTS - 1:
                raise
            sleep(backoff(attempt))
```

Tool inputs are validated against their schemas before the call, so a bad argument fails fast and cleanly instead of halfway through a side effect.

## Many small agents beat one big one

The first version had one general agent with a very long system prompt that tried to cover every job. It wrote ad copy when asked for analytics and started research when someone wanted a quick answer.

Splitting it up fixed most of that. Each agent has a short prompt, its own tools and its own output style, and a bug in one doesn't break the others. We route to agents directly from the product, since the UI already knows which kind of conversation it's in. We don't use an agent to pick agents. That's simpler to debug and one less model call deciding what the next model call should be.

## What I'd do differently

1. **Build the middleware first.** We bolted it onto working agents over several months. Treating it as the foundation from day one would have saved a lot of refactoring.
2. **Log structured events from the start.** Debugging a many-agent system with print statements does not scale. Request IDs on every event came later than they should have. There's a post on [structured logging](/blog/structured-logging-ai-debugging/) about what we do now.
3. **Resist the orchestrator agent.** It's tempting. Direct routing plus good middleware is more predictable than a model deciding which model to call.
