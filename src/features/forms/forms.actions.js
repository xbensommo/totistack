/** @file src/features/forms/forms.actions.js */

function getFormsService(context) {
  const service = context?.service || context?.services?.forms || context?.services?.formsService
  if (!service) throw new Error('Forms service is not configured for this action.')
  return service
}

function targetId(context) {
  return context?.target?.id || context?.id || context?.formId
}

export function createFormsActionDefinitions() {
  return [
    {
      type: 'forms.form.update',
      confirm: ({ target }) => ({
        title: 'Update form',
        message: `Update ${target?.name || 'this form'}?`,
        confirmText: 'Update form',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getFormsService(context).updateForm(targetId(context), context.payload || {}),
    },
    {
      type: 'forms.field.save',
      confirm: ({ target }) => ({
        title: 'Save form field',
        message: `Save ${target?.label || 'this field'}?`,
        confirmText: 'Save field',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getFormsService(context).saveField(context.payload || {}),
    },
    {
      type: 'forms.webhook.save',
      confirm: ({ target }) => ({
        title: 'Save webhook',
        message: `Save ${target?.name || target?.url || 'this webhook'}?`,
        confirmText: 'Save webhook',
        cancelText: 'Cancel',
        variant: 'warning',
      }),
      run: (context) => getFormsService(context).saveWebhook(context.payload || {}),
    },
  ]
}

export default createFormsActionDefinitions
