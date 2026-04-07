---
title: "I Shipped a Race Condition That Double-Charged Customers (And Other War Stories)"
date: 2025-11-15T10:00:00+05:00
draft: false
tags: ["Production", "Django", "PostgreSQL", "Concurrency", "Python", "Debugging", "Backend Development"]
categories: ["Backend Development"]
showComments: true
cover:
  image: "/assets/war-stories.svg"
  alt: "Production War Stories"
  caption: "Every senior engineer has a 2am story. Here are mine."
  relative: false
ShowToc: true
---

<div style="text-align: justify;">

Nobody writes blog posts about the bugs they shipped. The internet is full of "how I built X" and suspiciously empty of "how I broke X and spent 14 hours pretending it wasn't my fault." Here are mine.

---

## <span style="color:#8ac7db">The Race Condition: Two Cashiers, One Item</span>

This one happened in [Polaris](/projects/polaris/), the ERP system I built for retail businesses. Real money, real transactions, real angry shop owners.

The setup: two cashiers at different terminals. Both scan the same product. Both hit "Complete Sale" within 200ms of each other. The inventory says there's one left.

What should happen: one sale succeeds, the other fails gracefully.

What actually happened: both sales completed. Inventory went to -1. The customer who got the phantom item got charged. The shop owner lost money on a product they didn't have.

### Why It Happened

I was using Django's default transaction behavior. `transaction.atomic()` wraps the block in a database transaction, sure. But two concurrent transactions can both read `quantity = 1`, both pass the `if quantity > 0` check, and both commit. Classic read-then-write race.

The fix I reached for first was `select_for_update()`:

```python
product = (
    Product.objects
    .select_for_update()  # Acquire row-level lock
    .get(id=product_id)
)
```

This works. One transaction acquires the lock, the other waits. But in a busy retail environment, "waits" means cashiers staring at a spinner during rush hour. The queuing created latency spikes that were almost as bad as the original bug.

### The Actual Fix

Dual-layer locking. Pessimistic locks with `nowait=True` at the database level, optimistic locking with version fields at the application level:

```python
# Layer 1: Fail fast at the DB level
product = (
    Product.objects
    .select_for_update(nowait=True)
    .get(id=product_id)
)
```

`nowait=True` is the key. Instead of queuing, the second transaction gets an immediate `DatabaseError`. The application catches it, waits a beat with exponential backoff, and retries. The cashier sees a sub-second delay instead of a 5-second hang.

```python
# Layer 2: Catch stale reads at the application level
class Product(models.Model):
    version = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        if self.pk:
            updated = Product.objects.filter(
                pk=self.pk,
                version=self.version
            ).update(version=self.version + 1, ...)
            if not updated:
                raise StaleDataError("Record modified by another user")
```

Layer 2 catches a different class of bug: the cashier who opens a product page, goes to lunch, comes back, and hits save on data that's been modified three times since.

### What I Learned

The bug cost the shop owner about PKR 15,000 before I caught it. Not catastrophic, but enough to earn a phone call I don't want to repeat. The lesson: `transaction.atomic()` is not a concurrency solution. It's a consistency solution. Two very different things.

---

## <span style="color:#FFB4A2">The Silent Chain: 8 Hours Debugging Nothing</span>

This one happened while building AI features with LangChain at Entropy Labs.

I had a chain that processed user queries through a RAG pipeline. It worked in testing. It worked in staging. In production, it returned empty strings. No error. No exception. No log entry. Just... nothing.

```python
result = await chain.ainvoke({"query": user_input})
# result = ""
# No error. No exception. Nothing.
```

I spent 8 hours on this. I checked the model configuration. I checked the API keys. I checked rate limits. I added logging at every step of the chain. The logs showed the chain executing perfectly—right up until the prompt template rendered an empty message list.

### The Cause

A malformed prompt template that, under specific input conditions, produced an empty message array. The LLM received nothing. The LLM returned nothing. LangChain passed the empty response through without complaint.

No validation. No warning. No "hey, you just sent an empty prompt to a model that charges per token." Just a silent empty string propagated through three layers of abstraction.

### The Fix

I stopped trusting the framework to validate my inputs:

```python
class ValidatedChain:
    def invoke(self, inputs: dict) -> str:
        messages = self.prompt.format_messages(**inputs)

        if not messages:
            raise ValueError(
                f"Empty message list from inputs: {list(inputs.keys())}"
            )

        if all(not m.content.strip() for m in messages):
            raise ValueError("All messages are empty after formatting")

        return self.chain.invoke(inputs)
```

Boring. Obvious. Would have saved me 8 hours.

### What I Learned

Abstractions that swallow errors are worse than no abstraction at all. A raw API call to Anthropic would have returned a 400 error on an empty prompt. LangChain's "helpful" passthrough behavior turned a 5-minute fix into a day-long investigation.

The best LangChain code I've written uses it sparingly—for the problems it solves well, not for everything.

---

## <span style="color:#8ac7db">The N+1 That Made Customers "Fume a Little"</span>

