---
title: "LLMs Can't Save Bad UX"
date: 2026-03-18T10:00:00+05:00
draft: false
tags: ["AI", "UX", "Product", "LLM", "CPO", "Startup", "Product Development"]
categories: ["Product Development"]
showComments: true
cover:
  image: "/assets/llm-ux.svg"
  alt: "LLMs and User Experience"
  caption: "You can't GPT-wrapper your way out of a broken product"
  relative: false
ShowToc: true
---

<div style="text-align: justify;">

I wrote about [AI features users actually want](/blog/ai-features-users-want/) a while back. The TLDR was: stop building chatbots, start building smart defaults. That post got shared, people agreed, and then most of them went back to building chatbots.

This is the sequel. The one about what happens when AI features ship and nobody uses them. When the LLM is working correctly and the product is still failing. When the problem was never the model.

---

## <span style="color:#8ac7db">The Pattern I Keep Seeing</span>

At Entropy Labs, I've watched this play out with our own products and with clients who come to us after their AI features underperform:

1. Product has a UX problem. Search is bad. Onboarding is confusing. Reporting is manual and tedious.
2. Team adds an AI layer on top. "Ask our AI assistant to find what you need." "Let AI guide you through setup." "Generate reports with natural language."
3. The UX problem is still there, now with an additional layer of latency and unpredictability.
4. Users try the AI feature once, get a mediocre result, and go back to manually working around the original UX problem.
5. Team concludes "users don't want AI" when the real conclusion is "users don't want a slower version of the same problem."

The AI didn't fail. The product thinking failed. The LLM did exactly what it was told—it just didn't matter because the problem was upstream.

---

## <span style="color:#FFB4A2">Three Real Examples</span>

### The Search That Should Have Just Worked

A client had an internal knowledge base with terrible search. Keyword matching, no ranking, no typo tolerance. Users hated it. The solution: an AI-powered "semantic search" chatbot.

The chatbot was genuinely good at understanding queries. You could ask "how do we handle refunds for enterprise clients?" and it would find the right document. But:

- It took 3-4 seconds to respond (embedding → vector search → LLM synthesis)
- It returned a conversational paragraph instead of a list of documents
- Users couldn't scan the results—they had to read a generated summary
- When the summary was wrong, users had no way to browse alternatives

What they actually needed: Typesense or Meilisearch. Sub-50ms fuzzy search with typo tolerance and relevance ranking. No AI, no latency, no generated text. Just a search bar that works.

**Cost of the AI approach:** $2,000/month in API calls + 3-4s latency per query.
**Cost of the actual fix:** Self-hosted Meilisearch, $0/month, 30ms per query.

The AI solution was technically impressive and practically worse.

### The Onboarding Wizard That Nobody Asked

Another client had a complex SaaS product with a 12-step setup flow. Completion rate was 34%. Their fix: an AI assistant that walks users through setup via conversation.

The AI assistant understood context. It remembered where you left off. It could answer questions about each step. It was, by any technical measure, a well-built feature.

Completion rate went to 31%. Down.

Why? The problem was never "users don't understand the steps." The problem was "there are 12 steps." Users didn't need an AI to explain step 7—they needed step 7 to not exist.

After killing the AI assistant and collapsing the setup flow from 12 steps to 4 (with smart defaults filling the rest), completion rate went to 78%. The fix was UX surgery, not AI wallpaper.

### The Report Generator That Generated Distrust

This one is from our own product. We added a natural language report builder: "Show me revenue by product category for Q3, excluding returns." Impressive in demos.

In production, users would generate a report, cross-reference it with the actual numbers in the data tables, find a 2-3% discrepancy (rounding, filter edge cases), and lose trust in the entire feature. Once a user catches an AI-generated report being slightly wrong, they stop trusting it entirely—even when it's right.

The issue: financial users need exact numbers. "Approximately correct" isn't a valid state for revenue reporting. We replaced the natural language builder with a guided form that uses AI for one thing: pre-selecting likely filters based on the user's recent activity.

The AI went from "do the whole thing" to "suggest which buttons to click." Usage went from 8% to 41%.

---

## <span style="color:#8ac7db">The Latency Tax Nobody Budgets For</span>

Every AI feature has a latency cost. API calls take 500ms-5s depending on the model and prompt complexity. Users feel this.

Google's research says a 200ms delay in search results reduces engagement. Amazon found every 100ms of latency costs 1% of sales. These numbers are about *milliseconds*—and we're adding *seconds* of latency and calling it an improvement.

The mental model should be: **AI latency is UX debt.** Every second of LLM processing time needs to be paid back by a proportional improvement in the user's outcome. If the AI saves them 10 seconds of manual work but adds 4 seconds of waiting, the net gain is 6 seconds. If the AI saves 2 seconds but adds 4 seconds of waiting, you've made the product worse.

Most AI features I evaluate don't pass this test. The latency is real, measurable, and felt by every user on every interaction. The benefit is theoretical, variable, and felt by some users some of the time.

