# Ecommerce Action Modal Bridge

This app does not force a specific modal component.
It bridges to the project's global confirm/action modal provider.

Recommended payload fields:

- `intent`
- `title`
- `message`
- `confirmLabel`
- `cancelLabel`
- `tone`
- `meta`

Recommended result:

```js
{ confirmed: true, reason: null }
```
