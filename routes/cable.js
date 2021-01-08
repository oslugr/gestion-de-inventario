const express 	  = require('express'),
	  router  	  = express.Router();
const db 	  	  = require('../db/pool').pool;
const controlador = require('../controllers/cable');

// Obtiene todas los cables de la DB
router.get	  ('/',                     controlador.obtenerCables);
// Añade un cable de un tipo con su versión
router.post	  ('/:tipo/:version_tipo?', controlador.insertarCable);
// Elimina un cable del tipo y versión de tipo especificados
router.delete ('/:tipo/:version_tipo?', controlador.eliminarCable);

module.exports = router;