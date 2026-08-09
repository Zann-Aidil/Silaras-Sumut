import { useState, useEffect, useCallback } from 'react';
import { Calendar, FileText, Search, RefreshCw, Download, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatDate';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Laporan() {
  const [data, setData] = useState([]);
  const [instansiList, setInstansiList] = useState([]);
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Awal bulan
    date_to: new Date().toISOString().split('T')[0], // Hari ini
    status: '',
    instansi_id: '',
  });

  // Load dropdowns
  useEffect(() => {
    Promise.all([
      api.get('/instansi/index.php'),
      api.get('/layanan/index.php')
    ]).then(([instRes, layRes]) => {
      setInstansiList(instRes.data.data || []);
      setLayananList(layRes.data.data || []);
    }).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: 'detail',
        date_from: filters.date_from,
        date_to: filters.date_to,
        status: filters.status,
        instansi_id: filters.instansi_id,
        per_page: 500, // Ambil banyak untuk rekapan
      });
      const res = await api.get(`/laporan/index.php?${params}`);
      setData(res.data.data || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  };

  const handleExportPDF = () => {
    if (data.length === 0) {
      setToast({ msg: 'Tidak ada data untuk diexport', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setExporting(true);
    try {
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape A4

      // Header Banner Sumut
      doc.setFillColor(27, 58, 107); // Primary Navy
      doc.rect(0, 0, 297, 35, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('PEMERINTAH PROVINSI SUMATERA UTARA', 15, 15);
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'normal');
      doc.text('DINAS KOMUNIKASI DAN INFORMATIKA', 15, 22);
      doc.setFontSize(10);
      doc.text('Sistem Informasi Layanan dan Arsip (SILARAS) - Rekapitulasi Tiket', 15, 28);

      // Period and timestamp info on the right
      doc.setFontSize(9);
      doc.text(`Periode: ${formatDate(filters.date_from)} s/d ${formatDate(filters.date_to)}`, 220, 15);
      doc.text(`Dicetak: ${formatDate(new Date().toISOString())}`, 220, 21);

      // Status info
      let statusStr = filters.status ? filters.status.toUpperCase() : 'SEMUA';
      doc.text(`Status Tiket: ${statusStr}`, 220, 27);

      // Table mapping data
      const tableRows = data.map((item, index) => [
        index + 1,
        item.kode_tiket,
        item.nama_pemohon,
        item.singkatan || item.nama_instansi,
        item.nama_layanan,
        item.prioritas,
        formatDate(item.created_at),
        item.status,
        item.ditangani_oleh || '-'
      ]);

      doc.autoTable({
        head: [['No', 'Kode Tiket', 'Pemohon', 'Instansi', 'Jenis Layanan', 'Prioritas', 'Tanggal Masuk', 'Status', 'Ditangani Oleh']],
        body: tableRows,
        startY: 42,
        theme: 'striped',
        headStyles: { fillColor: [45, 108, 192], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 32, fontStyle: 'bold' },
          2: { cellWidth: 35 },
          3: { cellWidth: 35 },
          4: { cellWidth: 45 },
          5: { cellWidth: 20 },
          6: { cellWidth: 28 },
          7: { cellWidth: 22 },
          8: { cellWidth: 35 }
        }
      });

      doc.save(`SILARAS_Laporan_${filters.date_from}_to_${filters.date_to}.pdf`);
    } catch (err) {
      setToast({ msg: 'Gagal mengeksport PDF', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout title="Rekap & Laporan" subtitle="Analisis kinerja penanganan permohonan TI">
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <AlertCircle size={16} />
            {toast.msg}
          </div>
        </div>
      )}

      {/* Filter and Export Bar */}
      <div className="card mb-6" style={{ padding: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="rep-from">Dari Tanggal</label>
            <input
              id="rep-from"
              type="date"
              className="form-control"
              style={{ width: 160 }}
              value={filters.date_from}
              onChange={e => handleFilterChange('date_from', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="rep-to">Sampai Tanggal</label>
            <input
              id="rep-to"
              type="date"
              className="form-control"
              style={{ width: 160 }}
              value={filters.date_to}
              onChange={e => handleFilterChange('date_to', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="rep-status">Status</label>
            <select
              id="rep-status"
              className="form-control"
              style={{ width: 150 }}
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="Pending">Pending</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="rep-inst">Instansi</label>
            <select
              id="rep-inst"
              className="form-control"
              style={{ width: 220 }}
              value={filters.instansi_id}
              onChange={e => handleFilterChange('instansi_id', e.target.value)}
            >
              <option value="">Semua Instansi</option>
              {instansiList.map(i => (
                <option key={i.id} value={i.id}>{i.singkatan ? `${i.singkatan} - ` : ''}{i.nama_instansi}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button className="btn btn-outline" onClick={fetchData} title="Refresh Preview">
              <RefreshCw size={16} />
            </button>
            <button className="btn btn-primary" onClick={handleExportPDF} disabled={exporting || loading}>
              <Download size={16} /> {exporting ? 'Mengekspor...' : 'Export ke PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Pratinjau Data Laporan</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Total data terfilter: <strong>{data.length} baris</strong>
          </span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : data.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><FileText size={36} /></div>
              <div className="empty-title">Tidak ada data untuk pratinjau</div>
              <p className="text-muted text-sm">Sesuaikan filter tanggal atau filter lainnya untuk melihat pratinjau.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table" style={{ fontSize: '0.825rem' }}>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Kode Tiket</th>
                    <th>Pemohon</th>
                    <th>Instansi</th>
                    <th>Layanan</th>
                    <th>Prioritas</th>
                    <th>Tgl Masuk</th>
                    <th>Status</th>
                    <th>Ditangani Oleh</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.kode_tiket}>
                      <td>{index + 1}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                        {item.kode_tiket}
                      </td>
                      <td>{item.nama_pemohon}</td>
                      <td>{item.singkatan || item.nama_instansi}</td>
                      <td>{item.nama_layanan}</td>
                      <td>
                        <span className={`badge badge-priority-${item.prioritas?.toLowerCase()}`}>
                          {item.prioritas}
                        </span>
                      </td>
                      <td>{formatDate(item.created_at)}</td>
                      <td>
                        <span className={`badge ${item.status === 'Selesai' ? 'badge-aktif' : item.status === 'Diproses' ? 'badge-diproses' : item.status === 'Ditolak' ? 'badge-nonaktif' : 'badge-pending'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.ditangani_oleh || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
