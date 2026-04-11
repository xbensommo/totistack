/**
 * Workflow Engine Service
 * @module features/workflow/services/workflowEngine
 * @description Core workflow execution engine with trigger-action pattern
 * @author Totistack Team
 * @date 2026-03-22
 */

import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
         query, where, orderBy, limit, Timestamp, writeBatch } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

/**
 * Workflow Engine Class
 */
export class WorkflowEngine {
  /** @type {Object} Firestore instance */
  #db = null;
  
  /** @type {Object} Auth service */
  #authService = null;
  
  /** @type {Object} Integration service */
  #integrationService = null;
  
  /** @type {Object} Configuration */
  #config = null;
  
  /** @type {boolean} Initialized flag */
  #initialized = false;
  
  /** @type {Map} Workflow cache */
  #cache = new Map();
  
  /** @type {Map} Active executions */
  #activeExecutions = new Map();
  
  constructor() {
    this.#db = getFirestore();
  }
  
  /**
   * Get singleton instance
   * @returns {WorkflowEngine} WorkflowEngine instance
   */
  static getInstance() {
    if (!globalThis.__workflowEngine) {
      globalThis.__workflowEngine = new WorkflowEngine();
    }
    return globalThis.__workflowEngine;
  }
  
  /**
   * Initialize workflow engine
   * @param {Object} config - Configuration
   * @param {Object} authService - Auth service
   * @param {Object} integrationService - Integration service
   * @returns {Promise<void>}
   */
  async initialize(config = {}, authService, integrationService) {
    if (this.#initialized) {
      return;
    }
    
    try {
      this.#authService = authService;
      this.#integrationService = integrationService;
      this.#config = {
        maxConcurrentExecutions: 10,
        executionTimeout: 300, // seconds
        enableAuditLog: true,
        ...config
      };
      
      this.#initialized = true;
      console.info('[WorkflowEngine] Initialized');
      
    } catch (error) {
      console.error('[WorkflowEngine] Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Create workflow
   * @param {Object} workflowData - Workflow definition
   * @returns {Promise<Object>} Created workflow
   */
  async createWorkflow(workflowData) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const workflowId = this.#generateId();
      const now = Timestamp.now();
      
      // Validate workflow structure
      this.#validateWorkflow(workflowData);
      
      const workflow = {
        id: workflowId,
        name: workflowData.name,
        description: workflowData.description,
        version: 1,
        isActive: workflowData.isActive ?? true,
        trigger: workflowData.trigger,
        actions: workflowData.actions,
        conditions: workflowData.conditions || [],
        variables: workflowData.variables || {},
        timeout: workflowData.timeout || this.#config.executionTimeout,
        retryPolicy: {
          maxRetries: workflowData.retryPolicy?.maxRetries || 3,
          retryDelay: workflowData.retryPolicy?.retryDelay || 5000,
          ...workflowData.retryPolicy
        },
        metadata: {
          createdBy: user.uid,
          updatedBy: user.uid,
          createdAt: now,
          updatedAt: now
        }
      };
      
      const workflowRef = doc(this.#db, 'workflows', workflowId);
      await setDoc(workflowRef, workflow);
      
      // Create trigger if applicable
      if (workflowData.trigger.type === 'webhook') {
        await this.#createWebhookTrigger(workflowId, workflowData.trigger);
      }
      
      this.#cache.set(workflowId, workflow);
      
      console.info(`[WorkflowEngine] Workflow created: ${workflow.name}`);
      
      return workflow;
      
    } catch (error) {
      console.error('[WorkflowEngine] Create workflow failed:', error);
      throw this.#normalizeError(error);
    }
  }
  
  /**
   * Get workflow by ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object|null>} Workflow definition
   */
  async getWorkflow(workflowId) {
    try {
      if (this.#cache.has(workflowId)) {
        return this.#cache.get(workflowId);
      }
      
      const workflowRef = doc(this.#db, 'workflows', workflowId);
      const workflowDoc = await getDoc(workflowRef);
      
      if (!workflowDoc.exists()) {
        return null;
      }
      
      const workflow = workflowDoc.data();
      this.#cache.set(workflowId, workflow);
      
      return workflow;
      
    } catch (error) {
      console.error('[WorkflowEngine] Get workflow failed:', error);
      throw error;
    }
  }
  
  /**
   * List workflows
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Workflow list
   */
  async listWorkflows(options = {}) {
    try {
      const { isActive = null, limit: pageSize = 50 } = options;
      
      let constraints = [orderBy('metadata.createdAt', 'desc')];
      
      if (isActive !== null) {
        constraints.unshift(where('isActive', '==', isActive));
      }
      
      constraints.push(limit(pageSize));
      
      const q = query(collection(this.#db, 'workflows'), ...constraints);
      const snapshot = await getDocs(q);
      
      const workflows = [];
      snapshot.forEach(doc => {
        workflows.push({ id: doc.id, ...doc.data() });
      });
      
      return workflows;
      
    } catch (error) {
      console.error('[WorkflowEngine] List workflows failed:', error);
      throw error;
    }
  }
  
  /**
   * Update workflow
   * @param {string} workflowId - Workflow ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated workflow
   */
  async updateWorkflow(workflowId, updates) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow) {
        throw new Error('WORKFLOW_NOT_FOUND');
      }
      
      const allowedUpdates = ['name', 'description', 'isActive', 'actions', 'conditions', 'variables', 'timeout', 'retryPolicy'];
      const filteredUpdates = {};
      
      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          filteredUpdates[key] = updates[key];
        }
      }
      
      filteredUpdates.version = (workflow.version || 0) + 1;
      filteredUpdates['metadata.updatedBy'] = user.uid;
      filteredUpdates['metadata.updatedAt'] = Timestamp.now();
      
      // Validate updated workflow
      const updatedWorkflow = { ...workflow, ...filteredUpdates };
      this.#validateWorkflow(updatedWorkflow);
      
      const workflowRef = doc(this.#db, 'workflows', workflowId);
      await updateDoc(workflowRef, filteredUpdates);
      
      // Update trigger if needed
      if (updates.trigger && updates.trigger.type === 'webhook') {
        await this.#updateWebhookTrigger(workflowId, updates.trigger);
      }
      
      this.#cache.delete(workflowId);
      
      console.info(`[WorkflowEngine] Workflow updated: ${workflow.name}`);
      
      return this.getWorkflow(workflowId);
      
    } catch (error) {
      console.error('[WorkflowEngine] Update workflow failed:', error);
      throw error;
    }
  }
  
