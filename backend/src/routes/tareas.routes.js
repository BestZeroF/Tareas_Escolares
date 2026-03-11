const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const controller = require('../controllers/tareas.controller');

router.post('/', verificarToken, controller.crearTarea);

router.get('/', verificarToken, controller.obtenerTodasLasTareas);

router.get('/:id', verificarToken, controller.obtenerTareaPorId);

router.put('/:id', verificarToken, controller.actualizarTarea);

router.patch('/:id/completar', verificarToken, controller.marcarComoCompletada);

router.delete('/:id', verificarToken, controller.eliminarTarea);


router.get('/estado/pendientes', verificarToken, controller.tareasPendientes);
router.get('/estado/vencidas', verificarToken, controller.tareasVencidas);
router.get('/estado/completadas', verificarToken, controller.tareasCompletadas);


module.exports = router;
