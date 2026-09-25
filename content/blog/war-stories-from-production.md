---
title: "I Shipped a Race Condition That Oversold Stock (And Other War Stories)"
date: 2026-04-08T10:00:00+05:00
lastmod: 2026-09-25T10:00:00+05:00
description: "Two cashiers selling the last item, a chain that returned nothing, and a lock that only worked when both requests hit the same process. Bugs I shipped, and the unexciting fixes that held."
tags: ["Production", "Django", "PostgreSQL", "Concurrency", "Polaris"]
categories: ["Backend"]
ShowToc: true
cover:
  ascii: "post-war-stories"
  alt: "Production war stories"
---

Most engineering blogs are about things that worked. This one is about things I broke, mostly in [Polaris](/projects/polaris/), the retail system I built for shops that bill all day, and one in an AI pipeline at Entropy Labs. These happened between 2024 and 2026.

## Two cashiers, one item

Two cashiers at different counters scan the same product. The shop has one left. Both press "Complete sale" within a fraction of a second of each other.

What should happen: one sale goes through, the other gets told the item is gone.

What happened: both went through, and stock went to -1. The shop had sold something it didn't have, and someone had to explain that to a customer.

The code wrapped the sale in `transaction.atomic()`, which I had quietly been treating as "safe". It isn't, for this. Both transactions read `quantity = 1`, both passed the `quantity > 0` check, and both committed. Atomic means all-or-nothing, not one-at-a-time.

The textbook fix is a row lock:

```python
product = Product.objects.select_for_update().get(id=product_id)
```

That's correct, and at rush hour it meant cashiers staring at a spinner while one sale waited for another. So the lock became `select_for_update(nowait=True)`: the second transaction fails immediately instead of queueing, the app retries it with a short backoff, and the cashier sees a blip instead of a hang.

A separate version check catches a slower cousin of the same bug: someone opens a product, goes to lunch, comes back and saves over three edits that happened in the meantime.

```python
updated = Product.objects.filter(pk=product.pk, version=product.version).update(
    stock=new_stock,
    version=F("version") + 1,
)
if not updated:
    raise StaleDataError("Someone else changed this product. Reload and try again.")
```

The lesson I keep relearning: `transaction.atomic()` gives you consistency. It doesn't give you isolation from the other cashier.

## A chain that returned nothing, politely

At Entropy Labs I had a LangChain retrieval chain that worked in tests and in staging, and in production returned an empty string. No exception, no error, no log line. Just a polite nothing.

I checked the model config, the keys and the rate limits, then added logging to every step. Everything ran. The problem was upstream of all of it: under certain inputs the prompt template rendered an empty message list. The model received nothing, replied with nothing, and the chain passed that along as a successful result.

The fix was a boring guard in front of the call:

```python
messages = prompt.format_messages(**inputs)
if not messages or all(not m.content.strip() for m in messages):
    raise ValueError(f"Prompt rendered empty for inputs: {sorted(inputs)}")
```

A direct API call would have failed loudly on an empty prompt. The framework's helpfulness turned a five-minute bug into a long afternoon. I still use LangChain, but I validate what goes into it and what comes out, and I don't assume silence means success. More on that in [LangChain in production](/blog/langchain-production/).

## A lock that only worked on one process

Customer balances in Polaris come from a ledger: every sale, payment and return is an entry, and the balance is derived from them. Two operations on the same customer at once can each read the entries, compute a balance and write a new one, and you end up with a balance that matches neither.

Row locks don't help much when the operation reads many rows, so the ledger code took a PostgreSQL advisory lock per customer: a named lock that isn't tied to any row, held while the balance work runs. That part was right. The key was not:

```python
lock_id = abs(hash(f"customer_{customer_id}")) % 2147483647
cursor.execute("SELECT pg_advisory_lock(%s)", [lock_id])
```

Python salts `hash()` for strings differently in every process. Gunicorn runs several. So two requests for the same customer, landing on different workers, computed different lock IDs and happily ran side by side. The lock only serialized requests that happened to share a process.

I found it in May 2026 while hardening the refund paths, which is an embarrassingly long time for that line to have lived. The replacement uses PostgreSQL's two-integer form with a fixed namespace, and takes the transaction-scoped variant so the lock can't outlive the transaction:

```python
class AdvisoryLockNamespace(IntEnum):
    LEDGER_CUSTOMER = 10_001
    LEDGER_SUPPLIER = 10_002


cursor.execute(
    "SELECT pg_advisory_xact_lock(%s, %s)",
    [AdvisoryLockNamespace.LEDGER_CUSTOMER, customer_id],
)
```

It came with a test that computes the key under different `PYTHONHASHSEED` values and fails if they disagree. That test looks silly until you remember it would have caught this on day one.

## What the three have in common

Each bug lived in the gap between one user on my laptop and many users in a shop. Development has one process, one cashier and clean data. Production has several of each, at the same time, all the time.

None of the fixes are clever: fail fast instead of queueing, check the prompt before sending it, use a key that means the same thing everywhere. The earlier and smaller mistakes, like refunds that queried once per line item, are in the [Polaris performance log](/blog/optimizing-django-performance/).
