import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Logo from '../components/Logo';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [exitoMsg, setExitoMsg] = useState('');
  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        {/* Panel Izquierdo: Branding */}
        <div className="md:w-5/12 bg-blue-950 text-white p-10 flex flex-col justify-center items-center text-center">
          
          <div className="w-full flex justify-center -mb-12">
            <Logo className="w-64 mb-10 h-auto text-white drop-shadow-lg transform scale-150" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 relative z-10">
            Educational <br className="hidden md:block" /> Sort
          </h1>
          <p className="text-blue-200 text-lg font-medium max-w-sm mt-2 relative z-10">
            Comienza a organizar tu vida académica hoy mismo.
          </p>
        </div>

        {/* Panel Derecho: Formulario */}
        <div className="md:w-7/12 p-10 sm:p-14 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Crear una cuenta nueva</h2>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-medium">{errorMsg}</div>
          )}
          {exitoMsg && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-100 rounded-xl text-sm font-medium">{exitoMsg}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all placeholder-gray-400" placeholder="Ej. Juan Pérez" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
              <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all placeholder-gray-400" placeholder="ejemplo@correo.com" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all placeholder-gray-400" placeholder="••••••••" required />
            </div>
            <button type="submit" className="w-full bg-blue-950 text-white py-4 rounded-xl hover:bg-blue-900 shadow-lg focus:ring-4 focus:ring-blue-950/30 transition-all font-bold text-lg mt-6 tracking-wide">
              Registrarse
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta? <Link to="/login" className="text-blue-950 hover:text-blue-800 hover:underline font-bold transition-colors">Inicia sesión aquí</Link>
          </div>
        </div>

      </div>
    </div>
  );
}