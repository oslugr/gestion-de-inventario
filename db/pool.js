const fs = require('fs');
const mysql = require('mysql');

let rawdata = fs.readFileSync('./db/data.json');
const {credencialesdb} = require('../config');

var pool  = mysql.createPool({
    connectionLimit : 10,
    host     : credencialesdb.host,
    user     : credencialesdb.user,
    password : credencialesdb.password,
    database : credencialesdb.database
});

module.exports = { pool };