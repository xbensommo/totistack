/**
 * @file services/clientService.js
 * @description Root-store compatible service for the Client Records app.
 */

const DEFAULT_LIST_OPTIONS = {
  pageSize: 50,
  sortBy: 'updatedAt',
  sortDirection: 'desc',
}

/**
 * Build a Client Records service around the root Totistack app store.
 *
 * The module stays declarative. It does not create its own provider,
 * router, or root auth state.
 *
 * @param {object} context
 * @param {ReturnType<import('@/stores/appStore').useAppStore>|null} [context.store]
 * @param {object|null} [context.access]
 * @param {() => Date} [context.now]
 * @returns {object}
 */
export function createClientService({
  store = null,
  access = null,
  now = () => new Date(),
} = {}) {
  /**
   * Resolve a usable store.
   *
   * @returns {any}
   */
  function requireStore() {
    if (!store) {
      throw new Error(
        '[client-records] Root app store is required. Pass { store } when creating the service.'
      )
    }

    return store
  }

  /**
   * Enforce access when RBAC is active.
   *
   * @param {string} permission
   */
  function ensureAccess(permission) {
    if (!access || typeof access.can !== 'function') return
    if (!access.can(permission)) {
      throw new Error(`Access denied for permission "${permission}".`)
    }
  }

  /**
   * Read collection state safely from the root store.
   *
   * @param {string} name
   * @returns {{items: any[], hasMore: boolean}}
   */
  function getCollectionState(name) {
    const appStore = requireStore()
    const value = appStore?.[name]

    if (!value || typeof value !== 'object') {
      return { items: [], hasMore: false }
    }

    return {
      items: Array.isArray(value.items) ? value.items : [],
      hasMore: Boolean(value.hasMore),
    }
  }

  /**
   * Resolve generated collection actions from the root store.
   *
   * @param {string} name
   * @returns {Record<string, Function>}
   */
  function getCollectionActions(name) {
    const appStore = requireStore()
    const actionKey = `${name}Actions`
    const actions = appStore?.[actionKey]

    if (!actions || typeof actions !== 'object') {
      throw new Error(
        `[client-records] Missing generated collection actions: "${actionKey}".`
      )
    }

    return actions
  }

  /**
   * Build a predictable client number.
   *
   * @returns {string}
   */
  function generateClientNumber() {
    const stamp = now()
    const year = stamp.getFullYear()
    const month = String(stamp.getMonth() + 1).padStart(2, '0')
    const suffix = String(stamp.getTime()).slice(-5)
    return `CLT-${year}${month}-${suffix}`
  }

  /**
   * Generate a stable document id.
   *
   * @param {string} prefix
   * @returns {string}
   */
  function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  }

  /**
   * Get current authenticated actor from the root store.
   *
   * @returns {any|null}
   */
  function getCurrentUser() {
    const appStore = requireStore()
    return appStore.currentUser || null
  }

  /**
   * Create default entity timestamps and ownership metadata.
   *
   * @returns {{createdAt: Date, updatedAt: Date, createdBy: string|null}}
   */
  function buildAuditFields() {
    const currentUser = getCurrentUser()
    const timestamp = now()

    return {
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: currentUser?.uid || null,
    }
  }

  /**
   * Normalize client creation payload.
   *
   * @param {object} payload
   * @returns {object}
   */
  function normalizeClientPayload(payload = {}) {
    const currentUser = getCurrentUser()

    return {
      clientNumber: payload.clientNumber || generateClientNumber(),
      type: payload.type || 'individual',
      companyName: payload.companyName || '',
      firstName: payload.firstName || '',
      lastName: payload.lastName || '',
      email: payload.email || '',
      phone: payload.phone || '',
      status: payload.status || 'lead',
      lifecycleStage: payload.lifecycleStage || 'lead',
      leadSource: payload.leadSource || '',
      leadScore: Number(payload.leadScore || 0),
      lifetimeValue: Number(payload.lifetimeValue || 0),
      assignedTo: payload.assignedTo || currentUser?.uid || null,
      primaryContactId: payload.primaryContactId || null,
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      communicationPreferences: {
        email: true,
        sms: false,
        push: false,
        marketing: true,
        language: 'en',
        ...(payload.communicationPreferences || {}),
      },
      customFields: payload.customFields || {},
      metadata: {
        version: 1,
        source: 'client-records',
        ...(payload.metadata || {}),
      },
      lastActivityAt: payload.lastActivityAt || now(),
      ...buildAuditFields(),
    }
  }

  /**
   * Load the first page of clients into the root store state.
   *
   * @param {object} options
   * @returns {Promise<{items: any[], hasMore: boolean}>}
   */
  async function fetchClients(options = {}) {
    ensureAccess('clients.read')
    const clientsActions = getCollectionActions('clients')
    await clientsActions.fetchInitialPage({ ...DEFAULT_LIST_OPTIONS, ...options })
    return getCollectionState('clients')
  }

  /**
   * Read a single client and related records.
   *
   * @param {string} clientId
   * @returns {Promise<object|null>}
   */
  async function getClient(clientId) {
    ensureAccess('clients.read')

    if (!clientId) {
      throw new Error('A client id is required.')
    }

    const clientsActions = getCollectionActions('clients')
    const contactsActions = getCollectionActions('clientContacts')
    const activitiesActions = getCollectionActions('clientActivities')
    const notesActions = getCollectionActions('clientNotes')

    const client = await clientsActions.getById(clientId)

    if (!client) return null

    await Promise.all([
      contactsActions.fetchInitialPage({
        pageSize: 100,
        sortBy: 'updatedAt',
        sortDirection: 'desc',
        filters: { clientId },
      }),
      activitiesActions.fetchInitialPage({
        pageSize: 25,
        sortBy: 'createdAt',
        sortDirection: 'desc',
        filters: { clientId },
      }),
      notesActions.fetchInitialPage({
        pageSize: 25,
        sortBy: 'createdAt',
        sortDirection: 'desc',
        filters: { clientId },
      }),
    ])

    const contacts = getCollectionState('clientContacts').items.filter(
      (entry) => entry?.clientId === clientId
    )
    const activities = getCollectionState('clientActivities').items.filter(
      (entry) => entry?.clientId === clientId
    )
    const notes = getCollectionState('clientNotes').items.filter(
      (entry) => entry?.clientId === clientId
    )

    return {
      ...client,
      contacts,
      activities,
      notes,
      primaryContact:
        contacts.find((entry) => entry?.isPrimary) ||
        contacts.find((entry) => entry?.id === client.primaryContactId) ||
        null,
    }
  }

  /**
   * Create a client record and optionally a primary contact.
   *
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async function createClient(payload = {}) {
    ensureAccess('clients.create')

    const currentUser = getCurrentUser()
    if (!currentUser?.uid) {
      throw new Error('Authentication required.')
    }

    const clientsActions = getCollectionActions('clients')
    const contactsActions = getCollectionActions('clientContacts')

    const clientId = generateId('client')
    const client = normalizeClientPayload(payload)

    await clientsActions.setById(clientId, client)

    let primaryContactId = null

    if (payload.primaryContact?.firstName && payload.primaryContact?.email) {
      const contactId = generateId('contact')
      primaryContactId = contactId

      await contactsActions.setById(contactId, {
        clientId,
        firstName: payload.primaryContact.firstName,
        lastName: payload.primaryContact.lastName || '',
        title: payload.primaryContact.title || '',
        department: payload.primaryContact.department || '',
        email: payload.primaryContact.email,
        phone: payload.primaryContact.phone || payload.phone || '',
        mobile: payload.primaryContact.mobile || '',
        role: 'primary',
        isPrimary: true,
        receivesNotifications: true,
        preferences: {
          email: true,
          sms: false,
          phone: true,
          ...(payload.primaryContact.preferences || {}),
        },
        notes: payload.primaryContact.notes || '',
        ...buildAuditFields(),
      })

      await clientsActions.update(clientId, {
        primaryContactId,
        updatedAt: now(),
        metadata: {
          ...(client.metadata || {}),
          version: 2,
        },
      })
    }

    await logActivity(clientId, {
      type: 'note',
      action: 'client_created',
      description: `Client ${client.clientNumber} created.`,
      priority: 'medium',
    })

    return getClient(clientId)
  }

  /**
   * Update a client.
   *
   * @param {string} clientId
   * @param {object} updates
   * @returns {Promise<object|null>}
   */
  async function updateClient(clientId, updates = {}) {
    ensureAccess('clients.update')

    const clientsActions = getCollectionActions('clients')
    const current = await clientsActions.getById(clientId)

    if (!current) {
      throw new Error('Client not found.')
    }

    await clientsActions.update(clientId, {
      ...updates,
      updatedAt: now(),
      metadata: {
        ...(current.metadata || {}),
        version: Number(current.metadata?.version || 1) + 1,
        updatedBy: getCurrentUser()?.uid || null,
      },
    })

    await logActivity(clientId, {
      type: 'edit',
      action: 'client_updated',
      description: 'Client profile updated.',
      priority: 'medium',
      metadata: {
        updatedFields: Object.keys(updates),
      },
    })

    return getClient(clientId)
  }

  /**
   * Archive a client by marking status inactive.
   *
   * @param {string} clientId
   * @returns {Promise<object|null>}
   */
  async function archiveClient(clientId) {
    ensureAccess('clients.delete')

    const clientsActions = getCollectionActions('clients')
    await clientsActions.update(clientId, {
      status: 'inactive',
      updatedAt: now(),
      metadata: {
        archivedBy: getCurrentUser()?.uid || null,
      },
    })

    await logActivity(clientId, {
      type: 'status_change',
      action: 'client_archived',
      description: 'Client archived.',
      priority: 'high',
    })

    return getClient(clientId)
  }

  /**
   * Add a contact linked to a client.
   *
   * @param {string} clientId
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async function addContact(clientId, payload = {}) {
    ensureAccess('clients.update')

    if (!clientId) {
      throw new Error('A client id is required.')
    }

    const contactsActions = getCollectionActions('clientContacts')
    const contactId = generateId('contact')

    const contact = {
      clientId,
      firstName: payload.firstName || '',
      lastName: payload.lastName || '',
      title: payload.title || '',
      department: payload.department || '',
      email: payload.email || '',
      phone: payload.phone || '',
      mobile: payload.mobile || '',
      role: payload.role || 'other',
      isPrimary: Boolean(payload.isPrimary),
      receivesNotifications: payload.receivesNotifications !== false,
      preferences: {
        email: true,
        sms: false,
        phone: true,
        ...(payload.preferences || {}),
      },
      notes: payload.notes || '',
      ...buildAuditFields(),
    }

    await contactsActions.setById(contactId, contact)

    if (contact.isPrimary) {
      const clientsActions = getCollectionActions('clients')
      await clientsActions.update(clientId, {
        primaryContactId: contactId,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        updatedAt: now(),
      })
    }

    await logActivity(clientId, {
      type: 'note',
      action: 'contact_added',
      description: `Contact ${contact.firstName} ${contact.lastName}`.trim(),
      metadata: { contactId },
    })

    return { id: contactId, ...contact }
  }

  /**
   * Add a note linked to a client.
   *
   * @param {string} clientId
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async function addNote(clientId, payload = {}) {
    ensureAccess('clients.update')

    const currentUser = getCurrentUser()
    if (!currentUser?.uid) {
      throw new Error('Authentication required.')
    }

    const notesActions = getCollectionActions('clientNotes')
    const clientsActions = getCollectionActions('clients')
    const noteId = generateId('note')

    const note = {
      clientId,
      userId: currentUser.uid,
      content: payload.content || '',
      type: payload.type || 'general',
      isPublic: payload.isPublic !== false,
      ...buildAuditFields(),
    }

    await notesActions.setById(noteId, note)
    await clientsActions.update(clientId, { lastActivityAt: now(), updatedAt: now() })

    await logActivity(clientId, {
      type: 'note',
      action: 'note_added',
      description: payload.content || 'Client note added.',
      metadata: { noteId },
    })

    return { id: noteId, ...note }
  }

  /**
   * Log a client activity.
   *
   * @param {string} clientId
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async function logActivity(clientId, payload = {}) {
    ensureAccess('clients.read')

    const currentUser = getCurrentUser()
    if (!currentUser?.uid) {
      throw new Error('Authentication required.')
    }

    const activityActions = getCollectionActions('clientActivities')
    const activityId = generateId('activity')

    const activity = {
      clientId,
      userId: currentUser.uid,
      type: payload.type || 'note',
      action: payload.action || 'updated',
      description: payload.description || '',
      referenceType: payload.referenceType || null,
      referenceId: payload.referenceId || null,
      metadata: payload.metadata || {},
      duration: Number(payload.duration || 0) || null,
      outcome: payload.outcome || 'completed',
      priority: payload.priority || 'medium',
      isPublic: payload.isPublic !== false,
      ...buildAuditFields(),
    }

    await activityActions.setById(activityId, activity)

    return { id: activityId, ...activity }
  }

  return {
    fetchClients,
    getClient,
    createClient,
    updateClient,
    archiveClient,
    addContact,
    addNote,
    logActivity,
    generateClientNumber,
  }
}

export default createClientService
