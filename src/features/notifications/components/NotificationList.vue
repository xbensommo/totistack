<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  emptyTitle: {
    type: String,
    default: 'No notifications yet',
  },
  emptyText: {
    type: String,
    default: 'New alerts from CRM, booking, forms, documents, and finance will show here.',
  },
})

const emit = defineEmits(['open', 'mark-read', 'archive'])
</script>

<template>
  <div class="space-y-3">
    <div v-if="items.length" class="space-y-3">
      <article
        v-for="item in items"
        :key="item.id"
        class="notification-card rounded-2xl border p-4 transition hover:-translate-y-0.5"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="pill pill-type">{{ item.type || 'system' }}</span>
              <span v-if="item.priority" class="pill pill-priority">{{ item.priority }}</span>
              <span v-if="!item.readAt" class="pill pill-new">new</span>
            </div>

            <h3 class="mt-3 text-sm font-semibold sm:text-base">
              {{ item.title }}
            </h3>

            <p class="mt-1 text-sm leading-6 text-[color:var(--color-muted,#6b7280)]">
              {{ item.message }}
            </p>

            <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-muted,#6b7280)]">
              <span>{{ item.channel }}</span>
              <span>•</span>
              <span>{{ item.event }}</span>
              <span v-if="item.entityId">•</span>
              <span v-if="item.entityId">{{ item.entityId }}</span>
            </div>
          </div>

          <div class="flex shrink-0 flex-col gap-2">
            <button class="action-btn" type="button" @click="$emit('mark-read', item)">Read</button>
            <button class="action-btn" type="button" @click="$emit('archive', item)">Archive</button>
            <button class="action-btn action-btn-primary" type="button" @click="$emit('open', item)">
              Open
            </button>
          </div>
        </div>
      </article>
    </div>

    <div
      v-else
      class="rounded-2xl border p-6 text-center"
      style="background: var(--color-surface, #fff); border-color: var(--color-border, #e5e7eb);"
    >
      <h3 class="text-sm font-semibold sm:text-base">{{ emptyTitle }}</h3>
      <p class="mt-2 text-sm text-[color:var(--color-muted,#6b7280)]">{{ emptyText }}</p>
    </div>
  </div>
</template>

<style scoped>
.notification-card {
  background: var(--color-surface, #ffffff);
  border-color: var(--color-border, #e5e7eb);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.pill-type {
  color: var(--color-secondary, #4a90e2);
  background: color-mix(in srgb, var(--color-secondary, #4a90e2) 12%, white);
}

.pill-priority {
  color: var(--color-accent, #111827);
  background: color-mix(in srgb, var(--color-accent, #111827) 8%, white);
}

.pill-new {
  color: white;
  background: var(--color-primary, #1860a8);
}

.action-btn {
  min-width: 4.75rem;
  border-radius: 999px;
  border: 1px solid var(--color-border, #e5e7eb);
  background: transparent;
  padding: 0.55rem 0.8rem;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--color-text, #111827);
}

.action-btn-primary {
  color: white;
  border-color: transparent;
  background: var(--color-primary, #1860a8);
}
</style>
