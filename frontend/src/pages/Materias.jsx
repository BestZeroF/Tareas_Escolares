import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, BookMarked, X } from 'lucide-react';

export default function Materias() {
  const [materias, setMaterias] = useState([]);
  const [periodos, setPeriodos] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [nombre, setNombre] = useState('');
  const [profesor, setProfesor] = useState('');
  const [idPeriodo, setIdPeriodo] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  useEffect(() => { fetchDatos(); }, []);

  const fetchDatos = async () => {
    try {
      const [resMaterias, resPeriodos] = await Promise.all([api.get('/materias'), api.get('/periodos')]);
      setMaterias(resMaterias.data); setPeriodos(resPeriodos.data);
      if (resPeriodos.data.length > 0 && !idEditando) setIdPeriodo(resPeriodos.data[0].id_periodo);
    } catch (error) { mostrarMensaje('Error al cargar la información', 'error'); } 
    finally { setLoading(false); }
  };

  const mostrarMensaje = (texto, tipo) => { setMensaje({ texto, tipo }); setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { nombre, profesor, id_periodo: idPeriodo };
      if (idEditando) { await api.put(`/materias/${idEditando}`, { nombre, profesor }); mostrarMensaje('Materia actualizada', 'exito'); } 
      else { await api.post('/materias', data); mostrarMensaje('Materia creada', 'exito'); }
      cancelarEdicion(); fetchDatos();
    } catch (error) { mostrarMensaje(error.response?.data?.error || 'Ocurrió un error', 'error'); }
  };

  const editarMateria = (materia) => {
    setIdEditando(materia.id_materia); setNombre(materia.nombre); setProfesor(materia.profesor || ''); setIdPeriodo(materia.id_periodo);
    setMostrarFormulario(true);
  };

  const eliminarMateria = async (id) => {
    if (!window.confirm('¿Eliminar materia?')) return;
    try { await api.delete(`/materias/${id}`); mostrarMensaje('Materia eliminada', 'exito'); fetchDatos(); } 
    catch (error) { mostrarMensaje('Error al eliminar', 'error'); }
  };

  const cancelarEdicion = () => {
    setIdEditando(null); setNombre(''); setProfesor('');
    if (periodos.length > 0) setIdPeriodo(periodos[0].id_periodo);
    setMostrarFormulario(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-950 dark:bg-blue-600 p-3 rounded-xl shadow-md transition-colors"><BookMarked className="text-white w-6 h-6" /></div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Gestión de Materias</h1>
        </div>
        {periodos.length > 0 && (
          <button
            onClick={() => mostrarFormulario ? cancelarEdicion() : setMostrarFormulario(true)}
            className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${mostrarFormulario ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-blue-950 dark:bg-blue-600 text-white hover:bg-blue-900 dark:hover:bg-blue-500'}`}
          >
            {mostrarFormulario ? <><X className="w-5 h-5" /> Cerrar Panel</> : <><Plus className="w-5 h-5" /> Nueva Materia</>}
          </button>
        )}
      </div>

      {mensaje.texto && <div className={`p-4 rounded-xl text-sm font-bold text-center ${mensaje.tipo === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>{mensaje.texto}</div>}

      {periodos.length === 0 ? (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-8 rounded-3xl text-center">
          <h2 className="text-xl font-bold text-orange-800 dark:text-orange-400 mb-2">¡Alto ahí!</h2>
          <p className="text-orange-700 dark:text-orange-300">No puedes crear materias porque aún no tienes ningún Periodo Escolar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1 min-h-0">
          <div className={`transition-all duration-300 h-full ${mostrarFormulario ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden h-full flex flex-col transition-colors">
              {materias.length === 0 ? (
                <div className="flex-1 p-12 flex items-center justify-center text-center text-gray-500 dark:text-gray-400 font-medium">Aún no tienes materias. Haz clic en "Nueva Materia".</div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-sm">
                        <th className="p-4 font-semibold">Materia</th>
                        <th className="p-4 font-semibold">Profesor</th>
                        <th className="p-4 font-semibold">Periodo</th>
                        <th className="p-4 font-semibold text-center w-32">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {materias.map((materia) => (
                        <tr key={materia.id_materia} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="p-4 font-bold text-gray-900 dark:text-gray-100">{materia.nombre}</td>
                          <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{materia.profesor || '-'}</td>
                          <td className="p-4 text-sm text-blue-900 dark:text-blue-300 font-medium"><span className="bg-blue-50/50 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800/50">{materia.periodo}</span></td>
                          <td className="p-4 flex justify-center gap-2">
                            <button onClick={() => editarMateria(materia)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                            <button onClick={() => eliminarMateria(materia.id_materia)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b dark:border-gray-800 pb-4">{idEditando ? 'Editar Materia' : 'Nueva Materia'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-950 dark:focus:ring-blue-600 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Profesor (Opcional)</label>
                    <input type="text" value={profesor} onChange={(e) => setProfesor(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-950 dark:focus:ring-blue-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Periodo Escolar</label>
                    <select value={idPeriodo} onChange={(e) => setIdPeriodo(e.target.value)} disabled={idEditando !== null} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-950 dark:focus:ring-blue-600 outline-none disabled:opacity-50">
                      {periodos.map(p => <option key={p.id_periodo} value={p.id_periodo}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-blue-950 dark:bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-900 dark:hover:bg-blue-500 font-bold transition-colors mt-4">
                    {idEditando ? 'Guardar Cambios' : 'Crear Materia'}
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