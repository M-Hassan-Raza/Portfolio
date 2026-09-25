---
title: "Polaris"
date: 2025-02-10
lastmod: 2026-09-25T10:00:00+05:00
description: "Retail operations software for shops that bill all day: invoices, refunds, batch stock, supplier orders and customer ledgers that have to agree with each other."
tier: flagship
weight: 2
projectLabel: "Retail operations platform"
facts:
  role: "Built it end to end"
  team: "Just me, through Commit Software"
  timeline: "2024 to now"
  status: "In daily use by retail shops"
  stack: ["Django", "Django REST Framework", "PostgreSQL", "Redis", "Celery", "Vue 3", "Pinia", "TanStack Query"]
  source: "Private, client work"
outcomes:
  - "Billing, refunds, stock and ledgers stay consistent with several cashiers working at once"
  - "Every organization's data isolated in the database, not just in the app"
  - "Supplier price lists imported from CSV, Excel and PDF files as they arrive"
tags: ["Django", "Vue", "PostgreSQL", "Concurrency", "ERP"]
cover:
  ascii: "polaris-invoice"
  screen: true
  alt: "Polaris invoice screen, halftone"
  caption: "The invoice screen. Screens here are halftoned on purpose, so no customer data survives."
---

Polaris started as client work through Commit Software and turned into the system several retail shops run their day on. It covers the parts a shop touches constantly: invoices and quotations, refunds, stock, customer credit, supplier purchasing, expenses, reports, and the admin around all of it.

It's the project that taught me the edge cases are the product. A billing screen is easy. A billing screen that stays right when two cashiers sell the last item, a customer returns half an order on credit, and a supplier's price list arrives as a scanned PDF is the actual job.

{{< screen "polaris-modules" "The home screen. Every tile is a workflow that has to agree with the others." >}}

## Stock comes from batches, never from a loose number

A product's quantity is always derived from batch records, never typed in: what came in, from whom, at what cost, and what's left. That rule made every other module stricter. Billing, restocking, cycle counts and supplier returns all have to go through the same contract, and none of them can "just fix the number".

It's more work up front. It's also why stock counts in Polaris can be trusted at the end of the day.

## Correct with more than one person working

The race conditions came first, as they do. Two cashiers selling the last unit took stock negative, and two operations on one customer could leave a balance that matched neither. The [war stories post](/blog/war-stories-from-production/) has the details. The fixes that stuck:

- row locks that fail fast instead of queueing, with a short retry, so a cashier sees a blip instead of a spinner
- version checks, so a stale form can't overwrite newer edits
- per-customer and per-supplier advisory locks for ledger work, with keys that mean the same thing on every worker process
- tests that pin those contracts down, including one that checks lock keys come out the same under different hash seeds

## Tenants separated in the database

Polaris is multi-tenant. The organization is set once per request and carried down into the database session, so the separation doesn't depend on every query remembering a filter. That kind of isolation is invisible when it works, and it should stay that way.

## Supplier files arrive however suppliers like

Price lists come as CSV, Excel and PDF, with inconsistent names, missing units and layouts that change without warning. The import path extracts, normalizes and matches them against the catalogue, with aliases for the names suppliers insist on using. It locks around anything that can change purchasing, because a half-applied price list is worse than none.

{{< screen "polaris-reorder" "Generating a supplier order from low-stock items." >}}

## What I'd do differently

- **Explicit services before signals.** Early versions spread business rules across Django signals. They're now plain service functions you can read top to bottom. The [performance log](/blog/optimizing-django-performance/) covers that and the other early mistakes.
- **Concurrency tests on day one.** Every serious bug in Polaris was a concurrency bug that a two-thread test would have caught.
- **A written contract for every module boundary.** The worst bugs lived between modules, not inside them.
