/** @file src/apps/crm/crm.actions.js */

import { CRM_PERMISSIONS } from './permissions.js'

export function createCrmActionDefinitions() {
  return [
    {
      type: 'crm.lead.assign',
      permission: CRM_PERMISSIONS.LEADS_ASSIGN,
      confirm(context) {
        return {
          title: 'Assign lead',
          message: `Assign ${context?.target?.fullName || context?.target?.company || 'this lead'} to ${context?.payload?.assignedTo || 'the selected owner'}?`,
          confirmText: 'Assign lead',
          cancelText: 'Cancel',
          variant: 'warning',
        }
      },
      async run(context) {
        if (typeof context?.services?.crmWorkflow?.assignLead !== 'function') {
          throw new Error('crmWorkflow.assignLead() is not configured.')
        }
        return context.services.crmWorkflow.assignLead(context.target.id, context.payload.assignedTo, context)
      },
    },
    {
      type: 'crm.lead.convert',
      permission: CRM_PERMISSIONS.LEADS_CONVERT,
      confirm(context) {
        return {
          title: 'Convert lead',
          message: `Convert ${context?.target?.fullName || context?.target?.company || 'this lead'} into an opportunity?`,
          confirmText: 'Convert lead',
          cancelText: 'Cancel',
          variant: 'warning',
        }
      },
      async run(context) {
        if (typeof context?.services?.crmWorkflow?.convertLead !== 'function') {
          throw new Error('crmWorkflow.convertLead() is not configured.')
        }
        return context.services.crmWorkflow.convertLead(context.target.id, context.payload || {}, context)
      },
    },
    {
      type: 'crm.task.complete',
      permission: CRM_PERMISSIONS.TASKS_COMPLETE,
      confirm(context) {
        return {
          title: 'Complete task',
          message: `Mark ${context?.target?.title || 'this task'} as completed?`,
          confirmText: 'Complete task',
          cancelText: 'Cancel',
          variant: 'success',
        }
      },
      async run(context) {
        if (typeof context?.services?.crmWorkflow?.completeTask !== 'function') {
          throw new Error('crmWorkflow.completeTask() is not configured.')
        }
        return context.services.crmWorkflow.completeTask(context.target.id, context)
      },
    },,
    {
      type: 'crm.lead.update',
      permission: CRM_PERMISSIONS.LEADS_UPDATE,
      confirm(context) {
        return {
          title: 'Update lead',
          message: `Update ${context?.target?.fullName || context?.target?.company || 'this lead'}?`,
          confirmText: 'Update lead',
          cancelText: 'Cancel',
          variant: 'warning',
        }
      },
      async run(context) {
        if (typeof context?.services?.crm?.updateLead !== 'function') {
          throw new Error('crm.updateLead() is not configured.')
        }
        return context.services.crm.updateLead(context.target.id, context.payload || {})
      },
    },
    {
      type: 'crm.contact.update',
      permission: CRM_PERMISSIONS.CONTACTS_UPDATE,
      confirm(context) {
        return {
          title: 'Update contact',
          message: `Update ${context?.target?.fullName || context?.target?.email || 'this contact'}?`,
          confirmText: 'Update contact',
          cancelText: 'Cancel',
          variant: 'warning',
        }
      },
      async run(context) {
        if (typeof context?.services?.crm?.updateContact !== 'function') {
          throw new Error('crm.updateContact() is not configured.')
        }
        return context.services.crm.updateContact(context.target.id, context.payload || {})
      },
    },
    {
      type: 'crm.account.update',
      permission: CRM_PERMISSIONS.ACCOUNTS_UPDATE,
      confirm(context) {
        return {
          title: 'Update account',
          message: `Update ${context?.target?.name || context?.target?.companyName || 'this account'}?`,
          confirmText: 'Update account',
          cancelText: 'Cancel',
          variant: 'warning',
        }
      },
      async run(context) {
        if (typeof context?.services?.crm?.updateAccount !== 'function') {
          throw new Error('crm.updateAccount() is not configured.')
        }
        return context.services.crm.updateAccount(context.target.id, context.payload || {})
      },
    },
    {
      type: 'crm.opportunity.update',
      permission: CRM_PERMISSIONS.OPPORTUNITIES_UPDATE,
      confirm(context) {
        return {
          title: 'Update opportunity',
          message: `Update ${context?.target?.name || 'this opportunity'}?`,
          confirmText: 'Update opportunity',
          cancelText: 'Cancel',
          variant: 'warning',
        }
      },
      async run(context) {
        if (typeof context?.services?.crm?.moveOpportunityStage !== 'function') {
          throw new Error('crm.moveOpportunityStage() is not configured.')
        }
        if (context.payload?.stage) {
          return context.services.crm.moveOpportunityStage(context.target.id, context.payload.stage)
        }
        if (typeof context?.services?.crm?.updateOpportunity === 'function') {
          return context.services.crm.updateOpportunity(context.target.id, context.payload || {})
        }
        throw new Error('CRM opportunity update service is not configured.')
      },
    },
    {
      type: 'crm.task.update',
      permission: CRM_PERMISSIONS.TASKS_UPDATE,
      confirm(context) {
        return {
          title: 'Update task',
          message: `Update ${context?.target?.title || 'this task'}?`,
          confirmText: 'Update task',
          cancelText: 'Cancel',
          variant: 'warning',
        }
      },
      async run(context) {
        if (typeof context?.services?.crm?.updateTask !== 'function') {
          throw new Error('crm.updateTask() is not configured.')
        }
        return context.services.crm.updateTask(context.target.id, context.payload || {})
      },
    }
  ]
}

export default createCrmActionDefinitions
