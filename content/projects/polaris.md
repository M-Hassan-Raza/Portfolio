---
title: "Polaris ERP"
date: 2025-02-10
description: "Full-stack retail ERP system with race-condition-safe inventory, double-entry bookkeeping, and multi-tenant architecture"
tags: ["Django", "Vue.js", "PostgreSQL", "ERP", "Full-Stack", "Concurrency"]
categories: ["Projects"]
showToc: true
showReadingTime: true
weight: -10
---

Polaris is a full-stack ERP and POS system I built for retail businesses. It handles inventory, sales, customer management, and financial reporting—the kind of system where bugs cost money and downtime loses customers.

**Tech Stack:** Vue 3, Pinia, TanStack Query, Django, Django REST Framework, PostgreSQL, WeasyPrint

**Source:** Private (client work) · [Book a call](/book-a-call/) to discuss

---

## The Hard Problems

Building ERP software sounds straightforward until you hit the edge cases that make or break real businesses:

1. **Concurrent inventory access** — Two cashiers selling the last item at the same time. Two stock clerks adjusting quantities. A sale happening while someone generates a report.

2. **Financial integrity** — Customer balances that must always reconcile. Partial payments, returns, credit notes, and adjustments that all need to balance correctly.

3. **Multi-tenant data isolation** — Multiple organizations sharing infrastructure where one tenant must never see another's data—not through bugs, not through clever URL manipulation, not through anything.

4. **Batch costing** — Products arrive in batches at different prices. When you sell, which cost do you use? FIFO costing with full supplier traceability.

---

## Technical Deep Dives

### Race Condition Prevention: Dual-Layer Locking

The inventory system uses a dual-layer locking strategy to prevent race conditions without sacrificing performance.

**Layer 1: Pessimistic Locking with Deadlock Prevention**

When a transaction needs to update inventory, we acquire row-level locks in a consistent order:

```python
class InventoryService:
    def update_quantities(self, items: list[tuple[int, Decimal]]):
        """
        Update multiple product quantities atomically.
        Items: list of (product_id, quantity_delta) tuples
        """
        # Sort by ID to prevent deadlocks
        sorted_items = sorted(items, key=lambda x: x[0])

        with transaction.atomic():
            for product_id, delta in sorted_items:
                # NOWAIT fails immediately if lock unavailable
                # Better to fail fast than queue indefinitely
                product = (
                    Product.objects
                    .select_for_update(nowait=True)
                    .get(id=product_id)
                )
                product.quantity += delta
                product.save(update_fields=['quantity', 'updated_at'])
```

The `nowait=True` is critical. Without it, transactions queue up waiting for locks, creating latency spikes during busy periods. With `nowait`, we fail fast and let the application retry with exponential backoff.

**Layer 2: Optimistic Locking for Frontend Sync**

For the frontend, we need to detect when data has changed between read and write:

```python
class Product(models.Model):
    version = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        if self.pk:
            updated = Product.objects.filter(
                pk=self.pk,
                version=self.version
            ).update(
                version=self.version + 1,
                **{f: getattr(self, f) for f in kwargs.get('update_fields', [])}
            )
            if not updated:
                raise StaleDataError("Record modified by another user")
        super().save(*args, **kwargs)
```

The frontend polls for version changes with a lightweight endpoint that returns ~50 bytes per product—just IDs and versions. When versions mismatch, the UI shows a conflict resolution dialog rather than silently overwriting.

---

### Financial System: Advisory Locks and Double-Entry Bookkeeping

Customer balances are the most sensitive data in the system. A miscalculation means either overcharging customers or losing money.

**PostgreSQL Advisory Locks for Balance Operations**

Database row locks work for single-row updates, but balance calculations touch multiple rows. We use PostgreSQL advisory locks to serialize operations per customer:

