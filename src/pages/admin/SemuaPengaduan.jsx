import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import ComplaintCard from '../../components/ComplaintCard';
import { EmptyState, ErrorState, Input, LoadingState, PageHeader, Select } from '../../components/UI';
import { KATEGORI_LIST, STATUS_LIST } from '../../utils/constants';

export default function SemuaPengaduan() {
  const { complaints, loading } = useComplaints();
  const navigate = useNavigate();

  const [status, setStatus] = useState('Semua');
  const [kategori, setKategori] = useState('Semua');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('terbaru');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = complaints.filter((c) => {
      const matchStatus = status === 'Semua' || c.status === status;
      const matchKategori = kategori === 'Semua' || c.kategori === kategori;
      const matchQuery =
        !q ||
        c.judul.toLowerCase().includes(q) ||
        c.deskripsi.toLowerCase().includes(q) ||
        c.pelaporNama.toLowerCase().includes(q) ||
        c.pelaporEmail.toLowerCase().includes(q);
      return matchStatus && matchKategori && matchQuery;
    });

    result.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sort === 'terbaru' ? db - da : da - db;
    });

    return result;
  }, [complaints, status, kategori, query, sort]);

  const hasFilter = status !== 'Semua' || kategori !== 'Semua' || query.trim() !== '';

  const resetFilter = () => {
    setStatus('Semua');
    setKategori('Semua');
    setQuery('');
    setSort('terbaru');
  };

  return (
    <div>
      <PageHeader
        title="Semua Pengaduan"
        description="Kelola dan tindak lanjuti pengaduan dari seluruh pengguna."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          type="search"
          placeholder="Cari judul, isi, atau pelapor…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Cari pengaduan"
          className="sm:col-span-2 lg:col-span-1"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter status">
          <option value="Semua">Semua status</option>
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          aria-label="Filter kategori"
        >
          <option value="Semua">Semua kategori</option>
          {KATEGORI_LIST.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Urutkan tanggal">
          <option value="terbaru">Tanggal terbaru</option>
          <option value="terlama">Tanggal terlama</option>
        </Select>
      </div>

      {loading ? (
        <LoadingState />
      ) : complaints.length === 0 ? (
        <EmptyState icon="🗂️" title="Belum ada pengaduan" description="Belum ada pengaduan yang masuk." />
      ) : filtered.length === 0 ? (
        <ErrorState
          title="Tidak ada hasil"
          description="Tidak ada pengaduan yang cocok dengan filter Anda."
          action={
            hasFilter ? (
              <button type="button" className="btn-secondary" onClick={resetFilter}>
                Reset filter
              </button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Menampilkan {filtered.length} dari {complaints.length} pengaduan.
          </p>
          {filtered.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              showPelapor
              onOpen={(c) => navigate(`/admin/pengaduan/${c.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
