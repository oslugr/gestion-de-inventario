/**
 * Archivo para gestionar todo el tema de localizaciones
 */ 
var express = require('express'),
	router = express.Router();
const db = require('../db/pool').pool;
const { body, validationResult } = require('express-validator');

// Obtiene cuantos cables hay de cada tipo
router.get('/statics', (req, res) => {

	db.getConnection(function(err, conn){
	  if(!err){
			conn.query("SELECT * FROM localizacion", function(err, rows){
				
				conn.release();
				if(!err)
					res.status('200').json({
						cantidad: rows.lenght,
						localizaciones: rows
					});
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
			return res.status('503').json({
				tipo_error: 503,
				mensaje_error: "Service Unavailable - Error interno al conectarse a la base de datos"
			})
		}
	})

});

/**
 * Añade un cable a la base de datos
 * Formato de la petición:
 * {
 * 		"tipo": "",
 *      "version_tipo": ""
 * }
 * Todos los parámetros son obligatorios
 */
router.post('/',[ 
	// Comprobación de parámetros
    body('tipo').not().isEmpty().withMessage('Tipo no introducido'),
    body('version_tipo').not().isEmpty().withMessage('Versión del tipo no introducida')
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
	let tipo = req.body.tipo;
	let version_tipo = req.body.version_tipo;
    
    db.getConnection(function(err, conn){
		if(!err){
			conn.query(`INSERT INTO cable(tipo,version_tipo) VALUES (?)`, [[tipo,version_tipo]], function(err, rows){
				
				if(!err){
					conn.release();
					return res.status('201').json({
						codigo: "201",
						mensaje: "Cable añadido correctamente"
					});
				}
				else{
					console.log(`Error al añadir un cable en la base de datos. Error: ${err}`);
                    return res.status('502').json({
                        tipo_error: 502,
                        mensaje_error: "Bad Gateway - Error interno al insertar el valor en la base de datos"
                    })
				}
			})
		}
		else{
			console.log(`Error en la conexión con la base de datos ${err}`);
			return res.status('503').json({
				tipo_error: 503,
				mensaje_error: "Service Unavailable - Error interno al conectarse a la base de datos"
			})
		}
	})

})

/**
 * Elimina un numero de cables de la base de datos que tengan las características dadas
 * Formato de la petición:
 * {
 * 		"tipo": "",
 *      "version_tipo": "",
 *      "numero": int
 * }
 * Todos son obligatorios menos el número de cables, que si no se especifica será 1
 */
router.delete('/',[
    // Comprobación de parámetros
    body('tipo').not().isEmpty().withMessage('Tipo no introducido'),
    body('version_tipo').not().isEmpty().withMessage('Versión del tipo no introducida'),
    body('numero').isInt({min:1}).withMessage("El número de ha introducido de forma incorrecta")
], (req, res) => {
    const errors = validationResult(req);
	if(!errors.isEmpty())
		return res.status(400).json({
			tipo_error: 400,
			mensaje_error: "Bad request",
			errores: errors.array()
        });

	let tipo 		 = req.body.tipo;
	let version_tipo = req.body.version_tipo;
	let numero 		 = req.body.numero;

	db.getConnection(function(err, conn){
	    if(!err){
			conn.query(`DELETE FROM cable WHERE tipo="?" AND version_tipo="?" `, function(err, rows){
				
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
			console.log(`Error en la conexión con la base de datos. Error ${err}`);
			return res.status('503').json({
				tipo_error: 503,
				mensaje_error: "Service Unavailable - Error interno al conectarse a la base de datos"
			})
		}
	})

});

module.exports = router;