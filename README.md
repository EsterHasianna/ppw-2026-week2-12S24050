# Portofolio Ester Hasianna Nainggolan

Tugas mandiri mata kuliah Pemrograman & Pengujian Aplikasi Web (12S3101) — Minggu 2.

## Deskripsi
Halaman portofolio profil profesional yang menampilkan identitas akademik, 
riwayat matakuliah, portofolio karya, dan formulir layanan konsultasi. 
Dibangun menggunakan HTML5 semantik dan CSS3 modern (Flexbox, responsive design).

## Fitur
- Struktur semantik HTML5 (header, nav, main, section, aside, footer)
- Tabel data riwayat matakuliah
- Formulir kontak dengan validasi native HTML5
- Desain responsif (mobile-friendly)

## Pembaruan Minggu 3 — Refactoring ke Bootstrap 5

Proyek ini di-refactor dari HTML/CSS murni (Minggu 2) menjadi terintegrasi dengan
Bootstrap 5.3 dan teknik CSS lanjutan, tanpa mengubah struktur semantik HTML5 yang sudah ada.

| Bagian | Sebelum (Minggu 2) | Sesudah (Minggu 3) |
|---|---|---|
| Navbar | Flexbox statis, tanpa versi mobile | `navbar-expand-lg` sticky-top dengan hamburger toggle responsif |
| Hero Section | Belum ada | Ditambahkan hero section dengan CTA ke Portofolio & Formulir |
| Portofolio | 2 kartu statis, tanpa detail | 4 kartu dalam grid responsif (`row-cols-lg-3`), tiap kartu membuka Modal detail |
| Formulir | Label biasa, validasi native HTML5 | Floating labels, input group berikon, validasi visual Bootstrap (`was-validated`) |
| Styling | 1 file `style.css`, warna hardcoded | `custom-style.css` dengan 9 variabel CSS di `:root`, dimuat setelah Bootstrap |
| Framework | CSS murni | Bootstrap 5.3 + Bootstrap Icons via CDN |



## Live Demo
https://esterhasianna.github.io/ppw-2026-week2-12S24050/
## Dibuat oleh
Ester Hasianna Nainggolan — 12S24050