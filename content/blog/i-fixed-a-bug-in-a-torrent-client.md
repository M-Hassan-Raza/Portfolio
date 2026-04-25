---
title: "I Fixed a Bug in a Torrent Client I've Never Used"
date: 2025-12-10T10:00:00+05:00
description: "A piece on drive-by open source fixes, why I keep chasing them, and what that habit has taught me."
draft: false
tags: ["Open Source", "Contributing", "C++", "TypeScript", "Python", "Developer Culture"]
categories: ["Open Source"]
showComments: true
cover:
  ascii: "craft"
  alt: "Open Source Drive-By Fixes"
  caption: "Against the strategic open source narrative"
ShowToc: true
---

I fix things. Theme alignment in a torrent client I use daily. Ghost deployments in a PaaS that runs my projects. Middleware bugs in Django libraries I spotted just by reading the source code.

The internet has a narrative for open source contributions: they're career investments. "Build your personal brand." "Get noticed by FAANG." "Strategic contributions to high-visibility projects."

I'm not doing any of that. I just open software, see something broken, and can't leave it alone.

---

## The qBittorrent Theme Incident

I use qBittorrent. It works. But the theme system bothered me. Not broken — functional. But the sidebar alignment was off, the options dialog didn't apply theme changes until restart, and switching themes at runtime left cached widgets with stale styling.

So I fixed it.

Ten commits. All UI/theme work. Runtime theme application that refreshes icons and repaints cached widgets. Sidebar alignment. Options dialog layout consistency.

```
5b84c19 - Apply theme settings at runtime
f082bce - fix sidebar alignment and native repolish
c17e0c0 - fix options dialog theme apply layout
ea87f39 - refresh themed icons and cached widgets
```

The project is C++. I write Python and Go professionally. C++ is not my strong suit. But theme code is mostly "find the widget, set the property, trigger a repaint." The language matters less than understanding the UI framework's lifecycle.

I have not opened qBittorrent since.

---

## The Dokploy Ghost Jobs

Dokploy is a self-hosted PaaS — like Vercel or Heroku, but you run it yourself. I use it for deploying some of my projects. While working with it, I noticed that queued deployments would sometimes become ghosts: stuck in a "queued" state forever, with no way to cancel or retry them.

The deployment lifecycle wasn't tracking the "queued" → "running" → "done" transition correctly. Jobs could enter the queue and never exit.

The fix was three commits:

```
d83ba21 - fix(deployments): stop queued jobs from becoming ghosts
73aa0ce - feat(deployments): show queued deployment state
c2c9a84 - feat(database): add queued deployment status
```

I added the missing state, wired up the UI to show it, and made the queue drainable.

The fix got merged upstream. I still use Dokploy. The queue doesn't ghost anymore.

---

## Django Middleware Fixes (Because I Read Too Much Code)

These ones came from reading source code, not from hitting bugs in production. I was evaluating Django-Easy-Audit for audit logging in [Polaris](/projects/polaris/) and read through the middleware. Years of working with Django middleware meant the ASGI handling looked wrong immediately — it was assuming WSGI request formatting, so async deployments would log garbage IPs.

Same story with Django-Hijack. I was reading through user impersonation libraries and noticed the middleware wasn't invalidating the cached user object after switching back. Admin impersonates User A, switches back, next request still thinks they're User A. The kind of bug you spot instantly if you've spent enough time debugging Django's request/response cycle.

```
# django-easy-audit
71685a3 - tighten request event handling
e75355a - fix asgi remote addr handling

# django-hijack
2fa3653 - Fix user cache reset in middleware
```

These are the boring contributions. No conference talk material. Just "I read the code, something looked off, I fixed it." But this is what most open source contribution actually looks like. Not greenfield features. Not architectural rewrites. Just middleware bugs you spot because you've seen the pattern before.

---

## Why I'm Not Being Strategic About This

The "strategic open source" crowd has a framework: contribute to high-visibility projects, document everything, build a narrative. It's good advice if your goal is employability signaling.

My goal is different. I read code the way some people read Wikipedia at 2am — one link leads to another and suddenly you're deep in a qBittorrent widget refresh cycle wondering how Qt handles theme propagation. When I see something broken, fixing it is shorter than the mental loop of knowing it's broken and choosing not to.

I've seen people agonize over which project to contribute to, which issue to pick, how to maximize visibility. Meanwhile, the fastest path to a merged PR is: use software, find something annoying, fix it. No strategy required.

The barrier to open source isn't technical. It's the belief that your contribution needs to be important. It doesn't. Aligned sidebars matter. Drained queues matter. Correct IP addresses in audit logs matter. They just don't make for impressive LinkedIn posts.

---

## The Unsolicited Advice

If you're thinking about contributing to open source: don't start with "what project will look best on my resume." Start with "what software did I use today that annoyed me?"

Open the issue tracker. Read the code. You'll either find the bug and fix it, or you'll understand why it's harder than you thought. Both outcomes make you a better engineer.

And if you end up fixing theme alignment in a torrent client you'll never open again? That's fine. Somebody out there is looking at aligned sidebars because of you. That's enough.
