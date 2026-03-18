import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [cargando, setCargando] = useState(true);

  // Al cargar la app, revisa si ya había una sesión guardada
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setCargando(false);
  }, [token]);

  const login = async (correo, password) => {
    try {
      // Conecta con el endpoint exacto que creaste en auth.controller.js
      const response = await api.post('/auth/login', { correo, password });
      const { token, usuario } = response.data;
      
      // Guardar en el navegador
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      
      // Actualizar el estado de React
      setToken(token);
      setUser(usuario);
      return true;
    } catch (error) {
      console.error("Error en login:", error.response?.data?.error || error.message);
      throw error.response?.data?.error || 'Error al iniciar sesión';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};