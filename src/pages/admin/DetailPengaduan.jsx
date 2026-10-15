import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useToast } from '../../components/Toast';
import StatusBadge from '../../components/StatusBadge';
import { Card, ErrorState, Field, LoadingState, Select, Spinner, Textarea } from '../../components/UI';
import { KATEGORI_ICON, STATUS_LIST } from '../../utils/constants';
import { formatDateTime } from '../../utils/format';

export default function DetailPengaduan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { getById, updateComplaint, loading, refresh } = useComplaints();

  const complaint = getById(id);

  const [status, setStatus] = useState('');
  const [tanggapan, setTanggapan] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status);
      setTanggapan(complaint.tanggapan || '');
    }
  }, [complaint?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <LoadingState label="Memuat detail pengaduan…" />;

  if (!complaint) {
    return (
      <div className="mx-auto max-w-xl">
        <ErrorState
          icon="🔍"
          title="Pengaduan tidak ditemukan"
          description="Pengaduan mungkin telah dihapus atau tautan tidak valid."
          action={
            <Link to="/admin/pengaduan" className="btn-secondary">
              Kembali ke daftar
            </Link>
          }
        />
      </div>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (status !== complaint.status && !tanggapan.trim() && !complaint.tanggapan) {
      toast.warning('Mohon isi tanggapan sebelum mengubah status pengaduan.');
      return;
    }

    setSaving(true);
    try {
      updateComplaint(complaint.id, { status, tanggapan });
      toast.success('Pengaduan berhasil diperbarui.');
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui pengaduan.');
      refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button type="button" onClick={() => navigate(-1)} className="btn-ghost mb-3 -ml-2 px-2">
        ← Kembali
      </button>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2 text-xs text-slate-500">
              <span aria-hidden="true">{KATEGORI_ICON[complaint.kategori] || '📌'}</span>
              <span className="font-medium text-slate-600">{complaint.kategori}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{complaint.judul}</h1>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        <dl className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Pelapor</dt>
            <dd className="font-medium text-slate-800">{complaint.pelaporNama}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-800">{complaint.pelaporEmail}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Dibuat</dt>
            <dd className="font-medium text-slate-800">{formatDateTime(complaint.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Terakhir diperbarui</dt>
            <dd className="font-medium text-slate-800">{formatDateTime(complaint.updatedAt)}</dd>
          </div>
        </dl>

        <div className="mt-5">
          <h2 className="text-sm font-semibold text-slate-700">Deskripsi</h2>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {complaint.deskripsi}
          </p>
        </div>
      </Card>

      <Card className="mt-5 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">Tindak Lanjut</h2>
        <p className="mt-1 text-sm text-slate-500">
          Ubah status dan berikan tanggapan untuk pengaduan ini.
        </p>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <Field label="Status" htmlFor="status" required>
            <Select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={saving}
            >
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Tanggapan Admin"
            htmlFor="tanggapan"
            hint={`${tanggapan.length}/1000 karakter.`}
          >
            <Textarea
              id="tanggapan"
              value={tanggapan}
              onChange={(e) => setTanggapan(e.target.value)}
              maxLength={1000}
              placeholder="Tuliskan tanggapan atau tindakan yang akan dilakukan…"
              disabled={saving}
            />
          </Field>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Link to="/admin/pengaduan" className="btn-secondary">
              Batal
            </Link>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <Spinner className="h-4 w-4" /> Menyimpan…
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
