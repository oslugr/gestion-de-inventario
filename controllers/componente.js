const db = require('../db/pool').pool;
const { APIError, NotFound, BadRequest } = require('../aux/error');
const { validationResult } = require('express-validator');
const { obtenerCaracteristicas } = require('../aux/gestionCaracteristicas');

exports.obtenerComponentes = function (req, res) {

  // Validación de los valores introducidos
  if(req.params.tipo)
    var tipo = req.params.tipo.replace(/\s+/g, ' ').trim();

  db.getConnection(function (err, conn) {
    if (!err) {

      // Obtiene por tipo o no
      if(tipo){ 
        var params = [tipo, tipo];
        var sql    = '( select C.id, estado, observaciones, fecha_entrada, tipo, id_caracteristica, nombre, valor FROM componente C \
                        INNER JOIN tiene T ON T.id_componente=C.id \
                        INNER JOIN caracteristica CA on CA.id=T.id_caracteristica \
                      WHERE C.tipo=? \
                      UNION \
                      SELECT C2.id, C2.estado, C2.observaciones, C2.fecha_entrada, C2.tipo, Null as id_caracteristica, Null as nombre, Null as valor FROM componente C2 \
                        WHERE NOT EXISTS( SELECT * FROM tiene T WHERE T.id_componente=C2.id ) && C2.tipo=? ) ORDER BY id, id_caracteristica';
      }
      else{
        var params = [];
        var sql    = '( select C.id, estado, observaciones, fecha_entrada, tipo, id_caracteristica, nombre, valor FROM componente C \
                        INNER JOIN tiene T ON T.id_componente=C.id \
                        INNER JOIN caracteristica CA on CA.id=T.id_caracteristica \
                      UNION \
                      SELECT C2.id, C2.estado, C2.observaciones, C2.fecha_entrada, C2.tipo, Null as id_caracteristica, Null as nombre, Null as valor FROM componente C2 \
                        WHERE NOT EXISTS( SELECT * FROM tiene T WHERE T.id_componente=C2.id )) ORDER BY id, id_caracteristica';
      }

      conn.query(sql, params, function (err, rows) {

        conn.release();

        if (!err) {

          let componentes = obtenerCaracteristicas(rows);

          res.status('200').send({
            cantidad: componentes.length,
            data: componentes
          });
        }
        else {
          const e = new APIError('Bad Gateway', 502, 'Error al obtener los componentes de la base de datos', `Error al obtener los componentes de la base de datos\n${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }

      })
    }
    else {
      const e = new APIError('Service Unavailable', '503', 'Error al conectar con la base de datos', `Error al conectar con la base de datos\n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  })

}

// Funcion recursiva para añadir todas las características que haya indicado el usuario;
function insertarCaracteristicas(caracteristicas, id_componente, conn, i, res, callback){
  
  if(i<caracteristicas.length){
    conn.query('INSERT INTO caracteristica(nombre, valor) VALUES (?)', [[caracteristicas[i].nombre,caracteristicas[i].valor]], function (err, rows) {
      if (!err){
        
        let id_caracteristica = rows.insertId;

        conn.query('INSERT INTO tiene VALUES (?)', [[id_componente, id_caracteristica]], function (err, rows) {
          if (!err){
            
            caracteristicas[i]['id'] = id_caracteristica;

            return callback(caracteristicas, id_componente, conn, i+1, res, callback);
      
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
  }
}


exports.insertarComponente = function (req, res) {

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
              
              return insertarCaracteristicas(caracteristicas, rows.insertId, conn, 0, res, insertarCaracteristicas);

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


exports.eliminarComponente = function (req, res){

  if(req.params.id)           
    var id = req.params.id.replace(/\s+/g, ' ').trim();
  else{
    const e = new BadRequest('Id del componente no introducida', ["ID no introducido"], `Error al eliminar un componente por el usuario. No ha especificado id`);
    return res.status(e.statusCode).send(e.getJson());
  }

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.beginTransaction(function(err) {

        if(!err){
          conn.query('delete from caracteristica where exists( select * from tiene T where T.id_componente=? and T.id_caracteristica=id);', [id], function (err, rows) {

            if (!err){
              
              conn.query('delete from componente where id=?;', [id], function (err, rows) {

                if (!err){
                  
                  conn.commit(function(err) {

                    conn.release();

                    if (err) {
                      return conn.rollback(function() {
                        const e = new BadRequest('Error al eliminar', ['Ocurrió algún error al eliminar la componente'], `Error al eliminar una componente por el usuario. ${err}`);
                        return res.status(e.statusCode).send(e.getJson());
                      });
                    }
                    
                    return res.status('200').send({
                      estado: "Correcto",
                      descripcion: "Componente eliminada correctamente"
                    });
                  });
    
                }
                else {
                  return conn.rollback(function() {
                    const e = new BadRequest('Error al eliminar una componente', ['Ocurrió algún error al eliminar la componente'], `Error al eliminar una componente. ${err}`);
                    return res.status(e.statusCode).send(e.getJson());
                  });
                }
    
              })

            }
            else {
              return conn.rollback(function() {
                const e = new BadRequest('Error al eliminar una componente', ['Ocurrió algún error al eliminar la componente'], `Error al eliminar una componente. ${err}`);
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

exports.insertarCaracteristica = function(req, res){

  const errores = validationResult(req);

  if(!errores.isEmpty()){
    const e = new BadRequest('Error al introducir los parámetros', errores.array(), `Error en los parámetros introducidos por el usuario al añadir una característica a una componente. ${errores.array()}`);
    return res.status(e.statusCode).send(e.getJson());
  }

  const nombre = req.body.nombre.replace(/\s+/g, ' ').trim();
  const valor = req.body.valor.replace(/\s+/g, ' ').trim();
  const id = req.params.id.replace(/\s+/g, ' ').trim();

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.beginTransaction(function(err) {

        if(!err){
          conn.query('INSERT INTO caracteristica(nombre, valor) VALUES (?);', [[nombre, valor]], function (err, rows) {

            if (!err){

              let id_caracteristica = rows.insertId;
              
              conn.query('INSERT INTO tiene VALUES (?);', [[id, id_caracteristica]], function (err, rows) {

                if (!err){
                  
                  conn.commit(function(err) {

                    conn.release();

                    if (err) {
                      return conn.rollback(function() {
                        const e = new BadRequest('Error al eliminar una componente', ['Ocurrió algún error al eliminar la componente'], `Error al eliminar una componente. ${err}`);
                        return res.status(e.statusCode).send(e.getJson());
                      });
                    }
                    
                    return res.status('200').send({
                      estado: "Correcto",
                      descripcion: "Característica insertada correctamente",
                      id: id_caracteristica
                    });
                  });
    
                }
                else {
                  return conn.rollback(function() {
                    const e = new BadRequest('Error al insertar la característica', ['Ocurrió algún error al insertar la característica. Es posible que no exista la componente especificada'], `Error al insertar una característica por el usuario. ${err}`);
                    return res.status(e.statusCode).send(e.getJson());
                  });
                }
    
              })

            }
            else {
              return conn.rollback(function() {
                const e = new BadRequest('Error al insertar la característica', ['Ocurrió algún error al insertar la característica'], `Error al insertar la característica. ${err}`);
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


exports.eliminarCaracteristica = function (req, res){

  if(req.params.id)           
    var id = req.params.id.replace(/\s+/g, ' ').trim();
  else{
    const e = new BadRequest('Id de la característica no introducida', ["ID no introducido"], `Error al eliminar una característica por el usuario. No ha especificado id`);
    return res.status(e.statusCode).send(e.getJson());
  }

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('delete from caracteristica where id=?;', [id], function (err, rows) {
        
        conn.release();

        if (err) {
          const e = new BadRequest('Error al eliminar', ['Ocurrió algún error al eliminar la característica'], `Error al eliminar una característica por el usuario. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
          estado: "Correcto",
          descripcion: "Característica eliminada correctamente"
        });
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al iniciar la transacción para eliminar características\n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });

}

exports.modificarEstado = function (req, res){

  const valores_validos = ['Desconocido', 'Bueno', 'Regular', 'Por revisar', 'No aprovechable', 'Roto'];
  const id = req.params.id;

  if(req.params.estado && valores_validos.includes(req.params.estado) )           
    var estado = req.params.estado;
  else{
    const e = new BadRequest('Estado no válido o no introducido', [{msg: "Estado no válido", valores: valores_validos}], `Error al actualizar el estado de un componente. Estado no válido`);
    return res.status(e.statusCode).send(e.getJson());
  }

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('UPDATE componente SET estado=? WHERE id=?', [estado, id], function (err, rows) {
        
        conn.release();

        if (err) {
          const e = new BadRequest('Error al actualizar el estado de la componente', ['Ocurrió algún error al actualizar el estado'], `Error al actualizar el estado de una componente. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
          estado: "Correcto",
          descripcion: "Estado actualizado correctamente"
        });
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar con la base de datos al modificar un estado\n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });

}


exports.actualizarComponente = function (req, res) {

  if(req.body.estado)           var estado = req.body.estado.replace(/\s+/g, ' ').trim();
  else                          var estado = 'Desconocido';
  if(req.body.observaciones)    var observaciones = req.body.observaciones.replace(/\s+/g, ' ').trim();
  else                          var observaciones = null;
  if(req.body.fecha_entrada)    var fecha_entrada = req.body.fecha_entrada.replace(/\s+/g, ' ').trim();
  else                          var fecha_entrada = 'NULL';
  if(req.body.tipo)             var tipo = req.body.tipo.replace(/\s+/g, ' ').trim();
  else                          var tipo = null;
  var id = req.params.id;

  const errores = validationResult(req);

  if(!errores.isEmpty()){
    const e = new BadRequest('Error al introducir los parámetros', errores.array(), `Error en los parámetros introducidos por el usuario al editar una componente. ${errores.array()}`);
    return res.status(e.statusCode).send(e.getJson());
  }

  // Realiza la query según lo que se ha introducido para cambiar
  sql = 'UPDATE componente SET ';
  values = [];
  
  if(estado){
    sql += 'estado=?'
    values.push(estado);
  }
  if(fecha_entrada){
    sql += ', fecha_entrada=?'
    values.push(new Date(fecha_entrada));
  }
  if(observaciones){
    sql += ', observaciones=?'
    values.push(observaciones);
  }
  if(tipo){
    sql += ', tipo=?'
    values.push(tipo);
  }

  sql += ' WHERE id=?';
  values.push(id);

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.query(sql, values, function (err, rows) {
        
        conn.release();

        if (err) {
          const e = new BadRequest('Error al actualizar la componente', ['Ocurrió algún error la componente'], `Error al actualizar una componente. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
          estado: "Correcto",
          descripcion: "Componente actualizada correctamente"
        });
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar con la base de datos al modificar un estado\n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });

}

exports.modificarEstado = function (req, res){

  const errores = validationResult(req);

  if(!errores.isEmpty()){
    const e = new BadRequest('Error al introducir los parámetros', errores.array(), `Error en los parámetros introducidos por el usuario al editar una característica. ${errores.array()}`);
    return res.status(e.statusCode).send(e.getJson());
  }

  const id     = req.params.id; 
  const nombre = req.body.nombre;
  const valor  = req.body.valor;

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('UPDATE caracteristica SET nombre=?, valor=? WHERE id=?', [nombre, valor, id], function (err, rows) {
        
        conn.release();

        if (err) {
          const e = new BadRequest('Error al actualizar la característica', ['Ocurrió algún error al actualizar la característica'], `Error al actualizar la característica. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
          estado: "Correcto",
          descripcion: "Característica actualizada correctamente"
        });
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar con la base de datos al modificar un estado\n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });

}
