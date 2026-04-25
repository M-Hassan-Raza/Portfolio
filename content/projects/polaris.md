---
title: "Polaris ERP"
date: 2025-02-10
description: "Retail operations platform covering POS, stock, ledgers, supplier workflows, reporting, and tenant-safe APIs."
cover:
  ascii: "polaris-cover"
  alt: "Polaris retail operations illustration"
  caption: "A simplified view of the operational seams that mattered most: inventory, billing, ledgers, supplier imports, and tenant-safe flows."
tags: ["Django", "Vue.js", "PostgreSQL", "ERP", "Full-Stack", "Concurrency"]
categories: ["Projects"]
showToc: true
showReadingTime: true
weight: -10
featured: true
projectLabel: "Retail operations platform"
projectFocus: "Batch stock truth, ledger integrity, and tenant-safe operations."
---

Polaris is a retail operations system that covers the parts teams touch all day: invoices, quotations, refunds, stock, customer credit, supplier purchasing, reporting, and the admin surface around all of that. It is the kind of product where a small mistake can turn into a stock problem, a bad balance, or a support mess by the end of the day.

**Tech Stack:** Vue 3, Pinia, TanStack Query, Django, Django REST Framework, PostgreSQL, Redis, Celery

**Source:** Private (client work) · [Book a call](/book-a-call/) to discuss

---

## What The System Covers

This is not just a billing screen with some inventory tables behind it. The codebase covers:

- POS and billing flows for invoices, quotations, returns, payments, and customer balances
- supplier operations including purchase orders, returns, stock intake, and three-way matching
- batch-based inventory, cycle counts, replenishment, barcode handling, and bundle logic
- customer and supplier ledgers, accounting paths, tax reporting, and scheduled exports
- tenant-safe APIs, scoped webhooks, and mobile-facing endpoints
- ratelist imports that have to digest CSV, Excel, and PDF files from suppliers who do not care about your schema

That breadth matters because the difficult bugs usually live between modules, not inside one screen.


## The Hard Parts

### Batch Stock Has To Be The Source Of Truth

Product quantity is derived from batch state, not casually edited as a loose field. That forces a cleaner contract across billing, restocking, counting, and supplier flows. It also means you cannot get away with hand-wavy updates when two people touch the same stock at once.

### Concurrency Is Not An Edge Case

The backend uses row locking, ordered locking, optimistic version checks, and advisory locks in the places where money or stock can drift. That shows up in billing, refund paths, customer ledgers, and inventory updates. The point is simple: the system has to stay correct when multiple people are working at once, not just when one admin is clicking around a test database.

### Tenant Isolation Has To Be Boring And Hard To Break

Polaris runs as a multi-tenant system. Organization context is established in middleware and pushed through query behavior and database state so one business does not leak into another. This is the kind of thing that only feels invisible when it is done right.

### Supplier Data Rarely Arrives Clean

The ratelist import flow turned into its own serious problem space. Supplier files come in mixed formats, inconsistent naming, missing units, and messy layouts. The import layer has to extract, normalize, alias, and lock around work that can affect downstream purchasing and catalog decisions.

## What This Project Actually Shows

Polaris is useful as a case study because it is not one clever feature. It is a wide system with enough operational surface area that the real work becomes contract discipline, state correctness, and keeping shared truth intact across modules.

That is also why I still point to it. It is a better signal of engineering judgment than a cleaner, narrower app would be.
