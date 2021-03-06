const db = require('../db/pool').pool;
const { APIError, NotFound, BadRequest } = require('../aux/error');
const { validationResult } = require('express-validator');

exports.obtenerTransformadores = function (req, res) {

  let sql = `(select T.id, T.voltaje, T.amperaje, 'Portatil' as tipo, C_P.id_portatil as id_2 FROM transformador T \
              inner join corresponde_portatil C_P on C_P.id_transformador=T.id \
            UNION \
            select T2.id, T2.voltaje, T2.amperaje, 'Componente' as tipo, C_C.id_componente as id_2 FROM transformador T2 \
              inner join corresponde_componente C_C on C_C.id_transformador=T2.id \
            UNION \
            select T3.id, T3.voltaje, T3.amperaje, null as tipo, null as id_2 FROM transformador T3 \ 
              WHERE NOT EXISTS( SELECT * FROM corresponde_componente C_C2 WHERE C_C2.id_transformador=T3.id ) AND \
                  NOT EXISTS( SELECT * FROM corresponde_portatil C_P2 WHERE C_P2.id_transformador=T3.id ) \
            ) ORDER BY id;`

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.query(sql, function (err, rows) {

        conn.release();

        if (!err) {

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
          
          res.status('200').send({
            cantidad: rows.length,
            data: transformadores
          });
        }
        else {
          const e = new APIError('Bad Gateway', 502, 'Error al obtener los transformadores de la base de datos', `Error al obtener los transformadores de la base de datos\n${err}`);
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

exports.insertarTransformador = function (req, res) {

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
                }
                else{
                  const e = new BadRequest(`Error al introducir los parámetros, posiblemente el id del ${corresponde.tipo} no sea válido`, [`Id del ${corresponde.tipo} no válido`], `Error al introducir un transformador por el usuario. ${err}`);
                return res.status(e.statusCode).send(e.getJson());
                }

              });

            }
            else{

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

exports.eliminarTransformador = function (req, res) {

  // Validación de los valores introducidos
  if(req.params.voltaje && req.params.amperaje){
    var voltaje  = req.params.voltaje.replace(/\s+/g, ' ').trim();
    var amperaje = req.params.amperaje.replace(/\s+/g, ' ').trim();
  }
  else if(req.params.id){
    var id = req.params.id.replace(/\s+/g, ' ').trim();
  }
  else{
    const e = new BadRequest('Parámetros mal introducidos', [{ msg: "Valores introducidos no válidos"}], "Error en los parámetros introducidos por el usuario al añadir un transformador");
    return res.status(e.statusCode).send(e.getJson());
  }

  db.getConnection(function (err, conn) {
    if (!err) {

      if(id){
        var params = [id];
        var sql    = 'DELETE FROM transformador WHERE id=?';
      }
      else{
        var params = [voltaje,amperaje];
        var sql    = 'DELETE FROM transformador WHERE voltaje=? AND amperaje=? LIMIT 1';
      }

      conn.query(sql, params, function (err, rows) {

        conn.release();

        if (!err) {
          if(rows.affectedRows){
            res.status('200').send({
              estado: "Correcto",
              descripcion: "Transformador eliminado correctamente"
            });
          }
          else{
            const e = new BadRequest('No existe el transformador que quieres eliminar en la red.', ["No existe un transformador con las características especificadas"], 'Intento de eliminar transformador inexistente');
            return res.status(e.statusCode).send(e.getJson());
          }
        }
        else {
          const e = new APIError('Internal Server Error', '500', 'Error al eliminar los elementos de la base de datos', `Error al eliminar transformadores de la base de datos\n${err}`);
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

exports.editarTransformador = function (req, res) {
  
  const errores = validationResult(req);

  if(!errores.isEmpty()){
    const e = new BadRequest('Error al introducir los parámetros', errores.array(), `Error en los parámetros introducidos por el usuario al editar un transformador. ${errores.array()}`);
    return res.status(e.statusCode).send(e.getJson());
  }
  else{
    var id          = req.params.id.replace(/\s+/g, ' ').trim();
    var voltaje     = req.body.voltaje;
    var amperaje    = req.body.amperaje;
    var corresponde = null;

    if(req.body.corresponde){
      corresponde = req.body.corresponde;
    }

  }

  db.getConnection(function (err, conn) {
    if (!err) {

      conn.beginTransaction(function(err) {

        if(!err){

          var params = [voltaje,amperaje, id];
          var sql    = 'UPDATE transformador SET voltaje=?, amperaje=? WHERE id=?;';
          
          conn.query(sql, params, function (err, rows) {

            if(err){
              const e = new BadRequest('No se ha actualizado ningún transformador. Es posible que este no exista', ["Es posible que el transformador no exista"], 'Intento de modificar transformador inexistente');
              conn.release();
              return res.status(e.statusCode).send(e.getJson());
            }

              conn.query('DELETE FROM corresponde_portatil where id_transformador = ?',[id], function(err,rows){
                
                if(!err){

                  conn.query('DELETE FROM corresponde_componente where id_transformador = ?',[id], function(err,rows){
                    
                    if(!err){

                      if(corresponde){

                        if(corresponde.tipo == "Portatil")
                          sql = 'INSERT INTO corresponde_portatil VALUES (?)';
                        else
                          sql = 'INSERT INTO corresponde_componente VALUES (?)';

                        conn.query(sql, [[id, corresponde.id]], function(err,rows){

                          if(!err){

                            conn.commit(function(err, rows){

                              conn.release();

                              if(!err){
                                return res.status('200').send({
                                  estado: "Correcto",
                                  descripcion: "Transformador actualizado correctamente"
                                });
                              }
                              else {
                                const e = new BadRequest('No se ha actualizado el transformador. Error al encontrar la correspondencia actual', ["Es posible que el transformador o el elementos al que lo quieres asociar no exista"], `Intento de modificar transformador ${err}`);
                                return res.status(e.statusCode).send(e.getJson());
                              }

                            });

                          }
                          else{
                            const e = new BadRequest('No se ha actualizado el transformador. Error al encontrar la correspondencia actual', ["Es posible que el transformador o el elementos al que lo quieres asociar no exista"], `Intento de modificar transformador ${err}`);
                            conn.release();
                            return res.status(e.statusCode).send(e.getJson());
                          }

                        })
                      }
                      else{

                        conn.commit(function(err, rows){

                          conn.release();

                          if(!err){
                            return res.status('200').send({
                              estado: "Correcto",
                              descripcion: "Transformador actualizado correctamente"
                            });
                          }
                          else {
                            const e = new BadRequest('No se ha actualizado el transformador. Error al encontrar la correspondencia actual', ["Es posible que el transformador o el elementos al que lo quieres asociar no exista"], `Intento de modificar transformador ${err}`);
                            return res.status(e.statusCode).send(e.getJson());
                          }

                        });

                      }

                    }
                    else{
                      const e = new BadRequest('No se ha actualizado el transformador. Error al encontrar la correspondencia actual', ["Es posible que el transformador o el elementos al que lo quieres asociar no exista"], `Intento de modificar transformador ${err}`);
                      conn.release();
                      return res.status(e.statusCode).send(e.getJson());
                    }

                  })

                }
                else{
                  const e = new BadRequest('No se ha actualizado el transformador. Error al encontrar la correspondencia actual', ["Es posible que el transformador o el elementos al que lo quieres asociar no exista"], `Intento de modificar transformador ${err}`);
                  conn.release();
                  return res.status(e.statusCode).send(e.getJson());
                }
              
              });
          })
        }
      })
    }
    else {
      const e = new APIError('Service Unavailable', '503', 'Error al conectar con la base de datos', `Error al conectar con la base de datos\n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  })

}