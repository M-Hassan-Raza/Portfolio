---
title: "Bonnet AI"
date: 2025-01-15
description: "AI brand-development platform that turns a creative brief into research, strategy, creative direction, moodboards, and exportable deliverables."
cover:
  ascii: "bonnet-cover"
  alt: "Bonnet brand workflow illustration"
  caption: "The product was most useful when the brief, the execution state, and the final deliverables all stayed connected."
tags: ["AI", "Next.js", "Django", "OpenRouter", "Supabase", "Creative Tools"]
categories: ["Projects"]
showToc: true
showReadingTime: true
weight: -9
featured: true
projectLabel: "AI brand workflow"
projectFocus: "Staged execution, realtime progress, reruns, and deliverable generation."
---

Bonnet is an AI brand-development product built around a clear delivery flow. A user starts with a creative brief, then the system pushes that work through research, strategy, creative direction, moodboards, and exportable outputs. The interesting part is not chat. It is the orchestration needed to turn a messy brief into something a team can actually review and ship.

**Tech Stack:** Next.js, React, Django, Channels, PostgreSQL, OpenRouter, Supabase

**Source:** Private (commercial product)

**My role:** Team project. I owned most of the backend execution flow, long-running job state, rerun behavior, retrieval contracts, and export plumbing.

---

## The Product Loop

The frontend intake asks for the real inputs that shape brand work: business context, audience, competitors, goals, values, tone, and maturity. From there the product kicks off a comprehensive execution flow and keeps the user inside one long-running project instead of bouncing them through disconnected tools.

The output is more structured than a generic assistant chat:

- research and category analysis
- strategic framing and narrative direction
- creative concepts and visual direction
- moodboards and linked assets
- PDF exports with citations and supporting material


## The Hard Parts

### Long-Running AI Work Has To Feel Trackable

This product is built around executions that take time, stream progress, and sometimes need to be rerun. That means the backend has to manage step state, websocket updates, cancellation, reruns, and asset linkage without losing the thread of the project.

### Output Cleanup Is Real Product Work

AI output does not arrive in one clean shape. The frontend spends real effort cleaning mixed markdown, structured fragments, and generated content so it can render properly, stay readable, and export cleanly to PDF. If you skip that layer, the product feels broken even when the model technically answered the prompt.

### Retrieval Needed To Stay Narrow And Useful

The retrieval layer is not a broad knowledge base bolted on for marketing copy. It is closer to targeted vector lookup over case-study style material that helps the research stage stay grounded. That narrower contract is easier to reason about and easier to keep useful.

### Asset Workflows Matter As Much As Text Workflows

Moodboards, reports, and creative assets all have to survive the trip from generation to storage to review to export. That means local file handling, uploads, metadata, and frontend-compatible asset shapes all have to line up.

## What I Learned

The hardest part of products like this is rarely the model call. It is keeping a long execution understandable, interruptible, and worth trusting. If the user cannot tell what stage they are in, what changed on a rerun, or where the output lives, the system does not feel serious.

Bonnet is a good example of that tradeoff. The product only starts feeling coherent once execution state, retrieval, assets, and exports all agree on what the project actually is.
