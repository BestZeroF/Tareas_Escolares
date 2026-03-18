import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // La ruta base de tu backend
});

// Interceptor: Antes de que salga cualquier petición, revisa si hay un token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // El formato exacto que pide tu backend
  }
  return config;
});

export default api;