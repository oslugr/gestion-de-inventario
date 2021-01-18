// Metodos auxiliares para la obtención de componentes

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
    
    if(rows[i].id == id_actual){
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

module.exports = {obtenerCaracteristicas}