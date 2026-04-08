---
title: "The Invoice Page That Took 4 Seconds to Search"
date: 2025-02-11
description: "How preloading product data cut search latency from 4 seconds to instant on a POS system's invoice page — and when this pattern breaks down."
tags: ["Performance", "Vue.js", "POS", "Web Development"]
categories: ["Performance", "Web Development"]
showToc: true
showComments: true
---

In [Polaris](/projects/polaris), the POS system I built for retail shops, the invoice page has a product search bar. A cashier types a product name, results appear, they click to add it to the invoice. Simple.

Except it wasn't. Every keystroke fired an API call. On a shop with 500 products, search took 3-4 seconds because each request hit the database, serialized the response, and traveled back over the network. Cashiers were waiting on every single search. During rush hours, this was painful.

## The Fix: Load Everything on Mount

The product catalog for a typical Polaris shop is 200-800 products. That's maybe 50KB of JSON. There's no reason to fetch it on every search when you can load it once.

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'

const productStore = useProductStore()
const searchQuery = ref('')
const searchResults = ref([])

onMounted(async () => {
  await productStore.fetchProducts()
})

function searchProducts() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  const query = searchQuery.value.toLowerCase()
  searchResults.value = productStore.products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.sku?.toLowerCase().includes(query)
  )
}
</script>
```

Search went from 3-4 seconds to effectively instant. The initial page load added maybe 200ms for fetching the catalog, but that happens once while the page is rendering anyway. The cashier doesn't notice.

## When This Breaks Down

This pattern has a ceiling. It works for Polaris because:

- **Catalog size is bounded.** Retail shops have hundreds of products, not millions. If you're building an e-commerce platform with 50,000 SKUs, preloading everything is not an option.
- **Data changes slowly.** Products don't update mid-transaction. If your data changes every few seconds, you'll serve stale results.
- **Search is simple.** String matching on name and SKU. If you need fuzzy matching, relevance scoring, or faceted search, you need a server-side search engine.

## What To Do When It Doesn't Fit

For larger catalogs, the progression is:

1. **Debounced server search** — wait 300ms after the last keystroke, then fire one API call. Eliminates the per-keystroke storm.
2. **Server-side search with an index** — PostgreSQL trigram indexes or Elasticsearch. Required once you're past a few thousand items.
3. **Virtual scrolling for results** — if you're showing 10,000 results in a dropdown, render only what's visible. Libraries like `vue-virtual-scroller` handle this.

The right answer depends on how much data you have and how fast it changes. For Polaris, preloading 500 products on mount was the simplest fix that solved the real problem.
