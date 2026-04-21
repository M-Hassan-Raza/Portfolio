---
title: "TF-IDF in OCaml: When Functional Programming Clicks"
date: 2026-03-22T10:00:00+05:00
draft: false
tags: ["OCaml", "Functional Programming", "Search", "TF-IDF", "Cogitator"]
showComments: true
ShowToc: true
cover:
  image: "/assets/tfidf-ocaml-cover.svg"
  alt: "TF-IDF in OCaml cover"
---

I built [Cogitator](https://github.com/M-Hassan-Raza/cogitator), a local code search engine in OCaml. It indexes code chunks using TF-IDF, ranks results by cosine similarity, and outputs them as RAG prompts for LLMs. The whole thing is about 500 lines of OCaml.

I didn't pick OCaml because it was the obvious choice. I picked it because I wanted to learn it. But the language ended up being genuinely good for this problem in ways I didn't expect.

## The Tokenization Pipeline

The core of any search engine is tokenization — turning raw text into searchable terms. In Cogitator, the pipeline is:

```
raw text → split punctuation → split camelCase → split snake_case → lowercase → stem → remove stopwords
```

In OCaml, this is a pipeline of pure functions composed with `|>`:

```ocaml
let tokenize text =
  text
  |> split_punctuation
  |> List.concat_map split_camel
  |> List.concat_map split_snake
  |> List.map String.lowercase_ascii
  |> List.filter (fun w -> String.length w > 1)
  |> List.map Stemmer.stem
  |> List.filter (fun w -> not (Stopwords.is_stopword w))
```

Each function takes a value, returns a value, no mutation. You can read the pipeline top-to-bottom and know exactly what happens. In Python, I would've written this as a series of list comprehensions or a loop with intermediate variables. It would work, but it wouldn't read as cleanly.

The `split_camel` function uses character-level pattern matching to detect transitions from lowercase to uppercase:

```ocaml
let split_camel s =
  let len = String.length s in
  if len <= 1 then [s]
  else
    let buf = Buffer.create 16 in
    Buffer.add_char buf s.[0];
    let rec go acc i =
      if i >= len then
        let word = Buffer.contents buf in
        if word <> "" then List.rev (word :: acc) else List.rev acc
      else
        let prev = s.[i - 1] in
        let curr = s.[i] in
        if prev >= 'a' && prev <= 'z' && curr >= 'A' && curr <= 'Z' then begin
          let word = Buffer.contents buf in
          Buffer.clear buf;
          Buffer.add_char buf curr;
          go (word :: acc) (i + 1)
        end else begin
          Buffer.add_char buf curr;
          go acc (i + 1)
        end
    in
    go [] 1
```

`"getUserName"` becomes `["get"; "User"; "Name"]`. The recursive `go` function with accumulator is idiomatic OCaml — it's a fold over characters, building the result list as it goes.

## TF-IDF: Maps All the Way Down

The TF-IDF computation is where OCaml's `Map` module shines. Term frequency is a fold over tokens into a `StringMap`:

```ocaml
let term_frequency tokens =
  let total = float_of_int (List.length tokens) in
  let counts =
    List.fold_left
      (fun acc word ->
        let n = match StringMap.find_opt word acc with
          | Some n -> n + 1
          | None -> 1
        in
        StringMap.add word n acc)
      StringMap.empty tokens
  in
  StringMap.map (fun count -> float_of_int count /. total) counts
```

Inverse document frequency follows the same shape — fold over the corpus, count documents containing each term, take the log:

```ocaml
let inverse_document_frequency corpus =
  let n_docs = float_of_int (List.length corpus) in
  let doc_counts =
    List.fold_left
      (fun acc tokens ->
        let unique = List.sort_uniq String.compare tokens in
        List.fold_left
          (fun acc word ->
            let n = match StringMap.find_opt word acc with
              | Some n -> n + 1
              | None -> 1
            in
            StringMap.add word n acc)
          acc unique)
      StringMap.empty corpus
  in
  StringMap.map (fun df -> log (n_docs /. float_of_int df)) doc_counts
```

Every intermediate value is immutable. The `StringMap.add` call returns a new map — the old one is untouched. In Python with dictionaries, you'd mutate in place and hope nobody else holds a reference. Here, immutability is the default and the compiler enforces it.

## Fuzzy Matching via Edit Distance

Search queries contain typos. Cogitator handles this with Levenshtein edit distance — if a query term isn't in the IDF vocabulary, it finds the closest match within edit distance 2:

```ocaml
let fuzzy_expand query_tokens idf =
  List.fold_left (fun acc qt ->
    if String.length qt < 4 then acc
    else if StringMap.mem qt idf then acc
    else
      let best = List.fold_left (fun (bw, bd) w ->
        let d = edit_distance qt w in
        if d < bd then (Some w, d) else (bw, bd))
        (None, 3) idf_words
      in
      match best with
      | (Some w, d) ->
        let weight = match d with
          | 1 -> 0.5
          | 2 -> 0.25
          | _ -> 0.0
        in
        if weight > 0.0 then StringMap.add w weight acc else acc
      | _ -> acc)
    StringMap.empty query_tokens
```

The `match` expression for distance-to-weight is cleaner than an if/else chain. Pattern matching is one of those features that, once you have it, makes every language without it feel clumsy.

## What OCaml Gave Me

**Exhaustive pattern matching caught real bugs.** The `file_kind` type is a variant:

```ocaml
type file_kind =
  | Code of string   (* language name *)
  | Markdown
  | Text
```

Every `match` on this type must handle all three cases. When I added `Markdown` as a third variant, the compiler flagged every function that didn't handle it. In Python, I'd have found those bugs in production.

**Composition replaced architecture.** There's no dependency injection, no strategy pattern, no abstract base classes. The tokenization pipeline is just function composition. The search is just `tokenize → vectorize → cosine similarity → sort`. Each piece is testable in isolation because there are no side effects to mock.

**The type system made refactoring fearless.** When I changed the `search_result` type from a tuple to a record, the compiler caught every usage that needed updating. I didn't need to grep for call sites or run the test suite to find breakage.

The codebase is small — about 500 lines of library code. But it handles tokenization, stemming, TF-IDF indexing, cosine similarity search, fuzzy matching, result merging, cache persistence, and a REPL. In Python, that same feature set would be significantly more code, and I'd have less confidence that it all fits together correctly.

OCaml isn't the right tool for everything. But for data transformation pipelines where correctness matters and the domain is well-defined, it's hard to beat.
