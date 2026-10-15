import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import ProtectedRoute, { FullPageLoader, PublicOnlyRoute, homeForRole } from './components/ProtectedRoute';
import { ROLES } from './utils/constants';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UserDashboard from './pages/user/Dashboard';
import BuatPengaduan from './pages/user/BuatPengaduan';
import PengaduanSaya from './pages/user/PengaduanSaya';
import AdminDashboard from './pages/admin/Dashboard';
import SemuaPengaduan from './pages/admin/SemuaPengaduan';
import DetailPengaduan from './pages/admin/DetailPengaduan';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="app-shell mx-auto w-full max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader label="Memuat…" />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homeForRole(user.role)} replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ComplaintProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />

            <Route element={<AppLayout />}>
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/user/dashboard"
                element={
                  <ProtectedRoute role={ROLES.USER}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/buat"
                element={
                  <ProtectedRoute role={ROLES.USER}>
                    <BuatPengaduan />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/pengaduan"
                element={
                  <ProtectedRoute role={ROLES.USER}>
                    <PengaduanSaya />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute role={ROLES.ADMIN}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pengaduan"
                element={
                  <ProtectedRoute role={ROLES.ADMIN}>
                    <SemuaPengaduan />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pengaduan/:id"
                element={
                  <ProtectedRoute role={ROLES.ADMIN}>
                    <DetailPengaduan />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ComplaintProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
