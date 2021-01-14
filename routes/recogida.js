const express 	  = require('express'),
	  router  	  = express.Router();
const db 	  	  = require('../db/pool').pool;
const controlador = require('../controllers/recogida');

// Obtiene todas las recogidas por tipo
router.get	  ('/:tipo',                controlador.obtenerRecogida);

module.exports = router;