import { api } from './client';

export function getTasks() {
  return api('/me/tasks');
}

export function completeTask(taskId) {
  return api(`/me/tasks/${taskId}/done`, { method: 'POST' });
}
