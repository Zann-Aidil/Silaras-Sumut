import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, RefreshCw, Eye, Calendar } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import api from '../../api/axios';

const STATUSES = ['', 'Pending', 'Diproses', 'Selesai', 'Ditolak'];
const PRIORITAS = ['', 'Tinggi', 'Sedang', 'Rendah'];

export default function AdminPermohonanList() {
  const [data, setData] = useState([]);
  const [layananList, setLayananList] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '', status: '', prioritas: '', jenis_layanan_id: '',
    date_from: '', date_to: '', page: 1
  });

  // Load Layanan dropdown
  useEffect(() => {
    api.get('/layanan/index.php')
      .then(res => setLayananList(res.data.data || []))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page,
        per_page: 10,
        ...(filters.search           && { search: filters.search }),
        ...(filters.status           && { status: filters.status }),
        ...(filters.prioritas        && { prioritas: filters.prioritas }),
        ...(filters.jenis_layanan_id && { jenis_layanan_id: filters.jenis_layanan_id }),
        ...(filters.date_from        && { date_from: filters.date_from }),
        ...(filters.date_to          && { date_to: filters.date_to }),
      });
      const res = await api.get(`/permohonan/index.php?${params}`);
      setData(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val, page: 1 }));

  return (
    <AdminLayout title="Daftar Permohonan" subtitle="Kelola dan tangani seluruh tiket masuk">
      {/* Filters */}
      <div className="card mb-6" style={{ padding: 18 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {/* Search */}
          <div className="search-input-wrapper" style={{ flex: '1 1 240px' }}>
            <Search size={15} className="search-icon" />
            <input
              className="form-control"
              placeholder="Cari No. Tiket, Pemohon, Layanan..."
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
            />
          </div>

          {/* Status */}
          <select
            className="form-control"
            style={{ width: 150 }}
            value={filters.status}
            onChange={e => setFilter('status', e.target.value)}
          >
            <option value="">Semua Status</option>
            {STATUSES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Prioritas */}
          <select
            className="form-control"
            style={{ width: 150 }}
            value={filters.prioritas}
            onChange={e => setFilter('prioritas', e.target.value)}
          >
            <option value="">Semua Prioritas</option>
            {PRIORITAS.slice(1).map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* Jenis Layanan */}
          <select
            className="form-control"
            style={{ width: 180 }}
            value={filters.jenis_layanan_id}
            onChange={e => setFilter('jenis_layanan_id', e.target.value)}
          >
            <option value="">Semua Layanan</option>
            {layananList.map(l => (
              <option key={l.id} value={l.id}>{l.nama_layanan}</option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="date"
              className="form-control"
              style={{ width: 140, padding: '8px 10px' }}
              value={filters.date_from}
              onChange={e => setFilter('date_from', e.target.value)}
              title="Dari Tanggal"
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>s/d</span>
            <input
              type="date"
              className="form-control"
              style={{ width: 140, padding: '8px 10px' }}
              value={filters.date_to}
              onChange={e => setFilter('date_to', e.target.value)}
              title="Sampai Tanggal"
            />
          </div>

          <button className="btn btn-outline btn-icon" onClick={fetchData} title="Refresh Data">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }} />
              <p className="text-muted text-sm">Sedang memuat data...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Filter size={36} /></div>
              <div className="empty-title">Tidak ada permohonan ditemukan</div>
              <div className="empty-desc">Silakan periksa filter pencarian Anda atau coba bersihkan.</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>No. Tiket</th>
                    <th>Pemohon</th>
                    <th>Instansi/OPD</th>
                    <th>Jenis Layanan</th>
                    <th>Prioritas</th>
                    <th>Tanggal Masuk</th>
                    <th>Status</th>
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
                        <div style={{ fontWeight: 600 }}>{item.nama_pemohon}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>NIP. {item.nip || '-'}</div>
                      </td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                        {item.singkatan_instansi || item.nama_instansi}
                      </td>
                      <td>{item.nama_layanan}</td>
                      <td>
                        <span className={`badge badge-priority-${item.prioritas?.toLowerCase()}`}>
                          {item.prioritas}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatDate(item.created_at)}
                      </td>
                      <td><StatusBadge status={item.status} /></td>
                      <td>
                        <Link to={`/admin/permohonan/${item.id}`} className="btn btn-ghost btn-sm btn-icon" title="Detail & Proses">
                          <Eye size={16} />
                        </Link>
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
    </AdminLayout>
  );
}
