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
const ordenador      = require('./routes/ordenador')

// Para poder recibir peticiones con cuerpo JSON
app.use(express.json())
app.use('/localizacion', localizacion);
app.use('/cable', cable);
app.use('/transformador', transformador);
app.use('/componente', componente);
app.use('/recogida', recogida);
app.use('/ordenador', ordenador);

app.use('/', express.static('public'));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})