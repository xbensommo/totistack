/** @file src/modules/documents/domain/computeDocumentTotals.js */
export function computeDocumentTotals({ lineItems = [], vatRate = 0 }) {
  const normalizedItems = lineItems.map((item) => {
    const qty = Number(item.qty || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const total = Number((qty * unitPrice).toFixed(2));
    return { ...item, qty, unitPrice, total };
  });
  const subtotal = normalizedItems.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = Number((subtotal * (Number(vatRate || 0) / 100)).toFixed(2));
  const total = Number((subtotal + vatAmount).toFixed(2));
  return { lineItems: normalizedItems, subtotal: Number(subtotal.toFixed(2)), vatAmount, total };
}
