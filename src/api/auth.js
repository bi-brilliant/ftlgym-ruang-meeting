import { apiClient } from './client';

export async function login(email, password) {
  const { data } = await apiClient.post('/login', { email, password });
  return data;
}
