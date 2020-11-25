/**
 * Archivo para gestionar todo el tema de localizaciones
 */ 
var express = require('express'),
	router = express.Router();
const db = require('../db/pool').pool;
const { validate, ValidationError, Joi } = require('express-validation');

// Obtiene todas las localizaciones de la DB
router.get('/', (req, res) => {

	db.getConnection(function(err, conn){
	  if(!err){
			conn.query("SELECT * FROM localizacion", function(err, rows){
				
				conn.release();
				if(!err)
					res.json(rows);
				else
					console.log("Error al hacer el query: SELECT * FROM localizacion");
			
			})
		}
		else{
			console.log("Erro en la conexión con la base de datos");
		}
	})

})

/**
 * Añade una localización a la base de datos
 * Formato de la petición:
 * {
 * 		"nombre": ""
 * }
 * 
 */
// Formato de introducción
router.post('/', (req, res) => {

	console.log(req.body)
	res.json(req.body);

})

module.exports = router;