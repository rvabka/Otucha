import { api, tokens, API_URL } from './client';

export function register({ username, password, email }) {
  const body = { username, password };
  if (email) body.email = email;
  return api('/auth/register', { method: 'POST', body, auth: false });
}

export async function login({ username, password }) {
  const data = await api('/auth/login', {
    method: 'POST',
    body: { username, password },
    auth: false,
  });
  tokens.set(data);
  return data;
}

export async function exchangeGoogleCode(code) {
  const data = await api('/auth/google', {
    method: 'POST',
    body: { code },
    auth: false,
  });
  tokens.set(data);
  return data;
}

export async function fetchGoogleAuthUrl() {
  return api('/auth/google/login', { auth: false });
}

export async function logout() {
  try {
    await api('/auth/logout', { method: 'POST' });
  } catch {
    // ignore — we clear locally anyway
  }
  tokens.clear();
}

export function getMe() {
  return api('/me');
}

export function setAvatar(avatar) {
  return api('/me/avatar', { method: 'POST', body: { avatar } });
}

export function setUsername(username) {
  return api('/me/username', { method: 'POST', body: { username } });
}

export function getJournal() {
  return api('/me/journal');
}

export function createJournalEntry({ title, content, mood }) {
  return api('/me/journal', { method: 'POST', body: { title, content, mood } });
}

export function deleteJournalEntry(id) {
  return api(`/me/journal/${id}`, { method: 'DELETE' });
}

export function updateJournalEntry(id, { title, content, mood }) {
  return api(`/me/journal/${id}`, { method: 'PUT', body: { title, content, mood } });
}

export { API_URL, tokens };
