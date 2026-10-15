export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;

export function isValidEmail(email) {
  return EMAIL_REGEX.test(String(email || '').trim().toLowerCase());
}

export function validateNama(nama) {
  const value = String(nama || '').trim();
  if (!value) return 'Nama lengkap wajib diisi.';
  if (value.length < 3) return 'Nama minimal 3 karakter.';
  if (value.length > 60) return 'Nama maksimal 60 karakter.';
  return '';
}

export function validateEmail(email) {
  const value = String(email || '').trim();
  if (!value) return 'Email wajib diisi.';
  if (!isValidEmail(value)) return 'Format email tidak valid.';
  return '';
}

export function validatePassword(password) {
  const value = String(password || '');
  if (!value) return 'Password wajib diisi.';
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  }
  return '';
}

export function validateConfirmPassword(password, confirm) {
  if (!confirm) return 'Konfirmasi password wajib diisi.';
  if (password !== confirm) return 'Konfirmasi password tidak sama.';
  return '';
}

export function validateJudul(judul) {
  const value = String(judul || '').trim();
  if (!value) return 'Judul pengaduan wajib diisi.';
  if (value.length < 5) return 'Judul minimal 5 karakter.';
  if (value.length > 120) return 'Judul maksimal 120 karakter.';
  return '';
}

export function validateKategori(kategori) {
  if (!kategori) return 'Kategori wajib dipilih.';
  return '';
}

export function validateDeskripsi(deskripsi) {
  const value = String(deskripsi || '').trim();
  if (!value) return 'Deskripsi wajib diisi.';
  if (value.length < 15) return 'Deskripsi minimal 15 karakter.';
  if (value.length > 2000) return 'Deskripsi maksimal 2000 karakter.';
  return '';
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function normalizeText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}
