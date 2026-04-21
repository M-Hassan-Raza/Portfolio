---
title: "When to Extract a Component (and When to Just Copy-Paste)"
date: 2025-02-12
description: "The 3-usage-sites heuristic for component extraction, a premature ConfirmDialog that cost me time, and why copy-paste is sometimes the right call in Vue."
tags: ["Vue.js", "Components", "Architecture", "Best Practices"]
categories: ["Vue.js", "Web Development"]
showToc: true
showComments: true
cover:
  image: "/assets/component-extraction-cover.svg"
  alt: "Component extraction cover"
---

Early in building [Polaris](/projects/polaris), I extracted a `ConfirmDialog` component after using it exactly once. I figured I'd need it everywhere — deletes, password changes, dangerous actions. Classic foresight.

Then the second use case needed a text input inside the dialog. The third needed two buttons with custom labels instead of "Confirm/Cancel". The fourth needed async validation before confirming. Within a month, my clean `ConfirmDialog` had 8 props, 3 slots, and a `mode` prop that changed its behavior entirely.

I'd have been better off copy-pasting the original 20 lines and tweaking each one independently.

## The 3-Usage-Sites Rule

I now follow a simple heuristic: **don't extract until you have 3 call sites that genuinely share the same behavior.** Not 3 places that look similar — 3 places that would all benefit from a single change.

Two similar components might diverge tomorrow. Three that stay identical for a few weeks probably share real structure worth abstracting.

## What Actually Worked: The Price Display

Here's a component that was worth extracting. In Polaris, prices show up in invoices, product lists, reports, and receipts. Every single one needs the same formatting: locale-aware number formatting with the currency symbol from the shop's settings.

```vue
<script setup>
import { useShopStore } from '@/stores/shop'

const props = defineProps<{
  amount: number
}>()

const shop = useShopStore()

const formatted = computed(() =>
  new Intl.NumberFormat(shop.locale, {
    style: 'currency',
    currency: shop.currency,
  }).format(props.amount)
)
</script>

<template>
  <span>{{ formatted }}</span>
</template>
```

One prop. No slots. No modes. Every call site wants exactly the same thing: show this number as a price. When I changed the formatting logic to handle zero-decimal currencies, it fixed everywhere at once.

That's the test: **would a change here fix a real inconsistency across the app?** If yes, extract. If each usage is going to diverge, copy-paste and let them evolve independently.

## Signals That You Extracted Too Early

- The component has a `mode` or `variant` prop that fundamentally changes its behavior (not styling — behavior).
- You're adding slots to handle "special cases" in specific call sites.
- You find yourself passing callbacks through 3 layers of props to handle one caller's edge case.
- The component file is growing faster than the features that use it.

## Signals That You Should Extract

- You fixed a bug in one place and realized you need to fix the identical bug in 2 other files.
- Three or more call sites pass the same props in the same pattern.
- A formatting rule (dates, currencies, statuses) should be consistent but you've implemented it slightly differently in each place.

The goal isn't to have fewer files. It's to have the right seams. Sometimes that means a shared component. Sometimes it means three similar-looking blocks of code that happen to serve different purposes.
