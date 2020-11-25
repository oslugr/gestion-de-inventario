const express = require('express')
const app = express()
const port = 3000
const db = require('./db/pool').pool;

app.get('/localizaciones', (req, res) => {
  // 
  db.getConnection(function(err, conn){
    conn.query("SELECT * FROM localizacion", function(err, rows){
      conn.release();
      if(!err)
        res.json(rows);
      else
        console.log("Error en la bd");
    })
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})