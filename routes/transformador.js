const express 	  = require('express'),
	  router  	  = express.Router();
const db 	  	  = require('../db/pool').pool;
const controlador = require('../controllers/transformador');
const { body } = require('express-validator');

// Obtiene todos los transformadores de la DB
router.get	  ('/',                   controlador.obtenerTransformadores);

// Añade un transformador de un voltaje y amperaje
router.post	  ('/', [
	body('voltaje').isInt().not().isEmpty().withMessage('Voltaje no válido'),
	body('amperaje').isInt().not().isEmpty().withMessage('Amperaje no válido'),
	body('corresponde').optional().isObject().withMessage('Corresponde no está bien introducido'),
	body('corresponde.tipo').if(body('corresponde').exists()).isIn(['Componente', 'Portatil']).withMessage('Tipo de corresponde no válido. Los valores válidos son: "Componente", "Portatil"').not().isEmpty().withMessage('Tipo de corresponde no puede ser vacío'),
	body('corresponde.id').if(body('corresponde').exists()).isInt().not().isEmpty().withMessage('Id de corresponde no válido')
],  controlador.insertarTransformador);

// Asigna un transformador a un portatil
router.post	  ('/:id_t/portatil/:id_p', controlador.asignarPortatil);

// Edita un transformador
router.put	  ('/:id', [
	body('voltaje').isInt().not().isEmpty().withMessage('Voltaje no válido'),
	body('amperaje').isInt().not().isEmpty().withMessage('Amperaje no válido'),
	body('corresponde').optional().isObject().withMessage('Corresponde no está bien introducido'),
	body('corresponde.tipo').if(body('corresponde').exists()).isIn(['Componente', 'Portatil']).withMessage('Tipo de corresponde no válido. Los valores válidos son: "Componente", "Portatil"').not().isEmpty().withMessage('Tipo de corresponde no puede ser vacío'),
	body('corresponde.id').if(body('corresponde').exists()).isInt().not().isEmpty().withMessage('Id de corresponde no válido')
], controlador.editarTransformador);

// Elimina un transformador con un voltaje y amperaje concretos
router.delete ('/:voltaje/:amperaje', controlador.eliminarTransformador);

// Elimina un transformador a partir de su id
router.delete ('/:id', 				  controlador.eliminarTransformador);

module.exports = router;