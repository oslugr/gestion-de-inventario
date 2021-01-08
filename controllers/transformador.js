const db = require('../db/pool').pool;
const { APIError, NotFound, BadRequest } = require('../aux/error');

exports.obtenerTransformadores = function (req, res) {

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('SELECT * FROM transformador', function (err, rows) {

        conn.release();

        if (!err) {
          res.status('200').send({
            cantidad: rows.length,
            data: rows
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

  // Validación de los valores introducidos
  if(req.params.voltaje && req.params.amperaje){
    var voltaje  = req.params.voltaje.replace(/\s+/g, ' ').trim();
    var amperaje = req.params.amperaje.replace(/\s+/g, ' ').trim();
  }
  else{
    const e = new BadRequest('Parámetros mal introducidos', [{ msg: "Valor de voltaje o amperaje no válido"}], "Error en los parámetros introducidos por el usuario al añadir un transformador");
    return res.status(e.statusCode).send(e.getJson());
  }

  db.getConnection(function (err, conn) {
    if (!err) {

      var params = [[voltaje, amperaje]];
      var sql    = 'INSERT INTO transformador(voltaje, amperaje) VALUES (?)';

      conn.query(sql, params, function (err, rows) {

        conn.release();

        if (!err) {
          res.status('200').send({
            estado: "Correcto",
            descripcion: "Transformador insertado correctamente"
          });
        }
        else {
          const e = new BadRequest('Error al introducir los parámetros', ['Voltaje o amperaje incorrecto.'], `Error al introducir un transformador por el usuario. ${err}`);
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