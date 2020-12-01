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
				
				if(!err){
					conn.release();
					return res.status('201').json({
						codigo: "201",
						mensaje: "Localización creada correctamente"
					});
				}
				else{
					conn.query(`SELECT * FROM localizacion WHERE nombre="${nombre}"`, function(err, rows) {
						
						conn.release();
						if(!err){
							if(rows.length){
								return res.status('409').json({
									codigo: "409",
									mensaje: "Error al añadir el valor en la base de datos. Este valor ya existe."
								})
							}
							else{
								console.log(`Error al insertar una localización en la base de datos. Querys: \n INSERT INTO localizacion VALUES ${nombre} \n SELECT * FROM localizacion WHERE id="${nombre}"`);
								return res.status('502').json({
									tipo_error: 502,
									mensaje_error: "Bad Gateway - Error interno al insertar el valor en la base de datos"
								})
							}
						}
						else{
							console.log(`Error al insertar una localización en la base de datos. Querys: \n INSERT INTO localizacion VALUES ${nombre} \n SELECT * FROM localizacion WHERE id="${nombre}"`);
							return res.status('502').json({
								tipo_error: 502,
								mensaje_error: "Bad Gateway - Error interno al insertar el valor en la base de datos"
							})
						}
					}); 
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

router.delete('/:nombre', (req, res) => {

	db.getConnection(function(err, conn){
	  if(!err){
			conn.query(`DELETE FROM localizacion WHERE nombre="${req.params.nombre}"`, function(err, rows){
				
				conn.release();
				if(!err){
					if(rows.affectedRows){
						res.status('200').json({
							estado: "Correcto",
							mensaje: `Localización con nombre ${req.params.nombre} eliminada correctamente`
						});
					}
					else{
						res.status('404').json({
							tipo_error: 404,
							mensaje_error: `Not found - No hay ninguna localización con el nombre ${req.params.nombre}`
						});
					}
				}
				else{
					console.log(`Error al eliminar localizaciones. Query: DELETE FROM localizacion WHERE nombre="${req.params.nombre}"`);
					return res.status('502').json({
						tipo_error: 502,
						mensaje_error: "Bad Gateway - Error al eliminar el registro de la base de datos"
					})
				}
			})
		}
		else{
			console.log("Error en la conexión con la base de datos");
		}
	})

});

module.exports = router;