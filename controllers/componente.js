const db = require('../db/pool').pool;
const { APIError, NotFound, BadRequest } = require('../aux/error');

// Metodos auxiliares

// Crea un componente a partir de una fila de la query del método obtenerComponente 
function crearComponente( row ){
  return {
    id: row.id,
    estado: row.estado,
    observaciones: row.observaciones,
    fecha_entrada: row.fecha_entrada,
    tipo: row.tipo,
    caracteristicas: []
  }
}

function caracteristica( row ){
  return {
    id: row.id_caracteristica,
    nombre: row.nombre,
    valor: row.valor
  }
} 

function obtenerCaracteristicas( rows ){
  let componentes = [];
  let id_actual = -1;
  let aux = 0;

  for (let i = 0; i < rows.length; i++) {
    
    if(rows.id == id_actual){
      componentes[aux-1].caracteristicas.push( caracteristica(rows[i]) );
    }
    else{
      componentes[aux] = crearComponente( rows[i] );
      id_actual = rows[i].id;
      aux++;

      if(rows[i].id_caracteristica)
        componentes[aux-1].caracteristicas.push( caracteristica(rows[i]) );
    }
    
  }

  return componentes;
}

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
                        WHERE NOT EXISTS( SELECT * FROM tiene T WHERE T.id_componente=C2.id ) && C2.tipo=? ) ORDER BY id';
      }
      else{
        var params = [];
        var sql    = '( select C.id, estado, observaciones, fecha_entrada, tipo, id_caracteristica, nombre, valor FROM componente C \
                        INNER JOIN tiene T ON T.id_componente=C.id \
                        INNER JOIN caracteristica CA on CA.id=T.id_caracteristica \
                      UNION \
                      SELECT C2.id, C2.estado, C2.observaciones, C2.fecha_entrada, C2.tipo, Null as id_caracteristica, Null as nombre, Null as valor FROM componente C2 \
                        WHERE NOT EXISTS( SELECT * FROM tiene T WHERE T.id_componente=C2.id )) ORDER BY id';
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
