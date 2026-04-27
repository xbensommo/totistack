/** @file src/features/notifications/services/createNotificationDispatcher.js */

import { NOTIFICATION_CHANNELS } from '../constants/notification.channels.js';
import { NOTIFICATION_STATUSES } from '../constants/notification.statuses.js';

export function createNotificationDispatcher(options) {
  const repository = options?.repository;
  const channels = {
    [NOTIFICATION_CHANNELS.IN_APP]: {
      async send(payload) {
        return { ok: true, provider: 'database', payload };
      },
    },
    [NOTIFICATION_CHANNELS.EMAIL]: {
      async send(payload) {
        if (!options?.channels?.email?.send) return { ok: false, provider: 'email', error: 'EMAIL_ADAPTER_NOT_CONFIGURED' };
        return options.channels.email.send(payload);
      },
    },
    [NOTIFICATION_CHANNELS.WHATSAPP]: {
      async send(payload) {
        if (!options?.channels?.whatsapp?.send) return { ok: false, provider: 'whatsapp', error: 'WHATSAPP_ADAPTER_NOT_CONFIGURED' };
        return options.channels.whatsapp.send(payload);
      },
    },
    ...options?.channels,
  };

  async function dispatch(payload) {
    const deliveries = [];
    const channelsToUse = payload.channels?.length ? payload.channels : [NOTIFICATION_CHANNELS.IN_APP];
    const notificationId = payload.id;

    let notificationRecord = null;

    if (channelsToUse.includes(NOTIFICATION_CHANNELS.IN_APP) || channelsToUse.length === 1) {
      notificationRecord = await repository.saveNotification({
        ...payload,
        id: notificationId,
        channel: channelsToUse.includes(NOTIFICATION_CHANNELS.IN_APP) ? NOTIFICATION_CHANNELS.IN_APP : channelsToUse[0],
        status: NOTIFICATION_STATUSES.PENDING,
        createdAt: payload.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    for (const channelName of channelsToUse) {
      const adapter = channels[channelName];

      if (!adapter?.send) {
        const failedResult = {
          ok: false,
          notificationId,
          provider: channelName,
          error: 'CHANNEL_ADAPTER_NOT_FOUND',
        };

        await repository.saveLog({
          notificationId,
          recipientCode: payload.recipientCode,
          recipientEmail: payload.recipientEmail || null,
          recipientRole: payload.recipientRole || null,
          userId: payload.userId || null,
          channel: channelName,
          provider: channelName,
          status: NOTIFICATION_STATUSES.FAILED,
          sourceApp: payload.sourceApp || null,
          sourceModule: payload.sourceModule || null,
          sourceRef: payload.sourceRef || null,
          error: failedResult.error,
          payload,
          response: failedResult,
          createdAt: new Date().toISOString(),
        });

        deliveries.push({ ...failedResult, channel: channelName, status: NOTIFICATION_STATUSES.FAILED });
        continue;
      }

      const result = await adapter.send({
        ...payload,
        channel: channelName,
        notificationId,
      });

      const status = result?.ok ? NOTIFICATION_STATUSES.SENT : NOTIFICATION_STATUSES.FAILED;

      await repository.saveLog({
        notificationId,
        recipientCode: payload.recipientCode,
        recipientEmail: payload.recipientEmail || null,
        recipientRole: payload.recipientRole || null,
        userId: payload.userId || null,
        channel: channelName,
        provider: result?.provider || channelName,
        status,
        sourceApp: payload.sourceApp || null,
        sourceModule: payload.sourceModule || null,
        sourceRef: payload.sourceRef || null,
        error: result?.error || null,
        payload,
        response: result || null,
        sentAt: result?.ok ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
      });

      deliveries.push({
        ...result,
        notificationId,
        channel: channelName,
        status,
      });
    }

    if (notificationRecord?.id && typeof repository.updateNotification === 'function') {
      const hasFailure = deliveries.some((item) => item.status === NOTIFICATION_STATUSES.FAILED);
      const hasSuccess = deliveries.some((item) => item.status === NOTIFICATION_STATUSES.SENT);

      await repository.updateNotification(notificationRecord.id, {
        status: hasSuccess ? NOTIFICATION_STATUSES.SENT : NOTIFICATION_STATUSES.FAILED,
        updatedAt: new Date().toISOString(),
        meta: {
          ...(payload.meta || {}),
          deliveries: deliveries.map((item) => ({
            channel: item.channel,
            status: item.status,
            provider: item.provider || null,
            error: item.error || null,
          })),
          hasFailure,
        },
      });
    }

    return deliveries;
  }

  return {
    dispatch,
  };
}

export default createNotificationDispatcher;
