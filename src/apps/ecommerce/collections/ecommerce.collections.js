/** @file src/apps/ecommerce/collections/ecommerce.collections.js */
import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

const S = FIELD_TYPES.STRING
const N = FIELD_TYPES.NUMBER
const B = FIELD_TYPES.BOOLEAN
const T = FIELD_TYPES.TIMESTAMP
const A = FIELD_TYPES.ARRAY
const M = FIELD_TYPES.MAP

function field(type, extra = {}) {
  return { type, ...extra }
}

function withSystem(schema) {
  return {
    ...schema,
    createdAt: field(T, { readonly: true, system: true, filterable: true, sortable: true }),
    updatedAt: field(T, { readonly: true, system: true, filterable: true, sortable: true }),
    createdBy: field(S, { readonly: true, system: true, filterable: true }),
    updatedBy: field(S, { readonly: true, system: true, filterable: true }),
    isDeleted: field(B, { filterable: true, sortable: true }),
    deletedAt: field(T, { filterable: true, sortable: true }),
    deletedBy: field(S, { filterable: true }),
  }
}

function collection(name, schema, writableFields, updateableFields, indexes, searchFields = []) {
  return defineCollection({
    name,
    shard: { type: 'none' },
    schema: withSystem(schema),
    writableFields,
    updateableFields,
    indexes,
    search: searchFields.length ? { mode: 'token-array', fields: searchFields } : { mode: 'disabled', fields: [] },
    rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'adminOnly' },
  })
}

export const commerceStores = collection(
  'commerceStores',
  {
    name: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    slug: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    status: field(S, { required: true, sortable: true, filterable: true }),
    ownerId: field(S, { filterable: true }),
    currency: field(S, { required: true, filterable: true }),
    email: field(S, { searchable: true, filterable: true }),
    phone: field(S, { searchable: true, filterable: true }),
    logoUrl: field(S),
    brand: field(M),
    settings: field(M),
    seo: field(M),
    metadata: field(M),
  },
  ['name', 'slug', 'status', 'ownerId', 'currency', 'email', 'phone', 'logoUrl', 'brand', 'settings', 'seo', 'metadata'],
  ['name', 'slug', 'status', 'ownerId', 'currency', 'email', 'phone', 'logoUrl', 'brand', 'settings', 'seo', 'metadata', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['slug'] }, { fields: ['status', 'createdAt'] }, { fields: ['ownerId', 'createdAt'] }],
  ['name', 'slug', 'email', 'phone'],
)

export const commerceCategories = collection(
  'commerceCategories',
  {
    storeId: field(S, { required: true, filterable: true }),
    parentId: field(S, { filterable: true }),
    name: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    slug: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    description: field(S, { searchable: true }),
    status: field(S, { required: true, filterable: true, sortable: true }),
    sortOrder: field(N, { filterable: true, sortable: true }),
    imageUrl: field(S),
    seo: field(M),
    metadata: field(M),
  },
  ['storeId', 'parentId', 'name', 'slug', 'description', 'status', 'sortOrder', 'imageUrl', 'seo', 'metadata'],
  ['parentId', 'name', 'slug', 'description', 'status', 'sortOrder', 'imageUrl', 'seo', 'metadata', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['storeId', 'slug'] }, { fields: ['storeId', 'status', 'sortOrder'] }, { fields: ['parentId', 'sortOrder'] }],
  ['name', 'slug', 'description'],
)

