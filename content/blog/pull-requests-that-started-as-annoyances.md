---
title: "Most of My Pull Requests Started as an Annoyance"
date: 2026-04-08T10:00:00+05:00
lastmod: 2026-09-25T10:00:00+05:00
description: "Drive-by fixes in qBittorrent, Dokploy and django-hijack: which ones merged, which didn't, and what the rejections taught me about scope."
aliases:
  - /blog/i-fixed-a-bug-in-a-torrent-client/
tags: ["Open Source", "Contributing", "C++", "Python"]
categories: ["Engineering"]
cover:
  ascii: "post-annoyances"
  alt: "Drive-by open source fixes"
---

There's a popular way to do open source: pick high-visibility projects, choose issues strategically, build a narrative. I don't do it that way. I use a piece of software, something about it bugs me, I go and read why, and sometimes the why is fixable.

That approach has a good merge rate for small things and a bad one for anything ambitious. Here's an honest tally from three projects.

## qBittorrent: six merged, several closed

I use qBittorrent on a Mac, and the macOS build had small, visible rough edges. Those fixes merged: text cut off in the About dialog, dark corner artifacts on line edits, delete shortcuts that didn't match platform conventions, invisible toolbar spacers replaced with visible separators, overlapping text in the priority editor, a background mismatch in the Add New Torrent dialog.

Then I got ambitious. The options dialog says interface changes need a restart, so I set out to make theme settings apply at runtime: refresh icons, repaint cached widgets, keep the layout aligned. I spent days on it in whatever time I had after work, covering edge case after edge case. One maintainer's review found real regressions. Another asked a simple question: isn't this too much burden for such a minor goal?

It was. A restart once in a while is a small cost. A pile of new signal plumbing in a codebase that other people maintain for free is a big one. The PR was closed, and that was the right call.

[STORY?] Another PR I opened described a desktop menu that, as a maintainer pointed out, doesn't exist. He was right, and it was closed. The lesson there is shorter: check your own PR description as carefully as the diff.

## Dokploy: a queue that lost deployments

Dokploy is a self-hosted deployment platform I use for some projects. Queued deployments could get stuck in a state the history view didn't show, so they were effectively invisible. My fix adds the missing state and shows queued deployments properly. At the time of writing [the PR](https://github.com/Dokploy/dokploy/pull/4146) is still open. Plenty of good fixes sit for a while; maintainers have more PRs than hours.

## django-hijack: a user that went stale mid-request

This one came from reading code rather than from a bug I hit. django-hijack's middleware copied `request.user` too early and could hold on to a stale lazy user object for the rest of the request. That broke a flow in allauth's headless mode, where the session and user cache are reset partway through a request, and the request kept seeing the old anonymous user. [The fix](https://github.com/django-hijack/django-hijack/pull/893) re-copies the user lazily and adds a regression test for that reset flow, without pulling allauth in as a test dependency. It merged.

## What I take from the tally

**Small and obviously right merges.** Misaligned text, wrong shortcuts, a stale object: the maintainer can see the problem and the fix in a minute.

**Ambitious and optional usually doesn't, and shouldn't.** Every line merged is a line someone else maintains. If the benefit is minor, the burden wins.

**Open isn't rejected.** Some of my best fixes are sitting in queues. That's normal, and chasing maintainers about it costs them the time you're asking for.

If you want to start: find the thing that annoyed you today, check whether someone already owns it, and keep the first PR small enough to review over a cup of tea. Everything I know about scope, I learned from the ones that weren't.
