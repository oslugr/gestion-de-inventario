/**
 * Ruta /ordenador/*
 */ 
var express = require('express'),
	router = express.Router();
const db = require('../db/pool');
const { body, validationResult } = require('express-validator');
const { APIError } = require('../aux/error');

// *******************
// GET
// *******************

// Obtiene todas los ordenadores de la DB
router.get('/', (req, res) => {

	return db._select("	SELECT O1.id,O1.localizacion_taller,O1.observaciones, 'portatil' as tipo, null as tamano FROM ordenador O1 inner join portatil P on O1.id=P.id \
						UNION \
						SELECT O2.id,O2.localizacion_taller,O2.observaciones, 'sobremesa' as tipo, S.tamano FROM ordenador O2 inner join sobremesa S on O2.id=S.id \
						ORDER BY id;", 
						(status, json) => {
							return res.status(status).json(json);
						})

});

// Obtiene todas los portatiles de la DB
router.get('/portatil', (req, res) => {

	db.pool.getConnection(function(err, conn){
	  	if(!err){
		  	let sql = "SELECT O1.id,O1.localizacion_taller,O1.observaciones FROM ordenador O1 inner join portatil P on O1.id=P.id \
					   ORDER BY id;";
			
			conn.query(sql, function(err, rows){
				
				conn.release();
				if(!err){
					res.status('200').json({
						cantidad: rows.length,
						portatiles: rows
					});
				}
				else{
					console.log(`Error al obtener portátiles. error: ${err}`);
					return res.status('502').json({
						tipo_error: 502,
						mensaje_error: "Bad Gateway - Error interno al obtener los valores de la base de datos"
					})
				}
			})
		}
		else{
			console.log("Error en la conexión con la base de datos ${err}");
			return res.status('503').json({
				tipo_error: 503,
				mensaje_error: "Service Unavailable - Error interno al conectarse a la base de datos"
			})
		}
	})

});

// Obtiene todas los sobremesas de la DB
router.get('/sobremesa', (req, res) => {

	db.getConnection(function(err, conn){
	  	if(!err){
		  	let sql = "SELECT O1.id,O1.localizacion_taller,O1.observaciones,P.tamano FROM ordenador O1 inner join sobremesa P on O1.id=P.id \
					   ORDER BY id;";
			
			conn.query(sql, function(err, rows){
				
				conn.release();
				if(!err){
					res.status('200').json({
						cantidad: rows.length,
						sobremesas: rows
					});
				}
				else{
					console.log(`Error al obtener sobremesas. error: ${err}`);
					return res.status('502').json({
						tipo_error: 502,
						mensaje_error: "Bad Gateway - Error interno al obtener los valores de la base de datos"
					})
				}
			})
		}
		else{
			console.log("Error en la conexión con la base de datos ${err}");
			return res.status('503').json({
				tipo_error: 503,
				mensaje_error: "Service Unavailable - Error interno al conectarse a la base de datos"
			})
		}
	})

});

