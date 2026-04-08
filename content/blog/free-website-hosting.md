---
title: "What I Actually Spend on Running mhassan.dev: $8/year"
date: 2025-02-15T14:00:00+05:00
description: "The full cost breakdown of running a developer portfolio — what's free, what's paid, and what tradeoffs I made."
tags: [Hugo, GitHub Pages, Portfolio, Web Development]
showComments: true
---

My portfolio costs me about $8/year. That's the domain. Everything else is free.

Here's the full breakdown and the tradeoffs behind each choice.

## The Stack

| What | Tool | Cost |
|------|------|------|
| Static site generator | Hugo + PaperMod | Free |
| Hosting | GitHub Pages | Free |
| Domain | Porkbun (mhassan.dev) | ~$8/year |
| Analytics | Umami (self-hosted) | Free |
| Comments | Giscus | Free |
| SSL | GitHub Pages auto-provision | Free |

## Why Hugo Over Next.js or Astro

I tried Astro first. It was fine. But Hugo builds my entire site in under 200ms. Astro took 4 seconds. For a markdown blog with no client-side interactivity, that's 4 seconds of complexity I don't need.

Hugo also means zero JavaScript in the output by default. No hydration, no runtime, no bundle. My portfolio loads fast on bad connections because there's genuinely nothing to load except HTML, CSS, and images.

The downside: Hugo's templating language is ugly. If you've ever written `{{ with .Params.cover }}{{ if .image }}` you know what I mean. But I only touch templates when I'm customizing PaperMod, which is maybe twice a year.

## Porkbun Over Cloudflare

Cloudflare Registrar is cheaper for some TLDs, but Porkbun gives you free WHOIS privacy, the dashboard isn't designed for infrastructure engineers, and the DNS setup for GitHub Pages took about 3 minutes. I set a CNAME record, GitHub provisioned the SSL cert, done.

## Umami Over Google Analytics

Google Analytics is free too, but it's also a privacy liability. I don't want a cookie banner on my portfolio. Umami gives me page views, referrers, and device breakdowns — which is everything I actually look at — without tracking individual users or requiring consent.

I self-host it on a free-tier instance. The data is mine, the dashboard is clean, and my visitors don't get fingerprinted.

## Giscus: Comments That Filter Themselves

Giscus uses GitHub Discussions as a backend. The "limitation" that commenters need a GitHub account is actually the feature — it means I get comments from developers, not spam bots. Moderation is handled through GitHub's existing tools. No database, no backend, no Disqus ads.

## What I'd Change

If I were starting over, I'd still pick Hugo. But I'd skip PaperMod's profile mode for the homepage and build a custom one. PaperMod is excellent for blog layouts but the homepage is a bit rigid if you want anything beyond a centered avatar and subtitle.

Total recurring cost: one domain renewal. Everything else is free and I control all of it.
