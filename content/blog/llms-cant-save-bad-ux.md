---
title: "LLMs Can't Save Bad UX"
date: 2026-04-08T10:00:00+05:00
lastmod: 2026-09-25T10:00:00+05:00
description: "When an AI feature flops, the model is rarely the problem. Three features I watched fail, what fixed them, and the questions I now ask before anyone writes a prompt."
aliases:
  - /blog/ai-features-users-want/
tags: ["AI", "Product", "UX", "LLM"]
categories: ["Product"]
ShowToc: true
cover:
  ascii: "post-bad-ux"
  alt: "LLMs and user experience"
---

Every team I've worked with has shipped at least one AI feature that nobody used. The post-mortem usually lands on "users don't want AI". In the cases I've seen up close, at Entropy Labs and with clients who came to us after a launch went quiet, that was the wrong conclusion. Users didn't want a slower version of the same problem.

The pattern goes like this. The product has a UX problem: search is bad, onboarding is long, reporting is manual. Someone adds an AI layer on top. The original problem is still there, now with latency and the occasional confident mistake. Users try it once, go back to their workaround, and the team decides AI was the mistake.

## Three features that failed for boring reasons

### The search chatbot that should have been a search box

A client had an internal knowledge base with truly bad search: keyword matching, no ranking, no tolerance for typos. People hated it, so they built a semantic search chatbot.

The chatbot understood questions well. Ask "how do we handle refunds for enterprise clients?" and it found the right document. But it took a few seconds to answer, it replied with a paragraph instead of a list, and when the paragraph was wrong there was nothing to browse instead. People couldn't scan results; they could only read a summary and hope.

What they needed was Meilisearch or Typesense: fuzzy matching and ranking, answers in tens of milliseconds, a list you can skim. It was cheaper to run, too, since the chatbot came with a monthly API bill that the original problem never deserved. The AI version was the more impressive build and the worse product.

### The onboarding assistant for a twelve-step setup

Another team had a twelve-step setup flow that most new users abandoned. Their fix was an assistant that walked people through the steps in conversation. It remembered where you left off and answered questions about each step. It was well built.

Completion went down.

The problem was never that people didn't understand step seven. The problem was that step seven existed. When the flow was cut to four steps, with sensible defaults filling in the rest, completion roughly doubled. The assistant was retired.

### The report builder that taught people not to trust it

This one was ours. We added a natural-language report builder: "revenue by product category for Q3, excluding returns". It demoed beautifully.

In real use, people generated a report, checked it against the numbers they already trusted, found a small discrepancy from rounding or an edge case in a filter, and stopped trusting the feature. Not that report, the feature. Finance people need exact numbers, and "almost right" is a failure state for them.

We replaced it with a guided form where AI does one small job: pre-selecting the filters you probably want, based on what you ran recently. Usage went from barely anyone to a solid share of people who build reports. The AI went from doing the whole thing to suggesting which buttons to press, and that's when people used it.

## Latency is a cost you pay on every click

Every model call costs time, usually somewhere between half a second and several seconds. People notice. Search and e-commerce teams have measured for years that even a couple of hundred milliseconds changes behavior, and LLM features routinely add whole seconds.

The way I think about it: an AI feature has to pay back its wait. Saving someone ten seconds of manual work in exchange for four seconds of waiting is a win. Saving two seconds in exchange for four is a regression that happens to use a model.

The easiest way to pay it back is to take the work out of the user's path entirely:

- a document is uploaded, entities are extracted in the background, and the tags are there when someone opens it
- data changes overnight, a summary is written before anyone asks, and it's on the dashboard in the morning
- a form opens already filled in from the person's history

If people are waiting for it, it had better be worth the wait.

## Almost right is worse than you think

Normal software is right or broken. A button works or it doesn't. AI features are right most of the time, wrong some of the time, and occasionally wrong with total confidence. The confident mistakes are what kill trust: a made-up number in a report, the wrong customer name in a drafted email.

Once people have to check everything a feature produces, it has added a step instead of saving one.

So every AI feature needs a way out: the pre-filled form can be edited, the drafted reply can be rewritten, the ranked results can be sorted another way. The suggestion is a suggestion. The moment it becomes a decision, like auto-send, auto-file or auto-approve, the accuracy bar goes way up, and you probably aren't there.

We learned that one directly. We ran an AI feature that auto-filed incoming documents into categories for about four months before turning it off. It was right most of the time. The misfiled ones included some that mattered, and people ended up checking its work more carefully than they would have done the filing themselves.

## Where AI has earned its place for us

The features that stuck all share one thing: they remove thinking without adding interaction.

- **Pre-filled fields.** No new UI, no chat, no "AI" badge. The form is mostly done when it opens. People didn't notice a feature; they noticed the product got less tedious.
- **Anomalies worth interrupting for.** "Mobile checkout conversion dropped sharply after yesterday's deploy" is useful because nobody had to ask. The trick is filtering out the expected changes (seasonality, promotions) so the alert is rare enough to read.
- **Transformation you can check.** Summaries, translations, format conversion. The input and output are clear, the person can verify the result at a glance, and a few seconds of waiting buys back half an hour of reading.

## What I ask before anyone writes a prompt

1. **What does the user do today without it?** If the answer is "click three buttons", the AI version has to beat three buttons.
2. **What happens when it's wrong?** "They fix it in two seconds" is fine. "Nobody notices until it's downstream" is not.
3. **Is the wait proportional to the value?** Four seconds for a summary of a long document, yes. Four seconds for a search that a keyword index answers instantly, no.
4. **Does it remove a step or add one?** If people have to review the output before acting, you've added one.
5. **Would plain good UX solve it?** A date picker beats a natural-language date parser. A fast search box beats a search chatbot.

And once it ships, judge it by behavior, not by what people say in interviews. Watch adoption for weeks, because curiosity isn't usage. Measure whether tasks get done faster, not whether people like the suggestions. The complaint "it always gets company names wrong" is worth more than a dozen "this is cool"s.

If the product's UX is broken, fix the UX first. AI on top of a good product can be great. AI on top of a bad one is an expensive way to make the problem easier to notice.