// Obtiene un ordenador en específico de la DB
router.get('/:id', (req, res) => {

	var id = req.params.id;

	db.getConnection(function(err, conn){
	  if(!err){
		  	let sql = "SELECT O1.id,O1.localizacion_taller,O1.observaciones, 'portatil' as tipo, null as tamano FROM ordenador O1 inner join portatil P on O1.id=P.id where O1.id=? \
					   UNION \
					   SELECT O2.id,O2.localizacion_taller,O2.observaciones, 'sobremesa' as tipo, S.tamano FROM ordenador O2 inner join sobremesa S on O2.id=S.id where O2.id=?;";
			
			conn.query(sql, [id,id], function(err, rows){
	
				conn.release();
				if(!err){
					if(rows[0])
						res.status('200').json(rows[0]);
					else{
						res.status('404').send({ 
							error: 404,
							message: `Not found - No se ha encontrado ningún ordenador con la id ${id}` 
						});
					}
				}
				else{
					console.log(`Error al obtener ordenadores. ${err}`);
					return res.status('502').json({
						tipo_error: 502,
						mensaje_error: "Bad Gateway - Error interno al obtener los valores de la base de datos"
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

});

// *******************
// POST
// *******************

/**
 * Añade un portatil a la base de datos
 * Formato de la petición:
 * {
 * 		"localizacion": "",
 * 		"observaciones": ""
 * }
 * Ningún valor es obligatorio 
 * Devuelve el id del portatil insertado
 */
router.post('/portatil',(req, res) => {

	if(req.body.localizacion) 	var localizacion_taller = req.body.localizacion;
	if(req.body.observaciones)	var observaciones = req.body.observaciones; 

	// Si no hay error añade el ordenador en la base de datos
	db.getConnection(function(err, conn){
		if(!err){
			sql = `INSERT INTO ordenador(localizacion_taller, observaciones) VALUES (?) ;`
			conn.query(sql,[[localizacion_taller, observaciones]], function(err, result, rows){
				
				if(!err){
					sql = `INSERT INTO portatil VALUES (?) ;`;
					conn.query(sql,[result.insertId], function(err, rows){
						
						if(!err){

							conn.release();
							return res.status('201').json({
								codigo: "201",
								mensaje: "Portátil creado correctamente",
								id: result.insertId
							});
						}
						else{
							sql = `DELETE FROM ordenador WHERE id=?;`
							conn.query(sql,[result.insertId]);
							console.log(`Error al insertar el portatil en la base de datos. El ordenador fue insertado pero el portatil no. Error: \n ${err} `);
							return res.status('502').json({
								tipo_error: 502,
								mensaje_error: "Bad Gateway - Error interno al insertar el valor en la base de datos"
							});
						}
					});
				}
				else{
					console.log(`Error al insertar un portatil en la base de datos. Error: \n ${err} `);
					return res.status('502').json({
						tipo_error: 502,
						mensaje_error: "Bad Gateway - Error interno al insertar el valor en la base de datos"
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

/**
 * Añade un sobremesa a la base de datos
 * Formato de la petición:
 * {
 * 		"localizacion": "",
 * 		"tamano": "",
 * 		"observaciones": ""
 * }
 * Ningún valor es obligatorio
 */
router.post('/sobremesa', (req, res) => {

	if(req.body.localizacion) 	var localizacion_taller = req.body.localizacion;
	if(req.body.observaciones)	var observaciones = req.body.observaciones; 
	if(req.body.tamano)			var tamano = req.body.tamano; 

	// Si no hay error añade el ordenador en la base de datos
	db.getConnection(function(err, conn){
		if(!err){
			sql = `INSERT INTO ordenador(localizacion_taller, observaciones) VALUES (?) ;`
			conn.query(sql,[[localizacion_taller, observaciones]], function(err, result, rows){
				
				if(!err){
					sql = `INSERT INTO sobremesa VALUES (?) ;`;
					conn.query(sql,[[result.insertId, tamano]], function(err, rows){
						
						if(!err){

							conn.release();
							return res.status('201').json({
								codigo: "201",
								mensaje: "Sobremesa creado correctamente",
								id: result.insertId
							});
						}
						else{
							sql = `DELETE FROM ordenador WHERE id=?;`
							conn.query(sql,[result.insertId]);
							console.log(`Error al insertar el sobremesa en la base de datos. El ordenador fue insertado pero el sobremesa no. Error: \n ${err} `);
							return res.status('502').json({
								tipo_error: 502,
								mensaje_error: "Bad Gateway - Error interno al insertar el valor en la base de datos"
							});
						}
					});
				}
				else{
					console.log(`Error al insertar un sobremesa en la base de datos. Error: \n ${err} `);
					return res.status('502').json({
						tipo_error: 502,
						mensaje_error: "Bad Gateway - Error interno al insertar el valor en la base de datos"
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

// *******************
// DELETE
// *******************

/**
 * Elimina un ordenador de la base de datos
 */
router.delete('/:id', (req, res) => {

	var id = req.params.id;

	db.getConnection(function(err, conn){
	  if(!err){
			conn.query(`DELETE FROM ordenador WHERE id=?`,[id], function(err, rows){
				
				conn.release();
				if(!err){
					res.status('200').json({
						estado: "Correcto",
						mensaje: `Ordenador con id ${id} eliminado correctamente`
					});
				}
				else{
					console.log(`Error al eliminar localizaciones. Error: ${err}`);
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