import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://uat-api.ftlgym.com/api/v1/test',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export function setAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}
