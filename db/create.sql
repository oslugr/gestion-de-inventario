/* Localizaciónes y recogidas */
CREATE TABLE localizacion(
	nombre VARCHAR(120) PRIMARY KEY
);

CREATE TABLE recogida(
	id INT PRIMARY KEY AUTO_INCREMENT,
	fecha DATETIME,
	tipo ENUM('Entrega', 'Recogida')
);

CREATE TABLE en(
	localizacion VARCHAR(120) REFERENCES localizacion(nombre),
	id_recogida INT REFERENCES recogida(id) ON DELETE CASCADE,
	PRIMARY KEY (localizacion, id_recogida)
);

/* Cable y sus asociaciones */
CREATE TABLE cable(
	id INT PRIMARY KEY AUTO_INCREMENT,
	tipo VARCHAR(120),
	version_tipo VARCHAR(20)
);

CREATE TABLE contiene_cable(
	id_cable INT REFERENCES cable(id) ON DELETE CASCADE,
	id_recogida INT REFERENCES recogida(id),
	PRIMARY KEY(id_cable, id_recogida)
);

/* Transformador */
CREATE TABLE transformador (
	id INT PRIMARY KEY AUTO_INCREMENT,
	voltaje FLOAT,
	amperaje FLOAT
);

CREATE TABLE contiene_transformador(
	id_transformador INT REFERENCES transformador(id) ON DELETE CASCADE,
	id_recogida INT REFERENCES recogida(id),
	PRIMARY KEY(id_transformador, id_recogida)
);

/* Componente y sus asociados */
CREATE TABLE componente (
	id INT PRIMARY KEY AUTO_INCREMENT,
    estado ENUM('Desconocido', 'Bueno', 'Regular', 'Por revisar', 'No aprovechable', 'Roto') DEFAULT 'Desconocido',
	observaciones VARCHAR(1000),
	fecha_entrada DATETIME,
	tipo VARCHAR(50)
);

CREATE TABLE caracteristica (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nombre VARCHAR(50),
    valor VARCHAR(50)
);

CREATE TABLE tiene (
	id_componente INT REFERENCES componente(id),
    id_caracteristica INT REFERENCES caracteristica(id) ON DELETE CASCADE
);

CREATE TABLE contiene_componente(
	id_componente INT REFERENCES componente(id) ON DELETE CASCADE,
	id_recogida INT REFERENCES recogida(id),
	PRIMARY KEY(id_componente, id_recogida)
);

CREATE TABLE corresponde_componente (
	id_transformador INT REFERENCES transformador(id) ON DELETE CASCADE,
	id_componente INT REFERENCES componente(id) ON DELETE CASCADE,
	PRIMARY KEY(id_transformador, id_componente)
);

/* Ordenador */
CREATE TABLE ordenador (
	id INT PRIMARY KEY AUTO_INCREMENT,
	localizacion_taller VARCHAR(30),
	observaciones VARCHAR(1000)
);

CREATE TABLE portatil (
	id INT REFERENCES ordenador(id) ON DELETE CASCADE,
	estado ENUM('Desconocido', 'Bueno', 'Regular', 'Por revisar', 'No aprovechable', 'Roto') DEFAULT 'Desconocido',
    PRIMARY KEY(id)
);

CREATE TABLE sobremesa (
	id INT REFERENCES ordenador(id) ON DELETE CASCADE,
	tamano VARCHAR(40),
	PRIMARY KEY(id)
);

CREATE TABLE corresponde_portatil (
	id_transformador INT REFERENCES transformador(id) ON DELETE CASCADE,
	id_portatil INT REFERENCES portatil(id) ON DELETE CASCADE,
	PRIMARY KEY(id_transformador, id_portatil)
);

CREATE TABLE contiene_ordenador(
	id_ordenador INT REFERENCES ordenador(id) ON DELETE CASCADE,
	id_recogida INT REFERENCES recogida(id),
	PRIMARY KEY(id_ordenador, id_recogida)
);

CREATE TABLE formado (
	id_componente INT REFERENCES componente(id) ON DELETE CASCADE,
	id_ordenador INT REFERENCES ordenador(id) ON DELETE CASCADE,
	PRIMARY KEY(id_ordenador, id_componente),
    UNIQUE(id_componente)
);

-- Usuarios
CREATE TABLE usuario (
	username VARCHAR(50) PRIMARY KEY,
	password VARCHAR(255) NOT NULL
);

-- Crea el usuario admin por defecto
INSERT INTO usuario VALUES ('admin', '$2b$10$zkX346OXSX.Wp2kuU1Mk6uKJ.4lNTbYqJCWHbOeOkXZBNTybn1XIO');