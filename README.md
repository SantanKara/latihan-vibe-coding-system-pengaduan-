# Sistem Pengaduan Fakultas Ilmu Komputer

Aplikasi web wadah pengaduan di lingkungan Fakultas Ilmu Komputer. Pengguna (user) mengirim
pengaduan, admin melihat dan menindaklanjutinya. Dibuat dengan **React + Vite + Tailwind CSS +
React Router**, tanpa backend/database — seluruh data disimpan di **localStorage** melalui lapisan
terpisah agar mudah dimigrasi ke database di kemudian hari.

---

## 1. Instalasi & Menjalankan

Prasyarat: **Node.js 20+** dan npm.

```bash
# 1. Install dependency
npm install

# 2. Jalankan mode development (buka http://localhost:5173)
npm run dev

# 3. Build untuk produksi (hasil ada di folder dist/)
npm run build

# 4. Pratinjau hasil build produksi
npm run preview
```

> Catatan: `crypto.subtle` (Web Crypto API untuk hashing SHA-256) hanya tersedia di **konteks
> aman** (`localhost` atau HTTPS). Saat diakses lewat `http://` dari alamat IP LAN, aplikasi
> otomatis memakai hash fallback deterministik agar tetap berjalan.

### Akun bawaan (seed otomatis saat pertama dijalankan)

| Peran | Email                | Password    |
| ----- | -------------------- | ----------- |
| Admin | `admin@filkom.local` | `Admin12345`|
| User  | `user@filkom.local`  | `User12345` |

Akun user demo sudah disertai 3 contoh pengaduan untuk memperlihatkan dashboard admin.

---

## 2. Alur Kerja Aplikasi

### Alur login & sesi

1. Pengguna membuka aplikasi → jika belum login, diarahkan ke `/login`.
2. **Register** (`/register`): isi nama lengkap, email, password, konfirmasi. Validasi: format
   email, email belum terdaftar, password minimal 8 karakter, konfirmasi harus sama. Akun baru
   otomatis berperan **user** (role tidak bisa dipilih dari form). Setelah registrasi, user
   langsung masuk.
3. **Login** (`/login`): email + password, tersedia tombol tampil/sembunyikan password dan pesan
   error yang jelas.
4. Sesi disimpan di `localStorage` sehingga **tetap aktif setelah refresh**. Saat logout, sesi
   dihapus dan diarahkan ke login.
5. Password **di-hash SHA-256** (ditambah salt aplikasi). Password asli tidak pernah disimpan.

### Pembagian peran (route guard)

Akses dikendalikan dua lapis:

- **`ProtectedRoute`** — memastikan pengguna sudah login; jika belum, diarahkan ke `/login`.
- **Route guard berbasis role** — `ProtectedRoute role="admin|user"` menolak akses. Bila peran
  tidak sesuai, muncul halaman **"Akses ditolak"** dengan tautan ke halaman yang benar.

| Area | Route | Isi |
| ---- | ----- | --- |
| User | `/user/dashboard` | Ringkasan jumlah pengaduan & statusnya |
| User | `/user/buat` | Form buat pengaduan (judul, kategori, deskripsi, tanggal otomatis) |
| User | `/user/pengaduan` | Daftar pengaduan sendiri + status + tanggapan admin |
| Admin | `/admin/dashboard` | Total pengaduan, jumlah per status & per kategori |
| Admin | `/admin/pengaduan` | Semua pengaduan: pencarian, filter status/kategori, urut tanggal |
| Admin | `/admin/pengaduan/:id` | Detail + ubah status + beri tanggapan |
| Semua | `/profile` | Ubah nama/email/password + tombol logout |

User hanya melihat pengaduan miliknya (`ComplaintContext` menyaring berdasarkan `userId`), sedangkan
admin melihat seluruh pengaduan.

### Profil & logout

- Ikon/avatar di navbar (kanan) menuju halaman **Profil**.
- Di Profil: ubah nama & email (email tidak boleh bentrok dengan akun lain) dan ubah password
  (wajib memasukkan password lama + konfirmasi password baru).
- **Tombol logout hanya ada di halaman Profil**, bukan di navbar. Saat diklik muncul dialog
  konfirmasi, lalu sesi dihapus dan diarahkan ke login.
