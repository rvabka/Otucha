import { api } from './client';

export function listFriends() {
  return api('/friends');
}

export function listFriendRequests() {
  return api('/friends/requests');
}

export function sendFriendRequest(username) {
  return api('/friends/requests', {
    method: 'POST',
    body: { username },
  });
}

export function acceptFriendRequest(requestId) {
  return api(`/friends/requests/${requestId}/accept`, { method: 'POST' });
}

export function declineFriendRequest(requestId) {
  return api(`/friends/requests/${requestId}/decline`, { method: 'POST' });
}

export function cancelFriendRequest(requestId) {
  return api(`/friends/requests/${requestId}`, { method: 'DELETE' });
}

export function searchUsers(query) {
  return api('/friends/search', { query: { q: query } });
}

export function getFriendProfile(friendId) {
  return api(`/friends/${friendId}`);
}

export function removeFriend(friendId) {
  return api(`/friends/${friendId}`, { method: 'DELETE' });
}
