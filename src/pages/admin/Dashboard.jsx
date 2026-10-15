import { Link, useNavigate } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import ComplaintCard from '../../components/ComplaintCard';
import { Card, EmptyState, LoadingState, PageHeader } from '../../components/UI';
import { KATEGORI_LIST, STATUS } from '../../utils/constants';

const STATUS_CARDS = [
  { key: STATUS.MENUNGGU, label: 'Menunggu', accent: 'text-amber-700', bg: 'bg-amber-50' },
  { key: STATUS.DIPROSES, label: 'Diproses', accent: 'text-blue-700', bg: 'bg-blue-50' },
  { key: STATUS.SELESAI, label: 'Selesai', accent: 'text-emerald-700', bg: 'bg-emerald-50' },
  { key: STATUS.DITOLAK, label: 'Ditolak', accent: 'text-red-700', bg: 'bg-red-50' },
];

export default function AdminDashboard() {
  const { complaints, stats, loading } = useComplaints();
  const navigate = useNavigate();

  const maxKategori = Math.max(1, ...KATEGORI_LIST.map((k) => stats.byKategori[k] || 0));
  const recent = complaints.slice(0, 4);

  return (
    <div>
      <PageHeader
        title="Dashboard Admin"
        description="Pantau seluruh pengaduan dari semua pengguna."
        action={
          <Link to="/admin/pengaduan" className="btn-primary">
            Lihat Semua Pengaduan
          </Link>
        }
      />

      <section aria-label="Statistik" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Card className="col-span-2 p-4 lg:col-span-1">
          <p className="text-xs font-medium text-slate-500">Total Pengaduan</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.total}</p>
        </Card>
        {STATUS_CARDS.map((card) => (
          <Card key={card.key} className={`p-4 ${card.bg}`}>
            <p className={`text-xs font-medium ${card.accent}`}>{card.label}</p>
            <p className={`mt-1 text-3xl font-bold ${card.accent}`}>
              {stats.byStatus[card.key] || 0}
            </p>
          </Card>
        ))}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3" aria-label="Pengaduan terbaru">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Pengaduan Terbaru</h2>
          {loading ? (
            <LoadingState />
          ) : recent.length === 0 ? (
            <EmptyState icon="🗂️" title="Belum ada pengaduan" description="Saat ini belum ada pengaduan yang masuk." />
          ) : (
            <div className="space-y-3">
              {recent.map((complaint) => (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  showPelapor
                  onOpen={(c) => navigate(`/admin/pengaduan/${c.id}`)}
                />
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-2" aria-label="Pengaduan per kategori">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Per Kategori</h2>
          <Card className="space-y-4 p-5">
            {KATEGORI_LIST.map((kategori) => {
              const count = stats.byKategori[kategori] || 0;
              const width = Math.round((count / maxKategori) * 100);
              return (
                <div key={kategori}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{kategori}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div
                    className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
                    role="img"
                    aria-label={`${kategori}: ${count} pengaduan`}
                  >
                    <div
                      className="h-full rounded-full bg-brand-600 transition-all"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </Card>
        </section>
      </div>
    </div>
  );
}
