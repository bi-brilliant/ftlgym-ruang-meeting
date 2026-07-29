import { mockClient } from './mockClient';

export async function submitBooking(payload) {
  const { data } = await mockClient.post('/booking', payload);
  return data;
}
