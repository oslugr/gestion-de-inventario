const db = require('../db/pool').pool;
const { APIError, NotFound, BadRequest } = require('../aux/error');
const { validationResult } = require('express-validator');
const { obtenerCaracteristicas } = require('../aux/gestionCaracteristicas');

exports.obtenerRecogida = function (req, res){

	if(req.params.tipo && ( req.params.tipo=="Entrega" || req.params.tipo=="Recogida" ) )           
		var tipo = req.params.tipo;
	else{
		const e = new BadRequest('Tipo de la recogida no especificado o no válido', ["tipo no introducido o no válido. Valores válidos: 'Entrega' o 'Recogida'"], `Error al obtener las recogidas por tipo. El usuario no ha especificado un tipo válido`);
		return res.status(e.statusCode).send(e.getJson());
	}

  let sql = `SELECT id, fecha, tipo, localizacion FROM recogida 
              INNER JOIN en ON id_recogida=id
              WHERE tipo=?
              ORDER BY id;`

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query(sql, [tipo], function (err, rows) {
        
        conn.release();

        if (err) {
          const e = new BadRequest('Error al obtener', ['Ocurrió algún error al obtener la recogida'], `Error al obtener la recogida. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
					cantidad: rows.length,
					data: rows
				});
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });

}

exports.exportarRecogida = function (req, res){

  if(req.params.tipo && ( req.params.tipo=="Entrega" || req.params.tipo=="Recogida" ) )           
		var tipo = req.params.tipo;
	else{
		const e = new BadRequest('Tipo de la recogida no especificado o no válido', ["tipo no introducido o no válido. Valores válidos: 'Entrega' o 'Recogida'"], `Error al obtener las recogidas por tipo. El usuario no ha especificado un tipo válido`);
		return res.status(e.statusCode).send(e.getJson());
	}

  const sql = `SELECT R.id, R.fecha, R.tipo, E.localizacion, 
                (SELECT COUNT(*) FROM contiene_cable CCA WHERE CCA.id_recogida=R.id) as numero_cables, 
                (SELECT COUNT(*) FROM contiene_componente CCO WHERE CCO.id_recogida=R.id) as numero_componentes,
                (SELECT COUNT(*) FROM contiene_ordenador CO WHERE CO.id_recogida=R.id) as numero_ordenadores,
                (SELECT COUNT(*) FROM contiene_transformador CT WHERE CT.id_recogida=R.id) as numero_transformadores
              FROM recogida R
              INNER JOIN en E ON E.id_recogida=R.id
              WHERE R.tipo=?;`

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.query(sql, [tipo], function (err, rows) {
        
        conn.release();

        if (err) {
          const e = new BadRequest('Error al obtener las estadísticas', ['Ocurrió algún error al obtener las estadísticas'], `Error al obtener las estadísticas. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
          data: rows
        });
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });

}

