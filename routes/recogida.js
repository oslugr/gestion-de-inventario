const express 	  = require('express'),
	  router  	  = express.Router();
const db 	  	  = require('../db/pool').pool;
const controlador = require('../controllers/recogida');
const { body } = require('express-validator');

// Obtiene todas las recogidas por tipo
router.get	  ('/:tipo',                controlador.obtenerRecogida);

// Obtiene todas las recogidas por tipo
router.get	  ('/info/:id', 			controlador.obtenerRecogidaId);

// Obtiene los cables de una recogida
router.get	  ('/:id/cable',            controlador.obtenerCables);

// Obtiene los transformadores de una recogida
router.get	  ('/:id/transformador',    controlador.obtenerTransformadores);

// Obtiene los ordenadores de una recogida
router.get	  ('/:id/ordenador',        controlador.obtenerOrdenadores);

// Obtiene los componentes de una recogida
router.get	  ('/:id/componente',       controlador.obtenerComponentes);

// Crea una nueva recogida
router.post	  ('/',[
	body('fecha').matches(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/).withMessage('Fecha mal introducida. Formatos de fecha correcto: AAAA-MM-DD'),
	body('tipo').isIn(['Entrega', 'Recogida']).withMessage('Tipo no válido. Tiene que estar entre los siguientes valores: Entrega, Recogida'),
	body('localizacion').isString().withMessage('Localizacion no válida. No puede ser vacía y tiene que ser un string')
],                                      controlador.nuevaRecogida);

// Añade un cable a una recogida
router.post	  ('/:id_recogida/cable/:tipo/:version_tipo', controlador.aniadirCable);

// Añade un transformador a una recogida
router.post	  ('/:id_recogida/transformador/',[
	body('voltaje').isInt().not().isEmpty().withMessage('Voltaje no válido'),
	body('amperaje').isInt().not().isEmpty().withMessage('Amperaje no válido'),
	body('corresponde').optional().isObject().withMessage('Corresponde no está bien introducido'),
	body('corresponde.tipo').if(body('corresponde').exists()).isIn(['Componente', 'Portatil']).withMessage('Tipo de corresponde no válido. Los valores válidos son: "Componente", "Portatil"').not().isEmpty().withMessage('Tipo de corresponde no puede ser vacío'),
	body('corresponde.id').if(body('corresponde').exists()).isInt().not().isEmpty().withMessage('Id de corresponde no válido')
], 										controlador.aniadirTransformador);

// Añade un componente a una recogida
router.post	  ('/:id_recogida/componente/',[ 
	body('estado').optional().isIn(['Desconocido', 'Bueno', 'Regular', 'Por revisar', 'No aprovechable', 'Roto']).not().isEmpty().withMessage('Tipo no válido. Tiene que estar entre los siguientes valores: Desconocido, Bueno, Regular, Por revisar, No aprovechable, Roto'),
	body('observaciones').optional().isString().withMessage('Valor no válido en observaciones'),
	body('fecha_entrada').optional().matches(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/).withMessage('Fecha mal introducida. Formatos de fecha correcto: AAAA-MM-DD'),
	body('tipo').not().isEmpty().withMessage('Tipo no introducido. Este parámetro es obligatorio'),
	body('caracteristicas').optional().isArray().withMessage('Las características deben de ser un array'),
	body('caracteristicas.*.nombre').isString().not().isEmpty().withMessage('Algún nombre de característica no es válido'),
	body('caracteristicas.*.valor').isString().not().isEmpty().withMessage('Algún valor de característica no es válido')
], controlador.aniadirComponente);

// Añade un ordenador a una recogida
router.post	  ('/:id_recogida/portatil/',[ 
	body('localizacion_taller').optional().isString().withMessage('Valor no válido en localizacion_taller'),
	body('observaciones').optional().isString().withMessage('Valor no válido en observaciones'),
	body('estado').optional().isIn(['Desconocido', 'Bueno', 'Regular', 'Por revisar', 'No aprovechable', 'Roto']).not().isEmpty().withMessage('Tipo no válido. Tiene que estar entre los siguientes valores: Desconocido, Bueno, Regular, Por revisar, No aprovechable, Roto')
], controlador.aniadirPortatil);

// Añade un ordenador a una recogida
router.post	  ('/:id_recogida/sobremesa/',[ 
	body('localizacion_taller').optional().isString().withMessage('Valor no válido en localizacion_taller'),
	body('observaciones').optional().isString().withMessage('Valor no válido en observaciones'),
	body('tamano').optional().isString().withMessage('Valor no válido en tamano')
], controlador.aniadirSobremesa);

// Edita una recogida
router.put	  ('/:id',[
	body('fecha').matches(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/).withMessage('Fecha mal introducida. Formatos de fecha correcto: AAAA-MM-DD'),
	body('localizacion').isString().withMessage('Localizacion no válida. No puede ser vacía y tiene que ser un string')
],                                      controlador.editarRecogida);

// Elimina una recogida
router.delete ('/:id', 					controlador.eliminarRecogida)

module.exports = router;