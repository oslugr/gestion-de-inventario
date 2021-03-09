const express 	  = require('express'),
	  router  	  = express.Router();
const db 	  	  = require('../db/pool').pool;
const controlador = require('../controllers/auth');

// Loguearse y obtener un token
router.post('/login',  controlador.autenticar)

// Loguearse y obtener un token
router.post('/logout',  controlador.salir)

// Registrar un usuario
router.post('/signup', controlador.registrar)

// Eliminar un usuario
router.delete('/usuario/:user', controlador.eliminar)

// Cambiar contraseña
router.put('/usuario/:user', controlador.cambiarContrasena)

module.exports = router;