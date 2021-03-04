const express = require('express')
const app = express()
const port = 3000
const { NotFound } = require('./aux/error');

// Routes
const localizacion  = require('./routes/localizacion')
const cable         = require('./routes/cable')
const transformador = require('./routes/transformador')
const componente    = require('./routes/componente')
const recogida      = require('./routes/recogida')
const ordenador     = require('./routes/ordenador')

// Para poder recibir peticiones con cuerpo JSON
app.use(express.json())
app.use('/api/localizacion', localizacion);
app.use('/api/cable', cable);
app.use('/api/transformador', transformador);
app.use('/api/componente', componente);
app.use('/api/recogida', recogida);
app.use('/api/ordenador', ordenador);

app.use('/', express.static('public', {extensions:['html']}));

// Errores 

app.use('/api/*', (req, res) => {
  const e = new NotFound('Ruta no encontrada', 'Se ha intentando entrar en una ruta inexistente');
  return res.status(e.statusCode).send(e.getJson());
})

app.use('*', express.static('public/pages/404.html'))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})