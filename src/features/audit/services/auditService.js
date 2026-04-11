/**
 * Audit Service
 * @module features/audit/services/auditService
 * @description Enterprise audit logging with security monitoring
 * @author Microsoft Engineering Team
 * @date 2026-03-22
 */

import { Timestamp } from 'firebase/firestore';
import { getFriendlyMessage } from '@xbensommo/shard-provider';

export class AuditService {
  /** @type {Object} Shard provider */
  #provider = null;
  
  /** @type {Object} Auth service */
  #authService = null;
  
  /** @type {Object} RBAC service */
  #rbacService = null;
  
  /** @type {Object} Configuration */
  #config = null;
  
  /** @type {boolean} Initialized flag */
  #initialized = false;
  
  /** @type {Array} Log queue for batch processing */
  #logQueue = [];
  
  /** @type {number} Flush interval */
  #flushInterval = null;
  
  /**
   * Get singleton instance
   * @returns {AuditService}
   */
  static getInstance() {
    if (!globalThis.__auditService) {
      globalThis.__auditService = new AuditService();
    }
    return globalThis.__auditService;
  }
  
  /**
   * Initialize audit service
   * @param {Object} config - Configuration
   * @param {Object} authService - Auth service
   * @param {Object} rbacService - RBAC service
   * @param {Object} provider - Shard provider
   * @returns {Promise<void>}
   */
  async initialize(config = {}, authService, rbacService, provider) {
    if (this.#initialized) return;
    
    try {
      this.#provider = provider;
      this.#authService = authService;
      this.#rbacService = rbacService;
      this.#config = {
        logAllActions: true,
        logSensitiveActions: true,
        excludeHealthChecks: true,
        asyncLogging: true,
        retentionDays: 365,
        sensitiveFields: ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn'],
        ...config
      };
      
      // Start batch flush interval
      if (this.#config.asyncLogging) {
        this.#flushInterval = setInterval(() => this.#flushLogs(), 5000);
      }
      
      this.#initialized = true;
      console.info('[AuditService] Initialized');
      
    } catch (error) {
      console.error('[AuditService] Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Log an action
   * @param {Object} logData - Log data
   * @returns {Promise<Object>} Created log entry
   */
  async log(logData) {
    try {
      // Skip health checks if configured
      if (this.#config.excludeHealthChecks && logData.action === 'health_check') {
        return null;
      }
      
      const user = this.#authService.getCurrentUser();
      const now = Timestamp.now();
      
      // Get user role
      let userRole = null;
      if (user) {
        const roles = await this.#rbacService.getUserRoles(user.uid);
        userRole = roles[0]?.id || null;
      }
      
      // Redact sensitive data
      const redactedOldValue = this.#redactSensitiveData(logData.oldValue);
      const redactedNewValue = this.#redactSensitiveData(logData.newValue);
      
      const logEntry = {
        id: this.#generateId('audit'),
        timestamp: now,
        userId: user?.uid || logData.userId || 'system',
        userEmail: user?.email || logData.userEmail,
        userRole,
        ipAddress: logData.ipAddress || this.#getClientIp(),
        userAgent: logData.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : null),
        action: logData.action,
        resource: logData.resource,
        resourceId: logData.resourceId,
        oldValue: redactedOldValue,
        newValue: redactedNewValue,
        changes: logData.changes || this.#calculateChanges(redactedOldValue, redactedNewValue),
        status: logData.status || 'success',
        errorCode: logData.errorCode,
        errorMessage: logData.errorMessage,
        severity: this.#calculateSeverity(logData),
        metadata: logData.metadata || {},
        requestId: logData.requestId || this.#generateRequestId(),
        sessionId: logData.sessionId || this.#getSessionId()
      };
      
      if (this.#config.asyncLogging) {
        this.#logQueue.push(logEntry);
        return { id: logEntry.id, queued: true };
      } else {
        const result = await this.#provider.create('auditLogs', logEntry);
        return { ...logEntry, id: result.id };
      }
      
    } catch (error) {
      console.error('[AuditService] Log failed:', error);
      // Don't throw - audit logging should not break the application
      return null;
    }
  }
  
  /**
   * Log user login
   * @param {string} email - User email
   * @param {boolean} success - Whether login succeeded
   * @param {string} errorMessage - Error message if failed
   * @returns {Promise<void>}
   */
  async logLogin(email, success, errorMessage = null) {
    await this.log({
      action: 'login',
      resource: 'auth',
      resourceId: email,
      status: success ? 'success' : 'failure',
      errorMessage,
      severity: success ? 'info' : 'warning',
      metadata: { loginMethod: 'email_password' }
    });
  }
  
  /**
   * Log logout
   * @returns {Promise<void>}
   */
  async logLogout() {
    await this.log({
      action: 'logout',
      resource: 'auth',
      status: 'success',
      severity: 'info'
    });
  }
  
  /**
   * Log data access
   * @param {string} resource - Resource type
   * @param {string} resourceId - Resource ID
   * @param {string} operation - Access operation (read, write, delete)
   * @returns {Promise<void>}
   */
  async logDataAccess(resource, resourceId, operation) {
    await this.log({
      action: `data_${operation}`,
      resource,
      resourceId,
      severity: operation === 'delete' ? 'warning' : 'info',
      metadata: { operation }
    });
  }
  
  /**
   * Log permission change
   * @param {string} userId - Target user ID
   * @param {Object} oldPermissions - Old permissions
   * @param {Object} newPermissions - New permissions
   * @returns {Promise<void>}
   */
  async logPermissionChange(userId, oldPermissions, newPermissions) {
    await this.log({
      action: 'permission_change',
      resource: 'rbac',
      resourceId: userId,
      oldValue: oldPermissions,
      newValue: newPermissions,
      severity: 'warning',
      metadata: { targetUser: userId }
    });
  }
  
  /**
   * Log security event
   * @param {string} event - Security event type
   * @param {Object} details - Event details
   * @returns {Promise<void>}
   */
  async logSecurityEvent(event, details = {}) {
    await this.log({
      action: `security_${event}`,
      resource: 'security',
      severity: 'critical',
      metadata: details,
      status: 'success'
    });
  }
  
  /**
   * Query audit logs
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Audit logs
   */
  async queryLogs(options = {}) {
    try {
      const {
        userId = null,
        action = null,
        resource = null,
        severity = null,
        startDate = null,
        endDate = null,
        limit = 100,
        startAfter = null
      } = options;
      
      const filters = [];
      
      if (userId) filters.push({ field: 'userId', operator: '==', value: userId });
      if (action) filters.push({ field: 'action', operator: '==', value: action });
      if (resource) filters.push({ field: 'resource', operator: '==', value: resource });
      if (severity) filters.push({ field: 'severity', operator: '==', value: severity });
      if (startDate) filters.push({ field: 'timestamp', operator: '>=', value: Timestamp.fromDate(startDate) });
      if (endDate) filters.push({ field: 'timestamp', operator: '<=', value: Timestamp.fromDate(endDate) });
      
      const result = await this.#provider.query('auditLogs', {
        filters,
        orderBy: [{ field: 'timestamp', direction: 'desc' }],
        limit,
        startAfter
      });
      
      return result;
      
    } catch (error) {
      console.error('[AuditService] Query logs failed:', error);
      throw error;
    }
  }
  
