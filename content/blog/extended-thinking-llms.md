---
title: "Extended Thinking in LLMs: A Mental Model for Developers"
date: 2025-09-25T10:00:00+05:00
draft: false
tags: ["AI", "LLM", "Extended Thinking", "Claude", "o1", "Developer Tools", "Reasoning", "Prompt Engineering"]
categories: ["AI Development"]
showComments: true
cover:
  image: "/assets/extended-thinking.jpg"
  alt: "Extended Thinking LLMs"
  caption: "It's not just 'model thinks longer' - it's a different interaction model"
  relative: false
ShowToc: true
---

<div style="text-align: justify;">

Extended thinking isn't just "model thinks longer"—it's a fundamentally different interaction model. If you're prompting extended thinking models (Claude Opus, o1) the same way you prompt standard models, you're leaving most of the value on the table.

This post is a developer's mental model for working with these systems: when to use them, how to prompt them, and what trade-offs to expect.

---

## <span style="color:#8ac7db">How Extended Thinking Actually Works</span>

Standard LLMs generate tokens one at a time, each token conditioned on everything before it. The model "thinks" only as fast as it speaks. Ask it to solve a complex problem, and it often commits to an approach in the first few tokens, then rationalizes that approach even if it's wrong.

Extended thinking models add an intermediate step: they generate a reasoning trace before producing the final answer. Think of it as the model writing notes in the margin before responding.

This matters because:

**1. More tokens = more "working memory."** The reasoning trace gives the model space to consider alternatives, check its work, and revise approaches. It's like the difference between solving math problems in your head vs. on scratch paper.

**2. The reasoning trace isn't shown to you.** You see the polished output, not the exploratory thinking. This is both a feature (cleaner responses) and a limitation (harder to debug when it goes wrong).

**3. The model can "backtrack" conceptually.** Standard models can't unsay tokens. Extended thinking can reason through an approach, decide it's wrong, and try another—all before responding.

### Claude Opus vs. o1: Different approaches

Both are "thinking models," but they work differently:

**Claude Opus 4.5:**
- Extended thinking via longer internal reasoning
- Configurable thinking budget
- Reasoning partially visible via API (for debugging)
- Optimized for helpfulness and safety alongside reasoning

**OpenAI o1:**
- Chain-of-thought at massive scale
- Hidden reasoning trace (not exposed via API)
- Optimized for benchmark performance
- Tends toward longer, more verbose responses

In practice, I find Opus better for interactive development work (code review, debugging) and o1 better for competition-style problems (math, algorithms). Your mileage will vary.

---

## <span style="color:#FFB4A2">When Extended Thinking Helps</span>

Not every task benefits from extended thinking. Here's a rough heuristic:

### Great for:

**Complex code generation.** Multi-file changes, refactoring, implementing algorithms with edge cases. The model can reason about interactions between components.

**Architecture decisions.** "Here's our system. What are the tradeoffs of adding a cache here vs. there?" Extended thinking models consider more factors before committing.

**Bug diagnosis.** Given error messages, logs, and code, the model can reason through possible causes rather than pattern-matching to the most common fix.

**Multi-step reasoning.** Any task where the answer depends on intermediate conclusions: tax calculations, game theory, proof verification.

### Not worth it for:

**Simple lookups.** "What's the syntax for a Python list comprehension?" Fast models give the same answer instantly.

**Latency-sensitive applications.** Extended thinking takes 10-60 seconds. If your UX requires sub-second responses, it won't work.

**High-volume, low-complexity tasks.** Summarizing 10,000 documents? Use the cheapest, fastest model that works. Extended thinking is expensive overkill.

**Tasks requiring current information.** Thinking longer doesn't give the model access to information it doesn't have. Use retrieval augmentation instead.

---

## <span style="color:#8ac7db">Prompting for Extended Thinking</span>

Here's the counterintuitive part: **stop giving step-by-step instructions.**

Standard prompting advice says to break down tasks, provide explicit steps, guide the model through your reasoning. This backfires with extended thinking models.

### Why detailed instructions hurt

When you say "First do X, then do Y, then do Z," you're constraining the model's reasoning. You've decided the approach before it can think. If your approach is suboptimal, the model will faithfully execute your suboptimal plan.

Extended thinking models are *better at figuring out approaches than you are* (for many tasks). Let them.

### What to do instead

**Provide context, not instructions:**

