const mysql = require('mysql');

const {credencialesdb} = require('../config');

var pool  = mysql.createPool({
    connectionLimit : 10,
    host     : credencialesdb.host,
    user     : credencialesdb.user,
    password : credencialesdb.password,
    database : credencialesdb.database
});

module.exports = { pool };