  /**
   * Get user activity summary
   * @param {string} userId - User ID
   * @param {number} days - Number of days
   * @returns {Promise<Object>} Activity summary
   */
  async getUserActivitySummary(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const result = await this.queryLogs({
        userId,
        startDate,
        limit: 1000
      });
      
      const summary = {
        totalActions: result.items.length,
        actionsByType: {},
        actionsByDay: {},
        uniqueResources: new Set(),
        lastActivity: null,
        firstActivity: null
      };
      
      for (const log of result.items) {
        // Count by action type
        summary.actionsByType[log.action] = (summary.actionsByType[log.action] || 0) + 1;
        
        // Count by day
        const day = log.timestamp.toDate().toISOString().split('T')[0];
        summary.actionsByDay[day] = (summary.actionsByDay[day] || 0) + 1;
        
        // Unique resources
        summary.uniqueResources.add(`${log.resource}:${log.resourceId}`);
        
        // Track activity range
        const logDate = log.timestamp.toDate();
        if (!summary.firstActivity || logDate < summary.firstActivity) summary.firstActivity = logDate;
        if (!summary.lastActivity || logDate > summary.lastActivity) summary.lastActivity = logDate;
      }
      
      return summary;
      
    } catch (error) {
      console.error('[AuditService] Get user activity summary failed:', error);
      return null;
    }
  }
  
  /**
   * Export audit logs
   * @param {Object} options - Export options
   * @returns {Promise<Object>} Export result
   */
  async exportLogs(options = {}) {
    try {
      const { format = 'json', startDate, endDate, userId, action } = options;
      
      const logs = await this.queryLogs({
        userId,
        action,
        startDate,
        endDate,
        limit: 10000
      });
      
      let data;
      let mimeType;
      
      if (format === 'json') {
        data = JSON.stringify(logs.items, null, 2);
        mimeType = 'application/json';
      } else if (format === 'csv') {
        data = this.#convertToCSV(logs.items);
        mimeType = 'text/csv';
      }
      
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      return {
        url,
        filename: `audit_logs_${Date.now()}.${format}`,
        recordCount: logs.items.length,
        size: data.length
      };
      
    } catch (error) {
      console.error('[AuditService] Export logs failed:', error);
      throw error;
    }
  }
  
  /**
   * Flush logs to database
   * @private
   */
  async #flushLogs() {
    if (this.#logQueue.length === 0) return;
    
    const logs = [...this.#logQueue];
    this.#logQueue = [];
    
    try {
      const batch = [];
      for (const log of logs) {
        batch.push(this.#provider.create('auditLogs', log));
      }
      await Promise.all(batch);
      console.debug(`[AuditService] Flushed ${logs.length} logs`);
    } catch (error) {
      console.error('[AuditService] Flush failed:', error);
      // Re-queue logs on failure
      this.#logQueue.unshift(...logs);
    }
  }
  
  /**
   * Redact sensitive data
   * @private
   */
  #redactSensitiveData(data) {
    if (!data || typeof data !== 'object') return data;
    
    const redacted = { ...data };
    
    for (const field of this.#config.sensitiveFields) {
      if (redacted[field]) {
        redacted[field] = '[REDACTED]';
      }
    }
    
    return redacted;
  }
  
  /**
   * Calculate changes between old and new values
   * @private
   */
  #calculateChanges(oldValue, newValue) {
    if (!oldValue || !newValue) return [];
    
    const changes = [];
    const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);
    
    for (const key of allKeys) {
      const oldVal = oldValue[key];
      const newVal = newValue[key];
      
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: key,
          oldValue: oldVal,
          newValue: newVal
        });
      }
    }
    
    return changes;
  }
  
  /**
   * Calculate severity based on action and status
   * @private
   */
  #calculateSeverity(logData) {
    if (logData.severity) return logData.severity;
    
    const criticalActions = ['delete', 'purge', 'drop', 'truncate'];
    const warningActions = ['update', 'modify', 'change'];
    
    if (logData.status === 'failure') return 'error';
    if (criticalActions.some(a => logData.action?.includes(a))) return 'critical';
    if (warningActions.some(a => logData.action?.includes(a))) return 'warning';
    
    return 'info';
  }
  
  /**
   * Get client IP address
   * @private
   */
  #getClientIp() {
    // In server context, this would come from request
    return null;
  }
  
  /**
   * Get session ID
   * @private
   */
  #getSessionId() {
    if (typeof sessionStorage !== 'undefined') {
      let sessionId = sessionStorage.getItem('audit_session_id');
      if (!sessionId) {
        sessionId = this.#generateRequestId();
        sessionStorage.setItem('audit_session_id', sessionId);
      }
      return sessionId;
    }
    return null;
  }
  
  /**
   * Generate request ID
   * @private
   */
  #generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Convert logs to CSV
   * @private
   */
  #convertToCSV(logs) {
    if (logs.length === 0) return '';
    
    const headers = ['timestamp', 'userId', 'userEmail', 'action', 'resource', 'resourceId', 'status', 'severity'];
    const rows = logs.map(log => {
      return headers.map(h => {
        let value = log[h];
        if (value && typeof value === 'object') {
          value = JSON.stringify(value);
        }
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(',');
    });
    
    return [headers.join(','), ...rows].join('\n');
  }
  
  /**
   * Generate unique ID
   * @private
   */
  #generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    if (this.#flushInterval) {
      clearInterval(this.#flushInterval);
      this.#flushLogs();
    }
  }
}

const auditService = AuditService.getInstance();
export default auditService;
