# De-slop guide for mhassan.dev writing

Voice target: a dry, wry practitioner explaining something to a peer over chat. Plain sentences, specific nouns, concrete numbers where they exist. The site's 404 page, the FYP guide and the GitHub bio are the reference voice. It should read like a person who was there, not like a summary of a person who was there.

## Patterns to remove (these are the tells)

1. **Contrast flips.** "X, not Y." "It's not X, it's Y." "This isn't about A. It's about B." "The model is chosen per request, not per agent." "X instead of Y" / "rather than" used as a reflex. Say the positive claim. Keep a contrast only when the contrast itself is the information (e.g. "retry timeouts; don't retry validation errors"), and even then, at most once or twice per post.
2. **"The easy part / the hard part" setups.** "Writing the agent turned out to be the easy part. The hard part was..." "The problem wasn't X. It was Y." Just state the problem.
3. **Dramatic short fragments as paragraph closers.** "That didn't last." "It worked." "Then it broke." "Not anymore." "Every time." Fold them into the previous sentence or delete.
4. **Reflexive triads and counted reveals.** Lists of exactly three adjectives or clauses; "It paid off three ways:", "Two details made it work.", "Three things changed." Use the real number of items, and don't announce the count.
5. **Colon reveals.** "The fix: ..." "The result: ..." "The lesson: ..." "What worked was ..." Write a normal sentence.
6. **Aphoristic closers that restate the paragraph.** "That's the whole trick." "The shape is the useful part." "And that made all the difference." "Boring wins." If the last sentence of a paragraph just restates the paragraph, cut it.
7. **Maxim headings.** "Many small agents beat one big one", "Boring is a feature", "Choose X, not Y". Prefer headings that name the thing being discussed ("Splitting the general agent", "Retries"). Don't make every heading a lesson.
8. **Fake-surprise and reader-flattery phrases.** "turns out", "it turns out", "more than I expected", "faster than you'd think", "you'd be surprised", "the real problem", "the real question", "here's what", "the thing is", "in practice" (as filler), "worth noting", "it's worth", "importantly", "crucially", "notably".
9. **Symmetric slogan pairs.** "Fewer X, less Y." "Same input, same output." "Small PRs, fast reviews." Unless it's a literal quote of a rule.
10. **Rhetorical Q&A.** "Why? Because..." "The result?" "So what changed?" Just say it.
11. **Intensifier and filler words.** genuinely, honestly, truly, really, quietly, simply, just (as filler), exactly, entirely, single ("the single feature that"), actually (max one per post), incredibly, deeply, fundamentally.
12. **House vocabulary that marks AI prose.** load-bearing, footgun (once is ok), surface (as a verb), lean on, leverage, robust, crisp, sharp, clean (as praise, overused), shape (as abstract noun: "the shape of the problem"), primitive, seam, nuance, landscape, ecosystem, pragmatic, unglamorous, boring (as praise), mental model, first-class, at scale, under the hood, battle-tested, north star, double down, sweet spot, the hard way, paid off, bit us, earned its keep.
13. **Bold lead-in bullets** ("1. **Build the middleware first.** We bolted...") and boilerplate closing sections ("What I'd do differently", "Takeaways", "Lessons learned", "Wrapping up"). A closing section is fine if it says something new; give it a specific heading and write it as prose or plain bullets.
14. **Generic openers.** "Most engineering blogs are about...", "Everyone talks about...", "If you've ever...". Open with the specific situation.
15. **Over-tidy paragraph rhythm.** Setup sentence, punchline sentence, moral sentence, repeated every paragraph. Vary it. Some paragraphs can be one long sentence; some can end mid-thought without a moral.
16. **Em dashes**: max 3 per post (lint enforces). Prefer commas, full stops, parentheses.
17. **Anthropomorphized evidence.** "The logs told the story." "The numbers spoke for themselves." Say what the logs showed.
18. **Hedge stacks and disclaimers.** "I've left out X because Y, but Z is the useful part." Keep the disclosure, drop the justification flourish.

## What to keep

- Every fact, number, name, link, code block, table, image, MDX component and frontmatter field. Do not invent new facts, numbers or anecdotes. Do not delete substantive technical content.
- The author's own jokes and asides when they sound like a person (self-deprecation is fine).
- Overall structure and length. A rewrite should come out the same length or shorter (aim for 0-15% shorter). Do not pad.
- British/American spelling as already used in the file.
- Never dismiss formal education (author values their CS degree).
- Off-limits: client names, money figures, internal architecture specifics of Obelisk/October (prompts, routing rules, scoring weights). If a post already contains such things, flag it, don't expand it.

## Don't over-correct

Removing every contrast and every short sentence produces flat, monotone prose, which is its own tell. The goal is writing that a specific human would produce. Short sentences are fine when they carry information. One good contrast per post is fine. Read the paragraph out loud in your head: if it sounds like a LinkedIn post or a keynote, rewrite it; if it sounds like someone explaining to a colleague, leave it.

## Process per file

1. Read the whole post first.
2. Edit paragraph by paragraph. Prefer surgical rewrites of offending sentences over rewriting whole sections, unless a section is slop throughout.
3. Bump `updatedAt` in frontmatter when the edit is substantive. Leave `publishedAt` alone. If `title`/`description` contain slop patterns, fix them too.
4. Run `./scripts/lint-copy.sh <file>` from the repo root and fix anything it flags. The linter catches the mechanical patterns; the rest needs reading.
