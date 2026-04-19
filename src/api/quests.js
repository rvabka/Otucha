import { api, API_URL, tokens } from './client';

export function getQuests() {
  return api('/rag/quests');
}

export function getActiveQuest() {
  return api('/rag/quests/active');
}

export function completeQuest(questId) {
  return api(`/rag/quests/${questId}/done`, { method: 'POST' });
}

export async function fetchTTSBlob({ text, agentId = 'mindbuddy' }) {
  const headers = { 'Content-Type': 'application/json' };
  if (tokens.access) headers.Authorization = `Bearer ${tokens.access}`;
  const res = await fetch(`${API_URL}/rag/tts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, agent_id: agentId }),
  });
  if (!res.ok) throw new Error(`TTS failed: ${res.status}`);
  return res.blob();
}
