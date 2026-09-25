---
title: "Obelisk"
date: 2026-02-01T10:00:00+05:00
lastmod: 2026-09-25T10:00:00+05:00
description: "An AI marketing platform where specialist agents write, plan and analyze from a company's own material, without leaking one customer's brand into another's."
tier: flagship
weight: 1
projectLabel: "AI marketing platform"
facts:
  role: "Led product, wrote most of the backend"
  team: "Entropy Labs product team"
  timeline: "2025 to now"
  status: "In production"
  stack: ["Python", "FastAPI", "LangGraph", "LangChain", "PostgreSQL", "Redis", "Google Cloud", "Several model providers"]
  source: "Private, Entropy Labs product"
outcomes:
  - "More than fifteen specialist agents in production, each with its own tools and guardrails"
  - "First responses several times faster once retrieval ran in parallel"
  - "Spend and send actions always pass through a human approval step"
tags: ["AI", "LangGraph", "Multi-Tenant", "RAG"]
cover:
  ascii: "obelisk-cover"
  alt: "Obelisk, halftone illustration"
---

Obelisk is the platform we build at Entropy Labs for marketing teams. A company uploads what it already has (brand guidelines, past campaigns, product docs, analytics access) and gets a set of specialist agents that work from it: brand voice, SEO, email, paid ads, strategy and more.

I lead the product and wrote most of the backend. The agents are the visible part. Most of my time has gone into what sits around them.

## Agents that stay in their lane

Early Obelisk had one general agent with an enormous prompt. It wrote ad copy when asked about analytics and started research when someone wanted a one-line answer. Splitting it into specialists, each with a short prompt and a small set of tools, fixed most of that.

What made more than fifteen of them manageable was a shared middleware layer that every model and tool call passes through: choosing the model per request, trimming long conversations, capping runaway tool loops, retrying only what's safe to retry, and asking a human before anything that sends or spends. I wrote about that layer in more detail in [agent middleware](/blog/langgraph-multi-agent-middleware/).

## Retrieval fast enough to wait for

The agents are only as good as what they know about the company, which means retrieval runs before almost every answer. The first version did it in sequence: search the documents, then the saved URLs, then the company profile, then assemble. People waited a long time for the first word.

Now the independent lookups run at the same time, and a fast, cheap model rewrites the question before the search so the search itself returns better material. The rewrite adds a moment and saves several. Documents go through a structure-aware pipeline on the way in, so a chunk is a section of meaning rather than an arbitrary slice of text.

## One customer's brand never shows up in another's

Obelisk is multi-tenant: organizations contain spaces, and a space is the unit of isolation. Leaks in an AI product are worse than in a normal one, because they don't show up as a wrong row in a table. They show up as another company's tone, or a fact from their documents, inside your draft.

So the space is enforced everywhere, not just in one place: the request layer checks it, every repository scopes its queries by it, and cache keys and log lines carry it. The middleware alone is necessary but not enough. The one query that skips the scope is always the one that leaks.

## Sessions that survive restarts

Some agent sessions run long, with research, drafts, approvals and revisions. They have to survive deploys, dropped connections and a person coming back the next morning. Conversation state is checkpointed in PostgreSQL, and every step of an agent run is recorded as an event, so a reconnecting client can replay what it missed and we can reconstruct exactly what an agent saw when it did something odd.

## What I'd do differently

- **Build the control layer first.** We added middleware to working agents over months. It should have been the foundation.
- **Structured logs from the first commit.** Request IDs and one event per step would have saved a lot of long debugging sessions early on.
- **Treat prompt injection as a system property.** Pattern checks on inputs and outputs catch the lazy attempts. What actually limits the damage is structure: agents that can only reach their own tools, a human in front of anything that sends or spends, and retrieved documents treated as data, never as instructions.
