import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Logo from '../components/Logo';
import { Sun, Moon } from 'lucide-react'; // IMPORTANTE: Importar iconos

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [exitoMsg, setExitoMsg] = useState('');
  const navigate = useNavigate();

  // NUEVO: Estado y función para modo oscuro
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(document.documentElement.classList.contains('dark'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setExitoMsg('');
    try {
      await api.post('/auth/register', { nombre, correo, password });
      setExitoMsg('¡Registro exitoso! Redirigiendo al inicio de sesión...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || 'Ocurrió un error al registrarse');
    }
  };

  return (
    // Estructura original: Agregamos dark:bg-gray-900 al fondo
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 sm:p-8 relative transition-colors">
      
      {/* NUEVO: Botón flotante Modo Oscuro */}
      <button 
        onClick={toggleTheme} 
        className="absolute top-6 right-6 p-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow-md hover:scale-110 transition-all border border-gray-100 dark:border-gray-700 z-10"
      >
        {isDark ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-blue-950" />}
      </button>

      {/* Estructura original: Agregamos dark:bg-gray-950 y dark:border-gray-800 */}
      <div className="max-w-5xl w-full bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 dark:border-gray-800 transition-colors">
        
        {/* Panel Izquierdo: Branding (Original Structure) */}
        <div className="md:w-5/12 bg-blue-950 text-white p-10 flex flex-col justify-center items-center text-center">
          
          <div className="w-full flex justify-center -mb-12">
            {/* Logo original con brightness-0 invert para que sea blanco en el panel oscuro */}
            <Logo className="w-64 mb-10 h-auto text-white drop-shadow-lg transform scale-150 brightness-0 invert" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 relative z-10">
            Educational <br className="hidden md:block" /> 
            {/* ÚNICO CAMBIO SOLICITADO AQUÍ: Sort en azul SOLO en modo oscuro */}
            <span className="text-white dark:text-blue-500">Sort</span>
          </h1>
          <p className="text-blue-200 text-lg font-medium max-w-sm mt-2 relative z-10">
            Comienza a organizar tu vida académica hoy mismo.
          </p>
        </div>

        {/* Panel Derecho: Formulario (Original Structure) */}
        <div className="md:w-7/12 p-10 sm:p-14 flex flex-col justify-center">
          {/* dark:text-white añadido */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Crear una cuenta nueva</h2>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/50 rounded-xl text-sm font-medium">{errorMsg}</div>
          )}
          {exitoMsg && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800/50 rounded-xl text-sm font-medium">{exitoMsg}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              {/* dark:text-gray-300 añadido */}
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nombre Completo</label>
              {/* Inputs con colores oscuros añadidos */}
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 dark:focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all placeholder-gray-400" placeholder="Ej. Juan Pérez" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Correo Electrónico</label>
              <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 dark:focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all placeholder-gray-400" placeholder="ejemplo@correo.com" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 dark:focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all placeholder-gray-400" placeholder="••••••••" required />
            </div>
            <button type="submit" className="w-full bg-blue-950 text-white py-4 rounded-xl hover:bg-blue-900 shadow-lg focus:ring-4 focus:ring-blue-950/30 transition-all font-bold text-lg mt-6 tracking-wide">
              Registrarse
            </button>
          </form>

          {/* dark:text-gray-400 añadido */}
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes cuenta? <Link to="/login" className="text-blue-950 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-bold transition-colors">Inicia sesión aquí</Link>
          </div>
        </div>

      </div>
    </div>
  );
}