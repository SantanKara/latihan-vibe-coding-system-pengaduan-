import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearSession,
  ensureSeed,
  findUserByEmail,
  findUserById,
  getSession,
  insertUser,
  setSession,
  updateUserById,
} from '../utils/storage';
import { hashPassword, verifyPassword } from '../utils/hash';
import {
  normalizeEmail,
  normalizeText,
  validateConfirmPassword,
  validateEmail,
  validateNama,
  validatePassword,
} from '../utils/validators';
import { generateId } from '../utils/format';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

function toPublicUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        await ensureSeed();
        const session = getSession();
        if (session?.userId) {
          const found = findUserById(session.userId);
          if (found && active) setUser(toPublicUser(found));
          else clearSession();
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const register = useCallback(async ({ nama, email, password, confirmPassword }) => {
    const namaError = validateNama(nama);
    if (namaError) throw new Error(namaError);

    const emailError = validateEmail(email);
    if (emailError) throw new Error(emailError);

    const passwordError = validatePassword(password);
    if (passwordError) throw new Error(passwordError);

    const confirmError = validateConfirmPassword(password, confirmPassword);
    if (confirmError) throw new Error(confirmError);

    const normalizedEmail = normalizeEmail(email);
    if (findUserByEmail(normalizedEmail)) {
      throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau login.');
    }

    const newUser = {
      id: generateId('usr'),
      nama: normalizeText(nama),
      email: normalizedEmail,
      role: ROLES.USER,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    insertUser(newUser);
    return toPublicUser(newUser);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const emailError = validateEmail(email);
    if (emailError) throw new Error(emailError);
    if (!password) throw new Error('Password wajib diisi.');

    const found = findUserByEmail(email);
    if (!found) throw new Error('Email belum terdaftar.');

    const ok = await verifyPassword(password, found.passwordHash);
    if (!ok) throw new Error('Password salah. Silakan coba lagi.');

    const session = {
      userId: found.id,
      loginAt: new Date().toISOString(),
    };
    setSession(session);
    setUser(toPublicUser(found));
    return toPublicUser(found);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    ({ nama, email }) => {
      if (!user) throw new Error('Sesi tidak ditemukan. Silakan login kembali.');

      const namaError = validateNama(nama);
      if (namaError) throw new Error(namaError);

      const emailError = validateEmail(email);
      if (emailError) throw new Error(emailError);

      const normalizedEmail = normalizeEmail(email);
      const existing = findUserByEmail(normalizedEmail);
      if (existing && existing.id !== user.id) {
        throw new Error('Email sudah digunakan akun lain.');
      }

      const updated = updateUserById(user.id, {
        nama: normalizeText(nama),
        email: normalizedEmail,
        updatedAt: new Date().toISOString(),
      });

      setUser(toPublicUser(updated));
      return toPublicUser(updated);
    },
    [user]
  );

  const changePassword = useCallback(
    async ({ currentPassword, newPassword, confirmPassword }) => {
      if (!user) throw new Error('Sesi tidak ditemukan. Silakan login kembali.');

      if (!currentPassword) throw new Error('Password lama wajib diisi.');

      const stored = findUserById(user.id);
      if (!stored) throw new Error('Akun tidak ditemukan.');

      const ok = await verifyPassword(currentPassword, stored.passwordHash);
      if (!ok) throw new Error('Password lama tidak sesuai.');

      const newError = validatePassword(newPassword);
      if (newError) throw new Error(newError);

      const confirmError = validateConfirmPassword(newPassword, confirmPassword);
      if (confirmError) throw new Error(confirmError);

      if (currentPassword === newPassword) {
        throw new Error('Password baru tidak boleh sama dengan password lama.');
      }

      updateUserById(user.id, {
        passwordHash: await hashPassword(newPassword),
        updatedAt: new Date().toISOString(),
      });

      return true;
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === ROLES.ADMIN,
      isUser: user?.role === ROLES.USER,
      register,
      login,
      logout,
      updateProfile,
      changePassword,
    }),
    [user, loading, register, login, logout, updateProfile, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
