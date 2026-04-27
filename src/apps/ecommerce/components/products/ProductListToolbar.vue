<template>
  <section class="grid gap-3 md:grid-cols-5">
    <input class="rounded-2xl border px-4 py-3" placeholder="Search products or services" />
    <select class="rounded-2xl border px-4 py-3">
      <option>All status</option>
      <option>Active</option>
      <option>Draft</option>
      <option>Archived</option>
    </select>
    <select class="rounded-2xl border px-4 py-3">
      <option>All types</option>
      <option>Product</option>
      <option>Service</option>
    </select>
    <select class="rounded-2xl border px-4 py-3">
      <option>All channels</option>
      <option>Online</option>
      <option>Retail</option>
      <option>Wholesale</option>
    </select>
    <button class="rounded-2xl border px-4 py-3 text-left">Export catalog</button>
  </section>
</template>
