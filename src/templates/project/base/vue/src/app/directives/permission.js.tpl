import { useAppStore } from '@app/stores/appStore/index.js'

function shouldDisplay(bindingValue, store) {
  if (!bindingValue) return true

  if (typeof bindingValue === 'string') {
    return store.hasPermission(bindingValue) || store.hasRole(bindingValue)
  }

  if (Array.isArray(bindingValue)) {
    return bindingValue.every((item) => store.hasPermission(item) || store.hasRole(item))
  }

  if (bindingValue && typeof bindingValue === 'object') {
    const roles = Array.isArray(bindingValue.roles) ? bindingValue.roles : []
    const permissions = Array.isArray(bindingValue.permissions) ? bindingValue.permissions : []

    const roleAllowed = roles.length === 0 || roles.some((role) => store.hasRole(role))
    const permissionAllowed = permissions.length === 0 || permissions.every((permission) => store.hasPermission(permission))

    return roleAllowed && permissionAllowed
  }

  return true
}

export const permissionDirective = {
  mounted(el, binding) {
    const store = useAppStore()
    if (!shouldDisplay(binding.value, store)) {
      el.parentNode?.removeChild(el)
    }
  },
}
