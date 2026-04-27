<template>
  <div class="table-wrap">
    <table class="table-base">
      <thead>
        <tr>
          <th>Submitted</th>
          <th>Status</th>
          <th>Payload preview</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="submission in submissions" :key="submission.id">
          <td>{{ submission.submittedAt || submission.createdAt || '—' }}</td>
          <td>
            <span
              class="badge"
              :class="statusClass(submission.status || 'new')"
            >
              {{ submission.status || 'new' }}
            </span>
          </td>
          <td class="max-w-[34rem] truncate">{{ preview(submission.payload) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
/**
 * @file forms/components/SubmissionsTable.vue
 * @description Compact starter table for form submissions.
 */
defineProps({
  submissions: { type: Array, default: () => [] },
})

function preview(payload) {
  if (!payload || typeof payload !== 'object') {
    return 'No payload'
  }
  return Object.entries(payload)
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(' · ')
}

function statusClass(status) {
  const normalized = String(status).toLowerCase()
  if (normalized === 'flagged') return 'badge-danger'
  if (normalized === 'reviewed') return 'badge-success'
  if (normalized === 'new') return 'badge-primary'
  return ''
}
</script>
