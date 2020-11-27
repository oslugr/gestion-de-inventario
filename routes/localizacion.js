/**
 * Archivo para gestionar todo el tema de localizaciones
 */ 
var express = require('express'),
	router = express.Router();
const db = require('../db/pool').pool;
const { body, validationResult } = require('express-validator');

// Obtiene todas las localizaciones de la DB
router.get('/', (req, res) => {

	db.getConnection(function(err, conn){
	  if(!err){
			conn.query("SELECT * FROM localizacion", function(err, rows){
				
				conn.release();
				if(!err)
					res.status('200').json(rows);
				else{
					console.log("Error al obtener localizaciones. Query: SELECT * FROM localizacion");
					return res.status('502').json({
						tipo_error: 502,
						mensaje_error: "Bad Gateway - Error interno al obtener los valores de la base de datos"
					})
				}
			})
		}
		else{
			console.log("Error en la conexión con la base de datos");
		}
	})

});

/**
 * Añade una localización a la base de datos
 * Formato de la petición:
 * {
 * 		"nombre": ""
 * }
 */
router.post('/',[ 
	// Comprobación de parámetros
	body('nombre').not().isEmpty().withMessage('Nombre no introducido')
], (req, res) => {

	// Gestión de errores 
	const errors = validationResult(req);
	if(!errors.isEmpty())
		return res.status(400).json({
			tipo_error: 400,
			mensaje_error: "Bad request",
			errores: errors.array()
		})

	// Si no hay error añade la localizacion en la base de datos
	let nombre = req.body.nombre;
	db.getConnection(function(err, conn){
		if(!err){
			conn.query(`INSERT INTO localizacion VALUES ("${nombre}")`, function(err, rows){
				
				conn.release();
				if(!err){
					return res.status('200').json({
						codigo: "200",
						mensaje: "Localización insertada correctamente"
					});
				}
				else{
					console.log(`Error al insertar una localización en la base de datos. Query: INSERT INTO localizacion VALUES ${nombre}`);
					return res.status('502').json({
						tipo_error: 502,
						mensaje_error: "Bad Gateway - Error interno al insertar valores a la base de datos"
					})
				}
			})
		}
		else{
			console.log("Error en la conexión con la base de datos");
			return res.status('503').json({
				tipo_error: 503,
				mensaje_error: "Service Unavailable - Error interno al conectarse a la base de datos"
			})
		}
	})

})

module.exports = router;