export const commerceProducts = collection(
  'commerceProducts',
  {
    storeId: field(S, { required: true, filterable: true }),
    categoryId: field(S, { filterable: true }),
    title: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    slug: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    sku: field(S, { searchable: true, sortable: true, filterable: true }),
    summary: field(S, { searchable: true }),
    description: field(S, { searchable: true }),
    status: field(S, { required: true, filterable: true, sortable: true }),
    visibility: field(S, { required: true, filterable: true }),
    productType: field(S, { required: true, filterable: true }),
    price: field(N, { required: true, filterable: true, sortable: true }),
    compareAtPrice: field(N, { filterable: true, sortable: true }),
    currency: field(S, { required: true, filterable: true }),
    trackInventory: field(B, { filterable: true }),
    stockQuantity: field(N, { filterable: true, sortable: true }),
    lowStockThreshold: field(N, { filterable: true, sortable: true }),
    images: field(A),
    attributes: field(M),
    seo: field(M),
    publishedAt: field(T, { filterable: true, sortable: true }),
    publishedBy: field(S, { filterable: true }),
    metadata: field(M),
  },
  ['storeId', 'categoryId', 'title', 'slug', 'sku', 'summary', 'description', 'status', 'visibility', 'productType', 'price', 'compareAtPrice', 'currency', 'trackInventory', 'stockQuantity', 'lowStockThreshold', 'images', 'attributes', 'seo', 'publishedAt', 'publishedBy', 'metadata'],
  ['categoryId', 'title', 'slug', 'sku', 'summary', 'description', 'status', 'visibility', 'productType', 'price', 'compareAtPrice', 'currency', 'trackInventory', 'stockQuantity', 'lowStockThreshold', 'images', 'attributes', 'seo', 'publishedAt', 'publishedBy', 'metadata', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['storeId', 'slug'] }, { fields: ['storeId', 'status', 'createdAt'] }, { fields: ['categoryId', 'status', 'createdAt'] }, { fields: ['stockQuantity', 'createdAt'] }],
  ['title', 'slug', 'sku', 'summary', 'description'],
)

export const commerceProductVariants = collection(
  'commerceProductVariants',
  {
    storeId: field(S, { required: true, filterable: true }),
    productId: field(S, { required: true, filterable: true }),
    title: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    sku: field(S, { searchable: true, sortable: true, filterable: true }),
    status: field(S, { required: true, sortable: true, filterable: true }),
    price: field(N, { required: true, sortable: true, filterable: true }),
    stockQuantity: field(N, { sortable: true, filterable: true }),
    options: field(M),
    imageUrl: field(S),
    metadata: field(M),
  },
  ['storeId', 'productId', 'title', 'sku', 'status', 'price', 'stockQuantity', 'options', 'imageUrl', 'metadata'],
  ['title', 'sku', 'status', 'price', 'stockQuantity', 'options', 'imageUrl', 'metadata', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['productId', 'status'] }, { fields: ['storeId', 'sku'] }, { fields: ['storeId', 'status', 'createdAt'] }],
  ['title', 'sku'],
)

export const commerceCustomers = collection(
  'commerceCustomers',
  {
    storeId: field(S, { required: true, filterable: true }),
    userId: field(S, { filterable: true }),
    displayName: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    email: field(S, { searchable: true, filterable: true }),
    phone: field(S, { searchable: true, filterable: true }),
    status: field(S, { required: true, filterable: true, sortable: true }),
    customerType: field(S, { filterable: true }),
    defaultAddress: field(M),
    addresses: field(A),
    notes: field(S, { searchable: true }),
    lastOrderAt: field(T, { filterable: true, sortable: true }),
    totalOrders: field(N, { filterable: true, sortable: true }),
    lifetimeValue: field(N, { filterable: true, sortable: true }),
    metadata: field(M),
  },
  ['storeId', 'userId', 'displayName', 'email', 'phone', 'status', 'customerType', 'defaultAddress', 'addresses', 'notes', 'lastOrderAt', 'totalOrders', 'lifetimeValue', 'metadata'],
  ['displayName', 'email', 'phone', 'status', 'customerType', 'defaultAddress', 'addresses', 'notes', 'lastOrderAt', 'totalOrders', 'lifetimeValue', 'metadata', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['storeId', 'status', 'createdAt'] }, { fields: ['storeId', 'email'] }, { fields: ['storeId', 'phone'] }, { fields: ['userId', 'createdAt'] }],
  ['displayName', 'email', 'phone', 'notes'],
)

