import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, CheckSquare, CheckCircle, Circle, Clock } from 'lucide-react';

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el formulario
  const [idEditando, setIdEditando] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [idMateria, setIdMateria] = useState('');
  
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    try {
      const [resTareas, resMaterias] = await Promise.all([
        api.get('/tareas'),
        api.get('/materias')
      ]);
      
      setTareas(resTareas.data);
      setMaterias(resMaterias.data);
      
      if (resMaterias.data.length > 0 && !idEditando) {
        setIdMateria(resMaterias.data[0].id_materia);
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { titulo, descripcion, fecha_entrega: fechaEntrega, id_materia: idMateria };

      if (idEditando) {
        // En la edición, tu backend ignora id_materia si lo enviamos, lo cual está bien
        await api.put(`/tareas/${idEditando}`, data);
        mostrarMensaje('Tarea actualizada correctamente', 'exito');
      } else {
        await api.post('/tareas', data);
        mostrarMensaje('Tarea creada correctamente', 'exito');
      }
      
      cancelarEdicion();
      fetchDatos();
    } catch (error) {
      mostrarMensaje(error.response?.data?.error || 'Ocurrió un error', 'error');
    }
  };

  const editarTarea = (tarea) => {
    setIdEditando(tarea.id_tarea);
    setTitulo(tarea.titulo);
    setDescripcion(tarea.descripcion || '');
    setFechaEntrega(tarea.fecha_entrega.substring(0, 10));
    setIdMateria(tarea.id_materia);
  };

  const eliminarTarea = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta tarea?')) return;
    
    try {
      await api.delete(`/tareas/${id}`);
      mostrarMensaje('Tarea eliminada', 'exito');
      fetchDatos();
    } catch (error) {
      mostrarMensaje('Error al eliminar', 'error');
    }
  };

  // Función especial para marcar como completada
  const marcarCompletada = async (id) => {
    try {
      await api.patch(`/tareas/${id}/completar`);
      mostrarMensaje('¡Tarea completada!', 'exito');
      fetchDatos();
    } catch (error) {
      mostrarMensaje('Error al actualizar el estado', 'error');
    }
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    setTitulo('');
    setDescripcion('');
    setFechaEntrega('');
    if (materias.length > 0) setIdMateria(materias[0].id_materia);
  };

  const formatearFecha = (fechaString) => {
    // Para las tareas, un formato más corto es mejor
    const opciones = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando tareas...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-950 p-3 rounded-xl shadow-md">
          <CheckSquare className="text-white w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gestión de Tareas</h1>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-xl text-sm font-bold text-center ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Validación: Si no hay materias, no puede crear tareas */}
      {materias.length === 0 ? (
        <div className="bg-orange-50 border border-orange-200 p-8 rounded-3xl text-center">
          <h2 className="text-xl font-bold text-orange-800 mb-2">Paso previo requerido</h2>
          <p className="text-orange-700 mb-4">No puedes registrar tareas porque aún no tienes ninguna Materia registrada.</p>
          <p className="text-sm font-medium text-orange-600">Ve a la sección de Materias y crea una primero.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Panel Izquierdo: Formulario */}
          <div className="xl:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">
                {idEditando ? 'Editar Tarea' : 'Nueva Tarea'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Título de la Tarea</label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej. Resumen Capítulo 1"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-950 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción (Opcional)</label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Detalles de la tarea..."
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-950 focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Entrega</label>
                  <input
                    type="date"
                    value={fechaEntrega}
                    onChange={(e) => setFechaEntrega(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-950 focus:outline-none text-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Materia</label>
                  <select
                    value={idMateria}
                    onChange={(e) => setIdMateria(e.target.value)}
                    disabled={idEditando !== null}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-950 focus:outline-none text-gray-700 disabled:opacity-50"
                    required
                  >
                    {materias.map(m => (
                      <option key={m.id_materia} value={m.id_materia}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-950 text-white py-3 rounded-xl hover:bg-blue-900 font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    {idEditando ? 'Guardar' : 'Agregar'}
                  </button>
                  {idEditando && (
                    <button
                      type="button"
                      onClick={cancelarEdicion}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Panel Derecho: Lista de Tareas */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
              {tareas.length === 0 ? (
                <div className="flex-1 p-12 flex items-center justify-center text-center text-gray-500 font-medium">
                  Excelente, no tienes tareas pendientes. Registra una nueva.
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                        <th className="p-4 font-semibold w-16 text-center">Estado</th>
                        <th className="p-4 font-semibold">Tarea y Descripción</th>
                        <th className="p-4 font-semibold">Materia</th>
                        <th className="p-4 font-semibold">Entrega</th>
                        <th className="p-4 font-semibold text-center w-32">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {tareas.map((tarea) => (
                        <tr key={tarea.id_tarea} className={`transition-colors ${tarea.completada ? 'bg-gray-50/50 opacity-75' : 'hover:bg-gray-50/50'}`}>
                          
                          {/* Columna: Botón de Estado (Rápido) */}
                          <td className="p-4 text-center">
                            {tarea.completada ? (
                              <div className="flex justify-center text-green-500">
                                <CheckCircle className="w-7 h-7" />
                              </div>
                            ) : (
                              <button 
                                onClick={() => marcarCompletada(tarea.id_tarea)}
                                className="text-gray-300 hover:text-green-500 transition-colors"
                                title="Marcar como completada"
                              >
                                <Circle className="w-7 h-7" />
                              </button>
                            )}
                          </td>

                          {/* Columna: Título y Descripción */}
                          <td className="p-4">
                            <p className={`font-bold text-gray-900 ${tarea.completada ? 'line-through text-gray-500' : ''}`}>
                              {tarea.titulo}
                            </p>
                            {tarea.descripcion && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                {tarea.descripcion}
                              </p>
                            )}
                          </td>

                          {/* Columna: Materia */}
                          <td className="p-4">
                            <span className="text-sm text-blue-900 font-medium bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100 whitespace-nowrap">
                              {tarea.materia}
                            </span>
                          </td>

                          {/* Columna: Fecha */}
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {formatearFecha(tarea.fecha_entrega)}
                            </div>
                          </td>

                          {/* Columna: Acciones */}
                          <td className="p-4 flex justify-center gap-1">
                            {!tarea.completada && (
                              <button
                                onClick={() => editarTarea(tarea)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => eliminarTarea(tarea.id_tarea)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}