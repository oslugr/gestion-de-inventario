const db = require('../db/pool').pool;
const { APIError, NotFound, BadRequest } = require('../aux/error');

exports.obtenerCables = function (req, res) {

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('SELECT * FROM cable', function (err, rows) {

        conn.release();

        if (!err) {
          res.status('200').send({
            cantidad: rows.length,
            data: rows
          });
        }
        else {
          const e = new APIError('Bad Gateway', 502, 'Error al obtener los cables de la base de datos', `Error al obtener los cables de la base de datos\n${err}`);
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

exports.insertarCable = function (req, res) {

  // Validación de los valores introducidos
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

      if(version_tipo){ 
        var params = [[tipo, version_tipo]];
        var sql    = 'INSERT INTO cable(tipo, version_tipo) VALUES (?)';
      }
      else{
        var params = [[tipo]];
        var sql    = 'INSERT INTO cable(tipo) VALUES (?)'
      }

      conn.query(sql, params, function (err, rows) {

        conn.release();

        if (!err) {
          res.status('200').send({
            estado: "Correcto",
            descripcion: "Cable insertado correctamente"
          });
        }
        else {
          const e = new BadRequest('Error al introducir los parámetros', ['Tipo o versión de tipo incorrecto.'], `Error al introducir una localización por el usuario. ${err}`);
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

exports.eliminarCable = function (req, res) {

  // Validación de los valores introducidos
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

      if(version_tipo){ 
        var params = [tipo,version_tipo];
        var sql    = 'DELETE FROM cable WHERE tipo=? AND version_tipo=? LIMIT 1';
      }
      else{
        var params = [tipo];
        var sql    = 'DELETE FROM cable WHERE tipo=? AND version_tipo is NULL LIMIT 1';
      }

      conn.query(sql, params, function (err, rows) {

        conn.release();

        if (!err) {
          if(rows.affectedRows){
            res.status('200').send({
              estado: "Correcto",
              descripcion: "Cable eliminado correctamente"
            });
          }
          else{
            const e = new BadRequest('No existe el cable que quieres eliminar en la red. Es posible que exista alguno de este tipo pero con una versión especificada.', ["No existe un cable con las características especificadas"], 'Intento de eliminar cable inexistente');
            return res.status(e.statusCode).send(e.getJson());
          }
        }
        else {
          const e = new APIError('Internal Server Error', '500', 'Error al eliminar los elementos de la base de datos', `Error al eliminar localizaciones de la base de datos\n${err}`);
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