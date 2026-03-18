import axios from 'axios';

const api = axios.create({
  // Cambiamos 'localhost' por la IP de tu computadora en la red Wi-Fi
  baseURL: 'http://192.168.1.233:3000/api', 
});

// Interceptor: Antes de que salga cualquier petición, revisa si hay un token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; 
  }
  return config;
});

export default api;