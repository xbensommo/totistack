# Totistack v2.2.13 UI/PDF Recovery Patch

This patch restores the useful older UX while keeping the newer architecture.

## Notifications

Current notifications were too bare. This patch restores:

- notification bell
- right drawer
- notification center
- filters
- preferences
- template admin page
- delivery logs
- runtime store bridge

It keeps:

- FCM client service
- Firestore inbox service
- current notification collections

## Finance

Current finance kept ledger discipline but removed the client-facing PDF value. This patch adds:

- generic finance PDF engine
- invoice PDF
- quotation PDF
- receipt PDF
- payment confirmation PDF
- payout statement PDF
- statement PDF
- `/finance/documents` page

## Apply

Copy the `src/` folder over the framework source and overwrite matching files.

Then make sure generated projects install:

```bash
npm i pdfmake
```
