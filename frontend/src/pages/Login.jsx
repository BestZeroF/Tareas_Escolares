import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login(correo, password);
      navigate('/');
    } catch (error) {
      setErrorMsg(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        {/* Panel Izquierdo: Branding (Azul ultra oscuro: blue-950) */}
        <div className="md:w-5/12 bg-blue-950 text-white p-10 flex flex-col justify-center items-center text-center">
          
          {/* Usamos scale-150 para hacerlo un 50% más grande y -mb-12 para pegarlo al texto */}
          <div className="w-full flex justify-center -mb-12">
            <Logo className="w-64 h-auto mb-10 text-white drop-shadow-lg transform scale-150" />
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 relative z-10">
            Educational <br className="hidden md:block" /> Sort
          </h1>
          <p className="text-blue-200 text-lg font-medium max-w-sm mt-2 relative z-10">
            Gestiona tus tareas escolares de forma inteligente y mantén tu vida académica organizada.
          </p>
        </div>

        {/* Panel Derecho: Formulario */}
        <div className="md:w-7/12 p-10 sm:p-14 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Iniciar Sesión</h2>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all placeholder-gray-400"
                placeholder="ejemplo@correo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all placeholder-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-950 text-white py-4 rounded-xl hover:bg-blue-900 shadow-lg focus:ring-4 focus:ring-blue-950/30 transition-all font-bold text-lg mt-8 tracking-wide"
            >
              Entrar al Dashboard
            </button>
          </form>

          <div className="mt-10 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-blue-950 hover:text-blue-800 hover:underline font-bold transition-colors">
              Regístrate aquí
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}