import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';
import { Spinner } from './UI';

export function homeForRole(role) {
  return role === ROLES.ADMIN ? '/admin/dashboard' : '/user/dashboard';
}

export function FullPageLoader({ label = 'Memuat…' }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Spinner className="h-7 w-7 text-brand-700" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function AccessDenied() {
  const { user } = useAuth();
  const home = homeForRole(user?.role);
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <span className="text-5xl" aria-hidden="true">
        🚫
      </span>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Akses ditolak</h1>
      <p className="mt-2 text-sm text-slate-500">
        Anda tidak memiliki izin untuk membuka halaman ini. Halaman ini hanya dapat diakses sesuai
        peran akun Anda.
      </p>
      <Link to={home} className="btn-primary mt-6">
        Kembali ke halaman saya
      </Link>
    </div>
  );
}

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader label="Memeriksa sesi…" />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    return <AccessDenied />;
  }

  return children;
}

export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader label="Memeriksa sesi…" />;

  if (user) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }

  return children;
}
