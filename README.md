# 📦 Gestión de inventario

Aplicación desarrollada con el objetivo de controlar el inventario de ordenadores, componentes, recogidas, entregas etc., de la [OSL](https://osl.ugr.es). 

## Como utilizarlo a la hora de desarrollar

Para una guía sobre como instalarlo, puedes encontrar información en la [página de instalación de la wiki](https://github.com/oslugr/gestion-de-inventario/wiki/Instalaci%C3%B3n).

Para desarrollar sobre el código, primero tendrás que crear una base de datos MySQL. Una vez creada, crear las tablas de la base de datos con el script `db/create.sql`. Una vez realizado esto, tendrás que rellenar los datos de acceso a la base de datos en el archivo `config.js`. 

Para instalar todos los paquetes necesarios, tendrás que instalar los paquetes necesarios con `npm`. Para esto ejecuta:

```bash
npm install 
npm tailwind # Para crear todos los archivos CSS
npm postcss
```

A partir de aquí podrás ejecutar la apliación con el comando:

```
node index.js
```

Como recomendación, puedes instalar `nodemon` una herramienta que recarga el servidor cada vez que modificas un archivo `.js`.


## Software usado 

* [Node JS](https://nodejs.org/en/)
* [Express JS](https://expressjs.com/)
* [express-validator](https://express-validator.github.io/docs/)
* [mysql para JS](https://express-validator.github.io/docs/)
* [windmill-dashboard](https://github.com/estevanmaito/windmill-dashboard) como plantilla para el front-end
* [jQuery](https://jquery.com/)