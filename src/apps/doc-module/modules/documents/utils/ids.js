export function createId(prefix = 'doc') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
