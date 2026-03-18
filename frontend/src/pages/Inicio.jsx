import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Circle, Clock, Calendar as CalendarIcon, BookOpen, TrendingUp, AlertCircle, X } from 'lucide-react';

export default function Inicio() {
  const { user } = useContext(AuthContext);
  const [tareas, setTareas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  
  // Estados para nuevas funciones (Modales y Tiempo Real)
  const [modalMetrica, setModalMetrica] = useState(null);
  const [horaActual, setHoraActual] = useState(new Date());

  useEffect(() => { 
    fetchDatos(); 
    // Actualizar reloj de la agenda cada 30 segundos
    const timer = setInterval(() => setHoraActual(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchDatos = async () => {
    try {
      const [resTareas, resHorarios, resMaterias] = await Promise.all([
        api.get('/tareas'),
        api.get('/horarios'),
        api.get('/materias')
      ]);
      // Aseguramos que siempre sean arreglos para evitar el crash de pantalla negra
      setTareas(Array.isArray(resTareas.data) ? resTareas.data : []);
      setHorarios(Array.isArray(resHorarios.data) ? resHorarios.data : []);
      setMaterias(Array.isArray(resMaterias.data) ? resMaterias.data : []);
    } catch (error) {
      console.error("Error al cargar el dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  const alternarTarea = async (id, e) => {
    if(e) e.stopPropagation();
    try { 
      await api.patch(`/tareas/${id}/completar`); 
      fetchDatos(); 
      if(tareaSeleccionada && tareaSeleccionada.id_tarea === id) {
        setTareaSeleccionada({...tareaSeleccionada, completada: !tareaSeleccionada.completada});
      }
    } catch (error) { console.error(error); }
  };

  // --- LÓGICA DE FECHAS (BLINDADA) ---
  const diaSemana = horaActual.toLocaleDateString('es-ES', { weekday: 'long' });
  const diaF = horaActual.getDate();
  const mes = horaActual.toLocaleDateString('es-ES', { month: 'long' });
  const anio = horaActual.getFullYear();
  
  const capitalize = (str) => (typeof str === 'string' && str.length > 0) ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  const fechaFormateada = `${capitalize(diaSemana)}, ${diaF} de ${capitalize(mes)} de ${anio}`;

  // Reloj para la agenda
  const horaString = horaActual.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  const diasAbrev = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  const diaHoyStr = diasAbrev[horaActual.getDay()];
  
  // Filtros seguros
  const clasesHoy = horarios
    .filter(h => h && h.dia_semana === diaHoyStr)
    .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''));

  const tareasPendientes = tareas.filter(t => t && !t.completada).sort((a, b) => {
    const fA = new Date(a.fecha_entrega || 0).getTime();
    const fB = new Date(b.fecha_entrega || 0).getTime();
    return (isNaN(fA) ? 0 : fA) - (isNaN(fB) ? 0 : fB);
  });
  
  const tareasCompletadas = tareas.filter(t => t && t.completada);
  const progreso = tareas.length === 0 ? 0 : Math.round((tareasCompletadas.length / tareas.length) * 100) || 0;

  // Función de etiquetas con Try/Catch para evitar errores de fecha nula
  const getEstadoBadge = (tarea) => {
    try {
      if (!tarea) return { color: "", texto: "" };
      if (tarea.completada) return { color: "border-green-500/50 text-green-500 bg-green-500/10", texto: "Lista" };
      if (!tarea.fecha_entrega) return { color: "border-gray-500/50 text-gray-500 bg-gray-500/10", texto: "Sin fecha" };
      
      const d = new Date(tarea.fecha_entrega);
      if (isNaN(d.getTime())) return { color: "border-gray-500/50 text-gray-500 bg-gray-500/10", texto: "--" };
      
      const diff = Math.floor((d.setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
      if (diff < 0) return { color: "border-red-500/50 text-red-500 bg-red-500/10", texto: "Atrasada" };
      if (diff === 0) return { color: "border-orange-500/50 text-orange-500 bg-orange-500/10", texto: "Hoy" };
      if (diff === 1) return { color: "border-yellow-500/50 text-yellow-500 bg-yellow-500/10", texto: "Mañana" };
      
      return { color: "border-gray-500/50 text-gray-500 bg-gray-500/10", texto: new Date(tarea.fecha_entrega).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) };
    } catch {
      return { color: "border-gray-500/50 text-gray-500 bg-gray-500/10", texto: "Info" };
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400 font-medium animate-pulse">Cargando tu resumen...</div>;

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col pb-6">
      
      {/* HEADER LIMPIO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 mt-2 px-2">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            ¡Hola, <span className="text-blue-500">{user?.nombre?.split(' ')[0] || 'Usuario'}</span>!
          </h1>
          <div className="flex items-center gap-2 mt-2 text-gray-500 dark:text-gray-400 font-medium">
            <CalendarIcon className="w-4 h-4" />
            <span>{fechaFormateada}</span>
            <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-bold">{horaString}</span>
          </div>
        </div>

        <div className="w-full md:w-auto text-right">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Tu Progreso</p>
          <div className="flex items-center justify-end gap-3">
            <div className="w-40 sm:w-64 h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progreso}%` }}></div>
            </div>
            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm w-10">{progreso}%</span>
          </div>
        </div>
      </div>

      {/* MÉTRICAS CLIQUEABLES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 px-2">
        
        <div onClick={() => setModalMetrica('pendientes')} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5 cursor-pointer hover:-translate-y-1 hover:border-orange-200 dark:hover:border-orange-800/50 transition-all group">
          <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center border border-orange-100 dark:border-orange-800/50 group-hover:scale-110 transition-transform">
            <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider group-hover:text-orange-500 transition-colors">Por Entregar</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white leading-tight mt-0.5">{tareasPendientes.length}</p>
          </div>
        </div>

        <div onClick={() => setModalMetrica('completadas')} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5 cursor-pointer hover:-translate-y-1 hover:border-green-200 dark:hover:border-green-800/50 transition-all group">
          <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center border border-green-100 dark:border-green-800/50 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider group-hover:text-green-500 transition-colors">Completadas</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white leading-tight mt-0.5">{tareasCompletadas.length}</p>
          </div>
        </div>

        <div onClick={() => setModalMetrica('materias')} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5 cursor-pointer hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all group">
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800/50 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider group-hover:text-blue-500 transition-colors">Materias Activas</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white leading-tight mt-0.5">{materias.length}</p>
          </div>
        </div>

      </div>

      {/* PANELES INFERIORES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px] px-2">
        
        {/* COLUMNA 1: AGENDA DE HOY (TIEMPO REAL) */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 flex justify-between items-center border-b border-gray-50 dark:border-gray-800/50">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-500" /> Mi Agenda de Hoy
            </h2>
            <Link to="/horarios" className="text-sm font-bold text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
              Ver semana
            </Link>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            {clasesHoy.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Clock className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">Día libre</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">No tienes clases registradas para hoy.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-3 space-y-6">
                {clasesHoy.map(clase => {
                  const hInicio = (clase.hora_inicio || '00:00').substring(0,5);
                  const hFin = (clase.hora_fin || '00:00').substring(0,5);
                  
                  const isPasada = hFin <= horaString;
                  const isActiva = hInicio <= horaString && hFin > horaString;

                  return (
                    <div key={clase.id_horario} className={`relative pl-6 transition-all duration-500 ${isPasada ? 'opacity-40 grayscale' : isActiva ? 'scale-[1.02]' : ''}`}>
                      <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 shadow-sm ${isActiva ? 'bg-blue-500 border-blue-200 dark:border-blue-900 animate-pulse' : isPasada ? 'bg-gray-400 border-gray-100 dark:border-gray-800' : 'bg-white dark:bg-gray-900 border-blue-500'}`}></div>
                      
                      <div className={`p-4 rounded-2xl border transition-colors ${isActiva ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className={`font-bold text-base ${isActiva ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{clase.materia}</h4>
                          {isActiva && <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">En Curso</span>}
                        </div>
                        <p className={`text-sm font-medium mt-0.5 ${isActiva ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          {hInicio} — {hFin}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA 2: TAREAS RÁPIDAS (LÓGICA ORIGINAL DEL USUARIO MANTENIDA) */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 flex justify-between items-center border-b border-gray-50 dark:border-gray-800/50">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" /> Mis Tareas
            </h2>
            <Link to="/tareas" className="text-sm font-bold text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
              Ver todas
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {tareas.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <CheckSquare className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">Sin pendientes</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">No tienes tareas registradas actualmente.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {tareas.slice(0, 6).map((t) => {
                  const badge = getEstadoBadge(t);

                  return (
                    <li key={t.id_tarea} onClick={() => setTareaSeleccionada(t)} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group flex items-center justify-between rounded-xl mx-2 my-1">
                      
                      <div className="flex items-center gap-4 min-w-0">
                        <button onClick={(e) => alternarTarea(t.id_tarea, e)} className={`transition-colors shrink-0 ${t.completada ? 'text-green-500 dark:text-green-500' : 'text-gray-300 dark:text-gray-600 hover:text-green-500'}`}>
                          {t.completada ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                        </button>
                        <div className="min-w-0">
                          <p className={`font-bold text-base truncate transition-colors ${t.completada ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>{t.titulo}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{t.materia}</p>
                        </div>
                      </div>

                      <span className={`shrink-0 ml-4 text-[10px] font-bold px-2 py-1 rounded-md border ${badge.color}`}>
                        {badge.texto}
                      </span>
                      
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

      </div>

      {/* MODAL DETALLE DE TAREA */}
      {tareaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4" onClick={() => setTareaSeleccionada(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh] transition-colors" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-gray-800 pb-4 shrink-0">
              <div className="flex items-start gap-4">
                <button onClick={(e) => alternarTarea(tareaSeleccionada.id_tarea, e)} className={`mt-1 transition-colors ${tareaSeleccionada.completada ? 'text-green-500 dark:text-green-500' : 'text-gray-300 dark:text-gray-600 hover:text-green-500'}`}>
                   {tareaSeleccionada.completada ? <CheckCircle className="w-8 h-8"/> : <Circle className="w-8 h-8"/>}
                </button>
                <div>
                  <h3 className={`text-2xl font-bold dark:text-white ${tareaSeleccionada.completada ? 'line-through text-gray-500' : 'text-gray-900'}`}>{tareaSeleccionada.titulo}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1"><BookOpen className="w-4 h-4"/> {tareaSeleccionada.materia || 'General'}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setTareaSeleccionada(null)} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full dark:text-white transition-colors"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2 space-y-6">
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Fecha de Entrega</p>
                <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-medium bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  {(() => {
                    try {
                      if (!tareaSeleccionada.fecha_entrega) return 'Sin asignar';
                      const d = new Date(tareaSeleccionada.fecha_entrega);
                      return isNaN(d.getTime()) ? 'Fecha inválida' : d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    } catch { return 'Sin asignar'; }
                  })()}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Descripción de la Tarea</p>
                {tareaSeleccionada.descripcion ? (
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 leading-relaxed whitespace-pre-wrap">{tareaSeleccionada.descripcion}</p>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-600 italic">No hay descripción para esta tarea.</p>
                )}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button onClick={() => setTareaSeleccionada(null)} className="px-6 py-2.5 bg-blue-950 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-900 dark:hover:bg-blue-500 transition-colors shadow-sm">Cerrar Detalles</button>
            </div>
          </div>
        </div>
      )}

      {/* MODALES DE LAS MÉTRICAS SUPERIORES */}
      {modalMetrica && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4" onClick={() => setModalMetrica(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh] transition-colors" onClick={e => e.stopPropagation()}>
            
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4 shrink-0">
              <h3 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                {modalMetrica === 'pendientes' && <><AlertCircle className="w-6 h-6 text-orange-500"/> Tareas Pendientes</>}
                {modalMetrica === 'completadas' && <><CheckCircle className="w-6 h-6 text-green-500"/> Tareas Completadas</>}
                {modalMetrica === 'materias' && <><BookOpen className="w-6 h-6 text-blue-500"/> Materias Activas</>}
              </h3>
              <button onClick={() => setModalMetrica(null)} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full dark:text-white transition-colors"><X className="w-6 h-6"/></button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2">
              
              {/* Contenido Modal de Tareas */}
              {(modalMetrica === 'pendientes' || modalMetrica === 'completadas') && (
                <ul className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {(modalMetrica === 'pendientes' ? tareasPendientes : tareasCompletadas).length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No hay tareas en esta categoría.</p>
                  ) : (
                    (modalMetrica === 'pendientes' ? tareasPendientes : tareasCompletadas).map(t => {
                      const badge = getEstadoBadge(t);
                      return (
                        <li key={t.id_tarea} className="py-4 flex justify-between items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 px-2 rounded-xl transition-colors cursor-pointer" onClick={() => { setTareaSeleccionada(t); setModalMetrica(null); }}>
                          <div className="min-w-0 flex items-center gap-3">
                            <button onClick={(e) => alternarTarea(t.id_tarea, e)} className={`shrink-0 transition-colors ${t.completada ? 'text-green-500' : 'text-gray-300 hover:text-green-500'}`}>
                              {t.completada ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                            </button>
                            <div>
                              <p className={`font-bold text-base truncate ${t.completada ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>{t.titulo}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{t.materia}</p>
                            </div>
                          </div>
                          <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-md border ${badge.color}`}>{badge.texto}</span>
                        </li>
                      )
                    })
                  )}
                </ul>
              )}

              {/* Contenido Modal de Materias */}
              {modalMetrica === 'materias' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {materias.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 col-span-2">No tienes materias registradas.</p>
                  ) : (
                    materias.map(m => (
                      <div key={m.id_materia} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg shrink-0">
                          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">{m.nombre}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Prof: {m.profesor || 'Sin asignar'}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button onClick={() => setModalMetrica(null)} className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}