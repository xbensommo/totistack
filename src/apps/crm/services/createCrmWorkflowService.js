/**
 * @file src/apps/crm/services/createCrmWorkflowService.js
 * @description Action-modal aware CRM workflows with notification hooks.
 */

function actorId(actor) {
  return actor?.id || actor?.uid || null
}

function actorName(actor) {
  return actor?.displayName || actor?.email || 'System'
}

async function notify(services, event, payload = {}) {
  if (typeof services?.notifications?.handleEvent === 'function') {
    await services.notifications.handleEvent(event, payload)
  }
}

function requireMethod(target, methodName) {
  if (typeof target?.[methodName] !== 'function') {
    throw new Error(`CRM service is missing ${methodName}().`)
  }
}

export function createCrmWorkflowService({ crmService, notifications = null, confirm = null } = {}) {
  requireMethod(crmService, 'fetchLeadById')
  requireMethod(crmService, 'updateLead')
  requireMethod(crmService, 'convertLeadToOpportunity')
  requireMethod(crmService, 'createTask')
  requireMethod(crmService, 'completeTask')
  requireMethod(crmService, 'fetchTasks')

  const services = { notifications }

  async function assignLead(leadId, assignedTo, context = {}) {
    const lead = await crmService.fetchLeadById(leadId)
    if (!lead) throw new Error('Lead not found.')

    if (typeof confirm === 'function') {
      const accepted = await confirm({
        title: 'Assign lead',
        message: `Assign ${lead.fullName || lead.company || 'this lead'} to ${assignedTo || 'the selected owner'}?`,
        confirmText: 'Assign lead',
        cancelText: 'Cancel',
        variant: 'warning',
      })
      if (!accepted) return { status: 'cancelled', leadId }
    }

    const updated = await crmService.updateLead(leadId, {
      assignedTo,
      updatedAt: new Date(),
    })

    await notify(services, 'lead.assigned', {
      recipientId: assignedTo,
      actorId: actorId(context.actor),
      actorName: actorName(context.actor),
      entityId: leadId,
      entityType: 'crm_lead',
      entityLabel: updated?.fullName || updated?.company || lead?.fullName || lead?.company || 'Lead',
      actionUrl: context.actionUrl || `/crm/leads/${leadId}`,
      meta: { leadId, assignedTo },
    })

    return updated
  }

  async function convertLead(leadId, opportunityPayload = {}, context = {}) {
    const lead = await crmService.fetchLeadById(leadId)
    if (!lead) throw new Error('Lead not found.')

    if (typeof confirm === 'function') {
      const accepted = await confirm({
        title: 'Convert lead',
        message: `Convert ${lead.fullName || lead.company || 'this lead'} into an opportunity?`,
        confirmText: 'Convert lead',
        cancelText: 'Cancel',
        variant: 'warning',
      })
      if (!accepted) return { status: 'cancelled', leadId }
    }

    const opportunity = await crmService.convertLeadToOpportunity(leadId, opportunityPayload)
    await notify(services, 'lead.converted', {
      recipientIds: [lead.assignedTo].filter(Boolean),
      actorId: actorId(context.actor),
      actorName: actorName(context.actor),
      entityId: opportunity?.id || leadId,
      entityType: 'crm_opportunity',
      entityLabel: opportunity?.name || lead.fullName || lead.company || 'Opportunity',
      actionUrl: context.actionUrl || `/crm/opportunities/${opportunity?.id || ''}`,
      meta: { leadId, opportunityId: opportunity?.id || null },
    })
    return opportunity
  }

  async function createFollowUpTask(payload = {}, context = {}) {
    const task = await crmService.createTask(payload)
    await notify(services, 'crm.task.created', {
      recipientIds: [task?.assignedTo || payload?.assignedTo].filter(Boolean),
      actorId: actorId(context.actor),
      actorName: actorName(context.actor),
      entityId: task?.id || null,
      entityType: 'crm_task',
      entityLabel: task?.title || payload?.title || 'Task',
      actionUrl: context.actionUrl || `/crm/tasks/${task?.id || ''}`,
      meta: { taskId: task?.id || null },
    })
    return task
  }

  async function completeTask(taskId, context = {}) {
    const task = (await crmService.fetchTasks({ filters: [{ field: 'id', op: '==', value: taskId }] })).find((item) => item?.id === taskId)
    if (!task) throw new Error('Task not found.')

    if (typeof confirm === 'function') {
      const accepted = await confirm({
        title: 'Complete task',
        message: `Mark ${task.title || 'this task'} as completed?`,
        confirmText: 'Complete task',
        cancelText: 'Cancel',
        variant: 'success',
      })
      if (!accepted) return { status: 'cancelled', taskId }
    }

    const updated = await crmService.completeTask(taskId)
    await notify(services, 'crm.task.completed', {
      recipientIds: [task.assignedTo].filter(Boolean),
      actorId: actorId(context.actor),
      actorName: actorName(context.actor),
      entityId: taskId,
      entityType: 'crm_task',
      entityLabel: task.title || 'Task',
      actionUrl: context.actionUrl || `/crm/tasks/${taskId}`,
      meta: { taskId },
    })
    return updated
  }

  return {
    assignLead,
    convertLead,
    createFollowUpTask,
    completeTask,
  }
}

export default createCrmWorkflowService
