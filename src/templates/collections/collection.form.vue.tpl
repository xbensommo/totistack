<!--
  @file {{componentName}}Form.vue
  @description Form component for {{collectionName}} collection
  @date 2026-03-22
  @author Totistack Team
-->

<template>
  <form @submit.prevent="handleSubmit" class="collection-form">
    <div v-for="field in formFields" :key="field.name" class="form-group">
      <label :for="field.name" class="form-label">
        {{ field.label }}
        <span v-if="field.required" class="required-star">*</span>
      </label>
      
      <!-- Input based on field type -->
      <component
        :is="getFieldComponent(field)"
        :id="field.name"
        v-model="formData[field.name]"
        :field="field"
        :disabled="submitting"
        class="form-input"
        :class="{ 'has-error': errors[field.name] }"
      />
      
      <p v-if="errors[field.name]" class="error-message">
        {{ errors[field.name] }}
      </p>
      <p v-if="field.description" class="field-description">
        {{ field.description }}
      </p>
    </div>
    
    <div class="form-actions">
      <button 
        type="button" 
        class="btn-secondary"
        @click="handleCancel"
        :disabled="submitting"
      >
        Cancel
      </button>
      <button 
        type="submit" 
        class="btn-primary"
        :disabled="submitting || !isValid"
      >
        <span v-if="submitting" class="spinner-small"></span>
        {{ isEditMode ? 'Update' : 'Create' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { use{{componentName}}Store } from '../store.js';
import collectionDefinition from '../definition.js';

const props = defineProps({
  itemId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['success', 'cancel']);

const router = useRouter();
const store = use{{componentName}}Store();

// State
const formData = ref({});
const errors = ref({});
const submitting = ref(false);

// Computed
const isEditMode = computed(() => !!props.itemId);
const formFields = computed(() => {
  return Object.entries(collectionDefinition.fields)
    .filter(([_, field]) => !field.readOnly)
    .map(([name, field]) => ({
      name,
      ...field
    }));
});

const isValid = computed(() => {
  return Object.keys(errors.value).length === 0 && 
         Object.values(formData.value).some(v => v !== undefined);
});

// Methods
function getFieldComponent(field) {
  const componentMap = {
    'string': 'TextField',
    'text': 'TextAreaField',
    'number': 'NumberField',
    'boolean': 'CheckboxField',
    'date': 'DateField',
    'datetime': 'DateTimeField',
    'reference': 'ReferenceField',
    'array': 'ArrayField',
    'object': 'ObjectField'
  };
  return componentMap[field.type] || 'TextField';
}

async function loadItem() {
  if (isEditMode.value && props.itemId) {
    await store.fetchItem(props.itemId);
    if (store.currentItem) {
      formData.value = { ...store.currentItem };
      delete formData.value.id;
      delete formData.value.createdAt;
      delete formData.value.updatedAt;
      delete formData.value.createdBy;
      delete formData.value.updatedBy;
    }
  }
}

function validateForm() {
  const newErrors = {};
  
  formFields.value.forEach(field => {
    if (field.required && !formData.value[field.name]) {
      newErrors[field.name] = `${field.label} is required`;
    }
    
    if (field.validation) {
      if (field.validation.minLength && 
          formData.value[field.name]?.length < field.validation.minLength) {
        newErrors[field.name] = `${field.label} must be at least ${field.validation.minLength} characters`;
      }
      
      if (field.validation.maxLength && 
          formData.value[field.name]?.length > field.validation.maxLength) {
        newErrors[field.name] = `${field.label} must be at most ${field.validation.maxLength} characters`;
      }
      
      if (field.validation.pattern && 
          formData.value[field.name] && 
          !new RegExp(field.validation.pattern).test(formData.value[field.name])) {
        newErrors[field.name] = field.validation.message || `${field.label} format is invalid`;
      }
    }
  });
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
}

async function handleSubmit() {
  if (!validateForm()) return;
  
  submitting.value = true;
  
  try {
    if (isEditMode.value) {
      await store.updateItem(props.itemId, formData.value);
    } else {
      await store.createItem(formData.value);
    }
    
    emit('success', formData.value);
    
    // Navigate back to list
    router.push('/{{routePath}}');
  } catch (error) {
    console.error('Form submission failed:', error);
    if (error.message) {
      errors.value.submit = error.message;
    }
  } finally {
    submitting.value = false;
  }
}

function handleCancel() {
  emit('cancel');
  router.push('/{{routePath}}');
}

onMounted(() => {
  loadItem();
});
</script>

<style scoped>
.collection-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.required-star {
  color: var(--color-danger);
  margin-left: 0.25rem;
}

.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-neutral-dark);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(46, 91, 40, 0.1);
}

.form-input.has-error {
  border-color: var(--color-danger);
}

.error-message {
  color: var(--color-danger);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.field-description {
  color: var(--color-text-light);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-neutral);
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-secondary {
  background: var(--color-neutral);
  color: var(--color-text);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-neutral-dark);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner-small {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>