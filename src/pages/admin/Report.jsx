import { useMemo, useRef, useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import StatusBadge from '../../components/StatusBadge';
import { Card, EmptyState, LoadingState, PageHeader, Select } from '../../components/UI';
import { KATEGORI_ICON, KATEGORI_LIST, STATUS, STATUS_LIST } from '../../utils/constants';
import { formatDate, formatDateTime } from '../../utils/format';

/* ───── colour helpers ───── */
const STATUS_COLORS = {
  [STATUS.MENUNGGU]: { bar: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', gradient: 'from-amber-400 to-amber-600' },
  [STATUS.DIPROSES]: { bar: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200', gradient: 'from-blue-400 to-blue-600' },
  [STATUS.SELESAI]: { bar: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', gradient: 'from-emerald-400 to-emerald-600' },
  [STATUS.DITOLAK]: { bar: '#ef4444', bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200', gradient: 'from-red-400 to-red-600' },
};

const KATEGORI_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
];

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des',
];

/* ───── helper: get month range ───── */
function getMonthRange(complaints) {
  if (!complaints.length) return [];
  const dates = complaints.map((c) => new Date(c.createdAt));
  const min = new Date(Math.min(...dates));
  const max = new Date(Math.max(...dates));
  const months = [];
  const cursor = new Date(min.getFullYear(), min.getMonth(), 1);
  while (cursor <= max) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

/* ───── percentage helper ───── */
function pct(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

/* ───── Donut SVG component ───── */
function DonutChart({ data, size = 160 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return null;

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <svg width={size} height={size} viewBox="0 0 160 160" className="mx-auto">
      {data.map((d, i) => {
        const dashLength = (d.value / total) * circumference;
        const dashGap = circumference - dashLength;
        const offset = -cumulativeOffset;
        cumulativeOffset += dashLength;
        return (
          <circle
            key={i}
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={d.color}
            strokeWidth="20"
            strokeDasharray={`${dashLength} ${dashGap}`}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            className="transition-all duration-700"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }}
          />
        );
      })}
      <text x="80" y="74" textAnchor="middle" className="fill-slate-900 text-2xl font-bold" style={{ fontSize: '28px', fontWeight: 700 }}>
        {total}
      </text>
      <text x="80" y="96" textAnchor="middle" className="fill-slate-500" style={{ fontSize: '12px' }}>
        Total
      </text>
    </svg>
  );
}

/* ───── Resolution rate ring ───── */
function RateRing({ value, label, color = '#10b981' }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashLength = (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${dashLength} ${circumference - dashLength}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
          className="transition-all duration-1000"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
        />
        <text x="50" y="53" textAnchor="middle" className="fill-slate-900" style={{ fontSize: '18px', fontWeight: 700 }}>
          {value}%
        </text>
      </svg>
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   MAIN REPORT PAGE
   ════════════════════════════════════════════════════ */
export default function Report() {
  const { complaints, allComplaints, loading, stats } = useComplaints();
  const printRef = useRef(null);

  /* ── Date range filter ── */
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');

  const filtered = useMemo(() => {
    let list = allComplaints;
    if (dateFrom) list = list.filter((c) => c.createdAt >= dateFrom);
    if (dateTo) list = list.filter((c) => c.createdAt <= dateTo + 'T23:59:59');
    if (filterKategori !== 'Semua') list = list.filter((c) => c.kategori === filterKategori);
    return list;
  }, [allComplaints, dateFrom, dateTo, filterKategori]);

  /* ── Computed stats from filtered ── */
  const reportStats = useMemo(() => {
    const byStatus = {};
    STATUS_LIST.forEach((s) => (byStatus[s] = 0));
    const byKategori = {};
    KATEGORI_LIST.forEach((k) => (byKategori[k] = 0));

    filtered.forEach((c) => {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      byKategori[c.kategori] = (byKategori[c.kategori] || 0) + 1;
    });

    const total = filtered.length;
    const selesai = byStatus[STATUS.SELESAI] || 0;
    const ditolak = byStatus[STATUS.DITOLAK] || 0;
    const resolutionRate = pct(selesai, total);
    const rejectionRate = pct(ditolak, total);
    const activeRate = pct((byStatus[STATUS.MENUNGGU] || 0) + (byStatus[STATUS.DIPROSES] || 0), total);

    return { total, byStatus, byKategori, resolutionRate, rejectionRate, activeRate };
  }, [filtered]);

  /* ── Monthly trend ── */
  const monthlyData = useMemo(() => {
    const months = getMonthRange(filtered);
    return months.map(({ year, month }) => {
      const count = filtered.filter((c) => {
        const d = new Date(c.createdAt);
        return d.getFullYear() === year && d.getMonth() === month;
      }).length;
      return { label: `${MONTH_NAMES[month]} ${year}`, count };
    });
  }, [filtered]);

  const maxMonthly = Math.max(1, ...monthlyData.map((m) => m.count));

  /* ── Average response time (days between created and updated for resolved) ── */
  const avgResponseTime = useMemo(() => {
    const resolved = filtered.filter((c) => c.status === STATUS.SELESAI || c.status === STATUS.DITOLAK);
    if (!resolved.length) return null;
    const totalMs = resolved.reduce((sum, c) => sum + (new Date(c.updatedAt) - new Date(c.createdAt)), 0);
    const avgDays = totalMs / resolved.length / (1000 * 60 * 60 * 24);
    return avgDays < 1 ? '< 1 hari' : `${Math.round(avgDays)} hari`;
  }, [filtered]);

  /* ── Print handler ── */
  const handlePrint = () => {
    window.print();
  };

  /* ── Export CSV ── */
  const handleExportCSV = () => {
    const headers = ['No', 'Tanggal', 'Pelapor', 'Email', 'Kategori', 'Judul', 'Status', 'Tanggapan'];
    const rows = filtered.map((c, i) => [
      i + 1,
      formatDateTime(c.createdAt),
      c.pelaporNama,
      c.pelaporEmail,
      c.kategori,
      `"${c.judul.replace(/"/g, '""')}"`,
      c.status,
      `"${(c.tanggapan || '-').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-pengaduan-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingState label="Memuat laporan…" />;

  return (
    <div ref={printRef} className="animate-fade-in">
      {/* ── Header ── */}
      <PageHeader
        title="Laporan Pengaduan"
        description="Ringkasan, analisis, dan statistik seluruh pengaduan."
        action={
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={handleExportCSV}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0-3-3m3 3 3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
              </svg>
              Export CSV
            </button>
            <button type="button" className="btn-primary print:hidden" onClick={handlePrint}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m0 0v4h10v-4M7 9V5h10v4" />
              </svg>
              Cetak
            </button>
          </div>
        }
      />

      {/* ── Filters ── */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[140px] flex-1">
            <label className="label-base">Dari Tanggal</label>
            <input
              type="date"
              className="input-base"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="label-base">Sampai Tanggal</label>
            <input
              type="date"
              className="input-base"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <label className="label-base">Kategori</label>
            <Select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)}>
              <option value="Semua">Semua kategori</option>
              {KATEGORI_LIST.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </Select>
          </div>
          {(dateFrom || dateTo || filterKategori !== 'Semua') && (
            <button
              type="button"
              className="btn-ghost text-red-600 hover:bg-red-50"
              onClick={() => { setDateFrom(''); setDateTo(''); setFilterKategori('Semua'); }}
            >
              Reset
            </button>
          )}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📊"
          title="Tidak ada data"
          description="Tidak ada pengaduan yang cocok dengan filter yang dipilih."
        />
      ) : (
        <>
          {/* ── Summary Cards ── */}
          <section aria-label="Ringkasan" className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {/* Total */}
            <Card className="relative overflow-hidden p-4">
              <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-brand-100 opacity-50" />
              <p className="text-xs font-medium text-slate-500">Total</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{reportStats.total}</p>
            </Card>
            {/* Per status */}
            {STATUS_LIST.map((s) => {
              const c = STATUS_COLORS[s];
              return (
                <Card key={s} className={`relative overflow-hidden p-4 ${c.bg}`}>
                  <div className={`absolute -right-3 -top-3 h-16 w-16 rounded-full ${c.ring} ring-4 opacity-30`} />
                  <p className={`text-xs font-medium ${c.text}`}>{s}</p>
                  <p className={`mt-1 text-3xl font-bold ${c.text}`}>{reportStats.byStatus[s] || 0}</p>
                </Card>
              );
            })}
            {/* Avg Response */}
            <Card className="relative overflow-hidden p-4 bg-violet-50">
              <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full ring-4 ring-violet-200 opacity-30" />
              <p className="text-xs font-medium text-violet-700">Rata-rata Respons</p>
              <p className="mt-1 text-2xl font-bold text-violet-700">{avgResponseTime || '-'}</p>
            </Card>
          </section>

          {/* ── Charts Row ── */}
          <div className="mb-6 grid gap-6 lg:grid-cols-3">
            {/* Donut: Status */}
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Distribusi Status</h2>
              <DonutChart
                data={STATUS_LIST.map((s) => ({
                  value: reportStats.byStatus[s] || 0,
                  color: STATUS_COLORS[s].bar,
                }))}
              />
              <div className="mt-4 grid grid-cols-2 gap-2">
                {STATUS_LIST.map((s) => (
                  <div key={s} className="flex items-center gap-2 text-xs">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[s].bar }}
                    />
                    <span className="text-slate-600">{s}</span>
                    <span className="ml-auto font-semibold text-slate-900">{reportStats.byStatus[s] || 0}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Rate Rings */}
            <Card className="flex flex-col items-center justify-center gap-6 p-5">
              <h2 className="w-full text-sm font-semibold text-slate-900">Tingkat Penyelesaian</h2>
              <div className="flex flex-wrap justify-center gap-6">
                <RateRing value={reportStats.resolutionRate} label="Selesai" color="#10b981" />
                <RateRing value={reportStats.rejectionRate} label="Ditolak" color="#ef4444" />
                <RateRing value={reportStats.activeRate} label="Aktif" color="#3b82f6" />
              </div>
            </Card>

            {/* Kategori Horizontal Bar */}
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Per Kategori</h2>
              <div className="space-y-3">
                {KATEGORI_LIST.map((k, i) => {
                  const count = reportStats.byKategori[k] || 0;
                  const maxKat = Math.max(1, ...KATEGORI_LIST.map((kk) => reportStats.byKategori[kk] || 0));
                  const width = Math.round((count / maxKat) * 100);
                  return (
                    <div key={k}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <span aria-hidden="true">{KATEGORI_ICON[k]}</span>
                          {k}
                        </span>
                        <span className="font-semibold text-slate-900">{count}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${width}%`, backgroundColor: KATEGORI_COLORS[i % KATEGORI_COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* ── Monthly Trend ── */}
          {monthlyData.length > 1 && (
            <Card className="mb-6 p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Tren Bulanan</h2>
              <div className="flex items-end gap-1 overflow-x-auto pb-2" style={{ minHeight: 180 }}>
                {monthlyData.map((m, i) => (
                  <div key={i} className="flex min-w-[40px] flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-slate-700">{m.count}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-700"
                      style={{ height: `${Math.max(4, (m.count / maxMonthly) * 140)}px` }}
                    />
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">{m.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── Top 5 Kategori ── */}
          <Card className="mb-6 p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Top 5 Kategori Terbanyak</h2>
            <div className="space-y-3">
              {[...KATEGORI_LIST]
                .sort((a, b) => (reportStats.byKategori[b] || 0) - (reportStats.byKategori[a] || 0))
                .slice(0, 5)
                .filter((k) => (reportStats.byKategori[k] || 0) > 0)
                .map((k, i) => {
                  const count = reportStats.byKategori[k] || 0;
                  return (
                    <div key={k} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500">
                        {i + 1}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                        <span aria-hidden="true">{KATEGORI_ICON[k]}</span>
                        {k}
                      </span>
                      <span className="ml-auto rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                        {count} pengaduan
                      </span>
                    </div>
                  );
                })}
            </div>
          </Card>

          {/* ── Data Table ── */}
          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Daftar Pengaduan ({filtered.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">No</th>
                    <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">Tanggal</th>
                    <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">Pelapor</th>
                    <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">Kategori</th>
                    <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">Judul</th>
                    <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr
                      key={c.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50/60 last:border-b-0"
                    >
                      <td className="whitespace-nowrap px-5 py-3 text-slate-500">{i + 1}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-600">{formatDate(c.createdAt)}</td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-800">{c.pelaporNama}</div>
                        <div className="text-xs text-slate-400">{c.pelaporEmail}</div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <span aria-hidden="true">{KATEGORI_ICON[c.kategori]}</span>
                          {c.kategori}
                        </span>
                      </td>
                      <td className="max-w-[200px] truncate px-5 py-3 text-slate-800">{c.judul}</td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* ── Print footer ── */}
          <p className="mt-6 text-center text-xs text-slate-400 print:block hidden">
            Dicetak pada {formatDateTime(new Date().toISOString())} — Sistem Pengaduan Fakultas Ilmu Komputer
          </p>
        </>
      )}
    </div>
  );
}
