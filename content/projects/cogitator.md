---
title: "Cogitator"
date: 2026-09-25T10:00:00+05:00
description: "A local code search engine in about 500 lines of OCaml: TF-IDF over code chunks, ranked by cosine similarity, printed as context for an LLM."
tier: side
weight: 21
facts:
  role: "Built it to learn OCaml"
  timeline: "2026"
  status: "Public"
  stack: ["OCaml"]
  source: "[github.com/M-Hassan-Raza/cogitator](https://github.com/M-Hassan-Raza/cogitator)"
tags: ["OCaml", "Search", "RAG"]
---

I wanted to learn OCaml and needed a problem small enough to finish. Cogitator indexes a codebase into chunks, splits identifiers the way programmers write them (`getUserName` becomes `get`, `user`, `name`), weights terms with TF-IDF and ranks chunks by cosine similarity. The output is a prompt with the most relevant code, ready to hand to a model.

It's deliberately simple: no embeddings, no server, no dependencies worth mentioning. The write-up of how it works, and what OCaml turned out to be good at, is in [TF-IDF in OCaml](/blog/tfidf-in-ocaml/).
