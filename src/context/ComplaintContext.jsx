import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { getComplaints, insertComplaint, updateComplaintById } from '../utils/storage';
import { generateId } from '../utils/format';
import { normalizeText, validateDeskripsi, validateJudul, validateKategori } from '../utils/validators';
import { ROLES, STATUS } from '../utils/constants';

const ComplaintContext = createContext(null);

function sortByDate(list) {
  return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function ComplaintProvider({ children }) {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    try {
      setComplaints(sortByDate(getComplaints()));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setComplaints([]);
      setLoading(false);
      return;
    }
    refresh();
  }, [user, refresh]);

  const visibleComplaints = useMemo(() => {
    if (!user) return [];
    if (user.role === ROLES.ADMIN) return complaints;
    return complaints.filter((c) => c.userId === user.id);
  }, [complaints, user]);

  const getById = useCallback(
    (id) => {
      const found = complaints.find((c) => c.id === id) || null;
      if (!found || !user) return null;
      if (user.role !== ROLES.ADMIN && found.userId !== user.id) return null;
      return found;
    },
    [complaints, user]
  );

  const createComplaint = useCallback(
    ({ judul, kategori, deskripsi }) => {
      if (!user) throw new Error('Sesi tidak ditemukan. Silakan login kembali.');

      const judulError = validateJudul(judul);
      if (judulError) throw new Error(judulError);

      const kategoriError = validateKategori(kategori);
      if (kategoriError) throw new Error(kategoriError);

      const deskripsiError = validateDeskripsi(deskripsi);
      if (deskripsiError) throw new Error(deskripsiError);

      const now = new Date().toISOString();
      const complaint = {
        id: generateId('cpt'),
        userId: user.id,
        pelaporNama: user.nama,
        pelaporEmail: user.email,
        judul: normalizeText(judul),
        kategori,
        deskripsi: String(deskripsi).trim(),
        status: STATUS.MENUNGGU,
        tanggapan: '',
        createdAt: now,
        updatedAt: now,
      };

      insertComplaint(complaint);
      refresh();
      return complaint;
    },
    [user, refresh]
  );

  const updateComplaint = useCallback(
    (id, { status, tanggapan }) => {
      if (!user || user.role !== ROLES.ADMIN) {
        throw new Error('Hanya admin yang dapat menindaklanjuti pengaduan.');
      }

      const existing = complaints.find((c) => c.id === id);
      if (!existing) throw new Error('Pengaduan tidak ditemukan.');

      const updated = updateComplaintById(id, {
        status: status || existing.status,
        tanggapan: typeof tanggapan === 'string' ? tanggapan.trim() : existing.tanggapan,
        updatedAt: new Date().toISOString(),
        ditanganiOleh: user.nama,
      });

      refresh();
      return updated;
    },
    [user, complaints, refresh]
  );

  const stats = useMemo(() => {
    const source = visibleComplaints;
    const byStatus = {
      [STATUS.MENUNGGU]: 0,
      [STATUS.DIPROSES]: 0,
      [STATUS.SELESAI]: 0,
      [STATUS.DITOLAK]: 0,
    };
    const byKategori = {};

    source.forEach((c) => {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      byKategori[c.kategori] = (byKategori[c.kategori] || 0) + 1;
    });

    return { total: source.length, byStatus, byKategori };
  }, [visibleComplaints]);

  const value = useMemo(
    () => ({
      complaints: visibleComplaints,
      allComplaints: complaints,
      loading,
      stats,
      refresh,
      getById,
      createComplaint,
      updateComplaint,
    }),
    [visibleComplaints, complaints, loading, stats, refresh, getById, createComplaint, updateComplaint]
  );

  return <ComplaintContext.Provider value={value}>{children}</ComplaintContext.Provider>;
}

export function useComplaints() {
  const ctx = useContext(ComplaintContext);
  if (!ctx) throw new Error('useComplaints harus dipakai di dalam ComplaintProvider');
  return ctx;
}
