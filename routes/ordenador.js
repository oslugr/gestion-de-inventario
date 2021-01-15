const express 	  = require('express'),
	  router  	  = express.Router();
const db 	  	  = require('../db/pool').pool;
const controlador = require('../controllers/ordenador');
const { body } = require('express-validator');

// Obtiene todos los ordenadores por tipo
router.get	  ('/:tipo?',                controlador.obtenerOrdenadores);

// Crear un sobremesa sin componentes
router.post	  ('/sobremesa',[ 
	body('localizacion_taller').optional().isString().withMessage('Valor no válido en localizacion_taller'),
	body('observaciones').optional().isString().withMessage('Valor no válido en observaciones'),
	body('tamano').optional().isString().withMessage('Valor no válido en tamano')
],                                       controlador.crearSobremesa);

// Crear un portatil sin componentes
router.post	  ('/portatil',[ 
	body('localizacion_taller').optional().isString().withMessage('Valor no válido en localizacion_taller'),
	body('observaciones').optional().isString().withMessage('Valor no válido en observaciones'),
	body('estado').optional().isIn(['Desconocido', 'Bueno', 'Regular', 'Por revisar', 'No aprovechable', 'Roto']).not().isEmpty().withMessage('Tipo no válido. Tiene que estar entre los siguientes valores: Desconocido, Bueno, Regular, Por revisar, No aprovechable, Roto')
],                                       controlador.crearPortatil);

module.exports = router;