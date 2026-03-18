import { useContext, useState, useEffect } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Calendar, BookMarked, CheckSquare, Clock, LogOut, User, Moon, Sun } from 'lucide-react';
import Logo from './Logo';

export default function Layout() {
  const { user, logout } = useContext(AuthContext);
  
  // Estado para el Modo Oscuro
  const [isDark, setIsDark] = useState(false);

  // Al cargar, revisar si el usuario ya tenía el modo oscuro activado
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  // Función para alternar el tema
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const menuItems = [
    { name: 'Inicio', path: '/', icon: Home },
    { name: 'Periodos', path: '/periodos', icon: Calendar },
    { name: 'Materias', path: '/materias', icon: BookMarked },
    { name: 'Tareas', path: '/tareas', icon: CheckSquare },
    { name: 'Horarios', path: '/horarios', icon: Clock },
  ];

  return (
    // Agregamos dark:bg-gray-950 para el fondo general de toda la app
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-sm hidden md:flex transition-colors duration-300">
        
        {/* Logo (Cambia a blanco en dark mode) */}
        <Link 
          to="/" 
          className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
        >
          <div className="w-full flex justify-center -mb-12 mt-2 group-hover:scale-105 transition-transform duration-300">
            {/* dark:text-white hace que el SVG se vuelva blanco */}
            <Logo className="text-blue-950 dark:text-white w-64 h-auto transform scale-150 transition-colors duration-300" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight relative z-10 mt-4 text-gray-900 dark:text-white transition-colors duration-300">
            Educational <span className="text-blue-950 dark:text-blue-400">Sort</span>
          </span>
        </Link>

        {/* Navegación */}
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
                      ? 'bg-blue-50 text-blue-950 dark:bg-blue-900/40 dark:text-blue-300'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Controles Inferiores (Tema y Perfil) */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          
          {/* Botón de Modo Oscuro */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-blue-950" />}
            {isDark ? 'Modo Claro' : 'Modo Oscuro'}
          </button>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
              <User className="text-blue-950 dark:text-blue-300 w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-gray-900 dark:text-white">{user?.nombre}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.correo}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}