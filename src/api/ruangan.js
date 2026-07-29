import { mockClient } from './mockClient';

export async function getRuanganList() {
  const { data } = await mockClient.get('/ruangan');
  return data;
}
