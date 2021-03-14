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

exports.aniadirComponente = function (req, res) {
  
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

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('SELECT T.id as id, T.voltaje, T.amperaje FROM recogida R \
                    INNER JOIN contiene_transformador CT ON CT.id_recogida=R.id \
                    INNER JOIN transformador T ON CT.id_transformador=T.id \
                  WHERE R.id=?;', [id], function (err, rows) {
        
        conn.release();

        if (err) {
          const e = new BadRequest('Error al obtener transformadores', ['Ocurrió algún error al obtener los transformadores de la recogida'], `Error al obtener los transformadores de la recogida. ${err}`);
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