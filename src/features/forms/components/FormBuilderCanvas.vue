<template>
  <section class="card">
    <div class="flex flex-col gap-4 border-b border-theme pb-5 md:flex-row md:items-start md:justify-between">
      <div>
        <h3 class="section-title">Form structure</h3>
        <p class="mt-1 text-sm text-muted">Arrange fields, edit labels, and tune validation rules.</p>
      </div>
      <span class="badge badge-primary">{{ modelValue.length }} fields</span>
    </div>

    <div v-if="modelValue.length" class="mt-5 space-y-4">
      <article
        v-for="(field, index) in modelValue"
        :key="field.id || `${field.key}-${index}`"
        class="card-soft"
      >
        <div class="grid gap-4 md:grid-cols-2">
          <label>
            <span class="field-label">Label</span>
            <input v-model="field.label" type="text" class="input-field" />
          </label>

          <label>
            <span class="field-label">Key</span>
            <input v-model="field.key" type="text" class="input-field" />
          </label>

          <label>
            <span class="field-label">Type</span>
            <select v-model="field.type" class="select-field">
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="textarea">Textarea</option>
              <option value="select">Select</option>
              <option value="checkbox">Checkbox</option>
              <option value="file">File</option>
            </select>
          </label>

          <label>
            <span class="field-label">Placeholder</span>
            <input v-model="field.placeholder" type="text" class="input-field" />
          </label>
        </div>

        <div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-theme pt-4">
          <label class="checkbox-field">
            <input v-model="field.isRequired" type="checkbox" class="sr-only" />
            <span class="checkbox-ui">
              <i v-if="field.isRequired" class="fas fa-check text-[10px] text-primary"></i>
            </span>
            <span>Required</span>
          </label>

          <button
            type="button"
            class="btn-danger btn-sm"
            @click="$emit('remove', index)"
          >
            <i class="fas fa-trash-can text-xs"></i>
            Remove field
          </button>
        </div>
      </article>
    </div>

    <div v-else class="empty-state mt-6 py-10">
      <div
        class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(109,94,252,0.08)] text-primary"
      >
        <i class="fas fa-square-plus text-lg"></i>
      </div>
      <h4 class="text-lg font-semibold text-[var(--color-text)]">No fields added yet</h4>
      <p class="mt-2 text-sm text-muted">Start by adding a field from the library.</p>
    </div>
  </section>
</template>

<script setup>
/**
 * @file forms/components/FormBuilderCanvas.vue
 * @description Generic editable canvas for starter form definitions.
 */
defineProps({
  modelValue: { type: Array, default: () => [] },
})
defineEmits(['remove'])
</script>
