import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useToast } from '../../components/Toast';
import { Card, Field, Input, PageHeader, Select, Spinner, Textarea } from '../../components/UI';
import { KATEGORI_LIST } from '../../utils/constants';
import { formatDate } from '../../utils/format';
import { validateDeskripsi, validateJudul, validateKategori } from '../../utils/validators';

export default function BuatPengaduan() {
  const { createComplaint } = useComplaints();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ judul: '', kategori: '', deskripsi: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {
      judul: validateJudul(form.judul),
      kategori: validateKategori(form.kategori),
      deskripsi: validateDeskripsi(form.deskripsi),
    };
    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    try {
      createComplaint(form);
      toast.success('Pengaduan berhasil dikirim.');
      navigate('/user/pengaduan');
    } catch (err) {
      toast.error(err.message || 'Gagal mengirim pengaduan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Buat Pengaduan"
        description="Sampaikan keluhan atau masukan Anda secara jelas dan sopan."
      />

      <Card className="p-5 sm:p-6">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Field
            label="Judul Pengaduan"
            htmlFor="judul"
            error={errors.judul}
            hint="Contoh: AC di Lab Komputer 3 tidak menyala."
            required
          >
            <Input
              id="judul"
              name="judul"
              type="text"
              placeholder="Tuliskan judul singkat"
              value={form.judul}
              onChange={onChange}
              error={errors.judul}
              maxLength={120}
              disabled={submitting}
            />
          </Field>

          <Field label="Kategori" htmlFor="kategori" error={errors.kategori} required>
            <Select
              id="kategori"
              name="kategori"
              value={form.kategori}
              onChange={onChange}
              error={errors.kategori}
              disabled={submitting}
            >
              <option value="">Pilih kategori…</option>
              {KATEGORI_LIST.map((kategori) => (
                <option key={kategori} value={kategori}>
                  {kategori}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Deskripsi"
            htmlFor="deskripsi"
            error={errors.deskripsi}
            hint={`Jelaskan detail kejadian, lokasi, dan waktu. ${form.deskripsi.length}/2000 karakter.`}
            required
          >
            <Textarea
              id="deskripsi"
              name="deskripsi"
              placeholder="Tuliskan deskripsi pengaduan Anda…"
              value={form.deskripsi}
              onChange={onChange}
              error={errors.deskripsi}
              maxLength={2000}
              disabled={submitting}
            />
          </Field>

          <Field label="Tanggal" htmlFor="tanggal" hint="Tanggal otomatis mengikuti waktu pengiriman.">
            <Input id="tanggal" type="text" value={formatDate(new Date())} readOnly disabled />
          </Field>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/user/dashboard')}
              disabled={submitting}
            >
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner className="h-4 w-4" /> Mengirim…
                </>
              ) : (
                'Kirim Pengaduan'
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
