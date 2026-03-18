import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, BookMarked, X, List, LayoutGrid, CheckCircle, Circle, Clock, Calendar as CalendarIcon, BookOpen, Filter } from 'lucide-react';

export default function Materias() {
  const [materias, setMaterias] = useState([]);
  const [periodos, setPeriodos] = useState([]); 
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [vista, setVista] = useState('grid'); 
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  
  // NUEVO: Estados para la barra de filtros
  const [filtroEstado, setFiltroEstado] = useState('todas'); // 'todas', 'con_pendientes', 'al_dia'
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');

  const [idEditando, setIdEditando] = useState(null);
  const [nombre, setNombre] = useState('');
  const [profesor, setProfesor] = useState('');
  const [idPeriodo, setIdPeriodo] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  useEffect(() => { fetchDatos(); }, []);

  const fetchDatos = async () => {
    try {
      const [resMaterias, resPeriodos, resTareas] = await Promise.all([
        api.get('/materias'), 
        api.get('/periodos'),
        api.get('/tareas')
      ]);
      setMaterias(resMaterias.data || []); 
      setPeriodos(resPeriodos.data || []);
      setTareas(resTareas.data || []);
      if (resPeriodos.data?.length > 0 && !idEditando) setIdPeriodo(resPeriodos.data[0].id_periodo);
    } catch (error) { mostrarMensaje('Error al conectar con el servidor', 'error'); } 
    finally { setLoading(false); }
  };

  const mostrarMensaje = (texto, tipo) => { setMensaje({ texto, tipo }); setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { nombre, profesor, id_periodo: idPeriodo };
      if (idEditando) { await api.put(`/materias/${idEditando}`, { nombre, profesor }); mostrarMensaje('Actualizada', 'exito'); } 
      else { await api.post('/materias', data); mostrarMensaje('Creada', 'exito'); }
      cancelarEdicion(); fetchDatos();
    } catch (error) { mostrarMensaje('Ocurrió un error al guardar', 'error'); }
  };

  const editarMateria = (materia) => {
    setIdEditando(materia.id_materia); setNombre(materia.nombre); setProfesor(materia.profesor || ''); setIdPeriodo(materia.id_periodo);
    setMostrarFormulario(true);
  };

  const eliminarMateria = async (id, e) => {
    if(e) e.stopPropagation();
    if (!window.confirm('¿Eliminar materia? Se borrarán sus tareas y horarios.')) return;
    try { await api.delete(`/materias/${id}`); fetchDatos(); } catch (e) { mostrarMensaje('Error', 'error'); }
  };

  const alternarTarea = async (id) => {
    try { await api.patch(`/tareas/${id}/completar`); fetchDatos(); } catch (e) {}
  };

  const cancelarEdicion = () => {
    setIdEditando(null); setNombre(''); setProfesor('');
    if (periodos.length > 0) setIdPeriodo(periodos[0].id_periodo);
    setMostrarFormulario(false);
  };

  const formatearFechaCorto = (fechaString) => new Date(fechaString).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });

  // NUEVO: Lógica de filtrado
  const materiasFiltradas = materias.filter(m => {
    // 1. Filtrar por periodo
    if (filtroPeriodo !== 'todos' && m.id_periodo !== parseInt(filtroPeriodo)) return false;

    // 2. Filtrar por estado de tareas
    const misTareas = tareas.filter(t => t.id_materia === m.id_materia);
    const pendientes = misTareas.filter(t => !t.completada).length;

    if (filtroEstado === 'con_pendientes' && pendientes === 0) return false;
    if (filtroEstado === 'al_dia' && pendientes > 0) return false;

    return true;
  });

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400 font-medium animate-pulse">Cargando materias...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="bg-blue-950 dark:bg-blue-600 p-3 rounded-xl shadow-md"><BookMarked className="text-white w-6 h-6" /></div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Gestión de Materias</h1>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {materias.length > 0 && (
            <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl shadow-inner">
              <button onClick={() => setVista('grid')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${vista === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-950 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}><LayoutGrid className="w-4 h-4" /> Cuadrícula</button>
              <button onClick={() => setVista('lista')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${vista === 'lista' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-950 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}><List className="w-4 h-4" /> Lista</button>
            </div>
          )}
          <button onClick={() => setMostrarFormulario(!mostrarFormulario)} className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${mostrarFormulario ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-blue-950 dark:bg-blue-600 text-white hover:bg-blue-900 dark:hover:bg-blue-500'}`}>
             {mostrarFormulario ? <X className="w-5 h-5"/> : <Plus className="w-5 h-5"/>} {mostrarFormulario ? 'Cerrar Panel' : 'Nueva Materia'}
          </button>
        </div>
      </div>

      {mensaje.texto && <div className={`p-4 rounded-xl text-sm font-bold text-center ${mensaje.tipo === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-700' : 'bg-green-50 dark:bg-green-900/30 text-green-700'}`}>{mensaje.texto}</div>}

      {periodos.length === 0 ? (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-8 rounded-[2rem] text-center">
          <h2 className="text-xl font-bold text-orange-800 dark:text-orange-400 mb-2">¡Alto ahí!</h2>
          <p className="text-orange-700 dark:text-orange-300">No puedes crear materias porque aún no tienes ningún Periodo Escolar.</p>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          
          {/* NUEVO: BARRA DE FILTROS HORIZONTAL */}
          {materias.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
              <Filter className="w-5 h-5 text-gray-400 shrink-0 mr-2" />
              <button onClick={() => setFiltroEstado('todas')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${filtroEstado === 'todas' ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}>Todas</button>
              <button onClick={() => setFiltroEstado('con_pendientes')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${filtroEstado === 'con_pendientes' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}>Con Pendientes</button>
              <button onClick={() => setFiltroEstado('al_dia')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${filtroEstado === 'al_dia' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}>Al Día</button>
              
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2 shrink-0"></div>
              
              <select 
                onChange={(e) => setFiltroPeriodo(e.target.value)} 
                value={filtroPeriodo}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold outline-none cursor-pointer transition-all ${filtroPeriodo !== 'todos' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}`}
              >
                <option value="todos">Todos los Periodos</option>
                {periodos.map(p => <option key={p.id_periodo} value={p.id_periodo}>{p.nombre}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1 min-h-0">
            
            <div className={`transition-all duration-300 h-full ${mostrarFormulario ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
              <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-2 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden h-full flex flex-col transition-colors">
                
                {materias.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                    <BookMarked className="w-16 h-16 text-gray-200 dark:text-gray-800 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 dark:text-gray-500">Sin Materias</h3>
                    <p className="text-gray-400 dark:text-gray-600">Aún no tienes materias. Crea una nueva.</p>
                  </div>
                ) : materiasFiltradas.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                    <Filter className="w-16 h-16 text-gray-200 dark:text-gray-800 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 dark:text-gray-500">Nada por aquí</h3>
                    <p className="text-gray-400 dark:text-gray-600">Ninguna materia coincide con este filtro.</p>
                  </div>
                ) : vista === 'lista' ? (
                  
                  // VISTA DE LISTA
                  <div className="overflow-x-auto flex-1 p-4">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-sm uppercase tracking-wider">
                          <th className="p-4 font-bold">Materia e Info</th>
                          <th className="p-4 font-bold">Resumen de Tareas</th>
                          <th className="p-4 font-bold text-center w-32">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                        {materiasFiltradas.map(m => {
                          const misTareas = tareas.filter(t => t.id_materia === m.id_materia);
                          const pendientes = misTareas.filter(t => !t.completada).length;
                          return (
                            <tr key={m.id_materia} onClick={() => setMateriaSeleccionada(m)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors align-middle cursor-pointer group rounded-2xl">
                              <td className="p-4">
                                <p className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{m.nombre}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800/50 flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> {m.periodo}</span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Prof: {m.profesor || '-'}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{misTareas.length} Totales</span>
                                  {pendientes > 0 && <span className="text-[10px] font-bold bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full">{pendientes} Pendientes</span>}
                                </div>
                              </td>
                              <td className="p-4 flex justify-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); editarMateria(m); }} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                                <button onClick={(e) => eliminarMateria(m.id_materia, e)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (

                  // VISTA DE CUADRÍCULA (GRID)
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-900/50 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 rounded-2xl">
                    {materiasFiltradas.map(m => {
                      const misTareas = tareas.filter(t => t.id_materia === m.id_materia).sort((a,b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega));
                      const tareasPendientes = misTareas.filter(t => !t.completada);
                      
                      const tareasPreview = tareasPendientes.slice(0, 3);
                      const tareasRestantes = tareasPendientes.length - 3;

                      return (
                        <div key={m.id_materia} onClick={() => setMateriaSeleccionada(m)} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group relative flex flex-col h-full overflow-hidden">
                          
                          <div className="absolute top-0 left-0 w-full h-2 bg-blue-950 dark:bg-blue-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                          
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" /> {m.periodo || 'Periodo'}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); editarMateria(m); }} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={(e) => eliminarMateria(m.id_materia, e)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                          
                          <h3 className="text-2xl font-bold dark:text-white mb-1 pr-4 line-clamp-1">{m.nombre}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-4 truncate border-b border-gray-100 dark:border-gray-700/50 pb-4">
                            Prof: <span className="text-gray-700 dark:text-gray-300">{m.profesor || 'Sin asignar'}</span>
                          </p>
                          
                          <div className="flex-1">
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Próximas Entregas</p>
                            
                            {misTareas.length === 0 ? (
                               <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                 <p className="text-sm text-gray-400 dark:text-gray-500 italic">Sin tareas asignadas</p>
                               </div>
                            ) : tareasPendientes.length === 0 ? (
                               <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/50">
                                 <p className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                                   <CheckCircle className="w-4 h-4"/> ¡Todo entregado!
                                 </p>
                               </div>
                            ) : (
                              <ul className="space-y-3">
                                {tareasPreview.map(t => (
                                  <li key={t.id_tarea} className="flex items-start gap-3 group/tarea">
                                    <button onClick={(e) => { e.stopPropagation(); alternarTarea(t.id_tarea); }} className="mt-0.5 text-gray-300 dark:text-gray-600 hover:text-green-500 dark:hover:text-green-400 transition-colors">
                                      <Circle className="w-5 h-5"/>
                                    </button>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate group-hover/tarea:text-blue-600 dark:group-hover/tarea:text-blue-400 transition-colors">{t.titulo}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3 h-3" /> {formatearFechaCorto(t.fecha_entrega)}
                                      </p>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                            
                            {tareasRestantes > 0 && (
                              <div className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                + {tareasRestantes} tareas pendientes más...
                              </div>
                            )}
                          </div>

                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {mostrarFormulario && (
              <div className="xl:col-span-1 overflow-y-auto pr-2 animate-in slide-in-from-right-8 duration-300 shrink-0">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h2 className="text-xl font-bold dark:text-white mb-6 border-b dark:border-gray-800 pb-4">{idEditando ? 'Editar Materia' : 'Nueva Materia'}</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-sm font-semibold dark:text-gray-300 mb-1">Nombre</label><input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-600" required /></div>
                    <div><label className="block text-sm font-semibold dark:text-gray-300 mb-1">Profesor (Opcional)</label><input type="text" value={profesor} onChange={(e) => setProfesor(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-600" /></div>
                    <div><label className="block text-sm font-semibold dark:text-gray-300 mb-1">Periodo Escolar</label>
                      <select value={idPeriodo} onChange={(e) => setIdPeriodo(e.target.value)} disabled={idEditando !== null} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white rounded-xl outline-none disabled:opacity-50">
                        {periodos.map(p => <option key={p.id_periodo} value={p.id_periodo}>{p.nombre}</option>)}
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-950 dark:bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-900 dark:hover:bg-blue-500 mt-4 transition-colors">Guardar Materia</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {materiaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4" onClick={() => setMateriaSeleccionada(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl border dark:border-gray-800 flex flex-col max-h-[85vh] transition-colors" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-gray-800 pb-4 shrink-0">
              <div>
                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{materiaSeleccionada.nombre}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">Prof: {materiaSeleccionada.profesor || 'Sin asignar'}</span>
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1"><CalendarIcon className="w-4 h-4"/> {materiaSeleccionada.periodo}</span>
                </div>
              </div>
              <button onClick={() => setMateriaSeleccionada(null)} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full dark:text-white transition-colors"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2 space-y-4">
              <h4 className="font-bold text-sm text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Todas las Tareas</h4>
              {tareas.filter(t => t.id_materia === materiaSeleccionada.id_materia).length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                  <p className="text-gray-400 dark:text-gray-500 font-medium">No hay tareas registradas para esta materia.</p>
                </div>
              ) : (
                tareas.filter(t => t.id_materia === materiaSeleccionada.id_materia).sort((a,b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega)).map(t => (
                  <div key={t.id_tarea} className={`p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex items-start gap-4 transition-all hover:shadow-sm ${t.completada ? 'bg-gray-50/50 dark:bg-gray-800/30 opacity-60' : 'bg-white dark:bg-gray-800'}`}>
                    <button onClick={() => alternarTarea(t.id_tarea)} className={`mt-0.5 transition-colors ${t.completada ? 'text-green-500 dark:text-green-400 hover:text-gray-400' : 'text-gray-300 dark:text-gray-600 hover:text-green-500'}`}>{t.completada ? <CheckCircle className="w-6 h-6"/> : <Circle className="w-6 h-6"/>}</button>
                    <div className="flex-1">
                      <p className={`font-bold text-lg dark:text-white ${t.completada ? 'line-through text-gray-500' : 'text-gray-900'}`}>{t.titulo}</p>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1.5"><Clock className="w-4 h-4"/> Vence: {new Date(t.fecha_entrega).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      {t.descripcion && <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">{t.descripcion}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button onClick={() => setMateriaSeleccionada(null)} className="px-6 py-2.5 bg-blue-950 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-900 dark:hover:bg-blue-500 transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}