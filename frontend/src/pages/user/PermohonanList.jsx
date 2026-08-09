import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Trash2, Edit, Eye, RefreshCw } from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import api from '../../api/axios';

const STATUSES = ['', 'Pending', 'Diproses', 'Selesai', 'Ditolak'];
const PRIORITAS = ['', 'Tinggi', 'Sedang', 'Rendah'];

export default function PermohonanList() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', prioritas: '', page: 1 });
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page,
        per_page: 10,
        ...(filters.search    && { search: filters.search }),
        ...(filters.status    && { status: filters.status }),
        ...(filters.prioritas && { prioritas: filters.prioritas }),
      });
      const res = await api.get(`/permohonan/index.php?${params}`);
      setData(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus permohonan ini?')) return;
    try {
      await api.delete(`/permohonan/destroy.php?id=${id}`);
      showToast('Permohonan berhasil dihapus');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus', 'error');
    }
  };

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val, page: 1 }));

  return (
    <UserLayout>
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>{toast.msg}</div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.5rem', marginBottom: 4 }}>Permohonan Saya</h1>
          <p className="text-muted text-sm">Kelola seluruh permohonan layanan TI Anda</p>
        </div>
        <Link to="/permohonan/baru" className="btn btn-primary">
          <Plus size={16} /> Buat Permohonan
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon" />
          <input
            className="form-control"
            placeholder="Cari kode tiket, jenis layanan..."
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
          />
        </div>
        <select className="form-control" style={{ width: 160 }} value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">Semua Status</option>
          {STATUSES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-control" style={{ width: 160 }} value={filters.prioritas} onChange={e => setFilter('prioritas', e.target.value)}>
          <option value="">Semua Prioritas</option>
          {PRIORITAS.slice(1).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button className="btn btn-outline btn-sm" onClick={fetchData} title="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }} />
              <p className="text-muted">Memuat data...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Filter size={36} /></div>
              <div className="empty-title">Tidak ada permohonan ditemukan</div>
              <div className="empty-desc">Coba ubah filter atau buat permohonan baru</div>
              <Link to="/permohonan/baru" className="btn btn-primary"><Plus size={16} /> Buat Permohonan</Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>No. Tiket</th>
                    <th>Jenis Layanan</th>
                    <th>Prioritas</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', fontSize: '0.825rem' }}>
                          {item.kode_tiket}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{item.nama_layanan}</div>
                      </td>
                      <td>
                        <span className={`badge badge-priority-${item.prioritas?.toLowerCase()}`}>
                          {item.prioritas}
                        </span>
                      </td>
                      <td><StatusBadge status={item.status} /></td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatDate(item.created_at)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Link to={`/permohonan/${item.id}`} className="btn btn-ghost btn-sm btn-icon" title="Lihat Detail">
                            <Eye size={15} />
                          </Link>
                          {item.status === 'Pending' && (
                            <>
                              <Link to={`/permohonan/${item.id}/edit`} className="btn btn-ghost btn-sm btn-icon" title="Edit">
                                <Edit size={15} />
                              </Link>
                              <button
                                className="btn btn-ghost btn-sm btn-icon"
                                title="Hapus"
                                style={{ color: 'var(--danger)' }}
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="card-footer">
            <div className="pagination">
              <span className="pagination-info">
                Menampilkan {data.length} dari {pagination.total} permohonan
              </span>
              <div className="pagination-controls">
                <button
                  className="page-btn"
                  disabled={filters.page <= 1}
                  onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                >←</button>
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                  .filter(p => Math.abs(p - filters.page) <= 2)
                  .map(p => (
                    <button
                      key={p}
                      className={`page-btn ${p === filters.page ? 'active' : ''}`}
                      onClick={() => setFilters(prev => ({ ...prev, page: p }))}
                    >{p}</button>
                  ))
                }
                <button
                  className="page-btn"
                  disabled={filters.page >= pagination.last_page}
                  onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                >→</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
