# PRD — Sistem Pendataan PMK dan Skripsi Fakultas Ekonomi

**Versi:** 0.1 (draft awal, berdasarkan catatan requirement dari client)
**Status:** Draft — perlu dikonfirmasi ulang ke client sebelum development

> **Catatan asumsi:** "PMK" belum dikonfirmasi kepanjangannya ke client (kemungkinan Penelitian Mahasiswa Kompetitif / Praktik Mata Kuliah / istilah internal fakultas lain). PRD ini mengasumsikan PMK adalah **jenis karya/tugas akademik lain selain skripsi** yang punya struktur data mirip. Konfirmasi ke client sebelum lanjut ke development.

---

## 1. Latar Belakang

Fakultas Ekonomi butuh sistem buat mendata dua jenis karya akademik mahasiswa:
1. **PMK**
2. **Skripsi**

Saat ini (asumsi) pendataan masih manual/tersebar, sehingga dibutuhkan 1 sistem terpusat yang bisa diakses fakultas untuk pencarian dan pengelolaan data.

---

## 2. Tujuan

- Menyediakan satu sistem terpusat untuk mendata PMK dan skripsi mahasiswa Fakultas Ekonomi
- Memungkinkan pencarian data berdasarkan nama, NIM, prodi, tahun, atau judul
- Menyimpan file dokumen (PDF) terkait tiap data secara aman dan tidak membebani server utama

---

## 3. Ruang Lingkup (Scope)

### Termasuk (In Scope)
- Input, edit, dan pencarian data PMK
- Input, edit, dan pencarian data Skripsi
- Upload file dokumen (PDF) untuk masing-masing data
- Autentikasi login (role mahasiswa & admin fakultas)

### Belum Termasuk (Out of Scope — perlu dikonfirmasi ke client)
- Approval/workflow bertingkat (misal: dosen pembimbing ikut approve)
- Notifikasi email/WhatsApp otomatis
- Statistik/dashboard analitik
- Export laporan ke Excel/PDF

---

## 4. Struktur Data (Data Model)

Berdasarkan catatan client, tiap data (baik PMK maupun Skripsi) punya field yang sama:

| Field | Tipe | Keterangan |
|---|---|---|
| Nama | Teks | Nama mahasiswa |
| NIM | Teks | Nomor Induk Mahasiswa |
| Prodi | Teks | Program studi |
| Tahun | Angka | Tahun pengerjaan/pengajuan |
| Judul | Teks | Judul PMK / judul skripsi |
| File | File (PDF) | Dokumen terkait, disimpan terpisah dari database (lihat Bagian 6) |

> **Perlu dikonfirmasi ke client:** apakah PMK dan Skripsi ini 2 tabel/kategori terpisah (mahasiswa bisa punya keduanya), atau 1 tabel dengan kolom "jenis" (PMK/Skripsi)? PRD ini mengasumsikan **2 kategori data yang terpisah** karena ditulis sebagai 2 hal berbeda di judul catatan ("PMK **dan** Skripsi").

---

## 5. Peran Pengguna (User Roles)

| Role | Akses |
|---|---|
| **Mahasiswa** | Login, input data miliknya sendiri (PMK/Skripsi + upload file), edit data sendiri, cari/lihat semua data (read-only untuk data orang lain) |
| **Admin (Fakultas)** | Semua akses mahasiswa + edit/hapus semua data + kelola akun |

> Sama seperti sistem skripsi UNISBA sebelumnya — mahasiswa tidak bisa hapus data, hanya admin.

---

## 6. Arsitektur & Penyimpanan File

- **Data teks** (nama, NIM, prodi, tahun, judul, referensi file) → disimpan di database (Postgres via Supabase/Neon)
- **File PDF** → disimpan di **Google Drive** milik fakultas, database hanya menyimpan **ID file Google Drive**-nya, bukan file-nya langsung
- Alasan: PDF berukuran besar dan bertambah terus tiap tahun, sementara kuota database gratis biasanya kecil. Memisahkan ini bikin database tidak akan penuh, sementara storage file (Google Drive) bisa dipantau/di-upgrade terpisah kalau makin banyak data.

---

## 7. Rekomendasi Tech Stack

| Bagian | Teknologi |
|---|---|
| Frontend + Backend | Next.js (deploy ke Vercel, gratis, auto-deploy dari Git) |
| Database | Supabase atau Neon (PostgreSQL, free tier) |
| Penyimpanan file | Google Drive API (OAuth, refresh token) |
| Autentikasi | Auth bawaan Supabase, atau NextAuth |

---

## 8. Kebutuhan Keamanan (Non-Functional)

Berdasarkan pengalaman audit keamanan project sebelumnya, hal-hal ini wajib ada sejak awal development:
- Validasi input di server (bukan cuma di form/frontend)
- Mahasiswa hanya bisa edit data miliknya sendiri (dicek dari sisi server, bukan cuma disembunyikan di UI)
- Field seperti status/kepemilikan data tidak boleh bisa diubah lewat manipulasi request (cegah mass assignment)
- Halaman pencarian data mensyaratkan login lebih dulu (karena berisi data pribadi seperti NIM)
- Environment/kredensial (API key Google Drive, koneksi database) tidak pernah ikut ter-commit ke repository publik

---

## 9. Pertanyaan Terbuka untuk Client (perlu dijawab sebelum development)

1. Apa kepanjangan/definisi **PMK**, dan apa bedanya secara konsep dengan Skripsi?
2. Apakah PMK dan Skripsi itu 2 data terpisah, atau 1 data dengan kategori/jenis?
3. Siapa yang akan menjadi "admin" — 1 orang staf fakultas, atau beberapa?
4. Field "File" itu satu file PDF per data, atau bisa lebih dari satu (misal PMK + lampiran)?
5. Apakah dibutuhkan approval dari dosen pembimbing sebelum data dianggap final?
