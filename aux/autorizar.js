var config = require('../config');
const jwt = require('jsonwebtoken');
const { APIError, NotFound, BadRequest } = require('../aux/error');

function error( req, res ){

  if(req.originalUrl.startsWith('/api/')){
    // No tiene acceso al recurso
    const e = new APIError('Forbidden', '403', 'El token proporcionado no es válido', `Intento de acceso con token inválido`);
    return res.status(e.statusCode).send(e.getJson());
  }
  else if(req.originalUrl.startsWith('/usuarios')){
    res.redirect('/');
  }
  else{
    res.redirect('/login');
  }
  
}

exports.autorizacion = function(req, res, next){

  if(req.originalUrl.includes('login')){
    next();
  }
  else{

    const authHeader = req.headers.authorization;
    const authCookie = req.cookies.authcookie;

    if(authHeader)
      var token = authHeader.split(' ')[1];
    else if(authCookie)
      var token = authCookie;

    if(authHeader || authCookie && token){

      jwt.verify(token, config.accessTokenSecret, (err, user) => {

        if(err || !user){
          error(req, res);
        }
        else if(user.username != "admin" && req.originalUrl.startsWith('/usuarios')){
          error(req, res);
        }
        else{
          next();
        }
        
      })
    }
    else{
      error(req, res);
    }
  
  }

}