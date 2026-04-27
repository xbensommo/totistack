/** @file functions/src/runtime/options.js */

export const FUNCTION_RUNTIME = Object.freeze({
  region: process.env.FUNCTION_REGION || 'europe-west1',
  maxInstances: Number(process.env.FUNCTION_MAX_INSTANCES || 10),
  callable: Object.freeze({
    region: process.env.FUNCTION_REGION || 'europe-west1',
    timeoutSeconds: 60,
    memory: '256MiB',
    maxInstances: Number(process.env.FUNCTION_MAX_INSTANCES || 10),
    enforceAppCheck: process.env.FUNCTIONS_ENFORCE_APP_CHECK === 'true',
  }),
  event: Object.freeze({
    region: process.env.FUNCTION_REGION || 'europe-west1',
    timeoutSeconds: 60,
    memory: '256MiB',
    maxInstances: Number(process.env.FUNCTION_EVENT_MAX_INSTANCES || 5),
    retry: false,
  }),
  scheduled: Object.freeze({
    region: process.env.FUNCTION_REGION || 'europe-west1',
    timeoutSeconds: 120,
    memory: '256MiB',
    maxInstances: 1,
    retryCount: 0,
  }),
})