```python
class LedgerService:
    def credit_customer(self, customer_id: int, amount: Decimal, reason: str):
        # Advisory lock scoped to this customer
        lock_id = hash(f"customer_balance_{customer_id}") & 0x7FFFFFFF

        with connection.cursor() as cursor:
            cursor.execute("SELECT pg_advisory_lock(%s)", [lock_id])

        try:
            with transaction.atomic():
                entry = LedgerEntry.objects.create(
                    customer_id=customer_id,
                    entry_type=EntryType.CREDIT,
                    amount=amount,
                    reason=reason,
                    running_balance=self._calculate_new_balance(customer_id, amount)
                )
                # Trigger recalculation signals
                balance_changed.send(sender=self, customer_id=customer_id)
                return entry
        finally:
            with connection.cursor() as cursor:
                cursor.execute("SELECT pg_advisory_unlock(%s)", [lock_id])
```

**Double-Entry with Automatic Reversals**

Every financial operation creates a reversible entry. Returns don't delete the original sale—they create a counter-entry:

```python
class LedgerEntry(models.Model):
    entry_type = models.CharField(choices=EntryType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reversal_of = models.ForeignKey('self', null=True, on_delete=models.PROTECT)
    reversed_by = models.ForeignKey('self', null=True, on_delete=models.PROTECT)

    def reverse(self, reason: str):
        """Create a reversal entry. Original entry remains for audit."""
        reversal = LedgerEntry.objects.create(
            customer=self.customer,
            entry_type=self._inverse_type(),
            amount=self.amount,
            reason=f"Reversal: {reason}",
            reversal_of=self
        )
        self.reversed_by = reversal
        self.save(update_fields=['reversed_by'])
        return reversal
```

**Tolerance-Based Financial Equality**

Floating-point comparisons fail on financial data. We use tolerance-based equality:

```python
FINANCIAL_TOLERANCE = Decimal('0.01')

def balances_equal(a: Decimal, b: Decimal) -> bool:
    return abs(a - b) < FINANCIAL_TOLERANCE

def validate_ledger_balance(customer_id: int):
    """Verify running balance matches sum of entries."""
    entries_sum = LedgerEntry.objects.filter(
        customer_id=customer_id,
        reversed_by__isnull=True
    ).aggregate(total=Sum('signed_amount'))['total'] or Decimal('0')

    current_balance = Customer.objects.get(id=customer_id).balance

    if not balances_equal(entries_sum, current_balance):
        raise LedgerIntegrityError(
            f"Balance mismatch: entries={entries_sum}, stored={current_balance}"
        )
```

---

### Multi-Tenant Architecture

The system serves multiple retail businesses from a single deployment. Data isolation isn't optional—it's existential.

**Thread-Local Organization Context**

Every request establishes an organization context that propagates through the entire call stack:

```python
_org_context = threading.local()

class OrganizationMiddleware:
    def __call__(self, request):
        org_id = self._extract_org_id(request)
        _org_context.organization_id = org_id
        _org_context.organization = Organization.objects.get(id=org_id)

        try:
            response = self.get_response(request)
        finally:
            _org_context.organization_id = None
            _org_context.organization = None

        return response

def get_current_organization():
    return getattr(_org_context, 'organization', None)
```

**Tenant-Aware QuerySet**

All models inherit from a base that automatically filters by organization:

```python
class TenantAwareQuerySet(models.QuerySet):
    def get_queryset(self):
        qs = super().get_queryset()
        org = get_current_organization()
        if org:
            return qs.filter(organization=org)
        return qs.none()  # Fail closed, not open

class TenantAwareManager(models.Manager):
    def get_queryset(self):
        return TenantAwareQuerySet(self.model, using=self._db)

class TenantModel(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    objects = TenantAwareManager()
    all_objects = models.Manager()  # Escape hatch for admin/migrations

    class Meta:
        abstract = True
```

Every query—`Product.objects.all()`, `Customer.objects.filter(name='X')`—automatically includes the organization filter. You can't forget it because it's built into the ORM.

---

### Batch Inventory and FIFO Costing

Products arrive in batches at different purchase prices. When calculating cost of goods sold, we use FIFO (First In, First Out):

