const { accessTokenSecret } = require('../config');
const { APIError, NotFound, BadRequest } = require('../aux/error');
const { autorizacion } = require('../aux/autorizar');

exports.estatico = function(res, req) {

  autorizacion(req, res, function(req, res){

    

  },
  function(req, res){
    res.redirect('/login');
  })

}