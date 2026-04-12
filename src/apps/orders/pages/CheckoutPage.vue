<template>
  <EntityPageShell
    eyebrow="Commerce operations"
    title="Checkout"
    description="A generic starter checkout screen that can be extended for online orders, back-office orders, or quote conversion."
  >
    <div class="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_380px]">
      <section class="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Customer & delivery</p>
          <h2 class="mt-1 text-lg font-semibold text-slate-950">Checkout details</h2>
        </div>

        <form class="mt-5 grid gap-4 md:grid-cols-2" @submit.prevent="submitOrder">
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-700">First name</span>
            <input v-model="form.firstName" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400">
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-700">Last name</span>
            <input v-model="form.lastName" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400">
          </label>
          <label class="space-y-2 md:col-span-2">
            <span class="text-sm font-medium text-slate-700">Email</span>
            <input v-model="form.email" type="email" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400">
          </label>
          <label class="space-y-2 md:col-span-2">
            <span class="text-sm font-medium text-slate-700">Address</span>
            <input v-model="form.address1" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400">
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-700">City</span>
            <input v-model="form.city" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400">
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-700">Country</span>
            <input v-model="form.country" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400">
          </label>
          <label class="space-y-2 md:col-span-2">
            <span class="text-sm font-medium text-slate-700">Notes</span>
            <textarea v-model="form.notes" rows="4" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"></textarea>
          </label>

          <div class="md:col-span-2 flex flex-wrap gap-3 pt-2">
            <button type="submit" class="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
              Create sample order
            </button>
            <span class="inline-flex items-center rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
              {{ submitState }}
            </span>
          </div>
        </form>
      </section>

      <section class="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Starter summary</p>
        <h2 class="mt-1 text-lg font-semibold text-slate-950">What this page is for</h2>
        <ul class="mt-5 space-y-3 text-sm leading-6 text-slate-600">
          <li>Use it as a real checkout page for e-commerce.</li>
          <li>Use it as an internal order-capture form for staff.</li>
          <li>Use it as a quote-to-order conversion screen.</li>
        </ul>

        <div class="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          This starter creates an example order through the shared order service and the root store action adapter.
        </div>
      </section>
    </div>
  </EntityPageShell>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { createOrderServices } from '../services/orderService.js'
import EntityPageShell from '../components/EntityPageShell.vue'

const router = useRouter()
const store = useAppStore()
const orderService = createOrderServices({ store })

const submitState = ref('Ready')
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  address1: '',
  city: '',
  country: '',
  notes: '',
})

async function submitOrder() {
  submitState.value = 'Creating order...'

  try {
    const result = await orderService.create({
      items: [
        { title: 'Starter order item', quantity: 1, price: 150, sku: 'STARTER-001' },
        { title: 'Implementation add-on', quantity: 1, price: 45, sku: 'ADDON-001' },
      ],
      shippingAddress: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        address1: form.address1,
        city: form.city,
        country: form.country,
      },
      customerNotes: form.notes,
      taxRate: 0.15,
      shipping: 0,
      currency: 'USD',
    })

    submitState.value = 'Order created'

    if (result?.id) {
      router.push(`/orders/${result.id}`)
    }
  } catch (error) {
    console.error('[CheckoutPage] Failed to create order.', error)
    submitState.value = error?.message || 'Failed to create order'
  }
}
</script>
