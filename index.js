const express = require('express')
const app = express()
const port = 3000
const db = require('./db/pool').pool;

// Routes
const localizacion = require('./routes/localizacion')
const ordenador = require('./routes/ordenador')

// Para poder recibir peticiones con cuerpo JSON
app.use(express.json())
app.use('/localizacion', localizacion);
app.use('/ordenador', ordenador);

// Muestra el error cuando no existe el recurso
app.get("/*", (req, res) => {
  res.status(404);

  if (req.accepts('json')) {
    res.send({ 
      error: 404,
      message: 'Not found' 
    });
    return;
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})