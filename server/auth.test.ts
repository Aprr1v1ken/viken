import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, isHashedPassword, signToken, verifyPassword, verifyToken } from './auth.ts';

test('hashPassword menghasilkan hash scrypt yang dapat diverifikasi', () => {
  const stored = hashPassword('admin123');
  assert.ok(isHashedPassword(stored));
  assert.ok(!stored.includes('admin123'));
  assert.deepEqual(verifyPassword('admin123', stored), { ok: true, needsRehash: false });
  assert.equal(verifyPassword('salah', stored).ok, false);
});

test('hashPassword memakai salt acak (hasil berbeda untuk kata sandi sama)', () => {
  assert.notEqual(hashPassword('sama'), hashPassword('sama'));
});

test('kata sandi lama (teks polos) tetap valid dan ditandai perlu ditingkatkan', () => {
  assert.deepEqual(verifyPassword('admin123', 'admin123'), { ok: true, needsRehash: true });
  assert.equal(verifyPassword('lain', 'admin123').ok, false);
});

test('token sesi dapat diverifikasi dan memuat identitas pengguna', () => {
  const token = signToken({ id: 'u2', username: 'admingereja', name: 'Admin Gereja', role: 'Admin Gereja' });
  const user = verifyToken(token);
  assert.deepEqual(user, { id: 'u2', username: 'admingereja', name: 'Admin Gereja', role: 'Admin Gereja' });
});

test('token yang diubah atau rusak ditolak', () => {
  const token = signToken({ id: 'u5', username: 'jemaat1', name: 'Jemaat', role: 'Jemaat' });
  const [header, , signature] = token.split('.');
  const forgedPayload = Buffer.from(
    JSON.stringify({ sub: 'u1', username: 'superadmin', name: 'X', role: 'Super Admin', exp: 9999999999 })
  ).toString('base64url');
  assert.equal(verifyToken(`${header}.${forgedPayload}.${signature}`), null);
  assert.equal(verifyToken('bukan-token'), null);
  assert.equal(verifyToken(''), null);
});
