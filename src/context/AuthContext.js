import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginRequest } from '../api/auth';

const SESSION_KEY = '@ruang_meeting_session';

function displayNameFromEmail(email) {
  const local = email.split('@')[0] ?? 'User';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

const AuthContext = createContext(null);

// Holds auth state in one place, shared across every screen via Context -
// screens on a native-stack navigator stay mounted underneath each other
// (Login stays alive under Home, etc.), so a plain per-screen hook would give
// each screen its own disconnected copy of `user`/`isAuthenticated` instead
// of one source of truth.
//
// NOTE: the UAT test login endpoint (`/test/login`) only returns
// `{ status: "success", data: [] }` on valid credentials - no token, no user
// object. There is nothing to send as a Bearer token to other endpoints, so
// this treats a "success" status as the auth signal itself and persists a
// lightweight local session (not a real token) for navigation/auto-login
// purposes. The display name is derived from the email since the API doesn't
// provide one.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(SESSION_KEY);
      if (stored) setUser(JSON.parse(stored));
      setBooting(false);
    })();
  }, []);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginRequest(email, password);
      if (data.status !== 'success') {
        throw new Error(data.message ?? 'Login gagal');
      }
      const sessionUser = { name: displayNameFromEmail(email), role: 'Web Developer', email };
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);
      return true;
    } catch (e) {
      setError(e.response?.data?.message ?? e.message ?? 'Login gagal');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, booting, loading, error, isAuthenticated: !!user, signIn, signOut }),
    [user, booting, loading, error, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
