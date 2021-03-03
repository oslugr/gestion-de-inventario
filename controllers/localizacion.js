const db = require('../db/pool').pool;
const { APIError, NotFound, BadRequest } = require('../aux/error');

exports.obtenerLocalizaciones = function (req, res) {

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('SELECT * FROM localizacion', function (err, rows) {

        conn.release();

        if (!err) {
          res.status('200').send({
            cantidad: rows.length,
            data: rows
          });
        }
        else {
          const e = new APIError('Bad Gateway', 502, 'Error al obtener las localizaciones de la base de datos', `Error al obtener las localizaciones de la base de datos\n${err}`);
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

exports.insertarLocalizacion = function (req, res) {

  const nombre = req.params.nombre.replace(/\s+/g, ' ').trim();

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('INSERT INTO localizacion VALUES (?)', [[nombre]], function (err, rows) {

        conn.release();

        if (!err) {
          res.status('200').send({
            estado: "Correcto",
            descripcion: "Localización insertada correctamente"
          });
        }
        else {
          const e = new BadRequest('Error al introducir los parámetros', ['Nombre incorrecto. Es posible que ya exista una localización con ese nombre'], `Error al introducir una localización por el usuario. ${err}`);
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

exports.eliminarLocalizacion = function (req, res) {

  const nombre = req.params.nombre.replace(/\s+/g, ' ').trim();

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('DELETE FROM localizacion WHERE nombre=?', [nombre], function (err, rows) {

        conn.release();

        if (!err) {
          res.status('200').send({
            estado: "Correcto",
            descripcion: "Localización eliminada correctamente"
          });
        }
        else {
          const e = new BadRequest('Error al introducir los parámetros', ['Nombre incorrecto. Es posible que ya exista una localización con ese nombre'], `Error al introducir una localización por el usuario. ${err}`);
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

exports.cambiarNombre = function (req, res) {

  const antiguo = req.params.antiguo.replace(/\s+/g, ' ').trim();
  const nuevo   = req.params.nuevo.replace(/\s+/g, ' ').trim();

  db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('UPDATE localizacion SET nombre=? WHERE nombre=?', [nuevo, antiguo], function (err, rows) {

        conn.release();

        if (!err) {
          res.status('200').send({
            estado: "Correcto",
            descripcion: "Localización actualizada correctamente"
          });
        }
        else {
          const e = new BadRequest('Error, es posible que ese nombre ya sea usado por otra localización', ['Nombre incorrecto. Es posible que ya exista una localización con ese nombre'], `Error al actualizar una localización por el usuario. ${err}`);
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