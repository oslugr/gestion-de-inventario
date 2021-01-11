const express 	  = require('express'),
	  router  	  = express.Router();
const db 	  	  = require('../db/pool').pool;
const controlador = require('../controllers/componente');

// Obtiene todos los componentes de la BD, por tipo si este se especifica
router.get   ('/:tipo?',        controlador.obtenerComponentes);

module.exports = router;