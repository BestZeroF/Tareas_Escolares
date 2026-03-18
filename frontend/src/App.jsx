import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

// Páginas y Componentes Principales
import Login from './pages/Login';
import Registro from './pages/Registro';
import Layout from './components/Layout';
import Periodos from './pages/Periodos'; // <-- Tu nuevo CRUD real
import Materias from './pages/Materias';
import Tareas from './pages/Tareas';
import Horarios from './pages/Horarios';

// Componente para proteger las rutas
const RutaPrivada = ({ children }) => {
  const { user, cargando } = useContext(AuthContext);
  
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-blue-950 font-bold text-xl">
        Cargando...
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Vistas Temporales (Las iremos reemplazando una por una con tus CRUDs reales)
const Inicio = () => <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"><h1 className="text-2xl font-bold text-gray-900">Dashboard y Calendario</h1><p className="mt-2 text-gray-500">Aquí irá el resumen de tareas.</p></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas Privadas envueltas en el Layout principal */}
          <Route path="/" element={
            <RutaPrivada>
              <Layout />
            </RutaPrivada>
          }>
            {/* Todas estas páginas se renderizan DENTRO del <Outlet /> de Layout.jsx */}
            <Route index element={<Inicio />} />
            <Route path="periodos" element={<Periodos />} />
            <Route path="materias" element={<Materias />} />
            <Route path="tareas" element={<Tareas />} />
            <Route path="horarios" element={<Horarios />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;