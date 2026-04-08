---
title: "mhassan.dev — This Portfolio"
date: 2025-02-10
description: "Hugo + PaperMod with custom partials, Giscus comments, and a GitHub Actions deploy pipeline. How the site is built."
tags: ["Portfolio", "Hugo", "PaperMod"]
categories: ["Projects"]
showToc: true
---

This site runs on Hugo with the PaperMod theme, deployed to GitHub Pages via a single GitHub Actions workflow. Total infrastructure cost: one domain name.

## Why Hugo

I wanted a static site generator that gets out of the way. Hugo builds the entire site in under 200ms, outputs plain HTML with no JavaScript runtime, and lets me write everything in Markdown. I tried Astro and Next.js first — both added complexity I didn't need for a blog with no client-side interactivity.

The tradeoff is Hugo's Go template language, which is awkward. But I only touch templates when customizing PaperMod, which is rare.

## What I Customized

PaperMod handles most of the layout, but I added a few custom partials:

```
layouts/
  _default/
    baseof.html       # base template
    single.html        # article pages
    home.html          # homepage override
  partials/
    breadcrumbs.html   # custom breadcrumb navigation
    giscus.html        # GitHub Discussions comment widget
    social_icons.html  # custom social link rendering
    extend_head.html   # Umami analytics script injection
    extend_footer.html # footer customization
```

The Giscus integration maps each page's URL path to a GitHub Discussion thread. Comments require a GitHub account, which filters out spam without needing moderation tooling.

## Deploy Pipeline

A single GitHub Actions workflow handles everything:

```yaml
on:
  push:
    branches: [main]

steps:
  - uses: actions/checkout@v4
    with:
      submodules: true    # PaperMod is a git submodule
  - uses: peaceiris/actions-hugo@v3
    with:
      hugo-version: '0.154.2'
      extended: true
  - run: hugo --minify && touch public/.nojekyll
  - uses: peaceiris/actions-gh-pages@v4
    with:
      publish_dir: ./public
      cname: mhassan.dev
```

Push to `main`, Hugo builds and minifies, the output goes to `gh-pages` branch. The `touch .nojekyll` prevents GitHub from running Jekyll on the output. The CNAME file keeps the custom domain configured.

PaperMod is pinned as a git submodule so theme updates are explicit — I pull them when I choose, not when they push.

## What I'd Do Differently

If starting over, I'd build a custom homepage layout instead of using PaperMod's profile mode. The profile mode is fine for a centered avatar and subtitle, but it's rigid if you want to feature specific posts or add sections. Everything else about the stack I'd keep exactly the same.
