const localizacion = require('../models/localizacion')

exports.listaLocalizaciones = function(req, res){

    try{
        localizacion.obtenerLocalizaciones( (rows) => {
            return res.status('200').json({
                cantidad: rows.lenght,
                localizaciones: rows
            })
        });
    }
    catch (err) {
        console.log(`${err}`);
    }

}