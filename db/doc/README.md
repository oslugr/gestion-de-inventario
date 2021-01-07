# Pequeña documentación de la BD

El diagrama E/R de la base de datos está en el archivo  `er_bd.drawio`. 

## Configuración del servidor con la base de datos

1. Renombrar el archivo `data_example.json` a `data.json`
2. Introducir los datos de la base de datos en el archivo `data.json` 

## Posibilidades de eliminación de filas de la base de datos

* No se pueden eliminar localizaciones si hay recogidas en ellas
* No se pueden eliminar recogidas si existe algún elemento asociado a esto. Esto es para que no se encuentren elementos de los cuales, no se conoce su prodecencia
* Cuando se elimina un ordenador, sus componentes asociados dejan de pertenecer a el y quedan libres.
* Si se eliminan cables, ordenadores o componentes se eliminan de las recogidas
* 