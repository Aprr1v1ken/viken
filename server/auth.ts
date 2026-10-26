/**
 * Autentikasi SYSJEGER V2.0
 * - Kata sandi disimpan sebagai hash scrypt (node:crypto), bukan teks polos.
 * - Sesi memakai token bertanda tangan HMAC-SHA256 (format mirip JWT).
 * - Kata sandi lama (teks polos pada database versi awal) tetap dapat dipakai
 *   untuk login satu kali, lalu otomatis ditingkatkan menjadi hash.
 */
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

// Muat berkas .env bila ada (SESSION_SECRET, SYSJEGER_DB_PATH, dll.)
try {
  process.loadEnvFile?.('.env');
} catch {
  /* tidak ada berkas .env — gunakan variabel lingkungan sistem */
}

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

const TOKEN_TTL_SECONDS = 12 * 60 * 60; // 12 jam

let warnedAboutSecret = false;
function getSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (!warnedAboutSecret) {
      warnedAboutSecret = true;
      console.warn(
        '[SYSJEGER] PERINGATAN: SESSION_SECRET belum diatur. Menggunakan kunci pengembangan bawaan — wajib diatur di lingkungan produksi (lihat .env.example).'
      );
    }
    return 'sysjeger-kunci-pengembangan-ganti-di-produksi';
  }
  return secret;
}

/* ------------------------------------------------------------------ */
/* Kata sandi                                                          */
/* ------------------------------------------------------------------ */

const SCRYPT_PREFIX = 'scrypt$';

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${SCRYPT_PREFIX}${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function isHashedPassword(stored: string): boolean {
  return typeof stored === 'string' && stored.startsWith(SCRYPT_PREFIX);
}

export interface VerifyResult {
  ok: boolean;
  /** true bila kata sandi tersimpan masih format lama dan perlu ditingkatkan */
  needsRehash: boolean;
}

export function verifyPassword(password: string, stored: string): VerifyResult {
  if (!stored) return { ok: false, needsRehash: false };

  if (isHashedPassword(stored)) {
    const [, saltHex, hashHex] = stored.split('$');
    try {
      const expected = Buffer.from(hashHex, 'hex');
      const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
      return { ok: expected.length === actual.length && timingSafeEqual(expected, actual), needsRehash: false };
    } catch {
      return { ok: false, needsRehash: false };
    }
  }

  // Format lama (teks polos) — bandingkan secara aman sebisa mungkin.
  const a = Buffer.from(password);
  const b = Buffer.from(stored);
  const ok = a.length === b.length && timingSafeEqual(a, b);
  return { ok, needsRehash: ok };
}

/* ------------------------------------------------------------------ */
/* Token sesi (HMAC-SHA256, format header.payload.signature)          */
/* ------------------------------------------------------------------ */

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

export function signToken(user: SessionUser): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(
    JSON.stringify({
      sub: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      iat: now,
      exp: now + TOKEN_TTL_SECONDS,
    })
  );
  const signature = createHmac('sha256', getSecret()).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): SessionUser | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;

  const expected = createHmac('sha256', getSecret()).update(`${header}.${payload}`).digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.sub || !data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return { id: data.sub, username: data.username, name: data.name, role: data.role };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Middleware Express                                                  */
/* ------------------------------------------------------------------ */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

/** Rute publik (dapat diakses tanpa login) untuk halaman web publik. */
const PUBLIC_ROUTES: Array<[string, string]> = [
  ['POST', '/auth/login'],
  ['GET', '/announcements'],
  ['GET', '/events'],
  ['GET', '/public/stats'],
  ['GET', '/health'],
];

export function authGate(req: Request, res: Response, next: NextFunction) {
  if (PUBLIC_ROUTES.some(([method, path]) => req.method === method && req.path === path)) {
    return next();
  }
  return requireAuth(req, res, next);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
  const user = token ? verifyToken(token) : null;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Sesi tidak ditemukan atau telah berakhir. Silakan masuk kembali.',
    });
  }
  req.user = user;
  return next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: tindakan ini khusus untuk peran ${roles.join(' / ')}.`,
      });
    }
    return next();
  };
}
