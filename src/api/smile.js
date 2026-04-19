import { api } from './client';

export function claimSmileReward() {
  return api('/me/smile', { method: 'POST' });
}
