---
title: "The Best Way to Learn a Codebase Is to Break Someone Else's"
date: 2026-01-08T10:00:00+05:00
draft: false
tags: ["Open Source", "Contributing", "Rust", "Python", "Go", "Swift", "Learning", "Software Engineering"]
categories: ["Software Engineering"]
showComments: true
cover:
  image: "/assets/codebase-learning.jpg"
  alt: "Learning Through Open Source"
  caption: "What reading other people's code teaches you that tutorials can't"
  relative: false
ShowToc: true
---

<div style="text-align: justify;">

The best code I've ever written was shaped by code I didn't write. Not tutorials, not books, not conference talks — other people's production codebases, with their weird naming conventions, unexpected architectural decisions, and review comments that rewired how I think about problems.

I contribute to open source projects across five languages. Not because I set out to be polyglot. Because I kept finding bugs in different ecosystems and couldn't stop myself from tracing them to the source. Along the way, I accidentally learned more about software architecture than any course ever taught me.

---

## <span style="color:#8ac7db">1,092 Lines of Rust I Didn't Plan to Write</span>

Fallow is a dead code analyzer for TypeScript and JavaScript, built in Rust. I use it on my Nuxt and Vue projects. It kept flagging false positives — Vue SFC template references as unused, `defineExpose` exports as dead code, Nuxt auto-imported composables as unreferenced.

I opened an issue. Then I read the detection logic. Then I understood *why* it was wrong — the analyzer was treating source files as standalone modules without understanding framework conventions. A Vue component that exports via `defineExpose` isn't dead code. A Nuxt composable in `composables/` isn't unused just because nothing explicitly imports it.

What started as "fix this one false positive" became a 1,092-line PR across 44 files:

```
f6e0040 - feat: harden Vue and Nuxt framework edge cases
```

The work included:
- Vue SFC template-aware analysis that understands `<template>` refs
- Nuxt runtime path detection for auto-imported composables
- Next.js App Router and Pages Router convention awareness
- Config alias parsing for Vite, Nuxt, and SvelteKit
- 170+ integration tests

### What I Actually Learned

Not Rust syntax — I already knew enough Rust to be dangerous. What I learned was how the Fallow maintainers think about static analysis. Their approach to AST walking is different from how I'd have done it. More defensive. More layered. They build up a "usage graph" before making any dead-code determination, which means false positives from incomplete graphs are caught structurally rather than with special-case patches.

I brought that pattern back to pyscn, a Python code analyzer I contribute to that's written in Go. Instead of checking "is this function called anywhere?" (fragile), I build a usage graph first and then query it (robust). Same principle, different language, learned by reading someone else's code.

---

## <span style="color:#FFB4A2">What IBM's Code Review Process Looks Like From the Outside</span>

Docling is a document processing library from IBM Research. PDF parsing, OCR, LaTeX, the works. I use it at work for document ingestion pipelines, and I contribute back when I find rough edges.

```
516c5a9 - feat(cli): add page break placeholder
5473e07 - fix(cli): avoid generating images for non-image exports
9abf0fd - fix: honor picture description batching and scale options
8bb637f - fix(cli): clarify image export mode help text
```

The contributions themselves are straightforward. The review process is where the learning happens.

IBM's review standards are stringent. Every PR needs tests — not "add a test that proves your change works," but "add tests that prove your change doesn't break the contract the existing code assumes." That's a different bar. My first PR got pushed back because my test validated output. Their test framework validates *behavior* — the test should pass even if the output format changes, as long as the semantic contract holds.

They also push back on patterns that technically work but don't match the codebase conventions. I submitted a fix using Python's `pathlib` for file handling. Technically correct. But the existing codebase uses `os.path` consistently. The reviewer didn't say "use os.path." They said "this codebase predates pathlib adoption and mixing the two creates cognitive overhead for the next contributor." 

That's not a style nit. That's a maintainability argument I'd never considered. In my own projects, I'd have just used whichever felt right. In a codebase with dozens of contributors, consistency *is* the feature.

---

