const db = require('../db/pool').pool;
const { APIError, NotFound, BadRequest } = require('../aux/error');

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