import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Check, AlertCircle, Search, RefreshCw, Key, Shield } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../api/axios';

export default function Users() {
  const [data, setData] = useState([]);
  const [instansiList, setInstansiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, current_page: 1, last_page: 1 });
  const [filters, setFilters] = useState({ search: '', role: '', status: '', page: 1 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState(null);

  // Form state
  const [form, setForm] = useState({
    nama: '',
    nip: '',
    email: '',
    no_hp: '',
    instansi_id: '',
    role: 'user',
    status: 'aktif',
    password: ''
  });
  const [saving, setSaving] = useState(false);

  // Load instansi
  useEffect(() => {
    api.get('/instansi/index.php')
      .then(res => setInstansiList(res.data.data || []))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page,
        per_page: 10,
        ...(filters.search && { search: filters.search }),
        ...(filters.role   && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
      });
      const res = await api.get(`/users/index.php?${params}`);
      setData(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setForm({ nama: '', nip: '', email: '', no_hp: '', instansi_id: '', role: 'user', status: 'aktif', password: '' });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      nama: item.nama,
      nip: item.nip || '',
      email: item.email,
      no_hp: item.no_hp || '',
      instansi_id: item.instansi_id || '',
      role: item.role,
      status: item.status,
      password: '' // empty means no change
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama.trim() || !form.email.trim()) return;
    setSaving(true);
    try {
      if (editingItem) {
        await api.put(`/users/index.php?id=${editingItem.id}`, form);
        showToast('User berhasil diperbarui');
      } else {
        if (!form.password) { showToast('Password wajib diisi untuk user baru', 'error'); setSaving(false); return; }
        await api.post('/users/index.php', form);
        showToast('User berhasil ditambahkan');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan data', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menonaktifkan user ini?')) return;
    try {
      await api.delete(`/users/index.php?id=${id}`);
      showToast('User dinonaktifkan');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menonaktifkan user', 'error');
    }
  };

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val, page: 1 }));

  return (
    <AdminLayout title="Manajemen User" subtitle="Kelola data pegawai, staf teknis, dan hak akses sistem">
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
            {toast.msg}
          </div>
        </div>
      )}

      {/* Action and Filter Bar */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} className="search-icon" />
          <input
            className="form-control"
            placeholder="Cari nama, email, NIP..."
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
          />
        </div>
        <select className="form-control" style={{ width: 140 }} value={filters.role} onChange={e => setFilter('role', e.target.value)}>
          <option value="">Semua Role</option>
          <option value="user">User (Staff OPD)</option>
          <option value="admin">Admin (Teknis)</option>
        </select>
        <select className="form-control" style={{ width: 140 }} value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={fetchData} title="Refresh">
            <RefreshCw size={14} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={openAddModal}>
            <Plus size={15} /> Tambah User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : data.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Search size={36} /></div>
              <div className="empty-title">Tidak ada user ditemukan</div>
              <p className="text-muted text-sm mb-4">Coba sesuaikan pencarian Anda atau tambahkan user baru.</p>
              <button className="btn btn-primary btn-sm" onClick={openAddModal}>Tambah User</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama User</th>
                    <th>Email / NIP</th>
                    <th>Instansi</th>
                    <th>No. HP</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)',
                            color: '#fff', fontSize: '0.8rem', fontWeight: 600, display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                          }}>
                            {item.nama.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ fontWeight: 600 }}>{item.nama}</div>
                        </div>
                      </td>
                      <td>
                        <div>{item.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NIP. {item.nip || '-'}</div>
                      </td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                        {item.singkatan || item.nama_instansi || '-'}
                      </td>
                      <td>{item.no_hp || '-'}</td>
                      <td>
                        <span className={`badge ${item.role === 'admin' ? 'badge-diproses' : 'badge-pending'}`} style={{ textTransform: 'capitalize' }}>
                          {item.role === 'admin' ? 'Admin (Teknis)' : 'User (OPD)'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${item.status === 'aktif' ? 'badge-aktif' : 'badge-nonaktif'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEditModal(item)} title="Edit">
                            <Edit size={14} />
                          </button>
                          {item.status === 'aktif' && (
                            <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(item.id)} title="Nonaktifkan">
                              <Trash2 size={14} />
                            </button>
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
                Menampilkan {data.length} dari {pagination.total} user
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

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3>{editingItem ? 'Edit User' : 'Tambah User Baru'}</h3>
              <button className="btn btn-ghost btn-icon btn-sm" style={{ padding: 4 }} onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="usr-nama">Nama Lengkap <span className="required">*</span></label>
                    <input
                      id="usr-nama"
                      type="text"
                      className="form-control"
                      value={form.nama}
                      onChange={e => setForm({ ...form, nama: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="usr-nip">NIP</label>
                    <input
                      id="usr-nip"
                      type="text"
                      className="form-control"
                      value={form.nip}
                      onChange={e => setForm({ ...form, nip: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="usr-email">Email <span className="required">*</span></label>
                    <input
                      id="usr-email"
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                      disabled={!!editingItem} // Email cannot be edited
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="usr-hp">No. HP / WA</label>
                    <input
                      id="usr-hp"
                      type="text"
                      className="form-control"
                      value={form.no_hp}
                      onChange={e => setForm({ ...form, no_hp: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="usr-inst">Instansi / OPD</label>
                    <select
                      id="usr-inst"
                      className="form-control"
                      value={form.instansi_id}
                      onChange={e => setForm({ ...form, instansi_id: e.target.value })}
                    >
                      <option value="">-- Pilih Instansi --</option>
                      {instansiList.map(i => (
                        <option key={i.id} value={i.id}>{i.singkatan ? `${i.singkatan} - ` : ''}{i.nama_instansi}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="usr-role">Role Akses</label>
                    <select
                      id="usr-role"
                      className="form-control"
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                    >
                      <option value="user">User (Staff OPD)</option>
                      <option value="admin">Admin (Diskominfo)</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="usr-pass">
                      {editingItem ? 'Ganti Password (Kosongkan jika tidak diubah)' : 'Password *'}
                    </label>
                    <input
                      id="usr-pass"
                      type="password"
                      className="form-control"
                      placeholder="Masukkan password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required={!editingItem}
                      minLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="usr-stat">Status Akun</label>
                    <select
                      id="usr-stat"
                      className="form-control"
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
