const express 	  = require('express'),
	  router  	  = express.Router();
const db 	  	  = require('../db/pool').pool;
const controlador = require('../controllers/transformador');

// Obtiene todos los transformadores de la DB
router.get	  ('/',                   controlador.obtenerTransformadores);

// Añade un transformador de un voltaje y amperaje
router.post	  ('/:voltaje/:amperaje', controlador.insertarTransformador);

// Elimina un transformador con un voltaje y amperaje concretos
router.delete ('/:voltaje/:amperaje', controlador.eliminarTransformador);

// Elimina un transformador a partir de su id
router.delete ('/:id', 				  controlador.eliminarTransformador);

module.exports = router;