export const commerceCarts = collection(
  'commerceCarts',
  {
    storeId: field(S, { required: true, filterable: true }),
    customerId: field(S, { filterable: true }),
    userId: field(S, { filterable: true }),
    sessionId: field(S, { filterable: true }),
    status: field(S, { required: true, filterable: true, sortable: true }),
    items: field(A, { required: true }),
    currency: field(S, { required: true, filterable: true }),
    subtotal: field(N, { required: true, sortable: true }),
    discountTotal: field(N, { sortable: true }),
    taxTotal: field(N, { sortable: true }),
    shippingTotal: field(N, { sortable: true }),
    total: field(N, { required: true, sortable: true }),
    expiresAt: field(T, { sortable: true, filterable: true }),
    metadata: field(M),
  },
  ['storeId', 'customerId', 'userId', 'sessionId', 'status', 'items', 'currency', 'subtotal', 'discountTotal', 'taxTotal', 'shippingTotal', 'total', 'expiresAt', 'metadata'],
  ['customerId', 'userId', 'sessionId', 'status', 'items', 'currency', 'subtotal', 'discountTotal', 'taxTotal', 'shippingTotal', 'total', 'expiresAt', 'metadata', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['storeId', 'status', 'updatedAt'] }, { fields: ['customerId', 'updatedAt'] }, { fields: ['userId', 'updatedAt'] }, { fields: ['sessionId', 'updatedAt'] }],
)

export const commerceOrders = collection(
  'commerceOrders',
  {
    storeId: field(S, { required: true, filterable: true }),
    orderNumber: field(S, { required: true, searchable: true, sortable: true, filterable: true }),
    customerId: field(S, { filterable: true }),
    userId: field(S, { filterable: true }),
    status: field(S, { required: true, filterable: true, sortable: true }),
    paymentStatus: field(S, { required: true, filterable: true, sortable: true }),
    fulfillmentStatus: field(S, { required: true, filterable: true, sortable: true }),
    returnStatus: field(S, { filterable: true, sortable: true }),
    channel: field(S, { filterable: true }),
    items: field(A, { required: true }),
    currency: field(S, { required: true, filterable: true }),
    subtotal: field(N, { required: true, sortable: true }),
    discountTotal: field(N, { sortable: true }),
    taxTotal: field(N, { sortable: true }),
    shippingTotal: field(N, { sortable: true }),
    total: field(N, { required: true, filterable: true, sortable: true }),
    billingAddress: field(M),
    shippingAddress: field(M),
    customerNote: field(S, { searchable: true }),
    internalNote: field(S, { searchable: true }),
    paymentProofId: field(S, { filterable: true }),
    placedAt: field(T, { filterable: true, sortable: true }),
    cancelledAt: field(T, { filterable: true, sortable: true }),
    fulfilledAt: field(T, { filterable: true, sortable: true }),
    deliveredAt: field(T, { filterable: true, sortable: true }),
    metadata: field(M),
  },
  ['storeId', 'orderNumber', 'customerId', 'userId', 'status', 'paymentStatus', 'fulfillmentStatus', 'returnStatus', 'channel', 'items', 'currency', 'subtotal', 'discountTotal', 'taxTotal', 'shippingTotal', 'total', 'billingAddress', 'shippingAddress', 'customerNote', 'internalNote', 'paymentProofId', 'placedAt', 'cancelledAt', 'fulfilledAt', 'deliveredAt', 'metadata'],
  ['status', 'paymentStatus', 'fulfillmentStatus', 'returnStatus', 'items', 'discountTotal', 'taxTotal', 'shippingTotal', 'total', 'billingAddress', 'shippingAddress', 'customerNote', 'internalNote', 'paymentProofId', 'cancelledAt', 'fulfilledAt', 'deliveredAt', 'metadata', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['storeId', 'orderNumber'] }, { fields: ['storeId', 'status', 'createdAt'] }, { fields: ['storeId', 'paymentStatus', 'createdAt'] }, { fields: ['customerId', 'createdAt'] }, { fields: ['total', 'createdAt'] }],
  ['orderNumber', 'customerNote', 'internalNote'],
)

export const commerceOrderEvents = collection(
  'commerceOrderEvents',
  {
    storeId: field(S, { required: true, filterable: true }),
    orderId: field(S, { required: true, filterable: true }),
    type: field(S, { required: true, filterable: true, sortable: true }),
    actorId: field(S, { filterable: true }),
    message: field(S, { required: true, searchable: true }),
    fromStatus: field(S, { filterable: true }),
    toStatus: field(S, { filterable: true }),
    payload: field(M),
    metadata: field(M),
  },
  ['storeId', 'orderId', 'type', 'actorId', 'message', 'fromStatus', 'toStatus', 'payload', 'metadata'],
  ['message', 'payload', 'metadata', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['orderId', 'createdAt'] }, { fields: ['storeId', 'type', 'createdAt'] }, { fields: ['actorId', 'createdAt'] }],
  ['message', 'type'],
)

