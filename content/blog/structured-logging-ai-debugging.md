---
title: "Structured Logging for AI Debugging"
date: 2026-03-05T10:00:00+05:00
description: "Why one structured event per request makes AI-assisted debugging far more useful than a pile of scattered console logs."
draft: false
tags: ["Logging", "AI", "Developer Tools", "TypeScript", "Nuxt", "Evlog"]
showComments: true
ShowToc: true
cover:
  ascii: "ai"
  alt: "Structured logging cover"
---

When an AI coding assistant tries to help you debug a production issue, it reads your logs. If your logs are scattered `console.log` calls with inconsistent formatting, the AI can't help you. It doesn't know which log lines belong to the same request, what the timing was, or what the error context means.

[Evlog](https://github.com/HugoRCD/evlog) is a structured logging library by [Hugo Richard](https://github.com/HugoRCD), designed around the "wide event" pattern. One structured event per request, with all context attached. I've been using it in my projects and it's particularly useful when you're debugging with AI tools, because the log output is machine-readable by design.

## The Problem with console.log

A typical Node.js app logs like this:

```
[INFO] Processing order 12345
[INFO] User: john@example.com
[DEBUG] Fetching inventory for SKU-789
[WARN] Inventory low: 3 remaining
[INFO] Order processed in 847ms
[ERROR] Failed to send confirmation email
```

Six log lines for one request. To understand what happened, you need to mentally stitch them together, match the timing, and figure out which lines belong to which request when there are 50 concurrent users.

An AI assistant reading these logs has the same problem, but worse — it can't infer the causal chain between lines without explicit correlation.

## One Event Per Request

Evlog flips the model. Instead of many log calls, you build up a single event throughout the request lifecycle:

```typescript
import { createRequestLogger } from 'evlog'

export default defineEventHandler(async (event) => {
  const log = createRequestLogger(event)

  log.field('user', user.email)
  log.field('orderId', orderId)

  const items = await fetchInventory(skus)
  log.field('inventoryCount', items.length)

  if (items.some(i => i.stock < 5)) {
    log.field('lowStock', true)
  }

  await processOrder(order)

  // Duration is tracked automatically from request start
  // The event emits on request end with all fields attached
})
```

When the request finishes, evlog emits one structured JSON event:

```json
{
  "level": "info",
  "message": "POST /api/orders",
  "timestamp": "2026-03-05T10:23:45.123Z",
  "duration": 847,
  "user": "john@example.com",
  "orderId": 12345,
  "inventoryCount": 3,
  "lowStock": true,
  "env": { "service": "api", "environment": "production" }
}
```

Every field is on the same event. Duration is automatic. The AI assistant can read one JSON object and understand the entire request — who made it, what happened, how long it took, and what was unusual.

## Self-Documenting Errors

The most useful feature for AI debugging is evlog's error structure. Instead of `throw new Error("Failed to sync")`, you create errors with `why` and `fix` fields:

```typescript
throw new EvlogError({
  message: 'Failed to sync repository',
  status: 503,
  why: 'GitHub API rate limit exceeded',
  fix: 'Wait 1 hour or use a different token',
  link: 'https://docs.github.com/en/rest/rate-limit',
  cause: originalError,
})
```

When an AI reads this error in a log, it has three things it usually lacks:
1. **What happened** (the message)
2. **Why it happened** (root cause, not just the symptom)
3. **How to fix it** (actionable next step, not just "check the docs")

This is the difference between an AI saying "there's an error on line 47" and "the GitHub sync failed because you've exceeded the rate limit — you can either wait an hour or switch to a different API token."

## Automatic Context Injection

Evlog's framework integrations (Nuxt, Next.js, Express, Fastify, Hono, SvelteKit) automatically attach request context without manual wiring:

- **Request method and path** from the HTTP layer
- **Duration** from request start to response end
- **Status code** from the response
- **Environment** (service name, deployment version, commit hash, region) from runtime detection

The Nuxt module enables this with zero config:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['evlog/nuxt'],
  evlog: {
    env: { service: 'my-app' },
  }
})
```

Every server route automatically gets a request logger with duration tracking. You don't need to import anything or set up middleware — the module injects it.

## Why This Matters for AI-Assisted Debugging

The trend is clear: developers are using AI tools to debug production issues. They paste logs into Claude or ChatGPT and ask "what went wrong?" The quality of the answer depends entirely on the quality of the logs.

Structured events with correlation, timing, and self-documenting errors give the AI everything it needs to reason about the problem. Scattered console.log calls force the AI to guess at relationships between log lines, often incorrectly.

The logging format you choose isn't just about human readability anymore. It's about machine readability too. JSON events with consistent structure, automatic context, and explicit error causation are the format that works for both.
