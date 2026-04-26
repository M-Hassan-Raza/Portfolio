---
title: "Go Load Balancer Dashboard"
date: 2025-01-05
description: "A Go load balancer with health checks, round-robin routing, concurrency handling, and a real-time dashboard."
tags: ["Go", "Systems Programming", "Networking", "Concurrency"]
categories: ["Projects"]
showToc: true
showReadingTime: true
weight: -7
---

A load balancer written in Go with a real-time monitoring dashboard. It supports multiple balancing algorithms, health checks, and automatic failover. This was a learning project to understand Go's concurrency model and network programming.

**Tech Stack:** Go, WebSockets, HTML/CSS/JS

**Source:** [github.com/M-Hassan-Raza/go-load-balancer-dash](https://github.com/M-Hassan-Raza/go-load-balancer-dash)

---

## Why Build This

I wanted to understand how load balancers actually work—not just use them, but build one. Go's goroutines and channels seemed like a good fit for handling concurrent connections, and the standard library has solid networking primitives.

The dashboard came later when I realized that debugging a load balancer without visibility into what's happening is frustrating.

---

## Technical Implementation

### Connection Handling

Each incoming connection spawns a goroutine that handles the request lifecycle. The goroutine selects a backend based on the current balancing algorithm, proxies the request, and handles the response.

Go's goroutines are lightweight enough that this scales well. The scheduler handles thousands of concurrent connections without the overhead you'd get with thread-per-connection models in other languages.

### Balancing Algorithms

The load balancer supports:

**Round Robin** — Requests cycle through backends in order. Simple and predictable.

**Weighted Round Robin** — Backends have weights, so more capable servers get more traffic. Useful when backend capacity isn't uniform.

**Least Connections** — Requests go to the backend with the fewest active connections. Adapts better to varying request durations.

Switching algorithms at runtime is supported through the dashboard. The balancer maintains state for each algorithm (current position for round-robin, connection counts for least-connections).

### Health Checks

Every 30 seconds, the balancer checks each backend with an HTTP request. Backends that fail the check are marked unhealthy and removed from rotation. When they recover, they're automatically added back.

The health check runs in its own goroutine and updates a shared health map. Access to the map is synchronized with a mutex. I considered channels for this but a mutex was simpler for read-heavy access patterns.

### Automatic Failover

When a request to a backend fails, the balancer retries with a different backend. This handles transient failures without returning errors to clients.

The retry logic has limits—it won't keep trying forever if all backends are down. After exhausting retries, it returns an error to the client.

### Real-Time Dashboard

The dashboard shows:
- Active backends and their health status
- Current connections per backend
- Request rate and latency percentiles
- Algorithm selection

Updates come through WebSockets. The balancer publishes metrics to a channel that the WebSocket handler reads and broadcasts to connected clients. This keeps the dashboard responsive without polling.

---

## What I Learned

**Go's concurrency model is intuitive once you get it.** Goroutines and channels map well to network programming patterns. The tricky part is knowing when to use channels vs. mutexes.

**Connection pooling matters.** Early versions created new connections for every proxied request. Adding connection pooling to backends dramatically improved performance.

**Observability is essential.** Without the dashboard, debugging issues was guesswork. Even simple metrics—connection counts, error rates—make problems obvious that would otherwise be hidden.

---

## Try It

Clone the repo and run it locally. The README has instructions for setting up backends to test against.

```bash
git clone https://github.com/M-Hassan-Raza/go-load-balancer-dash
cd go-load-balancer-dash
go run .
```

---

## Interested?

If you're interested in Go, systems programming, or networking, [book a call](/book-a-call/) to chat.
