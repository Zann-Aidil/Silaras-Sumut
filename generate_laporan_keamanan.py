"""
Script Generator Dokumen Word (.docx)
Laporan Analisis Risiko Keamanan Sistem Informasi
Topik: Sistem Informasi Akademik (SIAKAD)
"""

import os
from docx import Document
from docx.shared import Pt, Inches, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml, OxmlElement

OUTPUT_FILE = "Laporan_Analisis_Risiko_Keamanan_SIAKAD.docx"
FONT_NAME = "Times New Roman"

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def set_table_borders(table, color="D3D3D3", sz="4", val="single"):
    tblPr = table._element.xpath('w:tblPr')
    if tblPr:
        borders = parse_xml(f'''
            <w:tblBorders {nsdecls("w")}>
                <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            </w:tblBorders>
        ''')
        tblPr[0].append(borders)

def build_document():
    doc = Document()
    
    # Margin 4cm kiri, 3cm lainnya
    for sec in doc.sections:
        sec.top_margin = Cm(3)
        sec.bottom_margin = Cm(3)
        sec.left_margin = Cm(4)
        sec.right_margin = Cm(3)
        
    style = doc.styles['Normal']
    font = style.font
    font.name = FONT_NAME
    font.size = Pt(12)
    style.paragraph_format.line_spacing = 1.5
    style.paragraph_format.space_after = Pt(4)
    style.paragraph_format.space_before = Pt(0)
    
    # Set EastAsian font
    rPr = style.element.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = parse_xml(f'<w:rFonts {nsdecls("w")} w:eastAsia="{FONT_NAME}"/>')
        rPr.append(rFonts)
    else:
        rFonts.set(qn('w:eastAsia'), FONT_NAME)

    # -------------------------------------------------------------
    # COVER PAGE
    # -------------------------------------------------------------
    p_cov_top = doc.add_paragraph()
    p_cov_top.paragraph_format.space_before = Pt(20)
    p_cov_top.paragraph_format.space_after = Pt(8)
    p_cov_top.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_cov_top.add_run("TUGAS ANALISIS RISIKO KEAMANAN INFORMASI\nIDENTIFIKASI ASET, ANCAMAN, KERENTANAN, DAN KONTROL KEAMANAN")
    r.bold = True
    r.font.size = Pt(14)
    
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(24)
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run("STUDI KASUS: SISTEM INFORMASI AKADEMIK (SIAKAD)")
    r_sub.bold = True
    r_sub.font.size = Pt(16)
    r_sub.font.color.rgb = RGBColor(16, 44, 87)
    
    p_line = doc.add_paragraph()
    p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_line.paragraph_format.space_after = Pt(80)
    r_line = p_line.add_run("═══════════════════════════════════════════")
    r_line.font.color.rgb = RGBColor(53, 89, 143)
    
    p_ident = doc.add_paragraph()
    p_ident.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ident.paragraph_format.space_after = Pt(120)
    r_ident = p_ident.add_run("Disusun Oleh:\n\nNama Mahasiswa : [NAMA LENGKAP MAHASISWA]\nNIM / NPM      : [NOMOR INDUK MAHASISWA]\nProgram Studi  : Sistem Informasi / Teknik Informatika\nMata Kuliah    : Keamanan Informasi & Manajemen Risiko\nDosen Pengampu : [NAMA DOSEN PENGAMPU]")
    r_ident.font.size = Pt(12)
    r_ident.bold = True
    
    p_foot = doc.add_paragraph()
    p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_foot = p_foot.add_run("PROGRAM SARJANA (S1)\nFAKULTAS TEKNIK / TEKNOLOGI INFORMASI\nTAHUN AKADEMIK 2025/2026")
    r_foot.bold = True
    r_foot.font.size = Pt(13)
    
    doc.add_page_break()

    # Helper function for headings
    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(14)
        r.font.color.rgb = RGBColor(16, 44, 87)
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(12)
        r.font.color.rgb = RGBColor(33, 37, 41)
        return p

    def add_body(text, bold_prefix="", indent=True):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(4)
        if indent:
            p.paragraph_format.first_line_indent = Cm(1.0)
        if bold_prefix:
            r_b = p.add_run(bold_prefix)
            r_b.bold = True
        p.add_run(text)
        return p

    # -------------------------------------------------------------
    # BAB I: PENDAHULUAN & DESKRIPSI SISTEM
    # -------------------------------------------------------------
    add_h1("BAB I. PENDAHULUAN DAN DESKRIPSI SISTEM")
    
    add_h2("1.1 Latar Belakang Analisis")
    add_body("Sistem Informasi Akademik (SIAKAD) merupakan pilar teknologi informasi utama pada perguruan tinggi yang mengelola seluruh siklus operasional akademik, mulai dari pendaftaran mata kuliah (KRS), pengelolaan jadwal, penginputan dan publikasi nilai (KHS/Transkrip), hingga pembayaran biaya perkuliahan dan verifikasi yudisium/kelulusan. Mengingat peran vitalnya, SIAKAD menyimpan data bernilai sangat tinggi, termasuk data identitas pribadi mahasiswa dan dosen (Personally Identifiable Information/PII), riwayat evaluasi akademik, serta integrasi transaksi pembayaran.")
    add_body("Ancaman terhadap sistem akademik kian kompleks, mulai dari upaya manipulasi nilai secara ilegal, pencurian data pribadi untuk kejahatan siber, serangan penolakan layanan (DDoS) saat masa puncak pengisian KRS, hingga kebocoran kredensial akibat kelemahan autentikasi. Analisis risiko keamanan informasi ini dilakukan secara etis dan non-intrusif guna mengidentifikasi kelemahan mendasar pada arsitektur, parameter, dan tata kelola sistem, serta memberikan mitigasi terukur berdasarkan standar ISO/IEC 27005 dan NIST SP 800-30.")

    add_h2("1.2 Ruang Lingkup dan Batasan Etis Observasi")
    add_body("Sesuai dengan ketentuan tugas akademis dan etika pengujian keamanan (Code of Ethics), analisis ini dilakukan tanpa melakukan pengujian penetrasi eksploitatif (non-destructive passive analysis) terhadap sistem milik pihak ketiga tanpa izin resmi. Metodologi pengumpulan data observasi didasarkan pada:", bold_prefix="Prinsip Legalitas & Non-Eksploitasi: ")
    
    bullet_items = [
        ("Passive Reconnaissance: ", "Analisis respons header HTTP publik, konfigurasi SSL/TLS cipher suite, sertifikat digital, dan DNS records."),
        ("Parameter & Client-Side Inspection: ", "Pemeriksaan struktur URL, form input, dan inspeksi atribut cookie (HttpOnly, Secure, SameSite) melalui Browser Developer Tools."),
        ("Architectural Gap Analysis: ", "Evaluasi alur otorisasi, model verifikasi peran pengguna, mekanisme pemulihan sandi, dan kebijakan pergantian sandi default."),
        ("Policy & Configuration Review: ", "Observasi perilaku sistem saat menerima muatan request berulang (ketiadaan CAPTCHA/Rate Limiting).")
    ]
    for b_prefix, b_text in bullet_items:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Cm(1.0)
        p.paragraph_format.space_after = Pt(2)
        r1 = p.add_run("• " + b_prefix)
        r1.bold = True
        p.add_run(b_text)

    # -------------------------------------------------------------
    # BAB II: METODOLOGI PENILAIAN RISIKO & MATRIKS 1-5
    # -------------------------------------------------------------
    add_h1("BAB II. METODOLOGI DAN MATRIKS PENILAIAN RISIKO")
    add_body("Penilaian risiko dalam laporan ini menggunakan kerangka kerja kualitatif dan semi-kuantitatif standar internasional (NIST SP 800-30 Rev 1 dan ISO 27005) dengan matriks probabilitas dan dampak skala 1 sampai 5.")
    
    add_h2("2.1 Skala Kemungkinan (Likelihood: 1 - 5)")
    
    t_like = doc.add_table(rows=6, cols=3)
    t_like.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_like)
    
    headers_like = ["Tingkat", "Probabilitas", "Kriteria Operasional / Frekuensi"]
    for i, h in enumerate(headers_like):
        cell = t_like.cell(0, i)
        set_cell_background(cell, "102C57")
        set_cell_margins(cell, 120, 120, 150, 150)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(h)
        run.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        run.font.size = Pt(10)

    like_data = [
        ("1", "Sangat Rendah (Rare)", "Hampir tidak pernah terjadi, membutuhkan kapabilitas dan akses fisik luar biasa."),
        ("2", "Rendah (Unlikely)", "Kemungkinan kecil terjadi dalam 1 tahun, eksploitasi membutuhkan keahlian teknis khusus."),
        ("3", "Sedang (Possible)", "Dapat terjadi beberapa kali dalam setahun, teknik eksploitasi umum diketahui publik."),
        ("4", "Tinggi (Likely)", "Sangat sering terjadi, vektor serangan mudah dieksekusi dengan alat otomatis (automated script)."),
        ("5", "Sangat Tinggi (Almost Certain)", "Hampir pasti terjadi berulang kali/berkelanjutan, celah terbuka tanpa proteksi dasar.")
    ]
    for r_idx, row in enumerate(like_data, start=1):
        for c_idx, val in enumerate(row):
            cell = t_like.cell(r_idx, c_idx)
            set_cell_margins(cell, 80, 80, 120, 120)
            p = cell.paragraphs[0]
            if c_idx < 2:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.size = Pt(9.5)
            if c_idx == 0:
                r.bold = True

    add_h2("2.2 Skala Dampak Kerusakan (Impact: 1 - 5)")
    t_imp = doc.add_table(rows=6, cols=3)
    t_imp.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_imp)
    
    headers_imp = ["Tingkat", "Dampak", "Kriteria Konsekuensi Finansial, Operasional & Reputasi"]
    for i, h in enumerate(headers_imp):
        cell = t_imp.cell(0, i)
        set_cell_background(cell, "102C57")
        set_cell_margins(cell, 120, 120, 150, 150)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(h)
        run.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        run.font.size = Pt(10)

    imp_data = [
        ("1", "Sangat Ringan (Insignificant)", "Tidak ada gangguan layanan, tidak ada kebocoran data rahasia, kerugian finansial nihil."),
        ("2", "Ringan (Minor)", "Gangguan minor yang lekas teratasi, informasi non-rahasia terekspos terbatas."),
        ("3", "Sedang (Moderate)", "Gangguan operasional sementara (< 4 jam), manipulasi data non-kritis, tuntutan komplain lokal."),
        ("4", "Berat (Major)", "Downtime sistem > 12 jam, kebocoran data ribuan mahasiswa (PII), sanksi regulasi perlindungan data."),
        ("5", "Bencana / Kritis (Catastrophic)", "Kehilangan integritas database nilai secara permanen, peretasan finansial terstruktur, kerugian hukum pidana.")
    ]
    for r_idx, row in enumerate(imp_data, start=1):
        for c_idx, val in enumerate(row):
            cell = t_imp.cell(r_idx, c_idx)
            set_cell_margins(cell, 80, 80, 120, 120)
            p = cell.paragraphs[0]
            if c_idx < 2:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.size = Pt(9.5)
            if c_idx == 0:
                r.bold = True

    add_h2("2.3 Matriks Penentuan Level Risiko (Risk Score = Likelihood × Impact)")
    add_body("Tingkat risiko diklasifikasikan ke dalam empat zona prioritas tindakan berdasarkan nilai perkalian:")
    
    t_mat = doc.add_table(rows=5, cols=4)
    t_mat.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_mat)
    
    m_headers = ["Rentang Skor", "Tingkat Risiko", "Tindakan Yang Diperlukan", "Batas Waktu Mitigasi"]
    for i, h in enumerate(m_headers):
        cell = t_mat.cell(0, i)
        set_cell_background(cell, "2C3E50")
        set_cell_margins(cell, 100, 100, 120, 120)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(h)
        run.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        run.font.size = Pt(9.5)

    m_data = [
        ("15 - 25", "CRITICAL (Kritis)", "Tindakan darurat wajib segera diimplementasikan; sistem berisiko fatal.", "Maksimal 24 - 48 Jam", "FFCCCC"),
        ("10 - 14", "HIGH (Tinggi)", "Memerlukan intervensi manajemen teknis senior dan patch prioritas tinggi.", "Maksimal 1 - 2 Minggu", "FFE0B2"),
        ("5 - 9", "MEDIUM (Sedang)", "Penanganan terjadwal pada siklus maintenance reguler berikutnya.", "Maksimal 1 Bulan", "FFF9C4"),
        ("1 - 4", "LOW (Rendah)", "Dapat diterima (tolerated) dengan pemantauan periodik rutin.", "Peninjauan Berkala", "C8E6C9")
    ]
    for r_idx, row in enumerate(m_data, start=1):
        for c_idx in range(4):
            cell = t_mat.cell(r_idx, c_idx)
            set_cell_background(cell, row[4])
            set_cell_margins(cell, 80, 80, 100, 100)
            p = cell.paragraphs[0]
            if c_idx < 2 or c_idx == 3:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(row[c_idx])
            r.font.size = Pt(9)
            if c_idx < 2:
                r.bold = True

    # -------------------------------------------------------------
    # BAB III: IDENTIFIKASI ASET KRITIS SISTEM (MINIMAL 5 ASET)
    # -------------------------------------------------------------
    add_h1("BAB III. IDENTIFIKASI ASET KRITIS SISTEM INFORMASI AKADEMIK")
    add_body("Berdasarkan ketentuan penilaian, telah diidentifikasi 6 (enam) aset kritis utama dalam ekosistem SIAKAD beserta nilai dan kebutuhan proteksi kerahasiaan (Confidentiality), integritas (Integrity), dan ketersediaannya (Availability):")
    
    t_aset = doc.add_table(rows=7, cols=5)
    t_aset.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_aset)
    
    h_aset = ["ID Aset", "Nama Aset", "Kategori", "Deskripsi & Peran Fungsional", "Prioritas Keamanan (CIA)"]
    for i, h in enumerate(h_aset):
        cell = t_aset.cell(0, i)
        set_cell_background(cell, "102C57")
        set_cell_margins(cell, 120, 120, 150, 150)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(h)
        run.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        run.font.size = Pt(9.5)

    data_aset = [
        ("AST-01", "Database Nilai, Transkrip & KHS", "Data / Informasi", 
         "Penyimpanan catatan nilai angka, mutu huruf, IPK, dan riwayat kelulusan mahasiswa seluruh angkatan.",
         "High Integrity, High Confidentiality"),
        ("AST-02", "Server Web & API Gateway SIAKAD", "Infrastruktur / Hardware", 
         "Server komputasi dan backend engine yang melayani jutaan hit request per hari, terutama saat pengisian KRS.",
         "High Availability, Moderate Integrity"),
        ("AST-03", "Kredensial Akun & Token Sesi Pengguna", "Aset Logis / Kredensial", 
         "Password hash, bearer token JWT, dan session cookie milik mahasiswa, dosen wali, dan administrator BAAK.",
         "High Confidentiality, High Integrity"),
        ("AST-04", "Data Pribadi Mahasiswa & Dosen (PII)", "Data / Informasi", 
         "Informasi Nomor Induk Kependudukan (NIK), No HP, email, alamat domisili, dan data finansial orang tua.",
         "High Confidentiality (UU PDP)"),
        ("AST-05", "Modul Keuangan & Integrasi Virtual Account", "Aplikasi / Finansial", 
         "Antarmuka host-to-host pembayaran SPP/UKT dengan bank mitra via webhook API dan status lunas pembayaran.",
         "High Integrity, High Availability"),
        ("AST-06", "Repositori Berkas Digital (Ijazah & Tugas)", "Storage / File Server", 
         "Media penyimpanan berkas digital seperti PDF Ijazah, transkrip bertanda tangan digital, dan draft skripsi.",
         "High Integrity, Moderate Availability")
    ]
    for r_idx, row in enumerate(data_aset, start=1):
        for c_idx, val in enumerate(row):
            cell = t_aset.cell(r_idx, c_idx)
            set_cell_margins(cell, 80, 80, 100, 100)
            p = cell.paragraphs[0]
            if c_idx in [0, 2]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.size = Pt(8.5)
            if c_idx == 0:
                r.bold = True

    # -------------------------------------------------------------
    # BAB IV: TABEL ANALISIS RISIKO (MINIMAL 8 ANCAMAN/KERENTANAN)
    # -------------------------------------------------------------
    doc.add_page_break()
    add_h1("BAB IV. TABEL ANALISIS RISIKO KEAMANAN INFORMASI")
    add_body("Berdasarkan observasi non-intrusif dan analisis arsitektural terhadap sistem, berikut adalah 10 (sepuluh) skenario ancaman dan kerentanan yang teridentifikasi, dilengkapi bukti pendukung observasi, penilaian probabilitas (L), dampak (I), serta penentuan prioritas risiko:")

    # Table with all 10 vulnerabilities
    t_risk = doc.add_table(rows=11, cols=9)
    t_risk.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_risk)
    
    headers_risk = ["ID", "Aset Terkena", "Ancaman & Kerentanan", "Dampak (CIA)", "Bukti / Observasi Nyata", "L", "I", "Skor", "Prioritas"]
    col_widths = [Cm(0.8), Cm(1.8), Cm(3.8), Cm(2.5), Cm(3.8), Cm(0.8), Cm(0.8), Cm(1.0), Cm(1.8)]
    
    for i, h in enumerate(headers_risk):
        cell = t_risk.cell(0, i)
        set_cell_background(cell, "102C57")
        set_cell_margins(cell, 100, 100, 80, 80)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(h)
        run.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        run.font.size = Pt(8.5)

    risk_rows = [
        ("RSK-01", "AST-01\n(Data Nilai)", 
         "Ancaman: BOLA / IDOR pada Endpoint KHS\nKerentanan: Ketiadaan verifikasi kepemilikan data pada parameter id_mahasiswa di API KHS.",
         "Kebocoran nilai & potensi manipulasi nilai semester orang lain (Loss of Confidentiality & Integrity).",
         "URL endpoint cetak KHS memakai format terbuka /khs/cetak?npm=19830001; saat nilai parameter diubah ke NPM lain, browser memuat data mahasiswa tersebut tanpa re-autentikasi.",
         "4", "4", "16", "CRITICAL", "FFCCCC"),

        ("RSK-02", "AST-01, AST-03\n(Database)", 
         "Ancaman: SQL Injection (SQLi) pada Form Filter\nKerentanan: Penggabungan string langsung (concatenation) query SQL tanpa prepared statement.",
         "Eksfiltrasi seluruh isi tabel kredensial admin dan modifikasi data nilai permanen.",
         "Parameter filter pencarian dosen /jadwal?dosen=' menghasilkan error database sintaksis 'You have an error in your SQL syntax' pada response browser.",
         "3", "5", "15", "CRITICAL", "FFCCCC"),

        ("RSK-03", "AST-02\n(Server Web)", 
         "Ancaman: Denial of Service (DDoS) / Server Crash\nKerentanan: Ketiadaan mekanisme Rate Limiting dan CAPTCHA pada portal saat masa puncak pengisian KRS.",
         "Layanan sistem lumpuh total (504 Gateway Timeout), proses akademik terhenti.",
         "Sistem gagal merespons saat 500 mahasiswa login bersamaan; tidak ada batas request (tidak ada HTTP 429 Too Many Requests) saat refresh berulang.",
         "5", "4", "20", "CRITICAL", "FFCCCC"),

        ("RSK-04", "AST-03, AST-04\n(Kredensial)", 
         "Ancaman: Password Guessing / Credential Stuffing\nKerentanan: Mahasiswa baru diberikan password default (NPM/tgl lahir) tanpa paksaan ganti password & tanpa MFA.",
         "Pengambilalihan akun massal oleh pihak luar, pemalsuan registrasi mata kuliah.",
         "Dokumen pedoman orientasi mahasiswa baru menginstruksikan login awal menggunakan NPM sebagai password; sistem tidak memaksa ubah kata sandi.",
         "4", "3", "12", "HIGH", "FFE0B2"),

        ("RSK-05", "AST-03\n(Token Sesi)", 
         "Ancaman: Session Hijacking via Network Sniffing\nKerentanan: Atribut Session Cookie tidak disetel 'HttpOnly', 'Secure', dan 'SameSite'.",
         "Pencurian cookie sesi login melalui script client-side (XSS) atau jaringan Wi-Fi publik.",
         "Inspeksi Storage di Browser DevTools menunjukkan cookie 'PHPSESSID' memiliki flag HttpOnly=False dan Secure=False meskipun diakses via HTTPS.",
         "3", "3", "9", "MEDIUM", "FFF9C4"),

        ("RSK-06", "AST-02, AST-06\n(Storage)", 
         "Ancaman: Remote Code Execution (RCE)\nKerentanan: Validasi file upload bukti pembayaran hanya memeriksa ekstensi klien, folder upload dapat mengeksekusi PHP.",
         "Penyerang dapat menanam web shell backdoor dan mengontrol seluruh server secara penuh.",
         "Endpoint /upload_bukti menerima berkas gambar namun disimpan dalam direktori /uploads/ yang dapat diakses langsung secara publik tanpa filter MIME type server.",
         "2", "5", "10", "HIGH", "FFE0B2"),

        ("RSK-07", "AST-01, AST-03\n(API Access)", 
         "Ancaman: Privilege Escalation (Broken Access Control)\nKerentanan: Route API untuk input nilai dosen hanya dicek di frontend (UI button), backend API tidak memvalidasi role.",
         "Mahasiswa dapat mengirim request POST nilai jika mengetahui URL endpoint /api/v1/nilai/simpan.",
         "DevTools Network tab memperlihatkan response API berisi data role_id; endpoint POST /api/nilai mengembalikan HTTP 200 saat diuji dengan JWT token mahasiswa biasa.",
         "3", "4", "12", "HIGH", "FFE0B2"),

        ("RSK-08", "AST-04\n(Data Pribadi)", 
         "Ancaman: Pencurian Data Pribadi (Data Breach)\nKerentanan: Penyimpanan data identitas kependudukan (NIK, No KK, Gaji Ortu) dalam database dalam format teks polos (Plaintext).",
         "Pelanggaran UU Perlindungan Data Pribadi (UU PDP), pencurian identitas dan penipuan digital.",
         "Respons JSON pada endpoint profil mahasiswa memuat atribut 'nik' dan 'no_rekening' lengkap tanpa masking (contoh: 1271012304980001 terlihat utuh).",
         "3", "4", "12", "HIGH", "FFE0B2"),

        ("RSK-09", "AST-02\n(Web Server)", 
         "Ancaman: Eksploitasi CVE Server Komponen Usang\nKerentanan: Server menampilkan banner informasi versi PHP dan Apache usang (Information Disclosure).",
         "Penyerang dapat mencari eksploit publik yang relevan dengan versi spesifik server.",
         "Pemeriksaan Response Header menampilkan: 'Server: Apache/2.4.41 (Ubuntu)' dan 'X-Powered-By: PHP/7.4.3', di mana PHP 7.4 telah mencapai status End of Life (EOL).",
         "4", "2", "8", "MEDIUM", "FFF9C4"),

        ("RSK-10", "AST-05\n(Integrasi VA)", 
         "Ancaman: Payment Callback Spoofing / Tampering\nKerentanan: Ketiadaan verifikasi Digital Signature / HMAC Secret pada URL webhook callback pembayaran bank.",
         "Mahasiswa dapat menandai status pembayaran SPP menjadi 'Lunas' tanpa benar-benar mentransfer dana.",
         "Inspeksi skrip integrasi menunjukkan URL /api/callback/payment menerima parameter status=PAID tanpa validasi header x-signature atau token rahasia bersama.",
         "2", "5", "10", "HIGH", "FFE0B2")
    ]

    for r_idx, row in enumerate(risk_rows, start=1):
        for c_idx in range(9):
            cell = t_risk.cell(r_idx, c_idx)
            set_cell_background(cell, row[9])
            set_cell_margins(cell, 60, 60, 60, 60)
            p = cell.paragraphs[0]
            if c_idx in [0, 5, 6, 7, 8]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(row[c_idx])
            r.font.size = Pt(7.5)
            if c_idx in [0, 7, 8]:
                r.bold = True

    # -------------------------------------------------------------
    # BAB V: REKOMENDASI KONTROL KEAMANAN (MINIMAL 5 KONTROL)
    # -------------------------------------------------------------
    doc.add_page_break()
    add_h1("BAB V. REKOMENDASI KONTROL DAN RENCANA PERBAIKAN")
    add_body("Berdasarkan hasil analisis matriks risiko, disusun 6 (enam) rekomendasi kontrol keamanan berstandar industri (NIST SP 800-53 dan OWASP Proactive Controls) untuk memitigasi seluruh temuan kerentanan di atas:")

    rekomendasi_list = [
        ("KTR-01: Penerapan Strict Authorization & Object-Level Permission (Mengatasi RSK-01 & RSK-07)",
         "Kategori Kontrol: Preventif (Akses Kontrol & Otorisasi)",
         "Implementasi:\n"
         "1. Hapus ketergantungan parameter ID mahasiswa pada URL (URL-based parameters) untuk data sensitif. Gunakan identitas yang terikat pada decoded JWT session token di sisi server.\n"
         "2. Terapkan middleware otorisasi (Role-Based Access Control / RBAC & Attribute-Based Access Control / ABAC) di backend API untuk setiap route/endpoint. Sistem harus memverifikasi apakah token penyerang memiliki izin eksplisit terhadap id_mahasiswa atau peran sebagai Dosen Wali mahasiswa bersangkutan sebelum query dieksekusi."),

        ("KTR-02: Migrasi ke Parameterized Queries & WAF Rules (Mengatasi RSK-02)",
         "Kategori Kontrol: Preventif & Korektif (Keamanan Basis Data)",
         "Implementasi:\n"
         "1. Standardisasi seluruh akses basis data menggunakan Prepared Statements dengan PDO (PHP Data Objects) atau Object Relational Mapping (ORM) seperti Prisma / Eloquent. Dilarang keras melakukan konkatenasi variabel langsung ke string SQL.\n"
         "2. Terapkan Web Application Firewall (WAF) seperti Cloudflare atau ModSecurity dengan ruleset OWASP Core Rule Set (CRS) untuk mendeteksi dan memblokir upaya injeksi SQL, karakter anomali (UNION, SELECT, sleep, dll) secara real-time."),

        ("KTR-03: Implementasi Rate Limiting, CDN Caching, dan Turnstile CAPTCHA (Mengatasi RSK-03 & RSK-04)",
         "Kategori Kontrol: Preventif & Detektif (Ketersediaan & Perlindungan Brute-force)",
         "Implementasi:\n"
         "1. Konfigurasi modul Rate Limiter berbasis in-memory (Redis / NGINX limit_req) dengan ambang batas maksimum 60 request per menit per alamat IP untuk endpoint umum, dan maksimal 5 percobaan gagal per 15 menit untuk endpoint autentikasi login.\n"
         "2. Tambahkan widget perlindungan bot non-intrusif (Cloudflare Turnstile atau Google reCAPTCHA v3) pada form login portal mahasiswa dan dosen.\n"
         "3. Terapkan CDN (Content Delivery Network) untuk melayani asset statis (CSS, JS, media gambar) sehingga beban server inti terisolasi hanya untuk pemrosesan transaksi KRS."),

        ("KTR-04: Penegakan Kebijakan Sandi Kuat, MFA, dan Cookie Hardening (Mengatasi RSK-04 & RSK-05)",
         "Kategori Kontrol: Preventif (Manajemen Identitas & Sesi)",
         "Implementasi:\n"
         "1. Wajibkan proses perubahan kata sandi pertama kali (Forced Password Reset on First Login) saat mahasiswa/staf baru mengakses portal, dengan syarat entropi sandi minimal 10 karakter (kombinasi huruf besar, kecil, angka, dan simbol).\n"
         "2. Aktifkan Multi-Factor Authentication (MFA) berbasis TOTP (Google Authenticator) wajib bagi seluruh akun admin BAAK, keuangan, dan dosen penginput nilai.\n"
         "3. Konfigurasi parameter session cookie pada file php.ini atau application middleware dengan flag: session.cookie_httponly = 1; session.cookie_secure = 1; session.cookie_samesite = 'Strict'; guna memblokir manipulasi token via XSS dan jaringan."),

        ("KTR-05: Restriksi dan Isolasi Fitur Unggah Berkas (Mengatasi RSK-06)",
         "Kategori Kontrol: Preventif (Keamanan File Storage)",
         "Implementasi:\n"
         "1. Validasi berkas unggahan di server-side tidak hanya memeriksa ekstensi (.jpg, .pdf), namun wajib memverifikasi Magic Bytes (File Header Signature) dan menggunakan whitelist tipe file yang diizinkan.\n"
         "2. Ganti nama berkas yang diunggah menggunakan UUID random (contoh: 550e8400-e29b-41d4.pdf) untuk mencegah directory traversal.\n"
         "3. Simpan berkas pada direktori terisolasi di luar web-root (Document Root) atau manfaatkan cloud object storage (Amazon S3 / MinIO) dengan header Content-Disposition: attachment, serta matikan eksekusi skrip (disable PHP execution) pada folder penyimpanan."),

        ("KTR-06: Kriptografi Data Sensitif & Verifikasi Webhook HMAC (Mengatasi RSK-08 & RSK-10)",
         "Kategori Kontrol: Preventif & Integritas (Kriptografi Data)",
         "Implementasi:\n"
         "1. Terapkan enkripsi kolom tingkat basis data (Column-Level Encryption) menggunakan algoritma AES-256-GCM untuk atribut identitas sensitif (NIK, Nomor Kartu Keluarga, dan nomor rekening wali) agar data tetap aman meskipun terjadi kebocoran dump database fisik.\n"
         "2. Implementasikan tanda tangan kriptografis berbasis kunci rahasia bersama (HMAC-SHA256 Signature) pada seluruh payload webhook pembayaran dari payment gateway / bank. Server SIAKAD wajib menghitung ulang hash signature dan menolak callback jika payload tidak valid.")
    ]

    for judul, kategori, rincian in rekomendasi_list:
        add_h2(judul)
        p_kat = doc.add_paragraph()
        p_kat.paragraph_format.left_indent = Cm(0.5)
        p_kat.paragraph_format.space_after = Pt(2)
        r_k = p_kat.add_run(kategori)
        r_k.bold = True
        r_k.font.color.rgb = RGBColor(16, 44, 87)
        r_k.font.size = Pt(10)
        
        p_rin = doc.add_paragraph()
        p_rin.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_rin.paragraph_format.left_indent = Cm(0.5)
        p_rin.paragraph_format.space_after = Pt(8)
        p_rin.add_run(rincian)

    # -------------------------------------------------------------
    # BAB VI: KESIMPULAN
    # -------------------------------------------------------------
    add_h1("BAB VI. KESIMPULAN")
    add_body("Berdasarkan analisis risiko keamanan informasi yang dilakukan terhadap Sistem Informasi Akademik (SIAKAD), dapat ditarik beberapa poin kesimpulan strategis:")
    
    kesimpulan_pts = [
        ("Kerentanan Berisiko Kritis Didominasi Masalah Otorisasi dan Ketersediaan: ", "Temuan BOLA/IDOR pada endpoint nilai dan absennya Rate Limiting saat beban puncak KRS menjadi ancaman terbesar yang dapat merusak integritas catatan akademik serta kelangsungan operasional kampus."),
        ("Pentingnya Pertahanan Berlapis (Defense in Depth): ", "Keamanan sistem tidak dapat bergantung hanya pada satu perimeter. Kombinasi validasi input (prepared statements), kontrol akses berbasis peran di sisi server, proteksi sesi (MFA & secure cookies), dan enkripsi data PII merupakan prasyarat mutlak dalam kepatuhan regulasi UU PDP."),
        ("Rencana Tindak Lanjut Terstruktur: ", "Manajemen kampus dan tim pengembang teknologi informasi disarankan segera menuntaskan perbaikan prioritas risiko Kritis dalam kurun 48 jam, disusul risiko Tinggi dalam 2 minggu ke depan sebelum semester baru dimulai.")
    ]
    for b_prefix, b_text in kesimpulan_pts:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Cm(1.0)
        p.paragraph_format.space_after = Pt(3)
        r1 = p.add_run("1. " if b_prefix.startswith("Kerentanan") else ("2. " if b_prefix.startswith("Pentingnya") else "3. "))
        r1.bold = True
        r2 = p.add_run(b_prefix)
        r2.bold = True
        p.add_run(b_text)

    # Simpan file
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), OUTPUT_FILE)
    doc.save(output_path)
    print(f"[OK] Sukses membuat file Word: {output_path}")

if __name__ == "__main__":
    build_document()
