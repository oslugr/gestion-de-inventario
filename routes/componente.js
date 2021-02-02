const express 	  = require('express'),
	  router  	  = express.Router();
const db 	  	  = require('../db/pool').pool;
const controlador = require('../controllers/componente');
const { body } = require('express-validator');

// Obtiene todos los componentes de la BD, por tipo si este se especifica
router.get   ('/:tipo?',        controlador.obtenerComponentes);

// Insertar un componente en la base de datos
router.post  ('/',[ 
	body('estado').optional().isIn(['Desconocido', 'Bueno', 'Regular', 'Por revisar', 'No aprovechable', 'Roto']).not().isEmpty().withMessage('Tipo no válido. Tiene que estar entre los siguientes valores: Desconocido, Bueno, Regular, Por revisar, No aprovechable, Roto'),
	body('observaciones').optional().isString().withMessage('Valor no válido en observaciones'),
	body('fecha_entrada').optional().matches(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/).withMessage('Fecha mal introducida. Formatos de fecha correcto: AAAA-MM-DD'),
	body('tipo').not().isEmpty().withMessage('Tipo no introducido. Este parámetro es obligatorio'),
	body('caracteristicas').optional().isArray().withMessage('Las características deben de ser un array'),
	body('caracteristicas.*.nombre').isString().not().isEmpty().withMessage('Algún nombre de característica no es válido'),
	body('caracteristicas.*.valor').isString().not().isEmpty().withMessage('Algún valor de característica no es válido')
],        						controlador.insertarComponente);

// Elimina una componente a partir de su id
router.delete('/:id',           controlador.eliminarComponente);

// Añade una nueva característica a una componente
router.post  ('/:id/caracteristica', [
	body('nombre').isString().not().isEmpty().withMessage('El nombre de la característica no es válido'),
	body('valor').isString().not().isEmpty().withMessage('El valor de la característica no es válido')
],                              controlador.insertarCaracteristica);

// Modifica el estado de una componente
router.put   ('/:id/estado/:estado',controlador.modificarEstado);

// Modificar una componente
router.put   ('/:id',[ 
	body('estado').optional().isIn(['Desconocido', 'Bueno', 'Regular', 'Por revisar', 'No aprovechable', 'Roto']).not().isEmpty().withMessage('Tipo no válido. Tiene que estar entre los siguientes valores: Desconocido, Bueno, Regular, Por revisar, No aprovechable, Roto'),
	body('observaciones').optional().isString().withMessage('Valor no válido en observaciones'),
	body('fecha_entrada').optional().matches(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/).withMessage('Fecha mal introducida. Formatos de fecha correcto: AAAA-MM-DD'),
	body('tipo').not().isEmpty().withMessage('Tipo no introducido. Este parámetro es obligatorio')
],        						controlador.actualizarComponente);

// Añade una nueva característica a una componente
router.put  ('/caracteristica/:id', [
	body('nombre').isString().not().isEmpty().withMessage('El nombre de la característica no es válido'),
	body('valor').isString().not().isEmpty().withMessage('El valor de la característica no es válido')
],                              controlador.modificarEstado);

module.exports = router;