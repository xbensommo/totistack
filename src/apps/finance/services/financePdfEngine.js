/**
 * @file src/apps/finance/services/financePdfEngine.js
 * @description Browser-side finance PDF generator for invoices, quotations, receipts, payment confirmations, and statements.
 *
 * Install in host project:
 *   npm i pdfmake
 */

import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { financeCompanyProfile } from '../config/financeCompanyProfile.js'

pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs

const DOCUMENT_TITLES = Object.freeze({
  invoice: 'INVOICE',
  quotation: 'QUOTATION',
  quote: 'QUOTATION',
  receipt: 'RECEIPT',
  payment: 'PAYMENT CONFIRMATION',
  payout: 'PAYOUT STATEMENT',
  statement: 'STATEMENT',
})

function safeText(value, fallback = '—') {
  const text = String(value ?? '').trim()
  return text || fallback
}

function normalizeType(type) {
  const value = String(type || 'invoice').trim().toLowerCase()
  if (value === 'quote') return 'quotation'
  if (value === 'payment_receipt') return 'receipt'
  return value || 'invoice'
}

function money(value, currency = 'NAD') {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('en-NA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

function dateText(value) {
  if (!value) return '—'
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-NA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date)
}

function fileSafe(value) {
  return String(value || 'finance-document')
    .trim()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

async function imageUrlToDataUrl(url) {
  if (!url) return null
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function normalizeCompany(options = {}) {
  return {
    ...financeCompanyProfile,
    ...(options.company || {}),
    addressLines: Array.isArray(options.company?.addressLines)
      ? options.company.addressLines
      : Array.isArray(financeCompanyProfile.addressLines)
        ? financeCompanyProfile.addressLines
        : [],
  }
}

function inferDocumentCode(type, data = {}) {
  return (
    data.documentCode ||
    data.invoiceCode ||
    data.quotationCode ||
    data.quoteCode ||
    data.receiptCode ||
    data.paymentCode ||
    data.payoutCode ||
    data.reference ||
    data.number ||
    data.id ||
    `${type}-${Date.now()}`
  )
}

function normalizeLineItems(data = {}) {
  const items = Array.isArray(data.lineItems)
    ? data.lineItems
    : Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.services)
        ? data.services
        : []

  if (items.length) {
    return items.map((item, index) => {
      const quantity = Number(item.quantity ?? item.qty ?? 1)
      const unitPrice = Number(item.unitPrice ?? item.price ?? item.amount ?? 0)
      const total = Number(item.total ?? item.totalAmount ?? quantity * unitPrice)
      return {
        number: index + 1,
        description: safeText(item.description || item.label || item.name || item.title, 'Finance item'),
        quantity,
        unitPrice,
        total,
      }
    })
  }

  const fallbackAmount = Number(data.totalAmount ?? data.amount ?? data.paidAmount ?? data.receivedAmount ?? 0)
  return [
    {
      number: 1,
      description: safeText(
        data.description || data.memo || data.engagementCode || data.serviceName || data.reference,
        'Professional service',
      ),
      quantity: 1,
      unitPrice: fallbackAmount,
      total: fallbackAmount,
    },
  ]
}

function buildItemRows(lineItems, currency) {
  return [
    [
      { text: '#', style: 'tableHead' },
      { text: 'Description', style: 'tableHead' },
      { text: 'Qty', style: 'tableHead', alignment: 'right' },
      { text: 'Unit Price', style: 'tableHead', alignment: 'right' },
      { text: 'Total', style: 'tableHead', alignment: 'right' },
    ],
    ...lineItems.map((item) => [
      { text: String(item.number), margin: [0, 4, 0, 4] },
      { text: item.description, margin: [0, 4, 0, 4] },
      { text: String(item.quantity), alignment: 'right', margin: [0, 4, 0, 4] },
      { text: money(item.unitPrice, currency), alignment: 'right', margin: [0, 4, 0, 4] },
      { text: money(item.total, currency), alignment: 'right', margin: [0, 4, 0, 4] },
    ]),
  ]
}

function buildTotalsRows(type, data, lineItems, currency) {
  const subtotal = Number(data.subtotalAmount ?? lineItems.reduce((sum, item) => sum + Number(item.total || 0), 0))
  const discount = Number(data.discountAmount ?? 0)
  const tax = Number(data.taxAmount ?? 0)
  const total = Number(data.totalAmount ?? data.amount ?? subtotal - discount + tax)
  const paid = Number(data.allocatedAmount ?? data.paidAmount ?? data.receivedAmount ?? 0)
  const balance = Number(data.balanceAmount ?? Math.max(total - paid, 0))
  const deposit = Number(data.depositAmount ?? data.depositRequired ?? 0)

  const rows = [['Subtotal', money(subtotal, currency)]]

  if (discount) rows.push(['Discount', money(discount, currency)])
  if (tax) rows.push(['Tax', money(tax, currency)])
  if (type === 'quotation' && deposit) rows.push(['Deposit required', money(deposit, currency)])
  rows.push(['Total', money(total, currency)])
  if (['invoice', 'receipt', 'payment'].includes(type)) rows.push(['Paid', money(paid, currency)])
  if (type === 'invoice') rows.push(['Balance due', money(balance, currency)])

  return rows.map(([label, value], index) => [
    { text: label, style: index === rows.length - 1 ? 'totalLabel' : 'summaryLabel' },
    { text: value, style: index === rows.length - 1 ? 'totalValue' : 'summaryValue' },
  ])
}

function partyName(data = {}) {
  return safeText(
    data.clientLabel ||
    data.clientName ||
    data.customerName ||
    data.recipientName ||
    data.consultantLabel ||
    data.vendorName ||
    data.client?.name,
    'Client',
  )
}

function buildReferenceStack(type, data, currency) {
  const refs = [
    { label: 'Reference', value: data.reference || data.sourceRef || data.engagementCode || data.engagementId },
    { label: 'Currency', value: currency },
    { label: 'Payment method', value: data.paymentMethod || data.method },
    { label: 'Status', value: data.status },
    { label: type === 'quotation' ? 'Valid until' : 'Due date', value: dateText(data.validUntil || data.expiryDate || data.dueDate) },
  ].filter((item) => item.value && item.value !== '—')

  return refs.map((item) => ({ text: `${item.label}: ${item.value}`, style: 'muted' }))
}

export async function buildFinanceDocumentDefinition(input = {}, options = {}) {
  const type = normalizeType(input.type || options.type)
  const data = input.data || input.document || input
  const company = normalizeCompany(options)
  const currency = data.currency || options.currency || company.currency || 'NAD'
  const logoDataUrl = await imageUrlToDataUrl(options.logoDataUrl || options.logoUrl || company.logoDataUrl || company.logoUrl)
  const lineItems = normalizeLineItems(data)
  const documentCode = safeText(inferDocumentCode(type, data), `${type.toUpperCase()}-${Date.now()}`)
  const title = options.title || DOCUMENT_TITLES[type] || 'FINANCE DOCUMENT'

  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 50],
    content: [
      {
        columns: [
          logoDataUrl
            ? { width: 88, image: logoDataUrl, fit: [76, 76] }
            : { width: 88, text: safeText(company.shortName || company.name || 'Company', 'Company'), style: 'logoFallback' },
          {
            width: '*',
            stack: [
              { text: company.name || 'Company', style: 'companyName' },
              company.tagline ? { text: company.tagline, style: 'muted' } : null,
              company.email ? { text: company.email, style: 'muted' } : null,
              company.phone ? { text: company.phone, style: 'muted' } : null,
              company.website ? { text: company.website, style: 'muted' } : null,
              ...(company.addressLines || []).map((line) => ({ text: line, style: 'muted' })),
            ].filter(Boolean),
          },
          {
            width: 170,
            stack: [
              { text: title, style: 'documentTitle', alignment: 'right' },
              { text: documentCode, style: 'documentCode', alignment: 'right' },
              { text: `Issue date: ${dateText(data.issueDate || data.documentDate || data.createdAt || new Date())}`, style: 'rightMeta' },
              data.dueDate ? { text: `Due date: ${dateText(data.dueDate)}`, style: 'rightMeta' } : null,
              data.status ? { text: `Status: ${safeText(data.status)}`, style: 'rightMeta' } : null,
            ].filter(Boolean),
          },
        ],
        columnGap: 12,
      },
      {
        canvas: [{ type: 'line', x1: 0, y1: 18, x2: 515, y2: 18, lineWidth: 1, lineColor: '#E2E8F0' }],
        margin: [0, 4, 0, 24],
      },
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: type === 'payout' ? 'Payee' : 'Client', style: 'sectionTitle' },
              { text: partyName(data), style: 'strongText' },
              data.clientNumber || data.clientId ? { text: `Client No: ${safeText(data.clientNumber || data.clientId)}`, style: 'muted' } : null,
              data.clientEmail ? { text: data.clientEmail, style: 'muted' } : null,
              data.clientPhone ? { text: data.clientPhone, style: 'muted' } : null,
            ].filter(Boolean),
          },
          {
            width: '*',
            stack: [
              { text: 'Reference', style: 'sectionTitle' },
              ...buildReferenceStack(type, data, currency),
            ],
          },
        ],
        columnGap: 24,
        margin: [0, 0, 0, 24],
      },
      {
        table: {
          headerRows: 1,
          widths: [28, '*', 45, 85, 85],
          body: buildItemRows(lineItems, currency),
        },
        layout: {
          fillColor(rowIndex) { return rowIndex === 0 ? '#F8FAFC' : null },
          hLineColor() { return '#E2E8F0' },
          vLineColor() { return '#E2E8F0' },
        },
      },
      {
        columns: [
          {
            width: '*',
            stack: [
              data.notes ? { text: 'Notes', style: 'sectionTitle', margin: [0, 18, 0, 6] } : null,
              data.notes ? { text: data.notes, style: 'muted' } : null,
              data.terms ? { text: 'Terms', style: 'sectionTitle', margin: [0, 18, 0, 6] } : null,
              data.terms ? { text: data.terms, style: 'muted' } : null,
            ].filter(Boolean),
          },
          {
            width: 210,
            margin: [0, 18, 0, 0],
            table: {
              widths: ['*', 90],
              body: buildTotalsRows(type, data, lineItems, currency),
            },
            layout: {
              hLineColor() { return '#E2E8F0' },
              vLineColor() { return '#E2E8F0' },
            },
          },
        ],
        columnGap: 24,
      },
      {
        text: company.footerNote || 'Generated by Totistack Finance.',
        style: 'footerNote',
        margin: [0, 34, 0, 0],
      },
    ],
    styles: {
      logoFallback: { fontSize: 12, bold: true, color: '#0F172A', margin: [0, 8, 0, 0] },
      companyName: { fontSize: 15, bold: true, color: '#0F172A' },
      documentTitle: { fontSize: 24, bold: true, color: '#0F172A', margin: [0, 0, 0, 4] },
      documentCode: { fontSize: 10, color: '#475569', margin: [0, 0, 0, 8] },
      sectionTitle: { fontSize: 9, bold: true, color: '#0F172A', margin: [0, 0, 0, 5] },
      strongText: { fontSize: 11, bold: true, color: '#0F172A', margin: [0, 0, 0, 3] },
      muted: { fontSize: 9, color: '#64748B', lineHeight: 1.25 },
      rightMeta: { fontSize: 8.5, color: '#64748B', alignment: 'right', margin: [0, 0, 0, 3] },
      tableHead: { fontSize: 8.5, bold: true, color: '#0F172A', margin: [0, 5, 0, 5] },
      summaryLabel: { fontSize: 9, color: '#475569', margin: [0, 5, 0, 5] },
      summaryValue: { fontSize: 9, color: '#0F172A', alignment: 'right', margin: [0, 5, 0, 5] },
      totalLabel: { fontSize: 10, bold: true, color: '#0F172A', margin: [0, 7, 0, 7] },
      totalValue: { fontSize: 10, bold: true, color: '#0F172A', alignment: 'right', margin: [0, 7, 0, 7] },
      footerNote: { fontSize: 8.5, color: '#94A3B8', alignment: 'center' },
    },
    defaultStyle: {
      fontSize: 9,
      color: '#334155',
    },
  }
}

