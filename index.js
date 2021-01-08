const express = require('express')
const app = express()
const port = 3000
const { NotFound } = require('./aux/error');

// Routes
const localizacion = require('./routes/localizacion')
const cable        = require('./routes/cable')

// Para poder recibir peticiones con cuerpo JSON
app.use(express.json())
app.use('/localizacion', localizacion);
app.use('/cable', cable);

// Muestra el error cuando no existe el recurso
app.get("/*", (req, res) => {

  const e = new NotFound('Ruta no encontrada', 'Se ha intentando entrar en una ruta inexistente');
  return res.status(e.statusCode).send(e.getJson());

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})