---
title: "Every Abstraction I Regret"
date: 2026-02-20T10:00:00+05:00
description: "A short list of abstractions I added too early, why they got worse over time, and the heuristics I use now to avoid repeating it."
draft: false
tags: ["Software Design", "Architecture", "Python", "Django", "LangChain", "Refactoring", "Backend Development"]
categories: ["Software Design"]
showComments: true
cover:
  ascii: "craft"
  alt: "Abstractions and Regrets"
  caption: "A love letter to simplicity from someone who learned the hard way"
ShowToc: true
---

The best code I ever deleted was a utility function called `format_response`. It accepted a response object, a format string, a fallback value, an optional transformer function, and a boolean for whether to strip whitespace. It was used in exactly one place.

I wrote it because I thought I'd need it again. I didn't. It sat in `utils.py` for eight months, collecting type: ignore comments and confusing every developer who opened the file.

This is a post about the abstractions I built too early, the patterns I reached for reflexively, and the DRY violations that would have been better left wet.

---

## The Generic Service Layer That Served Nobody

Early in Polaris, I built a "generic" service layer. The idea was elegant: every model gets a service class with standard CRUD operations, validation hooks, and permission checks. Write it once, inherit everywhere.

```python
class BaseService:
    model = None
    serializer = None

    def create(self, data, **kwargs):
        self._validate(data)
        self._check_permissions(kwargs.get('user'))
        instance = self.model.objects.create(**data)
        self._post_create(instance)
        return instance

    def _validate(self, data):
        pass  # Override in subclass

    def _check_permissions(self, user):
        pass  # Override in subclass

    def _post_create(self, instance):
        pass  # Override in subclass
```

Every subclass overrode every method. `ProductService._validate` had nothing in common with `CustomerService._validate`. The "shared" base class was just an empty method contract that added indirection without reducing duplication.

Worse: when I needed behavior that didn't fit the create/read/update/delete pattern—like Polaris's FIFO inventory consumption or double-entry ledger operations—the service layer fought me. The abstraction assumed all operations are CRUD. Financial operations aren't.

### What Replaced It

Individual service classes with no shared base. `LedgerService` has `credit_customer` and `reverse`. `InventoryService` has `consume_inventory` and `receive_batch`. They share nothing because they do nothing in common.

The code is "less clean" by DRY standards. It's dramatically easier to understand and modify.

---

## LangChain's Memory vs. Just Using Redis

LangChain offers memory abstractions: `ConversationBufferMemory`, `ConversationSummaryMemory`, `ConversationEntityMemory`. They look elegant in tutorials. In production, they're a footgun.

Problems I hit at Entropy Labs:

- **Memory is in-process by default.** Restart your server? All conversation history is gone.
- **No TTL.** Chat histories grow unbounded. One power user with a 200-message conversation is now consuming meaningful memory.
- **The memory object isn't thread-safe.** Concurrent requests to the same conversation? Corruption.
- **Serialization is fragile.** Switching model providers breaks deserialization because message formats differ.

The fix was embarrassingly simple:

```python
import redis

r = redis.Redis()

def get_history(session_id: str, max_messages: int = 50) -> list[dict]:
    raw = r.lrange(f"chat:{session_id}", -max_messages, -1)
    return [json.loads(m) for m in raw]

def add_message(session_id: str, role: str, content: str):
    r.rpush(f"chat:{session_id}", json.dumps({
        "role": role, "content": content
    }))
    r.expire(f"chat:{session_id}", 86400)  # 24h TTL
```

Fifteen lines. Survives restarts. Has TTL. Is thread-safe. Serializes predictably.

I spent a week debugging LangChain memory issues before writing this. The abstraction didn't save me time—it cost me time, because the failure modes were hidden behind three layers of class inheritance.

### The Principle

If you can explain your solution in one sentence, you probably don't need an abstraction layer. "Store messages in a Redis list with a TTL" is one sentence. `ConversationSummaryBufferMemory(llm=llm, max_token_limit=2000, return_messages=True)` is a configuration surface area with hidden semantics.

---

## Django Signals for Everything