export async function downloadFinanceDocumentPdf(input = {}, options = {}) {
  const type = normalizeType(input.type || options.type)
  const data = input.data || input.document || input
  const documentCode = inferDocumentCode(type, data)
  const filename = options.filename || `${fileSafe(documentCode)}.pdf`
  const definition = await buildFinanceDocumentDefinition(input, options)
  pdfMake.createPdf(definition).download(filename)
  return { filename, definition }
}

export function createFinancePdfActions(defaultOptions = {}) {
  return {
    invoice: (data, options = {}) => downloadFinanceDocumentPdf({ type: 'invoice', data }, { ...defaultOptions, ...options }),
    quotation: (data, options = {}) => downloadFinanceDocumentPdf({ type: 'quotation', data }, { ...defaultOptions, ...options }),
    receipt: (data, options = {}) => downloadFinanceDocumentPdf({ type: 'receipt', data }, { ...defaultOptions, ...options }),
    payment: (data, options = {}) => downloadFinanceDocumentPdf({ type: 'payment', data }, { ...defaultOptions, ...options }),
    payout: (data, options = {}) => downloadFinanceDocumentPdf({ type: 'payout', data }, { ...defaultOptions, ...options }),
    statement: (data, options = {}) => downloadFinanceDocumentPdf({ type: 'statement', data }, { ...defaultOptions, ...options }),
  }
}

export function downloadInvoicePdf(data, options = {}) {
  return downloadFinanceDocumentPdf({ type: 'invoice', data }, options)
}

export function downloadQuotationPdf(data, options = {}) {
  return downloadFinanceDocumentPdf({ type: 'quotation', data }, options)
}

export function downloadReceiptPdf(data, options = {}) {
  return downloadFinanceDocumentPdf({ type: 'receipt', data }, options)
}

export function downloadPaymentPdf(data, options = {}) {
  return downloadFinanceDocumentPdf({ type: 'payment', data }, options)
}
