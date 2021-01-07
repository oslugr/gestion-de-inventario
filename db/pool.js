const fs = require('fs');
const mysql = require('mysql');
const { APIError } = require('../aux/error');

// let rawdata = fs.readFileSync('./gestion-de-inventario-back-end/db/data.json');
let rawdata = fs.readFileSync('./db/data.json');
var credenciales = JSON.parse(rawdata);

var pool  = mysql.createPool({
    connectionLimit : 10,
    host     : credenciales.host,
    user     : credenciales.user,
    password : credenciales.password,
    database : credenciales.database
});

function _select(query, then){

    pool.getConnection(function(err, conn){
		if(!err){
			conn.query(query, function(err, rows){

                conn.release();
			    if(!err) 	then(rows);
				else        then(new APIError('Bad Gateway', '502', ));
              
            })
		}
		else throw err;
	})
    
}

module.exports = { pool, _select };