- Setiap keberhasilan/kegagalan ditampilkan lewat **toast**.

---

## 3. Cara Kerja localStorage

`src/utils/storage.js` adalah satu-satunya lapisan yang menyentuh `localStorage`. Context dan
komponen tidak pernah memanggil `localStorage` secara langsung, sehingga migrasi ke backend cukup
mengganti isi file ini.

Kunci penyimpanan:

| Kunci | Isi |
| ----- | --- |
| `sp_filkom.users` | Daftar akun: `{ id, nama, email, role, passwordHash, createdAt, updatedAt }` |
| `sp_filkom.session` | Sesi aktif: `{ userId, loginAt }` |
| `sp_filkom.complaints` | Daftar pengaduan semua user |
| `sp_filkom.seedVersion` | Penanda seed sudah dijalankan |

Struktur satu pengaduan:

```js
{
  id, userId, pelaporNama, pelaporEmail,
  judul, kategori, deskripsi,
  status,            // Menunggu | Diproses | Selesai | Ditolak
  tanggapan,         // diisi admin
  createdAt, updatedAt
}
```

Alur data: `storage.js` → `AuthContext` / `ComplaintContext` (state global via Context API) →
halaman/komponen. Setiap kali data berubah, Context memperbarui state dan memicu render ulang.

Untuk mengatur ulang seluruh data, buka DevTools → Application → Local Storage dan hapus kunci
berawalan `sp_filkom.`, atau panggil `resetAll()` dari `storage.js`.

---

## 4. Struktur Proyek

```
src/
  components/   Navbar, ProtectedRoute, StatusBadge, Modal, Toast, ComplaintCard, UI
  context/      AuthContext, ComplaintContext
  pages/
    auth/       Login, Register
    user/       Dashboard, BuatPengaduan, PengaduanSaya
    admin/      Dashboard, SemuaPengaduan, DetailPengaduan
    Profile.jsx
    NotFound.jsx
  utils/        storage.js, hash.js, validators.js, constants.js, format.js
  App.jsx, main.jsx, index.css
public/         manifest.webmanifest, sw.js, icon.svg, icon-maskable.svg
```

---

## 5. Responsif, Aksesibilitas & PWA

- **Mobile-first**: navbar atas di desktop dan **bottom navigation** + menu hamburger di mobile.
- Meta `viewport` dengan `viewport-fit=cover` dan padding `env(safe-area-inset-*)` untuk iOS.
- Area sentuh tombol minimal **44px**.
- Label form, kontras warna memadai, fokus keyboard terlihat, modal dapat ditutup dengan `Esc`.
- **PWA opsional**: `manifest.webmanifest` + service worker sederhana (`public/sw.js`) yang
  didaftarkan hanya pada build produksi.

---

## 6. Keterbatasan

- **Data hanya tersimpan di browser masing-masing.** Data tidak tersinkron antar perangkat/
  browser, hilang bila pengguna membersihkan data situs, dan bisa dibaca/diubah lewat DevTools.
- **Bukan keamanan tingkat produksi.** Hashing SHA-256 dilakukan di sisi klien dan bisa
  dimanipulasi; sesi hanya penanda di localStorage sehingga tidak terlindungi dari XSS.
- Tidak ada fitur berbagi antar-pengguna, lampiran file, notifikasi, atau email.
- Isolasi pengaduan antar-user hanya bersifat tampilan (di sisi klien), bukan pembatasan
  server.

## 7. Saran Upgrade ke Backend + Database

1. **API server** (mis. Node/Express, NestJS, Laravel, atau Django) sebagai pengganti
   `utils/storage.js`. Ganti implementasi fungsi di file itu menjadi pemanggilan `fetch`/Axios.
2. **Database** (PostgreSQL/MySQL) dengan tabel `users` dan `complaints`. Pindahkan hashing
   password ke server (bcrypt/Argon2) dan tambahkan **JWT / session cookie** untuk autentikasi.
3. **Otorisasi di server**: terapkan pengecekan role dan kepemilikan data di endpoint, bukan
   hanya di UI.
4. Tambahan: unggah lampiran, riwayat tanggapan, notifikasi email, serta audit log.

Karena seluruh akses penyimpanan sudah terpusat di `storage.js`, penggantian ke backend dapat
dilakukan tanpa mengubah halaman maupun komponen.
