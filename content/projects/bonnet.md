---
title: "Bonnet AI"
date: 2025-01-15
description: "AI-powered creative platform with RAG and multi-persona agents"
tags: ["AI", "LangChain", "RAG", "Next.js", "Django", "OpenRouter"]
categories: ["Projects"]
showToc: true
showReadingTime: true
weight: -9
---

Bonnet is a SaaS platform that automates the research-to-mood-board workflow for creative agencies. It uses AI to match designers with clients based on portfolio analysis and provides multi-persona AI assistants for different stages of the creative process.

**Tech Stack:** Next.js, Django, OpenRouter, LangChain, PostgreSQL, pgvector, Stripe

**Source:** Private (commercial product)

---

## The Problem

Creative agencies spend significant time on the discovery phase: understanding client needs, researching competitors, gathering inspiration, and matching the right designer to the project. This process is valuable but repetitive—the same research patterns apply across different clients.

The goal was to automate the mechanical parts while preserving the creative judgment that makes agencies valuable.

---

## Technical Approach

### Multi-Persona AI System

Different stages of the creative workflow need different AI behaviors. A research assistant should be thorough and factual. A brainstorming assistant should be creative and exploratory. A client communication assistant should be professional and clear.

I implemented this with configurable personas that modify the system prompts and model parameters. Each persona has its own temperature, context window usage, and retrieval settings. The frontend lets users switch between personas seamlessly, maintaining conversation context while changing the AI's behavior.

OpenRouter handles the model routing, which lets us use different models for different personas based on their strengths—Claude for nuanced communication, GPT-4 for research, and faster models for simple queries.

### Designer-Client Matching

Matching designers to projects based on portfolio analysis required building a semantic understanding of visual styles.

The system processes designer portfolios by extracting visual features and project descriptions, then embedding them into a vector space using pgvector. When a new project comes in, we embed the project requirements and find designers whose portfolio embeddings are closest in that space.

This isn't perfect—visual style is subjective—but it provides a useful starting point that humans can refine. The system learns from successful matches over time by adjusting embedding weights.

### RAG Knowledge Base

Each agency builds up institutional knowledge: client preferences, brand guidelines, past project outcomes. We store this in a RAG system that the AI can query during conversations.

The implementation uses LangChain for the retrieval pipeline. Documents are chunked, embedded, and stored in pgvector. During conversations, relevant chunks are retrieved and injected into the context. The tricky part was balancing retrieval relevance with conversation coherence—too much context clutters the AI's responses.

### Payment Integration

Credits are handled through Stripe. Users purchase credit packs that get consumed as they use AI features. Different operations cost different amounts based on their computational cost.

The billing logic handles edge cases: partial refunds, failed operations that shouldn't charge, and concurrent requests that might over-consume credits. All credit transactions are logged for audit purposes.

---

## What I Learned

**Persona design is harder than prompt engineering.** Getting consistent, useful behavior from different personas requires careful tuning. Small changes to system prompts can dramatically change the AI's output style.

**Vector search is a starting point.** Semantic matching gets you 80% of the way there, but the remaining 20% requires human judgment. Building interfaces that support human review rather than replace it leads to better outcomes.

**Rate limiting for AI is different.** Unlike traditional APIs, AI costs scale with token usage. Implementing cost controls that prevent runaway spending while keeping the product usable required careful design.

---

## Interested?

If you're building AI-powered SaaS products or want to discuss RAG implementations, [book a call](/book-a-call/).
