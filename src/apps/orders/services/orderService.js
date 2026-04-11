/**
 * Order Service
 * @module apps/orders/services/orderService
 * @description Core service for order management and processing
 * @author Totistack Team
 * @date 2026-03-22
 */

import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
         query, where, orderBy, limit, Timestamp, writeBatch } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

/**
 * Order Service Class
 */
export class OrderService {
  /** @type {Object} Firestore instance */
  #db = null;
  
  /** @type {Object} Auth service */
  #authService = null;
  
  /** @type {Object} Integration service */
  #integrationService = null;
  
  /** @type {Object} Configuration */
  #config = null;
  
  /** @type {boolean} Initialized flag */
  #initialized = false;
  
  /** @type {Map} Order cache */
  #cache = new Map();
  
  constructor() {
    this.#db = getFirestore();
  }
  
  /**
   * Get singleton instance
   * @returns {OrderService} OrderService instance
   */
  static getInstance() {
    if (!globalThis.__orderService) {
      globalThis.__orderService = new OrderService();
    }
    return globalThis.__orderService;
  }
  
  /**
   * Initialize order service
   * @param {Object} config - Configuration
   * @param {Object} authService - Auth service
   * @param {Object} integrationService - Integration service
   * @returns {Promise<void>}
   */
  async initialize(config = {}, authService, integrationService) {
    if (this.#initialized) {
      return;
    }
    
    try {
      this.#authService = authService;
      this.#integrationService = integrationService;
      this.#config = {
        orderPrefix: 'ORD',
        autoConfirmOrders: false,
        requirePaymentConfirmation: true,
        ...config
      };
      
      this.#initialized = true;
      console.info('[OrderService] Initialized');
      
    } catch (error) {
      console.error('[OrderService] Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Create new order from cart
   * @param {Object} cart - Cart object
   * @param {Object} orderData - Additional order data
   * @returns {Promise<Object>} Created order
   */
  async createOrderFromCart(cart, orderData = {}) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new Error('CART_EMPTY');
      }
      
      // Calculate order totals
      const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const discount = orderData.discount || 0;
      const tax = (subtotal - discount) * (orderData.taxRate || 0.1);
      const shipping = orderData.shipping || 0;
      const total = subtotal - discount + tax + shipping;
      
      // Generate order number
      const orderNumber = await this.#generateOrderNumber();
      
      const orderId = this.#generateId();
      const now = Timestamp.now();
      
      const order = {
        id: orderId,
        orderNumber,
        clientId: cart.clientId || user.uid,
        userId: user.uid,
        status: 'pending',
        items: cart.items.map(item => ({
          ...item,
          orderId,
          subtotal: item.price * item.quantity
        })),
        subtotal,
        discount,
        tax,
        shipping,
        total,
        currency: orderData.currency || 'USD',
        paymentStatus: 'pending',
        shippingAddress: orderData.shippingAddress || cart.shippingAddress,
        billingAddress: orderData.billingAddress || null,
        customerNotes: orderData.notes || null,
        metadata: orderData.metadata || {},
        createdAt: now,
        updatedAt: now
      };
      
      // Validate order
      this.#validateOrder(order);
      
      // Save to Firestore
      const batch = writeBatch(this.#db);
      
      const orderRef = doc(this.#db, 'orders', orderId);
      batch.set(orderRef, order);
      
      // Clear cart
      const cartRef = doc(this.#db, 'carts', cart.id);
      batch.delete(cartRef);
      
      await batch.commit();
      
      // Invalidate cache
      this.#cache.clear();
      
      console.info(`[OrderService] Order created: ${orderNumber}`);
      
      // Trigger hooks
      await this.#onOrderCreated(order);
      
      // Process payment if configured
      if (orderData.paymentMethod) {
        await this.processPayment(orderId, orderData.paymentMethod, orderData.paymentDetails);
      }
      
      return order;
      
    } catch (error) {
      console.error('[OrderService] Create order failed:', error);
      throw this.#normalizeError(error);
    }
  }
  
  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object|null>} Order object
   */
  async getOrder(orderId) {
    try {
      // Check cache
      if (this.#cache.has(orderId)) {
        return this.#cache.get(orderId);
      }
      
      const orderRef = doc(this.#db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        return null;
      }
      
      const order = orderDoc.data();
      this.#cache.set(orderId, order);
      
      return order;
      
    } catch (error) {
      console.error('[OrderService] Get order failed:', error);
      throw error;
    }
  }
  
  /**
   * Get order by order number
   * @param {string} orderNumber - Order number
   * @returns {Promise<Object|null>} Order object
   */
  async getOrderByNumber(orderNumber) {
    try {
      const q = query(
        collection(this.#db, 'orders'),
        where('orderNumber', '==', orderNumber),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
      
    } catch (error) {
      console.error('[OrderService] Get order by number failed:', error);
      throw error;
    }
  }
  
  /**
   * List orders with filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated orders
   */
  async listOrders(options = {}) {
    try {
      const {
        clientId = null,
        userId = null,
        status = null,
        paymentStatus = null,
        startDate = null,
        endDate = null,
        limit: pageSize = 20,
        startAfter = null,
        orderBy: orderField = 'createdAt',
        orderDirection = 'desc'
      } = options;
      
      let constraints = [];
      
      if (clientId) {
        constraints.push(where('clientId', '==', clientId));
      }
      
      if (userId) {
        constraints.push(where('userId', '==', userId));
      }
      
      if (status) {
        constraints.push(where('status', '==', status));
      }
      
      if (paymentStatus) {
        constraints.push(where('paymentStatus', '==', paymentStatus));
      }
      
      if (startDate) {
        constraints.push(where('createdAt', '>=', Timestamp.fromDate(startDate)));
      }
      
      if (endDate) {
        constraints.push(where('createdAt', '<=', Timestamp.fromDate(endDate)));
      }
      
      constraints.push(orderBy(orderField, orderDirection));
      
      if (startAfter) {
        const cursorDoc = await getDoc(doc(this.#db, 'orders', startAfter));
        if (cursorDoc.exists()) {
          constraints.push(startAfter(cursorDoc));
        }
      }
      
      constraints.push(limit(pageSize));
      
      const q = query(collection(this.#db, 'orders'), ...constraints);
      const snapshot = await getDocs(q);
      
      const orders = [];
      snapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      
      return {
        items: orders,
        pagination: {
          limit: pageSize,
          hasMore: orders.length === pageSize,
          nextCursor: orders.length ? orders[orders.length - 1].id : null
        }
      };
      
    } catch (error) {
      console.error('[OrderService] List orders failed:', error);
      throw error;
    }
  }
  
  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} newStatus - New status
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(orderId, newStatus, metadata = {}) {
    try {
      const user = this.#authService.getCurrentUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }
      
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }
      
      // Validate status transition
      const allowedTransitions = {
        pending: ['processing', 'cancelled'],
        processing: ['confirmed', 'cancelled'],
        confirmed: ['shipped', 'cancelled'],
        shipped: ['delivered', 'cancelled'],
        delivered: ['refunded'],
        cancelled: [],
        refunded: []
      };
      
      if (!allowedTransitions[order.status]?.includes(newStatus)) {
        throw new Error(`INVALID_STATUS_TRANSITION: ${order.status} -> ${newStatus}`);
      }
      
      const updates = {
        status: newStatus,
        updatedAt: Timestamp.now()
      };
      
      // Add status-specific timestamps
      if (newStatus === 'processing') {
        updates.processedAt = Timestamp.now();
      } else if (newStatus === 'delivered') {
        updates.deliveredAt = Timestamp.now();
      } else if (newStatus === 'cancelled') {
        updates.cancelledAt = Timestamp.now();
      }
      
      // Add tracking info if shipping
      if (newStatus === 'shipped' && metadata.trackingNumber) {
        updates.trackingNumber = metadata.trackingNumber;
        updates.carrier = metadata.carrier;
        updates.estimatedDelivery = metadata.estimatedDelivery 
          ? Timestamp.fromDate(new Date(metadata.estimatedDelivery))
          : null;
      }
      
      const orderRef = doc(this.#db, 'orders', orderId);
      await updateDoc(orderRef, updates);
      
      // Invalidate cache
      this.#cache.delete(orderId);
      
      console.info(`[OrderService] Order ${order.orderNumber} status updated: ${order.status} -> ${newStatus}`);
      
      // Trigger status change hook
      await this.#onOrderStatusChanged(order, newStatus, metadata);
      
      return this.getOrder(orderId);
      
    } catch (error) {
      console.error('[OrderService] Update status failed:', error);
      throw error;
    }
  }
  
  /**
   * Process payment for order
   * @param {string} orderId - Order ID
   * @param {string} paymentMethod - Payment method
   * @param {Object} paymentDetails - Payment details
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(orderId, paymentMethod, paymentDetails) {
    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }
      
      if (order.paymentStatus === 'paid') {
        throw new Error('ORDER_ALREADY_PAID');
      }
      
      // Get payment provider integration
      const stripeIntegration = await this.#integrationService?.getIntegration('stripe');
      
      let paymentResult;
      
      if (paymentMethod === 'stripe' && stripeIntegration) {
        paymentResult = await this.#processStripePayment(order, paymentDetails);
      } else {
        // Simulate payment processing
        paymentResult = {
          success: true,
          paymentId: `pay_${Date.now()}`,
          amount: order.total,
          currency: order.currency
        };
      }
      
      if (paymentResult.success) {
        const updates = {
          paymentStatus: 'paid',
          paymentMethod,
          paymentId: paymentResult.paymentId,
          updatedAt: Timestamp.now()
        };
        
        const orderRef = doc(this.#db, 'orders', orderId);
        await updateDoc(orderRef, updates);
        
        this.#cache.delete(orderId);
        
        // Auto-confirm if configured
        if (this.#config.autoConfirmOrders) {
          await this.updateOrderStatus(orderId, 'confirmed');
        }
        
        // Trigger payment received hook
        await this.#onPaymentReceived(order, paymentResult);
        
        return {
          success: true,
          paymentId: paymentResult.paymentId,
          orderId,
          amount: order.total
        };
      }
      
      return {
        success: false,
        error: paymentResult.error
      };
      
    } catch (error) {
      console.error('[OrderService] Payment processing failed:', error);
      
      // Update payment status to failed
      const orderRef = doc(this.#db, 'orders', orderId);
      await updateDoc(orderRef, {
        paymentStatus: 'failed',
        updatedAt: Timestamp.now()
      });
      
      throw error;
    }
  }
  
  /**
   * Process refund for order
   * @param {string} orderId - Order ID
   * @param {Object} refundData - Refund details
   * @returns {Promise<Object>} Refund result
   */
  async processRefund(orderId, refundData = {}) {
    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }
      
      if (order.paymentStatus !== 'paid') {
        throw new Error('ORDER_NOT_PAID');
      }
      
      const refundAmount = refundData.amount || order.total;
      const refundReason = refundData.reason || 'customer_request';
      
      // Process refund with payment provider
      let refundResult;
      
      if (order.paymentMethod === 'stripe' && order.paymentId) {
        refundResult = await this.#processStripeRefund(order, refundAmount);
      } else {
        refundResult = { success: true, refundId: `ref_${Date.now()}` };
      }
      
      if (refundResult.success) {
        const updates = {
          paymentStatus: refundAmount === order.total ? 'refunded' : 'partial',
          updatedAt: Timestamp.now()
        };
        
        if (refundAmount === order.total) {
          updates.status = 'refunded';
          updates.cancelledAt = Timestamp.now();
        }
        
        const orderRef = doc(this.#db, 'orders', orderId);
        await updateDoc(orderRef, updates);
        
        this.#cache.delete(orderId);
        
        // Create refund record
        const refundRef = doc(collection(this.#db, 'refunds'));
        await setDoc(refundRef, {
          id: refundRef.id,
          orderId,
          amount: refundAmount,
          reason: refundReason,
          refundId: refundResult.refundId,
          createdAt: Timestamp.now(),
          processedBy: this.#authService.getCurrentUser()?.uid
        });
        
        return {
          success: true,
          refundId: refundResult.refundId,
          amount: refundAmount
        };
      }
      
      return {
        success: false,
        error: refundResult.error
      };
      
    } catch (error) {
      console.error('[OrderService] Refund processing failed:', error);
      throw error;
    }
  }
  
  /**
   * Generate unique order number
   * @private
   * @returns {Promise<string>} Order number
   */
  async #generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get today's order count
    const startOfDay = new Date(year, month - 1, day);
    const endOfDay = new Date(year, month - 1, day + 1);
    
    const q = query(
      collection(this.#db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
      where('createdAt', '<', Timestamp.fromDate(endOfDay))
    );
    
    const snapshot = await getDocs(q);
    const sequence = String(snapshot.size + 1).padStart(4, '0');
    
    return `${this.#config.orderPrefix}-${year}${month}${day}-${sequence}`;
  }
  
  /**
   * Validate order before creation
   * @private
   * @param {Object} order - Order to validate
   * @throws {Error} If validation fails
   */
  #validateOrder(order) {
    if (!order.items || order.items.length === 0) {
      throw new Error('NO_ITEMS_IN_ORDER');
    }
    
    if (order.total <= 0) {
      throw new Error('INVALID_ORDER_TOTAL');
    }
    
    if (!order.shippingAddress || !order.shippingAddress.address1) {
      throw new Error('SHIPPING_ADDRESS_REQUIRED');
    }
  }
  
  /**
   * Process Stripe payment
   * @private
   */
  async #processStripePayment(order, paymentDetails) {
    // Implementation would use Stripe SDK
    return { success: true, paymentId: `stripe_${Date.now()}` };
  }
  
  /**
   * Process Stripe refund
   * @private
   */
  async #processStripeRefund(order, amount) {
    // Implementation would use Stripe SDK
    return { success: true, refundId: `stripe_ref_${Date.now()}` };
  }
  
  /**
   * Handle order creation hooks
   * @private
   */
  async #onOrderCreated(order) {
    // Send confirmation email
    // Update inventory
    // Trigger analytics
    console.info(`[OrderService] Order created hook: ${order.orderNumber}`);
  }
  
  /**
   * Handle status change hooks
   * @private
   */
  async #onOrderStatusChanged(order, newStatus, metadata) {
    console.info(`[OrderService] Order status changed: ${order.orderNumber} -> ${newStatus}`);
  }
  
  /**
   * Handle payment received hooks
   * @private
   */
  async #onPaymentReceived(order, payment) {
    console.info(`[OrderService] Payment received for order: ${order.orderNumber}`);
  }
  
  /**
   * Generate unique ID
   * @private
   */
  #generateId() {
    return `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Normalize error messages
   * @private
   */
  #normalizeError(error) {
    const errorMap = {
      'AUTH_REQUIRED': 'Authentication required',
      'CART_EMPTY': 'Cannot create order from empty cart',
      'ORDER_NOT_FOUND': 'Order not found',
      'ORDER_ALREADY_PAID': 'Order has already been paid',
      'ORDER_NOT_PAID': 'Cannot refund unpaid order',
      'INVALID_STATUS_TRANSITION': 'Invalid status transition',
      'NO_ITEMS_IN_ORDER': 'Order must contain at least one item',
      'INVALID_ORDER_TOTAL': 'Invalid order total',
      'SHIPPING_ADDRESS_REQUIRED': 'Shipping address is required'
    };
    
    const message = errorMap[error.message] || error.message || 'ORDER_ERROR';
    const normalizedError = new Error(message);
    normalizedError.originalError = error;
    
    return normalizedError;
  }
}

const orderService = OrderService.getInstance();
export default orderService;