exports.nuevaRecogida = function (req, res){

	const errores = validationResult(req);

	if(!errores.isEmpty()){
    const e = new BadRequest('Error al introducir los parámetros', errores.array(), `Error en los parámetros introducidos por el usuario al añadir una recogida. ${errores.array()}`);
    return res.status(e.statusCode).send(e.getJson());
	}
	
  if(req.body.fecha)          var fecha = req.body.fecha;
  else                        var fecha = null;
  if(req.body.tipo)           var tipo = req.body.tipo;
  else                        var tipo = null;
  if(req.body.localizacion)   var localizacion = req.body.localizacion;
  else                        var localizacion = null;

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.beginTransaction(function(err) {

        if(!err){
          conn.query('INSERT INTO recogida(fecha, tipo) VALUES (?);', [[new Date(fecha), tipo]], function (err, rows) {

            let id_recogida = rows.insertId;

            if (!err){
              
              conn.query('INSERT INTO en VALUES (?);', [[localizacion, id_recogida]], function (err, rows) {

                if (!err){
                  
                  conn.commit(function(err) {

                    conn.release();

                    if (err) {
                      return conn.rollback(function() {
                        const e = new BadRequest('Error al insertar la recogida', ['Ocurrió algún error al insertar la recogida. Es posible que la localizacion especificada no esté creada'], `Error al introducir la recogida por el usuario. ${err}`);
                        return res.status(e.statusCode).send(e.getJson());
                      });
                    }
                    
                    return res.status('200').send({
                      estado: "Correcto",
                      descripcion: "Recogida inertada correctamente",
                      id: id_recogida
                    });
                  });
    
                }
                else {
                  return conn.rollback(function() {
                    const e = new BadRequest('Error al insertar la recogida', ['Ocurrió algún error al insertar la recogida'], `Error al introducir la recogida por el usuario. ${err}`);
                    return res.status(e.statusCode).send(e.getJson());
                  });
                }
    
              });
            }
            else {
              return conn.rollback(function() {
                const e = new BadRequest('Error al insertar la recogida', ['Ocurrió algún error al insertar la recogida'], `Error al introducir la recogida por el usuario. ${err}`);
                return res.status(e.statusCode).send(e.getJson());
              });
            }

          })
        }
        else{
          const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al iniciar la transacción para añadir componentes\n${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
      });
    }
    else {
      const e = new APIError('Service Unavailable', '503', 'Error al conectar con la base de datos', `Error al conectar con la base de datos\n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  })
}

exports.aniadirCable = function (req, res){

  // Validación de los valores introducidos
  if(req.params.id_recogida)
    var id_recogida = req.params.id_recogida.replace(/\s+/g, ' ').trim();
  
  if(req.params.version_tipo)
    var version_tipo = req.params.version_tipo.replace(/\s+/g, ' ').trim();
  
  if(req.params.tipo)         
    var tipo = req.params.tipo.replace(/\s+/g, ' ').trim();
  else{
    const e = new BadRequest('Tipo mal introducido', [{ msg: "Valor de tipo no válido"}], "Error al introducir el tipo por parte del usuario");
    return res.status(e.statusCode).send(e.getJson());
  }

  db.getConnection(function (err, conn) {
    if (!err) {

      conn.beginTransaction(function(err) {

        if (!err) {

          if(version_tipo){ 
            var params = [[tipo, version_tipo]];
            var sql    = 'INSERT INTO cable(tipo, version_tipo) VALUES (?)';
          }
          else{
            var params = [[tipo]];
            var sql    = 'INSERT INTO cable(tipo) VALUES (?)'
          }

          conn.query(sql, params, function (err, rows) {

            let id_cable = rows.insertId;

            if (!err) {

              conn.query('INSERT INTO contiene_cable(id_recogida, id_cable) VALUES (?);', [[id_recogida, id_cable]], function (err, rows) {
        
                if (!err) {
        
                  conn.commit(function(err) {

                    conn.release();

                    if (err) {
                      const e = new BadRequest('Error al insertar un cable en una recogida', ['Ocurrió algún error al insertar el cable. Puede ser que el cable o la recogida no existan o que simplemente ya esté inserado en esta recogida'], `Error al insertar un cable en una recogida. ${err}`);
                      return res.status(e.statusCode).send(e.getJson());
                    }
                    
                    return res.status('200').send({
                      estado: "Correcto",
                      descripcion: "Cable insertado correctamente en la recogida",
                      id: id_cable
                    });

                  });

                }
                else{
                  const e = new BadRequest('Error al insertar un cable en una recogida', ['Ocurrió algún error al insertar el cable. Puede ser que el cable o la recogida no existan o que simplemente ya esté inserado en esta recogida'], `Error al insertar un cable en una recogida. ${err}`);
                  return res.status(e.statusCode).send(e.getJson());
                }

              });
            }
            else{
              const e = new BadRequest('Error al insertar un cable en una recogida', ['Ocurrió algún error al insertar el cable. Puede ser que el cable o la recogida no existan o que simplemente ya esté inserado en esta recogida'], `Error al insertar un cable en una recogida. ${err}`);
              return res.status(e.statusCode).send(e.getJson());
            }

          })
        }
        else {
          const e = new APIError('Service Unavailable', '503', 'Error al conectar con la base de datos', `Error al conectar con la base de datos\n${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }    
      });
    }
    else {
      const e = new APIError('Service Unavailable', '503', 'Error al conectar con la base de datos', `Error al conectar con la base de datos\n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  })
}

exports.aniadirTransformador = function (req, res) {
  
  const errores = validationResult(req);

  if(!errores.isEmpty()){
    const e = new BadRequest('Error al introducir los parámetros', errores.array(), `Error en los parámetros introducidos por el usuario al añadir un transformador. ${errores.array()}`);
    return res.status(e.statusCode).send(e.getJson());
  }
  else{
    var voltaje = req.body.voltaje;
    var amperaje = req.body.amperaje;
    var corresponde = null;

    if(req.body.corresponde){
      corresponde = req.body.corresponde;
    }

    if(req.params.id_recogida)  var id_recogida = req.params.id_recogida;

  }

  db.getConnection(function (err, conn) {
    if (!err) {

      conn.beginTransaction(function(err) {

        var params = [[voltaje, amperaje]];
        var sql    = 'INSERT INTO transformador(voltaje, amperaje) VALUES (?)';

        conn.query(sql, params, function (err, rows) {

          let id_transformador = rows.insertId;

          if (!err) {
            
            if(corresponde){

              if(corresponde.tipo=="Portatil"){
                var sql = "INSERT INTO corresponde_portatil VALUES(?)";
              }
              else if(corresponde.tipo=="Componente"){
                var sql = "INSERT INTO corresponde_componente VALUES(?)";
              }

              conn.query(sql, [[id_transformador, corresponde.id]], function (err, rows){

                if(!err){

                  conn.query('INSERT INTO contiene_transformador(id_recogida, id_transformador) VALUES (?);', [[id_recogida, id_transformador]], function (err, rows) {
          
                    if (err) {
                      const e = new BadRequest('Error al insertar un transformador en una recogida', ['Ocurrió algún error al insertar el transformador. Puede ser que el transformador o la recogida no existan o que simplemente ya esté inserado en esta recogida'], `Error al insertar un transformador en una recogida. ${err}`);
                      return res.status(e.statusCode).send(e.getJson());
                    }
                    
                    conn.commit(function(err) {

                      conn.release();
    
                      if(err){
                        const e = new BadRequest(`Ha ocurrido algún error al introducir los parámetros`, [''], `Error al introducir un transformador por el usuario. ${err}`);
                        return res.status(e.statusCode).send(e.getJson());
                      }
    
                      res.status('200').send({
                        estado: "Correcto",
                        descripcion: "Transformador insertado correctamente",
                        id: id_transformador
                      });
    
                    });
                  });

                }
                else{
                  const e = new BadRequest(`Error al introducir los parámetros, posiblemente el id del ${corresponde.tipo} no sea válido`, [`Id del ${corresponde.tipo} no válido`], `Error al introducir un transformador por el usuario. ${err}`);
                  return res.status(e.statusCode).send(e.getJson());
                }

              });

            }
            else{

              conn.query('INSERT INTO contiene_transformador(id_recogida, id_transformador) VALUES (?);', [[id_recogida, id_transformador]], function (err, rows) {
          
                if (err) {
                  const e = new BadRequest('Error al insertar un transformador en una recogida', ['Ocurrió algún error al insertar el transformador. Puede ser que el transformador o la recogida no existan o que simplemente ya esté inserado en esta recogida'], `Error al insertar un transformador en una recogida. ${err}`);
                  return res.status(e.statusCode).send(e.getJson());
                }
                
                conn.commit(function(err) {

                  conn.release();

                  if(err){
                    const e = new BadRequest(`Ha ocurrido algún error al introducir los parámetros`, [''], `Error al introducir un transformador por el usuario. ${err}`);
                    return res.status(e.statusCode).send(e.getJson());
                  }

                  res.status('200').send({
                    estado: "Correcto",
                    descripcion: "Transformador insertado correctamente",
                    id: id_transformador
                  });

                });
              });

            }
          }
          else {
            const e = new BadRequest('Error al introducir los parámetros', ['Voltaje o amperaje incorrecto.'], `Error al introducir un transformador por el usuario. ${err}`);
            return res.status(e.statusCode).send(e.getJson());
          }

        })
      });
    }
    else {
      const e = new APIError('Service Unavailable', '503', 'Error al conectar con la base de datos', `Error al conectar con la base de datos\n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  })

}

