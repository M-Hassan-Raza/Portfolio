---
title: "What I Actually Spend on Running mhassan.dev: $8/year"
date: 2025-02-15T14:00:00+05:00
description: "The full cost of running this site, what's free, and the tradeoffs behind each choice."
tags: [Hugo, GitHub Pages, Portfolio, Web Development]
cover:
  ascii: "post-hosting"
  alt: "Portfolio hosting cost breakdown cover"
---

My portfolio costs me about $8/year. That's the domain. Everything else is free.

Here's the full breakdown and the tradeoffs behind each choice.

## The Stack

| What | Tool | Cost |
|------|------|------|
| Static site generator | Hugo + PaperMod | Free |
| Hosting | GitHub Pages | Free |
| Domain | Porkbun (mhassan.dev) | ~$8/year |
| Analytics | Umami Cloud (hobby plan) | Free |
| Comments | Giscus | Free |
| SSL | GitHub Pages auto-provision | Free |

## Why Hugo Over Next.js or Astro

I tried Astro first. It was fine. But Hugo builds my entire site in under 200ms. Astro took 4 seconds. For a markdown blog with no client-side interactivity, that's 4 seconds of complexity I don't need.

Hugo also means zero JavaScript in the output by default. No hydration, no runtime, no bundle. My portfolio loads fast on bad connections because there's almost nothing to load except HTML, CSS, and images.

The downside: Hugo's templating language is ugly. If you've ever written `{{ with .Params.cover }}{{ if .image }}` you know what I mean. But I only touch templates when I'm customizing PaperMod, which is maybe twice a year.

## Porkbun Over Cloudflare

Cloudflare Registrar is cheaper for some TLDs, but Porkbun gives you free WHOIS privacy, the dashboard isn't designed for infrastructure engineers, and the DNS setup for GitHub Pages took about 3 minutes. I set a CNAME record, GitHub provisioned the SSL cert, done.

## Umami Over Google Analytics

Google Analytics is free too, but it's also a privacy liability. I don't want a cookie banner on my portfolio. Umami gives me page views, referrers, and device breakdowns, which is everything I look at, without tracking individual users or requiring consent.

I use Umami's hosted hobby plan. The dashboard is clean, it doesn't set cookies, and my visitors don't get fingerprinted.

## Giscus: Comments That Filter Themselves

Giscus uses GitHub Discussions as a backend. The "limitation" that commenters need a GitHub account is the point: it means I get comments from developers, not spam bots. Moderation is handled through GitHub's existing tools. No database, no backend, no Disqus ads.

## What I'd Change

I'd still pick Hugo. The one thing I did change, eventually, was replacing PaperMod's profile-mode homepage with a custom one. PaperMod is excellent for posts, but a centered avatar and subtitle can only say so much.

Total recurring cost: one domain renewal.
