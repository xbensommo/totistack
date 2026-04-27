/** @file src/features/notifications/services/createNotificationRecipientsService.js */

function asText(value) {
  return String(value ?? '').trim();
}

function normalizeRecipient(payload = {}) {
  const code =
    asText(payload.recipientCode)
    || asText(payload.staffCode)
    || asText(payload.code)
    || asText(payload.userId)
    || asText(payload.id)
    || null;

  if (!code) return null;

  return {
    recipientCode: code,
    userId: asText(payload.userId) || asText(payload.id) || null,
    recipientName:
      asText(payload.recipientName)
      || asText(payload.displayName)
      || [asText(payload.firstName), asText(payload.lastName)].filter(Boolean).join(' ').trim()
      || asText(payload.name)
      || asText(payload.email)
      || null,
    recipientEmail: asText(payload.recipientEmail) || asText(payload.email) || null,
    recipientRole: asText(payload.recipientRole) || asText(payload.role) || null,
    recipientType: asText(payload.recipientType) || 'staff',
  };
}

export function createNotificationRecipientsService(options = {}) {
  const currentUser = typeof options.currentUser === 'function' ? options.currentUser : () => null;
  const userDirectory = options.userDirectory || {};

  async function addRecipient(map, payload) {
    const normalized = normalizeRecipient(payload);
    if (!normalized?.recipientCode) return;
    map.set(normalized.recipientCode, normalized);
  }

  async function resolveRecipients(event, payload = {}) {
    const recipients = new Map();

    for (const target of payload.recipients || []) {
      await addRecipient(recipients, target);
    }

    for (const target of payload.recipientIds || []) {
      await addRecipient(recipients, { recipientCode: target, userId: target });
    }

    for (const target of payload.recipientCodes || []) {
      await addRecipient(recipients, { recipientCode: target });
    }

    if (payload.assigneeCode || payload.assigneeId) {
      await addRecipient(recipients, {
        recipientCode: payload.assigneeCode || payload.assignedStaffCode || payload.assigneeId,
        recipientName: payload.assigneeName || payload.assignedStaffName || null,
        recipientEmail: payload.assigneeEmail || payload.assignedStaffEmail || null,
        recipientRole: payload.assigneeRole || payload.assignedStaffRole || null,
      });
    }

    if (payload.userId || payload.recipientCode) {
      await addRecipient(recipients, payload);
    }

    if ((payload.notifyAdmins || event === 'system.alert' || payload.notifyFinanceTeam) && typeof userDirectory.listByRole === 'function') {
      const roles = ['admin'];
      if (payload.notifyFinanceTeam) roles.push('finance');
      for (const role of roles) {
        const entries = await userDirectory.listByRole(role);
        for (const entry of entries || []) {
          await addRecipient(recipients, entry);
        }
      }
    }

    const actor = currentUser();
    if (payload.includeActor && actor) {
      await addRecipient(recipients, actor);
    }

    return [...recipients.values()];
  }

  return {
    resolveRecipients,
  };
}

export default createNotificationRecipientsService;
