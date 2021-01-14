const express 	  = require('express'),
	  router  	  = express.Router();
const db 	  	  = require('../db/pool').pool;
const controlador = require('../controllers/recogida');
const { body } = require('express-validator');

// Obtiene todas las recogidas por tipo
router.get	  ('/:tipo',                controlador.obtenerRecogida);
// Crea una nueva recogida
router.post	  ('/',[
	body('fecha').matches(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/).withMessage('Fecha mal introducida. Formatos de fecha correcto: AAAA-MM-DD'),
	body('tipo').isIn(['Entrega', 'Recogida']).withMessage('Tipo no válido. Tiene que estar entre los siguientes valores: Entrega, Recogida')
],                                      controlador.nuevaRecogida);

module.exports = router;