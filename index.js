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

app.use('/', express.static('public'));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})