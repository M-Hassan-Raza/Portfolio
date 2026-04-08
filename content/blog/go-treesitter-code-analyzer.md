---
title: "How Pyscn Analyzes Python with Go and tree-sitter"
date: 2025-07-20T10:00:00+05:00
draft: false
tags: ["Go", "tree-sitter", "Static Analysis", "Python", "MCP", "Pyscn"]
showComments: true
ShowToc: true
---

[Pyscn](https://github.com/ludo-technologies/pyscn) is a code quality analyzer for Python built by [DaisukeYoda](https://github.com/DaisukeYoda) at ludo-technologies. It finds dead code, code clones, coupling issues, and complexity hotspots. It's written in Go, uses tree-sitter for parsing, and processes over 100,000 lines per second.

I've been studying its internals and the engineering decisions are worth writing about: how it detects dead code through control flow analysis, finds duplicated code across clone types 1-4 with LSH acceleration, and integrates with AI coding assistants via MCP.

## Why Go + tree-sitter

Python has excellent AST modules (`ast`, `astroid`), but they're slow for large codebases. Parsing in Python means the analysis tool is bottlenecked by the interpreter's speed. Go gives native performance while tree-sitter provides production-grade Python parsing without writing a custom grammar.

tree-sitter is a parser generator used by editors like Neovim, Helix, and Zed. Its Go binding (`go-tree-sitter`) lets you parse Python source files into concrete syntax trees, then walk those trees with Go's speed.

The tradeoff: tree-sitter produces CSTs (concrete syntax trees), not ASTs. You get every token including whitespace and punctuation. This means more node types to handle, but it also means you can reconstruct exact source locations — useful for reporting the exact lines of dead code.

## Dead Code via Control Flow Graphs

Most dead code detectors look for unused functions or unreachable imports. Pyscn goes deeper by building a Control Flow Graph for each function and finding code that's unreachable through any execution path.

The CFG construction works like this:

1. **Parse** the function body with tree-sitter
2. **Create nodes** for each statement or expression
3. **Add edges** for sequential flow and branching (if/elif/else, try/except, loops)
4. **Mark exit points** (return, raise, break, continue)
5. **Walk from entry** to find all reachable nodes
6. **Report** any node that wasn't reached

The key insight is handling exhaustive branches. If every branch of an if/elif/else chain ends with a return or raise, then code after the chain is unreachable:

```python
def process(status):
    if status == "active":
        return handle_active()
    elif status == "pending":
        return handle_pending()
    else:
        raise ValueError(f"Unknown status: {status}")

    # This code is dead — all branches above exit the function
    log_completion()  # pyscn catches this
```

Simple dead code detectors miss this because they don't track control flow through branches. Pyscn's CFG analysis handles nested branches, early returns inside loops, and try/except/finally blocks.

## Clone Detection: Types 1-4

Code duplication isn't binary. Pyscn classifies clones into four types:

| Type | Definition | Example |
|------|-----------|---------|
| Type 1 | Identical except whitespace/comments | Copy-pasted verbatim |
| Type 2 | Identical structure, different identifiers/literals | Renamed variables |
| Type 3 | Similar structure with small modifications | Added/removed a line |
| Type 4 | Same logic, different syntax | List comp vs. for loop |

Types 1-2 are detected by normalizing the AST (stripping identifiers, replacing literals with type markers) and hashing the result. Identical hashes mean identical structure.

Type 3 detection uses a similarity threshold on the normalized token sequences. This is where it gets expensive — naive pairwise comparison is O(n^2) in the number of code blocks.

Pyscn uses Locality-Sensitive Hashing (LSH) to accelerate this. Instead of comparing every pair of code blocks, it hashes each block into multiple buckets using MinHash signatures. Blocks that land in the same bucket are likely similar. This reduces the comparison space dramatically — only blocks that share a bucket get compared directly.

Type 4 is the hardest. Same logic, different syntax. Pyscn handles this through semantic normalization: both `[x for x in items if x > 0]` and the equivalent `for` loop get normalized to a similar token sequence before comparison.

## MCP Integration

Pyscn ships as both a CLI tool and an MCP (Model Context Protocol) server. The MCP server exposes the same analysis capabilities to AI coding assistants like Claude Code, Cursor, and ChatGPT.

This means you can ask your AI assistant "find duplicate code in this directory" and it calls pyscn under the hood, getting structured analysis results that it can reason about and suggest refactoring for.

```bash
# Claude Code setup
claude mcp add pyscn-mcp uvx -- pyscn-mcp
```

The MCP server wraps the same Go binary that the CLI uses. No separate analysis engine, no quality difference between CLI and AI-assisted usage. The Go microservice handles the analysis, and a thin Python wrapper (`pyscn` on PyPI) handles distribution and MCP transport.

## Performance

The 100K+ lines/sec number comes from two factors:

1. **Go's concurrency model.** File parsing happens concurrently across goroutines. Each file is independent, so the analysis parallelizes naturally.
2. **tree-sitter's parsing speed.** tree-sitter parsers are generated C code called through Go's FFI. The parsing itself is native speed, not interpreted.

The architecture — Go for the analysis engine, Python wrapper for distribution, MCP for AI integration — lets each layer play to its strengths. Go handles the performance-critical work. Python handles the ecosystem integration. MCP bridges the gap to AI tooling.
