import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, AlertCircle, RefreshCw } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../api/axios';
import { confirmDelete, toastSuccess, toastError } from '../../utils/swal';

export default function JenisLayanan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form state
  const [form, setForm] = useState({
    nama_layanan: '',
    deskripsi: '',
    estimasi_waktu: '',
    status: 'aktif'
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/layanan/index.php');
      setData(res.data.data || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, []);



  const openAddModal = () => {
    setEditingItem(null);
    setForm({ nama_layanan: '', deskripsi: '', estimasi_waktu: '', status: 'aktif' });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      nama_layanan: item.nama_layanan,
      deskripsi: item.deskripsi || '',
      estimasi_waktu: item.estimasi_waktu || '',
      status: item.status
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_layanan.trim()) return;
    setSaving(true);
    try {
      if (editingItem) {
        // Edit
        await api.put(`/layanan/index.php?id=${editingItem.id}`, form);
        toastSuccess('Jenis layanan berhasil diperbarui');
      } else {
        // Add
        await api.post('/layanan/index.php', form);
        toastSuccess('Jenis layanan berhasil ditambahkan');
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
    const result = await confirmDelete('jenis layanan ini');
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/layanan/index.php?id=${id}`);
      toastSuccess('Jenis layanan berhasil dihapus');
      fetchData();
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal menghapus jenis layanan');
    }
  };

  return (
    <AdminLayout title="Jenis Layanan" subtitle="Kelola opsi layanan TI yang tersedia bagi OPD">
      {/* Header action */}
      <div className="flex justify-between items-center mb-6">
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Daftar Layanan</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={fetchData} title="Refresh">
            <RefreshCw size={14} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={openAddModal}>
            <Plus size={15} /> Tambah Layanan
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
              <div className="empty-icon"><Plus size={36} /></div>
              <div className="empty-title">Belum ada data jenis layanan</div>
              <p className="text-muted text-sm mb-4">Tambahkan jenis layanan baru untuk memulai.</p>
              <button className="btn btn-primary btn-sm" onClick={openAddModal}>Tambah Layanan</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Layanan</th>
                    <th>Deskripsi</th>
                    <th>Estimasi Waktu</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.nama_layanan}</td>
                      <td style={{ color: 'var(--text-secondary)', maxTransform: '200px' }}>
                        {item.deskripsi || '-'}
                      </td>
                      <td>
                        <span className="badge badge-diproses">⏱ {item.estimasi_waktu || '-'}</span>
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

      {/* Modal CRUD */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Jenis Layanan' : 'Tambah Jenis Layanan Baru'}</h3>
              <button className="btn btn-ghost btn-icon btn-sm" style={{ padding: 4 }} onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="lay-nama">Nama Layanan <span className="required">*</span></label>
                  <input
                    id="lay-nama"
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Instalasi Software"
                    value={form.nama_layanan}
                    onChange={e => setForm({ ...form, nama_layanan: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="lay-desc">Deskripsi Layanan</label>
                  <textarea
                    id="lay-desc"
                    className="form-control"
                    placeholder="Deskripsi singkat jenis layanan..."
                    value={form.deskripsi}
                    onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="lay-est">Estimasi Waktu Penanganan</label>
                  <input
                    id="lay-est"
                    type="text"
                    className="form-control"
                    placeholder="Contoh: 1-2 Hari Kerja"
                    value={form.estimasi_waktu}
                    onChange={e => setForm({ ...form, estimasi_waktu: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="lay-stat">Status</label>
                  <select
                    id="lay-stat"
                    className="form-control"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="aktif">Aktif (Tampil di form pemohon)</option>
                    <option value="nonaktif">Nonaktif (Sembunyikan dari form pemohon)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
