import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginRequest } from '../api/auth';
import { setAuthToken } from '../api/client';

const TOKEN_KEY = '@ruang_meeting_token';
const USER_KEY = '@ruang_meeting_user';

// ViewModel: handles auth state, exposes a clean interface to the View.
export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [booting, setBooting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);
      if (storedToken) {
        setAuthToken(storedToken);
        setToken(storedToken);
        setUser(storedUser ? JSON.parse(storedUser) : null);
      }
      setBooting(false);
    })();
  }, []);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginRequest(email, password);
      // Response shape not confirmed until tested live against the real API -
      // handle a few common shapes defensively instead of assuming one.
      const resolvedToken = data.token ?? data.data?.token ?? data.access_token;
      const resolvedUser = data.user ?? data.data?.user ?? data.data ?? null;

      if (!resolvedToken) {
        throw new Error('Login berhasil tapi token tidak ditemukan di response.');
      }

      setAuthToken(resolvedToken);
      await AsyncStorage.setItem(TOKEN_KEY, resolvedToken);
      if (resolvedUser) await AsyncStorage.setItem(USER_KEY, JSON.stringify(resolvedUser));

      setToken(resolvedToken);
      setUser(resolvedUser);
      return true;
    } catch (e) {
      setError(e.response?.data?.message ?? e.message ?? 'Login gagal');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setToken(null);
    setUser(null);
  }, []);

  return { user, token, booting, loading, error, isAuthenticated: !!token, signIn, signOut };
}
