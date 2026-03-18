import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, X, List, ChevronLeft, ChevronRight, BookOpen, LayoutGrid, GitCommit } from 'lucide-react';

export default function Periodos() {
  const [periodos, setPeriodos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  // ESTADO RESTAURADO: Soporta 3 vistas ('grid', 'lista', 'timeline')
  const [vista, setVista] = useState('timeline'); 
  
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
  const [idEditando, setIdEditando] = useState(null);
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Control del año para la Línea de Tiempo
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());

  useEffect(() => { fetchDatos(); }, []);

  const fetchDatos = async () => {
    try {
      const [resPeriodos, resMaterias] = await Promise.all([
        api.get('/periodos'),
        api.get('/materias')
      ]);
      setPeriodos(resPeriodos.data || []);
      setMaterias(resMaterias.data || []);
    } catch (error) {
      mostrarMensaje('Error al cargar la información', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const handleNombreChange = (e) => {
    const valorLimpio = e.target.value.replace(/[^\d-]/g, '');
    if (valorLimpio.length <= 6) setNombre(valorLimpio);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formatoValido = /^\d{4}-\d$/;
    if (!formatoValido.test(nombre)) return mostrarMensaje('Formato: AAAA-N (Ej. 2026-1)', 'error');
    
    try {
      const data = { nombre, fecha_inicio: fechaInicio, fecha_fin: fechaFin };
      if (idEditando) {
        await api.put(`/periodos/${idEditando}`, data);
        mostrarMensaje('Periodo actualizado', 'exito');
      } else {
        await api.post('/periodos', data);
        mostrarMensaje('Periodo creado', 'exito');
      }
      cancelarEdicion();
      fetchDatos();
    } catch (error) { mostrarMensaje('Error al guardar', 'error'); }
  };

  const editarPeriodo = (periodo) => {
    setIdEditando(periodo.id_periodo); setNombre(periodo.nombre);
    setFechaInicio(periodo.fecha_inicio.substring(0, 10)); setFechaFin(periodo.fecha_fin.substring(0, 10));
    setMostrarFormulario(true);
  };

  const eliminarPeriodo = async (id, e) => {
    if(e) e.stopPropagation(); 
    if (!window.confirm('¿Eliminar este periodo? (Se borrarán sus materias)')) return;
    try { await api.delete(`/periodos/${id}`); fetchDatos(); } catch (e) { mostrarMensaje('Error al eliminar', 'error'); }
  };

  const cancelarEdicion = () => {
    setIdEditando(null); setNombre(''); setFechaInicio(''); setFechaFin('');
    setMostrarFormulario(false);
  };

  const formatearFecha = (fechaString) => new Date(fechaString).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });

  const mesesAno = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400 font-medium animate-pulse">Cargando periodos...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-950 dark:bg-blue-600 p-3 rounded-xl shadow-md"><CalendarIcon className="text-white w-6 h-6" /></div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Gestión de Periodos</h1>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
          {periodos.length > 0 && (
            <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl shadow-inner shrink-0">
              <button onClick={() => setVista('timeline')} className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${vista === 'timeline' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-950 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                <GitCommit className="w-4 h-4" /> Visual
              </button>
              <button onClick={() => setVista('grid')} className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${vista === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-950 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                <LayoutGrid className="w-4 h-4" /> Tarjetas
              </button>
              <button onClick={() => setVista('lista')} className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${vista === 'lista' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-950 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                <List className="w-4 h-4" /> Lista
              </button>
            </div>
          )}

          <button onClick={() => mostrarFormulario ? cancelarEdicion() : setMostrarFormulario(true)} className={`shrink-0 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${mostrarFormulario ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-blue-950 dark:bg-blue-600 text-white hover:bg-blue-900 dark:hover:bg-blue-500'}`}>
            {mostrarFormulario ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />} {mostrarFormulario ? 'Cerrar' : 'Nuevo'}
          </button>
        </div>
      </div>

      {mensaje.texto && <div className={`p-4 rounded-xl text-sm font-bold text-center ${mensaje.tipo === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-700' : 'bg-green-50 dark:bg-green-900/30 text-green-700'}`}>{mensaje.texto}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1 min-h-0">
        <div className={`transition-all duration-300 h-full ${mostrarFormulario ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-2 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden h-full flex flex-col transition-colors">
            
            {periodos.length === 0 ? (
               <div className="flex-1 p-12 flex items-center justify-center text-center text-gray-500 dark:text-gray-400 font-medium">Aún no tienes periodos registrados. Crea uno nuevo.</div>
            ) : vista === 'grid' ? (
              
              // VISTA 1: CUADRÍCULA (TARJETAS)
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-900/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 rounded-2xl">
                {periodos.map(p => {
                  const materiasDelPeriodo = materias.filter(m => m.id_periodo === p.id_periodo);
                  return (
                    <div key={p.id_periodo} onClick={() => setPeriodoSeleccionado(p)} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700 cursor-pointer transition-all hover:-translate-y-1 group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-2 bg-blue-950 dark:bg-blue-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" /> Periodo Asignado
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); editarPeriodo(p); }} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={(e) => eliminarPeriodo(p.id_periodo, e)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 pr-4 line-clamp-1">{p.nombre}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6 line-clamp-1">{formatearFecha(p.fecha_inicio)} a {formatearFecha(p.fecha_fin)}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{materiasDelPeriodo.length} Materias</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

            ) : vista === 'lista' ? (
              
              // VISTA 2: LISTA
              <div className="overflow-x-auto flex-1 p-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-sm uppercase tracking-wider">
                      <th className="p-4 font-bold">Periodo</th>
                      <th className="p-4 font-bold">Duración</th>
                      <th className="p-4 font-bold text-center w-32">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {periodos.map(p => (
                      <tr key={p.id_periodo} onClick={() => setPeriodoSeleccionado(p)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors align-middle cursor-pointer group rounded-2xl">
                        <td className="p-4">
                          <p className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.nombre}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-semibold bg-blue-50 dark:bg-blue-900/30 inline-block px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800/50">
                            {materias.filter(m => m.id_periodo === p.id_periodo).length} Materias asignadas
                          </p>
                        </td>
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400 font-medium">{formatearFecha(p.fecha_inicio)} a {formatearFecha(p.fecha_fin)}</td>
                        <td className="p-4 flex justify-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); editarPeriodo(p); }} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                          <button onClick={(e) => eliminarPeriodo(p.id_periodo, e)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            ) : (

              // VISTA 3: LÍNEA DE TIEMPO (VISUAL / HORIZONTAL RESTAURADA)
              <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl">
                <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold dark:text-white text-gray-800">Escala Anual: <span className="text-blue-950 dark:text-blue-400">{anoFiltro}</span></h3>
                  <div className="flex gap-2">
                    <button onClick={() => setAnoFiltro(anoFiltro - 1)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-white transition-colors"><ChevronLeft className="w-5 h-5"/></button>
                    <button onClick={() => setAnoFiltro(anoFiltro + 1)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-white transition-colors"><ChevronRight className="w-5 h-5"/></button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
                  <div className="min-w-[900px] p-6">
                    
                    <div className="grid grid-cols-[140px_repeat(12,_1fr)] gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                      <div className="font-bold text-gray-400 dark:text-gray-500 uppercase text-xs tracking-wider">Periodo</div>
                      {mesesAno.map(mes => (
                        <div key={mes} className="text-center font-bold text-gray-400 dark:text-gray-500 uppercase text-xs tracking-wider">{mes}</div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {periodos
                        .filter(p => new Date(p.fecha_inicio).getFullYear() === anoFiltro || new Date(p.fecha_fin).getFullYear() === anoFiltro)
                        .map(p => {
                          const inicio = new Date(p.fecha_inicio);
                          const fin = new Date(p.fecha_fin);
                          
                          const startMonth = Math.max(0, inicio.getFullYear() < anoFiltro ? 0 : inicio.getMonth());
                          const endMonth = Math.min(11, fin.getFullYear() > anoFiltro ? 11 : fin.getMonth());
                          const anchoMeses = (endMonth - startMonth) + 1;
                          const matCount = materias.filter(m => m.id_periodo === p.id_periodo).length;

                          return (
                            <div key={p.id_periodo} className="grid grid-cols-[140px_repeat(12,_1fr)] gap-2 items-center group relative">
                              
                              <div className="flex items-center justify-between pr-2">
                                <span className="font-bold text-sm text-gray-900 dark:text-white truncate" title={p.nombre}>{p.nombre}</span>
                                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={(e) => { e.stopPropagation(); editarPeriodo(p); }} className="text-blue-500 hover:text-blue-700 p-1"><Edit2 className="w-3.5 h-3.5"/></button>
                                  <button onClick={(e) => eliminarPeriodo(p.id_periodo, e)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-3.5 h-3.5"/></button>
                                </div>
                              </div>

                              <div 
                                className="col-span-12 relative h-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex cursor-pointer hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                                onClick={() => setPeriodoSeleccionado(p)}
                              >
                                {mesesAno.map((_, i) => (
                                  <div key={i} className="flex-1 border-r border-gray-200/50 dark:border-gray-700/30 last:border-0 h-full"></div>
                                ))}

                                <div 
                                  className="absolute top-1 bottom-1 bg-blue-950 dark:bg-blue-600 rounded-lg shadow-md flex flex-col justify-center px-4 text-white transition-all group-hover:bg-blue-900 dark:group-hover:bg-blue-500 overflow-hidden z-10"
                                  style={{ left: `${(startMonth / 12) * 100}%`, width: `${(anchoMeses / 12) * 100}%` }}
                                >
                                  <span className="text-sm font-bold truncate leading-tight">{p.nombre}</span>
                                  <span className="text-[10px] opacity-80 truncate leading-tight">{matCount} Materias</span>
                                </div>
                              </div>

                            </div>
                          );
                      })}
                      {periodos.filter(p => new Date(p.fecha_inicio).getFullYear() === anoFiltro || new Date(p.fecha_fin).getFullYear() === anoFiltro).length === 0 && (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                          <p>No hay periodos registrados que abarquen el año {anoFiltro}.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {mostrarFormulario && (
          <div className="xl:col-span-1 overflow-y-auto pr-2 animate-in slide-in-from-right-8 duration-300 shrink-0">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b dark:border-gray-800 pb-4 transition-colors">{idEditando ? 'Editar Periodo' : 'Nuevo Periodo'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors">Nombre (AAAA-N)</label><input type="text" value={nombre} onChange={handleNombreChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all" required /></div>
                <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors">Inicio</label><input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all" required /></div>
                <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors">Fin</label><input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all" required /></div>
                <button type="submit" className="w-full bg-blue-950 dark:bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-900 dark:hover:bg-blue-500 mt-4 transition-colors">
                   {idEditando ? 'Guardar Cambios' : 'Crear Periodo'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* MODAL Interactivo de Materias del Periodo */}
      {periodoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4" onClick={() => setPeriodoSeleccionado(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl border dark:border-gray-800 flex flex-col max-h-[80vh] transition-colors" onClick={e => e.stopPropagation()}>
            
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-gray-800 pb-4 shrink-0 transition-colors">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors pr-4">Periodo {periodoSeleccionado.nombre}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2 mt-1 transition-colors">
                  <CalendarIcon className="w-4 h-4" />
                  {formatearFecha(periodoSeleccionado.fecha_inicio)} a {formatearFecha(periodoSeleccionado.fecha_fin)}
                </p>
              </div>
              <button onClick={() => setPeriodoSeleccionado(null)} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2">
              <h4 className="font-bold text-sm text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 transition-colors">Materias Asignadas</h4>
              
              {materias.filter(m => m.id_periodo === periodoSeleccionado.id_periodo).length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Aún no hay materias registradas en este periodo.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {materias
                    .filter(m => m.id_periodo === periodoSeleccionado.id_periodo)
                    .map(materia => (
                      <div key={materia.id_materia} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex items-start gap-3 hover:shadow-sm transition-all">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg shrink-0">
                          <BookOpen className="w-5 h-5 text-blue-900 dark:text-blue-400 transition-colors" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white line-clamp-1 transition-colors">{materia.nombre}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate transition-colors">Prof: {materia.profesor || 'Sin asignar'}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0 flex justify-end transition-colors">
               <button onClick={() => setPeriodoSeleccionado(null)} className="px-6 py-2.5 bg-blue-950 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-900 dark:hover:bg-blue-500 transition-colors">Entendido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}