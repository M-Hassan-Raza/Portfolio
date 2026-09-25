---
title: "October"
date: 2026-09-25T10:00:00+05:00
description: "A campaign platform where brands, agencies and creators run influencer campaigns from brief to report, with numbers every side can trust."
tier: flagship
weight: 3
projectLabel: "Creator campaign platform"
facts:
  role: "Product and engineering lead, wrote most of the code"
  team: "Entropy Labs, a small team"
  timeline: "2025 to now"
  status: "[FACT?] Launched / in beta"
  stack: ["Django", "PostgreSQL", "Redis", "Next.js", "React", "TypeScript", "Supabase Auth", "WebSockets"]
  source: "Private, Entropy Labs product"
outcomes:
  - "Three kinds of users with overlapping data, each seeing exactly their share"
  - "Analytics and exports built from verified records, not estimates"
  - "Realtime messaging and dashboards over authenticated WebSocket connections"
tags: ["Django", "Next.js", "Multi-Party", "Analytics"]
---

October is where brands, agencies and creators run influencer campaigns together. A brand or its agency sets up a campaign, brings in creators, agrees on deliverables, tracks the posts as they go live and ends up with a report. I lead the product and wrote most of the backend and frontend.

It looks like a dashboard product. Underneath, it's a permissions problem, a data-honesty problem and a realtime problem at the same time.

## Three parties, one set of records

The same campaign looks different to each side. A brand sees its campaigns and the creators on them. An agency sees the brands it manages and the creators in its roster. A creator sees their own work, across every brand and agency they deal with.

The hard cases are the ones in between. A creator profile can be imported by an agency before the creator ever signs up, then claimed by the real person later. The claim has to attach to the right profile, keep the history, and not expose the agency's private data to the creator or the other way round. Rosters have owners, imports go through a review step before they count, and every query is scoped to the role asking, not just to the account.

## Numbers you can put in front of a client

Campaign reports go to people who pay for campaigns, so a number that's "roughly right" is a problem. A lot of the work before launch went into making every count on every dashboard and export come from verified records: posts that were actually approved and linked, not estimates, placeholders or whatever the last sync happened to return.

That sounds obvious and took a surprising amount of work. Previews are bounded so a big roster doesn't make a dashboard crawl, and the summary numbers are cached, but they come from the same verified records.

## Realtime that fails safely

Messaging and live dashboards run over WebSockets. Browsers can't send normal auth headers on a socket, so connections authenticate with short-lived opaque tickets issued over the regular API. Reconnects fetch a fresh ticket instead of reusing an old one, and idle connections are cleaned up rather than left holding server resources.

## AI where it's cheap to be wrong

October uses AI for recommendations, like which creators might suit a brief. The work is bounded in time and size, runs off the request path where it can, and only ever suggests. Nobody gets added to a campaign because a model said so.

## What I'd do differently

- **Model the roles before the screens.** The permission model kept changing as we learned how agencies really work. Writing it down first, as rules with tests, would have made those changes cheaper.
- **Decide what counts as a fact early.** "What exactly are we counting?" was a product question we answered in code too late.
