/**
 * @file collection-validator.js
 * @description Validates collection definitions with comprehensive checks
 * @date 2026-03-22
 * @author Totistack Team
 */

import { ValidationError } from '../errors/index.js';

/**
 * Field type validation patterns
 */
const FIELD_TYPES = [
  'string', 'number', 'boolean', 'date', 'timestamp', 
  'reference', 'array', 'object', 'geopoint', 'file'
];

/**
 * Validate a collection definition
 * @param {object} def - Collection definition
 * @returns {boolean} True if valid
 * @throws {ValidationError}
 */
export function validateCollectionDefinition(def) {
  if (!def || typeof def !== 'object') {
    throw new ValidationError('Collection definition must be an object');
  }
  
  // Required fields
  if (!def.name || typeof def.name !== 'string') {
    throw new ValidationError('Collection name is required and must be a string');
  }
  
  if (!def.name.match(/^[a-z][a-z0-9_]*$/i)) {
    throw new ValidationError('Collection name must be alphanumeric and start with a letter');
  }
  
  // Validate fields
  if (def.fields && typeof def.fields === 'object') {
    validateFields(def.fields);
  }
  
  // Validate indexes
  if (def.indexes && Array.isArray(def.indexes)) {
    validateIndexes(def.indexes);
  }
  
  // Validate provider
  if (def.provider && !['firestore', 'realtime', 'local'].includes(def.provider)) {
    throw new ValidationError(`Invalid provider: ${def.provider}`);
  }
  
  // Validate hooks if present
  if (def.hooks && typeof def.hooks === 'object') {
    validateHooks(def.hooks);
  }
  
  return true;
}

/**
 * Validate field definitions
 * @param {object} fields - Field definitions
 * @throws {ValidationError}
 */
function validateFields(fields) {
  for (const [fieldName, fieldDef] of Object.entries(fields)) {
    if (!fieldDef.type || !FIELD_TYPES.includes(fieldDef.type)) {
      throw new ValidationError(`Field ${fieldName}: invalid type '${fieldDef.type}'`);
    }
    
    if (fieldDef.required && typeof fieldDef.required !== 'boolean') {
      throw new ValidationError(`Field ${fieldName}: required must be boolean`);
    }
    
    if (fieldDef.unique && typeof fieldDef.unique !== 'boolean') {
      throw new ValidationError(`Field ${fieldName}: unique must be boolean`);
    }
    
    if (fieldDef.type === 'reference') {
      if (!fieldDef.ref || typeof fieldDef.ref !== 'string') {
        throw new ValidationError(`Field ${fieldName}: reference requires 'ref' property`);
      }
    }
  }
}

/**
 * Validate index definitions
 * @param {Array} indexes - Index definitions
 * @throws {ValidationError}
 */
function validateIndexes(indexes) {
  for (const index of indexes) {
    if (!index.fields || !Array.isArray(index.fields)) {
      throw new ValidationError('Index must have fields array');
    }
    
    if (index.unique && typeof index.unique !== 'boolean') {
      throw new ValidationError('Index unique must be boolean');
    }
  }
}

/**
 * Validate hook functions
 * @param {object} hooks - Hook definitions
 * @throws {ValidationError}
 */
function validateHooks(hooks) {
  const validHooks = ['beforeCreate', 'afterCreate', 'beforeUpdate', 'afterUpdate', 'beforeDelete', 'afterDelete'];
  
  for (const [hookName, hookFn] of Object.entries(hooks)) {
    if (!validHooks.includes(hookName)) {
      throw new ValidationError(`Invalid hook name: ${hookName}`);
    }
    
    if (typeof hookFn !== 'function') {
      throw new ValidationError(`Hook ${hookName} must be a function`);
    }
  }
}