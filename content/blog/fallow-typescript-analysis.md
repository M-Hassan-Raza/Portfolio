---
title: "How Fallow Analyzes TypeScript in Under a Second"
date: 2026-04-05T10:00:00+05:00
draft: false
tags: ["Rust", "TypeScript", "Performance", "Oxc", "Static Analysis", "Fallow"]
showComments: true
ShowToc: true
cover:
  image: "/assets/fallow-typescript-cover.svg"
  alt: "Fallow TypeScript analysis cover"
---

[Fallow](https://github.com/fallow-rs/fallow) is a codebase analyzer written in Rust for TypeScript and JavaScript projects, created by [Bart Waardenburg](https://github.com/BartWaardenburg). I'm an [open source contributor](https://github.com/M-Hassan-Raza/fallow) to the project. It finds unused files, dead exports, unlisted dependencies, code duplication, circular dependencies, and complexity hotspots. It's a Rust alternative to [Knip](https://github.com/webpro-nl/knip).

On real-world projects, it runs 6-46x faster than Knip with 4-11x less memory. It analyzes Next.js (20,000+ files) in 1.5 seconds, where Knip doesn't even finish. Here's how the internals work.

## No TypeScript Compiler

The biggest performance decision was avoiding the TypeScript compiler entirely. Knip runs through `tsc` to build a type-checked AST. This is thorough but expensive — you're paying for type checking, declaration merging, and module resolution that a dead-code detector doesn't need.

Fallow uses [Oxc](https://oxc.rs), a Rust-native parser for JavaScript and TypeScript. Oxc parses syntax into an AST and provides scope-aware binding analysis through `oxc_semantic`, but it doesn't do type checking. For dead code detection, you need to know "what does this file export?" and "what does this file import?" — both are syntactic questions. You don't need to resolve types to answer them.

The tradeoff: Fallow can't detect unused type-narrowing exports or exports that are only used via type inference. In practice, these are rare enough that the 10-40x speedup is worth it. This was an intentional design decision by the project's creator.

## Cache-Friendly Edge Storage

The module graph is the core data structure. Each file is a `ModuleNode`, and edges represent imports between files. The naive approach is storing edges as `Vec<Edge>` per node (adjacency list). This scatters edge data across the heap, killing cache performance during traversal.

Fallow stores all edges in a single contiguous `Vec<Edge>`, with each module node holding a `Range<usize>` into that array:

```rust
pub struct ModuleNode {
    pub file_id: FileId,
    pub path: PathBuf,
    pub edge_range: Range<usize>,  // range into flat edges array
    pub exports: Vec<ExportSymbol>,
    pub re_exports: Vec<ReExportEdge>,
    pub is_entry_point: bool,
    pub is_reachable: bool,
    // ...
}
```

When you traverse a module's imports, you're iterating over a contiguous slice of memory. The CPU prefetcher loves this. It's the same pattern game engines use for entity-component systems — structure of arrays instead of array of structures.

The project also enforces compile-time size assertions to prevent accidental bloat:

```rust
#[cfg(target_pointer_width = "64")]
const _: () = assert!(std::mem::size_of::<ModuleNode>() == 104);
const _: () = assert!(std::mem::size_of::<SymbolReference>() == 16);
```

If someone adds a field that bumps the size, the build fails. This catches memory regressions before they become performance regressions.

## Suffix Array Clone Detection

Code duplication detection usually involves pairwise comparison — compare every pair of code blocks for similarity. That's O(n^2) and falls apart on large codebases.

Fallow uses suffix arrays instead. The approach:

1. **Tokenize** each source file into a sequence of abstract tokens (identifiers normalized, literals replaced with type markers)
2. **Concatenate** all token sequences with sentinel separators between files
3. **Build a suffix array** over the concatenated sequence using O(N log N) prefix-doubling with radix sort
4. **Compute the LCP array** (Longest Common Prefix) to find maximal repeated subsequences
5. **Extract clone families** from LCP runs that span different files

This finds all duplicated code blocks across the entire codebase in a single pass. No pairwise comparison. The suffix array construction is the expensive part, but it's O(N log N) where N is the total token count, not O(files^2).

On Next.js with 20,000 files, duplication detection completes in about 3 seconds. jscpd (the standard JavaScript duplicate detector) takes 24 seconds on the same codebase.

## Rayon Parallelism with Incremental Caching

Parsing is embarrassingly parallel — each file is independent. Fallow uses [Rayon](https://docs.rs/rayon) to parse files across all available CPU cores. On my M-series Mac with 10 cores, this alone cuts parsing time by ~6x.

But cold parsing is still the bottleneck for large projects. Fallow's caching layer stores parsed results keyed by file content hash. On subsequent runs, only modified files get re-parsed. This turns a 1.5-second cold analysis into a ~200ms warm analysis, because most files don't change between runs.

The cache key is a content hash, not a timestamp. This means renaming a file without changing its content doesn't invalidate the cache, and two files with identical content share a cache entry.

## 84 Framework Plugins, Zero Config

Fallow ships with 84 plugins that detect framework-specific patterns (Next.js page routes, Storybook stories, Vitest test files, Tailwind configs, etc.) and mark the relevant files as entry points. Without this, a dead-code detector would flag your `pages/index.tsx` as unused because nothing explicitly imports it.

The plugins are auto-detected from `package.json` dependencies — no configuration required. If you have `next` in your dependencies, Fallow knows that files matching `app/**/page.tsx` are entry points. This is what makes zero-config work on real projects.

## Real Numbers

Benchmarked on Apple M5, 32GB RAM, median of 5 runs:

| Project | Files | Fallow | Knip v5 | Speedup | Fallow RSS | Knip RSS |
|:--------|------:|-------:|--------:|--------:|-----------:|---------:|
| zod | 174 | 19ms | 639ms | 34x | 21 MB | 250 MB |
| fastify | 286 | 24ms | 1.13s | 46x | 27 MB | 289 MB |
| vue/core | 522 | 63ms | 702ms | 11x | 34 MB | 271 MB |
| svelte | 3,337 | 325ms | 1.93s | 6x | 67 MB | 460 MB |
| next.js | 20,416 | 1.48s | (crashes) | -- | 194 MB | -- |

Knip v5 can't analyze Next.js at all (exits with errors). Fallow handles it in under 2 seconds using less memory than Knip uses on a project 1/10th the size.

The performance comes from the combination of all these decisions: no type checker, cache-friendly data structures, suffix arrays for duplication, parallel parsing, and incremental caching. No single trick — just consistently choosing the faster approach at every layer of the pipeline. Contributing to a codebase with this level of performance engineering has been one of the best learning experiences for writing fast Rust.
