const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TOKEN_KEY = 'hp.access_token';
const REFRESH_KEY = 'hp.refresh_token';

export const tokens = {
  get access() {
    return localStorage.getItem(TOKEN_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set({ access_token, refresh_token }) {
    if (access_token) localStorage.setItem(TOKEN_KEY, access_token);
    if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

function extractDetail(body) {
  if (!body) return null;
  if (typeof body === 'string') return body;
  if (typeof body.detail === 'string') return body.detail;
  if (Array.isArray(body.detail)) {
    return body.detail.map((d) => d.msg).filter(Boolean).join(', ');
  }
  return null;
}

async function refreshAccess() {
  const rt = tokens.refresh;
  if (!rt) return null;
  const res = await fetch(
    `${API_URL}/auth/refresh?refresh_token=${encodeURIComponent(rt)}`,
    { method: 'POST' }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (data.access_token) {
    tokens.set({ access_token: data.access_token });
    return data.access_token;
  }
  return null;
}

export async function api(path, { method = 'GET', body, query, auth = true, retry = true } = {}) {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
  }

  const headers = { 'Content-Type': 'application/json' };
  if (auth && tokens.access) headers.Authorization = `Bearer ${tokens.access}`;

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && retry && auth && tokens.refresh) {
    const newToken = await refreshAccess();
    if (newToken) return api(path, { method, body, query, auth, retry: false });
    tokens.clear();
  }

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    throw new ApiError(extractDetail(data) || `Request failed (${res.status})`, res.status, data);
  }
  return data;
}

export { API_URL };
