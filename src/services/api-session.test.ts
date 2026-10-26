import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Meniru peramban yang MEMBLOKIR localStorage pada iframe lintas-situs
 * (penyebab kasus "login diterima server tapi tidak bisa masuk dashboard"):
 * setiap akses penyimpanan melempar SecurityError.
 */
(globalThis as any).localStorage = {
  getItem() { throw new Error('SecurityError: storage blocked'); },
  setItem() { throw new Error('SecurityError: storage blocked'); },
  removeItem() { throw new Error('SecurityError: storage blocked'); },
};

const api = await import('./api.ts');

const user = {
  id: 'u1', username: 'superadmin', name: 'Super Admin SYSJEGER',
  role: 'Super Admin' as const, status: 'Aktif' as const,
};

test('token sesi tetap tersimpan di memori walau localStorage diblokir', () => {
  api.setAuthSession('token-uji-123', user);
  assert.equal(api.getAuthToken(), 'token-uji-123');
  assert.equal(api.getStoredUser()?.username, 'superadmin');

  api.clearAuthSession();
  assert.equal(api.getAuthToken(), null);
  assert.equal(api.getStoredUser(), null);
});

test('sesi juga dicerminkan ke localStorage bila penyimpanan tersedia', () => {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
    removeItem: (k: string) => { store.delete(k); },
  };

  api.setAuthSession('token-persist', user);
  assert.equal(store.get('sysjeger_token'), 'token-persist');
  assert.ok(store.get('sysjeger_user')?.includes('superadmin'));

  api.clearAuthSession();
  assert.equal(store.has('sysjeger_token'), false);
});