### When Latency Is Acceptable

Background processing. If the AI does its work before the user asks for the result, there's no perceived latency:

- Document uploaded → AI extracts entities in the background → user opens document and entities are already tagged
- Data changes → AI generates summary overnight → user opens dashboard and insights are waiting
- Form opened → AI pre-fills fields based on history → user sees populated form instantly

The pattern: **move AI processing out of the user's critical path.** If they're waiting for it, it better be worth the wait.

---

## <span style="color:#FFB4A2">The Accuracy Cliff</span>

Traditional software is either correct or broken. A button works or it doesn't. A calculation is right or wrong.

AI features exist in a probabilistic middle ground. They're right 85% of the time, wrong 10% of the time, and confidently wrong 5% of the time. Users can tolerate the 10%. The 5% is what kills trust.

When an AI feature confidently presents wrong information—a hallucinated number in a report, an incorrect customer name in a generated email, a wrong date in a summary—the user has to decide: do I trust this feature, or do I verify everything it produces?

If they're verifying everything, you haven't saved them time. You've added a step.

### The Escape Hatch Principle

Every AI feature needs an escape hatch: a way for the user to fall back to manual control without friction. This isn't a failure mode—it's the design.

- AI pre-fills a form → user can edit every field
- AI suggests a response → user can rewrite it
- AI ranks search results → user can switch to chronological or alphabetical

The AI is a suggestion, not a decision. The moment it becomes a decision (auto-send, auto-file, auto-approve), you need 99%+ accuracy. And you probably don't have it.

We killed an AI feature at Entropy Labs after 4 months because it auto-categorized incoming documents. 92% accuracy sounds good until you realize 8% of documents are misfiled, some of them important. Users spent more time checking the AI's work than they would have spent categorizing manually.

---

## <span style="color:#8ac7db">When AI Actually Fixes UX</span>

I'm not anti-AI. I build AI systems for a living. But the AI features that work share a pattern: **they reduce cognitive load without adding interaction complexity.**

### Smart Defaults

The highest-ROI AI feature is almost always pre-populated fields. No new UI. No chatbot. No "AI-powered" badge. Just a form that's already mostly filled in when you open it.

At Entropy Labs, AI-driven field pre-population reduced form completion time by 40%. Users didn't know AI was involved. They just thought the product got smarter. That's the right user experience for AI.

### Anomaly Surfacing

Don't make users ask for insights. Surface them proactively. "Revenue dropped 18% in mobile checkout after deploy #1234" is useful because the user didn't have to ask. The AI found the pattern, correlated it with a likely cause, and presented it before anyone noticed.

This works because the AI is doing work the user couldn't easily do (correlating metrics across systems) rather than work the user could do faster without AI (clicking a date picker).

### Content Transformation

Summarization, translation, format conversion—tasks where the input and output are clearly defined and the user can immediately verify the result. "Summarize this 50-page document" is a legitimate AI use case because:

- The user can scan the summary and check it against their knowledge
- A 90% accurate summary of a 50-page document is still more useful than reading 50 pages
- The latency (a few seconds) is proportional to the value (saving 30+ minutes of reading)

The latency-to-value ratio passes the test.

---

## <span style="color:#FFB4A2">The Decision Framework</span>

Before adding an AI feature, ask:

**1. What is the user doing right now without AI?**
If the answer is "nothing—this is a new capability," AI might be the right tool. If the answer is "clicking three buttons," you need to prove AI is faster than three buttons.

**2. What happens when the AI is wrong?**
If the answer is "the user corrects it in 2 seconds," acceptable. If the answer is "the user doesn't notice until the data is downstream," dangerous.

**3. Is the latency proportional to the value?**
4 seconds of latency for 30 minutes of saved reading? Yes. 4 seconds of latency for a search result that keyword search returns in 50ms? No.

**4. Does this eliminate a step or add a step?**
If the user now has to review AI output before acting, you've added a step. The feature needs to save more time than the review costs.

**5. Would better traditional UX solve the same problem?**
Honest answer. Not "could AI solve this?" but "is AI the *best* way to solve this?" A date picker beats a natural language date parser. A type-ahead search beats a semantic search chatbot. Boring solutions that work beat impressive solutions that don't.

---

## <span style="color:#8ac7db">The Uncomfortable Truth</span>

Most failed AI features aren't failed AI. They're failed product thinking wearing an AI costume.

The search was bad before the chatbot, and the chatbot didn't fix the search—it added a natural language layer on top of bad search. The onboarding was too long before the AI assistant, and the AI assistant didn't shorten the onboarding—it narrated the same 12 steps with more words. The reports were confusing before the generator, and the generator didn't make them clearer—it made them probabilistically wrong.

If your product's UX is broken, fix the UX. Then, once the foundation is solid, look at where AI can reduce the cognitive work that users still have to do.

The order matters. AI on top of good UX is powerful. AI on top of bad UX is an expensive way to make the problem worse.

</div>
