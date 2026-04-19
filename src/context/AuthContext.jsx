import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authApi from '../api/auth';
import { tokens } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  const loadProfile = useCallback(async () => {
    try {
      const me = await authApi.getMe();
      setUser(me);
      setStatus('authenticated');
      return me;
    } catch (err) {
      tokens.clear();
      setUser(null);
      setStatus('unauthenticated');
      return null;
    }
  }, []);

  useEffect(() => {
    if (tokens.access) {
      loadProfile();
    } else {
      setStatus('unauthenticated');
    }
  }, [loadProfile]);

  const login = useCallback(
    async (creds) => {
      await authApi.login(creds);
      return loadProfile();
    },
    [loadProfile]
  );

  const register = useCallback(async ({ username, password, email }) => {
    await authApi.register({ username, password, email });
    await authApi.login({ username, password });
    const me = await authApi.getMe();
    setUser(me);
    setStatus('authenticated');
    return me;
  }, []);

  const exchangeGoogle = useCallback(
    async (code) => {
      await authApi.exchangeGoogleCode(code);
      return loadProfile();
    },
    [loadProfile]
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const updateAvatar = useCallback(async (avatarId) => {
    const updated = await authApi.setAvatar(avatarId);
    setUser(updated);
    return updated;
  }, []);

  const updateUsername = useCallback(async (username) => {
    const updated = await authApi.setUsername(username);
    setUser(updated);
    return updated;
  }, []);

  const patchUser = useCallback((patch) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const value = {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    hasAvatar: !!(user && user.avatar && user.avatar > 0),
    login,
    register,
    exchangeGoogle,
    logout,
    updateAvatar,
    updateUsername,
    patchUser,
    refresh: loadProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
