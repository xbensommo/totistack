/**
 * Orders Collection Definition
 * @module apps/orders/collections/orders
 * @description Collection definition for orders with normalized schema
 * @author Totistack Team
 * @date 2026-03-22
 */

export default {
  name: 'orders',
  description: 'Order transactions and fulfillment records',
  
  // Schema definition with validation
  schema: {
    id: { type: 'string', required: true, description: 'Order unique identifier' },
    orderNumber: { type: 'string', required: true, unique: true, description: 'Human-readable order number' },
    clientId: { type: 'string', required: true, references: 'clients', description: 'Reference to client' },
    userId: { type: 'string', required: true, references: 'users', description: 'User who placed order' },
    
    // Order status workflow
    status: {
      type: 'string',
      required: true,
      enum: ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
      description: 'Current order status'
    },
    
    // Items summary
    items: {
      type: 'array',
      required: true,
      description: 'Array of order items (denormalized for performance)'
    },
    
    // Financial information
    subtotal: { type: 'number', required: true, min: 0, description: 'Subtotal before discounts/tax' },
    discount: { type: 'number', default: 0, min: 0, description: 'Discount amount applied' },
    tax: { type: 'number', default: 0, min: 0, description: 'Tax amount' },
    shipping: { type: 'number', default: 0, min: 0, description: 'Shipping cost' },
    total: { type: 'number', required: true, min: 0, description: 'Total order amount' },
    currency: { type: 'string', default: 'USD', description: 'Currency code' },
    
    // Payment information
    paymentStatus: {
      type: 'string',
      enum: ['pending', 'paid', 'failed', 'refunded', 'partial'],
      default: 'pending',
      description: 'Payment status'
    },
    paymentMethod: { type: 'string', description: 'Payment method used' },
    paymentId: { type: 'string', description: 'Gateway payment reference' },
    
    // Shipping information
    shippingAddress: {
      type: 'object',
      required: true,
      schema: {
        firstName: { type: 'string', required: true },
        lastName: { type: 'string', required: true },
        address1: { type: 'string', required: true },
        address2: { type: 'string' },
        city: { type: 'string', required: true },
        state: { type: 'string', required: true },
        postalCode: { type: 'string', required: true },
        country: { type: 'string', required: true },
        phone: { type: 'string' },
        email: { type: 'string', format: 'email' }
      },
      description: 'Shipping destination address'
    },
    
    billingAddress: {
      type: 'object',
      schema: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        address1: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        postalCode: { type: 'string' },
        country: { type: 'string' }
      },
      description: 'Billing address (if different from shipping)'
    },
    
    // Fulfillment tracking
    trackingNumber: { type: 'string', description: 'Shipping tracking number' },
    carrier: { type: 'string', description: 'Shipping carrier' },
    estimatedDelivery: { type: 'date', description: 'Estimated delivery date' },
    deliveredAt: { type: 'date', description: 'Actual delivery timestamp' },
    
    // Metadata
    notes: { type: 'string', description: 'Order notes' },
    customerNotes: { type: 'string', description: 'Notes from customer' },
    internalNotes: { type: 'string', description: 'Internal staff notes' },
    
    // Timestamps
    createdAt: { type: 'date', required: true, description: 'Order creation timestamp' },
    updatedAt: { type: 'date', required: true, description: 'Last update timestamp' },
    processedAt: { type: 'date', description: 'Processing start timestamp' },
    completedAt: { type: 'date', description: 'Completion timestamp' },
    cancelledAt: { type: 'date', description: 'Cancellation timestamp' }
  },
  
  // Indexes for query optimization
  indexes: [
    { fields: ['orderNumber'], unique: true },
    { fields: ['clientId', 'createdAt'] },
    { fields: ['userId', 'status'] },
    { fields: ['status', 'createdAt'] },
    { fields: ['paymentStatus'] },
    { fields: ['createdAt'], order: 'desc' }
  ],
  
  // Hooks for order lifecycle
  hooks: {
    beforeCreate: ['validateOrderItems', 'calculateTotals', 'generateOrderNumber'],
    afterCreate: ['sendOrderConfirmation', 'updateInventory'],
    beforeUpdate: ['validateStatusTransition'],
    afterUpdate: ['handleStatusChange']
  },
  
  // Security rules
  security: {
    read: { roles: ['admin', 'manager'], owners: ['userId', 'clientId'] },
    write: { roles: ['admin', 'manager'] },
    delete: { roles: ['admin'] }
  }
};