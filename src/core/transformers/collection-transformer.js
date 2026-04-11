// src/core/transformers/collection-transformer.js
const TYPE_MAP = {
  'string': 'FIELD_TYPES.STRING',
  'number': 'FIELD_TYPES.NUMBER',
  'boolean': 'FIELD_TYPES.BOOLEAN',
  'timestamp': 'FIELD_TYPES.TIMESTAMP',
  'array': 'FIELD_TYPES.ARRAY',
  'object': 'FIELD_TYPES.OBJECT',
  'reference': 'FIELD_TYPES.REFERENCE'
};

export function transformCollection(collectionDef) {
  const transformed = { ...collectionDef };
  transformed.schema = {};
  
  for (const [field, config] of Object.entries(collectionDef.schema)) {
    transformed.schema[field] = {
      ...config,
      type: TYPE_MAP[config.type] || `FIELD_TYPES.${config.type.toUpperCase()}`
    };
  }
  
  return transformed;
}