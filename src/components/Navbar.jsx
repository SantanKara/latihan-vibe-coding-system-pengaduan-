import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_NAME, APP_SUBTITLE } from '../utils/constants';
import { initials } from '../utils/format';

const icons = {
  dashboard: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10"
    />
  ),
  plus: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 5v14M5 12h14"
    />
  ),
  list: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"
    />
  ),
  user: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0"
    />
  ),
};

function Icon({ name, className = 'h-6 w-6' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const links = isAdmin
    ? [
        { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { to: '/admin/pengaduan', label: 'Semua Pengaduan', icon: 'list' },
      ]
    : [
        { to: '/user/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { to: '/user/buat', label: 'Buat Pengaduan', icon: 'plus' },
        { to: '/user/pengaduan', label: 'Pengaduan Saya', icon: 'list' },
      ];

  const profileLink = { to: '/profile', label: 'Profil', icon: 'user' };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div
          className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3"
          style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
        >
          <Link to={links[0].to} className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
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
                <path
                  d="M9 14v-3M12 14V9M15 14v-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-bold text-slate-900">{APP_NAME}</span>
              <span className="block truncate text-[11px] text-slate-500">{APP_SUBTITLE}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon name={link.icon} className="h-4 w-4" />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <NavLink
              to={profileLink.to}
              title="Profil"
              className={({ isActive }) =>
                `flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition ${
                  isActive ? 'ring-2 ring-brand-500' : ''
                }`
              }
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                {initials(user.nama)}
              </span>
              <span className="sr-only">Buka profil</span>
            </NavLink>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="btn-ghost px-2.5 md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label="Buka menu navigasi"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                {menuOpen ? (
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div id="mobile-menu" className="border-t border-slate-200 bg-white px-4 py-2 md:hidden">
            <p className="px-1 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Masuk sebagai {isAdmin ? 'Admin' : 'User'}
            </p>
            <p className="px-1 pb-2 text-sm font-medium text-slate-700">{user.nama}</p>
          </div>
        )}
      </header>

      <nav
        className="bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
        aria-label="Navigasi bawah"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-around">
          {[...links, profileLink].map((link) => (
            <li key={link.to} className="flex-1">
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 pt-1.5 text-[11px] font-medium transition ${
                    isActive ? 'text-brand-700' : 'text-slate-500'
                  }`
                }
              >
                <Icon name={link.icon} className="h-6 w-6" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
