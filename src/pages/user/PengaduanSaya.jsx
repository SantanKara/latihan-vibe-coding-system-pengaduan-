import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import ComplaintCard from '../../components/ComplaintCard';
import { EmptyState, ErrorState, Input, LoadingState, PageHeader, Select } from '../../components/UI';
import { KATEGORI_LIST, STATUS_LIST } from '../../utils/constants';

export default function PengaduanSaya() {
  const { complaints, loading } = useComplaints();
  const [status, setStatus] = useState('Semua');
  const [kategori, setKategori] = useState('Semua');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return complaints.filter((c) => {
      const matchStatus = status === 'Semua' || c.status === status;
      const matchKategori = kategori === 'Semua' || c.kategori === kategori;
      const matchQuery =
        !q ||
        c.judul.toLowerCase().includes(q) ||
        c.deskripsi.toLowerCase().includes(q);
      return matchStatus && matchKategori && matchQuery;
    });
  }, [complaints, status, kategori, query]);

  const hasFilter = status !== 'Semua' || kategori !== 'Semua' || query.trim() !== '';

  const resetFilter = () => {
    setStatus('Semua');
    setKategori('Semua');
    setQuery('');
  };

  return (
    <div>
      <PageHeader
        title="Pengaduan Saya"
        description="Seluruh pengaduan yang Anda kirimkan beserta statusnya."
        action={
          <Link to="/user/buat" className="btn-primary">
            + Buat Pengaduan
          </Link>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Input
          type="search"
          placeholder="Cari judul atau deskripsi…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Cari pengaduan"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter status"
        >
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
      </div>

      {loading ? (
        <LoadingState />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon="📝"
          title="Belum ada pengaduan"
          description="Anda belum mengirim pengaduan apa pun."
          action={
            <Link to="/user/buat" className="btn-primary">
              Buat Pengaduan
            </Link>
          }
        />
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
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  );
}
