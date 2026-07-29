export function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(d, n) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function formatDisplayDate(isoDateString) {
  if (!isoDateString) return null;
  const [y, m, d] = isoDateString.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}
