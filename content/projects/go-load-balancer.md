---
title: "Go Load Balancer"
date: 2026-04-08T10:00:00+05:00
lastmod: 2026-09-25T10:00:00+05:00
description: "A small HTTP load balancer and dashboard in Go, built to understand what a reverse proxy actually does before trusting one."
tier: side
weight: 20
facts:
  role: "Built it to learn"
  timeline: "2025"
  status: "Public, finished"
  stack: ["Go", "net/http", "httputil"]
  source: "[github.com/M-Hassan-Raza/go-load-balancer-dash](https://github.com/M-Hassan-Raza/go-load-balancer-dash)"
tags: ["Go", "Networking", "Concurrency"]
---

I'd used load balancers for years without building one. This is the smallest version I could write that still does the real jobs: spread requests across backends, notice when one dies, and stop sending it traffic.

It has three parts: the balancer, a toy backend server, and a dashboard for watching and poking at both.

## What it does

- **Round-robin selection** across healthy backends, behind a mutex, using `httputil.ReverseProxy` for the actual proxying.
- **Health checks** every 30 seconds: a TCP dial with a three-second timeout. A backend that fails is skipped until it answers again.
- **Sensible server timeouts** for reads, writes and idle connections, and a graceful shutdown that gives in-flight requests a few seconds to finish.
- **A dashboard** that polls a status endpoint, shows each backend's health and response times, and lets you mark a backend as not ready, which is how you'd take one out for maintenance.

## What I took from it

**Health state is read constantly and written rarely.** Every request reads it; the checker writes it every thirty seconds. A read-write mutex fits that better than a channel, and it's easier to reason about.

**A TCP check tells you less than you'd hope.** A port that accepts connections can still be returning errors. A production balancer should check an HTTP health endpoint, and ideally watch real responses too. Knowing that gap is most of the value of building this.

**Graceful shutdown is a feature.** Without it, every deploy drops whatever was in flight.
