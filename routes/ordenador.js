const express 	  = require('express'),
	  router  	  = express.Router();
const db 	  	  = require('../db/pool').pool;
const controlador = require('../controllers/ordenador');
const { body } = require('express-validator');

// Obtiene todos los ordenadores por tipo
router.get	  ('/:tipo?',                controlador.obtenerOrdenadores);

// Obtiene todos los compoenentes de un ordenador
router.get	  ('/info/:id',       			 controlador.obtenerOrdenador);

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

// Añadir una compnente a un portátil
router.post	  ('/:id_ord/componente/:id_comp', controlador.aniadirComponente);

// Modificar un ordenador
router.put	  ('/:id',[ 
	body('localizacion_taller').optional().isString().withMessage('Valor no válido en localizacion_taller'),
	body('observaciones').optional().isString().withMessage('Valor no válido en observaciones'),
	body('tamano').optional().isString().withMessage('Valor no válido en tamano'),
	body('estado').optional().isIn(['Desconocido', 'Bueno', 'Regular', 'Por revisar', 'No aprovechable', 'Roto']).not().isEmpty().withMessage('Tipo no válido. Tiene que estar entre los siguientes valores: Desconocido, Bueno, Regular, Por revisar, No aprovechable, Roto')
],										 controlador.modificarOrdenador);

// Elimina un ordenador pero no sus componentes
router.delete ('/:id',                   controlador.eliminarOrdenador);

// Elimina un ordenador y sus componentes
router.delete ('/:id/componente',        controlador.eliminarOrdenadorConComponentes);

module.exports = router;