// Utility: format tanggal ke format Indonesia
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;

  const defaultOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  };
  return date.toLocaleDateString('id-ID', defaultOptions);
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelative = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const minute = 60_000;
  const hour   = 3_600_000;
  const day    = 86_400_000;

  if (diff < minute)  return 'Baru saja';
  if (diff < hour)    return `${Math.floor(diff / minute)} menit lalu`;
  if (diff < day)     return `${Math.floor(diff / hour)} jam lalu`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} hari lalu`;
  return formatDate(dateStr);
};
