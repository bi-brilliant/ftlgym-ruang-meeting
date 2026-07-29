import axios from 'axios';

// Backend I stood up for endpoints missing from the real FTL API
// (room list + booking submit) - deployed separately from uat-api.ftlgym.com.
export const mockClient = axios.create({
  baseURL: 'http://185.249.225.48:4001/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});
