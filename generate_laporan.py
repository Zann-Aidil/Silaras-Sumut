"""
Script untuk generate Laporan Analisis Sistem SILARAS
Format: .docx (Microsoft Word)
Pedoman: UMA - Kerja Praktek
"""

from docx import Document
from docx.shared import Pt, Inches, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_ORIENT
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
import os

# ============================================================
# KONFIGURASI
# ============================================================
OUTPUT_FILE = "Laporan_Analisis_Sistem_SILARAS.docx"
FONT_NAME = "Times New Roman"
FONT_SIZE_BODY = 12
FONT_SIZE_BAB = 14
LINE_SPACING = 1.5

def create_document():
    doc = Document()
    
    # Setup margins: kiri 4cm, atas-kanan-bawah 3cm
    for section in doc.sections:
        section.top_margin = Cm(3)
        section.bottom_margin = Cm(3)
        section.left_margin = Cm(4)
        section.right_margin = Cm(3)
    
    # Setup default font
    style = doc.styles['Normal']
    font = style.font
    font.name = FONT_NAME
    font.size = Pt(FONT_SIZE_BODY)
    style.paragraph_format.line_spacing = LINE_SPACING
    style.paragraph_format.space_after = Pt(0)
    style.paragraph_format.space_before = Pt(0)
    
    # Set East Asian font
    rPr = style.element.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = parse_xml(f'<w:rFonts {nsdecls("w")} w:eastAsia="{FONT_NAME}"/>')
        rPr.append(rFonts)
    else:
        rFonts.set(qn('w:eastAsia'), FONT_NAME)
    
    return doc

def add_heading_bab(doc, text, level=1):
    """Tambah heading BAB dengan format 14pt bold"""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER if level == 0 else WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(12)
    p.paragraph_format.line_spacing = LINE_SPACING
    run = p.add_run(text)
    run.bold = True
    run.font.name = FONT_NAME
    run.font.size = Pt(FONT_SIZE_BAB) if level <= 1 else Pt(FONT_SIZE_BODY)
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = parse_xml(f'<w:rFonts {nsdecls("w")} w:eastAsia="{FONT_NAME}"/>')
        rPr.append(rFonts)
    return p

def add_sub_heading(doc, text, level=2):
    """Tambah sub heading dengan format 12pt bold"""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = LINE_SPACING
    run = p.add_run(text)
    run.bold = True
    run.font.name = FONT_NAME
    run.font.size = Pt(FONT_SIZE_BODY)
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = parse_xml(f'<w:rFonts {nsdecls("w")} w:eastAsia="{FONT_NAME}"/>')
        rPr.append(rFonts)
    return p

def add_paragraph(doc, text, bold=False, italic=False, alignment=WD_ALIGN_PARAGRAPH.JUSTIFY, indent_first_line=True):
    """Tambah paragraf biasa"""
    p = doc.add_paragraph()
    p.alignment = alignment
    p.paragraph_format.line_spacing = LINE_SPACING
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.space_before = Pt(0)
    if indent_first_line:
        p.paragraph_format.first_line_indent = Cm(1.27)
    run = p.add_run(text)
    run.bold = bold
    run.italic = italic
    run.font.name = FONT_NAME
    run.font.size = Pt(FONT_SIZE_BODY)
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = parse_xml(f'<w:rFonts {nsdecls("w")} w:eastAsia="{FONT_NAME}"/>')
        rPr.append(rFonts)
    return p

def add_numbered_item(doc, number, text, indent_level=0):
    """Tambah item bernomor"""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.line_spacing = LINE_SPACING
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.space_before = Pt(0)
    left_indent = Cm(1.27) * (indent_level + 1)
    p.paragraph_format.left_indent = left_indent
    p.paragraph_format.hanging_indent = Cm(0.63)
    run = p.add_run(f"{number}. {text}")
    run.font.name = FONT_NAME
    run.font.size = Pt(FONT_SIZE_BODY)
    return p

def add_bullet_item(doc, text, indent_level=0):
    """Tambah item bullet"""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.line_spacing = LINE_SPACING
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.space_before = Pt(0)
    left_indent = Cm(1.27) * (indent_level + 1)
    p.paragraph_format.left_indent = left_indent
    p.paragraph_format.hanging_indent = Cm(0.63)
    run = p.add_run(f"• {text}")
    run.font.name = FONT_NAME
    run.font.size = Pt(FONT_SIZE_BODY)
    return p

def set_cell_shading(cell, color):
    """Set background color pada cell tabel"""
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def format_cell(cell, text, bold=False, alignment=WD_ALIGN_PARAGRAPH.LEFT, font_size=10):
    """Format cell tabel"""
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = alignment
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.0
    run = p.add_run(text)
    run.bold = bold
    run.font.name = FONT_NAME
    run.font.size = Pt(font_size)
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = parse_xml(f'<w:rFonts {nsdecls("w")} w:eastAsia="{FONT_NAME}"/>')
        rPr.append(rFonts)

def add_table_caption(doc, text):
    """Tambah keterangan tabel"""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = LINE_SPACING
    run = p.add_run(text)
    run.bold = True
    run.font.name = FONT_NAME
    run.font.size = Pt(FONT_SIZE_BODY)
    return p

def add_figure_caption(doc, text):
    """Tambah keterangan gambar"""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(12)
    p.paragraph_format.line_spacing = LINE_SPACING
    run = p.add_run(text)
    run.bold = True
    run.font.name = FONT_NAME
    run.font.size = Pt(FONT_SIZE_BODY)
    return p

def add_page_break(doc):
    doc.add_page_break()

def add_empty_line(doc, count=1):
    for _ in range(count):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.line_spacing = LINE_SPACING
        run = p.add_run("")
        run.font.name = FONT_NAME
        run.font.size = Pt(FONT_SIZE_BODY)


# ============================================================
# HALAMAN COVER
# ============================================================
def add_cover_page(doc):
    add_empty_line(doc, 3)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("LAPORAN KERJA PRAKTEK")
    run.bold = True
    run.font.name = FONT_NAME
    run.font.size = Pt(16)
    
    add_empty_line(doc, 2)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.line_spacing = LINE_SPACING
    run = p.add_run("ANALISIS DAN PERANCANGAN\nSISTEM INFORMASI LAYANAN DAN ARSIP (SILARAS)\nPADA DINAS KOMUNIKASI DAN INFORMATIKA\nPROVINSI SUMATERA UTARA")
    run.bold = True
    run.font.name = FONT_NAME
    run.font.size = Pt(14)
    
    add_empty_line(doc, 3)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("Disusun Oleh:")
    run.font.name = FONT_NAME
    run.font.size = Pt(12)
    
    add_empty_line(doc)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("[NAMA MAHASISWA]")
    run.bold = True
    run.font.name = FONT_NAME
    run.font.size = Pt(14)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("[NPM]")
    run.bold = True
    run.font.name = FONT_NAME
    run.font.size = Pt(14)
    
    add_empty_line(doc, 4)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.line_spacing = LINE_SPACING
    run = p.add_run("PROGRAM STUDI INFORMATIKA\nFAKULTAS TEKNIK DAN ILMU KOMPUTER\nUNIVERSITAS MEDAN AREA\nMEDAN\n2026")
    run.bold = True
    run.font.name = FONT_NAME
    run.font.size = Pt(12)

