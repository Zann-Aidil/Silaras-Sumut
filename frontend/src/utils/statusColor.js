// Status color mapping untuk badge permohonan
export const statusMap = {
  'Pending':  { label: 'Pending',  class: 'badge-pending',  dot: '#F59E0B' },
  'Diproses': { label: 'Diproses', class: 'badge-diproses', dot: '#2D6CC0' },
  'Selesai':  { label: 'Selesai',  class: 'badge-selesai',  dot: '#10B981' },
  'Ditolak':  { label: 'Ditolak',  class: 'badge-ditolak',  dot: '#EF4444' },
};

export const prioritasMap = {
  'Tinggi': { class: 'badge-priority-tinggi', dotColor: '#EF4444' },
  'Sedang': { class: 'badge-priority-sedang', dotColor: '#F59E0B' },
  'Rendah': { class: 'badge-priority-rendah', dotColor: '#10B981' },
};

export const timelineDotClass = (status) => {
  const map = {
    Pending: 'pending',
    Diproses: 'diproses',
    Selesai: 'selesai',
    Ditolak: 'ditolak',
  };
  return map[status] || 'pending';
};

// Warna stat card accent
export const statColorMap = {
  total:    'primary',
  pending:  'warning',
  diproses: 'info',
  selesai:  'success',
  ditolak:  'danger',
};
