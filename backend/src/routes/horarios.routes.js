/*
Endpoints
https://localhost:3000/api/horarios/           metodo:  POST    nuevo horario
https://localhost:3000/api/horarios/materia/id metodo:  POST    consultar materia
https://localhost:3000/api/horarios/           metodo:  GET     consultar los horarios
https://localhost:3000/api/horarios/id         metodo:  PUT     actualizar los horarios
https://localhost:3000/api/horarios/id         metodo:  DEL     borrar horario por id  

*/



const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const controller = require('../controllers/horarios.controller');

// Crear un nuevo horario
router.post('/', verificarToken, controller.crearHorario);

// Consultar al horario de una materia en particular (id_materia)
router.get('/materia/:id_materia', verificarToken, controller.obtenerHorariosPorMateria);
// Consultar todos los horarios 
router.get('/', verificarToken, controller.obtenerHorarioCompleto);
// Actualizar por id
router.put('/:id', verificarToken, controller.actualizarHorario);
// Para borrar
router.delete('/:id', verificarToken, controller.eliminarHorario);

module.exports = router;
