import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import ComplaintCard from '../../components/ComplaintCard';
import { Card, EmptyState, LoadingState, PageHeader } from '../../components/UI';
import { STATUS } from '../../utils/constants';

const STATUS_CARDS = [
  { key: STATUS.MENUNGGU, label: 'Menunggu', accent: 'text-amber-700', bg: 'bg-amber-50' },
  { key: STATUS.DIPROSES, label: 'Diproses', accent: 'text-blue-700', bg: 'bg-blue-50' },
  { key: STATUS.SELESAI, label: 'Selesai', accent: 'text-emerald-700', bg: 'bg-emerald-50' },
  { key: STATUS.DITOLAK, label: 'Ditolak', accent: 'text-red-700', bg: 'bg-red-50' },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const { complaints, stats, loading } = useComplaints();

  const recent = complaints.slice(0, 3);

  return (
    <div>
      <PageHeader
        title={`Halo, ${user.nama.split(' ')[0]} 👋`}
        description="Ringkasan pengaduan yang Anda kirimkan."
        action={
          <Link to="/user/buat" className="btn-primary">
            + Buat Pengaduan
          </Link>
        }
      />

      <section aria-label="Statistik pengaduan" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4">
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

      <section className="mt-6" aria-label="Pengaduan terbaru">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Pengaduan Terbaru</h2>
          {complaints.length > 3 && (
            <Link to="/user/pengaduan" className="text-sm font-semibold text-brand-700 hover:underline">
              Lihat semua
            </Link>
          )}
        </div>

        {loading ? (
          <LoadingState />
        ) : recent.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Belum ada pengaduan"
            description="Anda belum pernah mengirim pengaduan. Mulai dengan membuat pengaduan pertama Anda."
            action={
              <Link to="/user/buat" className="btn-primary">
                Buat Pengaduan
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {recent.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
