---
title: "The Best Way to Learn a Codebase Is to Break Someone Else's"
date: 2026-04-08T10:00:00+05:00
lastmod: 2026-09-25T10:00:00+05:00
description: "What maintainers of kitty, calibre, libtorrent and Fallow taught me in review threads, usually by explaining why my fix was wrong in a way I hadn't considered."
tags: ["Open Source", "Code Review", "Learning"]
categories: ["Engineering"]
ShowToc: true
cover:
  ascii: "post-codebase"
  alt: "Learning through open source"
---

I started sending pull requests to open-source projects in March 2026, mostly to tools I use every day. At the time of writing that's {{< oss-count >}} merged, across Python, C++, Rust, Go and shell. (The [full list](/open-source/) is generated from GitHub, so it can't flatter me.)

I learned more from the review threads than from the code I wrote. Most of what I learned came from maintainers telling me, politely, that I'd missed something about their project that nobody could have told me in advance.

## The bug that was a decision

In kitty's drag-and-drop kitten, local copies used hard links when they could. That looked like a bug to me: edit the destination and you've edited the source too. I wrote it up as a fix.

Kovid Goyal's answer was that he'd chosen hard links deliberately, for performance, and that for a move they were always right. For a copy it was debatable, so perhaps an option. The PR became [an opt-in independent copy mode](https://github.com/kovidgoyal/kitty/pull/10412) with the default left alone, and it merged.

The lesson I keep coming back to: before "fixing" something odd in a mature codebase, find out whether it's odd on purpose. Usually the git blame or the maintainer knows.

## The fix that was too expensive

In calibre I wrote [a shared guard](https://github.com/kovidgoyal/calibre/pull/3148) to keep user-supplied paths inside the library root. My first version resolved every path with `realpath()`.

The review pointed out that `realpath()` does filesystem I/O, and that many of the paths I'd touched didn't need it. Inside calibre's own library directory you can assume there are no symlinks, because calibre doesn't create them. A security fix that slows down every path check isn't free, and knowing which invariants a codebase already guarantees is what lets you make it cheap.

## The optimization that could go further

In libtorrent I [sped up the piece picker's bitfield updates](https://github.com/arvidn/libtorrent/pull/8723) for sparse bitfields. Arvid Norberg benchmarked it and called it a significant improvement to piece-picker performance, then suggested going further: make the visitor a member of the bitfield type so it can skip zeroes a word at a time instead of a byte at a time. He also caught that I'd used `std::countl_zero` without including `<bit>`, which only showed up when the installed headers were compiled on their own. Both points were things I didn't know to look for.

## Maintainers are people with too little time

Two threads changed how I contribute more than any code review.

In Docling I opened a PR for an issue someone else had already fixed the night before. The maintainer thanked me anyway and asked that next time I comment on the issue before starting, so they could assign it. Obvious in hindsight. I do open source in the gaps around a day job, and claiming the issue first is how you stop two people spending those gaps on the same thing.

In Fallow, one of my PRs sat for a while with a failing check I had no way to fix myself. When it merged, Bart Waardenburg apologized for the wait and explained exactly what that check was, so it wouldn't look like my problem next time. On another PR he pushed his own review fixes to my branch and noted that my newest commits had replaced his local versions of the same fixes. Being on the receiving end of that kind of care is a good education in how to run a project.

## What transfers, and what doesn't

**What transfers:** reading before writing. For my first large Fallow PR, which taught it to understand Vue and Nuxt conventions (about 1,100 lines across 44 files), I read the whole analysis pipeline before changing anything: the graph builder, the import resolver, the framework detection. The fix was the easy part. Understanding what the codebase assumed was the work.

**What doesn't:** idioms. [STORY?] My early Rust had Python in it: deep nesting, mutable state, strings where the codebase used enums. Nobody rewrote it for me. They showed the idiomatic version and why it was preferred, which is the only way it stuck.

## If you want to start

Pick a tool you use every day and wait for it to annoy you. Read the issue tracker to see whether someone's already on it, say you're taking it, and read the surrounding code before you touch anything. The fix might take an hour. Understanding the code well enough to make it might take a day, and that day is where the learning happens.

And when a maintainer says no, read the reason twice. It's usually the most useful thing in the thread.
