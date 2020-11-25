const fs = require('fs');
const mysql = require('mysql');

let rawdata = fs.readFileSync('./db/data.json');
var credenciales = JSON.parse(rawdata);

var pool  = mysql.createPool({
    connectionLimit : 10,
    host     : credenciales.host,
    user     : credenciales.user,
    password : credenciales.password,
    database : credenciales.database
});

exports.pool = pool;