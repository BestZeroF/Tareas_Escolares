import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, Clock as ClockIcon, X, List, Calendar as CalendarIcon } from 'lucide-react';

export default function Horarios() {
  const [horarios, setHorarios] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [vista, setVista] = useState('calendario');
  const [idMateria, setIdMateria] = useState('');
  const [diaSemana, setDiaSemana] = useState('Lun');
  const [horaInicio, setHoraInicio] = useState('07:00');
  const [horaFin, setHoraFin] = useState('08:00');
  const [colorSeleccionado, setColorSeleccionado] = useState('blue');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const dias = [
    { valor: 'Lun', etiqueta: 'Lunes' }, { valor: 'Mar', etiqueta: 'Martes' },
    { valor: 'Mie', etiqueta: 'Miércoles' }, { valor: 'Jue', etiqueta: 'Jueves' }, { valor: 'Vie', etiqueta: 'Viernes' }
  ];
  const horasVisuales = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
  const horasFormulario = Array.from({ length: 23 }, (_, i) => `${String(i + 1).padStart(2, '0')}:00`);
  
  // Paleta de colores optimizada para Dark Mode
  const paletaColores = [
    { id: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/40', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-900 dark:text-blue-200' },
    { id: 'green', bg: 'bg-green-100 dark:bg-green-900/40', border: 'border-green-300 dark:border-green-700', text: 'text-green-900 dark:text-green-200' },
    { id: 'purple', bg: 'bg-purple-100 dark:bg-purple-900/40', border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-900 dark:text-purple-200' },
    { id: 'orange', bg: 'bg-orange-100 dark:bg-orange-900/40', border: 'border-orange-300 dark:border-orange-700', text: 'text-orange-900 dark:text-orange-200' },
    { id: 'pink', bg: 'bg-pink-100 dark:bg-pink-900/40', border: 'border-pink-300 dark:border-pink-700', text: 'text-pink-900 dark:text-pink-200' },
    { id: 'teal', bg: 'bg-teal-100 dark:bg-teal-900/40', border: 'border-teal-300 dark:border-teal-700', text: 'text-teal-900 dark:text-teal-200' },
  ];

  useEffect(() => { fetchDatos(); }, []);
  
  const fetchDatos = async () => {
    try {
      const [resH, resM] = await Promise.all([api.get('/horarios'), api.get('/materias')]);
      setHorarios(resH.data); setMaterias(resM.data);
      if (resM.data.length > 0) setIdMateria(resM.data[0].id_materia);
    } catch (e) { mostrarMensaje('Error al cargar datos', 'error'); } 
    finally { setLoading(false); }
  };

  const mostrarMensaje = (texto, tipo) => { setMensaje({ texto, tipo }); setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inicioNum = parseInt(horaInicio.substring(0, 2)), finNum = parseInt(horaFin.substring(0, 2));
    if (inicioNum >= finNum) return mostrarMensaje('La hora fin debe ser posterior', 'error');
    const choque = horarios.find(h => h.dia_semana === diaSemana && inicioNum < parseInt(h.hora_fin.substring(0, 2)) && finNum > parseInt(h.hora_inicio.substring(0, 2)));
    if (choque) return mostrarMensaje(`Choca con "${choque.materia}"`, 'error');
    try {
      await api.post('/horarios', { id_materia: idMateria, dia_semana: diaSemana, hora_inicio: horaInicio + ':00', hora_fin: horaFin + ':00', color: colorSeleccionado });
      mostrarMensaje('Clase agregada', 'exito'); setMostrarFormulario(false); fetchDatos();
    } catch (error) { mostrarMensaje('Error al guardar', 'error'); }
  };

  const eliminarHorario = async (id, e) => {
    if (e) e.stopPropagation(); 
    if (!window.confirm('¿Eliminar esta clase?')) return;
    try { await api.delete(`/horarios/${id}`); mostrarMensaje('Clase eliminada', 'exito'); fetchDatos(); } catch (error) { mostrarMensaje('Error al eliminar', 'error'); }
  };

  const obtenerEstilosColor = (colorId) => {
    const color = paletaColores.find(c => c.id === colorId) || paletaColores[0];
    return `${color.bg} ${color.border} ${color.text}`;
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-950 dark:bg-blue-600 p-3 rounded-xl shadow-md transition-colors"><ClockIcon className="text-white w-6 h-6" /></div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Mi Horario</h1>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl shadow-inner">
            <button onClick={() => setVista('calendario')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${vista === 'calendario' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-950 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}><CalendarIcon className="w-4 h-4" /> Visual</button>
            <button onClick={() => setVista('lista')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${vista === 'lista' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-950 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}><List className="w-4 h-4" /> Lista</button>
          </div>
          <button onClick={() => setMostrarFormulario(!mostrarFormulario)} className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm whitespace-nowrap ${mostrarFormulario ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-blue-950 dark:bg-blue-600 text-white hover:bg-blue-900 dark:hover:bg-blue-500'}`}>{mostrarFormulario ? <><X className="w-5 h-5"/> Cerrar</> : <><Plus className="w-5 h-5"/> Agregar</>}</button>
        </div>
      </div>

      {mensaje.texto && <div className={`p-4 rounded-xl text-sm font-bold text-center ${mensaje.tipo === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>{mensaje.texto}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1 min-h-0">
        <div className={`transition-all duration-300 h-full ${mostrarFormulario ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden h-full flex flex-col transition-colors">
            {vista === 'lista' ? (
              <div className="overflow-auto flex-1 p-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-sm">
                      <th className="p-4 font-semibold">Materia</th>
                      <th className="p-4 font-semibold">Día</th>
                      <th className="p-4 font-semibold">Horario</th>
                      <th className="p-4 font-semibold text-center w-32">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {horarios.map(h => (
                      <tr key={h.id_horario} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="p-4 font-bold text-gray-900 dark:text-white"><span className={`inline-block w-3 h-3 rounded-full mr-2 ${obtenerEstilosColor(h.color).split(' ')[0]}`}></span>{h.materia}</td>
                        <td className="p-4 text-gray-700 dark:text-gray-300 font-medium">{h.dia_semana}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-400">{h.hora_inicio.substring(0,5)} - {h.hora_fin.substring(0,5)}</td>
                        <td className="p-4 text-center"><button onClick={(e) => eliminarHorario(h.id_horario, e)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-auto flex-1 p-4">
                <table className="w-full min-w-[600px] border-collapse table-fixed h-full">
                  <thead>
                    <tr className="text-sm">
                      <th className="w-20 p-2 border-b-2 border-gray-100 dark:border-gray-800"></th>
                      {dias.map(d => <th key={d.valor} className="p-3 text-center border-b-2 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-400 font-bold">{d.etiqueta}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {horasVisuales.map((hora) => (
                      <tr key={hora}>
                        <td className="p-2 border-b border-gray-100 dark:border-gray-800 text-sm font-semibold text-gray-500 text-right align-top border-r dark:border-r-gray-800 h-20">{hora}</td>
                        {dias.map(dia => {
                          const claseInicio = horarios.find(h => h.dia_semana === dia.valor && h.hora_inicio.substring(0, 5) === hora);
                          const claseEnCurso = horarios.find(h => {
                            const hIni = parseInt(h.hora_inicio.substring(0, 2)), hFin = parseInt(h.hora_fin.substring(0, 2)), hAct = parseInt(hora.substring(0, 2));
                            return h.dia_semana === dia.valor && hAct > hIni && hAct < hFin;
                          });
                          if (claseEnCurso) return null;
                          if (claseInicio) {
                            const duracion = parseInt(claseInicio.hora_fin.substring(0,2)) - parseInt(claseInicio.hora_inicio.substring(0,2));
                            return (
                              <td key={`${dia.valor}-${hora}`} rowSpan={duracion} className="border border-gray-50 dark:border-gray-800 p-0 relative align-top">
                                <div className={`absolute inset-1.5 rounded-xl border flex flex-col justify-center items-center text-center p-2 shadow-sm group transition-all ${obtenerEstilosColor(claseInicio.color)}`}>
                                  <span className="font-bold text-sm">{claseInicio.materia}</span>
                                  <span className="text-xs font-semibold opacity-75 mt-1">{claseInicio.hora_inicio.substring(0,5)} - {claseInicio.hora_fin.substring(0,5)}</span>
                                  <button onClick={(e) => eliminarHorario(claseInicio.id_horario, e)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-600 bg-white/80 dark:bg-black/50 hover:bg-red-200 dark:hover:bg-red-900/50 p-1.5 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            );
                          }
                          return <td key={`${dia.valor}-${hora}`} className="border border-gray-50 dark:border-gray-800 p-1.5 relative h-20"><div className="w-full h-full border border-dashed border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-lg"></div></td>;
                        })}
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b dark:border-gray-800 pb-4">Agregar Clase</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Materia</label>
                  <select value={idMateria} onChange={(e) => setIdMateria(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-950 dark:focus:ring-blue-600 outline-none">{materias.map(m => <option key={m.id_materia} value={m.id_materia}>{m.nombre}</option>)}</select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Día</label>
                  <select value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-950 dark:focus:ring-blue-600 outline-none">{dias.map(d => <option key={d.valor} value={d.valor}>{d.etiqueta}</option>)}</select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Inicio</label>
                    <select value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl outline-none">{horasFormulario.map(h => <option key={h} value={h}>{h}</option>)}</select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Fin</label>
                    <select value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl outline-none">{[...horasFormulario.slice(1), '24:00'].map(h => <option key={h} value={h}>{h}</option>)}</select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color</label>
                  <div className="flex gap-2 flex-wrap">{paletaColores.map(c => <button key={c.id} type="button" onClick={() => setColorSeleccionado(c.id)} className={`w-8 h-8 rounded-full border-2 transition-all ${c.bg} ${colorSeleccionado === c.id ? 'border-gray-800 dark:border-white scale-110 shadow-md' : 'border-transparent hover:scale-105'}`} />)}</div>
                </div>
                <button type="submit" className="w-full bg-blue-950 dark:bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-900 dark:hover:bg-blue-500 font-bold transition-colors mt-4"><Plus className="w-5 h-5"/> Agregar al Horario</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}