# ============================================================
# HALAMAN PENGESAHAN
# ============================================================
def add_halaman_pengesahan(doc):
    add_page_break(doc)
    add_empty_line(doc, 2)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("HALAMAN PENGESAHAN")
    run.bold = True
    run.font.name = FONT_NAME
    run.font.size = Pt(14)
    
    add_empty_line(doc)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.line_spacing = LINE_SPACING
    run = p.add_run("LAPORAN KERJA PRAKTEK")
    run.bold = True
    run.font.name = FONT_NAME
    run.font.size = Pt(12)
    
    add_empty_line(doc)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.line_spacing = LINE_SPACING
    run = p.add_run("ANALISIS DAN PERANCANGAN\nSISTEM INFORMASI LAYANAN DAN ARSIP (SILARAS)\nPADA DINAS KOMUNIKASI DAN INFORMATIKA\nPROVINSI SUMATERA UTARA")
    run.bold = True
    run.font.name = FONT_NAME
    run.font.size = Pt(12)
    
    add_empty_line(doc, 2)

    add_paragraph(doc, "Laporan Kerja Praktek ini telah diperiksa dan disetujui untuk diseminarkan.", indent_first_line=False, alignment=WD_ALIGN_PARAGRAPH.CENTER)
    
    add_empty_line(doc, 2)
    
    # Tabel tanda tangan
    table = doc.add_table(rows=2, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    format_cell(table.cell(0, 0), "Pembimbing Lapangan,", alignment=WD_ALIGN_PARAGRAPH.CENTER, font_size=12)
    format_cell(table.cell(0, 1), "Dosen Pembimbing KP,", alignment=WD_ALIGN_PARAGRAPH.CENTER, font_size=12)
    
    format_cell(table.cell(1, 0), "\n\n\n\n(_________________________)\nNIP. ", alignment=WD_ALIGN_PARAGRAPH.CENTER, font_size=12)
    format_cell(table.cell(1, 1), "\n\n\n\n(_________________________)\nNIDN. ", alignment=WD_ALIGN_PARAGRAPH.CENTER, font_size=12)
    
    add_empty_line(doc, 2)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("Mengetahui,\nKetua Program Studi Informatika")
    run.font.name = FONT_NAME
    run.font.size = Pt(12)
    
    add_empty_line(doc, 3)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("(_________________________)\nNIDN. ")
    run.font.name = FONT_NAME
    run.font.size = Pt(12)


# ============================================================
# ABSTRAK
# ============================================================
def add_abstrak(doc):
    add_page_break(doc)
    
    add_heading_bab(doc, "ABSTRAK", level=0)
    add_empty_line(doc)
    
    add_paragraph(doc,
        "Kerja Praktek (KP) ini dilaksanakan di Dinas Komunikasi dan Informatika (Diskominfo) "
        "Provinsi Sumatera Utara. Tujuan dari KP ini adalah untuk menganalisis dan merancang "
        "Sistem Informasi Layanan dan Arsip (SILARAS) yang dapat membantu pengelolaan permohonan "
        "layanan teknologi informasi (TI) dan arsip digital di lingkungan instansi pemerintah. "
        "Permasalahan yang dihadapi saat ini adalah proses pengelolaan permohonan layanan TI masih "
        "dilakukan secara manual sehingga memicu keterlambatan penanganan, kesulitan pelacakan, "
        "dan kurangnya transparansi.")
    
    add_paragraph(doc,
        "Metode pengembangan yang digunakan adalah metode waterfall dengan tahapan analisis "
        "kebutuhan, perancangan sistem, implementasi, dan pengujian. Sistem ini dibangun "
        "menggunakan teknologi React 18 dengan Vite sebagai frontend, PHP native sebagai backend, "
        "dan MySQL sebagai database. Autentikasi menggunakan session-based authentication dengan "
        "role-based access control untuk membedakan hak akses antara admin dan user biasa.")
    
    add_paragraph(doc,
        "Hasil dari KP ini adalah sebuah aplikasi web SILARAS yang mampu mengelola permohonan "
        "layanan TI secara digital, melacak status permohonan secara real-time, mengelola data "
        "instansi dan jenis layanan, serta menghasilkan laporan rekap operasional yang dapat "
        "diekspor dalam format PDF. Sistem ini diharapkan dapat meningkatkan efisiensi dan "
        "transparansi pelayanan TI di Diskominfo Provinsi Sumatera Utara.")
    
    add_empty_line(doc)
    
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = LINE_SPACING
    run = p.add_run("Kata Kunci: ")
    run.bold = True
    run.font.name = FONT_NAME
    run.font.size = Pt(12)
    run2 = p.add_run("Sistem Informasi, Helpdesk, Layanan TI, SILARAS, Diskominfo Sumatera Utara, React, PHP, MySQL")
    run2.italic = True
    run2.font.name = FONT_NAME
    run2.font.size = Pt(12)


# ============================================================
# KATA PENGANTAR
# ============================================================
def add_kata_pengantar(doc):
    add_page_break(doc)
    
    add_heading_bab(doc, "KATA PENGANTAR", level=0)
    add_empty_line(doc)
    
    add_paragraph(doc,
        "Puji dan syukur penulis panjatkan kehadirat Tuhan Yang Maha Esa atas berkat "
        "dan rahmat-Nya sehingga penulis dapat menyelesaikan Laporan Kerja Praktek (KP) "
        "dengan judul \"Analisis dan Perancangan Sistem Informasi Layanan dan Arsip (SILARAS) "
        "pada Dinas Komunikasi dan Informatika Provinsi Sumatera Utara\" ini dengan baik.")
    
    add_paragraph(doc,
        "Laporan Kerja Praktek ini disusun sebagai salah satu syarat untuk menyelesaikan "
        "mata kuliah Kerja Praktek pada Program Studi Informatika, Fakultas Teknik dan "
        "Ilmu Komputer, Universitas Medan Area.")
    
    add_paragraph(doc,
        "Dalam penyusunan laporan ini, penulis mendapat banyak bantuan dan bimbingan dari "
        "berbagai pihak. Oleh karena itu, penulis mengucapkan terima kasih yang sebesar-besarnya kepada:")
    
    thank_list = [
        "Bapak/Ibu [Nama Pembimbing Lapangan], selaku Pembimbing Lapangan di Diskominfo Provinsi Sumatera Utara yang telah memberikan arahan dan bimbingan selama pelaksanaan KP.",
        "Bapak/Ibu [Nama Dosen Pembimbing], selaku Dosen Pembimbing KP yang telah memberikan bimbingan dan masukan dalam penyusunan laporan ini.",
        "Bapak/Ibu [Nama Kaprodi], selaku Ketua Program Studi Informatika Universitas Medan Area.",
        "Seluruh staf dan pegawai Diskominfo Provinsi Sumatera Utara yang telah membantu selama pelaksanaan KP.",
        "Kedua orang tua dan keluarga yang selalu memberikan dukungan moral dan material.",
        "Teman-teman seperjuangan yang telah memberikan semangat dan motivasi."
    ]
    
    for i, item in enumerate(thank_list, 1):
        add_numbered_item(doc, i, item)
    
    add_empty_line(doc)
    
    add_paragraph(doc,
        "Penulis menyadari bahwa laporan ini masih jauh dari sempurna. Oleh karena itu, "
        "penulis mengharapkan kritik dan saran yang membangun untuk perbaikan di masa mendatang. "
        "Semoga laporan ini dapat bermanfaat bagi semua pihak.")
    
    add_empty_line(doc, 2)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p.paragraph_format.line_spacing = LINE_SPACING
    run = p.add_run("Medan, ______ 2026\nPenulis,")
    run.font.name = FONT_NAME
    run.font.size = Pt(12)
    
    add_empty_line(doc, 3)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = p.add_run("[NAMA MAHASISWA]")
    run.bold = True
    run.font.name = FONT_NAME
    run.font.size = Pt(12)


# ============================================================
# DAFTAR ISI
# ============================================================
def add_daftar_isi(doc):
    add_page_break(doc)
    
    add_heading_bab(doc, "DAFTAR ISI", level=0)
    add_empty_line(doc)
    
    items = [
        ("HALAMAN PENGESAHAN", "ii"),
        ("ABSTRAK", "iii"),
        ("KATA PENGANTAR", "iv"),
        ("DAFTAR ISI", "v"),
        ("DAFTAR TABEL", "vii"),
        ("DAFTAR GAMBAR", "viii"),
        ("", ""),
        ("BAB I PENDAHULUAN", "1"),
        ("    1.1 Latar Belakang", "1"),
        ("    1.2 Rumusan Masalah", "2"),
        ("    1.3 Tujuan Kerja Praktek", "2"),
        ("    1.4 Manfaat Kerja Praktek", "3"),
        ("    1.5 Waktu dan Tempat Pelaksanaan", "3"),
        ("    1.6 Sistematika Penulisan", "4"),
        ("", ""),
        ("BAB II TINJAUAN TEORITIS", "5"),
        ("    2.1 Sistem Informasi", "5"),
        ("    2.2 Helpdesk dan IT Service Management", "5"),
        ("    2.3 Arsitektur Client-Server", "6"),
        ("    2.4 Basis Data", "6"),
        ("    2.5 Entity Relationship Diagram (ERD)", "7"),
        ("    2.6 Data Flow Diagram (DFD)", "7"),
        ("    2.7 Use Case Diagram", "7"),
        ("    2.8 Flowchart", "8"),
        ("    2.9 Teknologi yang Digunakan", "8"),
        ("", ""),
        ("BAB III ANALISIS DAN PERANCANGAN SISTEM", "10"),
        ("    3.1 Analisis Sistem Berjalan", "10"),
        ("    3.2 Analisis Kebutuhan Sistem", "11"),
        ("    3.3 Analisis Sistem Usulan", "13"),
        ("    3.4 Perancangan Use Case Diagram", "14"),
        ("    3.5 Perancangan Data Flow Diagram (DFD)", "16"),
        ("    3.6 Perancangan Entity Relationship Diagram (ERD)", "18"),
        ("    3.7 Perancangan Flowchart Sistem", "20"),
        ("    3.8 Perancangan Basis Data", "22"),
        ("    3.9 Perancangan Antarmuka", "28"),
        ("    3.10 Implementasi Sistem", "30"),
        ("", ""),
        ("BAB IV PENUTUP", "35"),
        ("    4.1 Kesimpulan", "35"),
        ("    4.2 Saran", "36"),
        ("", ""),
        ("DAFTAR PUSTAKA", "37"),
        ("LAMPIRAN", "38"),
    ]
    
    for item_text, page in items:
        if item_text == "" and page == "":
            add_empty_line(doc)
            continue
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = LINE_SPACING
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.space_before = Pt(0)
        
        if item_text.startswith("    "):
            p.paragraph_format.left_indent = Cm(1)
            display_text = item_text.strip()
        else:
            display_text = item_text
        
        is_bab = display_text.startswith("BAB") or display_text in ["HALAMAN PENGESAHAN", "ABSTRAK", "KATA PENGANTAR", "DAFTAR ISI", "DAFTAR TABEL", "DAFTAR GAMBAR", "DAFTAR PUSTAKA", "LAMPIRAN"]
        
        tab_stops = p.paragraph_format.tab_stops
        tab_stops.add_tab_stop(Cm(13.5), alignment=WD_ALIGN_PARAGRAPH.RIGHT, leader=1)
        
        run = p.add_run(display_text)
        run.bold = is_bab
        run.font.name = FONT_NAME
        run.font.size = Pt(12)
        
        run2 = p.add_run(f"\t{page}")
        run2.font.name = FONT_NAME
        run2.font.size = Pt(12)


# ============================================================
# DAFTAR TABEL
# ============================================================
def add_daftar_tabel(doc):
    add_page_break(doc)
    
    add_heading_bab(doc, "DAFTAR TABEL", level=0)
    add_empty_line(doc)
    
    tables_list = [
        ("Tabel 3.1", "Kebutuhan Fungsional Sistem", "11"),
        ("Tabel 3.2", "Kebutuhan Non-Fungsional Sistem", "12"),
        ("Tabel 3.3", "Perbandingan Sistem Berjalan dan Sistem Usulan", "13"),
        ("Tabel 3.4", "Struktur Tabel instansi", "22"),
        ("Tabel 3.5", "Struktur Tabel users", "23"),
        ("Tabel 3.6", "Struktur Tabel jenis_layanan", "24"),
        ("Tabel 3.7", "Struktur Tabel permohonan", "25"),
        ("Tabel 3.8", "Struktur Tabel riwayat_status", "26"),
        ("Tabel 3.9", "Struktur Tabel log_aktivitas", "27"),
        ("Tabel 3.10", "Daftar API Endpoint", "30"),
        ("Tabel 3.11", "Hasil Pengujian Sistem", "33"),
    ]
    
    for tabel_no, caption, page in tables_list:
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = LINE_SPACING
        p.paragraph_format.space_after = Pt(2)
        tab_stops = p.paragraph_format.tab_stops
        tab_stops.add_tab_stop(Cm(13.5), alignment=WD_ALIGN_PARAGRAPH.RIGHT, leader=1)
        
        run = p.add_run(f"{tabel_no} {caption}")
        run.font.name = FONT_NAME
        run.font.size = Pt(12)
        
        run2 = p.add_run(f"\t{page}")
        run2.font.name = FONT_NAME
        run2.font.size = Pt(12)


# ============================================================
# DAFTAR GAMBAR
# ============================================================
def add_daftar_gambar(doc):
    add_page_break(doc)
    
    add_heading_bab(doc, "DAFTAR GAMBAR", level=0)
    add_empty_line(doc)
    
    gambar_list = [
        ("Gambar 3.1", "Flowchart Sistem Berjalan", "10"),
        ("Gambar 3.2", "Use Case Diagram Sistem SILARAS", "14"),
        ("Gambar 3.3", "DFD Level 0 (Diagram Konteks)", "16"),
        ("Gambar 3.4", "DFD Level 1", "17"),
        ("Gambar 3.5", "Entity Relationship Diagram (ERD)", "18"),
        ("Gambar 3.6", "Flowchart Proses Login", "20"),
        ("Gambar 3.7", "Flowchart Proses Permohonan", "21"),
        ("Gambar 3.8", "Flowchart Proses Admin", "21"),
        ("Gambar 3.9", "Rancangan Halaman Login", "28"),
        ("Gambar 3.10", "Rancangan Dashboard User", "28"),
        ("Gambar 3.11", "Rancangan Dashboard Admin", "29"),
        ("Gambar 3.12", "Rancangan Form Permohonan", "29"),
        ("Gambar 3.13", "Tampilan Halaman Login", "31"),
        ("Gambar 3.14", "Tampilan Dashboard User", "31"),
        ("Gambar 3.15", "Tampilan Dashboard Admin", "32"),
        ("Gambar 3.16", "Tampilan Daftar Permohonan", "32"),
    ]
    
    for gambar_no, caption, page in gambar_list:
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = LINE_SPACING
        p.paragraph_format.space_after = Pt(2)
        tab_stops = p.paragraph_format.tab_stops
        tab_stops.add_tab_stop(Cm(13.5), alignment=WD_ALIGN_PARAGRAPH.RIGHT, leader=1)
        
        run = p.add_run(f"{gambar_no} {caption}")
        run.font.name = FONT_NAME
        run.font.size = Pt(12)
        
        run2 = p.add_run(f"\t{page}")
        run2.font.name = FONT_NAME
        run2.font.size = Pt(12)


# ============================================================
# BAB I - PENDAHULUAN
# ============================================================
def add_bab_1(doc):
    add_page_break(doc)
    
    add_heading_bab(doc, "BAB I", level=0)
    add_heading_bab(doc, "PENDAHULUAN", level=0)
    add_empty_line(doc)
    
    # 1.1 Latar Belakang
    add_sub_heading(doc, "1.1 Latar Belakang")
    
    add_paragraph(doc,
        "Perkembangan teknologi informasi yang semakin pesat menuntut setiap instansi "
        "pemerintahan untuk melakukan transformasi digital dalam pengelolaan layanan publik. "
        "Dinas Komunikasi dan Informatika (Diskominfo) Provinsi Sumatera Utara sebagai "
        "instansi yang bertanggung jawab atas pengelolaan teknologi informasi dan komunikasi "
        "di lingkungan Pemerintah Provinsi Sumatera Utara, menerima berbagai permohonan "
        "layanan TI dari banyak unit kerja dan Organisasi Perangkat Daerah (OPD).")
    
    add_paragraph(doc,
        "Saat ini, proses pengelolaan permohonan layanan TI di Diskominfo Provinsi Sumatera "
        "Utara masih dilakukan secara manual menggunakan dokumen kertas dan pencatatan konvensional. "
        "Hal ini menimbulkan beberapa permasalahan, antara lain: keterlambatan penanganan permohonan, "
        "kesulitan dalam pelacakan status permohonan, kurangnya transparansi proses pelayanan, "
        "dan sulitnya pembuatan laporan rekap operasional.")
    
    add_paragraph(doc,
        "Berdasarkan permasalahan tersebut, diperlukan sebuah sistem informasi yang dapat "
        "mengotomatisasi alur permohonan layanan TI, mempermudah monitoring status permohonan, "
        "dan menyediakan laporan operasional yang akurat. Oleh karena itu, penulis mengusulkan "
        "pembangunan Sistem Informasi Layanan dan Arsip (SILARAS) sebagai solusi digital "
        "untuk mengatasi permasalahan yang ada.")
    
    add_paragraph(doc,
        "SILARAS merupakan aplikasi web full-stack yang dirancang sebagai portal internal "
        "dengan akses role-based, di mana pengguna biasa (staf OPD) dapat mengajukan permohonan "
        "layanan TI dan memantau statusnya, sedangkan admin (petugas Diskominfo) dapat mengelola "
        "dan memproses permohonan tersebut secara efisien.")
    
    add_empty_line(doc)
    
    # 1.2 Rumusan Masalah
    add_sub_heading(doc, "1.2 Rumusan Masalah")
    
    add_paragraph(doc,
        "Berdasarkan latar belakang yang telah diuraikan di atas, maka rumusan masalah "
        "dalam kerja praktek ini adalah sebagai berikut:")
    
    rumusan = [
        "Bagaimana menganalisis sistem pengelolaan permohonan layanan TI yang sedang berjalan di Diskominfo Provinsi Sumatera Utara?",
        "Bagaimana merancang sistem informasi yang dapat mengotomatisasi proses permohonan layanan TI dan pengelolaan arsip digital?",
        "Bagaimana mengimplementasikan sistem informasi berbasis web yang dapat mempermudah monitoring status permohonan secara real-time?",
        "Bagaimana menghasilkan laporan rekap operasional yang akurat dan dapat diekspor?"
    ]
    for i, item in enumerate(rumusan, 1):
        add_numbered_item(doc, i, item)
    
    add_empty_line(doc)
    
    # 1.3 Tujuan KP
    add_sub_heading(doc, "1.3 Tujuan Kerja Praktek")
    
    add_paragraph(doc,
        "Adapun tujuan dari pelaksanaan Kerja Praktek ini adalah sebagai berikut:")
    
    tujuan = [
        "Menganalisis sistem pengelolaan permohonan layanan TI yang sedang berjalan di Diskominfo Provinsi Sumatera Utara.",
        "Merancang dan membangun Sistem Informasi Layanan dan Arsip (SILARAS) berbasis web.",
        "Mengimplementasikan fitur manajemen permohonan layanan TI dengan akses role-based (admin dan user).",
        "Menyediakan modul dashboard, laporan rekap, dan export data dalam format PDF.",
        "Menghasilkan dokumentasi Kerja Praktek yang sesuai dengan pedoman Universitas Medan Area."
    ]
    for i, item in enumerate(tujuan, 1):
        add_numbered_item(doc, i, item)
    
    add_empty_line(doc)
    
    # 1.4 Manfaat KP
    add_sub_heading(doc, "1.4 Manfaat Kerja Praktek")
    
    add_paragraph(doc,
        "Manfaat yang diharapkan dari pelaksanaan Kerja Praktek ini adalah:")
    
    add_sub_heading(doc, "a. Bagi Mahasiswa")
    manfaat_mhs = [
        "Menerapkan ilmu yang diperoleh selama perkuliahan dalam lingkungan kerja nyata.",
        "Mendapatkan pengalaman dalam menganalisis dan membangun sistem informasi.",
        "Meningkatkan kemampuan problem solving dan pemrograman web.",
    ]
    for i, item in enumerate(manfaat_mhs, 1):
        add_numbered_item(doc, i, item)
    
    add_sub_heading(doc, "b. Bagi Instansi")
    manfaat_instansi = [
        "Percepatan proses permohonan layanan TI.",
        "Pelacakan status permohonan secara real-time.",
        "Pengurangan penggunaan dokumen kertas.",
        "Kemudahan monitoring dan pembuatan laporan bagi admin.",
    ]
    for i, item in enumerate(manfaat_instansi, 1):
        add_numbered_item(doc, i, item)
    
    add_sub_heading(doc, "c. Bagi Universitas")
    manfaat_univ = [
        "Menjalin hubungan kerjasama yang baik antara universitas dan instansi pemerintah.",
        "Menjadi referensi bagi mahasiswa lain dalam pelaksanaan Kerja Praktek.",
    ]
    for i, item in enumerate(manfaat_univ, 1):
        add_numbered_item(doc, i, item)
    
    add_empty_line(doc)
    
    # 1.5 Waktu dan Tempat
    add_sub_heading(doc, "1.5 Waktu dan Tempat Pelaksanaan")
    
    add_paragraph(doc,
        "Kerja Praktek ini dilaksanakan dengan rincian sebagai berikut:")
    
    add_paragraph(doc, "Tempat\t: Dinas Komunikasi dan Informatika Provinsi Sumatera Utara", indent_first_line=False)
    add_paragraph(doc, "Alamat\t: Jl. Diponegoro No. 30, Medan, Sumatera Utara", indent_first_line=False)
    add_paragraph(doc, "Waktu\t: [Tanggal Mulai] s/d [Tanggal Selesai]", indent_first_line=False)
    add_paragraph(doc, "Durasi\t: [Jumlah] Bulan", indent_first_line=False)
    
    add_empty_line(doc)
    
    # 1.6 Sistematika Penulisan
    add_sub_heading(doc, "1.6 Sistematika Penulisan")
    
    add_paragraph(doc,
        "Sistematika penulisan laporan Kerja Praktek ini terdiri dari beberapa bab, yaitu:")
    
    add_paragraph(doc, "BAB I PENDAHULUAN", bold=True, indent_first_line=False)
    add_paragraph(doc,
        "Bab ini berisi latar belakang, rumusan masalah, tujuan, manfaat, waktu dan tempat pelaksanaan, serta sistematika penulisan.")
    
    add_paragraph(doc, "BAB II TINJAUAN TEORITIS", bold=True, indent_first_line=False)
    add_paragraph(doc,
        "Bab ini berisi teori-teori yang mendukung penelitian, meliputi teori sistem informasi, "
        "basis data, ERD, DFD, use case diagram, flowchart, dan teknologi yang digunakan.")
    
    add_paragraph(doc, "BAB III ANALISIS DAN PERANCANGAN SISTEM", bold=True, indent_first_line=False)
    add_paragraph(doc,
        "Bab ini berisi analisis sistem berjalan, analisis kebutuhan, analisis sistem usulan, "
        "perancangan diagram, perancangan basis data, perancangan antarmuka, dan implementasi sistem.")
    
    add_paragraph(doc, "BAB IV PENUTUP", bold=True, indent_first_line=False)
    add_paragraph(doc,
        "Bab ini berisi kesimpulan dan saran dari hasil pelaksanaan Kerja Praktek.")


# ============================================================
# BAB II - TINJAUAN TEORITIS
# ============================================================
def add_bab_2(doc):
    add_page_break(doc)
    
    add_heading_bab(doc, "BAB II", level=0)
    add_heading_bab(doc, "TINJAUAN TEORITIS", level=0)
    add_empty_line(doc)
    
    # 2.1 Sistem Informasi
    add_sub_heading(doc, "2.1 Sistem Informasi")
    
    add_paragraph(doc,
        "Menurut Laudon dan Laudon (2018), sistem informasi adalah sekumpulan komponen yang "
        "saling terkait yang mengumpulkan, memproses, menyimpan, dan mendistribusikan informasi "
        "untuk mendukung pengambilan keputusan dan pengendalian dalam suatu organisasi. Sistem "
        "informasi menerima input berupa data atau instruksi, dan menghasilkan output berupa "
        "laporan, kalkulasi, atau informasi lainnya.")
    
    add_paragraph(doc,
        "Sistem informasi berbasis web merupakan pengembangan dari sistem informasi konvensional "
        "yang memanfaatkan teknologi internet dan web browser sebagai antarmuka pengguna. Sistem "
        "ini memungkinkan pengguna mengakses informasi dari mana saja selama terhubung dengan "
        "jaringan, tanpa perlu menginstal perangkat lunak khusus di komputer klien.")
    
    add_empty_line(doc)
    
    # 2.2 Helpdesk
    add_sub_heading(doc, "2.2 Helpdesk dan IT Service Management")
    
    add_paragraph(doc,
        "Helpdesk adalah sistem yang menyediakan informasi dan dukungan teknis terkait "
        "permasalahan yang berkaitan dengan teknologi informasi. Menurut Beisse (2013), "
        "helpdesk berfungsi sebagai titik kontak tunggal (single point of contact) antara "
        "pengguna dan penyedia layanan TI, yang bertujuan untuk menangani insiden dan "
        "permintaan layanan dengan cepat dan efisien.")
    
    add_paragraph(doc,
        "IT Service Management (ITSM) adalah pendekatan strategis untuk merancang, "
        "mendeliveri, mengelola, dan meningkatkan cara teknologi informasi digunakan dalam "
        "organisasi. ITIL (Information Technology Infrastructure Library) merupakan framework "
        "ITSM yang paling banyak digunakan, yang mendefinisikan proses-proses standar dalam "
        "pengelolaan layanan TI termasuk incident management, request fulfillment, dan "
        "service level management.")
    
    add_empty_line(doc)
    
    # 2.3 Arsitektur Client-Server
    add_sub_heading(doc, "2.3 Arsitektur Client-Server")
    
    add_paragraph(doc,
        "Arsitektur client-server adalah model komputasi terdistribusi di mana server "
        "menyediakan sumber daya atau layanan, dan client mengakses sumber daya tersebut. "
        "Dalam konteks aplikasi web, browser bertindak sebagai client yang mengirimkan "
        "permintaan HTTP ke server, kemudian server memproses permintaan tersebut dan "
        "mengirimkan response kembali ke client.")
    
    add_paragraph(doc,
        "Sistem SILARAS menggunakan arsitektur client-server dengan pemisahan jelas antara "
        "frontend (React sebagai client) dan backend (PHP sebagai server). Frontend "
        "berkomunikasi dengan backend melalui REST API yang mengirimkan dan menerima data "
        "dalam format JSON.")
    
    add_empty_line(doc)
    
    # 2.4 Basis Data
    add_sub_heading(doc, "2.4 Basis Data (Database)")
    
    add_paragraph(doc,
        "Menurut Connolly dan Begg (2015), basis data adalah kumpulan data yang saling "
        "terkait secara logis, beserta deskripsinya, yang dirancang untuk memenuhi kebutuhan "
        "informasi suatu organisasi. Sistem Manajemen Basis Data (DBMS) adalah perangkat lunak "
        "yang memungkinkan pengguna mendefinisikan, membuat, memelihara, dan mengontrol akses "
        "ke basis data.")
    
    add_paragraph(doc,
        "MySQL adalah sistem manajemen basis data relasional (RDBMS) open-source yang paling "
        "populer. MySQL menggunakan Structured Query Language (SQL) untuk mengakses dan memanipulasi "
        "data. SILARAS menggunakan MySQL sebagai backend database untuk menyimpan data instansi, "
        "user, jenis layanan, permohonan, riwayat status, dan log aktivitas.")
    
    add_empty_line(doc)
    
    # 2.5 ERD
    add_sub_heading(doc, "2.5 Entity Relationship Diagram (ERD)")
    
    add_paragraph(doc,
        "Entity Relationship Diagram (ERD) adalah model konseptual yang menggambarkan "
        "hubungan antar entitas dalam basis data. ERD pertama kali diperkenalkan oleh "
        "Peter Chen pada tahun 1976. ERD terdiri dari tiga komponen utama yaitu entitas "
        "(entity), atribut (attribute), dan relasi (relationship).")
    
    add_paragraph(doc,
        "Entitas merepresentasikan objek atau konsep dalam dunia nyata yang datanya "
        "disimpan dalam basis data. Atribut merupakan properti atau karakteristik dari "
        "suatu entitas. Sedangkan relasi menggambarkan hubungan antar dua atau lebih "
        "entitas, yang dapat berupa one-to-one, one-to-many, atau many-to-many.")
    
    add_empty_line(doc)
    
    # 2.6 DFD
    add_sub_heading(doc, "2.6 Data Flow Diagram (DFD)")
    
    add_paragraph(doc,
        "Data Flow Diagram (DFD) adalah diagram yang menggambarkan aliran data dalam "
        "suatu sistem. DFD menunjukkan bagaimana data masuk ke sistem, di mana data "
        "diproses, data apa yang disimpan, dan bagaimana data keluar dari sistem. "
        "DFD terdiri dari beberapa level, mulai dari diagram konteks (level 0) "
        "yang menunjukkan gambaran umum sistem, hingga level detail yang menunjukkan "
        "proses-proses spesifik.")
    
    add_paragraph(doc,
        "Komponen utama DFD meliputi: proses (process) yang merepresentasikan transformasi "
        "data, aliran data (data flow) yang menunjukkan pergerakan data, penyimpanan data "
        "(data store) yang merepresentasikan tempat penyimpanan data, dan entitas eksternal "
        "(external entity) yang merupakan sumber atau tujuan data di luar sistem.")
    
    add_empty_line(doc)
    
    # 2.7 Use Case
    add_sub_heading(doc, "2.7 Use Case Diagram")
    
    add_paragraph(doc,
        "Use Case Diagram merupakan bagian dari Unified Modeling Language (UML) yang "
        "menggambarkan interaksi antara pengguna (actor) dengan sistem. Use Case Diagram "
        "menunjukkan fungsionalitas yang disediakan oleh sistem dari perspektif pengguna. "
        "Komponen utamanya terdiri dari actor (pengguna), use case (fungsionalitas), "
        "dan relationship (hubungan) antara actor dan use case.")
    
    add_empty_line(doc)
    
    # 2.8 Flowchart
    add_sub_heading(doc, "2.8 Flowchart")
    
    add_paragraph(doc,
        "Flowchart atau diagram alir adalah diagram yang merepresentasikan langkah-langkah "
        "dalam suatu proses secara visual menggunakan simbol-simbol standar. Simbol utama "
        "flowchart meliputi terminator (awal/akhir), proses, keputusan (decision), "
        "input/output, dan anak panah untuk menunjukkan arah aliran.")
    
    add_paragraph(doc,
        "Flowchart sangat berguna dalam menggambarkan alur logika program dan proses bisnis. "
        "Dalam konteks SILARAS, flowchart digunakan untuk menggambarkan alur proses login, "
        "pengajuan permohonan, pemrosesan permohonan oleh admin, dan alur akses berbasis role.")
    
    add_empty_line(doc)
    
    # 2.9 Teknologi yang Digunakan
    add_sub_heading(doc, "2.9 Teknologi yang Digunakan")
    
    add_sub_heading(doc, "2.9.1 React.js")
    add_paragraph(doc,
        "React adalah library JavaScript yang dikembangkan oleh Facebook (Meta) untuk "
        "membangun antarmuka pengguna (user interface). React menggunakan pendekatan "
        "component-based, di mana UI dibangun dari komponen-komponen kecil yang dapat "
        "digunakan kembali (reusable). React juga menggunakan Virtual DOM untuk mengoptimalkan "
        "performa rendering. SILARAS menggunakan React 18 dengan Vite sebagai build tool "
        "untuk frontend.")
    
    add_sub_heading(doc, "2.9.2 Vite")
    add_paragraph(doc,
        "Vite adalah build tool modern untuk pengembangan web yang dikembangkan oleh Evan You "
        "(pencipta Vue.js). Vite menyediakan Hot Module Replacement (HMR) yang sangat cepat "
        "dan proses build yang efisien menggunakan Rollup. Vite digunakan sebagai development "
        "server dan bundler untuk frontend SILARAS.")
    
    add_sub_heading(doc, "2.9.3 PHP")
    add_paragraph(doc,
        "PHP (Hypertext Preprocessor) adalah bahasa pemrograman server-side yang banyak "
        "digunakan untuk pengembangan web. PHP dapat disisipkan ke dalam HTML dan dijalankan "
        "di server. SILARAS menggunakan PHP native (tanpa framework) versi 8.1 untuk "
        "membangun REST API backend, termasuk penanganan autentikasi, CRUD data, "
        "dan upload file.")
    
    add_sub_heading(doc, "2.9.4 MySQL")
    add_paragraph(doc,
        "MySQL adalah sistem manajemen basis data relasional (RDBMS) open-source yang "
        "dikembangkan oleh Oracle. MySQL menggunakan SQL untuk mengelola data dan mendukung "
        "fitur-fitur seperti transaksi, foreign key, stored procedure, dan trigger. "
        "SILARAS menggunakan MySQL 8.0 dengan engine InnoDB dan charset utf8mb4.")
    
    add_sub_heading(doc, "2.9.5 XAMPP")
    add_paragraph(doc,
        "XAMPP adalah paket distribusi Apache yang berisi PHP, MySQL (MariaDB), dan Perl. "
        "XAMPP menyediakan lingkungan server lokal yang mudah diinstal dan dikonfigurasi "
        "untuk pengembangan web. SILARAS menggunakan XAMPP sebagai web server lokal "
        "untuk menjalankan backend PHP dan database MySQL.")


# ============================================================
# BAB III - ANALISIS DAN PERANCANGAN SISTEM
# ============================================================
def add_bab_3(doc):
    add_page_break(doc)
    
    add_heading_bab(doc, "BAB III", level=0)
    add_heading_bab(doc, "ANALISIS DAN PERANCANGAN SISTEM", level=0)
    add_empty_line(doc)
    
    # 3.1 Analisis Sistem Berjalan
    add_sub_heading(doc, "3.1 Analisis Sistem Berjalan")
    
    add_paragraph(doc,
        "Analisis sistem berjalan dilakukan untuk memahami proses pengelolaan permohonan "
        "layanan TI yang sedang diterapkan saat ini di Diskominfo Provinsi Sumatera Utara. "
        "Berdasarkan pengamatan selama pelaksanaan Kerja Praktek, ditemukan bahwa proses "
        "yang berjalan saat ini masih bersifat manual dan konvensional.")
    
    add_paragraph(doc,
        "Berikut adalah alur sistem berjalan dalam pengelolaan permohonan layanan TI:")
    
    alur_berjalan = [
        "Staf OPD mengajukan permohonan layanan TI melalui surat resmi atau datang langsung ke kantor Diskominfo.",
        "Petugas Diskominfo menerima berkas permohonan dan mencatatnya secara manual di buku register.",
        "Berkas permohonan didistribusikan ke petugas teknis yang relevan.",
        "Petugas teknis menangani permohonan sesuai jenis layanan yang diminta.",
        "Setelah selesai, petugas melaporkan hasil penanganan kepada koordinator.",
        "Koordinator mengupdate status di buku register dan menginformasikan hasilnya kepada pemohon."
    ]
    for i, item in enumerate(alur_berjalan, 1):
        add_numbered_item(doc, i, item)
    
    add_empty_line(doc)
    
    add_paragraph(doc,
        "Kelemahan sistem berjalan yang ditemukan antara lain:")
    
    kelemahan = [
        "Proses pencatatan manual rentan terhadap kesalahan dan kehilangan data.",
        "Tidak ada mekanisme pelacakan status permohonan yang real-time.",
        "Pembuatan laporan rekap membutuhkan waktu yang lama karena harus dikompilasi secara manual.",
        "Kurangnya transparansi proses pelayanan bagi pemohon.",
        "Tidak ada sistem notifikasi untuk menginformasikan perubahan status.",
        "Arsip dokumen fisik membutuhkan ruang penyimpanan yang besar dan sulit dicari."
    ]
    for i, item in enumerate(kelemahan, 1):
        add_numbered_item(doc, i, item)
    
    add_empty_line(doc)
    
    add_paragraph(doc, "[Sisipkan Gambar 3.1 Flowchart Sistem Berjalan di sini]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    add_figure_caption(doc, "Gambar 3.1 Flowchart Sistem Berjalan")
    
    add_empty_line(doc)
    
    # 3.2 Analisis Kebutuhan
    add_sub_heading(doc, "3.2 Analisis Kebutuhan Sistem")
    
    add_paragraph(doc,
        "Berdasarkan analisis sistem berjalan, maka dapat diidentifikasi kebutuhan-kebutuhan "
        "sistem yang akan dibangun. Kebutuhan sistem dibagi menjadi dua kategori, yaitu "
        "kebutuhan fungsional dan kebutuhan non-fungsional.")
    
    add_sub_heading(doc, "3.2.1 Kebutuhan Fungsional")
    
    add_paragraph(doc,
        "Kebutuhan fungsional adalah fitur atau fungsi yang harus dimiliki oleh sistem "
        "untuk memenuhi tujuan utamanya. Berikut adalah daftar kebutuhan fungsional "
        "sistem SILARAS:")
    
    add_table_caption(doc, "Tabel 3.1 Kebutuhan Fungsional Sistem")
    
    # Tabel Kebutuhan Fungsional
    table = doc.add_table(rows=13, cols=3)
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    headers = ["No", "Kebutuhan Fungsional", "Deskripsi"]
    for i, header in enumerate(headers):
        format_cell(table.cell(0, i), header, bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        set_cell_shading(table.cell(0, i), "003366")
        table.cell(0, i).paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    
    fungsional_data = [
        ("1", "Login dan Logout", "Sistem harus menyediakan autentikasi pengguna dengan email dan password."),
        ("2", "Registrasi User", "Sistem harus menyediakan fitur pendaftaran akun baru untuk staf OPD."),
        ("3", "Manajemen Profil", "Pengguna dapat mengubah data profil, foto, dan password."),
        ("4", "Pengajuan Permohonan", "User dapat mengajukan permohonan layanan TI baru dengan upload lampiran."),
        ("5", "Pelacakan Status", "User dapat melihat status permohonan secara real-time."),
        ("6", "Edit/Hapus Permohonan", "User dapat mengedit atau menghapus permohonan yang masih berstatus Pending."),
        ("7", "Pemrosesan Permohonan", "Admin dapat mengubah status permohonan dan menambahkan catatan."),
        ("8", "Upload Dokumen Hasil", "Admin dapat mengupload dokumen hasil penanganan layanan."),
        ("9", "CRUD Jenis Layanan", "Admin dapat mengelola data jenis layanan TI."),
        ("10", "CRUD Instansi/OPD", "Admin dapat mengelola data instansi/OPD."),
        ("11", "CRUD Users", "Admin dapat mengelola data pengguna sistem."),
        ("12", "Laporan dan Export", "Sistem menyediakan laporan rekap yang dapat diekspor ke PDF."),
    ]
    
    for idx, (no, kebutuhan, deskripsi) in enumerate(fungsional_data, 1):
        format_cell(table.cell(idx, 0), no, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        format_cell(table.cell(idx, 1), kebutuhan)
        format_cell(table.cell(idx, 2), deskripsi)
    
    # Set column widths
    for row in table.rows:
        row.cells[0].width = Cm(1.5)
        row.cells[1].width = Cm(4.5)
        row.cells[2].width = Cm(8)
    
    add_empty_line(doc)
    
    add_sub_heading(doc, "3.2.2 Kebutuhan Non-Fungsional")
    
    add_paragraph(doc,
        "Kebutuhan non-fungsional adalah aspek-aspek kualitas sistem yang harus dipenuhi. "
        "Berikut adalah daftar kebutuhan non-fungsional sistem SILARAS:")
    
    add_table_caption(doc, "Tabel 3.2 Kebutuhan Non-Fungsional Sistem")
    
    table = doc.add_table(rows=7, cols=3)
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    for i, header in enumerate(["No", "Kebutuhan", "Deskripsi"]):
        format_cell(table.cell(0, i), header, bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        set_cell_shading(table.cell(0, i), "003366")
        table.cell(0, i).paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    
    nonfungsional_data = [
        ("1", "Keamanan", "Sistem menggunakan session-based authentication dan role-based access control."),
        ("2", "Responsif", "Antarmuka harus responsif dan dapat diakses dari berbagai perangkat."),
        ("3", "Performa", "Sistem harus mampu memuat halaman dalam waktu kurang dari 3 detik."),
        ("4", "Usability", "Antarmuka yang user-friendly dan mudah dipelajari."),
        ("5", "Reliabilitas", "Sistem harus mampu menangani error dengan graceful dan memberikan pesan yang informatif."),
        ("6", "Kompatibilitas", "Sistem harus kompatibel dengan browser Chrome, Firefox, dan Edge."),
    ]
    
    for idx, (no, kebutuhan, deskripsi) in enumerate(nonfungsional_data, 1):
        format_cell(table.cell(idx, 0), no, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        format_cell(table.cell(idx, 1), kebutuhan)
        format_cell(table.cell(idx, 2), deskripsi)
    
    for row in table.rows:
        row.cells[0].width = Cm(1.5)
        row.cells[1].width = Cm(3.5)
        row.cells[2].width = Cm(9)
    
    add_empty_line(doc)
    
    # 3.3 Analisis Sistem Usulan
    add_sub_heading(doc, "3.3 Analisis Sistem Usulan")
    
    add_paragraph(doc,
        "Berdasarkan analisis kebutuhan yang telah dilakukan, maka diusulkan pembangunan "
        "Sistem Informasi Layanan dan Arsip (SILARAS) dengan fitur-fitur yang menjawab "
        "seluruh kebutuhan yang telah diidentifikasi. Berikut adalah perbandingan antara "
        "sistem berjalan dan sistem usulan:")
    
    add_table_caption(doc, "Tabel 3.3 Perbandingan Sistem Berjalan dan Sistem Usulan")
    
    table = doc.add_table(rows=6, cols=3)
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    for i, header in enumerate(["No", "Sistem Berjalan", "Sistem Usulan"]):
        format_cell(table.cell(0, i), header, bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        set_cell_shading(table.cell(0, i), "003366")
        table.cell(0, i).paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    
    perbandingan = [
        ("1", "Permohonan diajukan melalui surat/datang langsung", "Permohonan diajukan melalui aplikasi web SILARAS"),
        ("2", "Pencatatan manual di buku register", "Data tersimpan di database MySQL secara otomatis"),
        ("3", "Tidak ada pelacakan status real-time", "Status permohonan dapat dilacak secara real-time melalui dashboard"),
        ("4", "Laporan dibuat secara manual", "Laporan dihasilkan otomatis dan dapat diekspor ke PDF"),
        ("5", "Arsip dokumen fisik", "Arsip dokumen digital dengan upload/download file"),
    ]
    
    for idx, (no, lama, baru) in enumerate(perbandingan, 1):
        format_cell(table.cell(idx, 0), no, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        format_cell(table.cell(idx, 1), lama)
        format_cell(table.cell(idx, 2), baru)
    
    for row in table.rows:
        row.cells[0].width = Cm(1.5)
        row.cells[1].width = Cm(6)
        row.cells[2].width = Cm(6.5)
    
    add_empty_line(doc)
    
    add_paragraph(doc,
        "Sistem SILARAS yang diusulkan memiliki dua role utama yaitu Admin (petugas Diskominfo) "
        "dan User (staf OPD). Admin memiliki akses penuh terhadap semua modul sistem, termasuk "
        "manajemen permohonan, CRUD data master, dan laporan. Sedangkan User hanya dapat mengajukan "
        "permohonan, melacak status, dan mengelola profilnya sendiri.")
    
    add_empty_line(doc)
    
    # 3.4 Use Case Diagram
    add_sub_heading(doc, "3.4 Perancangan Use Case Diagram")
    
    add_paragraph(doc,
        "Use Case Diagram digunakan untuk menggambarkan interaksi antara aktor dengan "
        "sistem SILARAS. Terdapat dua aktor utama dalam sistem ini, yaitu User (staf OPD) "
        "dan Admin (petugas Diskominfo). Berikut adalah Use Case Diagram sistem SILARAS:")
    
    add_empty_line(doc)
    add_paragraph(doc, "[Sisipkan Gambar 3.2 Use Case Diagram di sini]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    add_figure_caption(doc, "Gambar 3.2 Use Case Diagram Sistem SILARAS")
    add_empty_line(doc)
    
    add_paragraph(doc,
        "Berdasarkan Use Case Diagram di atas, berikut adalah penjelasan masing-masing use case:")
    
    add_sub_heading(doc, "A. Use Case untuk Aktor User")
    user_usecases = [
        "Login: User masuk ke sistem menggunakan email dan password.",
        "Register: User baru mendaftarkan akun melalui form registrasi.",
        "Melihat Dashboard: User melihat ringkasan statistik permohonan di dashboard.",
        "Mengajukan Permohonan: User membuat permohonan layanan TI baru dengan mengisi form dan upload lampiran.",
        "Melihat Daftar Permohonan: User melihat semua permohonan yang pernah diajukan dengan filter dan pencarian.",
        "Melihat Detail Permohonan: User melihat detail permohonan termasuk timeline riwayat status.",
        "Mengedit Permohonan: User mengedit permohonan yang masih berstatus Pending.",
        "Menghapus Permohonan: User menghapus permohonan yang masih berstatus Pending.",
        "Mengelola Profil: User mengubah data profil, foto, dan password.",
        "Logout: User keluar dari sistem."
    ]
    for i, item in enumerate(user_usecases, 1):
        add_numbered_item(doc, i, item)
    
    add_empty_line(doc)
    
    add_sub_heading(doc, "B. Use Case untuk Aktor Admin")
    admin_usecases = [
        "Login: Admin masuk ke sistem menggunakan email dan password.",
        "Melihat Dashboard: Admin melihat statistik keseluruhan permohonan dengan grafik.",
        "Mengelola Permohonan: Admin melihat, memproses, mengubah status, dan menambah catatan pada permohonan.",
        "Upload Dokumen Hasil: Admin mengupload dokumen hasil penanganan layanan.",
        "Mengelola Jenis Layanan: Admin menambah, mengedit, dan menghapus jenis layanan TI (CRUD).",
        "Mengelola Instansi/OPD: Admin menambah, mengedit, dan menghapus data instansi (CRUD).",
        "Mengelola Users: Admin menambah, mengedit, dan menonaktifkan akun pengguna (CRUD).",
        "Melihat Laporan: Admin melihat rekap laporan dan mengekspornya dalam format PDF.",
        "Mengelola Profil: Admin mengubah data profil, foto, dan password.",
        "Logout: Admin keluar dari sistem."
    ]
    for i, item in enumerate(admin_usecases, 1):
        add_numbered_item(doc, i, item)
    
    add_empty_line(doc)
    
    # 3.5 DFD
    add_sub_heading(doc, "3.5 Perancangan Data Flow Diagram (DFD)")
    
    add_sub_heading(doc, "3.5.1 DFD Level 0 (Diagram Konteks)")
    
    add_paragraph(doc,
        "Diagram konteks menggambarkan sistem SILARAS secara keseluruhan sebagai satu proses "
        "utama yang berinteraksi dengan dua entitas eksternal yaitu User dan Admin. User mengirimkan "
        "data permohonan, data registrasi, dan data profil ke sistem. Sistem mengirimkan kembali "
        "informasi status permohonan, notifikasi, dan data dashboard. Admin mengirimkan data "
        "pengelolaan (CRUD layanan, instansi, user, update status), dan sistem mengirimkan "
        "kembali laporan rekap dan data manajemen.")
    
    add_empty_line(doc)
    add_paragraph(doc, "[Sisipkan Gambar 3.3 DFD Level 0 di sini]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    add_figure_caption(doc, "Gambar 3.3 DFD Level 0 (Diagram Konteks)")
    add_empty_line(doc)
    
    add_sub_heading(doc, "3.5.2 DFD Level 1")
    
    add_paragraph(doc,
        "DFD Level 1 menjabarkan proses utama pada diagram konteks menjadi beberapa sub-proses, yaitu:")
    
    dfd_proses = [
        "Proses 1.0 - Autentikasi: Menangani login, logout, dan registrasi pengguna.",
        "Proses 2.0 - Manajemen Permohonan: Menangani pengajuan, edit, hapus, dan pemrosesan permohonan.",
        "Proses 3.0 - Manajemen Data Master: Menangani CRUD jenis layanan, instansi, dan users.",
        "Proses 4.0 - Laporan: Menghasilkan rekap laporan dan export PDF.",
        "Proses 5.0 - Manajemen Profil: Menangani perubahan profil dan password pengguna."
    ]
    for i, item in enumerate(dfd_proses, 1):
        add_numbered_item(doc, i, item)
    
    add_paragraph(doc,
        "Data store yang terlibat meliputi: D1 - Users, D2 - Permohonan, D3 - Jenis Layanan, "
        "D4 - Instansi, D5 - Riwayat Status, dan D6 - Log Aktivitas.")
    
    add_empty_line(doc)
    add_paragraph(doc, "[Sisipkan Gambar 3.4 DFD Level 1 di sini]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    add_figure_caption(doc, "Gambar 3.4 DFD Level 1")
    add_empty_line(doc)
    
    # 3.6 ERD
    add_sub_heading(doc, "3.6 Perancangan Entity Relationship Diagram (ERD)")
    
    add_paragraph(doc,
        "Entity Relationship Diagram (ERD) sistem SILARAS menggambarkan hubungan antar entitas "
        "dalam basis data. Sistem ini memiliki 7 entitas utama, yaitu:")
    
    entitas = [
        "Instansi: Menyimpan data instansi/OPD yang terdaftar dalam sistem.",
        "Users: Menyimpan data pengguna sistem, baik admin maupun user biasa.",
        "Jenis Layanan: Menyimpan data jenis layanan TI yang tersedia.",
        "Permohonan: Menyimpan data permohonan layanan TI yang diajukan oleh user.",
        "Riwayat Status: Menyimpan catatan perubahan status setiap permohonan.",
        "Log Aktivitas: Menyimpan log aktivitas pengguna dalam sistem.",
        "Sessions: Menyimpan data session login pengguna."
    ]
    for i, item in enumerate(entitas, 1):
        add_numbered_item(doc, i, item)
    
    add_paragraph(doc,
        "Hubungan antar entitas adalah sebagai berikut:")
    
    relasi = [
        "Instansi memiliki banyak Users (one-to-many).",
        "Users dapat mengajukan banyak Permohonan (one-to-many).",
        "Jenis Layanan memiliki banyak Permohonan (one-to-many).",
        "Permohonan memiliki banyak Riwayat Status (one-to-many).",
        "Users (admin) menangani banyak Permohonan (one-to-many).",
        "Users memiliki banyak Log Aktivitas (one-to-many).",
        "Users memiliki satu Session aktif (one-to-one)."
    ]
    for i, item in enumerate(relasi, 1):
        add_numbered_item(doc, i, item)
    
    add_empty_line(doc)
    add_paragraph(doc, "[Sisipkan Gambar 3.5 ERD di sini - gunakan file erd_silaras.drawio atau erd_chen_silaras.drawio]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    add_figure_caption(doc, "Gambar 3.5 Entity Relationship Diagram (ERD) Sistem SILARAS")
    add_empty_line(doc)
    
    # 3.7 Flowchart
    add_sub_heading(doc, "3.7 Perancangan Flowchart Sistem")
    
    add_sub_heading(doc, "3.7.1 Flowchart Proses Login")
    add_paragraph(doc,
        "Proses login dimulai ketika pengguna mengakses halaman login dan memasukkan email "
        "serta password. Sistem memverifikasi kredensial terhadap database. Jika valid, sistem "
        "membuat session dan mengarahkan pengguna ke dashboard sesuai role (admin atau user). "
        "Jika tidak valid, sistem menampilkan pesan error dan meminta pengguna mencoba kembali.")
    
    add_empty_line(doc)
    add_paragraph(doc, "[Sisipkan Gambar 3.6 Flowchart Proses Login di sini]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    add_figure_caption(doc, "Gambar 3.6 Flowchart Proses Login")
    add_empty_line(doc)
    
    add_sub_heading(doc, "3.7.2 Flowchart Proses Permohonan")
    add_paragraph(doc,
        "Proses pengajuan permohonan dimulai ketika user mengakses form permohonan baru. User "
        "memilih jenis layanan, mengisi deskripsi masalah, memilih prioritas, dan mengupload "
        "lampiran (opsional). Sistem memvalidasi input, membuat kode tiket otomatis (format: "
        "TKT-YYYYMMDD-XXXX), menyimpan data ke database, dan menampilkan konfirmasi berhasil.")
    
    add_empty_line(doc)
    add_paragraph(doc, "[Sisipkan Gambar 3.7 Flowchart Proses Permohonan di sini]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    add_figure_caption(doc, "Gambar 3.7 Flowchart Proses Permohonan Layanan TI")
    add_empty_line(doc)
    
    add_sub_heading(doc, "3.7.3 Flowchart Proses Admin")
    add_paragraph(doc,
        "Proses admin dimulai ketika admin login dan memilih menu yang diinginkan. Admin "
        "dapat memproses permohonan (mengubah status, menambah catatan, upload dokumen hasil), "
        "mengelola data master (jenis layanan, instansi, users), atau melihat laporan. "
        "Setiap perubahan status permohonan dicatat dalam riwayat status secara otomatis.")
    
    add_empty_line(doc)
    add_paragraph(doc, "[Sisipkan Gambar 3.8 Flowchart Proses Admin di sini - gunakan file flowchart_silaras.drawio]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    add_figure_caption(doc, "Gambar 3.8 Flowchart Proses Admin")
    add_empty_line(doc)
    
    # 3.8 Perancangan Basis Data
    add_sub_heading(doc, "3.8 Perancangan Basis Data")
    
    add_paragraph(doc,
        "Basis data sistem SILARAS menggunakan MySQL dengan nama database silaras_db. "
        "Berikut adalah struktur tabel yang dirancang untuk sistem SILARAS:")
    
    # Tabel Instansi
    add_table_caption(doc, "Tabel 3.4 Struktur Tabel instansi")
    
    table = doc.add_table(rows=9, cols=4)
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    for i, header in enumerate(["No", "Nama Kolom", "Tipe Data", "Keterangan"]):
        format_cell(table.cell(0, i), header, bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        set_cell_shading(table.cell(0, i), "003366")
        table.cell(0, i).paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    
    instansi_cols = [
        ("1", "id", "INT AUTO_INCREMENT", "Primary Key"),
        ("2", "nama_instansi", "VARCHAR(150)", "Nama instansi/OPD"),
        ("3", "singkatan", "VARCHAR(50)", "Singkatan nama instansi"),
        ("4", "alamat", "TEXT", "Alamat instansi"),
        ("5", "no_telp", "VARCHAR(20)", "Nomor telepon"),
        ("6", "status", "ENUM('aktif','nonaktif')", "Status instansi"),
        ("7", "created_at", "TIMESTAMP", "Waktu pembuatan"),
        ("8", "updated_at", "DATETIME", "Waktu perubahan terakhir"),
    ]
    
    for idx, (no, nama, tipe, ket) in enumerate(instansi_cols, 1):
        format_cell(table.cell(idx, 0), no, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        format_cell(table.cell(idx, 1), nama)
        format_cell(table.cell(idx, 2), tipe)
        format_cell(table.cell(idx, 3), ket)
    
    add_empty_line(doc)
    
    # Tabel Users
    add_table_caption(doc, "Tabel 3.5 Struktur Tabel users")
    
    table = doc.add_table(rows=13, cols=4)
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    for i, header in enumerate(["No", "Nama Kolom", "Tipe Data", "Keterangan"]):
        format_cell(table.cell(0, i), header, bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        set_cell_shading(table.cell(0, i), "003366")
        table.cell(0, i).paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    
    users_cols = [
        ("1", "id", "INT AUTO_INCREMENT", "Primary Key"),
        ("2", "nama", "VARCHAR(100)", "Nama lengkap user"),
        ("3", "nip", "VARCHAR(30)", "NIP pegawai"),
        ("4", "email", "VARCHAR(100) UNIQUE", "Email login"),
        ("5", "password", "VARCHAR(255)", "Password (bcrypt hash)"),
        ("6", "no_hp", "VARCHAR(20)", "Nomor handphone"),
        ("7", "instansi_id", "INT", "Foreign Key ke tabel instansi"),
        ("8", "role", "ENUM('user','admin')", "Hak akses pengguna"),
        ("9", "foto", "VARCHAR(255)", "Path file foto profil"),
        ("10", "status", "ENUM('aktif','nonaktif')", "Status akun"),
        ("11", "created_at", "TIMESTAMP", "Waktu pembuatan"),
        ("12", "updated_at", "DATETIME", "Waktu perubahan terakhir"),
    ]
    
    for idx, (no, nama, tipe, ket) in enumerate(users_cols, 1):
        format_cell(table.cell(idx, 0), no, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        format_cell(table.cell(idx, 1), nama)
        format_cell(table.cell(idx, 2), tipe)
        format_cell(table.cell(idx, 3), ket)
    
    add_empty_line(doc)
    
    # Tabel Jenis Layanan
    add_table_caption(doc, "Tabel 3.6 Struktur Tabel jenis_layanan")
    
    table = doc.add_table(rows=7, cols=4)
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    for i, header in enumerate(["No", "Nama Kolom", "Tipe Data", "Keterangan"]):
        format_cell(table.cell(0, i), header, bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        set_cell_shading(table.cell(0, i), "003366")
        table.cell(0, i).paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    
    layanan_cols = [
        ("1", "id", "INT AUTO_INCREMENT", "Primary Key"),
        ("2", "nama_layanan", "VARCHAR(100)", "Nama jenis layanan"),
        ("3", "deskripsi", "TEXT", "Deskripsi layanan"),
        ("4", "estimasi_waktu", "VARCHAR(50)", "Estimasi waktu pengerjaan"),
        ("5", "status", "ENUM('aktif','nonaktif')", "Status layanan"),
        ("6", "created_at", "TIMESTAMP", "Waktu pembuatan"),
    ]
    
    for idx, (no, nama, tipe, ket) in enumerate(layanan_cols, 1):
        format_cell(table.cell(idx, 0), no, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        format_cell(table.cell(idx, 1), nama)
        format_cell(table.cell(idx, 2), tipe)
        format_cell(table.cell(idx, 3), ket)
    
    add_empty_line(doc)
    
    # Tabel Permohonan
    add_table_caption(doc, "Tabel 3.7 Struktur Tabel permohonan")
    
    table = doc.add_table(rows=15, cols=4)
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    for i, header in enumerate(["No", "Nama Kolom", "Tipe Data", "Keterangan"]):
        format_cell(table.cell(0, i), header, bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        set_cell_shading(table.cell(0, i), "003366")
        table.cell(0, i).paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    
    permohonan_cols = [
        ("1", "id", "INT AUTO_INCREMENT", "Primary Key"),
        ("2", "kode_tiket", "VARCHAR(20) UNIQUE", "Kode tiket otomatis (TKT-YYYYMMDD-XXXX)"),
        ("3", "user_id", "INT NOT NULL", "Foreign Key ke tabel users"),
        ("4", "jenis_layanan_id", "INT NOT NULL", "Foreign Key ke tabel jenis_layanan"),
        ("5", "deskripsi_masalah", "TEXT NOT NULL", "Deskripsi masalah yang diajukan"),
        ("6", "prioritas", "ENUM('Rendah','Sedang','Tinggi')", "Tingkat prioritas permohonan"),
        ("7", "lampiran", "VARCHAR(255)", "Path file lampiran"),
        ("8", "status", "ENUM('Pending','Diproses','Selesai','Ditolak')", "Status permohonan"),
        ("9", "catatan_admin", "TEXT", "Catatan dari admin"),
        ("10", "dokumen_hasil", "VARCHAR(255)", "Path dokumen hasil layanan"),
        ("11", "ditangani_oleh", "INT", "Foreign Key ke users (admin)"),
        ("12", "tanggal_selesai", "DATETIME", "Tanggal penyelesaian"),
        ("13", "created_at", "TIMESTAMP", "Waktu pembuatan"),
        ("14", "updated_at", "DATETIME", "Waktu perubahan terakhir"),
    ]
    
    for idx, (no, nama, tipe, ket) in enumerate(permohonan_cols, 1):
        format_cell(table.cell(idx, 0), no, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        format_cell(table.cell(idx, 1), nama)
        format_cell(table.cell(idx, 2), tipe)
        format_cell(table.cell(idx, 3), ket)
    
    add_empty_line(doc)
    
    # Tabel Riwayat Status
    add_table_caption(doc, "Tabel 3.8 Struktur Tabel riwayat_status")
    
    table = doc.add_table(rows=8, cols=4)
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    for i, header in enumerate(["No", "Nama Kolom", "Tipe Data", "Keterangan"]):
        format_cell(table.cell(0, i), header, bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        set_cell_shading(table.cell(0, i), "003366")
        table.cell(0, i).paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    
    riwayat_cols = [
        ("1", "id", "INT AUTO_INCREMENT", "Primary Key"),
        ("2", "permohonan_id", "INT NOT NULL", "Foreign Key ke tabel permohonan"),
        ("3", "status_lama", "VARCHAR(50)", "Status sebelum perubahan"),
        ("4", "status_baru", "VARCHAR(50)", "Status setelah perubahan"),
        ("5", "catatan", "TEXT", "Catatan perubahan status"),
        ("6", "diubah_oleh", "INT", "Foreign Key ke users"),
        ("7", "waktu", "DATETIME", "Waktu perubahan status"),
    ]
    
    for idx, (no, nama, tipe, ket) in enumerate(riwayat_cols, 1):
        format_cell(table.cell(idx, 0), no, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        format_cell(table.cell(idx, 1), nama)
        format_cell(table.cell(idx, 2), tipe)
        format_cell(table.cell(idx, 3), ket)
    
    add_empty_line(doc)
    
    # Tabel Log Aktivitas
    add_table_caption(doc, "Tabel 3.9 Struktur Tabel log_aktivitas")
    
    table = doc.add_table(rows=7, cols=4)
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    for i, header in enumerate(["No", "Nama Kolom", "Tipe Data", "Keterangan"]):
        format_cell(table.cell(0, i), header, bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        set_cell_shading(table.cell(0, i), "003366")
        table.cell(0, i).paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    
    log_cols = [
        ("1", "id", "INT AUTO_INCREMENT", "Primary Key"),
        ("2", "user_id", "INT", "Foreign Key ke users"),
        ("3", "aksi", "VARCHAR(100)", "Jenis aksi yang dilakukan"),
        ("4", "detail", "TEXT", "Detail aksi"),
        ("5", "ip_address", "VARCHAR(50)", "Alamat IP pengguna"),
        ("6", "waktu", "DATETIME", "Waktu aksi dilakukan"),
    ]
    
    for idx, (no, nama, tipe, ket) in enumerate(log_cols, 1):
        format_cell(table.cell(idx, 0), no, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        format_cell(table.cell(idx, 1), nama)
        format_cell(table.cell(idx, 2), tipe)
        format_cell(table.cell(idx, 3), ket)
    
    add_empty_line(doc)
    
    # 3.9 Perancangan Antarmuka
    add_sub_heading(doc, "3.9 Perancangan Antarmuka (User Interface)")
    
    add_paragraph(doc,
        "Perancangan antarmuka (user interface) dilakukan untuk menggambarkan tampilan "
        "halaman-halaman utama sistem SILARAS. Desain antarmuka menggunakan design system "
        "custom dengan warna utama navy (biru tua) yang merepresentasikan identitas "
        "Pemerintah Provinsi Sumatera Utara, dengan font Poppins dan Inter untuk "
        "memberikan kesan modern dan profesional.")
    
    add_paragraph(doc,
        "Berikut adalah rancangan antarmuka beberapa halaman utama sistem SILARAS:")
    
    add_sub_heading(doc, "3.9.1 Rancangan Halaman Login")
    add_paragraph(doc,
        "Halaman login merupakan halaman pertama yang ditampilkan saat pengguna "
        "mengakses sistem SILARAS. Halaman ini berisi form login dengan input email dan "
        "password, serta tombol login dan link ke halaman registrasi.")
    
    add_empty_line(doc)
    add_paragraph(doc, "[Sisipkan Gambar 3.9 Rancangan Halaman Login]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    add_figure_caption(doc, "Gambar 3.9 Rancangan Halaman Login")
    
    add_sub_heading(doc, "3.9.2 Rancangan Dashboard User")
    add_paragraph(doc,
        "Dashboard user menampilkan ringkasan statistik permohonan pengguna berupa "
        "stat cards (total, pending, diproses, selesai) dan tabel permohonan terbaru. "
        "Layout menggunakan sidebar navigation di sebelah kiri dan konten utama di sebelah kanan.")
    
    add_empty_line(doc)
    add_paragraph(doc, "[Sisipkan Gambar 3.10 Rancangan Dashboard User]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    add_figure_caption(doc, "Gambar 3.10 Rancangan Dashboard User")
    
    add_sub_heading(doc, "3.9.3 Rancangan Dashboard Admin")
    add_paragraph(doc,
        "Dashboard admin menampilkan statistik keseluruhan permohonan dari semua user, "
        "dilengkapi dengan grafik Doughnut chart untuk distribusi status permohonan. "
        "Sidebar admin memiliki menu tambahan untuk mengelola data master (layanan, instansi, "
        "users) dan laporan.")
    
    add_empty_line(doc)
    add_paragraph(doc, "[Sisipkan Gambar 3.11 Rancangan Dashboard Admin]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    add_figure_caption(doc, "Gambar 3.11 Rancangan Dashboard Admin")
    
    add_sub_heading(doc, "3.9.4 Rancangan Form Permohonan Baru")
    add_paragraph(doc,
        "Form permohonan baru berisi input untuk memilih jenis layanan, mengisi deskripsi "
        "masalah, memilih tingkat prioritas (Rendah, Sedang, Tinggi), dan mengupload file "
        "lampiran. Sistem akan otomatis mengenerate kode tiket setelah permohonan berhasil disubmit.")
    
    add_empty_line(doc)
    add_paragraph(doc, "[Sisipkan Gambar 3.12 Rancangan Form Permohonan Baru]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    add_figure_caption(doc, "Gambar 3.12 Rancangan Form Permohonan Baru")
    
    add_empty_line(doc)
    
    # 3.10 Implementasi Sistem
    add_sub_heading(doc, "3.10 Implementasi Sistem")
    
    add_paragraph(doc,
        "Implementasi sistem SILARAS dilakukan menggunakan teknologi yang telah ditentukan "
        "pada tahap perancangan. Berikut adalah detail implementasi:")
    
    add_sub_heading(doc, "3.10.1 Implementasi Backend (API)")
    
    add_paragraph(doc,
        "Backend SILARAS dibangun menggunakan PHP native tanpa framework. API dibangun "
        "dengan arsitektur REST dan mengembalikan response dalam format JSON. Berikut "
        "adalah daftar endpoint API yang telah diimplementasikan:")
    
    add_table_caption(doc, "Tabel 3.10 Daftar API Endpoint")
    
    table = doc.add_table(rows=14, cols=4)
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    for i, header in enumerate(["No", "Method", "Endpoint", "Deskripsi"]):
        format_cell(table.cell(0, i), header, bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        set_cell_shading(table.cell(0, i), "003366")
        table.cell(0, i).paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    
    endpoints = [
        ("1", "POST", "/auth/login.php", "Login pengguna"),
        ("2", "POST", "/auth/register.php", "Registrasi user baru"),
        ("3", "POST", "/auth/logout.php", "Logout pengguna"),
        ("4", "GET/PUT", "/auth/profile.php", "Lihat/Update profil"),
        ("5", "GET", "/permohonan/index.php", "Daftar permohonan"),
        ("6", "GET", "/permohonan/show.php?id=X", "Detail permohonan"),
        ("7", "POST", "/permohonan/store.php", "Buat permohonan baru"),
        ("8", "PUT", "/permohonan/update.php?id=X", "Edit permohonan"),
        ("9", "DELETE", "/permohonan/destroy.php?id=X", "Hapus permohonan"),
        ("10", "POST", "/permohonan/status.php?id=X", "Update status (admin)"),
        ("11", "CRUD", "/layanan/index.php", "Kelola jenis layanan"),
        ("12", "CRUD", "/instansi/index.php", "Kelola instansi"),
        ("13", "GET", "/laporan/index.php?type=...", "Rekap laporan"),
    ]
    
    for idx, (no, method, endpoint, desc) in enumerate(endpoints, 1):
        format_cell(table.cell(idx, 0), no, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        format_cell(table.cell(idx, 1), method, alignment=WD_ALIGN_PARAGRAPH.CENTER)
        format_cell(table.cell(idx, 2), endpoint)
        format_cell(table.cell(idx, 3), desc)
    
    for row in table.rows:
        row.cells[0].width = Cm(1)
        row.cells[1].width = Cm(2)
        row.cells[2].width = Cm(5.5)
        row.cells[3].width = Cm(5.5)
    
    add_empty_line(doc)
    
    add_sub_heading(doc, "3.10.2 Implementasi Frontend")
    
    add_paragraph(doc,
        "Frontend SILARAS dibangun menggunakan React 18 dengan Vite. Berikut adalah "
        "struktur komponen frontend yang telah diimplementasikan:")
    
    komponen_frontend = [
        "App.jsx: Router utama aplikasi dengan role-based route guards.",
        "AuthContext.jsx: Global state management untuk autentikasi.",
        "Login.jsx / Register.jsx: Halaman autentikasi pengguna.",
        "UserLayout.jsx / AdminLayout.jsx: Layout template dengan sidebar navigation.",
        "Dashboard.jsx (User): Halaman dashboard user dengan stat cards.",
        "Dashboard.jsx (Admin): Halaman dashboard admin dengan Doughnut chart.",
        "PermohonanBaru.jsx: Form pengajuan permohonan baru.",
        "PermohonanList.jsx: Daftar permohonan dengan filter, search, dan pagination.",
        "PermohonanDetail.jsx: Detail permohonan dengan timeline riwayat status.",
        "PermohonanEdit.jsx: Form edit permohonan (hanya status Pending).",
        "JenisLayanan.jsx: CRUD jenis layanan TI.",
        "Instansi.jsx: CRUD data instansi/OPD.",
        "Users.jsx: CRUD data pengguna (soft delete).",
        "Laporan.jsx: Rekap laporan dengan export PDF (jsPDF).",
        "Profil.jsx: Manajemen profil dan ganti password."
    ]
    for i, item in enumerate(komponen_frontend, 1):
        add_numbered_item(doc, i, item)
    
    add_empty_line(doc)
    
    add_sub_heading(doc, "3.10.3 Tampilan Implementasi Sistem")
    
    add_paragraph(doc,
        "Berikut adalah screenshot tampilan sistem SILARAS yang telah diimplementasikan:")
    
    add_empty_line(doc)
    add_paragraph(doc, "[Sisipkan Gambar 3.13 Tampilan Halaman Login]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    add_figure_caption(doc, "Gambar 3.13 Tampilan Halaman Login")
    
    add_empty_line(doc)
    add_paragraph(doc, "[Sisipkan Gambar 3.14 Tampilan Dashboard User]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    add_figure_caption(doc, "Gambar 3.14 Tampilan Dashboard User")
    
    add_empty_line(doc)
    add_paragraph(doc, "[Sisipkan Gambar 3.15 Tampilan Dashboard Admin]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    add_figure_caption(doc, "Gambar 3.15 Tampilan Dashboard Admin")
    
    add_empty_line(doc)
    add_paragraph(doc, "[Sisipkan Gambar 3.16 Tampilan Daftar Permohonan]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    add_figure_caption(doc, "Gambar 3.16 Tampilan Daftar Permohonan")
    
    add_empty_line(doc)
    
    # 3.10.4 Pengujian Sistem
    add_sub_heading(doc, "3.10.4 Pengujian Sistem")
    
    add_paragraph(doc,
        "Pengujian sistem dilakukan menggunakan metode Black Box Testing, yaitu pengujian "
        "yang berfokus pada fungsionalitas sistem tanpa melihat kode program internal. "
        "Berikut adalah hasil pengujian sistem SILARAS:")
    
    add_table_caption(doc, "Tabel 3.11 Hasil Pengujian Sistem (Black Box Testing)")
    
    table = doc.add_table(rows=13, cols=5)
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    for i, header in enumerate(["No", "Skenario Pengujian", "Test Case", "Hasil yang Diharapkan", "Hasil"]):
        format_cell(table.cell(0, i), header, bold=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, font_size=9)
        set_cell_shading(table.cell(0, i), "003366")
        table.cell(0, i).paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    
    pengujian = [
        ("1", "Login dengan data valid", "Email dan password benar", "Masuk ke dashboard sesuai role", "✓ Berhasil"),
        ("2", "Login dengan data invalid", "Email/password salah", "Menampilkan pesan error", "✓ Berhasil"),
        ("3", "Registrasi user baru", "Mengisi form registrasi", "Akun baru terdaftar", "✓ Berhasil"),
        ("4", "Ajukan permohonan baru", "Mengisi form dan upload file", "Permohonan tersimpan dengan kode tiket", "✓ Berhasil"),
        ("5", "Filter permohonan", "Memilih filter status/prioritas", "Data terfilter sesuai pilihan", "✓ Berhasil"),
        ("6", "Edit permohonan Pending", "Mengubah data permohonan", "Data permohonan terupdate", "✓ Berhasil"),
        ("7", "Hapus permohonan Pending", "Klik tombol hapus", "Permohonan terhapus", "✓ Berhasil"),
        ("8", "Admin update status", "Mengubah status permohonan", "Status terupdate, riwayat tercatat", "✓ Berhasil"),
        ("9", "CRUD jenis layanan", "Tambah/edit/hapus layanan", "Data layanan terupdate", "✓ Berhasil"),
        ("10", "CRUD instansi", "Tambah/edit/hapus instansi", "Data instansi terupdate", "✓ Berhasil"),
        ("11", "Export laporan PDF", "Klik tombol export PDF", "File PDF terdownload", "✓ Berhasil"),
        ("12", "Akses tanpa login", "Akses URL tanpa session", "Redirect ke halaman login", "✓ Berhasil"),
    ]
    
    for idx, (no, skenario, testcase, expected, hasil) in enumerate(pengujian, 1):
        format_cell(table.cell(idx, 0), no, alignment=WD_ALIGN_PARAGRAPH.CENTER, font_size=9)
        format_cell(table.cell(idx, 1), skenario, font_size=9)
        format_cell(table.cell(idx, 2), testcase, font_size=9)
        format_cell(table.cell(idx, 3), expected, font_size=9)
        format_cell(table.cell(idx, 4), hasil, alignment=WD_ALIGN_PARAGRAPH.CENTER, font_size=9)
    
    for row in table.rows:
        row.cells[0].width = Cm(1)
        row.cells[1].width = Cm(3)
        row.cells[2].width = Cm(3)
        row.cells[3].width = Cm(4)
        row.cells[4].width = Cm(2)
    
    add_empty_line(doc)
    
    add_paragraph(doc,
        "Berdasarkan hasil pengujian di atas, seluruh fungsionalitas sistem SILARAS "
        "telah berjalan sesuai dengan yang diharapkan. Sistem dapat menangani proses "
        "autentikasi, manajemen permohonan, CRUD data master, dan export laporan "
        "dengan baik.")


# ============================================================
# BAB IV - PENUTUP
# ============================================================
def add_bab_4(doc):
    add_page_break(doc)
    
    add_heading_bab(doc, "BAB IV", level=0)
    add_heading_bab(doc, "PENUTUP", level=0)
    add_empty_line(doc)
    
    # 4.1 Kesimpulan
    add_sub_heading(doc, "4.1 Kesimpulan")
    
    add_paragraph(doc,
        "Berdasarkan hasil pelaksanaan Kerja Praktek di Dinas Komunikasi dan Informatika "
        "Provinsi Sumatera Utara, maka dapat ditarik kesimpulan sebagai berikut:")
    
    kesimpulan = [
        "Sistem pengelolaan permohonan layanan TI yang berjalan saat ini di Diskominfo Provinsi Sumatera Utara masih bersifat manual dan memiliki beberapa kelemahan seperti keterlambatan penanganan, kesulitan pelacakan status, dan kurangnya transparansi.",
        "Sistem Informasi Layanan dan Arsip (SILARAS) telah berhasil dirancang dan dibangun sebagai aplikasi web full-stack menggunakan React 18 + Vite (frontend), PHP native (backend), dan MySQL (database).",
        "SILARAS menyediakan fitur yang lengkap meliputi: autentikasi dan otorisasi role-based (admin dan user), pengajuan dan pengelolaan permohonan layanan TI, pelacakan status real-time, upload/download dokumen, CRUD data master (jenis layanan, instansi, users), dashboard dengan grafik, dan export laporan PDF.",
        "Berdasarkan pengujian Black Box Testing, seluruh fungsionalitas sistem SILARAS berjalan sesuai dengan kebutuhan yang telah diidentifikasi pada tahap analisis.",
        "Sistem SILARAS diharapkan dapat meningkatkan efisiensi, transparansi, dan akuntabilitas pelayanan TI di Diskominfo Provinsi Sumatera Utara."
    ]
    for i, item in enumerate(kesimpulan, 1):
        add_numbered_item(doc, i, item)
    
    add_empty_line(doc)
    
    # 4.2 Saran
    add_sub_heading(doc, "4.2 Saran")
    
    add_paragraph(doc,
        "Berdasarkan hasil Kerja Praktek dan implementasi sistem SILARAS, penulis "
        "memberikan beberapa saran untuk pengembangan sistem di masa mendatang:")
    
    saran = [
        "Menambahkan fitur notifikasi email atau SMS untuk menginformasikan perubahan status permohonan kepada pemohon secara otomatis.",
        "Menambahkan modul audit log yang lebih lengkap untuk mencatat seluruh aktivitas pengguna sebagai jejak audit.",
        "Mengembangkan fitur manajemen inventaris perangkat TI yang terintegrasi dengan sistem permohonan layanan.",
        "Melakukan migrasi backend dari PHP native ke framework PHP (seperti Laravel) atau Node.js untuk meningkatkan skalabilitas dan maintainability.",
        "Menambahkan unit testing dan end-to-end testing untuk memastikan kualitas kode dan mencegah regresi.",
        "Mengimplementasikan Progressive Web App (PWA) agar sistem dapat diakses secara offline dan memberikan pengalaman seperti aplikasi native.",
        "Menambahkan fitur SLA (Service Level Agreement) tracking untuk memantau waktu penanganan permohonan secara otomatis."
    ]
    for i, item in enumerate(saran, 1):
        add_numbered_item(doc, i, item)


# ============================================================
# DAFTAR PUSTAKA
# ============================================================
def add_daftar_pustaka(doc):
    add_page_break(doc)
    
    add_heading_bab(doc, "DAFTAR PUSTAKA", level=0)
    add_empty_line(doc)
    
    pustaka = [
        "Beisse, F. (2013). A Guide to Computer User Support for Help Desk and Support Specialists (5th ed.). Cengage Learning.",
        "Connolly, T., & Begg, C. (2015). Database Systems: A Practical Approach to Design, Implementation, and Management (6th ed.). Pearson.",
        "Laudon, K. C., & Laudon, J. P. (2018). Management Information Systems: Managing the Digital Firm (15th ed.). Pearson.",
        "Meta Platforms, Inc. (2024). React: A JavaScript library for building user interfaces. Diakses dari https://react.dev/",
        "Mozilla Developer Network. (2024). JavaScript Guide. Diakses dari https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
        "Oracle Corporation. (2024). MySQL 8.0 Reference Manual. Diakses dari https://dev.mysql.com/doc/refman/8.0/en/",
        "PHP Group. (2024). PHP Manual. Diakses dari https://www.php.net/manual/en/",
        "Pressman, R. S., & Maxim, B. R. (2020). Software Engineering: A Practitioner's Approach (9th ed.). McGraw-Hill Education.",
        "Vite. (2024). Vite: Next Generation Frontend Tooling. Diakses dari https://vitejs.dev/",
        "Whitten, J. L., & Bentley, L. D. (2007). Systems Analysis and Design Methods (7th ed.). McGraw-Hill/Irwin."
    ]
    
    for ref in pustaka:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = LINE_SPACING
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.left_indent = Cm(1.27)
        p.paragraph_format.first_line_indent = Cm(-1.27)
        run = p.add_run(ref)
        run.font.name = FONT_NAME
        run.font.size = Pt(12)


# ============================================================
# LAMPIRAN
# ============================================================
def add_lampiran(doc):
    add_page_break(doc)
    
    add_heading_bab(doc, "LAMPIRAN", level=0)
    add_empty_line(doc)
    
    add_sub_heading(doc, "Lampiran 1: Dokumentasi Kegiatan KP")
    add_paragraph(doc, "[Sisipkan foto-foto kegiatan selama KP di lokasi]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    
    add_empty_line(doc, 3)
    
    add_sub_heading(doc, "Lampiran 2: Hasil Turnitin")
    add_paragraph(doc, "[Sisipkan screenshot hasil cek plagiarisme Turnitin]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    
    add_empty_line(doc, 3)
    
    add_sub_heading(doc, "Lampiran 3: Form Berita Acara Bimbingan KP")
    add_paragraph(doc, "[Sisipkan scan form berita acara bimbingan KP]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    
    add_empty_line(doc, 3)
    
    add_sub_heading(doc, "Lampiran 4: Form Penilaian Pembimbing Lapangan")
    add_paragraph(doc, "[Sisipkan scan form penilaian dari pembimbing lapangan]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    
    add_empty_line(doc, 3)
    
    add_sub_heading(doc, "Lampiran 5: Form Penilaian Pembimbing Prodi")
    add_paragraph(doc, "[Sisipkan scan form penilaian dari dosen pembimbing prodi]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    
    add_empty_line(doc, 3)
    
    add_sub_heading(doc, "Lampiran 6: Surat Pembimbing Kerja Praktek")
    add_paragraph(doc, "[Sisipkan scan surat penunjukan pembimbing KP]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    
    add_empty_line(doc, 3)
    
    add_sub_heading(doc, "Lampiran 7: Surat Selesai Kerja Praktek")
    add_paragraph(doc, "[Sisipkan scan surat keterangan selesai KP]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)
    
    add_empty_line(doc, 3)
    
    add_sub_heading(doc, "Lampiran 8: Source Code Utama")
    add_paragraph(doc, "[Jika diperlukan, sisipkan potongan source code penting]", italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, indent_first_line=False)


# ============================================================
# MAIN
# ============================================================
def main():
    print("=" * 60)
    print("  GENERATOR LAPORAN ANALISIS SISTEM SILARAS")
    print("  Format: Microsoft Word (.docx)")
    print("=" * 60)
    print()
    
    doc = create_document()
    
    print("[1/12] Membuat halaman cover...")
    add_cover_page(doc)
    
    print("[2/12] Membuat halaman pengesahan...")
    add_halaman_pengesahan(doc)
    
    print("[3/12] Membuat abstrak...")
    add_abstrak(doc)
    
    print("[4/12] Membuat kata pengantar...")
    add_kata_pengantar(doc)
    
    print("[5/12] Membuat daftar isi...")
    add_daftar_isi(doc)
    
    print("[6/12] Membuat daftar tabel...")
    add_daftar_tabel(doc)
    
    print("[7/12] Membuat daftar gambar...")
    add_daftar_gambar(doc)
    
    print("[8/12] Membuat BAB I - Pendahuluan...")
    add_bab_1(doc)
    
    print("[9/12] Membuat BAB II - Tinjauan Teoritis...")
    add_bab_2(doc)
    
    print("[10/12] Membuat BAB III - Analisis dan Perancangan Sistem...")
    add_bab_3(doc)
    
    print("[11/12] Membuat BAB IV - Penutup...")
    add_bab_4(doc)
    
    print("[12/12] Membuat Daftar Pustaka dan Lampiran...")
    add_daftar_pustaka(doc)
    add_lampiran(doc)
    
    # Save
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), OUTPUT_FILE)
    doc.save(output_path)
    
    print()
    print("=" * 60)
    print(f"  [OK] BERHASIL! File tersimpan:")
    print(f"  File: {output_path}")
    print("=" * 60)
    print()
    print("  Isi Dokumen:")
    print("  - Cover")
    print("  - Halaman Pengesahan")
    print("  - Abstrak")
    print("  - Kata Pengantar")
    print("  - Daftar Isi")
    print("  - Daftar Tabel")
    print("  - Daftar Gambar")
    print("  - BAB I   - Pendahuluan")
    print("  - BAB II  - Tinjauan Teoritis")
    print("  - BAB III - Analisis dan Perancangan Sistem")
    print("  - BAB IV  - Penutup")
    print("  - Daftar Pustaka")
    print("  - Lampiran")
    print()
    print("  Catatan yang perlu disesuaikan:")
    print("  * Ganti [NAMA MAHASISWA], [NPM], dll di cover & kata pengantar")
    print("  * Sisipkan gambar diagram (ERD, DFD, Flowchart, Use Case)")
    print("  * Sisipkan screenshot tampilan sistem")
    print("  * Lengkapi lampiran (foto kegiatan, surat-surat, dll)")
    print()

if __name__ == "__main__":
    main()
