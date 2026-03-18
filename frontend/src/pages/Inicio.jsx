import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  BookOpen, 
  Calendar as CalendarIcon,
  TrendingUp,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Inicio() {
  const { user } = useContext(AuthContext);
  const [tareas, setTareas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    try {
      const [resTareas, resHorarios, resMaterias] = await Promise.all([
        api.get('/tareas'),
        api.get('/horarios'),
        api.get('/materias')
      ]);
      setTareas(resTareas.data);
      setHorarios(resHorarios.data);
      setMaterias(resMaterias.data);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const alternarTarea = async (id) => {
    try {
      await api.patch(`/tareas/${id}/completar`);
      fetchDatos(); 
    } catch (error) {
      console.error("Error al actualizar tarea", error);
    }
  };

  // NUEVO: Función para limpiar clases "fantasma" desde el inicio
  const eliminarHorario = async (id) => {
    if (!window.confirm('¿Eliminar esta clase de tu agenda?')) return;
    try {
      await api.delete(`/horarios/${id}`);
      fetchDatos();
    } catch (error) {
      console.error("Error al eliminar horario", error);
    }
  };

  const fechaHoy = new Date();
  const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaFormateada = fechaHoy.toLocaleDateString('es-ES', opcionesFecha);
  
  const diasAbrev = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  const diaHoyAbrev = diasAbrev[fechaHoy.getDay()];

  const clasesHoy = horarios
    .filter(h => h.dia_semana === diaHoyAbrev)
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  // Modificado: Ahora mostramos todas, pero las pendientes van arriba
  const tareasOrdenadas = [...tareas].sort((a, b) => {
    if (a.completada === b.completada) {
      return new Date(a.fecha_entrega) - new Date(b.fecha_entrega);
    }
    return a.completada ? 1 : -1; // Pendientes (false) van primero
  });

  const totalPendientes = tareas.filter(t => !t.completada).length;
  const totalCompletadas = tareas.filter(t => t.completada).length;
  const progresoTareas = tareas.length === 0 ? 0 : Math.round((totalCompletadas / tareas.length) * 100);

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Cargando tu información...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* SECCIÓN 1: Saludo y Fecha */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            ¡Hola, <span className="text-blue-950">{user?.nombre?.split(' ')[0] || 'Estudiante'}</span>!
          </h1>
          <p className="text-gray-500 font-medium capitalize flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-950" />
            {fechaFormateada}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Tu Progreso</p>
          <div className="flex items-center gap-3">
            <div className="w-48 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-blue-950 h-3 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progresoTareas}%` }}
              ></div>
            </div>
            <span className="font-bold text-blue-950">{progresoTareas}%</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="bg-orange-100 p-4 rounded-2xl text-orange-600"><AlertCircle className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Por Entregar</p>
            <p className="text-3xl font-black text-gray-900">{totalPendientes}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="bg-green-100 p-4 rounded-2xl text-green-600"><CheckCircle className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Completadas</p>
            <p className="text-3xl font-black text-gray-900">{totalCompletadas}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="bg-blue-100 p-4 rounded-2xl text-blue-900"><BookOpen className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Materias Activas</p>
            <p className="text-3xl font-black text-gray-900">{materias.length}</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: Contenido Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Agenda de Hoy */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-950" /> Mi Agenda de Hoy
            </h2>
            <Link to="/horarios" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Ver semana</Link>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            {diaHoyAbrev === 'Sab' || diaHoyAbrev === 'Dom' ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                <span className="text-4xl mb-3">🎉</span>
                <p className="font-bold text-lg text-gray-600">¡Es fin de semana!</p>
                <p>Tómate un respiro, no hay clases programadas.</p>
              </div>
            ) : clasesHoy.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                <Clock className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-bold text-lg text-gray-600">Día libre</p>
                <p>No tienes clases registradas para hoy.</p>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {clasesHoy.map((clase, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-950 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-blue-950">{clase.materia}</span>
                        {/* Botón para borrar directo desde el inicio */}
                        <button 
                          onClick={() => eliminarHorario(clase.id_horario)} 
                          className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          title="Eliminar esta clase"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        {clase.hora_inicio.substring(0,5)} - {clase.hora_fin.substring(0,5)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tareas Urgentes */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-500" /> Mis Tareas
            </h2>
            <Link to="/tareas" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Ver todas</Link>
          </div>
          
          <div className="p-2 flex-1 overflow-y-auto">
            {tareasOrdenadas.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-6">
                <CheckCircle className="w-12 h-12 mb-3 text-green-200" />
                <p className="font-bold text-lg text-gray-600">¡Todo al día!</p>
                <p>No tienes tareas registradas por ahora.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {tareasOrdenadas.map(tarea => {
                  const fechaEntrega = new Date(tarea.fecha_entrega);
                  const hoy = new Date();
                  hoy.setHours(0,0,0,0);
                  const diferenciaDias = Math.floor((fechaEntrega - hoy) / (1000 * 60 * 60 * 24));
                  
                  let badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
                  let textoFecha = new Date(tarea.fecha_entrega).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
                  
                  if (tarea.completada) { badgeColor = "bg-green-50 text-green-700 border-green-200"; textoFecha = "Lista"; }
                  else if (diferenciaDias < 0) { badgeColor = "bg-red-50 text-red-700 border-red-200"; textoFecha = "Atrasada"; }
                  else if (diferenciaDias === 0) { badgeColor = "bg-orange-50 text-orange-700 border-orange-200"; textoFecha = "Hoy"; }
                  else if (diferenciaDias === 1) { badgeColor = "bg-yellow-50 text-yellow-700 border-yellow-200"; textoFecha = "Mañana"; }

                  return (
                    <li key={tarea.id_tarea} className={`p-4 hover:bg-gray-50 flex items-start gap-4 transition-colors rounded-2xl m-2 ${tarea.completada ? 'opacity-60' : ''}`}>
                      <button 
                        onClick={() => alternarTarea(tarea.id_tarea)}
                        className={`mt-1 transition-colors shrink-0 ${tarea.completada ? 'text-green-500 hover:text-gray-400' : 'text-gray-300 hover:text-green-500'}`}
                        title={tarea.completada ? "Desmarcar tarea" : "Marcar como completada"}
                      >
                        {tarea.completada ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className={`font-bold text-gray-900 truncate ${tarea.completada ? 'line-through' : ''}`}>{tarea.titulo}</p>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md border shrink-0 ${badgeColor}`}>
                            {textoFecha}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium truncate">{tarea.materia}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}