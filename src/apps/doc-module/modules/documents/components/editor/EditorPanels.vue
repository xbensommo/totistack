<template>
  <div class="space-y-4">
    <DocumentPanel :document-draft="documentDraft" :definition="definition" />
    <BrandPanel :document-draft="documentDraft" />
    <PartiesPanel :document-draft="documentDraft" />
    <LayoutPanel :document-draft="documentDraft" />
    <RichTextBlockEditor v-model="documentDraft.content.summaryHtml" label="Summary" />

    <template v-if="definition.id === 'invoice'">
      <LineItemsPanel
        :items="documentDraft.content.lineItems"
        :currency="documentDraft.meta.currency"
        @add="$emit('add-line-item')"
        @remove="$emit('remove-line-item', $event)"
      />
      <FinancialPanel :document-draft="documentDraft" :normalized-document="normalizedDocument" />
    </template>

    <template v-if="definition.id === 'contract' || definition.id === 'hosting_agreement'">
      <BlocksPanel
        title="Clause Blocks"
        :blocks="documentDraft.content.richBlocks"
        @add="$emit('add-rich-block')"
        @remove="$emit('remove-rich-block', $event)"
      />
      <RichTextBlockEditor v-model="documentDraft.content.notesHtml" label="Additional Notes" />
    </template>

    <template v-if="definition.id === 'scope_of_work'">
      <ListItemsPanel
        title="Deliverables"
        singular-label="Deliverable"
        :items="documentDraft.content.scopeItems"
        @add="$emit('add-list-item', 'scopeItems', 'Deliverable')"
        @remove="$emit('remove-list-item', 'scopeItems', $event)"
      />
      <ListItemsPanel
        title="Milestones"
        singular-label="Milestone"
        :items="documentDraft.content.milestones"
        @add="$emit('add-list-item', 'milestones', 'Milestone')"
        @remove="$emit('remove-list-item', 'milestones', $event)"
      />
      <RichTextBlockEditor v-model="documentDraft.content.notesHtml" label="Exclusions / Notes" />
    </template>

    <template v-if="definition.id === 'change_request'">
      <ListItemsPanel
        title="Change Items"
        singular-label="Change Item"
        :items="documentDraft.content.changeItems"
        @add="$emit('add-list-item', 'changeItems', 'Change Item')"
        @remove="$emit('remove-list-item', 'changeItems', $event)"
      />
      <RichTextBlockEditor v-model="documentDraft.content.notesHtml" label="Approval Notes" />
    </template>

    <SignaturesPanel :document-draft="documentDraft" />
  </div>
</template>

<script setup>
import DocumentPanel from './DocumentPanel.vue';
import BrandPanel from './BrandPanel.vue';
import PartiesPanel from './PartiesPanel.vue';
import LayoutPanel from './LayoutPanel.vue';
import FinancialPanel from './FinancialPanel.vue';
import LineItemsPanel from './LineItemsPanel.vue';
import ListItemsPanel from './ListItemsPanel.vue';
import BlocksPanel from './BlocksPanel.vue';
import RichTextBlockEditor from './RichTextBlockEditor.vue';
import SignaturesPanel from './SignaturesPanel.vue';

defineProps({
  documentDraft: { type: Object, required: true },
  definition: { type: Object, required: true },
  normalizedDocument: { type: Object, required: true },
});

defineEmits([
  'add-rich-block',
  'remove-rich-block',
  'add-list-item',
  'remove-list-item',
  'add-line-item',
  'remove-line-item',
]);
</script>