export const commerceInventoryMovements = collection(
  'commerceInventoryMovements',
  {
    storeId: field(S, { required: true, filterable: true }),
    productId: field(S, { required: true, filterable: true }),
    variantId: field(S, { filterable: true }),
    movementType: field(S, { required: true, filterable: true, sortable: true }),
    quantity: field(N, { required: true, filterable: true, sortable: true }),
    previousQuantity: field(N, { sortable: true }),
    nextQuantity: field(N, { sortable: true }),
    reason: field(S, { searchable: true }),
    referenceType: field(S, { filterable: true }),
    referenceId: field(S, { filterable: true, searchable: true }),
    actorId: field(S, { filterable: true }),
    metadata: field(M),
  },
  ['storeId', 'productId', 'variantId', 'movementType', 'quantity', 'previousQuantity', 'nextQuantity', 'reason', 'referenceType', 'referenceId', 'actorId', 'metadata'],
  ['reason', 'metadata', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['productId', 'createdAt'] }, { fields: ['variantId', 'createdAt'] }, { fields: ['storeId', 'movementType', 'createdAt'] }, { fields: ['referenceType', 'referenceId'] }],
  ['reason', 'referenceId'],
)

export const commerceReturns = collection(
  'commerceReturns',
  {
    storeId: field(S, { required: true, filterable: true }),
    orderId: field(S, { required: true, filterable: true }),
    customerId: field(S, { filterable: true }),
    status: field(S, { required: true, filterable: true, sortable: true }),
    reason: field(S, { searchable: true }),
    items: field(A, { required: true }),
    requestedAmount: field(N, { sortable: true }),
    approvedAmount: field(N, { sortable: true }),
    decisionReason: field(S, { searchable: true }),
    decidedBy: field(S, { filterable: true }),
    decidedAt: field(T, { filterable: true, sortable: true }),
    metadata: field(M),
  },
  ['storeId', 'orderId', 'customerId', 'status', 'reason', 'items', 'requestedAmount', 'approvedAmount', 'decisionReason', 'decidedBy', 'decidedAt', 'metadata'],
  ['status', 'reason', 'items', 'requestedAmount', 'approvedAmount', 'decisionReason', 'decidedBy', 'decidedAt', 'metadata', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['storeId', 'status', 'createdAt'] }, { fields: ['orderId', 'createdAt'] }, { fields: ['customerId', 'createdAt'] }],
  ['reason', 'decisionReason'],
)

export const commercePaymentProofs = collection(
  'commercePaymentProofs',
  {
    storeId: field(S, { required: true, filterable: true }),
    orderId: field(S, { required: true, filterable: true }),
    customerId: field(S, { filterable: true }),
    status: field(S, { required: true, filterable: true, sortable: true }),
    method: field(S, { required: true, filterable: true }),
    amount: field(N, { required: true, filterable: true, sortable: true }),
    currency: field(S, { required: true, filterable: true }),
    reference: field(S, { searchable: true, filterable: true }),
    fileUrl: field(S),
    reviewedBy: field(S, { filterable: true }),
    reviewedAt: field(T, { filterable: true, sortable: true }),
    reviewReason: field(S, { searchable: true }),
    metadata: field(M),
  },
  ['storeId', 'orderId', 'customerId', 'status', 'method', 'amount', 'currency', 'reference', 'fileUrl', 'reviewedBy', 'reviewedAt', 'reviewReason', 'metadata'],
  ['status', 'method', 'amount', 'currency', 'reference', 'fileUrl', 'reviewedBy', 'reviewedAt', 'reviewReason', 'metadata', 'isDeleted', 'deletedAt', 'deletedBy'],
  [{ fields: ['storeId', 'status', 'createdAt'] }, { fields: ['orderId', 'createdAt'] }, { fields: ['reference', 'createdAt'] }],
  ['reference', 'reviewReason'],
)

export const ecommerceCollections = Object.freeze([
  commerceStores,
  commerceCategories,
  commerceProducts,
  commerceProductVariants,
  commerceCustomers,
  commerceCarts,
  commerceOrders,
  commerceOrderEvents,
  commerceInventoryMovements,
  commerceReturns,
  commercePaymentProofs,
])

export default ecommerceCollections
