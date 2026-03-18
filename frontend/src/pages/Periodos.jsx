import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, X } from 'lucide-react';

export default function Periodos() {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  useEffect(() => { fetchPeriodos(); }, []);

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
      fetchPeriodos();
    } catch (error) { mostrarMensaje(error.response?.data?.error || 'Error', 'error'); }
  };

  const editarPeriodo = (periodo) => {
    setIdEditando(periodo.id_periodo); setNombre(periodo.nombre);
    setFechaInicio(periodo.fecha_inicio.substring(0, 10)); setFechaFin(periodo.fecha_fin.substring(0, 10));
    setMostrarFormulario(true);
  };

  const eliminarPeriodo = async (id) => {
    if (!window.confirm('¿Eliminar este periodo?')) return;
    try { await api.delete(`/periodos/${id}`); mostrarMensaje('Eliminado', 'exito'); fetchPeriodos(); } 
    catch (error) { mostrarMensaje('Error al eliminar', 'error'); }
  };

  const cancelarEdicion = () => {
    setIdEditando(null); setNombre(''); setFechaInicio(''); setFechaFin('');
    setMostrarFormulario(false);
  };

  const formatearFecha = (fechaString) => new Date(fechaString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-950 dark:bg-blue-600 p-3 rounded-xl shadow-md transition-colors">
            <CalendarIcon className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Periodos Escolares</h1>
        </div>
        <button
          onClick={() => mostrarFormulario ? cancelarEdicion() : setMostrarFormulario(true)}
          className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${mostrarFormulario ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-blue-950 dark:bg-blue-600 text-white hover:bg-blue-900 dark:hover:bg-blue-500'}`}
        >
          {mostrarFormulario ? <><X className="w-5 h-5" /> Cerrar</> : <><Plus className="w-5 h-5" /> Nuevo</>}
        </button>
      </div>

      {mensaje.texto && <div className={`p-4 rounded-xl text-sm font-bold text-center ${mensaje.tipo === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>{mensaje.texto}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1 min-h-0">
        <div className={`transition-all duration-300 h-full ${mostrarFormulario ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden h-full flex flex-col transition-colors">
            {periodos.length === 0 ? (
              <div className="flex-1 p-12 flex items-center justify-center text-center text-gray-500 dark:text-gray-400 font-medium">No tienes periodos registrados.</div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-sm">
                      <th className="p-4 font-semibold">Nombre</th>
                      <th className="p-4 font-semibold">Duración</th>
                      <th className="p-4 font-semibold text-center w-32">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {periodos.map((periodo) => (
                      <tr key={periodo.id_periodo} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="p-4 font-bold text-gray-900 dark:text-gray-100">{periodo.nombre}</td>
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{formatearFecha(periodo.fecha_inicio)} — {formatearFecha(periodo.fecha_fin)}</td>
                        <td className="p-4 flex justify-center gap-2">
                          <button onClick={() => editarPeriodo(periodo)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                          <button onClick={() => eliminarPeriodo(periodo.id_periodo)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b dark:border-gray-800 pb-4">{idEditando ? 'Editar Periodo' : 'Nuevo Periodo'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nombre (Ej. 2026-1)</label>
                  <input type="text" value={nombre} onChange={handleNombreChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-950 dark:focus:ring-blue-600 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Inicio</label>
                  <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-950 dark:focus:ring-blue-600 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Fin</label>
                  <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-950 dark:focus:ring-blue-600 outline-none" required />
                </div>
                <button type="submit" className="w-full bg-blue-950 dark:bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-900 dark:hover:bg-blue-500 font-bold transition-colors mt-4">
                  {idEditando ? 'Guardar Cambios' : 'Crear Periodo'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}