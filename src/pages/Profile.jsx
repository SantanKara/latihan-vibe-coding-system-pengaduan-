import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { Card, Field, Input, PageHeader, PasswordInput, Spinner } from '../components/UI';
import { formatDateTime, initials } from '../utils/format';
import { validateEmail, validateNama } from '../utils/validators';

export default function Profile() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({ nama: user?.nama || '', email: user?.email || '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passErrors, setPassErrors] = useState({});
  const [savingPass, setSavingPass] = useState(false);

  const [logoutOpen, setLogoutOpen] = useState(false);

  const onProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const onPassChange = (e) => {
    const { name, value } = e.target;
    setPassForm((prev) => ({ ...prev, [name]: value }));
    setPassErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    if (savingProfile) return;

    const errors = {
      nama: validateNama(profileForm.nama),
      email: validateEmail(profileForm.email),
    };
    setProfileErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    if (
      profileForm.nama.trim() === user.nama &&
      profileForm.email.trim().toLowerCase() === user.email
    ) {
      toast.info('Tidak ada perubahan untuk disimpan.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      toast.success('Profil berhasil diperbarui.');
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui profil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (savingPass) return;

    setSavingPass(true);
    try {
      await changePassword(passForm);
      toast.success('Password berhasil diubah.');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPassErrors({});
    } catch (err) {
      toast.error(err.message || 'Gagal mengubah password.');
    } finally {
      setSavingPass(false);
    }
  };

  const confirmLogout = () => {
    setLogoutOpen(false);
    logout();
    toast.success('Anda telah keluar.');
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Profil Saya" description="Kelola informasi akun dan keamanan Anda." />

      <Card className="mb-5 p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-xl font-bold text-brand-800">
            {initials(user.nama)}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-slate-900">{user.nama}</h2>
            <p className="truncate text-sm text-slate-500">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
              {user.role === 'admin' ? 'Administrator' : 'Pengguna'}
            </span>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Akun dibuat {formatDateTime(user.createdAt)}
        </p>
      </Card>

      <Card className="mb-5 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">Informasi Akun</h2>
        <form onSubmit={submitProfile} className="mt-4 space-y-4" noValidate>
          <Field label="Nama Lengkap" htmlFor="nama" error={profileErrors.nama} required>
            <Input
              id="nama"
              name="nama"
              value={profileForm.nama}
              onChange={onProfileChange}
              error={profileErrors.nama}
              disabled={savingProfile}
            />
          </Field>
          <Field label="Email" htmlFor="email" error={profileErrors.email} required>
            <Input
              id="email"
              name="email"
              type="email"
              value={profileForm.email}
              onChange={onProfileChange}
              error={profileErrors.email}
              disabled={savingProfile}
            />
          </Field>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={savingProfile}>
              {savingProfile ? (
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

      <Card className="mb-5 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">Ubah Password</h2>
        <form onSubmit={submitPassword} className="mt-4 space-y-4" noValidate>
          <Field label="Password Lama" htmlFor="currentPassword" error={passErrors.currentPassword} required>
            <PasswordInput
              id="currentPassword"
              name="currentPassword"
              autoComplete="current-password"
              value={passForm.currentPassword}
              onChange={onPassChange}
              error={passErrors.currentPassword}
              disabled={savingPass}
            />
          </Field>
          <Field
            label="Password Baru"
            htmlFor="newPassword"
            error={passErrors.newPassword}
            hint="Minimal 8 karakter."
            required
          >
            <PasswordInput
              id="newPassword"
              name="newPassword"
              autoComplete="new-password"
              value={passForm.newPassword}
              onChange={onPassChange}
              error={passErrors.newPassword}
              disabled={savingPass}
            />
          </Field>
          <Field
            label="Konfirmasi Password Baru"
            htmlFor="confirmPassword"
            error={passErrors.confirmPassword}
            required
          >
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              value={passForm.confirmPassword}
              onChange={onPassChange}
              error={passErrors.confirmPassword}
              disabled={savingPass}
            />
          </Field>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={savingPass}>
              {savingPass ? (
                <>
                  <Spinner className="h-4 w-4" /> Menyimpan…
                </>
              ) : (
                'Ubah Password'
              )}
            </button>
          </div>
        </form>
      </Card>

      <Card className="border-red-200 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">Keluar Akun</h2>
        <p className="mt-1 text-sm text-slate-500">
          Sesi login Anda akan dihapus dari perangkat ini.
        </p>
        <button type="button" className="btn-danger mt-4" onClick={() => setLogoutOpen(true)}>
          Logout
        </button>
      </Card>

      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Konfirmasi Logout"
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setLogoutOpen(false)}>
              Batal
            </button>
            <button type="button" className="btn-danger" onClick={confirmLogout}>
              Ya, Logout
            </button>
          </>
        }
      >
        <p>Apakah Anda yakin ingin keluar dari akun ini?</p>
      </Modal>
    </div>
  );
}
