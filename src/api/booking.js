import { mockClient } from './mockClient';

export async function submitBooking(payload) {
  const { data } = await mockClient.post('/booking', payload);
  return data;
}

export async function getBookings() {
  const { data } = await mockClient.get('/booking');
  return data;
}
