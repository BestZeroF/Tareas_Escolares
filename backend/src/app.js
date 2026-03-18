const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración de CORS para permitir conexiones desde la red local
const corsOptions = {
  origin: [
    'http://localhost:5173',          // Para cuando trabajas directo en tu PC
    'http://192.168.1.233:5173'       // Para cuando te conectas desde el celular/otra PC
  ],
  credentials: true, // Permite el envío de tokens y cookies
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/periodos', require('./routes/periodos.routes'));
app.use('/api/materias', require('./routes/materias.routes'));
app.use('/api/horarios', require('./routes/horarios.routes'));
app.use('/api/tareas', require('./routes/tareas.routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => { // '0.0.0.0' expone el servidor a toda la red
  console.log(`Servidor corriendo en el puerto ${PORT} y disponible en la red local`);
});