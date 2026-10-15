const APP_SALT = 'sp-filkom::v1';

function fallbackHash(text) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part = (n) => (n >>> 0).toString(16).padStart(8, '0');
  return `fallback$${part(h1)}${part(h2)}${part(h1 ^ h2)}`;
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Menghasilkan hash SHA-256 dari password + salt aplikasi.
 * Jika Web Crypto tidak tersedia (konteks non-secure), dipakai fallback
 * deterministik agar aplikasi tetap berjalan.
 */
export async function hashPassword(password) {
  const raw = `${APP_SALT}::${password}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      return await sha256Hex(raw);
    } catch {
      return fallbackHash(raw);
    }
  }
  return fallbackHash(raw);
}

export async function verifyPassword(password, hash) {
  if (!hash) return false;
  const computed = await hashPassword(password);
  return computed === hash;
}