```python
class InventoryBatch(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    purchase = models.ForeignKey(Purchase, on_delete=models.PROTECT)
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT)
    quantity_received = models.DecimalField(max_digits=10, decimal_places=2)
    quantity_remaining = models.DecimalField(max_digits=10, decimal_places=2)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    received_at = models.DateTimeField(auto_now_add=True)

class Product(TenantModel):
    @property
    def current_quantity(self):
        """Computed from batches, not stored."""
        return InventoryBatch.objects.filter(
            product=self
        ).aggregate(
            total=Sum('quantity_remaining')
        )['total'] or Decimal('0')

    @property
    def average_cost(self):
        """Weighted average across remaining batches."""
        batches = InventoryBatch.objects.filter(
            product=self,
            quantity_remaining__gt=0
        )
        total_value = sum(b.quantity_remaining * b.unit_cost for b in batches)
        total_qty = sum(b.quantity_remaining for b in batches)
        return total_value / total_qty if total_qty else Decimal('0')
```

When selling, we consume from oldest batches first:

```python
def consume_inventory(product_id: int, quantity: Decimal) -> list[tuple[Batch, Decimal]]:
    """
    FIFO consumption. Returns list of (batch, quantity_consumed) pairs
    for cost calculation and audit trail.
    """
    consumed = []
    remaining = quantity

    batches = (
        InventoryBatch.objects
        .filter(product_id=product_id, quantity_remaining__gt=0)
        .order_by('received_at')
        .select_for_update()
    )

    for batch in batches:
        if remaining <= 0:
            break

        take = min(batch.quantity_remaining, remaining)
        batch.quantity_remaining -= take
        batch.save(update_fields=['quantity_remaining'])

        consumed.append((batch, take))
        remaining -= take

    if remaining > 0:
        raise InsufficientInventoryError(f"Short {remaining} units")

    return consumed
```

The `PROTECT` on supplier prevents orphaned batches—you can't delete a supplier while inventory from them exists. This maintains the audit trail for traceability.

---

### Soft Delete with Audit Trail

Deleted records aren't actually deleted—they're flagged for audit and recovery:

```python
class SoftDeleteQuerySet(TenantAwareQuerySet):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)

    def with_deleted(self):
        return super().get_queryset()

class AuditModel(TenantModel):
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='+')
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='+')
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(User, null=True, on_delete=models.PROTECT, related_name='+')
    deletion_reason = models.TextField(blank=True)

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    def soft_delete(self, user, reason: str):
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.deletion_reason = reason
        self.save(update_fields=['deleted_at', 'deleted_by', 'deletion_reason'])
```

This combines with tenant-awareness—`Product.objects.all()` returns non-deleted products for the current organization only.

---

### Frontend Architecture

The Vue 3 frontend separates concerns cleanly between UI state and server state.

**Composables for Everything**

Over 100 composables handle different concerns:

```typescript
// useCart.ts - Cart UI state (Pinia)
export const useCart = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const customerId = ref<number | null>(null)

  // Persisted to sessionStorage for recovery
  const persistedState = useSessionStorage('cart-state', { items: [], customerId: null })

  // Sync with persisted state
  watch([items, customerId], () => {
    persistedState.value = { items: items.value, customerId: customerId.value }
  })

  return { items, customerId, /* ... */ }
})

// useProducts.ts - Server state (TanStack Query)
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.products.list(filters),
    staleTime: 30_000,
  })
}

// useProductVersions.ts - Lightweight polling for conflict detection
export function useProductVersions(productIds: number[]) {
  return useQuery({
    queryKey: ['product-versions', productIds],
    queryFn: () => api.products.versions(productIds),
    refetchInterval: 5_000,  // 5s polling
  })
}
```

**Cart Recovery**

Session persistence means abandoned carts survive page refreshes:

```typescript
export function useCartRecovery() {
  const cart = useCart()

  onMounted(() => {
    const persisted = sessionStorage.getItem('cart-state')
    if (persisted) {
      const { items, customerId } = JSON.parse(persisted)
      if (items.length > 0) {
        showRecoveryDialog({ items, customerId })
      }
    }
  })
}
```

