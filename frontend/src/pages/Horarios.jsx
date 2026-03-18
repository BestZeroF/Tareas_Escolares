import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, Clock as ClockIcon, X } from 'lucide-react';

export default function Horarios() {
  const [horarios, setHorarios] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
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
  const horas = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
  
  const paletaColores = [
    { id: 'blue', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900' },
    { id: 'green', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900' },
    { id: 'purple', bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900' },
    { id: 'orange', bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900' },
    { id: 'pink', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900' },
    { id: 'teal', bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-900' },
  ];

  useEffect(() => { fetchDatos(); }, []);

  const fetchDatos = async () => {
    try {
      const [resH, resM] = await Promise.all([api.get('/horarios'), api.get('/materias')]);
      setHorarios(resH.data); setMaterias(resM.data);
      if (resM.data.length > 0) setIdMateria(resM.data[0].id_materia);
    } catch (e) { mostrarMensaje('Error', 'error'); } 
    finally { setLoading(false); }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validar que la hora tenga sentido lógico
    const inicioNum = parseInt(horaInicio.substring(0, 2));
    const finNum = parseInt(horaFin.substring(0, 2));

    if (inicioNum >= finNum) {
      return mostrarMensaje('La hora fin debe ser posterior a la de inicio', 'error');
    }

    // 2. VALIDACIÓN ESTRELLA: Evitar que las clases se encimen
    const choque = horarios.find(h => {
      if (h.dia_semana !== diaSemana) return false;
      const hIni = parseInt(h.hora_inicio.substring(0, 2));
      const hFin = parseInt(h.hora_fin.substring(0, 2));
      // Fórmula matemática de colisión: (Inicio A < Fin B) y (Fin A > Inicio B)
      return (inicioNum < hFin) && (finNum > hIni);
    });

    if (choque) {
      // Si choca, bloqueamos el envío y le decimos al usuario con qué materia chocó
      return mostrarMensaje(`¡Cuidado! Este horario choca con "${choque.materia || 'otra materia'}"`, 'error');
    }

    // 3. Si todo está libre, guardamos en la base de datos
    try {
      await api.post('/horarios', { 
        id_materia: idMateria, 
        dia_semana: diaSemana, 
        hora_inicio: horaInicio + ':00', 
        hora_fin: horaFin + ':00', 
        color: colorSeleccionado 
      });
      mostrarMensaje('Clase agregada', 'exito');
      setMostrarFormulario(false);
      fetchDatos();
    } catch (error) { 
      mostrarMensaje('Error al guardar en el servidor', 'error'); 
    }
  };

  const eliminarHorario = async (id) => {
    if (!window.confirm('¿Eliminar bloque?')) return;
    try { await api.delete(`/horarios/${id}`); fetchDatos(); } catch (e) {}
  };

  const obtenerEstilosColor = (colorId) => {
    const color = paletaColores.find(c => c.id === colorId) || paletaColores[0];
    return `${color.bg} ${color.border} ${color.text}`;
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-950 p-3 rounded-xl shadow-md"><ClockIcon className="text-white w-6 h-6" /></div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mi Horario Escolar</h1>
        </div>
        
        {materias.length > 0 && (
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${mostrarFormulario ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-950 text-white hover:bg-blue-900'}`}
          >
            {mostrarFormulario ? <><X className="w-5 h-5" /> Cerrar Panel</> : <><Plus className="w-5 h-5" /> Agregar Clase</>}
          </button>
        )}
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-xl text-sm font-bold text-center ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{mensaje.texto}</div>
      )}

      {materias.length === 0 ? (
        <div className="bg-orange-50 border border-orange-200 p-8 rounded-3xl text-center">
          <h2 className="text-xl font-bold text-orange-800 mb-2">Sin Materias</h2>
          <p className="text-orange-700">Debes tener materias para armar tu horario.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1 min-h-0">
          
          {/* Panel Principal: Calendario */}
          <div className={`transition-all duration-300 h-full ${mostrarFormulario ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
              <div className="overflow-auto flex-1 p-4">
                <table className="w-full min-w-[600px] border-collapse table-fixed h-full">
                  <thead>
                    <tr>
                      <th className="w-20 p-2 border-b-2 border-gray-100"></th>
                      {dias.map(d => <th key={d.valor} className="p-3 text-center border-b-2 border-gray-100 text-gray-700 font-bold">{d.etiqueta}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {horas.map((hora) => (
                      <tr key={hora}>
                        <td className="p-2 border-b border-gray-100 text-sm font-semibold text-gray-500 text-right align-top border-r h-20">{hora}</td>
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
                              <td key={`${dia.valor}-${hora}`} rowSpan={duracion} className="border border-gray-50 p-0 relative align-top">
                                <div className={`absolute inset-1.5 rounded-xl border flex flex-col justify-center items-center text-center p-2 shadow-sm group hover:shadow-md hover:z-10 transition-all ${obtenerEstilosColor(claseInicio.color)}`}>
                                  <span className="font-bold text-sm sm:text-base">{claseInicio.materia}</span>
                                  <span className="text-xs font-semibold opacity-75 mt-1">{claseInicio.hora_inicio.substring(0,5)} - {claseInicio.hora_fin.substring(0,5)}</span>
                                  <button onClick={() => eliminarHorario(claseInicio.id_horario)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-600 bg-white/70 hover:bg-red-200 p-1.5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            );
                          }
                          return <td key={`${dia.valor}-${hora}`} className="border border-gray-50 p-1.5 relative h-20"><div className="w-full h-full border border-dashed border-transparent hover:border-gray-200 rounded-lg"></div></td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Panel Derecho: Formulario */}
          {mostrarFormulario && (
            <div className="xl:col-span-1 overflow-y-auto pr-2 animate-in slide-in-from-right-8 duration-300">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Agregar Clase</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Materia</label>
                    <select value={idMateria} onChange={(e) => setIdMateria(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-950 outline-none">{materias.map(m => <option key={m.id_materia} value={m.id_materia}>{m.nombre}</option>)}</select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Día</label>
                    <select value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-950 outline-none">{dias.map(d => <option key={d.valor} value={d.valor}>{d.etiqueta}</option>)}</select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Inicio</label>
                      <select value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">{horas.map(h => <option key={h} value={h}>{h}</option>)}</select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Fin</label>
                      <select value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">{[...horas.slice(1), '15:00'].map(h => <option key={h} value={h}>{h}</option>)}</select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                    <div className="flex gap-2 flex-wrap">{paletaColores.map(c => <button key={c.id} type="button" onClick={() => setColorSeleccionado(c.id)} className={`w-8 h-8 rounded-full border-2 transition-all ${c.bg} ${colorSeleccionado === c.id ? 'border-gray-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`} />)}</div>
                  </div>
                  <button type="submit" className="w-full bg-blue-950 text-white py-3 rounded-xl hover:bg-blue-900 font-bold flex items-center justify-center gap-2 mt-4"><Plus className="w-5 h-5" /> Agregar al Horario</button>
                </form>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}