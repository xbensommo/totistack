# Finance UI/PDF Patch for v2.2.13

The current finance version kept the ledger, but removed the client-facing PDF layer. That was the wrong product tradeoff.

This patch adds a dedicated finance PDF engine without weakening the ledger architecture.

## Added

- `services/financePdfEngine.js`
- `services/invoicePdfService.js`
- `services/quotationPdfService.js`
- `pages/FinanceDocumentsPage.vue`
- `/finance/documents` route
- `finance.document.pdf` permission
- navigation item: `PDF Documents`

## Supported PDFs

- invoice
- quotation
- receipt
- payment confirmation
- payout statement
- statement

## Dependency

Host project must have:

```bash
npm i pdfmake
```

## Usage

```js
import { downloadInvoicePdf, downloadQuotationPdf } from '@/apps/finance'

await downloadInvoicePdf(invoice)
await downloadQuotationPdf(quotation)
```

Use this PDF engine from invoice, quotation, payment, receipt, and payout pages. Ledger data remains the source of truth. PDFs are output artifacts.
