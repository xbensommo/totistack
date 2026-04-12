<template>
  <FeaturePageShell eyebrow="Media" title="Media library" description="Browse, organize, and inspect the assets available to your project.">
    <div class="grid gap-6 xl:grid-cols-[1fr,340px]">
      <div>
        <MediaGrid v-if="files.length" :files="files" @select="selectedFile = $event" />
        <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
          No media assets yet.
        </div>
      </div>
      <MediaDetailsPanel :file="selectedFile" />
    </div>
  </FeaturePageShell>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import FeaturePageShell from '../components/FeaturePageShell.vue'
import MediaGrid from '../components/MediaGrid.vue'
import MediaDetailsPanel from '../components/MediaDetailsPanel.vue'
import { createMediaService } from '../services/mediaService.js'

const mediaService = createMediaService()
const files = ref([])
const selectedFile = ref(null)

onMounted(async () => {
  files.value = await mediaService.listFiles()
  selectedFile.value = files.value[0] || null
})
</script>
