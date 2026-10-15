import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';

export default function NotFound() {
  const { user } = useAuth();
  const home = user
    ? user.role === ROLES.ADMIN
      ? '/admin/dashboard'
      : '/user/dashboard'
    : '/login';

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl font-black text-brand-700">404</span>
      <h1 className="mt-3 text-xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <Link to={home} className="btn-primary mt-6">
        Kembali ke beranda
      </Link>
    </div>
  );
}
