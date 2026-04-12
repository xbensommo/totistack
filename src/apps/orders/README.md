# Orders App

Production-ready starter Orders app aligned with the latest Totistack declarative assembly model.

## What this app exports

- `app.manifest.js`
- `routes.js`
- `index.js`
- `collections/orders.collection.js`
- `services/orderService.js`
- starter Vue pages and reusable UI components

## Architecture rules followed

- declarative app only
- no runtime route registration
- no provider creation
- no direct Firestore access
- expects a single root shard-provider from Totistack
- expects generated collection actions from the root store
- expects auth/rbac to live in the default root store

## Root store compatibility

The service resolves order actions from one of these shapes:

- `store.ordersActions`
- `store.orderActions`
- `store.collectionsActions.orders`

## Included starter screens

- Orders list
- Order detail
- Cart
- Checkout
- Invoice

## Notes

This update intentionally trims the prototype to the real collection currently shipped in the source zip: `orders`.
Additional collections such as refunds, carts, payments, or shipments can be added later as separate declarative collection files when they actually exist.
