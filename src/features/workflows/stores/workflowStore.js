/**
 * Workflow Pinia Store
 * @module features/workflow/stores/workflowStore
 * @description Pinia store for workflow automation state management
 * @author Totistack Team
 * @date 2026-03-22
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import workflowEngine from '../services/workflowEngine';

/**
 * Create workflow Pinia store
 * @param {Object} pinia - Pinia instance
 * @returns {Object} Pinia store
 */
export const createWorkflowStore = (pinia) => {
  return defineStore('workflow', () => {
    // State
    const workflows = ref([]);
    const currentWorkflow = ref(null);
    const executions = ref([]);
    const triggers = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const lastUpdated = ref(null);
    
    // Computed
    const activeWorkflows = computed(() => 
      workflows.value.filter(w => w.isActive)
    );
    
    const recentExecutions = computed(() => 
      [...executions.value].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ).slice(0, 10)
    );
    
    const failedExecutions = computed(() => 
      executions.value.filter(e => e.status === 'failed')
    );
    
    const executionStats = computed(() => ({
      total: executions.value.length,
      completed: executions.value.filter(e => e.status === 'completed').length,
      failed: executions.value.filter(e => e.status === 'failed').length,
      running: executions.value.filter(e => e.status === 'running').length
    }));
    
    // Actions
    /**
     * Load all workflows
     */
    const loadWorkflows = async () => {
      isLoading.value = true;
      error.value = null;
      
      try {
        workflows.value = await workflowEngine.listWorkflows();
        lastUpdated.value = Date.now();
      } catch (err) {
        error.value = err.message;
        console.error('[WorkflowStore] Failed to load workflows:', err);
      } finally {
        isLoading.value = false;
      }
    };
    
    /**
     * Load single workflow
     * @param {string} workflowId - Workflow ID
     */
    const loadWorkflow = async (workflowId) => {
      isLoading.value = true;
      error.value = null;
      
      try {
        currentWorkflow.value = await workflowEngine.getWorkflow(workflowId);
      } catch (err) {
        error.value = err.message;
        console.error('[WorkflowStore] Failed to load workflow:', err);
      } finally {
        isLoading.value = false;
      }
    };
    
    /**
     * Create new workflow
     * @param {Object} workflowData - Workflow data
     * @returns {Promise<Object>} Created workflow
     */
    const createWorkflow = async (workflowData) => {
      isLoading.value = true;
      error.value = null;
      
      try {
        const workflow = await workflowEngine.createWorkflow(workflowData);
        workflows.value.push(workflow);
        return workflow;
      } catch (err) {
        error.value = err.message;
        throw err;
      } finally {
        isLoading.value = false;
      }
    };
    
    /**
     * Update workflow
     * @param {string} workflowId - Workflow ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object>} Updated workflow
     */
    const updateWorkflow = async (workflowId, updates) => {
      isLoading.value = true;
      error.value = null;
      
      try {
        const updated = await workflowEngine.updateWorkflow(workflowId, updates);
        const index = workflows.value.findIndex(w => w.id === workflowId);
        if (index !== -1) {
          workflows.value[index] = updated;
        }
        if (currentWorkflow.value?.id === workflowId) {
          currentWorkflow.value = updated;
        }
        return updated;
      } catch (err) {
        error.value = err.message;
        throw err;
      } finally {
        isLoading.value = false;
      }
    };
    
    /**
     * Delete workflow
     * @param {string} workflowId - Workflow ID
     */
    const deleteWorkflow = async (workflowId) => {
      isLoading.value = true;
      error.value = null;
      
      try {
        await workflowEngine.deleteWorkflow(workflowId);
        workflows.value = workflows.value.filter(w => w.id !== workflowId);
        if (currentWorkflow.value?.id === workflowId) {
          currentWorkflow.value = null;
        }
      } catch (err) {
        error.value = err.message;
        throw err;
      } finally {
        isLoading.value = false;
      }
    };
    
    /**
     * Execute workflow
     * @param {string} workflowId - Workflow ID
     * @param {Object} payload - Execution payload
     * @returns {Promise<Object>} Execution result
     */
    const executeWorkflow = async (workflowId, payload) => {
      isLoading.value = true;
      error.value = null;
      
      try {
        const execution = await workflowEngine.executeWorkflow(workflowId, payload);
        executions.value.unshift(execution);
        return execution;
      } catch (err) {
        error.value = err.message;
        throw err;
      } finally {
        isLoading.value = false;
      }
    };
    
    /**
     * Load workflow executions
     * @param {string} workflowId - Workflow ID (optional)
     * @param {Object} options - Query options
     */
    const loadExecutions = async (workflowId = null, options = {}) => {
      isLoading.value = true;
      error.value = null;
      
      try {
        executions.value = await workflowEngine.listExecutions(workflowId, options);
      } catch (err) {
        error.value = err.message;
        console.error('[WorkflowStore] Failed to load executions:', err);
      } finally {
        isLoading.value = false;
      }
    };
    
    /**
     * Load triggers
     */
    const loadTriggers = async () => {
      try {
        triggers.value = await workflowEngine.listTriggers();
      } catch (err) {
        console.error('[WorkflowStore] Failed to load triggers:', err);
      }
    };
    
    /**
     * Clear store
     */
    const clear = () => {
      workflows.value = [];
      currentWorkflow.value = null;
      executions.value = [];
      triggers.value = [];
      isLoading.value = false;
      error.value = null;
      lastUpdated.value = null;
    };
    
    return {
      // State
      workflows,
      currentWorkflow,
      executions,
      triggers,
      isLoading,
      error,
      lastUpdated,
      
      // Computed
      activeWorkflows,
      recentExecutions,
      failedExecutions,
      executionStats,
      
      // Actions
      loadWorkflows,
      loadWorkflow,
      createWorkflow,
      updateWorkflow,
      deleteWorkflow,
      executeWorkflow,
      loadExecutions,
      loadTriggers,
      clear
    };
  })(pinia);
};
