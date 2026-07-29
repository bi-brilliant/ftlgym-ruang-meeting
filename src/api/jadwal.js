import { apiClient } from './client';

export async function getJadwalRuangan() {
  const { data } = await apiClient.get('/jadwalruangan');
  return data;
}
