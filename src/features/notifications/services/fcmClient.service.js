/** @file src/features/notifications/services/fcmClient.service.js */

import { httpsCallable } from 'firebase/functions'
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging'

export async function createFcmClient({ firebaseApp, functions, vapidKey, registerCallableName = 'notificationRegisterToken' } = {}) {
  if (!firebaseApp) throw new Error('createFcmClient requires firebaseApp.')
  if (!functions) throw new Error('createFcmClient requires Firebase Functions instance.')
  if (!vapidKey) throw new Error('createFcmClient requires a Web Push VAPID key.')

  const supported = await isSupported()
  if (!supported) {
    return {
      supported: false,
      async start() {
        return { ok: false, reason: 'messaging-not-supported' }
      },
      onForegroundMessage() {
        return () => {}
      },
    }
  }

  const messaging = getMessaging(firebaseApp)
  const registerToken = httpsCallable(functions, registerCallableName)

  return {
    supported: true,

    async start({ deviceLabel = 'Web browser', platform = 'web', browser = globalThis.navigator?.userAgent || 'unknown' } = {}) {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        return { ok: false, reason: 'permission-denied' }
      }

      const token = await getToken(messaging, { vapidKey })
      if (!token) {
        return { ok: false, reason: 'missing-token' }
      }

      await registerToken({ token, platform, browser, deviceLabel })
      return { ok: true, token }
    },

    onForegroundMessage(callback) {
      if (typeof callback !== 'function') {
        throw new Error('onForegroundMessage requires a callback.')
      }
      return onMessage(messaging, callback)
    },
  }
}

export default createFcmClient
