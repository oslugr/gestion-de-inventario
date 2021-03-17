const db = require('../db/pool').pool;
const { APIError, NotFound, BadRequest } = require('../aux/error');
const { accessTokenSecret } = require('../config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { autorizacion } = require('../aux/autorizar');

exports.autenticar = function(req, res){

  const { user, pass } = req.body;
  
  if (!user || !pass) {
    const e = new BadRequest('Error al introducir los parámetros', ['Usuario o contraseña incorrectas'], `Usuario y contraseña no introducidos.`);
    return res.status(e.statusCode).send(e.getJson());
  } 

  db.getConnection(function (err, conn) {
    if (!err) {

      conn.query('SELECT * FROM usuario WHERE username = ?', [user], function(error, results, fields) {

        if (results.length > 0) {

          bcrypt.compare(pass, results[0].password, function(err, result) {
            
            if(result){

              const accessToken = jwt.sign({ username: user }, accessTokenSecret, { expiresIn: '7h' });
                            
              res.cookie('authcookie',accessToken,{maxAge:25200000,httpOnly:true,sameSite: 'strict'}).status(200).send({
                estado: "Correcto",
                token: accessToken
              });

            }
            else{
              const e = new BadRequest('Contraseña errónea', ['Contraseña erronea'], `Contraseña erronea en login. ${err}`);
              return res.status(e.statusCode).send(e.getJson());
            }

          });

        } else {
          const e = new BadRequest('Usuario inexistente', ['Usuario inexistente'], `No existe el usuario introducido ${error}`);
          return res.status(e.statusCode).send(e.getJson());
        }			
        
      });
    }
    else {
      const e = new APIError('Service Unavailable', '503', 'Error al conectar con la base de datos', `Error al conectar con la base de datos\n${err}`);
      return res.status(e.statusCode).send(e.getJson());
    }
  })

}

exports.registrar = function(req, res){
  
  const authHeader = req.headers.authorization;
  const authCookie = req.cookies.authcookie;

  if(authHeader)
    var token = authHeader.split(' ')[1];
  else if(authCookie)
    var token = authCookie;

  if(authHeader || authCookie){

    jwt.verify(token, accessTokenSecret, (err, usuario) => {
      
      if(err || usuario.username != "admin"){
        const e = new APIError('Forbidden', '403', 'El token proporcionado no es válido', `Intento de acceso con token inválido`);
        return res.status(e.statusCode).send(e.getJson());
      }

      const { user, pass } = req.body;
    
      if (!user || !pass) {
        const e = new BadRequest('Error al introducir los parámetros', ['Usuario o contraseña incorrectas'], `Usuario y contraseña no introducidos. ${err}`);
        return res.status(e.statusCode).send(e.getJson());
      } 

      bcrypt.hash(pass, 10, function(err, hash) {
        
        if(!err){

          db.getConnection(function (err, conn) {
            if (!err) {

              conn.query('INSERT INTO usuario values (?);', [[user, hash]], function (err, rows) {
                
                conn.release();
          
                if (!err) {
                  res.status('200').send({
                    estado: "Correcto",
                    descripcion: "Usuario insertado correctamente"
                  });
                }
                else {
                  const e = new BadRequest('Error al crear un usuario', [''], `Error al crear un usuario. ${err}`);
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
        else{
          const e = new APIError('Service Unavailable', '503', 'Error interno relacionado con el hash de la contraseña', `Ha ocurrido un error relacionado con el hash\n${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }

      });
    
    })


  }

}

exports.eliminar = function(req, res){
  
  const authHeader = req.headers.authorization;
  const authCookie = req.cookies.authcookie;

  if(authHeader)
    var token = authHeader.split(' ')[1];
  else if(authCookie)
    var token = authCookie;

  if(authHeader || authCookie){

    jwt.verify(token, accessTokenSecret, (err, user) => {
      
      if(err || user.username != "admin"){
        const e = new APIError('Forbidden', '403', 'El token proporcionado no es válido', `Intento de acceso con token inválido`);
        return res.status(e.statusCode).send(e.getJson());
      }

      const usuario = req.params.user;

      if (usuario == 'admin') {
        const e = new BadRequest('No se puede eliminar el usuario admin', ['No se puede eliminar el usuario admin'], `No se puede eliminar el usuario admin`);
        return res.status(e.statusCode).send(e.getJson());
      } 

      if (!user) {
        const e = new BadRequest('No se ha especificado usuario', ['No se ha especificado usuario'], `No se ha especificado usuario`);
        return res.status(e.statusCode).send(e.getJson());
      } 

      db.getConnection(function (err, conn) {
        if (!err) {
          conn.query('DELETE FROM usuario WHERE username=?', [usuario], function (err, rows) {

            if(!err){
              
                conn.release();

                res.status('200').send({
                  estado: "Correcto",
                  descripcion: "Usuario eliminado correctamente"
                });

            }
            else {
              const e = new BadRequest('Error al eliminar el usuario', ['Error al eliminar el usuario de la base de datos'], `Error al eliminar el usuario de la base de datos. ${err}`);
              return res.status(e.statusCode).send(e.getJson());
            }
  
          })
        }
        else {
          const e = new APIError('Service Unavailable', '503', 'Error al conectar con la base de datos', `Error al conectar con la base de datos\n${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
        
      });

    })
  }  

}

exports.cambiarContrasena = function(req, res){

  const authHeader = req.headers.authorization;
  const authCookie = req.cookies.authcookie;

  if(authHeader)
    var token = authHeader.split(' ')[1];
  else if(authCookie)
    var token = authCookie;

  if(authHeader || authCookie){

    jwt.verify(token, accessTokenSecret, (err, user) => {
      
      if(err || user.username != "admin"){
        const e = new APIError('Forbidden', '403', 'El token proporcionado no es válido', `Intento de acceso con token inválido`);
        return res.status(e.statusCode).send(e.getJson());
      }

      const pass = req.body.pass;
      const usuario = req.params.user;

      if(pass){

        bcrypt.hash(pass, 10, function(err, hash) {
        
          if(!err){

            db.getConnection(function (err, conn) {
              if (!err) {
          
                conn.query('UPDATE usuario SET password=? WHERE username = ?', [hash, usuario], function(error, results, fields) {
          
                  if (!err) {
                    res.status('200').send({
                      estado: "Correcto",
                      descripcion: "Usuario actualizado correctamente"
                    });    
                  } 
                  else {
                    res.send('Usuario inexistente');
                  }			
                  
                });
              }
              else {
                const e = new BadRequest('Error al actualizar', ['Ha ocurrido un error al actualizar la contraseña'], `Error en la query a la hora de actualizar. ${err}`);
                return res.status(e.statusCode).send(e.getJson());
              }
            })

          }
          else{
            const e = new APIError('Service Unavailable', '503', 'Error interno relacionado con el hash de la contraseña', `Ha ocurrido un error relacionado con el hash\n${err}`);
            return res.status(e.statusCode).send(e.getJson());
          }
        })
      }
      else{
        const e = new BadRequest('Error al introducir la contraseña', ['Contraseña incorrecta'], `Error al introducir la contraseña en el body.`);
        return res.status(e.statusCode).send(e.getJson());
      }
    })

  }
  else{
    const e = new APIError('Unauthorized', '401', 'No está autorizado a acceder al recurso. Por favos loguese', `Intento de acceso sin iniciar sesión`);
    return res.status(e.statusCode).send(e.getJson());
  }

}

exports.salir = function(req, res){

  res.cookie('authcookie','',{maxAge:0,httpOnly:true,sameSite: 'strict'}).status(200).send({
    estado: "Correcto"
  });

}

exports.obtener = function(req, res){
  
  const authHeader = req.headers.authorization;
  const authCookie = req.cookies.authcookie;

  if(authHeader)
    var token = authHeader.split(' ')[1];
  else if(authCookie)
    var token = authCookie;

  if(authHeader || authCookie){

    jwt.verify(token, accessTokenSecret, (err, usuario) => {
      
      if(err || usuario.username != "admin"){
        const e = new APIError('Forbidden', '403', 'El token proporcionado no es válido', `Intento de acceso con token inválido`);
        return res.status(e.statusCode).send(e.getJson());
      }

      db.getConnection(function (err, conn) {
        if (!err) {

          conn.query('SELECT username FROM usuario;', function (err, rows) {
            
            conn.release();
      
            if (!err) {
              res.status('200').send({
                cantidad: rows.length,
                data: rows
              });
            }
            else {
              const e = new BadRequest('Error al obtener los usuarios', [''], `Error al obtener los usuarios. ${err}`);
              return res.status(e.statusCode).send(e.getJson());
            }
  
          })
        }
        else {
          const e = new APIError('Service Unavailable', '503', 'Error al conectar con la base de datos', `Error al conectar con la base de datos\n${err}`);
          return res.status(e.statusCode).send(e.getJson());
        }
      })
    })


  }

}