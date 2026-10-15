import { hashPassword } from './hash';
import { generateId } from './format';
import { ROLES, STATUS, SEED_ADMIN } from './constants';

/**
 * Lapisan penyimpanan terpisah.
 * Saat ini memakai localStorage. Untuk migrasi ke backend/database,
 * cukup ganti implementasi fungsi-fungsi di file ini (mis. menjadi fetch/axios)
 * tanpa mengubah Context maupun komponen.
 */

const KEYS = {
  USERS: 'sp_filkom.users',
  SESSION: 'sp_filkom.session',
  COMPLAINTS: 'sp_filkom.complaints',
  SEED_VERSION: 'sp_filkom.seedVersion',
};

const SEED_VERSION = '1';

const DEMO_USER = {
  nama: 'Mahasiswa Demo',
  email: 'user@filkom.local',
  password: 'User12345',
};

function isBrowser() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function read(key, fallback) {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/* ----------------------------- SESSION ----------------------------- */

export function getSession() {
  return read(KEYS.SESSION, null);
}

export function setSession(session) {
  return write(KEYS.SESSION, session);
}

export function clearSession() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(KEYS.SESSION);
  } catch {
    /* ignore */
  }
}

/* ------------------------------ USERS ------------------------------ */

export function getUsers() {
  return read(KEYS.USERS, []);
}

export function saveUsers(users) {
  return write(KEYS.USERS, users);
}

export function findUserByEmail(email) {
  const target = String(email || '').trim().toLowerCase();
  return getUsers().find((u) => u.email === target) || null;
}

export function findUserById(id) {
  return getUsers().find((u) => u.id === id) || null;
}

export function insertUser(user) {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
  return user;
}

export function updateUserById(id, changes) {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;
  const updated = { ...users[index], ...changes, id };
  users[index] = updated;
  saveUsers(users);
  return updated;
}

/* --------------------------- COMPLAINTS ---------------------------- */

export function getComplaints() {
  return read(KEYS.COMPLAINTS, []);
}

export function saveComplaints(complaints) {
  return write(KEYS.COMPLAINTS, complaints);
}

export function insertComplaint(complaint) {
  const complaints = getComplaints();
  complaints.push(complaint);
  saveComplaints(complaints);
  return complaint;
}

export function updateComplaintById(id, changes) {
  const complaints = getComplaints();
  const index = complaints.findIndex((c) => c.id === id);
  if (index === -1) return null;
  const updated = { ...complaints[index], ...changes, id };
  complaints[index] = updated;
  saveComplaints(complaints);
  return updated;
}

/* ------------------------------ RESET ------------------------------ */

export function resetAll() {
  if (!isBrowser()) return;
  Object.values(KEYS).forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  });
}

/* ------------------------------ SEED ------------------------------- */

async function buildUser({ nama, email, password, role }) {
  return {
    id: generateId('usr'),
    nama,
    email: email.trim().toLowerCase(),
    role,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function sampleComplaint(user, { judul, kategori, deskripsi, status, tanggapan, daysAgo }) {
  const created = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  return {
    id: generateId('cpt'),
    userId: user.id,
    pelaporNama: user.nama,
    pelaporEmail: user.email,
    judul,
    kategori,
    deskripsi,
    status,
    tanggapan: tanggapan || '',
    lampiran: '',
    createdAt: created,
    updatedAt: created,
  };
}

/**
 * Membuat akun admin bawaan, akun demo, dan beberapa contoh pengaduan.
 * Hanya dijalankan sekali (dikontrol SEED_VERSION).
 */
export async function ensureSeed() {
  if (!isBrowser()) return;
  if (read(KEYS.SEED_VERSION, null) === SEED_VERSION) return;

  const users = getUsers();
  const complaints = getComplaints();

  let admin = users.find((u) => u.email === SEED_ADMIN.email);
  if (!admin) {
    admin = await buildUser({
      nama: SEED_ADMIN.nama,
      email: SEED_ADMIN.email,
      password: SEED_ADMIN.password,
      role: ROLES.ADMIN,
    });
    users.push(admin);
  }

  let demo = users.find((u) => u.email === DEMO_USER.email);
  if (!demo) {
    demo = await buildUser({
      nama: DEMO_USER.nama,
      email: DEMO_USER.email,
      password: DEMO_USER.password,
      role: ROLES.USER,
    });
    users.push(demo);
  }

  if (!complaints.some((c) => c.userId === demo.id)) {
    complaints.push(
      sampleComplaint(demo, {
        judul: 'AC di Lab Komputer 3 tidak menyala',
        kategori: 'Fasilitas',
        deskripsi:
          'AC di Lab Komputer 3 sudah beberapa hari tidak menyala sehingga ruangan sangat panas saat praktikum.',
        status: STATUS.DIPROSES,
        tanggapan:
          'Terima kasih atas laporannya. Tim sarana sudah menjadwalkan perbaikan minggu ini.',
        daysAgo: 6,
      }),
      sampleComplaint(demo, {
        judul: 'Jadwal konsultasi dosen pembimbing tidak jelas',
        kategori: 'Akademik',
        deskripsi:
          'Informasi jadwal konsultasi dosen pembimbing skripsi tidak konsisten antara grup dan papan pengumuman.',
        status: STATUS.MENUNGGU,
        tanggapan: '',
        daysAgo: 2,
      }),
      sampleComplaint(demo, {
        judul: 'Lampu koridor lantai 2 mati',
        kategori: 'Keamanan',
        deskripsi:
          'Beberapa lampu koridor lantai 2 mati pada malam hari sehingga area menjadi gelap dan rawan.',
        status: STATUS.SELESAI,
        tanggapan: 'Lampu sudah diganti dan area kembali terang. Terima kasih.',
        daysAgo: 14,
      })
    );
  }

  saveUsers(users);
  saveComplaints(complaints);
  write(KEYS.SEED_VERSION, SEED_VERSION);
}
