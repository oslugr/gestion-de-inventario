const db = require('../db/pool').pool;
const { APIError, NotFound, BadRequest } = require('../aux/error');
const { validationResult } = require('express-validator');

exports.obtenerRecogida = function (req, res){

	if(req.params.tipo && ( req.params.tipo=="Entrega" || req.params.tipo=="Recogida" ) )           
		var tipo = req.params.tipo;
	else{
		const e = new BadRequest('Tipo de la recogida no especificado o no válido', ["tipo no introducido o no válido. Valores válidos: 'Entrega' o 'Recogida'"], `Error al obtener las recogidas por tipo. El usuario no ha especificado un tipo válido`);
		return res.status(e.statusCode).send(e.getJson());
	}

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('SELECT * FROM recogida WHERE tipo=?;', [tipo], function (err, rows) {
        
        conn.release();

        if (err) {
          return conn.rollback(function() {
            const e = new BadRequest('Error al obtener', ['Ocurrió algún error al obtener la recogida'], `Error al obtener la recogida. ${err}`);
            return res.status(e.statusCode).send(e.getJson());
          });
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
	
  if(req.body.fecha)  var fecha = req.body.fecha;
  else                var fecha = null;
  if(req.body.tipo)   var tipo = req.body.tipo;
  else                var tipo = null;

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('INSERT INTO recogida(fecha, tipo) VALUES (?);', [[fecha, tipo]], function (err, rows) {
        
        if (err) {
          const e = new BadRequest('Error al insertar una nueva recogida', ['Ocurrió algún error al insertar la recogida'], `Error al insertar una recogida. ${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
        return res.status('200').send({
					estado: "Correcto",
					descripcion: "Recogida insertada correctamente"
				});
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });
}

exports.aniadirCable = function (req, res){

  if(req.params.id_recogida)  var id_recogida = req.params.id_recogida;
  else                        var id_recogida = null;
  if(req.params.id_cable)     var id_cable = req.params.id_cable;
  else                        var id_cable = null;

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('INSERT INTO contiene_cable VALUES (?);', [[id_recogida, id_cable]], function (err, rows) {
        
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

exports.aniadirTransformador = function (req, res) {
  
  if(req.params.id_recogida)  var id_recogida = req.params.id_recogida;
  else                        var id_recogida = null;
  if(req.params.id_trans)     var id_trans = req.params.id_trans;
  else                        var id_trans = null;

	db.getConnection(function (err, conn) {
    if (!err) {
      conn.query('INSERT INTO contiene_transformador VALUES (?);', [[id_recogida, id_trans]], function (err, rows) {
        
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
					descripcion: "ordenador insertado correctamente en la recogida"
				});
      });
    }
    else{
      const e = new APIError('Service Unavailable', '503', 'Error interno de la base de datos', `Error al conectar a la base de datos para obtener recogidas \n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  });
}