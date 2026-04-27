export function formatMoney(amount, currency = 'NAD') {
  const value = Number(amount || 0);
  try {
    return new Intl.NumberFormat('en-NA', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}
