# Orders App

Production-ready, business-ready Orders app aligned with the latest Totistack declarative assembly model.

## What this app exports

- `app.manifest.js`
- `routes.js`
- `index.js`
- `permissions.js`
- `business/default-profile.js`
- `business/profiles/*`
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

The service resolves order actions directly from the generated root-store action:

```js
store.ordersActions.fetchInitialPage(options)
store.ordersActions.getById(id)
store.ordersActions.add(payload)
store.ordersActions.update(id, patch)
store.ordersActions.remove(id)
```


## Business profile support

Included profiles:

- `generic`
- `totisoft`
- `eduprolic`

Use this app as:

- e-commerce orders
- internal back-office orders
- quote-to-order conversion
- service/project orders
- assignment-style orders

## Security and authorization

The app now includes:

- centralized order permissions
- owner-aware access checks
- service-level authorization checks
- normalized validation / forbidden / runtime errors

## Notes

This version replaces the older generic `userId` order ownership pattern with clearer business fields such as:

- `customerId`
- `placedById`
- `assignedTo`
- `businessProfile`
- `businessData`
- `workflowData`

The UI starter screens remain lightweight on purpose. The service layer is the main upgrade and is ready to be wired into richer business flows later.
