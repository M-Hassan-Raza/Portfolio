---
title: "Polaris Performance Log: The Django Mistakes I Made First"
date: 2025-02-10T10:00:00+05:00
lastmod: 2026-09-25T10:00:00+05:00
description: "Refunds that queried once per line item, stock updated one row at a time, and signals that recalculated ledgers nobody asked about. What I changed in Polaris, and what I'd tell myself earlier."
aliases:
  - /blog/django-orm-optimizations/
  - /blog/django-orm-optimizaitons/
  - /blog/using-signals-optimally/
tags: ["Django", "PostgreSQL", "Performance", "Polaris"]
categories: ["Backend"]
ShowToc: true
cover:
  ascii: "post-django-log"
  alt: "Django performance notes"
---

[Polaris](/projects/polaris/) is the retail operations system I built for shops that bill all day: invoices, refunds, stock, customer ledgers. The first version was correct and slow in the places cashiers notice most. Checkout dragged, refunds dragged, and customers standing at the counter were, to put it politely, fuming a little.

None of what follows is clever. It's a log of the Django habits that looked fine with three test products and fell over with a real catalogue.

## Refunds asked the database the same question per line

The refund endpoint walked the refunded items and looked each one up:

```python
for item_data in refund_items_data:
    bill_item = BillItem.objects.get(id=item_data["bill_item_id"])
    product = bill_item.product  # another query, every time
```

Two queries per line. A ten-item refund meant twenty round trips before any real work happened.

My first fix was to add `select_related("product")` to the `.get()` inside the loop. That halves the problem and keeps the shape of it: still one query per item. The fix that counts is to fetch everything once:

```python
ids = [item["bill_item_id"] for item in refund_items_data]
bill_items = BillItem.objects.select_related("product").in_bulk(ids)

for item_data in refund_items_data:
    bill_item = bill_items[item_data["bill_item_id"]]
```

One query, however long the refund. For relations that fan out, like refund items to bill items to products, `prefetch_related("bill_item__product")` does the same job in a fixed number of queries.

I also briefly wrote a raw SQL `SUM()` for refund totals because I assumed the ORM would be slower. It wasn't. `aggregate(Sum("refunded_amount"))` produces the same query, and the raw version was one more thing to keep in sync with the schema. It went back to the ORM.

## Stock was updated one row at a time

Anything that touched many products did it in a loop:

```python
for product in products:
    product.stock -= 1
    product.save()
```

One `UPDATE` per product, plus whatever `save()` triggered. Two changes fixed it. Where every row gets the same change, let the database do the arithmetic:

```python
Product.objects.filter(id__in=ids).update(stock=F("stock") - 1)
```

`F()` also removes a lost-update bug: the old code read the stock in Python and wrote it back, so two concurrent sales could both write the same number. Where rows get different values, `bulk_update(products, ["quantity_units", "quantity_subunits"])` sends them in one statement.

## Signals recalculated ledgers on every save

Customer balances in Polaris come from a ledger: every sale, payment and return is an entry, and the balance is derived from them. Early on, a `post_save` signal on each entry recalculated the whole ledger. Importing a batch of entries meant recalculating the same ledger once per entry, and a sale also saved the product, which fired its own signals.

The version that worked marks ledgers as stale and recalculates each one once, after the transaction commits:

```python
class Ledger(models.Model):
    balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    needs_recalculation = models.BooleanField(default=False, db_index=True)


def mark_stale(ledger_id):
    Ledger.objects.filter(pk=ledger_id).update(needs_recalculation=True)
    transaction.on_commit(lambda: recalculate(ledger_id))


def recalculate(ledger_id):
    with transaction.atomic():
        ledger = Ledger.objects.select_for_update().get(pk=ledger_id)
        if not ledger.needs_recalculation:
            return  # another commit already did it
        ledger.balance = ledger.entries.aggregate(total=Sum("amount"))["total"] or 0
        ledger.needs_recalculation = False
        ledger.save(update_fields=["balance", "needs_recalculation"])
```

The flag is a real column, so a periodic job can sweep up anything a crash left stale. Bulk imports call `mark_stale` once per ledger instead of once per entry. And the recalculation lives in a function you can find with grep, which I've come to value more than any amount of decoupling.

(An earlier version of this post had the flag as a plain Python attribute on the instance. That works right up until you try to query it.)

## Caching the one lookup that never changes

Unit conversion rates, like how many pieces are in a carton, were read from the database on every line of every invoice. They almost never change, so they went into Django's cache with the product ID in the key. The part I got wrong at first was invalidation: the cache has to be cleared when someone edits the rate, or a cashier sells at yesterday's conversion for an hour.

## What I'd tell myself earlier

- Turn on Django Debug Toolbar before writing the second endpoint. Query counts are obvious the moment you can see them.
- Loops that touch the database are guilty until proven innocent.
- Anything that keeps money or stock correct should be code you can read top to bottom. Signals are fine for side effects, not for the ledger.

Some of these came back to bite me in less polite ways later. Those are in [the war stories](/blog/war-stories-from-production/).