Back to Polaris. The refund API was slow. Not "hmm, that's a bit laggy" slow. "Customers are standing at the counter watching a loading spinner while a line forms behind them" slow.

```python
for item_data in refund_items_data:
    bill_item = BillItem.objects.get(id=item_data["bill_item_id"])
    product = bill_item.product  # Separate query each iteration
```

Classic N+1. Each refund item triggered two queries: one for the bill item, one for its related product. A 10-item refund meant 20+ queries. On a busy Friday evening with a loaded database, that meant seconds of latency per refund.

I'm going to be honest: I knew about N+1 queries. I'd read about them. I'd fixed them in other people's code. But when I wrote this code, I was in a rush, the loop was "just a few iterations," and I moved on.

### The Fix

```python
bill_items = (
    BillItem.objects
    .filter(id__in=[item["bill_item_id"] for item in refund_items_data])
    .select_related('product')
)
```

One query. Joins included. 70% reduction in query execution time. Customers stopped fuming.

### What I Learned

"I'll optimize later" is a debt with compound interest. The N+1 was invisible in development with 3 test products. In production with 5,000 products and a loaded database, it was the difference between a usable app and an angry phone call.

Also: `django-debug-toolbar` in development. Always. If I'd had it enabled from day one, I would have seen the query count on the first manual test.

---

## <span style="color:#FFB4A2">The Advisory Lock Revelation</span>

The most expensive lesson from Polaris wasn't a bug—it was an architectural realization.

Customer balances in Polaris are computed from a ledger. Every sale, payment, return, and adjustment creates an entry. The balance is the sum. Simple enough, until two operations on the same customer happen concurrently.

Row-level locks (`select_for_update`) work for single-row operations. But balance calculations touch multiple rows—you need to read all existing entries, compute the sum, and create a new entry with the correct running balance. If two transactions do this simultaneously, you get inconsistent balances.

The solution was PostgreSQL advisory locks:

```python
lock_id = hash(f"customer_balance_{customer_id}") & 0x7FFFFFFF

with connection.cursor() as cursor:
    cursor.execute("SELECT pg_advisory_lock(%s)", [lock_id])
```

Advisory locks are application-level locks managed by PostgreSQL but not tied to any row or table. They serialize operations per logical entity (in this case, per customer's balance) without blocking unrelated operations.

### Why This Was a Revelation

I'd been using PostgreSQL for years. I'd read the docs. I'd used `select_for_update`. But advisory locks solve a fundamentally different problem: coordinating operations that span multiple rows or even multiple tables. They're the database equivalent of an application-level mutex, but with the database managing the lifecycle.

After implementing advisory locks for balances, I started seeing the pattern everywhere. Any time you have a "read-compute-write" cycle across multiple records for a single logical entity, advisory locks are the answer.

### What I Learned

The tools you know shape the problems you can see. I spent weeks trying to solve a coordination problem with row-level locks because that's what I knew. Advisory locks were in the PostgreSQL docs the entire time.

---

## <span style="color:#8ac7db">The Django Signal Cascade</span>

Early Polaris used Django signals for everything. Stock change? Signal. Balance update? Signal. Report invalidation? Signal.

```python
@receiver(post_save, sender=Sale)
def update_inventory(sender, instance, **kwargs):
    product = instance.product
    product.stock -= instance.quantity
    product.save()  # This triggers another post_save...
```

The problem wasn't any single signal. It was the cascade. A sale triggered an inventory update, which triggered a stock-level check, which triggered a reorder alert, which triggered a supplier notification. Each `save()` in the chain fired more signals.

With high transaction volumes, this became a performance cliff. Bulk operations—importing 500 products, running end-of-day reconciliation—would trigger thousands of cascading signals.

### The Fix

Replaced the signal chain with explicit service calls and a recalculation flag pattern:

```python
class Product(models.Model):
    needs_recalculation = models.BooleanField(default=False)

# Bulk updates skip the cascade
Product.objects.filter(
    id__in=updated_ids
).update(needs_recalculation=True)

# Periodic task handles recalculation in batch
@periodic_task
def recalculate_flagged_products():
    products = Product.objects.filter(needs_recalculation=True)
    # Batch recalculation instead of per-item cascade
```

Bulk updates went from seconds to milliseconds. The signal chain was elegant in theory and a landmine in practice.

### What I Learned

Django signals are great for loose coupling between apps. They're terrible for core business logic that needs to be fast, predictable, and debuggable. When you can't `grep` for signal handlers and immediately understand the execution flow, you've lost more than you've gained.

---

## <span style="color:#FFB4A2">The Meta-Lesson</span>

Every one of these bugs has the same root cause: I knew the theory but didn't respect the gap between "works in development" and "works in production." Development has one user, clean data, and no concurrency. Production has all three at once.

The fixes aren't clever. `nowait=True`. Input validation. `select_related`. Advisory locks. Explicit service calls. These are boring solutions to expensive problems.

If there's one thing I'd tell past-me, it's this: the blog posts that would have actually helped me aren't the "How to Build X" posts. They're the "How X Broke and Why I Didn't See It Coming" posts. So here's mine.

</div>
