/** @file src/features/notifications/runtime/register-notifications.js */

import notificationEventRegistry from '../constants/notification.events.js';
import { createNotificationDispatcher } from '../services/createNotificationDispatcher.js';
import { createNotificationOrchestrator } from '../services/createNotificationOrchestrator.js';
import { createNotificationRecipientsService } from '../services/createNotificationRecipientsService.js';
import { createNotificationRepository } from '../services/createNotificationRepository.js';
import { createNotificationTemplateService } from '../services/createNotificationTemplateService.js';
import { createDomainEventBus } from './createDomainEventBus.js';
import { registerNotificationHooks } from './notification-hooks.js';

function registerService(target, key, value) {
  if (!target) return;
  if (typeof target.set === 'function') {
    target.set(key, value);
    return;
  }
  target[key] = value;
}

export function registerNotificationsFeature(options = {}) {
  const eventBus = options.eventBus || createDomainEventBus();
  const repository = createNotificationRepository({ provider: options.shardProvider });
  const templateService = createNotificationTemplateService();
  const recipientsService = createNotificationRecipientsService({
    currentUser: options.currentUser,
    userDirectory: options.userDirectory,
  });
  const dispatcher = createNotificationDispatcher({
    repository,
    channels: options.channels,
  });
  const orchestrator = createNotificationOrchestrator({
    dispatcher,
    templateService,
    recipientsService,
    repository,
    eventRegistry: notificationEventRegistry,
  });

  const hooks = registerNotificationHooks({
    eventBus,
    orchestrator,
    eventNames: Object.keys(notificationEventRegistry),
  });

  const notificationsService = {
    createNotification: orchestrator.createNotification,
    sendNotification: orchestrator.sendNotification,
    notify: orchestrator.notify,
    publishEvent: (event, payload = {}) => eventBus.emit(event, payload),
    listNotifications: repository.listNotifications,
    listLogs: repository.listLogs,
    listTemplates: repository.listTemplates,
    getPreferences: repository.getPreferences,
    savePreferences: repository.upsertPreferences,
    markRead: repository.markRead,
    markAllRead: repository.markAllRead,
    archiveNotification: repository.archiveNotification,
    repository,
    orchestrator,
    dispatcher,
    eventBus,
  };

  options.app?.provide?.('notifications:eventBus', eventBus);
  options.app?.provide?.('notifications:repository', repository);
  options.app?.provide?.('notifications:orchestrator', orchestrator);
  options.app?.provide?.('notifications:service', notificationsService);

  registerService(options.serviceRegistry, 'notifications:eventBus', eventBus);
  registerService(options.serviceRegistry, 'notifications:repository', repository);
  registerService(options.serviceRegistry, 'notifications:orchestrator', orchestrator);
  registerService(options.serviceRegistry, 'notifications:dispatcher', dispatcher);
  registerService(options.serviceRegistry, 'notifications', notificationsService);

  return {
    eventBus,
    repository,
    orchestrator,
    dispatcher,
    notificationsService,
    hooks,
  };
}

export default registerNotificationsFeature;
