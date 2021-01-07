const express 	  = require('express'),
	  router  	    = express.Router();
const db 	  	    = require('../db/pool').pool;
const controlador = require('../controllers/localizacion');

// Obtiene todas las localizaciones de la DB
router.get	  ('/',         controlador.obtenerLocalizaciones);
router.post	  ('/:nombre',  controlador.insertarLocalizacion);
router.delete ('/:nombre',  controlador.eliminarLocalizacion)

module.exports = router;