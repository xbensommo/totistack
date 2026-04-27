<template>
  <section class="mx-auto max-w-6xl space-y-6 px-4 py-8">
    <header class="space-y-2">
      <p class="text-sm uppercase tracking-[0.2em] opacity-60">Checkout</p>
      <h1 class="text-3xl font-semibold">Storefront checkout</h1>
      <p class="max-w-3xl opacity-70">
        Public checkout shell for Namibia-first commerce. Capture only what is necessary and let the ecommerce services validate shipping, payment, and order creation.
      </p>
    </header>

    <div class="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <form class="space-y-6 rounded-3xl border p-6" @submit.prevent="submitCheckout">
        <section class="space-y-4">
          <h2 class="text-lg font-semibold">Contact</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="grid gap-2">
              <span class="text-sm opacity-70">Full name</span>
              <input v-model="form.fullName" class="rounded-2xl border px-4 py-3" placeholder="Customer name" />
            </label>
            <label class="grid gap-2">
              <span class="text-sm opacity-70">Email</span>
              <input v-model="form.email" type="email" class="rounded-2xl border px-4 py-3" placeholder="name@example.com" />
            </label>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-lg font-semibold">Billing address</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="grid gap-2 md:col-span-2">
              <span class="text-sm opacity-70">Address line</span>
              <input v-model="form.billingAddress.line1" class="rounded-2xl border px-4 py-3" placeholder="Street, suburb, city" />
            </label>
            <label class="grid gap-2">
              <span class="text-sm opacity-70">City</span>
              <input v-model="form.billingAddress.city" class="rounded-2xl border px-4 py-3" placeholder="Windhoek" />
            </label>
            <label class="grid gap-2">
              <span class="text-sm opacity-70">Country</span>
              <input v-model="form.billingAddress.country" class="rounded-2xl border px-4 py-3" placeholder="Namibia" />
            </label>
          </div>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold">Shipping</h2>
            <span class="text-xs uppercase tracking-[0.2em] opacity-60">{{ requiresShipping ? 'Required' : 'Not required for service-only carts' }}</span>
          </div>

          <div v-if="requiresShipping" class="grid gap-4 md:grid-cols-2">
            <label class="grid gap-2 md:col-span-2">
              <span class="text-sm opacity-70">Shipping address</span>
              <input v-model="form.shippingAddress.line1" class="rounded-2xl border px-4 py-3" placeholder="Delivery street and suburb" />
            </label>
            <label class="grid gap-2">
              <span class="text-sm opacity-70">City</span>
              <input v-model="form.shippingAddress.city" class="rounded-2xl border px-4 py-3" placeholder="Windhoek" />
            </label>
            <label class="grid gap-2">
              <span class="text-sm opacity-70">Instructions</span>
              <input v-model="form.shippingInstructions" class="rounded-2xl border px-4 py-3" placeholder="Gate code, landmark, etc." />
            </label>
          </div>

          <div v-else class="rounded-2xl border p-4 text-sm opacity-70">
            This cart is treated as a service order. Shipping address is intentionally not collected.
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-lg font-semibold">Payment method</h2>
          <div class="grid gap-3">
            <label
              v-for="method in paymentOptions"
              :key="method.code"
              class="flex cursor-pointer items-start gap-3 rounded-2xl border p-4"
            >
              <input v-model="form.paymentMethod" :value="method.code" type="radio" class="mt-1" />
              <span class="space-y-1">
                <span class="block font-medium">{{ method.label }}</span>
                <span class="block text-sm opacity-70">{{ method.description }}</span>
                <span v-if="method.requiresProof" class="block text-xs uppercase tracking-[0.2em] opacity-60">
                  Manual review required
                </span>
              </span>
            </label>
          </div>

          <div v-if="form.paymentMethod === 'eft'" class="rounded-2xl border p-4 text-sm opacity-70">
            EFT orders should create a payment transaction first. The customer then uploads proof, finance reviews it, and only then should the order be treated as paid.
          </div>
        </section>

        <button type="submit" class="rounded-2xl border px-5 py-3 font-medium">
          Validate checkout shell
        </button>
      </form>

      <aside class="space-y-4 rounded-3xl border p-6">
        <h2 class="text-lg font-semibold">Order summary</h2>

        <div class="space-y-3 text-sm">
          <div v-for="item in sampleCart.lineItems" :key="item.sku" class="flex items-start justify-between gap-4">
            <div>
              <p class="font-medium">{{ item.name }}</p>
              <p class="opacity-70">{{ item.description }}</p>
            </div>
            <p class="font-medium">N${{ item.price.toFixed(2) }}</p>
          </div>
        </div>

        <div class="space-y-2 border-t pt-4 text-sm">
          <div class="flex items-center justify-between"><span class="opacity-70">Subtotal</span><span>N${{ subtotal.toFixed(2) }}</span></div>
          <div class="flex items-center justify-between"><span class="opacity-70">Shipping</span><span>N${{ shipping.toFixed(2) }}</span></div>
          <div class="flex items-center justify-between"><span class="opacity-70">VAT</span><span>N${{ tax.toFixed(2) }}</span></div>
          <div class="flex items-center justify-between font-semibold"><span>Total</span><span>N${{ grandTotal.toFixed(2) }}</span></div>
        </div>

        <div class="rounded-2xl border p-4 text-sm opacity-70">
          The real submit path should call <code>checkoutService.placeOrder()</code> from the injected ecommerce services, not duplicate business rules inside the page.
        </div>

        <p v-if="feedback" class="rounded-2xl border p-4 text-sm">
          {{ feedback }}
        </p>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { createPaymentService } from '../services/payment.service.js'

const paymentService = createPaymentService()
const paymentOptions = paymentService.getPublicCheckoutOptions()

const sampleCart = reactive({
  lineItems: [
    {
      sku: 'svc-brand-review',
      name: 'Brand review session',
      description: 'Service example',
      price: 850,
      productType: 'service',
    },
    {
      sku: 'prod-label-roll',
      name: 'Printed label roll',
      description: 'Physical product example',
      price: 120,
      productType: 'product',
    },
  ],
})

const form = reactive({
  fullName: '',
  email: '',
  billingAddress: {
    line1: '',
    city: '',
    country: 'Namibia',
  },
  shippingAddress: {
    line1: '',
    city: '',
  },
  shippingInstructions: '',
  paymentMethod: 'eft',
})

const feedback = ref('')

const requiresShipping = computed(() => {
  return sampleCart.lineItems.some((item) => item.productType !== 'service')
})

const subtotal = computed(() => {
  return sampleCart.lineItems.reduce((sum, item) => sum + Number(item.price || 0), 0)
})

const shipping = computed(() => (requiresShipping.value ? 85 : 0))
const tax = computed(() => Number((subtotal.value * 0.15).toFixed(2)))
const grandTotal = computed(() => Number((subtotal.value + shipping.value + tax.value).toFixed(2)))

function submitCheckout() {
  feedback.value = [
    `Email: ${form.email || 'missing'}`,
    `Payment: ${form.paymentMethod}`,
    requiresShipping.value && !form.shippingAddress.line1 ? 'Shipping address still required for this mixed cart.' : 'Shipping state looks acceptable.',
    form.paymentMethod === 'eft' ? 'EFT selected: proof submission flow must follow order creation.' : 'No manual proof flow required for the selected method.',
  ].join(' ')
}
</script>