// Funcion recursiva para añadir todas las características que haya indicado el usuario;
function insertarCaracteristicas(caracteristicas, id_componente, conn, i, req, res, callback){
  
  if(i<caracteristicas.length){
    conn.query('INSERT INTO caracteristica(nombre, valor) VALUES (?)', [[caracteristicas[i].nombre,caracteristicas[i].valor]], function (err, rows) {
      if (!err){
        
        let id_caracteristica = rows.insertId;

        conn.query('INSERT INTO tiene VALUES (?)', [[id_componente, id_caracteristica]], function (err, rows) {
          if (!err){
            
            caracteristicas[i]['id'] = id_caracteristica;

            return callback(caracteristicas, id_componente, conn, i+1, req, res, callback);
      
          }
          else {
            return conn.rollback(function() {
              const e = new BadRequest('Error al insertar la componente', ['Ocurrió algún error al insertar la componente'], `Error al introducir una componente por el usuario. ${err}`);
              return res.status(e.statusCode).send(e.getJson());
            });
          }
        })

      }
      else {
        return conn.rollback(function() {
          const e = new BadRequest('Error al insertar la componente', ['Ocurrió algún error al insertar la componente'], `Error al introducir una componente por el usuario. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        });
      }
    })
  }
  else{

    var id_recogida = req.params.id_recogida;

    conn.query('INSERT INTO contiene_componente(id_recogida, id_componente) VALUES (?);', [[id_recogida, id_componente]], function (err, rows) {
        
      if (err) {
        const e = new BadRequest('Error al insertar una componente en una recogida', ['Ocurrió algún error al insertar la componente. Puede ser que la componente o la recogida no existan o que simplemente ya esté inserado en esta recogida'], `Error al insertar una componente en una recogida. ${err}`);
        return res.status(e.statusCode).send(e.getJson());
      }
      
      conn.commit(function(err) {

        conn.release();
  
        if (err) {
          return conn.rollback(function() {
            const e = new BadRequest('Error al insertar la componente', ['Ocurrió algún error al insertar la componente'], `Error al introducir una componente por el usuario. ${err}`);
            return res.status(e.statusCode).send(e.getJson());
          });
        }
        
        return res.status('200').send({
          estado: "Correcto",
          descripcion: "Componente añadida correctamente",
          id: id_componente,
          caracteristicas: caracteristicas
        });
      });
    });

  }
}

exports.aniadirComponente = function (req, res) {
  

  if(req.body.estado)           var estado = req.body.estado.replace(/\s+/g, ' ').trim();
  else                          var estado = 'Desconocido';
  if(req.body.observaciones)    var observaciones = req.body.observaciones.replace(/\s+/g, ' ').trim();
  else                          var observaciones = null;
  if(req.body.fecha_entrada)    var fecha_entrada = req.body.fecha_entrada.replace(/\s+/g, ' ').trim();
  else                          var fecha_entrada = 'NULL';
  if(req.body.tipo)             var tipo = req.body.tipo.replace(/\s+/g, ' ').trim();
  else                          var tipo = null;
  if(req.body.caracteristicas)  var caracteristicas = req.body.caracteristicas;
  else                          var caracteristicas = [];

  const errores = validationResult(req);

  if(!errores.isEmpty()){
    const e = new BadRequest('Error al introducir los parámetros', errores.array(), `Error en los parámetros introducidos por el usuario al añadir una componente. ${errores.array()}`);
    return res.status(e.statusCode).send(e.getJson());
  }

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.beginTransaction(function(err) {

        if(!err){
          conn.query('INSERT INTO componente(estado, observaciones, fecha_entrada, tipo) VALUES (?)', [[estado, observaciones, new Date(fecha_entrada), tipo]], function (err, rows) {

            if (!err){
              
              return insertarCaracteristicas(caracteristicas, rows.insertId, conn, 0, req, res, insertarCaracteristicas);

            }
            else {
              return conn.rollback(function() {
                const e = new BadRequest('Error al insertar la componente', ['Ocurrió algún error al insertar la componente'], `Error al insertar una componente por el usuario por el usuario. ${err}`);
                return res.status(e.statusCode).send(e.getJson());
              });
            }

          })
        }
        else{
          const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al iniciar la transacción para añadir componentes\n${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
      });
    }
    else {
      const e = new APIError('Service Unavailable', '503', 'Error al conectar con la base de datos', `Error al conectar con la base de datos\n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  })

}


exports.aniadirPortatil = function (req, res) {

  const errores = validationResult(req);

  if(!errores.isEmpty()){
    const e = new BadRequest('Error al introducir los parámetros', errores.array(), `Error en los parámetros introducidos por el usuario al añadir un portatil. ${errores.array()}`);
    return res.status(e.statusCode).send(e.getJson());
  }


  if(req.body.localizacion_taller)  var localizacion_taller = req.body.localizacion_taller.replace(/\s+/g, ' ').trim();
  else                              var localizacion_taller = null;
  if(req.body.estado)               var estado = req.body.estado;
  else                              var estado = 'Desconocido';
  if(req.body.observaciones)        var observaciones = req.body.observaciones.replace(/\s+/g, ' ').trim();
  else                              var observaciones = null;
  if(req.params.id_recogida)        var id_recogida = req.params.id_recogida;
  else                              var id_recogida = null;

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.beginTransaction(function(err) {

        if(!err){
          conn.query('INSERT INTO ordenador(localizacion_taller, observaciones) VALUES (?)', [[localizacion_taller, observaciones]], function (err, rows) {

            if (!err){
              
              let id_ordenador = rows.insertId;

              conn.query('INSERT INTO portatil VALUES (?)', [[id_ordenador, estado]], function (err, rows) {

                if (!err){
                  
                  conn.query('INSERT INTO contiene_ordenador(id_recogida, id_ordenador) VALUES (?);', [[id_recogida, id_ordenador]], function (err, rows) {
        
                    if (err) {
                      const e = new BadRequest('Error al insertar un ordenador en una recogida', ['Ocurrió algún error al insertar el ordenador. Puede ser que el ordenador o la recogida no existan o que simplemente ya esté inserado en esta recogida'], `Error al insertar un ordenador en una recogida. ${err}`);
                      return res.status(e.statusCode).send(e.getJson());
                    }
                    
                    conn.commit(function(err) {

                      conn.release();
  
                      if (err) {
                        return conn.rollback(function() {
                          const e = new BadRequest('Error al insertar el portátil', ['Ocurrió algún error al insertar el portátil'], `Error al introducir un portátil por el usuario. ${err}`);
                          return res.status(e.statusCode).send(e.getJson());
                        });
                      }
                      
                      return res.status('200').send({
                        estado: "Correcto",
                        descripcion: "Portátil añadido correctamente",
                        id: id_ordenador
                      });
                    });

                  });
    
                }
                else {
                  return conn.rollback(function() {
                    const e = new BadRequest('Error al insertar el portátil', ['Ocurrió algún error al insertar el portátil'], `Error al introducir un portátil por el usuario. ${err}`);
                    return res.status(e.statusCode).send(e.getJson());
                  });
                }
    
              });
            }
            else {
              return conn.rollback(function() {
                const e = new BadRequest('Error al insertar el portátil', ['Ocurrió algún error al insertar el portátil'], `Error al introducir un portátil por el usuario. ${err}`);
                return res.status(e.statusCode).send(e.getJson());
              });
            }

          })
        }
        else{
          const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al iniciar la transacción para añadir componentes\n${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
      });
    }
    else {
      const e = new APIError('Service Unavailable', '503', 'Error al conectar con la base de datos', `Error al conectar con la base de datos\n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  })

}

exports.aniadirSobremesa = function (req, res) {
 
  const errores = validationResult(req);

  if(!errores.isEmpty()){
    const e = new BadRequest('Error al introducir los parámetros', errores.array(), `Error en los parámetros introducidos por el usuario al añadir un portatil. ${errores.array()}`);
    return res.status(e.statusCode).send(e.getJson());
  }


  if(req.body.localizacion_taller)  var localizacion_taller = req.body.localizacion_taller.replace(/\s+/g, ' ').trim();
  else                              var localizacion_taller = null;
  if(req.body.tamano)               var tamano = req.body.tamano;
  else                              var tamano = null;
  if(req.body.observaciones)        var observaciones = req.body.observaciones.replace(/\s+/g, ' ').trim();
  else                              var observaciones = null;
  if(req.params.id_recogida)        var id_recogida = req.params.id_recogida;
  else                              var id_recogida = null;

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.beginTransaction(function(err) {

        if(!err){
          conn.query('INSERT INTO ordenador(localizacion_taller, observaciones) VALUES (?)', [[localizacion_taller, observaciones]], function (err, rows) {

            if (!err){
              
              let id_ordenador = rows.insertId;

              conn.query('INSERT INTO sobremesa VALUES (?)', [[id_ordenador, tamano]], function (err, rows) {

                if (!err){
                  
                  conn.query('INSERT INTO contiene_ordenador(id_recogida, id_ordenador) VALUES (?);', [[id_recogida, id_ordenador]], function (err, rows) {
        
                    if (err) {
                      const e = new BadRequest('Error al insertar un ordenador en una recogida', ['Ocurrió algún error al insertar el ordenador. Puede ser que el ordenador o la recogida no existan o que simplemente ya esté inserado en esta recogida'], `Error al insertar un ordenador en una recogida. ${err}`);
                      return res.status(e.statusCode).send(e.getJson());
                    }
                    
                    conn.commit(function(err) {

                      conn.release();
  
                      if (err) {
                        return conn.rollback(function() {
                          const e = new BadRequest('Error al insertar el sobremesa', ['Ocurrió algún error al insertar el sobremesa'], `Error al introducir un portátil por el usuario. ${err}`);
                          return res.status(e.statusCode).send(e.getJson());
                        });
                      }
                      
                      return res.status('200').send({
                        estado: "Correcto",
                        descripcion: "Sobremesa añadido correctamente",
                        id: id_ordenador
                      });
                    });

                  });
    
                }
                else {
                  return conn.rollback(function() {
                    const e = new BadRequest('Error al insertar el sobremesa', ['Ocurrió algún error al insertar el sobremesa'], `Error al introducir un portátil por el usuario. ${err}`);
                    return res.status(e.statusCode).send(e.getJson());
                  });
                }
    
              });
            }
            else {
              return conn.rollback(function() {
                const e = new BadRequest('Error al insertar el sobremesa', ['Ocurrió algún error al insertar el sobremesa'], `Error al introducir un portátil por el usuario. ${err}`);
                return res.status(e.statusCode).send(e.getJson());
              });
            }

          })
        }
        else{
          const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al iniciar la transacción para añadir componentes\n${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
      });
    }
    else {
      const e = new APIError('Service Unavailable', '503', 'Error al conectar con la base de datos', `Error al conectar con la base de datos\n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  })

}

exports.aniadirOrdenador = function (req, res) {
  
  if(req.params.id_recogida)  var id_recogida = req.params.id_recogida;
  else                        var id_recogida = null;
  if(req.params.id_ord)       var id_ord = req.params.id_ord;
  else                        var id_ord = null;

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('INSERT INTO contiene_ordenador(id_recogida, id_ordenador) VALUES (?);', [[id_recogida, id_ord]], function (err, rows) {
        
        if (err) {
          const e = new BadRequest('Error al insertar un ordenador en una recogida', ['Ocurrió algún error al insertar el ordenador. Puede ser que el ordenador o la recogida no existan o que simplemente ya esté inserado en esta recogida'], `Error al insertar un ordenador en una recogida. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
					estado: "Correcto",
					descripcion: "Ordenador insertado correctamente en la recogida"
				});
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });
}

exports.obtenerCables = function (req, res){

	if(req.params.id )           
		var id = req.params.id;
	else{
		const e = new BadRequest('Id de la recogida no especificado o no válido', ["id no introducido o no válido"], `Error al obtener los cables de las recogidas. El usuario no ha especificado un tipo válido`);
		return res.status(e.statusCode).send(e.getJson());
	}

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('SELECT C.id as id, C.tipo, C.version_tipo FROM recogida R \
                    INNER JOIN contiene_cable CC ON CC.id_recogida=R.id \
                    INNER JOIN cable C on CC.id_cable=C.id \
                  WHERE R.id=?;', [id], function (err, rows) {
        
        conn.release();

        if (err) {
          const e = new BadRequest('Error al obtener cables', ['Ocurrió algún error al obtener los cables de la recogida'], `Error al obtener los cables de la recogida. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
					cantidad: rows.length,
					data: rows
				});
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });

}


exports.obtenerTransformadores = function (req, res){

	if(req.params.id )           
		var id = req.params.id;
	else{
		const e = new BadRequest('Id de la recogida no especificado o no válido', ["id no introducido o no válido"], `Error al obtener los transformadores de las recogidas. El usuario no ha especificado un tipo válido`);
		return res.status(e.statusCode).send(e.getJson());
	}

  let sql = `(select T.id, T.voltaje, T.amperaje, 'Portatil' as tipo, C_P.id_portatil as id_2 FROM transformador T \
                inner join corresponde_portatil C_P on C_P.id_transformador=T.id \
                inner join contiene_transformador CT1 on CT1.id_transformador=T.id AND CT1.id_recogida=? \
              UNION \
              select T2.id, T2.voltaje, T2.amperaje, 'Componente' as tipo, C_C.id_componente as id_2 FROM transformador T2 \
                inner join corresponde_componente C_C on C_C.id_transformador=T2.id \
                inner join contiene_transformador CT2 on CT2.id_transformador=T2.id AND CT2.id_recogida=? \
              UNION \
              select T3.id, T3.voltaje, T3.amperaje, null as tipo, null as id_2 FROM transformador T3 \ 
                inner join contiene_transformador CT3 on CT3.id_transformador=T3.id AND CT3.id_recogida=? \
                WHERE NOT EXISTS( SELECT * FROM corresponde_componente C_C2 WHERE C_C2.id_transformador=T3.id ) AND \
                    NOT EXISTS( SELECT * FROM corresponde_portatil C_P2 WHERE C_P2.id_transformador=T3.id ) \
              ) ORDER BY id;`

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query(sql, [id, id, id], function (err, rows) {
        
        conn.release();

        if (err) {
          const e = new BadRequest('Error al obtener transformadores', ['Ocurrió algún error al obtener los transformadores de la recogida'], `Error al obtener los transformadores de la recogida. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }

        let transformadores = [];

        for (let i = 0; i < rows.length; i++) {
          let json = {
            id: rows[i].id,
            voltaje: rows[i].voltaje,
            amperaje: rows[i].amperaje
          };

          if(rows[i].tipo){
            json['corresponde'] = {
              tipo: rows[i].tipo,
              id: rows[i].id_2
            }
          }
          else{
            json['corresponde'] = null;
          }

          transformadores.push(json);
        }
        
        return res.status('200').send({
          cantidad: rows.length,
          data: transformadores
        });
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });

}

exports.obtenerComponentes = function (req, res){

	if(req.params.id )           
		var id = req.params.id;
	else{
		const e = new BadRequest('Id de la recogida no especificado o no válido', ["id no introducido o no válido"], `Error al obtener los transformadores de las recogidas. El usuario no ha especificado un tipo válido`);
		return res.status(e.statusCode).send(e.getJson());
	}

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('SELECT C.id, C.estado, C.observaciones, C.fecha_entrada, C.tipo, T.id_caracteristica, CA.nombre, CA.valor FROM recogida R \
                    INNER JOIN contiene_componente CC ON CC.id_recogida=R.id \
                    INNER JOIN componente C ON CC.id_componente=C.id \
                    INNER JOIN tiene T ON T.id_componente=C.id \
                    INNER JOIN caracteristica CA on CA.id=T.id_caracteristica \
                    WHERE R.id=? \
                  UNION \
                    SELECT C2.id, C2.estado, C2.observaciones, C2.fecha_entrada, C2.tipo, Null as id_caracteristica, null as nombre, null as valor FROM recogida R2 \
                    INNER JOIN contiene_componente CC2 ON CC2.id_recogida=R2.id \
                    INNER JOIN componente C2 ON CC2.id_componente=C2.id \
                      where not exists( select * from tiene T2 where T2.id_componente=C2.id ) && R2.id=?;', [id, id], function (err, rows) {
        
        conn.release();

        if (err) {
          const e = new BadRequest('Error al obtener las componentes de la recogida', ['Ocurrió algún error al obtener las componentes de la recogida'], `Error al obtener las componentes de la recogida. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }

        let componentes = obtenerCaracteristicas(rows);
        
        return res.status('200').send({
					cantidad: componentes.length,
					data: componentes
				});
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });

}

exports.obtenerOrdenadores = function (req, res){

	if(req.params.id )           
		var id = req.params.id;
	else{
		const e = new BadRequest('Id de la recogida no especificado o no válido', ["id no introducido o no válido"], `Error al obtener los ordenadores de las recogidas. El usuario no ha especificado un tipo válido`);
		return res.status(e.statusCode).send(e.getJson());
	}

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('select "Portatil" as tipo, O.id, O.localizacion_taller, O.observaciones, P.estado, Null as tamano from recogida R \
                      inner join contiene_ordenador CO on CO.id_recogida=R.id \
                      inner join ordenador O on CO.id_ordenador=O.id \
                      inner join portatil P on O.id=P.id \
                    WHERE R.id=? \
                  UNION \
                  select "Sobremesa" as tipo, O.id, O.localizacion_taller, O.observaciones, Null as estado, S.tamano from recogida R \
                      inner join contiene_ordenador CO on CO.id_recogida=R.id \
                      inner join ordenador O on CO.id_ordenador=O.id \
                      inner join sobremesa S on O.id=S.id \
                      WHERE R.id=?;', [id, id], function (err, rows) {
        
        conn.release();

        if (err) {
          const e = new BadRequest('Error al obtener los ordenadores de la recogida', ['Ocurrió algún error al obtener los ordenadores de la recogida'], `Error al obtener los ordenadores de la recogida. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
					cantidad: rows.length,
					data: rows
				});
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });

}

exports.eliminarRecogida = function (req, res){

  if(req.params.id )           
    var id = req.params.id;
  else{
    const e = new BadRequest('Id de la recogida no especificado o no válido', ["id no introducido o no válido"], `Error al eliminar una recogida. El usuario no ha especificado un id válido`);
    return res.status(e.statusCode).send(e.getJson());
  } 

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('DELETE FROM recogida WHERE id=?', [id], function (err, rows) {
        
        conn.release();

        if (err) {
          const e = new BadRequest('Error al eliminar una recogida', ['Ocurrió algún error al eliminar la recogida'], `Error al eliminar la recogida. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
          estado: "Correcto",
          descripcion: "Recogida eliminada correctamente"
        });
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });

}

exports.editarRecogida = function(req, res){

  const errores = validationResult(req);

  if(!errores.isEmpty() || !req.params.id){
    const e = new BadRequest('Error al introducir los parámetros', errores.array(), `Error en los parámetros introducidos por el usuario al actualizar una recogida. ${errores.array()}`);
    return res.status(e.statusCode).send(e.getJson());
  }

  if(req.body.fecha)          var fecha = req.body.fecha;
  else                        var fecha = null;
  if(req.body.localizacion)   var localizacion = req.body.localizacion;
  else                        var localizacion = null;
  if(req.params.id)           var id = req.params.id;

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.beginTransaction(function(err) {
      
        if (!err) {
        
          conn.query('UPDATE recogida SET fecha=? WHERE id=?', [new Date(fecha), id], function (err, rows) {
            
            if(!err){
              
              conn.query('UPDATE en SET localizacion=? WHERE id_recogida=?', [localizacion, id], function (err, rows) {

                if(!err){
                  conn.commit(function(err) {

                    conn.release();

                    if (err) {
                      const e = new BadRequest('Error al actualizar una recogida', ['Ocurrió algún error al actualizar la recogida'], `Error al actualizar la recogida. ${err}`);
                      return res.status(e.statusCode).send(e.getJson());
                    }
                    
                    return res.status('200').send({
                      estado: "Correcto",
                      descripcion: "Recogida actualizada correctamente"
                    });
                  })
                }
                else{
                  const e = new BadRequest('Error al actualizar una recogida', ['Ocurrió algún error al actualizar la recogida'], `Error al actualizar la recogida. ${err}`);
                  return res.status(e.statusCode).send(e.getJson());
                }
              })
            }
            else {
              const e = new BadRequest('Error al actualizar una recogida', ['Ocurrió algún error al actualizar la recogida'], `Error al actualizar la recogida. ${err}`);
              return res.status(e.statusCode).send(e.getJson());
            }
          });

        }
        else {
          const e = new BadRequest('Error al actualizar una recogida', ['Ocurrió algún error al actualizar la recogida'], `Error al actualizar la recogida. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });

}


exports.obtenerRecogidaId = function (req, res){

  if(!req.params.id){
    const e = new BadRequest('Error al introducir la id', ['Error en el id'], `Error en los parámetros introducidos por el usuario al obtener la info de una recogida.`);
    return res.status(e.statusCode).send(e.getJson());
  }

  const id = req.params.id;

  let sql = `SELECT id, fecha, tipo, localizacion FROM recogida 
              INNER JOIN en ON id_recogida=id
              WHERE id=?;`

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query(sql, [id], function (err, rows) {
        
        conn.release();

        if (err || !rows.length) {
          const e = new BadRequest('Error al obtener', ['Ocurrió algún error al obtener la recogida'], `Error al obtener la recogida. ${err}. Si no se muestra ningún error de base de datos es posible que el usuario haya introducido una id inexistente.`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send(rows[0]);
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });

}

exports.aniadirCableId = function (req, res){

  if(req.params.id_recogida)  var id_recogida = req.params.id_recogida;
  else                        var id_recogida = null;
  if(req.params.id_cable)     var id_cable = req.params.id_cable;
  else                        var id_cable = null;

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('INSERT INTO contiene_cable(id_recogida, id_cable) VALUES (?);', [[id_recogida, id_cable]], function (err, rows) {
        
        if (err) {
          const e = new BadRequest('Error al insertar un cable en una recogida', ['Ocurrió algún error al insertar el cable. Puede ser que el cable o la recogida no existan o que simplemente ya esté inserado en esta recogida'], `Error al insertar un cable en una recogida. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
					estado: "Correcto",
					descripcion: "Cable insertado correctamente en la recogida"
				});
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });
}

exports.aniadirTransformadorId = function (req, res) {
  
  if(req.params.id_recogida)  var id_recogida = req.params.id_recogida;
  else                        var id_recogida = null;
  if(req.params.id_trans)     var id_trans = req.params.id_trans;
  else                        var id_trans = null;

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('INSERT INTO contiene_transformador(id_recogida, id_transformador) VALUES (?);', [[id_recogida, id_trans]], function (err, rows) {
        
        if (err) {
          const e = new BadRequest('Error al insertar un transformador en una recogida', ['Ocurrió algún error al insertar el transformador. Puede ser que el transformador o la recogida no existan o que simplemente ya esté inserado en esta recogida'], `Error al insertar un transformador en una recogida. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
					estado: "Correcto",
					descripcion: "Transformador insertado correctamente en la recogida"
				});
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });
}

exports.aniadirOrdenadorId = function (req, res) {
  
  if(req.params.id_recogida)  var id_recogida = req.params.id_recogida;
  else                        var id_recogida = null;
  if(req.params.id_ord)       var id_ord = req.params.id_ord;
  else                        var id_ord = null;

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('INSERT INTO contiene_ordenador(id_recogida, id_ordenador) VALUES (?);', [[id_recogida, id_ord]], function (err, rows) {
        
        if (err) {
          const e = new BadRequest('Error al insertar un ordenador en una recogida', ['Ocurrió algún error al insertar el ordenador. Puede ser que el ordenador o la recogida no existan o que simplemente ya esté inserado en esta recogida'], `Error al insertar un ordenador en una recogida. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
					estado: "Correcto",
					descripcion: "Ordenador insertado correctamente en la recogida"
				});
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });
}

exports.aniadirComponenteId = function (req, res) {
  
  if(req.params.id_recogida)  var id_recogida = req.params.id_recogida;
  else                        var id_recogida = null;
  if(req.params.id_comp)      var id_comp = req.params.id_comp;
  else                        var id_comp = null;

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('INSERT INTO contiene_componente(id_recogida, id_componente) VALUES (?);', [[id_recogida, id_comp]], function (err, rows) {
        
        if (err) {
          const e = new BadRequest('Error al insertar una componente en una recogida', ['Ocurrió algún error al insertar la componente. Puede ser que la componente o la recogida no existan o que simplemente ya esté inserado en esta recogida'], `Error al insertar una componente en una recogida. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
					estado: "Correcto",
					descripcion: "Componente insertada correctamente en la recogida"
				});
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });
}

exports.eliminarCableId = function (req, res){

  if(req.params.id_recogida)  var id_recogida = req.params.id_recogida;
  else                        var id_recogida = null;
  if(req.params.id_cable)     var id_cable = req.params.id_cable;
  else                        var id_cable = null;

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('DELETE FROM contiene_cable WHERE id_recogida=? AND id_cable=?;', [id_recogida, id_cable], function (err, rows) {
        
        if (err) {
          const e = new BadRequest('Error al eliminar un cable de una recogida', ['Ocurrió algún error al eliminar el cable'], `Error al eliminar un cable en una recogida. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
					estado: "Correcto",
					descripcion: "Cable eliminado correctamente de la recogida"
				});
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });
}

exports.eliminarTransformadorId = function (req, res) {
  
  if(req.params.id_recogida)  var id_recogida = req.params.id_recogida;
  else                        var id_recogida = null;
  if(req.params.id_trans)     var id_trans = req.params.id_trans;
  else                        var id_trans = null;

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('DELETE FROM contiene_transformador WHERE id_recogida=? AND id_transformador=?;', [id_recogida, id_trans], function (err, rows) {
        
        if (err) {
          const e = new BadRequest('Error al eliminar un transformador de una recogida', ['Ocurrió algún error al eliminar el transformador.'], `Error al eliminar un transformador en una recogida. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
					estado: "Correcto",
					descripcion: "Transformador eliminardo correctamente de la recogida"
				});
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });
}

exports.eliminarOrdenadorId = function (req, res) {
  
  if(req.params.id_recogida)  var id_recogida = req.params.id_recogida;
  else                        var id_recogida = null;
  if(req.params.id_ord)       var id_ord = req.params.id_ord;
  else                        var id_ord = null;

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('DELETE FROM contiene_ordenador WHERE id_recogida=? AND id_ordenador=?;', [id_recogida, id_ord], function (err, rows) {
        
        if (err) {
          const e = new BadRequest('Error al eliminar un ordenador de una recogida', ['Ocurrió algún error al elimianr el ordenador'], `Error al eliminar un ordenador de una recogida. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
					estado: "Correcto",
					descripcion: "Ordenador eliminado correctamente en la recogida"
				});
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });
}

exports.eliminarComponenteId = function (req, res) {
  
  if(req.params.id_recogida)  var id_recogida = req.params.id_recogida;
  else                        var id_recogida = null;
  if(req.params.id_comp)      var id_comp = req.params.id_comp;
  else                        var id_comp = null;

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('DELETE FROM contiene_componente WHERE id_recogida=? AND id_componente=?;', [id_recogida, id_comp], function (err, rows) {
        
        if (err) {
          const e = new BadRequest('Error al eliminar una componente en una recogida', ['Ocurrió algún error al eliminar la componente.'], `Error al eliminar una componente en una recogida. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
					estado: "Correcto",
					descripcion: "Componente elimiada correctamente en la recogida"
				});
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });
}