```
# Bad
"First, read through the codebase structure. Then, identify files
that handle authentication. Next, look for potential security
vulnerabilities. Finally, provide recommendations."

# Good
"Here's our authentication system [files]. We're concerned about
security. Analyze this thoroughly and identify any vulnerabilities
or improvements."
```

The second version lets the model decide how to approach the analysis. It might find approaches you wouldn't have specified.

**State the goal, not the process:**

```
# Bad
"Use the following algorithm: first sort by date, then group by
category, then calculate averages..."

# Good
"I need to understand spending patterns in this transaction data.
What insights can you find?"
```

**Trust the model's reasoning:**

```
# Bad
"Think step by step. First consider X. Then consider Y.
Show your work."

# Good
"This is a complex problem. Take your time reasoning through it."
```

The "think step by step" prompt was designed for models that didn't think before answering. Extended thinking models already do this internally. You're just adding noise.

---

## <span style="color:#FFB4A2">Real Prompt Comparison</span>

Let me show a concrete example. Task: review a Django view for potential issues.

### Standard model prompt (optimized for GPT-4):

```
Review this Django view for issues. Check for:
1. N+1 queries
2. Missing error handling
3. Security vulnerabilities
4. Performance problems
5. Code style issues

For each issue found, explain the problem and provide a fix.

[code]
```

This works okay with GPT-4. You've told it what to look for.

### Extended thinking prompt (optimized for Opus):

```
Here's a Django view from our production system. This view handles
user dashboard data and is called ~5000 times/day. We've had
intermittent timeouts but haven't identified the cause.

Please thoroughly analyze this code.

[code]
```

Notice what changed:
- Removed the checklist (let the model decide what to look for)
- Added context (production, call volume, symptom)
- Broader request (thoroughly analyze vs. check for X)

The extended thinking model will likely check everything on the first list *plus* things you didn't think to ask about. And it'll prioritize based on the context (intermittent timeouts → probably an intermittent performance issue, not a style problem).

---

## <span style="color:#8ac7db">Cost-Performance Trade-offs</span>

Extended thinking is expensive. A complex analysis might use 10-50K tokens of thinking, plus input/output tokens. That's $0.50-2.00 per query at current Opus pricing.

### When to pay for thinking:

- High-stakes decisions (architecture, security audits)
- Complex debugging that would take you hours
- Problems you've failed to solve with faster models

### When to use fast models:

- Routine code generation
- Simple Q&A
- High-volume batch processing

### Hybrid approach:

Use fast models for initial attempts. Escalate to extended thinking when:
- Fast model gives wrong answer
- Fast model's confidence is low
- Task is in extended thinking's sweet spot

At Entropy Labs, we route queries based on estimated complexity. Simple queries go to Haiku (fast, cheap). Complex queries with keywords like "debug," "analyze," or "architecture" go to Opus.

---

## <span style="color:#FFB4A2">Practical Integration Patterns</span>

### Fallback chains

```python
async def analyze_code(code: str, context: str) -> str:
    # Try fast model first
    fast_response = await sonnet.analyze(code, context)

    if fast_response.confidence < 0.7 or "uncertain" in fast_response:
        # Escalate to extended thinking
        return await opus.analyze(code, context, extended_thinking=True)

    return fast_response
```

### Streaming extended thinking

Extended thinking can take 30-60 seconds. Don't leave users staring at a spinner:

```python
async def stream_analysis(query: str):
    # Send status updates while thinking
    yield {"status": "analyzing", "stage": "reading code"}

    async for event in opus.stream(query):
        if event.type == "thinking":
            yield {"status": "analyzing", "stage": "reasoning"}
        elif event.type == "response":
            yield {"status": "complete", "result": event.content}
```

### Managing user expectations

Extended thinking responses are worth waiting for—but users don't know that. Set expectations:

```
"This is a complex analysis. I'll take 30-60 seconds to
think through this carefully. For quick questions, ask
me directly instead."
```

---

## <span style="color:#8ac7db">The Bottom Line</span>

Extended thinking is the biggest practical advance in LLMs since GPT-4. But it requires a mindset shift:

1. **Stop micromanaging.** Provide context, not instructions.
2. **Use it selectively.** Extended thinking for complex problems, fast models for everything else.
3. **Budget for latency.** 30-60 seconds is the new normal for hard problems.
4. **Trust but verify.** Extended thinking is more reliable, not infallible.

The models that think before they speak are finally here. Learn to let them think.

</div>
