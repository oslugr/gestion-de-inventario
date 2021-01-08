const express 	  = require('express'),
	  router  	  = express.Router();
const db 	  	  = require('../db/pool').pool;
const controlador = require('../controllers/localizacion');

// Obtiene todas las localizaciones de la DB
router.get	  ('/',         controlador.obtenerLocalizaciones);
// Añade una localización con el nombre especificado
router.post	  ('/:nombre',  controlador.insertarLocalizacion);
// Elimina la localización con el nombre especificado si esta existe
router.delete ('/:nombre',  controlador.eliminarLocalizacion)

module.exports = router;