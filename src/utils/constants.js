export const APP_NAME = 'Sistem Pengaduan';
export const APP_SUBTITLE = 'Fakultas Ilmu Komputer';

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const STATUS = {
  MENUNGGU: 'Menunggu',
  DIPROSES: 'Diproses',
  SELESAI: 'Selesai',
  DITOLAK: 'Ditolak',
};

export const STATUS_LIST = [
  STATUS.MENUNGGU,
  STATUS.DIPROSES,
  STATUS.SELESAI,
  STATUS.DITOLAK,
];

export const STATUS_STYLES = {
  [STATUS.MENUNGGU]: 'bg-amber-100 text-amber-800 border-amber-200',
  [STATUS.DIPROSES]: 'bg-blue-100 text-blue-800 border-blue-200',
  [STATUS.SELESAI]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  [STATUS.DITOLAK]: 'bg-red-100 text-red-800 border-red-200',
};

export const KATEGORI_LIST = [
  'Fasilitas',
  'Akademik',
  'Layanan Administrasi',
  'Keamanan',
  'Pelecehan',
  'Pembullyan (Bullying)',
  'Senioritas',
  'Lainnya',
];

export const KATEGORI_ICON = {
  Fasilitas: '🏢',
  Akademik: '🎓',
  'Layanan Administrasi': '🗂️',
  Keamanan: '🔒',
  Pelecehan: '🚫',
  'Pembullyan (Bullying)': '🛡️',
  Senioritas: '⚠️',
  Lainnya: '📌',
};

export const SEED_ADMIN = {
  nama: 'Administrator FILKOM',
  email: 'admin@filkom.local',
  password: 'Admin12345',
};
