import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, Clock } from 'lucide-react';

export default function Horarios() {
  const [horarios, setHorarios] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [idMateria, setIdMateria] = useState('');
  const [diaSemana, setDiaSemana] = useState('Lun');
  const [horaInicio, setHoraInicio] = useState('07:00');
  const [horaFin, setHoraFin] = useState('08:00');
  const [colorSeleccionado, setColorSeleccionado] = useState('blue');
  
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const dias = [
    { valor: 'Lun', etiqueta: 'Lunes' },
    { valor: 'Mar', etiqueta: 'Martes' },
    { valor: 'Mie', etiqueta: 'Miércoles' },
    { valor: 'Jue', etiqueta: 'Jueves' },
    { valor: 'Vie', etiqueta: 'Viernes' }
  ];
  const horas = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
  
  const paletaColores = [
    { id: 'blue', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900' },
    { id: 'green', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900' },
    { id: 'purple', bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900' },
    { id: 'orange', bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900' },
    { id: 'pink', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900' },
    { id: 'teal', bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-900' },
  ];

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    try {
      const [resHorarios, resMaterias] = await Promise.all([
        api.get('/horarios'),
        api.get('/materias')
      ]);
      
      setHorarios(resHorarios.data);
      setMaterias(resMaterias.data);
      
      if (resMaterias.data.length > 0) setIdMateria(resMaterias.data[0].id_materia);
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
    
    if (parseInt(horaInicio) >= parseInt(horaFin)) {
      mostrarMensaje('La hora de fin debe ser posterior a la de inicio', 'error');
      return;
    }

    try {
      const data = { 
        id_materia: idMateria, 
        dia_semana: diaSemana, 
        hora_inicio: horaInicio + ':00', 
        hora_fin: horaFin + ':00',
        color: colorSeleccionado
      };

      await api.post('/horarios', data);
      mostrarMensaje('Horario agregado correctamente', 'exito');
      fetchDatos();
    } catch (error) {
      mostrarMensaje(error.response?.data?.error || 'Error al guardar el horario', 'error');
    }
  };

  const eliminarHorario = async (id) => {
    if (!window.confirm('¿Eliminar este bloque del horario?')) return;
    try {
      await api.delete(`/horarios/${id}`);
      mostrarMensaje('Bloque eliminado', 'exito');
      fetchDatos();
    } catch (error) {
      mostrarMensaje('Error al eliminar', 'error');
    }
  };

  const obtenerEstilosColor = (colorId) => {
    const color = paletaColores.find(c => c.id === colorId) || paletaColores[0];
    return `${color.bg} ${color.border} ${color.text}`;
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando horario...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-950 p-3 rounded-xl shadow-md">
          <Clock className="text-white w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mi Horario Escolar</h1>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-xl text-sm font-bold text-center ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {mensaje.texto}
        </div>
      )}

      {materias.length === 0 ? (
        <div className="bg-orange-50 border border-orange-200 p-8 rounded-3xl text-center">
          <h2 className="text-xl font-bold text-orange-800 mb-2">Sin Materias</h2>
          <p className="text-orange-700">Debes tener materias registradas para poder armar tu horario.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1 min-h-0">
          
          {/* Panel Izquierdo: Formulario */}
          <div className="xl:col-span-1 overflow-y-auto pr-2">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Agregar Clase</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Materia</label>
                  <select value={idMateria} onChange={(e) => setIdMateria(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-950 outline-none" required>
                    {materias.map(m => <option key={m.id_materia} value={m.id_materia}>{m.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Día</label>
                  <select value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-950 outline-none">
                    {dias.map(d => <option key={d.valor} value={d.valor}>{d.etiqueta}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Inicio</label>
                    <select value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                      {horas.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Fin</label>
                    <select value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                      {[...horas.slice(1), '15:00'].map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Color de la materia</label>
                  <div className="flex gap-2 flex-wrap">
                    {paletaColores.map(color => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setColorSeleccionado(color.id)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${color.bg} ${colorSeleccionado === color.id ? 'border-gray-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                      />
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-950 text-white py-3 rounded-xl hover:bg-blue-900 font-bold flex items-center justify-center gap-2 mt-4">
                  <Plus className="w-5 h-5" /> Agregar al Horario
                </button>
              </form>
            </div>
          </div>

          {/* Panel Derecho: El Calendario Semanal */}
          <div className="xl:col-span-3 h-full">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
              <div className="overflow-auto flex-1 p-4">
                <table className="w-full min-w-[600px] border-collapse table-fixed h-full">
                  <thead>
                    <tr>
                      <th className="w-20 p-2 border-b-2 border-gray-100"></th>
                      {dias.map(dia => (
                        <th key={dia.valor} className="p-3 text-center border-b-2 border-gray-100 text-gray-700 font-bold">
                          {dia.etiqueta}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {horas.map((hora) => (
                      <tr key={hora}>
                        <td className="p-2 border-b border-gray-100 text-sm font-semibold text-gray-500 text-right align-top border-r h-20">
                          {hora}
                        </td>
                        
                        {dias.map(dia => {
                          // 1. Buscamos si una clase EMPIEZA exactamente a esta hora
                          const claseInicio = horarios.find(h => 
                            h.dia_semana === dia.valor && h.hora_inicio.substring(0, 5) === hora
                          );

                          // 2. Buscamos si una clase está EN CURSO
                          const claseEnCurso = horarios.find(h => {
                            const hInicio = parseInt(h.hora_inicio.substring(0, 2));
                            const hFin = parseInt(h.hora_fin.substring(0, 2));
                            const hActual = parseInt(hora.substring(0, 2));
                            return h.dia_semana === dia.valor && hActual > hInicio && hActual < hFin;
                          });

                          if (claseEnCurso) return null;

                          // Si la clase empieza en esta hora, dibujamos el bloque gigante
                          if (claseInicio) {
                            const hInicio = parseInt(claseInicio.hora_inicio.substring(0, 2));
                            const hFin = parseInt(claseInicio.hora_fin.substring(0, 2));
                            const duracion = hFin - hInicio; 

                            return (
                              <td 
                                key={`${dia.valor}-${hora}`} 
                                rowSpan={duracion} 
                                className="border border-gray-50 p-0 relative align-top"
                              >
                                {/* LA MAGIA ESTÁ AQUÍ: absolute inset-1.5 hace que se estire en toda la celda fusionada */}
                                <div className={`absolute inset-1.5 rounded-xl border flex flex-col justify-center items-center text-center p-2 shadow-sm group transition-all hover:shadow-md hover:z-10 ${obtenerEstilosColor(claseInicio.color)}`}>
                                  <span className="font-bold text-sm sm:text-base leading-tight">
                                    {claseInicio.materia}
                                  </span>
                                  <span className="text-xs font-semibold opacity-75 mt-1">
                                    {claseInicio.hora_inicio.substring(0,5)} - {claseInicio.hora_fin.substring(0,5)}
                                  </span>
                                  
                                  <button
                                    onClick={() => eliminarHorario(claseInicio.id_horario)}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-600 bg-white/70 hover:bg-red-200 p-1.5 rounded-lg transition-all"
                                    title="Eliminar clase"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            );
                          }

                          return (
                            <td key={`${dia.valor}-${hora}`} className="border border-gray-50 p-1.5 relative h-20">
                              <div className="w-full h-full border border-dashed border-transparent hover:border-gray-200 rounded-lg transition-colors"></div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}