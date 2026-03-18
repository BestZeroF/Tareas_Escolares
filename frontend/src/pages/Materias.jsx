import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, BookMarked } from 'lucide-react';

export default function Materias() {
  const [materias, setMaterias] = useState([]);
  const [periodos, setPeriodos] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [idEditando, setIdEditando] = useState(null);
  const [nombre, setNombre] = useState('');
  const [profesor, setProfesor] = useState('');
  const [idPeriodo, setIdPeriodo] = useState('');
  
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    try {
      const [resMaterias, resPeriodos] = await Promise.all([
        api.get('/materias'),
        api.get('/periodos')
      ]);
      
      setMaterias(resMaterias.data);
      setPeriodos(resPeriodos.data);
      
      if (resPeriodos.data.length > 0 && !idEditando) {
        setIdPeriodo(resPeriodos.data[0].id_periodo);
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
      const data = { nombre, profesor, id_periodo: idPeriodo };

      if (idEditando) {
        await api.put(`/materias/${idEditando}`, { nombre, profesor });
        mostrarMensaje('Materia actualizada correctamente', 'exito');
      } else {
        await api.post('/materias', data);
        mostrarMensaje('Materia creada correctamente', 'exito');
      }
      
      cancelarEdicion();
      fetchDatos();
    } catch (error) {
      mostrarMensaje(error.response?.data?.error || 'Ocurrió un error', 'error');
    }
  };

  const editarMateria = (materia) => {
    setIdEditando(materia.id_materia);
    setNombre(materia.nombre);
    setProfesor(materia.profesor || '');
    setIdPeriodo(materia.id_periodo);
  };

  const eliminarMateria = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta materia? Se borrarán sus tareas y horarios asociados.')) return;
    
    try {
      await api.delete(`/materias/${id}`);
      mostrarMensaje('Materia eliminada', 'exito');
      fetchDatos();
    } catch (error) {
      mostrarMensaje('Error al eliminar', 'error');
    }
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    setNombre('');
    setProfesor('');
    if (periodos.length > 0) setIdPeriodo(periodos[0].id_periodo);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando materias...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-950 p-3 rounded-xl shadow-md">
          <BookMarked className="text-white w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gestión de Materias</h1>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-xl text-sm font-bold text-center ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {mensaje.texto}
        </div>
      )}

      {periodos.length === 0 ? (
        <div className="bg-orange-50 border border-orange-200 p-8 rounded-3xl text-center">
          <h2 className="text-xl font-bold text-orange-800 mb-2">¡Alto ahí!</h2>
          <p className="text-orange-700 mb-4">No puedes crear materias porque aún no tienes ningún Periodo Escolar.</p>
          <p className="text-sm font-medium text-orange-600">Ve a la sección de Periodos y crea uno primero.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Panel Izquierdo: Formulario */}
          <div className="xl:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">
                {idEditando ? 'Editar Materia' : 'Nueva Materia'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de la Materia</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Matemáticas Discretas"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-950 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Profesor (Opcional)</label>
                  <input
                    type="text"
                    value={profesor}
                    onChange={(e) => setProfesor(e.target.value)}
                    placeholder="Ej. Ing. López"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-950 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Periodo Escolar</label>
                  <select
                    value={idPeriodo}
                    onChange={(e) => setIdPeriodo(e.target.value)}
                    disabled={idEditando !== null} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-950 focus:outline-none text-gray-700 disabled:opacity-50"
                    required
                  >
                    {periodos.map(p => (
                      <option key={p.id_periodo} value={p.id_periodo}>
                        {p.nombre}
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

          {/* Panel Derecho: Lista de Materias */}
          <div className="xl:col-span-3">
            {/* Clases h-full y flex-col aplicadas aquí también */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
              {materias.length === 0 ? (
                <div className="flex-1 p-12 flex items-center justify-center text-center text-gray-500 font-medium">
                  Aún no tienes materias registradas en este periodo.
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                        <th className="p-4 font-semibold">Materia</th>
                        <th className="p-4 font-semibold">Profesor</th>
                        <th className="p-4 font-semibold">Periodo</th>
                        <th className="p-4 font-semibold text-center w-32">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {materias.map((materia) => (
                        <tr key={materia.id_materia} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 font-bold text-gray-900">{materia.nombre}</td>
                          <td className="p-4 text-sm text-gray-600">{materia.profesor || <span className="text-gray-400 italic">Sin asignar</span>}</td>
                          <td className="p-4 text-sm text-blue-900 font-medium bg-blue-50/30 rounded-lg">{materia.periodo}</td>
                          <td className="p-4 flex justify-center gap-2">
                            <button
                              onClick={() => editarMateria(materia)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => eliminarMateria(materia.id_materia)}
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