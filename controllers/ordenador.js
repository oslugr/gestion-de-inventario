const db = require('../db/pool').pool;
const { APIError, NotFound, BadRequest } = require('../aux/error');
const { validationResult } = require('express-validator');


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
                      inner join portatil P on O.id=P.id;';
      }
      else if(tipo=="sobremesa"){
        sql = 'select O.id, O.localizacion_taller, O.observaciones, S.tamano from ordenador O \
                      inner join sobremesa S on O.id=S.id;';
      }
      else{
        sql = 'select "Portatil" as tipo, O.id, O.localizacion_taller, O.observaciones, P.estado, Null as tamano from ordenador O \
                inner join portatil P on O.id=P.id \
              UNION \
              select "Sobremesa" as tipo, O.id, O.localizacion_taller, O.observaciones, Null as estado, S.tamano from ordenador O \
                inner join sobremesa S on O.id=S.id;'
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
              
              conn.query('INSERT INTO sobremesa VALUES (?)', [[rows.insertId, tamano]], function (err, rows) {

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
                      descripcion: "Sobremesa añadido correctamente"
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
              
              conn.query('INSERT INTO portatil VALUES (?)', [[rows.insertId, estado]], function (err, rows) {

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
                      descripcion: "Portátil añadido correctamente"
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