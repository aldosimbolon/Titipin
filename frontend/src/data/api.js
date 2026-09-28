// Client HTTP tipis untuk backend Titipin (Express + MongoDB).
// URL backend bisa diubah lewat frontend/.env -> VITE_API_URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'titipin_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new Error('Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.');
    err.status = 0;
    throw err;
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || `Request gagal (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return json.data ?? null;
}

export default request;
