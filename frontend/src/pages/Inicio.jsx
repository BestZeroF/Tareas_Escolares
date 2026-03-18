import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { CheckCircle, Circle, Clock, BookOpen, Calendar as CalendarIcon, TrendingUp, AlertCircle, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Inicio() {
  const { user } = useContext(AuthContext);
  const [tareas, setTareas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);

  useEffect(() => { fetchDatos(); }, []);

  const fetchDatos = async () => {
    try {
      // Usamos .catch individual para que si una falla por ser cuenta nueva, las demás no colapsen
      const [resTareas, resHorarios, resMaterias] = await Promise.all([
        api.get('/tareas').catch(() => ({ data: [] })),
        api.get('/horarios').catch(() => ({ data: [] })),
        api.get('/materias').catch(() => ({ data: [] }))
      ]);
      
      // Validación estricta: Si no es un array, forzamos a que sea un array vacío []
      setTareas(Array.isArray(resTareas.data) ? resTareas.data : []); 
      setHorarios(Array.isArray(resHorarios.data) ? resHorarios.data : []); 
      setMaterias(Array.isArray(resMaterias.data) ? resMaterias.data : []);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally { 
      setLoading(false); 
    }
  };

  const alternarTarea = async (id) => {
    try { await api.patch(`/tareas/${id}/completar`); fetchDatos(); } 
    catch (error) { console.error("Error", error); }
  };

  const eliminarHorario = async (id) => {
    if (!window.confirm('¿Eliminar esta clase?')) return;
    try { await api.delete(`/horarios/${id}`); fetchDatos(); } 
    catch (error) { console.error("Error", error); }
  };

  // --- VALIDACIONES DE SEGURIDAD PARA RENDERIZADO ---
  const fechaHoy = new Date();
  const fechaFormateada = fechaHoy.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const diasAbrev = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  const diaHoyAbrev = diasAbrev[fechaHoy.getDay()];

  // Protegemos el saludo si el usuario no tiene nombre
  const nombreUsuario = user?.nombre ? user.nombre.split(' ')[0] : 'Estudiante';

  const clasesHoy = horarios
    .filter(h => h && h.dia_semana === diaHoyAbrev)
    .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''));

  const tareasOrdenadas = [...tareas].sort((a, b) => {
    if (a.completada === b.completada) return new Date(a.fecha_entrega || 0) - new Date(b.fecha_entrega || 0);
    return a.completada ? 1 : -1; 
  });

  const totalPendientes = tareas.filter(t => !t.completada).length;
  const totalCompletadas = tareas.filter(t => t.completada).length;
  const progresoTareas = tareas.length === 0 ? 0 : Math.round((totalCompletadas / tareas.length) * 100);

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400 font-medium animate-pulse">Preparando tu espacio...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* Saludo */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
            ¡Hola, <span className="text-blue-950 dark:text-blue-400">{nombreUsuario}</span>!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium capitalize flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-950 dark:text-blue-400" />
            {fechaFormateada}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Tu Progreso</p>
          <div className="flex items-center gap-3">
            <div className="w-48 bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
              <div className="bg-blue-950 dark:bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progresoTareas}%` }}></div>
            </div>
            <span className="font-bold text-blue-950 dark:text-blue-400">{progresoTareas}%</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-5 transition-colors">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-2xl text-orange-600 dark:text-orange-400"><AlertCircle className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Por Entregar</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{totalPendientes}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-5 transition-colors">
          <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-2xl text-green-600 dark:text-green-400"><CheckCircle className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Completadas</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{totalCompletadas}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-5 transition-colors">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-2xl text-blue-900 dark:text-blue-400"><BookOpen className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Materias Activas</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{materias.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Agenda */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-[500px] transition-colors">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 rounded-t-3xl transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-950 dark:text-blue-400" /> Mi Agenda de Hoy
            </h2>
            <Link to="/horarios" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">Ver semana</Link>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            {diaHoyAbrev === 'Sab' || diaHoyAbrev === 'Dom' ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-center">
                <span className="text-4xl mb-3">🎉</span>
                <p className="font-bold text-lg text-gray-600 dark:text-gray-300">¡Es fin de semana!</p>
                <p>Tómate un respiro, no hay clases programadas.</p>
              </div>
            ) : clasesHoy.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-center">
                <Clock className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-bold text-lg text-gray-600 dark:text-gray-300">Día libre</p>
                <p>No tienes clases registradas para hoy.</p>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-700 before:to-transparent">
                {clasesHoy.map((clase, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 bg-blue-950 dark:bg-blue-600 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-colors">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative group transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-blue-950 dark:text-blue-300">{clase.materia || 'Sin nombre'}</span>
                        <button onClick={() => eliminarHorario(clase.id_horario)} className="text-gray-300 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {(clase.hora_inicio || '').substring(0,5)} - {(clase.hora_fin || '').substring(0,5)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tareas */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-[500px] transition-colors">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 rounded-t-3xl transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-500 dark:text-orange-400" /> Mis Tareas
            </h2>
            <Link to="/tareas" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800">Ver todas</Link>
          </div>
          
          <div className="p-2 flex-1 overflow-y-auto">
            {tareasOrdenadas.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-center p-6">
                <CheckCircle className="w-12 h-12 mb-3 text-green-200 dark:text-green-900" />
                <p className="font-bold text-lg text-gray-600 dark:text-gray-300">¡Todo al día!</p>
                <p>No tienes tareas registradas por ahora.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {tareasOrdenadas.map(tarea => {
                  const fechaEntrega = new Date(tarea.fecha_entrega);
                  const hoy = new Date();
                  hoy.setHours(0,0,0,0);
                  const diferenciaDias = Math.floor((fechaEntrega - hoy) / (1000 * 60 * 60 * 24));
                  
                  let badgeColor = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50";
                  let textoFecha = tarea.fecha_entrega ? new Date(tarea.fecha_entrega).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : 'Sin fecha';
                  
                  if (tarea.completada) { badgeColor = "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50"; textoFecha = "Lista"; }
                  else if (diferenciaDias < 0) { badgeColor = "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50"; textoFecha = "Atrasada"; }
                  else if (diferenciaDias === 0) { badgeColor = "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50"; textoFecha = "Hoy"; }
                  else if (diferenciaDias === 1) { badgeColor = "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50"; textoFecha = "Mañana"; }

                  return (
                    <li key={tarea.id_tarea} onClick={() => setTareaSeleccionada(tarea)} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-start gap-4 transition-colors rounded-2xl m-2 cursor-pointer ${tarea.completada ? 'opacity-60' : ''}`}>
                      <button onClick={(e) => { e.stopPropagation(); alternarTarea(tarea.id_tarea); }} className={`mt-1 transition-colors shrink-0 ${tarea.completada ? 'text-green-500 dark:text-green-400' : 'text-gray-300 dark:text-gray-600 hover:text-green-500'}`}>
                        {tarea.completada ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className={`font-bold text-gray-900 dark:text-gray-100 truncate ${tarea.completada ? 'line-through' : ''}`}>{tarea.titulo}</p>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md border shrink-0 ${badgeColor}`}>{textoFecha}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium truncate">{tarea.materia}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modal Oscuro de Detalles */}
      {tareaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4" onClick={() => setTareaSeleccionada(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 border dark:border-gray-800" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white pr-4">{tareaSeleccionada.titulo}</h3>
              <button onClick={() => setTareaSeleccionada(null)} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-5">
              <div className="flex gap-4 items-center p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                <BookOpen className="w-8 h-8 text-blue-900 dark:text-blue-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-wider mb-0.5">Materia</p>
                  <p className="text-lg font-bold text-blue-950 dark:text-blue-100">{tareaSeleccionada.materia}</p>
                  <p className="text-sm text-blue-900 dark:text-blue-300 font-medium">Profesor: {materias.find(m => m.id_materia === tareaSeleccionada.id_materia)?.profesor || 'Sin asignar'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Fecha de Entrega</p>
                <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-medium"><CalendarIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />{tareaSeleccionada.fecha_entrega ? new Date(tareaSeleccionada.fecha_entrega).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Sin fecha'}</div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Descripción</p>
                {tareaSeleccionada.descripcion ? <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed border border-gray-100 dark:border-gray-700/50 text-sm">{tareaSeleccionada.descripcion}</div> : <p className="text-sm text-gray-400 dark:text-gray-600 italic">No agregaste ninguna descripción a esta tarea.</p>}
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
               <button onClick={() => setTareaSeleccionada(null)} className="px-6 py-2.5 bg-blue-950 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-900 dark:hover:bg-blue-500 transition-colors">Aceptar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}