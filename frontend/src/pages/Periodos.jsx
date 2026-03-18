import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon } from 'lucide-react';

export default function Periodos() {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [idEditando, setIdEditando] = useState(null);
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    fetchPeriodos();
  }, []);

  const fetchPeriodos = async () => {
    try {
      const response = await api.get('/periodos');
      setPeriodos(response.data);
    } catch (error) {
      mostrarMensaje('Error al cargar los periodos', 'error');
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
    if (valorLimpio.length <= 6) {
      setNombre(valorLimpio);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formatoValido = /^\d{4}-\d$/;
    if (!formatoValido.test(nombre)) {
      mostrarMensaje('El formato debe ser AAAA-N (Ejemplo: 2026-1)', 'error');
      return;
    }

    try {
      const data = { nombre, fecha_inicio: fechaInicio, fecha_fin: fechaFin };

      if (idEditando) {
        await api.put(`/periodos/${idEditando}`, data);
        mostrarMensaje('Periodo actualizado correctamente', 'exito');
      } else {
        await api.post('/periodos', data);
        mostrarMensaje('Periodo creado correctamente', 'exito');
      }
      
      cancelarEdicion();
      fetchPeriodos();
    } catch (error) {
      mostrarMensaje(error.response?.data?.error || 'Ocurrió un error', 'error');
    }
  };

  const editarPeriodo = (periodo) => {
    setIdEditando(periodo.id_periodo);
    setNombre(periodo.nombre);
    setFechaInicio(periodo.fecha_inicio.substring(0, 10));
    setFechaFin(periodo.fecha_fin.substring(0, 10));
  };

  const eliminarPeriodo = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este periodo? Se borrarán las materias y tareas asociadas.')) return;
    
    try {
      await api.delete(`/periodos/${id}`);
      mostrarMensaje('Periodo eliminado', 'exito');
      fetchPeriodos();
    } catch (error) {
      mostrarMensaje('Error al eliminar', 'error');
    }
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    setNombre('');
    setFechaInicio('');
    setFechaFin('');
  };

  const formatearFecha = (fechaString) => {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando periodos...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-950 p-3 rounded-xl shadow-md">
          <CalendarIcon className="text-white w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Periodos Escolares</h1>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-xl text-sm font-bold text-center ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Panel Izquierdo: Formulario */}
        <div className="xl:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">
              {idEditando ? 'Editar Periodo' : 'Nuevo Periodo'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre (Ej. 2026-1)</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={handleNombreChange}
                  placeholder="2026-1"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-950 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-950 focus:outline-none text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-950 focus:outline-none text-gray-700"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-950 text-white py-3 rounded-xl hover:bg-blue-900 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  {idEditando ? 'Guardar Cambios' : 'Agregar'}
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

        {/* Panel Derecho: Lista de Periodos */}
        <div className="xl:col-span-3">
          {/* AQUÍ ESTÁ LA MAGIA: h-full y flex flex-col */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            {periodos.length === 0 ? (
              <div className="flex-1 p-12 flex items-center justify-center text-center text-gray-500 font-medium">
                No tienes periodos registrados aún. Crea uno nuevo para comenzar.
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                      <th className="p-4 font-semibold">Nombre del Periodo</th>
                      <th className="p-4 font-semibold">Duración</th>
                      <th className="p-4 font-semibold text-center w-32">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {periodos.map((periodo) => (
                      <tr key={periodo.id_periodo} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-bold text-gray-900">{periodo.nombre}</td>
                        <td className="p-4 text-sm text-gray-600">
                          {formatearFecha(periodo.fecha_inicio)} — {formatearFecha(periodo.fecha_fin)}
                        </td>
                        <td className="p-4 flex justify-center gap-2">
                          <button
                            onClick={() => editarPeriodo(periodo)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => eliminarPeriodo(periodo.id_periodo)}
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
    </div>
  );
}