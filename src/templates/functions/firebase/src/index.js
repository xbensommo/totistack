/** @file functions/src/index.js */

import { setGlobalOptions } from 'firebase-functions/v2'
import { onCall } from 'firebase-functions/v2/https'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'

import { FUNCTION_RUNTIME } from './runtime/options.js'
import { serverActionRegistry } from './generated/server-actions.registry.js'
import { runServerAction } from './server-actions/runServerAction.js'
import { registerNotificationToken, revokeNotificationToken } from './notifications/tokenFunctions.js'
import { onNotificationCreated } from './notifications/onNotificationCreated.js'
import { retryFailedDeliveries } from './notifications/retryFailedDeliveries.js'
import { cleanupStaleTokens } from './notifications/cleanupStaleTokens.js'

setGlobalOptions({
  region: FUNCTION_RUNTIME.region,
  maxInstances: FUNCTION_RUNTIME.maxInstances,
})

export const serverActionRun = onCall(
  FUNCTION_RUNTIME.callable,
  (request) => runServerAction(request, serverActionRegistry),
)

export const notificationRegisterToken = onCall(
  FUNCTION_RUNTIME.callable,
  registerNotificationToken,
)

export const notificationRevokeToken = onCall(
  FUNCTION_RUNTIME.callable,
  revokeNotificationToken,
)

export const notificationsOnCreate = onDocumentCreated(
  {
    ...FUNCTION_RUNTIME.event,
    document: 'notifications/{notificationId}',
  },
  onNotificationCreated,
)

export const notificationRetryFailedDeliveries = onSchedule(
  {
    ...FUNCTION_RUNTIME.scheduled,
    schedule: 'every 15 minutes',
  },
  retryFailedDeliveries,
)

export const notificationCleanupTokens = onSchedule(
  {
    ...FUNCTION_RUNTIME.scheduled,
    schedule: 'every 24 hours',
  },
  cleanupStaleTokens,
)

export * from './generated/functions.generated.js'
