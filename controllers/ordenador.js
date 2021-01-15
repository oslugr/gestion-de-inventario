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