const db = require('../db/pool');

exports.obtenerLocalizaciones = async function (then){

    try{
        db._select("SELECT * FROM localizacion",then);
    }
    catch (err) {
        throw(err);
    }

}