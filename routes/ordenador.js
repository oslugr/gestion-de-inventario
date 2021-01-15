const express 	  = require('express'),
	  router  	  = express.Router();
const db 	  	  = require('../db/pool').pool;
const controlador = require('../controllers/ordenador');
const { body } = require('express-validator');

// Obtiene todos los ordenadores por tipo
router.get	  ('/:tipo?',                controlador.obtenerOrdenadores);

module.exports = router;