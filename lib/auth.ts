import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'sih_admin_session';

export function verifyAdminSession(): boolean {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || 'sih2026admin@dsmnru';
  
  if (!sessionToken) return false;
  
  // Simple token matching base64 hash or plain password string for simple session verification
  return sessionToken === Buffer.from(adminPassword).toString('base64');
}

export function createAdminSessionToken(password: string): string | null {
  const adminPassword = process.env.ADMIN_PASSWORD || 'sih2026admin@dsmnru';
  if (password === adminPassword) {
    return Buffer.from(adminPassword).toString('base64');
  }
  return null;
}

export { ADMIN_COOKIE_NAME };