---

### Real-Time Sync: Hybrid SSE + Polling

We use Server-Sent Events for immediate updates with polling as fallback:

```typescript
class RealtimeSync {
  private eventSource: EventSource | null = null
  private pollInterval: number | null = null

  connect() {
    if (typeof EventSource !== 'undefined') {
      this.eventSource = new EventSource('/api/events/')
      this.eventSource.onmessage = this.handleEvent
      this.eventSource.onerror = this.fallbackToPolling
    } else {
      this.fallbackToPolling()
    }
  }

  private fallbackToPolling() {
    this.eventSource?.close()
    this.pollInterval = setInterval(() => this.poll(), 5000)
  }

  private handleEvent(event: MessageEvent) {
    const { type, payload } = JSON.parse(event.data)

    if (type === 'inventory_update') {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    } else if (type === 'version_conflict') {
      showConflictDialog(payload)
    }
  }
}
```

Optimistic UI updates show changes immediately, with server confirmation reconciling any conflicts:

```typescript
const updateQuantity = useMutation({
  mutationFn: (data) => api.inventory.update(data),
  onMutate: async (data) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['products', data.productId] })

    // Snapshot previous value
    const previous = queryClient.getQueryData(['products', data.productId])

    // Optimistically update
    queryClient.setQueryData(['products', data.productId], (old) => ({
      ...old,
      quantity: old.quantity + data.delta
    }))

    return { previous }
  },
  onError: (err, data, context) => {
    // Rollback on error
    queryClient.setQueryData(['products', data.productId], context.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }
})
```

---

## Screenshots

<section class="screenshots-section">
  <div class="image-grid">
    <figure class="image-card">
      <img src="/assets/home.webp" alt="Polaris Dashboard" class="zoomable">
      <figcaption>Dashboard with business insights</figcaption>
    </figure>
    <figure class="image-card">
      <img src="/assets/product-database.webp" alt="Product Database" class="zoomable">
      <figcaption>Product management</figcaption>
    </figure>
    <figure class="image-card">
      <img src="/assets/invoice-cart-page.png" alt="Cart Page" class="zoomable">
      <figcaption>Checkout with price history</figcaption>
    </figure>
    <figure class="image-card">
      <img src="/assets/customerledger.webp" alt="Customer Ledger" class="zoomable">
      <figcaption>Customer balance tracking</figcaption>
    </figure>
    <figure class="image-card">
      <img src="/assets/product-sales-report.webp" alt="Sales Report" class="zoomable">
      <figcaption>Sales reporting</figcaption>
    </figure>
    <figure class="image-card">
      <img src="/assets/billpdf.webp" alt="Generated Invoice" class="zoomable">
      <figcaption>Generated invoice PDF</figcaption>
    </figure>
  </div>
</section>

---

## What I Learned

**Fail closed, not open.** The tenant-aware queryset returns `.none()` when there's no organization context rather than returning everything. This default-deny approach catches bugs before they become security incidents.

**Computed vs stored quantities.** Storing inventory quantities seems simpler, but computed quantities from batch records eliminate an entire class of drift bugs. The performance cost of aggregation is worth the consistency guarantee.

**Advisory locks solve coordination problems.** Row-level locks work for single-record updates, but cross-record operations need explicit coordination. PostgreSQL advisory locks are underused for application-level synchronization.

**Version fields catch what transactions miss.** Transactions prevent concurrent writes, but they don't help when a user stares at stale data for 10 minutes before clicking save. Optimistic locking with version fields closes that gap.

---

## Interested?

If you're looking for similar ERP/POS development or want to discuss the technical details, [book a call](/book-a-call/).

<script>
document.addEventListener("DOMContentLoaded", function () {
  const zoomableImages = document.querySelectorAll(".zoomable");

  zoomableImages.forEach((img) => {
    img.style.cursor = "pointer";
    img.addEventListener("click", function() {
      window.open(this.src, '_blank');
    });
  });
});
</script>
