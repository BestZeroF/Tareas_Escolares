import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, CheckSquare, CheckCircle, Circle, Clock, X } from 'lucide-react';

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [idMateria, setIdMateria] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  useEffect(() => { fetchDatos(); }, []);

  const fetchDatos = async () => {
    try {
      const [resTareas, resMaterias] = await Promise.all([api.get('/tareas'), api.get('/materias')]);
      setTareas(resTareas.data); setMaterias(resMaterias.data);
      if (resMaterias.data.length > 0 && !idEditando) setIdMateria(resMaterias.data[0].id_materia);
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

  const eliminarTarea = async (id) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;
    try { await api.delete(`/tareas/${id}`); fetchDatos(); } catch (error) { mostrarMensaje('Error', 'error'); }
  };

  const marcarCompletada = async (id) => {
    try { await api.patch(`/tareas/${id}/completar`); fetchDatos(); } catch (error) { mostrarMensaje('Error', 'error'); }
  };

  const cancelarEdicion = () => {
    setIdEditando(null); setTitulo(''); setDescripcion(''); setFechaEntrega('');
    if (materias.length > 0) setIdMateria(materias[0].id_materia);
    setMostrarFormulario(false);
  };

  const formatearFecha = (fechaString) => new Date(fechaString).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' });

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-950 dark:bg-blue-600 p-3 rounded-xl shadow-md transition-colors"><CheckSquare className="text-white w-6 h-6" /></div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Gestión de Tareas</h1>
        </div>
        {materias.length > 0 && (
          <button
            onClick={() => mostrarFormulario ? cancelarEdicion() : setMostrarFormulario(true)}
            className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${mostrarFormulario ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-blue-950 dark:bg-blue-600 text-white hover:bg-blue-900 dark:hover:bg-blue-500'}`}
          >
            {mostrarFormulario ? <><X className="w-5 h-5" /> Cerrar Panel</> : <><Plus className="w-5 h-5" /> Nueva Tarea</>}
          </button>
        )}
      </div>

      {mensaje.texto && <div className={`p-4 rounded-xl text-sm font-bold text-center ${mensaje.tipo === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>{mensaje.texto}</div>}

      {materias.length === 0 ? (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-8 rounded-3xl text-center">
          <h2 className="text-xl font-bold text-orange-800 dark:text-orange-400 mb-2">Paso previo requerido</h2>
          <p className="text-orange-700 dark:text-orange-300">Debes tener materias registradas para crear tareas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1 min-h-0">
          <div className={`transition-all duration-300 h-full ${mostrarFormulario ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden h-full flex flex-col transition-colors">
              {tareas.length === 0 ? (
                <div className="flex-1 p-12 flex items-center justify-center text-center text-gray-500 dark:text-gray-400 font-medium">Excelente, no tienes tareas. Haz clic en "Nueva Tarea".</div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-sm">
                        <th className="p-4 font-semibold w-16 text-center">Estado</th>
                        <th className="p-4 font-semibold">Tarea</th>
                        <th className="p-4 font-semibold">Materia</th>
                        <th className="p-4 font-semibold">Entrega</th>
                        <th className="p-4 font-semibold text-center w-32">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {tareas.map((t) => (
                        <tr key={t.id_tarea} className={`transition-colors ${t.completada ? 'bg-gray-50/50 dark:bg-gray-800/30 opacity-75' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                          <td className="p-4 text-center">
                            <button onClick={() => marcarCompletada(t.id_tarea)} className={`transition-colors ${t.completada ? 'text-green-500 dark:text-green-400' : 'text-gray-300 dark:text-gray-600 hover:text-green-500'}`}>
                              {t.completada ? <CheckCircle className="w-7 h-7 mx-auto" /> : <Circle className="w-7 h-7 mx-auto" />}
                            </button>
                          </td>
                          <td className="p-4">
                            <p className={`font-bold text-gray-900 dark:text-gray-100 ${t.completada ? 'line-through text-gray-500' : ''}`}>{t.titulo}</p>
                            {t.descripcion && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{t.descripcion}</p>}
                          </td>
                          <td className="p-4"><span className="text-sm text-blue-900 dark:text-blue-300 font-medium bg-blue-50/50 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800/50">{t.materia}</span></td>
                          <td className="p-4"><div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />{formatearFecha(t.fecha_entrega)}</div></td>
                          <td className="p-4 flex justify-center gap-1">
                            {!t.completada && <button onClick={() => editarTarea(t)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>}
                            <button onClick={() => eliminarTarea(t.id_tarea)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {mostrarFormulario && (
            <div className="xl:col-span-1 overflow-y-auto pr-2 animate-in slide-in-from-right-8 duration-300">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b dark:border-gray-800 pb-4">{idEditando ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Título</label>
                    <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-950 dark:focus:ring-blue-600 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                    <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows="3" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-950 dark:focus:ring-blue-600 outline-none resize-none"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Entrega</label>
                    <input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-950 dark:focus:ring-blue-600 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Materia</label>
                    <select value={idMateria} onChange={(e) => setIdMateria(e.target.value)} disabled={idEditando !== null} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-950 dark:focus:ring-blue-600 outline-none disabled:opacity-50">
                      {materias.map(m => <option key={m.id_materia} value={m.id_materia}>{m.nombre}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-blue-950 dark:bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-900 dark:hover:bg-blue-500 font-bold transition-colors mt-4">
                    {idEditando ? 'Guardar' : 'Crear Tarea'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}