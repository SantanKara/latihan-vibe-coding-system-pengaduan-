import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { homeForRole } from '../../components/ProtectedRoute';
import { Field, Input, PasswordInput, Spinner } from '../../components/UI';
import { APP_NAME, APP_SUBTITLE } from '../../utils/constants';
import { validateEmail } from '../../utils/validators';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const next = {};
    next.email = validateEmail(form.email);
    if (!form.password) next.password = 'Password wajib diisi.';
    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');
    try {
      const user = await login(form);
      toast.success(`Selamat datang kembali, ${user.nama}!`);
      const from = location.state?.from;
      const target = from && from.startsWith(homeForRole(user.role)) ? from : homeForRole(user.role);
      navigate(target, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Gagal masuk. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
              <path
                d="M12 3 4 7v5c0 4.5 3.1 7.7 8 9 4.9-1.3 8-4.5 8-9V7l-8-4Z"
                fill="currentColor"
                opacity="0.25"
              />
              <path
                d="M12 3 4 7v5c0 4.5 3.1 7.7 8 9 4.9-1.3 8-4.5 8-9V7l-8-4Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M9 14v-3M12 14V9M15 14v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">{APP_NAME}</h1>
          <p className="text-sm text-slate-500">{APP_SUBTITLE}</p>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900">Masuk ke akun Anda</h2>
          <p className="mt-1 text-sm text-slate-500">Gunakan email dan password yang terdaftar.</p>

          {serverError && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
            >
              {serverError}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
            <Field label="Email" htmlFor="email" error={errors.email} required>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="nama@filkom.local"
                value={form.email}
                onChange={onChange}
                error={errors.email}
                disabled={submitting}
              />
            </Field>

            <Field label="Password" htmlFor="password" error={errors.password} required>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                placeholder="Masukkan password"
                value={form.password}
                onChange={onChange}
                error={errors.password}
                disabled={submitting}
              />
            </Field>

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner className="h-4 w-4" /> Memproses…
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
          <p className="font-semibold text-slate-600">Akun demo</p>
          <p className="mt-1">Admin: admin@filkom.local / Admin12345</p>
          <p>User: user@filkom.local / User12345</p>
        </div>
      </div>
    </div>
  );
}