  /**
   * Delete workflow
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<void>}
   */
  async deleteWorkflow(workflowId) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const workflowRef = doc(this.#db, 'workflows', workflowId);
      await deleteDoc(workflowRef);
      
      // Delete associated trigger
      const triggerRef = doc(this.#db, 'workflowTriggers', workflowId);
      await deleteDoc(triggerRef);
      
      this.#cache.delete(workflowId);
      
      console.info(`[WorkflowEngine] Workflow deleted: ${workflowId}`);
      
    } catch (error) {
      console.error('[WorkflowEngine] Delete workflow failed:', error);
      throw error;
    }
  }
  
  /**
   * Execute workflow
   * @param {string} workflowId - Workflow ID
   * @param {Object} payload - Execution payload
   * @returns {Promise<Object>} Execution result
   */
  async executeWorkflow(workflowId, payload) {
    try {
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow) {
        throw new Error('WORKFLOW_NOT_FOUND');
      }
      
      if (!workflow.isActive) {
        throw new Error('WORKFLOW_INACTIVE');
      }
      
      // Check concurrency limit
      const activeCount = Array.from(this.#activeExecutions.values())
        .filter(e => e.workflowId === workflowId && e.status === 'running').length;
      
      if (activeCount >= this.#config.maxConcurrentExecutions) {
        throw new Error('MAX_CONCURRENT_EXECUTIONS_REACHED');
      }
      
      // Create execution record
      const executionId = this.#generateExecutionId();
      const execution = {
        id: executionId,
        workflowId,
        workflowName: workflow.name,
        status: 'running',
        startedAt: Timestamp.now(),
        payload,
        context: {
          variables: { ...workflow.variables },
          attempts: 0
        },
        logs: []
      };
      
      this.#activeExecutions.set(executionId, execution);
      
      // Save execution to Firestore
      const executionRef = doc(this.#db, 'workflowExecutions', executionId);
      await setDoc(executionRef, execution);
      
      // Execute workflow asynchronously
      this.#executeWorkflowAsync(workflow, execution).catch(async (error) => {
        console.error(`[WorkflowEngine] Execution ${executionId} failed:`, error);
        await this.#finalizeExecution(executionId, 'failed', error.message);
      });
      
      return execution;
      
    } catch (error) {
      console.error('[WorkflowEngine] Execute workflow failed:', error);
      throw error;
    }
  }
  
  /**
   * Execute workflow asynchronously
   * @private
   * @param {Object} workflow - Workflow definition
   * @param {Object} execution - Execution record
   */
  async #executeWorkflowAsync(workflow, execution) {
    const executionId = execution.id;
    let currentIndex = 0;
    const actions = workflow.actions;
    
    try {
      // Process conditions
      if (workflow.conditions && workflow.conditions.length > 0) {
        const conditionsMet = await this.#evaluateConditions(workflow.conditions, execution.context);
        if (!conditionsMet) {
          await this.#finalizeExecution(executionId, 'skipped', 'Conditions not met');
          return;
        }
      }
      
      // Execute actions in sequence
      for (let i = 0; i < actions.length; i++) {
        currentIndex = i;
        const action = actions[i];
        
        await this.#executeAction(action, execution.context, execution);
        
        // Update execution progress
        const executionRef = doc(this.#db, 'workflowExecutions', executionId);
        await updateDoc(executionRef, {
          currentAction: action.id,
          progress: ((i + 1) / actions.length) * 100
        });
      }
      
      await this.#finalizeExecution(executionId, 'completed');
      
    } catch (error) {
      // Handle retry logic
      const retryPolicy = workflow.retryPolicy;
      const attempt = (execution.context.attempts || 0) + 1;
      
      if (attempt <= retryPolicy.maxRetries) {
        execution.context.attempts = attempt;
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryPolicy.retryDelay));
        
        // Retry from failed action
        await this.#executeAction(actions[currentIndex], execution.context, execution);
        
        // Continue with remaining actions
        for (let i = currentIndex + 1; i < actions.length; i++) {
          await this.#executeAction(actions[i], execution.context, execution);
        }
        
        await this.#finalizeExecution(executionId, 'completed');
      } else {
        await this.#finalizeExecution(executionId, 'failed', error.message);
      }
    }
  }
  
  /**
   * Execute single action
   * @private
   * @param {Object} action - Action definition
   * @param {Object} context - Execution context
   * @param {Object} execution - Execution record
   */
  async #executeAction(action, context, execution) {
    const startTime = Date.now();
    
    try {
      // Log action start
      await this.#logAction(execution.id, action.id, 'started');
      
      // Prepare input with variable substitution
      const input = this.#substituteVariables(action.input, context);
      
      // Execute based on action type
      let result;
      switch (action.type) {
        case 'http':
          result = await this.#executeHttpAction(action, input);
          break;
        case 'email':
          result = await this.#executeEmailAction(action, input);
          break;
        case 'condition':
          result = await this.#executeConditionAction(action, input);
          break;
        case 'delay':
          result = await this.#executeDelayAction(action, input);
          break;
        case 'webhook':
          result = await this.#executeWebhookAction(action, input);
          break;
        case 'database':
          result = await this.#executeDatabaseAction(action, input);
          break;
        case 'integration':
          result = await this.#executeIntegrationAction(action, input);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
      
      // Store result in context
      if (action.outputKey) {
        context.variables[action.outputKey] = result;
      }
      
      // Log action success
      await this.#logAction(execution.id, action.id, 'completed', {
        duration: Date.now() - startTime,
        result
      });
      
    } catch (error) {
      await this.#logAction(execution.id, action.id, 'failed', {
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }
  
  /**
   * Execute HTTP action
   * @private
   */
  async #executeHttpAction(action, input) {
    const response = await fetch(input.url, {
      method: action.method || 'GET',
      headers: action.headers || {},
      body: action.method !== 'GET' ? JSON.stringify(input.body) : undefined
    });
    
    return {
      status: response.status,
      data: await response.json()
    };
  }
  
  /**
   * Execute email action
   * @private
   */
  async #executeEmailAction(action, input) {
    const emailService = this.#integrationService?.getIntegration('sendgrid');
    if (!emailService) {
      throw new Error('Email service not configured');
    }
    
    return await emailService.send({
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text
    });
  }
  
  /**
   * Execute condition action
   * @private
   */
  async #executeConditionAction(action, input) {
    const { field, operator, value } = action.condition;
    const fieldValue = this.#getNestedValue(input, field);
    
    let result;
    switch (operator) {
      case 'eq':
        result = fieldValue === value;
        break;
      case 'neq':
        result = fieldValue !== value;
        break;
      case 'gt':
        result = fieldValue > value;
        break;
      case 'gte':
        result = fieldValue >= value;
        break;
      case 'lt':
        result = fieldValue < value;
        break;
      case 'lte':
        result = fieldValue <= value;
        break;
      case 'contains':
        result = String(fieldValue).includes(String(value));
        break;
      case 'regex':
        result = new RegExp(value).test(String(fieldValue));
        break;
      default:
        result = false;
    }
    
    if (!result && action.elseAction) {
      await this.#executeAction(action.elseAction, input, {});
    }
    
    return result;
  }
  
  /**
   * Execute delay action
   * @private
   */
  async #executeDelayAction(action, input) {
    const delayMs = (input.delay || action.delay || 1000);
    await new Promise(resolve => setTimeout(resolve, delayMs));
    return { delayed: delayMs };
  }
  
  /**
   * Execute webhook action
   * @private
   */
  async #executeWebhookAction(action, input) {
    const response = await fetch(input.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...action.headers
      },
      body: JSON.stringify(input.payload)
    });
    
    return {
      status: response.status,
      webhookId: action.webhookId
    };
  }
  
  /**
   * Execute database action
   * @private
   */
  async #executeDatabaseAction(action, input) {
    const collectionRef = collection(this.#db, input.collection);
    
    switch (action.operation) {
      case 'create':
        const docRef = doc(collectionRef);
        await setDoc(docRef, input.data);
        return { id: docRef.id };
        
      case 'update':
        const updateRef = doc(this.#db, input.collection, input.id);
        await updateDoc(updateRef, input.data);
        return { id: input.id };
        
      case 'delete':
        const deleteRef = doc(this.#db, input.collection, input.id);
        await deleteDoc(deleteRef);
        return { deleted: true };
        
      default:
        throw new Error(`Unknown database operation: ${action.operation}`);
    }
  }
  
  /**
   * Execute integration action
   * @private
   */
  async #executeIntegrationAction(action, input) {
    const integration = await this.#integrationService?.getIntegration(input.integrationId);
    if (!integration) {
      throw new Error(`Integration not found: ${input.integrationId}`);
    }
    
    return await integration.execute(action.integrationAction, input);
  }
  
  /**
   * Evaluate conditions
   * @private
   */
  async #evaluateConditions(conditions, context) {
    for (const condition of conditions) {
      const result = await this.#executeConditionAction({ condition }, context);
      if (!result) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Substitute variables in string
   * @private
   */
  #substituteVariables(input, context) {
    if (typeof input === 'string') {
      return input.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        return this.#getNestedValue(context.variables, path.trim()) || match;
      });
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.#substituteVariables(item, context));
    }
    
    if (typeof input === 'object' && input !== null) {
      const result = {};
      for (const [key, value] of Object.entries(input)) {
        result[key] = this.#substituteVariables(value, context);
      }
      return result;
    }
    
    return input;
  }
  
  /**
   * Get nested value by path
   * @private
   */
  #getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  /**
   * Log action execution
   * @private
   */
  async #logAction(executionId, actionId, status, metadata = {}) {
    if (!this.#config.enableAuditLog) return;
    
    const logRef = doc(collection(this.#db, 'workflowLogs'));
    await setDoc(logRef, {
      executionId,
      actionId,
      status,
      metadata,
      timestamp: Timestamp.now()
    });
  }
  
  /**
   * Finalize execution
   * @private
   */
  async #finalizeExecution(executionId, status, error = null) {
    const execution = this.#activeExecutions.get(executionId);
    if (!execution) return;
    
    execution.status = status;
    execution.completedAt = Timestamp.now();
    if (error) {
      execution.error = error;
    }
    
    const executionRef = doc(this.#db, 'workflowExecutions', executionId);
    await updateDoc(executionRef, {
      status,
      completedAt: execution.completedAt,
      error: error || null
    });
    
    this.#activeExecutions.delete(executionId);
    
    console.info(`[WorkflowEngine] Execution ${executionId} ${status}`);
  }
  
  /**
   * List executions
   * @param {string} workflowId - Workflow ID (optional)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Executions list
   */
  async listExecutions(workflowId = null, options = {}) {
    try {
      let constraints = [orderBy('startedAt', 'desc')];
      
      if (workflowId) {
        constraints.unshift(where('workflowId', '==', workflowId));
      }
      
      if (options.status) {
        constraints.unshift(where('status', '==', options.status));
      }
      
      constraints.push(limit(options.limit || 50));
      
      const q = query(collection(this.#db, 'workflowExecutions'), ...constraints);
      const snapshot = await getDocs(q);
      
      const executions = [];
      snapshot.forEach(doc => {
        executions.push({ id: doc.id, ...doc.data() });
      });
      
      return executions;
      
    } catch (error) {
      console.error('[WorkflowEngine] List executions failed:', error);
      throw error;
    }
  }
  
  /**
   * List triggers
   * @returns {Promise<Array>} Triggers list
   */
  async listTriggers() {
    try {
      const snapshot = await getDocs(collection(this.#db, 'workflowTriggers'));
      const triggers = [];
      snapshot.forEach(doc => {
        triggers.push({ id: doc.id, ...doc.data() });
      });
      return triggers;
    } catch (error) {
      console.error('[WorkflowEngine] List triggers failed:', error);
      return [];
    }
  }
  
  /**
   * Create webhook trigger
   * @private
   */
  async #createWebhookTrigger(workflowId, triggerConfig) {
    const trigger = {
      id: workflowId,
      workflowId,
      type: 'webhook',
      endpoint: `/webhooks/workflow/${workflowId}`,
      secret: this.#generateWebhookSecret(),
      isActive: true,
      createdAt: Timestamp.now()
    };
    
    const triggerRef = doc(this.#db, 'workflowTriggers', workflowId);
    await setDoc(triggerRef, trigger);
    
    return trigger;
  }
  
  /**
   * Update webhook trigger
   * @private
   */
  async #updateWebhookTrigger(workflowId, triggerConfig) {
    const triggerRef = doc(this.#db, 'workflowTriggers', workflowId);
    await updateDoc(triggerRef, {
      isActive: triggerConfig.isActive,
      updatedAt: Timestamp.now()
    });
  }
  
  /**
   * Validate workflow structure
   * @private
   */
  #validateWorkflow(workflow) {
    if (!workflow.name) {
      throw new Error('Workflow name is required');
    }
    
    if (!workflow.trigger || !workflow.trigger.type) {
      throw new Error('Workflow trigger is required');
    }
    
    if (!workflow.actions || workflow.actions.length === 0) {
      throw new Error('Workflow must have at least one action');
    }
    
    for (const action of workflow.actions) {
      if (!action.id || !action.type) {
        throw new Error('Each action must have id and type');
      }
    }
  }
  
  /**
   * Generate unique ID
   * @private
   */
  #generateId() {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Generate execution ID
   * @private
   */
  #generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Generate webhook secret
   * @private
   */
  #generateWebhookSecret() {
    return Math.random().toString(36).substr(2, 32);
  }
  
  /**
   * Normalize error messages
   * @private
   */
  #normalizeError(error) {
    const errorMap = {
      'AUTH_REQUIRED': 'Authentication required',
      'WORKFLOW_NOT_FOUND': 'Workflow not found',
      'WORKFLOW_INACTIVE': 'Workflow is inactive',
      'MAX_CONCURRENT_EXECUTIONS_REACHED': 'Maximum concurrent executions reached',
      'INVALID_WORKFLOW_STRUCTURE': 'Invalid workflow structure'
    };
    
    const message = errorMap[error.message] || error.message || 'WORKFLOW_ERROR';
    const normalizedError = new Error(message);
    normalizedError.originalError = error;
    
    return normalizedError;
  }
}

const workflowEngine = WorkflowEngine.getInstance();
export default workflowEngine;