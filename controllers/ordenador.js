const db = require('../db/pool').pool;
const { APIError, NotFound, BadRequest } = require('../aux/error');
const { validationResult } = require('express-validator');
const { obtenerCaracteristicas } = require('../aux/gestionCaracteristicas');

exports.obtenerOrdenadores = function(req, res){

  if(!req.params.tipo || (req.params.tipo == "portatil" || req.params.tipo == "sobremesa") ) 
    var tipo = req.params.tipo;
  else{
    const e = new BadRequest('Error al introducir el tipo', ["El tipo solo puede ser: 'Portatil' o 'Sobremesa'"], `Error al introducir el tipo por el usuario`);
    return res.status(e.statusCode).send(e.getJson());
  }

  db.getConnection(function (err, conn) {
    if (!err) {

      if(tipo=="portatil"){
        sql = 'select O.id, O.localizacion_taller, O.observaciones, P.estado from ordenador O \
                      inner join portatil P on O.id=P.id ORDER BY O.id;';
      }
      else if(tipo=="sobremesa"){
        sql = 'select O.id, O.localizacion_taller, O.observaciones, S.tamano from ordenador O \
                      inner join sobremesa S on O.id=S.id ORDER BY O.id;';
      }
      else{
        sql = 'select "Portatil" as tipo, O.id, O.localizacion_taller, O.observaciones, P.estado, Null as tamano from ordenador O \
                inner join portatil P on O.id=P.id \
              UNION \
              select "Sobremesa" as tipo, O.id, O.localizacion_taller, O.observaciones, Null as estado, S.tamano from ordenador O \
                inner join sobremesa S on O.id=S.id ORDER BY id;'
      }

      conn.query(sql, function (err, rows) {

        conn.release();

        if (!err) {
          res.status('200').send({
            cantidad: rows.length,
            data: rows
          });
        }
        else {
          const e = new APIError('Bad Gateway', 502, 'Error al obtener los ordenadores de la base de datos', `Error al obtener los ordenadores de la base de datos\n${err}`);
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


exports.crearSobremesa = function (req, res){
  
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

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.beginTransaction(function(err) {

        if(!err){
          conn.query('INSERT INTO ordenador(localizacion_taller, observaciones) VALUES (?)', [[localizacion_taller, observaciones]], function (err, rows) {

            if (!err){
              
              let id_ordenador = rows.insertId;

              conn.query('INSERT INTO sobremesa VALUES (?)', [[id_ordenador, tamano]], function (err, rows) {

                if (!err){
                  
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

exports.crearPortatil = function (req, res){
  
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

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.beginTransaction(function(err) {

        if(!err){
          conn.query('INSERT INTO ordenador(localizacion_taller, observaciones) VALUES (?)', [[localizacion_taller, observaciones]], function (err, rows) {

            if (!err){
              
              let id_ordenador = rows.insertId;

              conn.query('INSERT INTO portatil VALUES (?)', [[id_ordenador, estado]], function (err, rows) {

                if (!err){
                  
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

exports.eliminarOrdenador = function(req, res){

  if(req.params.id) 
    var id = req.params.id;
  else{
    const e = new BadRequest('Error al introducir el id', ["Id no válido"], `Error al introducir el id por el usuario al eliminar un ordenador`);
    return res.status(e.statusCode).send(e.getJson());
  }

  db.getConnection(function (err, conn) {
    if (!err) {

      conn.query('DELETE FROM ordenador WHERE id=?',[id], function (err, rows) {

        conn.release();

        if (!err) {
          return res.status('200').send({
            estado: "Correcto",
            descripcion: "Ordenador eliminado correctamente"
          });
        }
        else {
          const e = new APIError('Bad Gateway', 502, 'Error al eliminar un ordenador de la base de datos', `Error al eliminar un ordenador de la base de datos\n${err}`);
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

exports.aniadirComponente = function (req, res){

  if(req.params.id_ord && req.params.id_comp){ 
    var id_ord  = req.params.id_ord;
    var id_comp = req.params.id_comp;
  }
  else{
    const e = new BadRequest('Error al introducir alguno de los id', ["Ids no válidos"], `Error al introducir los ids por el usuario al añadir un componente a un ordenador`);
    return res.status(e.statusCode).send(e.getJson());
  }

  db.getConnection(function (err, conn) {
    if (!err) {

      conn.query('INSERT INTO formado(id_componente, id_ordenador) VALUES (?)',[[id_comp, id_ord]], function (err, rows) {

        conn.release();

        if (!err) {
          return res.status('200').send({
            estado: "Correcto",
            descripcion: "Componente añadido al ordenador correctamente"
          });
        }
        else {
          const e = new APIError('Bad Gateway', 502, 'Error al añadir una componente a un ordenador', `Error al añadir una componente a un ordenador\n${err}`);
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

exports.obtenerOrdenador = function (req, res){
  
  if(req.params.id) 
    var id = req.params.id;
  else{
    const e = new BadRequest('Error al introducir el id', ["Id no válido"], `Error al introducir el id por el usuario al obtener las componentes de un ordenador`);
    return res.status(e.statusCode).send(e.getJson());
  }

  db.getConnection(function (err, conn) {
    if (!err) {

      conn.beginTransaction(function(err) {

        if(!err){

          var sql = `select "Portatil" as tipo, O.id, O.localizacion_taller, O.observaciones, P.estado, Null as tamano from ordenador O \
          inner join portatil P on O.id=P.id WHERE O.id=?\
          UNION \
          select "Sobremesa" as tipo, O.id, O.localizacion_taller, O.observaciones, Null as estado, S.tamano from ordenador O \
          inner join sobremesa S on O.id=S.id WHERE O.id=?;`

          conn.query(sql, [id,id], function (err, rows) {

            if(!err){

              if(rows.length)
                var resultado = rows[0];
              else
                resultado = {}

              sql = ' SELECT C.id, C.estado, C.observaciones, C.fecha_entrada, C.tipo, T.id_caracteristica, CA.nombre, CA.valor FROM componente C \
                        inner join formado F on F.id_componente=C.id \
                          inner join ordenador O on F.id_ordenador=O.id \
                          INNER JOIN tiene T ON T.id_componente=C.id \
                        INNER JOIN caracteristica CA on CA.id=T.id_caracteristica \
                        WHERE O.id = ? \
                      UNION  \
                      SELECT C2.id, C2.estado, C2.observaciones, C2.fecha_entrada, C2.tipo, NULL as id_caracteristica, null as nombre, null as valor FROM componente C2 \
                        inner join formado F2 on F2.id_componente=C2.id \
                          inner join ordenador O2 on F2.id_ordenador=O2.id \
                          where not exists ( SELECT * FROM tiene T2 where T2.id_componente=C2.id ) and O2.id = ?;';

              conn.query(sql,[id, id], function (err, rows) {

                if (!err) {

                  conn.commit(function(err) {

                    if(!err){
                      conn.release();

                      let componentes = obtenerCaracteristicas(rows);

                      resultado["componentes"] = {
                        cantidad: componentes.length,
                        data: componentes
                      };

                      return res.status('200').send(resultado);
                    }
                    else {
                      return conn.rollback(function() {
                        const e = new BadRequest('Error al obtener el con sus componentes', ['Ocurrió algún error al obtener el ordenador'], `Error al obtener el ordenador y sus componentes por el usuario. ${err}`);
                        return res.status(e.statusCode).send(e.getJson());
                      });
                    }

                  });
                }
                else {
                  return conn.rollback(function() {
                    const e = new BadRequest('Error al obtener el con sus componentes', ['Ocurrió algún error al obtener el ordenador'], `Error al obtener el ordenador y sus componentes por el usuario. ${err}`);
                    return res.status(e.statusCode).send(e.getJson());
                  });
                }

              })

            }
            else {
              return conn.rollback(function() {
                const e = new BadRequest('Error al obtener el con sus componentes', ['Ocurrió algún error al obtener el ordenador'], `Error al obtener el ordenador y sus componentes por el usuario. ${err}`);
                return res.status(e.statusCode).send(e.getJson());
              });
            }
          })
        }
        else{
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

exports.eliminarOrdenadorConComponentes = function (req, res) {
  if(req.params.id) 
    var id = req.params.id;
  else{
    const e = new BadRequest('Error al introducir el id', ["Id no válido"], `Error al introducir el id por el usuario al eliminar un ordenador junto con sus componentes`);
    return res.status(e.statusCode).send(e.getJson());
  }


  db.getConnection(function (err, conn) {
    if (!err) {
      conn.beginTransaction(function(err) {

        if(!err){
          // Elimina las características de las componentes asociadas al ordenador

          sql = 'DELETE CA FROM caracteristica CA WHERE EXISTS ( \
            SELECT * FROM tiene T \
              inner join formado F on F.id_componente=T.id_componente \
            where T.id_caracteristica=CA.id AND F.id_ordenador=? \
          );'

          conn.query(sql, [id], function (err, rows) {

            if (!err){
              
              sql = 'DELETE C FROM componente C WHERE EXISTS (SELECT * FROM formado F where F.id_componente=C.id AND F.id_ordenador=? );';

              conn.query(sql, [id], function (err, rows) {

                if (!err){

                  conn.query('DELETE FROM ordenador WHERE id=?;', [id], function (err, rows) {

                    if (!err){
                      
                      conn.commit(function(err) {
    
                        conn.release();
    
                        if (err) {
                          return conn.rollback(function() {
                            const e = new BadRequest('Error al eliminar el ordenador con todos sus componentes', ['Ocurrió algún error al eliminar el ordenador'], `Error el eliminar un ordenador junto con sus componentes por el usuario. ${err}`);
                            return res.status(e.statusCode).send(e.getJson());
                          });
                        }
                        
                        return res.status('200').send({
                          estado: "Correcto",
                          descripcion: "Ordenador y componentes eliminados correctamente"
                        });
                      });
        
                    }
                    else {
                      return conn.rollback(function() {
                        const e = new BadRequest('Error al eliminar el ordenador con sus componentes', ['Ocurrió algún error al eliminar al ordenador'], `Error al eliminar el ordenador y sus componentes por el usuario. ${err}`);
                        return res.status(e.statusCode).send(e.getJson());
                      });
                    }
        
                  });
    
                }
                else {
                  return conn.rollback(function() {
                    const e = new BadRequest('Error al eliminar el ordenador con sus componentes', ['Ocurrió algún error al eliminar el ordenador'], `Error al eliminar un ordenador y sus componentes por el usuario. ${err}`);
                    return res.status(e.statusCode).send(e.getJson());
                  });
                }
    
              });
            }
            else {
              return conn.rollback(function() {
                const e = new BadRequest('Error al eliminar el ordenador con sus componentes', ['Ocurrió algún error al eliminar el ordenador'], `Error al eliminar un ordenador y sus componentes por el usuario. ${err}`);
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
  });
}

exports.modificarOrdenador = function (req, res) {

  if(req.body.estado)               var estado = req.body.estado.replace(/\s+/g, ' ').trim();
  else                              var estado = null;
  if(req.body.tamano)               var tamano = req.body.tamano.replace(/\s+/g, ' ').trim();
  else                              var tamano = null;
  if(req.body.observaciones)        var observaciones = req.body.observaciones.replace(/\s+/g, ' ').trim();
  else                              var observaciones = null;
  if(req.body.localizacion_taller)  var localizacion_taller = req.body.localizacion_taller.replace(/\s+/g, ' ').trim();
  else                              var localizacion_taller = null;
  var id = req.params.id;

  const errores = validationResult(req);

  if(!errores.isEmpty()){
    const e = new BadRequest('Error al introducir los parámetros', errores.array(), `Error en los parámetros introducidos por el usuario al editar una componente. ${errores.array()}`);
    return res.status(e.statusCode).send(e.getJson());
  }

  // Realiza la query según lo que se ha introducido para cambiar
  sql = 'UPDATE ordenador SET ';
  values = [];
  
  if(localizacion_taller){
    sql += 'localizacion_taller=?'
    values.push(localizacion_taller);
  }
  if(observaciones){
    sql += ', observaciones=?'
    values.push(observaciones);
  }

  sql += ' WHERE id=?';
  values.push(id);


  db.getConnection(function (err, conn) {
    if (!err) {
      conn.beginTransaction(function(err) {

        if(!err){
          conn.query(sql, values, function (err, rows) {

            if (!err){
              
              if(estado || tamano){

                if(estado){
                  sql = 'UPDATE portatil SET estado=? WHERE id=?';
                  values = [estado, id];
                }
                else if(tamano){
                  sql = 'UPDATE sobremesa SET tamano=? WHERE id=?';
                  values = [tamano, id]
                }

                conn.query(sql, values, function (err, rows) {

                  if (!err){
                    
                    conn.commit(function(err) {

                      conn.release();
    
                      if (err) {
                        return conn.rollback(function() {
                          const e = new BadRequest('Error al modificar el ordenador', ['Ocurrió algún error al modificar el ordenador'], `Error al modificar un ordenador. ${err}`);
                          return res.status(e.statusCode).send(e.getJson());
                        });
                      }
                      
                      return res.status('200').send({
                        estado: "Correcto",
                        descripcion: "Ordenador modificado correctamente"
                      });
                    });
      
                  }
                  else {
                    return conn.rollback(function() {
                      const e = new BadRequest('Error al modificar el ordenador', ['Ocurrió algún error al modificar el ordenador'], `Error al modificar un ordenador. ${err}`);
                      return res.status(e.statusCode).send(e.getJson());
                    });
                  }
      
                });

              }
              else{

                conn.commit(function(err) {

                  conn.release();

                  if (err) {
                    return conn.rollback(function() {
                      const e = new BadRequest('Error al modificar el ordenador', ['Ocurrió algún error al modificar el ordenador'], `Error al modificar un ordenador. ${err}`);
                      return res.status(e.statusCode).send(e.getJson());
                    });
                  }
                  
                  return res.status('200').send({
                    estado: "Correcto",
                    descripcion: "Ordenador modificado correctamente"
                  });
                });

              }

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

exports.eliminarComponente = function (req, res){

  if(req.params.id_o && req.params.id_c){ 
    var id_o = req.params.id_o;
    var id_c = req.params.id_c;
  }
  else{
    const e = new BadRequest('Error al introducir alguno de los id', ["Ids no válidos"], `Error al introducir los ids por el usuario al eliminar en enlace entre una componente y un ordenador`);
    return res.status(e.statusCode).send(e.getJson());
  }

  db.getConnection(function (err, conn) {
    if (!err) {

      conn.query('DELETE FROM formado WHERE id_componente=? AND id_ordenador=?',[id_c, id_o], function (err, rows) {

        conn.release();

        if (!err) {
          return res.status('200').send({
            estado: "Correcto",
            descripcion: "Componente separado del ordenador correctamente"
          });
        }
        else {
          const e = new APIError('Bad Gateway', 502, 'Error al añadir una componente a un ordenador', `Error al añadir una componente a un ordenador\n${err}`);
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