## <span style="color:#8ac7db">What Transfers Between Languages (And What Doesn't)</span>

I've contributed to projects in Python (Docling, Django ecosystem), C++ (qBittorrent), Rust (Fallow), Go (pyscn), and Swift (Alt-Tab, Maccy). Here's what I've noticed about cross-language contributions:

### What Transfers

**Architectural patterns.** The observer pattern in qBittorrent's Qt signals is the same concept as Django signals, which is the same concept as Rust's trait-based event handling. Different syntax, same idea: decoupled notification. Once you've seen it in three languages, you understand the *pattern*, not just the implementation.

**Debugging methodology.** "Read the error, trace the call stack, check the inputs" works in every language. The tools differ (lldb vs. pdb vs. delve) but the thinking is identical.

**Testing philosophy.** Test behavior, not implementation. Mock at boundaries, not internally. These principles don't care what language you're in.

### What Doesn't Transfer

**Idioms.** Pythonic code and idiomatic Rust are completely different beasts. Writing Python-style Rust (mutable state everywhere, `unwrap()` on every Result) compiles but produces code that Rust developers hate reviewing. Writing Rust-style Python (obsessive type narrowing, Result-pattern-matching with match/case) is technically correct and culturally wrong.

My first Fallow PR had Python-flavored Rust: deep nesting, mutable variables, string formatting where Rust developers would use enums. The reviewer didn't rewrite my code. They showed me the idiomatic version and explained *why* it's preferred — ownership semantics, exhaustive pattern matching, compiler-assisted refactoring. The "why" is what made it stick.

**Concurrency models.** Go's goroutines and channels are fundamentally different from Python's asyncio, which is fundamentally different from Rust's ownership-based thread safety. Reaching for the wrong concurrency primitive in the wrong language produces technically functional but architecturally confusing code.

**Error handling.** Python's try/except, Go's `if err != nil`, Rust's `Result<T, E>` — these aren't just syntax differences. They shape how you structure entire functions. In Rust, error handling is part of the type signature. In Python, it's a runtime concern. In Go, it's a control flow pattern. You can't bring one language's error philosophy to another without friction.

---

## <span style="color:#FFB4A2">The Reading-to-Writing Ratio</span>

Here's the part nobody tells you about open source contribution: the ratio of code read to code written is roughly 10:1.

For the Fallow PR, I read the entire analysis pipeline before writing a single line. The usage graph builder, the import resolver, the framework detection heuristics, the test infrastructure. I needed to understand how the pieces fit before I could extend one.

For Docling, I read the CLI pipeline, the export system, and the image handling chain. My changes touched maybe 50 lines of production code. I read thousands.

This is the actual skill open source develops: reading unfamiliar code quickly and building a mental model of how it works. Not "how does this function work?" but "what does this codebase assume about its inputs, its environment, and its users?"

That skill transfers to everything. Reading a new team's codebase when you join a company. Debugging a library you didn't write. Evaluating a dependency before adopting it. The faster you can build a mental model of unfamiliar code, the more effective you are as an engineer.

Tutorials teach you to write code. Open source teaches you to read it. In my experience, reading is the harder and more valuable skill.

---

## <span style="color:#8ac7db">The Practical Takeaway</span>

If you want to get better at software engineering faster than courses, books, or side projects alone can take you: find a project in a language you're comfortable with, pick an issue labeled "good first issue," and read the surrounding code before you touch anything.

The fix might take an hour. Understanding the codebase well enough to make the fix might take a day. That day is where the growth happens.

And if you're feeling ambitious: try contributing to a project in a language you *don't* write professionally. The friction of fighting unfamiliar idioms while trying to match an existing codebase's conventions is uncomfortable. It's also the fastest way to stop writing code that only works in one ecosystem.

The Rust I write is better because I've read Fallow's AST pipeline. The Python I write is better because IBM's reviewers pushed back on my assumptions. The Go I write is better because I've seen how pyscn structures its analysis passes.

None of that came from a tutorial. All of it came from breaking someone else's code and learning to put it back together.

</div>
