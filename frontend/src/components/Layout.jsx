import { useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Calendar, BookMarked, CheckSquare, Clock, LogOut, User } from 'lucide-react';
import Logo from './Logo';

export default function Layout() {
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    { name: 'Inicio (Calendario)', path: '/', icon: Home },
    { name: 'Periodos', path: '/periodos', icon: Calendar },
    { name: 'Materias', path: '/materias', icon: BookMarked },
    { name: 'Tareas', path: '/tareas', icon: CheckSquare },
    { name: 'Horarios', path: '/horarios', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans text-gray-900">
      
      {/* Sidebar / Menú Lateral */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm hidden md:flex">
        
        {/* Logo y Título en el Dashboard */}
        <div className="p-6 border-b border-gray-100 flex flex-col items-center justify-center text-center overflow-hidden">
          {/* Logo mucho más grande, usando w-64 y scale-150 para que domine el espacio, con un margen negativo fuerte para pegarlo al texto */}
          <div className="w-full flex justify-center -mb-12 mt-2">
            <Logo className="text-blue-950 mb-10 w-64 h-auto transform scale-150" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight relative z-10 mt-4">
            Educational <span className="text-blue-950">Sort</span>
          </span>
        </div>

        {/* Enlaces de Navegación */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-950'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Perfil y Cerrar Sesión */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-gray-50 border border-gray-100">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="text-blue-950 w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.nombre}</p>
              <p className="text-xs text-gray-500 truncate">{user?.correo}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área Principal de Contenido */}
      <main className="flex-1 h-screen overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}