I covered [the performance cascade](/blog/war-stories-from-production/#the-django-signal-cascade) in another post, but the performance problem was actually the second-worst thing about my signal overuse. The worst was debuggability.

At one point, Polaris had 23 signal handlers across 8 files. Creating a sale triggered:

1. `post_save` on `Sale` → update inventory
2. `post_save` on `Product` (from #1) → recalculate stock alerts
3. `post_save` on `StockAlert` (from #2) → notify supplier
4. `post_save` on `Sale` (again) → update customer balance
5. Custom signal `balance_changed` → invalidate cached reports

Good luck tracing a bug through that. There's no call stack. There's no explicit invocation. `grep` finds the handler, but not what triggers it, because signals are implicit coupling disguised as decoupling.

### What Replaced It

Explicit function calls.

```python
class SaleService:
    def complete_sale(self, sale):
        with transaction.atomic():
            self._deduct_inventory(sale)
            self._update_customer_balance(sale)
            self._invalidate_reports(sale.customer_id)
```

This is "worse" by separation-of-concerns standards. `SaleService` now knows about inventory and reporting. But every developer who reads `complete_sale` can trace the entire execution path without leaving the function. That's worth more than architectural purity.

### When Signals Are Actually Good

Cross-app boundaries where loose coupling matters. Your `billing` app doesn't need to know about your `analytics` app. A signal that fires on "payment completed" is fine when the handler is in a different bounded context.

But using signals within a single app's core business logic? That's abstractions for the sake of architecture diagrams, not for the sake of understanding code.

---

## The "Reusable" Component Library

In a frontend project, I built a component library before I had components to put in it. A `BaseCard` with 12 props. A `BaseButton` with configurable size, variant, icon position, loading state, and disabled tooltip.

Usage of `BaseCard` across the entire project: 3 places, each with completely different layouts that made the "base" props irrelevant. Two of the three instances passed so many overrides that the component was essentially a `<div>` with extra steps.

The button was worse. I added a `tooltipPosition` prop because one button needed a left-aligned tooltip. Now every button in the system carries tooltip positioning logic it doesn't use. The component API grew to accommodate every edge case, which meant every consumer had to understand the entire API surface even when they just needed a button.

### What I Do Now

I start with the raw HTML elements. When I have three genuinely similar components that share non-trivial logic, I extract the shared part. Not before.

```vue
<!-- Three similar buttons? Copy-paste is fine until it isn't. -->
<button class="btn-primary" @click="save">Save</button>
<button class="btn-primary" @click="submit">Submit</button>
<button class="btn-primary" :disabled="loading" @click="confirm">
  {{ loading ? 'Confirming...' : 'Confirm' }}
</button>
```

The third button has loading state. That's one button. Not a component library.

---

## The Config-Driven Architecture

At one point, I tried to make Polaris "configurable" by externalizing business rules into configuration objects:

```python
INVENTORY_CONFIG = {
    "costing_method": "fifo",
    "allow_negative_stock": False,
    "reorder_threshold_multiplier": 1.5,
    "batch_tracking_enabled": True,
    "auto_reorder_enabled": False,
}
```

The idea: different clients could customize behavior without code changes. Just update the config!

In practice, every "configuration" eventually needed code changes anyway. "Allow negative stock" sounds like a boolean, but the business logic for negative stock is fundamentally different from positive-stock-only logic. It's not a flag flip—it's a different code path with different validation, different reporting, and different financial implications.

I ended up with code riddled with `if settings.INVENTORY_CONFIG["allow_negative_stock"]:` branches, each one tested independently, each one a potential bug surface. The config didn't eliminate complexity—it distributed it across every function that read it.

### What Replaced It

Hard-coded business rules that match the actual client's requirements. When a new client needs different behavior, I evaluate whether it's a genuine variation or a different product. Usually, it's a different product.

Configuration is for deployment parameters: database URLs, API keys, feature flags for A/B tests. Business rules are code. They deserve tests, type checking, and code review—none of which work well on JSON objects.

---

## The Pattern I Keep Coming Back To

Every abstraction I regret shares the same origin story: I built it because I imagined a future need, not because I had a present one. The generic service layer was for "when we have 50 models." The config-driven architecture was for "when we have multiple clients." The component library was for "when we have a design system."

None of those futures arrived the way I imagined. When they arrived at all, the actual requirements were different enough that the abstraction didn't fit.

The abstractions I don't regret? They were all extracted, never invented. I wrote the code three times, noticed the pattern, and pulled it out. `TenantAwareQuerySet` in Polaris started as copy-pasted `.filter(organization=org)` calls. When I had 15 models all doing the same filter, the abstraction was obvious and correct.

The heuristic: **if you can't point to three existing call sites that would use the abstraction, you're speculating.** Speculation in code is expensive because it's permanent until someone is brave enough to delete it.

And deleting abstractions is harder than deleting regular code. Regular code has no dependents. An abstraction has consumers, each of which was shaped by the abstraction's API. Removing it means refactoring every consumer. The abstraction calcifies.

So when you're about to create `BaseService`, `GenericHandler`, or `AbstractProcessor`: write the specific thing first. Write it again when you need it again. By the third time, you'll know what the abstraction actually is—not what you imagined it might be.
