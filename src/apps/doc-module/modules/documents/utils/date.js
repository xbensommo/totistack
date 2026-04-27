export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-NA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}
