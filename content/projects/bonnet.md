---
title: "Bonnet"
date: 2026-04-08T10:00:00+05:00
lastmod: 2026-09-25T10:00:00+05:00
description: "An AI brand-development tool that turns a creative brief into research, strategy, creative direction, moodboards and a document a team can actually use."
tier: flagship
weight: 6
projectLabel: "AI brand workflow"
facts:
  role: "Backend execution flow and much of the frontend"
  team: "Entropy Labs team, for a client"
  timeline: "2025"
  stack: ["Django", "Channels", "PostgreSQL", "Next.js", "React", "OpenRouter", "Supabase"]
  source: "Private, client work"
outcomes:
  - "Long-running generation you can watch, cancel and rerun step by step"
  - "Research grounded in a narrow, relevant library rather than a general knowledge base"
  - "Exports that come out clean, with citations, however messy the model output was"
tags: ["AI", "Next.js", "Django", "Creative Tools"]
cover:
  ascii: "bonnet-cover"
  alt: "Bonnet, halftone illustration"
---

Bonnet takes a creative brief (business, audience, competitors, goals, tone) and runs it through research, strategy, creative direction and moodboards, ending in a document a brand team can review and hand on. It was a team project for a client. I owned most of the backend execution flow and a good part of the frontend.

## Long jobs that stay understandable

A full run takes a while. The backend treats it as a series of steps with their own state, streams progress to the browser over websockets, and supports cancelling and rerunning a single step without starting over. The goal was that someone watching it always knows what stage it's in, what changed on a rerun, and where the output lives.

## Cleaning up model output is product work

Model output doesn't arrive in one tidy shape. It mixes markdown, half-structured fragments and generated text, and that has to be normalized before it can be shown and exported. Skip that layer and the product looks broken even when the model technically answered.

## Narrow retrieval

The research step searches a focused library of case-study material, not a general knowledge base. The narrower contract is easier to reason about and keeps the research grounded in examples that matter for brand work.

## Assets are half the product

Moodboards, reports and images have to survive the trip from generation to storage to review to PDF export. File handling, metadata and asset shapes that the frontend can rely on took as much care as the text pipeline.

## What I took away

The hard part of products like this is rarely the model call. It's keeping a long run understandable, interruptible and worth trusting. The product only felt coherent once execution state, retrieval, assets and exports all agreed on what a project actually was.
