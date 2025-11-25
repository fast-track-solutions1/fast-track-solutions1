import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

export const authAPI = {
  login: (username, password) =>
    axios.post(API_BASE_URL + '/token/', { username, password }),
};

export const salariesAPI = {
  list: () => apiClient.get('/salaries/'),
  get: (id) => apiClient.get('/salaries/' + id + '/'),
  create: (data) => apiClient.post('/salaries/', data),
  update: (id, data) => apiClient.put('/salaries/' + id + '/', data),
  delete: (id) => apiClient.delete('/salaries/' + id + '/'),
};

export default apiClient;
