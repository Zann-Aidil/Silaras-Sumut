import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, AlertCircle, Search, RefreshCw } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../api/axios';
import { confirmDelete, toastSuccess, toastError } from '../../utils/swal';

export default function Instansi() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form state
  const [form, setForm] = useState({
    nama_instansi: '',
    singkatan: '',
    alamat: '',
    no_telp: '',
    status: 'aktif'
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/instansi/index.php?search=${search}`);
      setData(res.data.data || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, [search]);



  const openAddModal = () => {
    setEditingItem(null);
    setForm({ nama_instansi: '', singkatan: '', alamat: '', no_telp: '', status: 'aktif' });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      nama_instansi: item.nama_instansi,
      singkatan: item.singkatan || '',
      alamat: item.alamat || '',
      no_telp: item.no_telp || '',
      status: item.status
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_instansi.trim()) return;
    setSaving(true);
    try {
      if (editingItem) {
        await api.put(`/instansi/index.php?id=${editingItem.id}`, form);
        toastSuccess('Instansi/OPD berhasil diperbarui');
      } else {
        await api.post('/instansi/index.php', form);
        toastSuccess('Instansi/OPD berhasil ditambahkan');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await confirmDelete('Instansi/OPD ini');
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/instansi/index.php?id=${id}`);
      toastSuccess('Instansi/OPD berhasil dihapus');
      fetchData();
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal menghapus instansi');
    }
  };

  return (
    <AdminLayout title="Instansi / OPD" subtitle="Kelola data instansi pemerintahan di lingkungan Pemprovsu">
      {/* Action Bar */}
      <div className="filter-bar" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="search-input-wrapper" style={{ maxWidth: 300, flex: 1 }}>
          <Search size={15} className="search-icon" />
          <input
            className="form-control"
            placeholder="Cari instansi atau singkatan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={fetchData} title="Refresh">
            <RefreshCw size={14} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={openAddModal}>
            <Plus size={15} /> Tambah Instansi
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
              <div className="empty-title">Tidak ada instansi ditemukan</div>
              <p className="text-muted text-sm mb-4">Coba sesuaikan pencarian Anda atau tambahkan instansi baru.</p>
              <button className="btn btn-primary btn-sm" onClick={openAddModal}>Tambah Instansi</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Instansi</th>
                    <th>Singkatan</th>
                    <th>Alamat</th>
                    <th>No. Telp</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.nama_instansi}</div>
                      </td>
                      <td>
                        <span style={{ background: 'var(--border-light)', padding: '3px 8px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                          {item.singkatan || '-'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{item.alamat || '-'}</td>
                      <td>{item.no_telp || '-'}</td>
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
                          <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(item.id)} title="Hapus">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Instansi' : 'Tambah Instansi/OPD Baru'}</h3>
              <button className="btn btn-ghost btn-icon btn-sm" style={{ padding: 4 }} onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="inst-nama">Nama Instansi/OPD <span className="required">*</span></label>
                    <input
                      id="inst-nama"
                      type="text"
                      className="form-control"
                      placeholder="Contoh: Dinas Komunikasi dan Informatika"
                      value={form.nama_instansi}
                      onChange={e => setForm({ ...form, nama_instansi: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="inst-sing">Singkatan</label>
                    <input
                      id="inst-sing"
                      type="text"
                      className="form-control"
                      placeholder="Contoh: Diskominfo"
                      value={form.singkatan}
                      onChange={e => setForm({ ...form, singkatan: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="inst-telp">No. Telp / Kontaks</label>
                    <input
                      id="inst-telp"
                      type="text"
                      className="form-control"
                      placeholder="Contoh: 061-xxxxxx"
                      value={form.no_telp}
                      onChange={e => setForm({ ...form, no_telp: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="inst-stat">Status</label>
                    <select
                      id="inst-stat"
                      className="form-control"
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="inst-alamat">Alamat Lengkap</label>
                  <textarea
                    id="inst-alamat"
                    className="form-control"
                    placeholder="Alamat kantor OPD..."
                    value={form.alamat}
                    onChange={e => setForm({ ...form, alamat: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Instansi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
