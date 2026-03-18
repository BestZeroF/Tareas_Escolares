import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, CheckSquare, CheckCircle, Circle, Clock, X, List, LayoutGrid, BookOpen, AlertCircle, Calendar, Filter } from 'lucide-react';

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [vista, setVista] = useState('grid'); 
  const [filtroActivo, setFiltroActivo] = useState('pendientes'); 
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  
  const [idEditando, setIdEditando] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [idMateria, setIdMateria] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  useEffect(() => { fetchDatos(); }, []);

  const fetchDatos = async () => {
    try {
      const [resTareas, resMaterias] = await Promise.all([
        api.get('/tareas'), 
        api.get('/materias')
      ]);
      setTareas(resTareas.data || []); 
      setMaterias(resMaterias.data || []);
      if (resMaterias.data?.length > 0 && !idEditando) setIdMateria(resMaterias.data[0].id_materia);
    } catch (error) { mostrarMensaje('Error al cargar', 'error'); } 
    finally { setLoading(false); }
  };

  const mostrarMensaje = (texto, tipo) => { setMensaje({ texto, tipo }); setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { titulo, descripcion, fecha_entrega: fechaEntrega, id_materia: idMateria };
      if (idEditando) { await api.put(`/tareas/${idEditando}`, data); mostrarMensaje('Tarea actualizada', 'exito'); } 
      else { await api.post('/tareas', data); mostrarMensaje('Tarea creada', 'exito'); }
      cancelarEdicion(); fetchDatos();
    } catch (error) { mostrarMensaje(error.response?.data?.error || 'Error', 'error'); }
  };

  const editarTarea = (tarea) => {
    setIdEditando(tarea.id_tarea); setTitulo(tarea.titulo); setDescripcion(tarea.descripcion || ''); setFechaEntrega(tarea.fecha_entrega.substring(0, 10)); setIdMateria(tarea.id_materia);
    setMostrarFormulario(true);
  };

  const eliminarTarea = async (id, e) => {
    if(e) e.stopPropagation();
    if (!window.confirm('¿Eliminar esta tarea?')) return;
    try { await api.delete(`/tareas/${id}`); fetchDatos(); } catch (error) { mostrarMensaje('Error', 'error'); }
  };

  const marcarCompletada = async (id, e) => {
    if(e) e.stopPropagation();
    try { await api.patch(`/tareas/${id}/completar`); fetchDatos(); } catch (error) {}
  };

  const cancelarEdicion = () => {
    setIdEditando(null); setTitulo(''); setDescripcion(''); setFechaEntrega('');
    if (materias.length > 0) setIdMateria(materias[0].id_materia);
    setMostrarFormulario(false);
  };

  // FUNCIONES DE LÓGICA Y TIEMPO
  const hoy = new Date();
  hoy.setHours(0,0,0,0);

  const obtenerDiferenciaDias = (fechaStr) => {
    const fecha = new Date(fechaStr);
    fecha.setHours(0,0,0,0);
    return Math.floor((fecha - hoy) / (1000 * 60 * 60 * 24));
  };

  const getBadgeEstado = (tarea) => {
    if (tarea.completada) return { color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50", texto: "Completada" };
    
    const diff = obtenerDiferenciaDias(tarea.fecha_entrega);
    if (diff < 0) return { color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50", texto: "Atrasada" };
    if (diff === 0) return { color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50", texto: "Para Hoy" };
    if (diff === 1) return { color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50", texto: "Mañana" };
    if (diff <= 7) return { color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50", texto: `En ${diff} días` };
    
    return { color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700", texto: new Date(tarea.fecha_entrega).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) };
  };

  // SISTEMA DE FILTRADO INTELIGENTE
  const tareasFiltradas = tareas.filter(t => {
    const diff = obtenerDiferenciaDias(t.fecha_entrega);
    if (filtroActivo === 'todas') return true;
    if (filtroActivo === 'pendientes') return !t.completada;
    if (filtroActivo === 'completadas') return t.completada;
    if (filtroActivo === 'hoy') return !t.completada && diff === 0;
    if (filtroActivo === 'semana') return !t.completada && diff >= 0 && diff <= 7;
    if (filtroActivo === 'atrasadas') return !t.completada && diff < 0;
    if (filtroActivo.startsWith('materia_')) return t.id_materia === parseInt(filtroActivo.split('_')[1]);
    return true;
  }).sort((a,b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega));

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400 font-medium animate-pulse">Cargando tareas...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="bg-blue-950 dark:bg-blue-600 p-3 rounded-xl shadow-md"><CheckSquare className="text-white w-6 h-6" /></div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Mis Tareas</h1>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {materias.length > 0 && (
            <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl shadow-inner">
              <button onClick={() => setVista('grid')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${vista === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-950 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}><LayoutGrid className="w-4 h-4" /> Cuadrícula</button>
              <button onClick={() => setVista('lista')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${vista === 'lista' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-950 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}><List className="w-4 h-4" /> Lista</button>
            </div>
          )}
          <button onClick={() => setMostrarFormulario(!mostrarFormulario)} className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${mostrarFormulario ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-blue-950 dark:bg-blue-600 text-white hover:bg-blue-900 dark:hover:bg-blue-500'}`}>
             {mostrarFormulario ? <X className="w-5 h-5"/> : <Plus className="w-5 h-5"/>} {mostrarFormulario ? 'Cerrar Panel' : 'Nueva Tarea'}
          </button>
        </div>
      </div>

      {mensaje.texto && <div className={`p-4 rounded-xl text-sm font-bold text-center ${mensaje.tipo === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-700' : 'bg-green-50 dark:bg-green-900/30 text-green-700'}`}>{mensaje.texto}</div>}

      {materias.length === 0 ? (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-8 rounded-[2rem] text-center">
          <h2 className="text-xl font-bold text-orange-800 dark:text-orange-400 mb-2">Paso previo requerido</h2>
          <p className="text-orange-700 dark:text-orange-300">Debes tener materias registradas para crear tareas.</p>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          
          {/* BARRA DE FILTROS HORIZONTAL */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
            <Filter className="w-5 h-5 text-gray-400 shrink-0 mr-2" />
            <button onClick={() => setFiltroActivo('todas')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${filtroActivo === 'todas' ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}>Todas</button>
            <button onClick={() => setFiltroActivo('pendientes')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${filtroActivo === 'pendientes' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}>Pendientes</button>
            <button onClick={() => setFiltroActivo('hoy')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${filtroActivo === 'hoy' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}>Para Hoy</button>
            <button onClick={() => setFiltroActivo('semana')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${filtroActivo === 'semana' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}>Esta Semana</button>
            <button onClick={() => setFiltroActivo('atrasadas')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${filtroActivo === 'atrasadas' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}>Atrasadas</button>
            <button onClick={() => setFiltroActivo('completadas')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${filtroActivo === 'completadas' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}>Completadas</button>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2 shrink-0"></div>
            
            <select 
              onChange={(e) => setFiltroActivo(e.target.value)} 
              value={filtroActivo.startsWith('materia_') ? filtroActivo : ''}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold outline-none cursor-pointer transition-all ${filtroActivo.startsWith('materia_') ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}`}
            >
              <option value="" disabled>Por Materia...</option>
              {materias.map(m => <option key={m.id_materia} value={`materia_${m.id_materia}`}>{m.nombre}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1 min-h-0">
            
            {/* CONTENEDOR PRINCIPAL */}
            <div className={`transition-all duration-300 h-full ${mostrarFormulario ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
              <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-2 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden h-full flex flex-col transition-colors">
                
                {tareasFiltradas.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                    <CheckSquare className="w-16 h-16 text-gray-200 dark:text-gray-800 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 dark:text-gray-500">Nada por aquí</h3>
                    <p className="text-gray-400 dark:text-gray-600">No hay tareas que coincidan con este filtro.</p>
                  </div>
                ) : vista === 'lista' ? (
                  
                  // VISTA DE LISTA
                  <div className="overflow-x-auto flex-1 p-4">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-sm uppercase tracking-wider">
                          <th className="p-4 font-bold w-16 text-center">Ok</th>
                          <th className="p-4 font-bold">Detalles de la Tarea</th>
                          <th className="p-4 font-bold text-center w-32">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                        {tareasFiltradas.map((t) => {
                          const badge = getBadgeEstado(t);
                          return (
                            <tr key={t.id_tarea} onClick={() => setTareaSeleccionada(t)} className={`transition-colors align-middle cursor-pointer group rounded-2xl ${t.completada ? 'bg-gray-50/50 dark:bg-gray-800/30 opacity-75' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                              <td className="p-4 text-center">
                                <button onClick={(e) => marcarCompletada(t.id_tarea, e)} className={`transition-colors ${t.completada ? 'text-green-500 dark:text-green-400' : 'text-gray-300 dark:text-gray-600 hover:text-green-500'}`}>
                                  {t.completada ? <CheckCircle className="w-7 h-7 mx-auto" /> : <Circle className="w-7 h-7 mx-auto" />}
                                </button>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.color}`}>{badge.texto}</span>
                                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1"><BookOpen className="w-3 h-3"/> {t.materia}</span>
                                </div>
                                <p className={`font-bold text-lg dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${t.completada ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.titulo}</p>
                              </td>
                              <td className="p-4 flex justify-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); editarTarea(t); }} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                                <button onClick={(e) => eliminarTarea(t.id_tarea, e)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (

                  // VISTA DE CUADRÍCULA (GRID)
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-900/50 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 rounded-2xl">
                    {tareasFiltradas.map(t => {
                      const badge = getBadgeEstado(t);
                      const diff = obtenerDiferenciaDias(t.fecha_entrega); // AQUÍ ESTÁ LA CORRECCIÓN
                      
                      return (
                        <div key={t.id_tarea} onClick={() => setTareaSeleccionada(t)} className={`bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group relative flex flex-col h-full overflow-hidden ${t.completada ? 'opacity-70' : ''}`}>
                          
                          <div className={`absolute top-0 left-0 w-full h-2 opacity-50 group-hover:opacity-100 transition-opacity ${t.completada ? 'bg-green-500' : 'bg-blue-950 dark:bg-blue-500'}`}></div>
                          
                          <div className="flex justify-between items-start mb-3">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${badge.color} flex items-center gap-1`}>
                              {diff < 0 && !t.completada ? <AlertCircle className="w-3 h-3"/> : <Calendar className="w-3 h-3"/>} 
                              {badge.texto}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); editarTarea(t); }} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={(e) => eliminarTarea(t.id_tarea, e)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 mt-2">
                            <button onClick={(e) => marcarCompletada(t.id_tarea, e)} className={`mt-1 shrink-0 transition-colors ${t.completada ? 'text-green-500 dark:text-green-400' : 'text-gray-300 dark:text-gray-600 hover:text-green-500'}`}>
                              {t.completada ? <CheckCircle className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                            </button>
                            <div>
                              <h3 className={`text-xl font-bold dark:text-white mb-1 line-clamp-2 ${t.completada ? 'line-through text-gray-500' : 'text-gray-900'}`}>{t.titulo}</h3>
                              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5"><BookOpen className="w-4 h-4"/> {t.materia}</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex-1">
                            {t.descripcion ? (
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">{t.descripcion}</p>
                            ) : (
                              <p className="text-sm text-gray-400 dark:text-gray-600 italic">Sin descripción adjunta.</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* PANEL LATERAL FORMULARIO */}
            {mostrarFormulario && (
              <div className="xl:col-span-1 overflow-y-auto pr-2 animate-in slide-in-from-right-8 duration-300 shrink-0">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h2 className="text-xl font-bold dark:text-white mb-6 border-b dark:border-gray-800 pb-4">{idEditando ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-sm font-semibold dark:text-gray-300 mb-1">Título</label><input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-600" required /></div>
                    <div><label className="block text-sm font-semibold dark:text-gray-300 mb-1">Descripción</label><textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows="3" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-600 resize-none"></textarea></div>
                    <div><label className="block text-sm font-semibold dark:text-gray-300 mb-1">Entrega</label><input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-600" required /></div>
                    <div><label className="block text-sm font-semibold dark:text-gray-300 mb-1">Materia</label>
                      <select value={idMateria} onChange={(e) => setIdMateria(e.target.value)} disabled={idEditando !== null} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white rounded-xl outline-none disabled:opacity-50">
                        {materias.map(m => <option key={m.id_materia} value={m.id_materia}>{m.nombre}</option>)}
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-950 dark:bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-900 dark:hover:bg-blue-500 mt-4 transition-colors">Guardar Tarea</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE TAREA */}
      {tareaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4" onClick={() => setTareaSeleccionada(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl border dark:border-gray-800 flex flex-col max-h-[85vh] transition-colors" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-gray-800 pb-4 shrink-0">
              <div className="flex items-start gap-4">
                <button onClick={(e) => { e.stopPropagation(); marcarCompletada(tareaSeleccionada.id_tarea, e); setTareaSeleccionada({...tareaSeleccionada, completada: !tareaSeleccionada.completada}); }} className={`mt-1 transition-colors ${tareaSeleccionada.completada ? 'text-green-500 dark:text-green-400' : 'text-gray-300 dark:text-gray-600 hover:text-green-500'}`}>
                   {tareaSeleccionada.completada ? <CheckCircle className="w-8 h-8"/> : <Circle className="w-8 h-8"/>}
                </button>
                <div>
                  <h3 className={`text-3xl font-extrabold dark:text-white ${tareaSeleccionada.completada ? 'line-through text-gray-500' : 'text-gray-900'}`}>{tareaSeleccionada.titulo}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-800/50"><BookOpen className="w-4 h-4"/> {tareaSeleccionada.materia}</span>
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
                  {new Date(tareaSeleccionada.fecha_entrega).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
              <button onClick={() => setTareaSeleccionada(null)} className="px-6 py-2.5 bg-blue-950 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-900 dark:hover:bg-blue-500 transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}