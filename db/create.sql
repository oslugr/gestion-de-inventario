CREATE TABLE localizacion(
	nombre VARCHAR(120) PRIMARY KEY
);

CREATE TABLE cable(
	id INT PRIMARY KEY AUTO_INCREMENT,
	tipo VARCHAR(120),
	version_tipo VARCHAR(20)
);

CREATE TABLE recogida(
	id INT PRIMARY KEY AUTO_INCREMENT,
	fecha DATETIME
);

CREATE TABLE en(
	localizacion VARCHAR(120) REFERENCES localizacion(nombre),
	id_recogida INT REFERENCES recogida(id),
	PRIMARY KEY (localizacion, id_recogida)
);

CREATE TABLE componente (
	id INT PRIMARY KEY AUTO_INCREMENT,
    estado ENUM('Desconocido', 'Bueno', 'Regular', 'Por revisar', 'No aprovechable', 'Roto') DEFAULT 'Desconocido',
	observaciones VARCHAR(1000)
);

CREATE TABLE ordenador (
	id INT PRIMARY KEY AUTO_INCREMENT ON DELETE CASCADE,
	localizacion_taller VARCHAR(30),
	observaciones VARCHAR(1000)
);

CREATE TABLE portatil (
	id INT REFERENCES ordenador(id) ON DELETE CASCADE,
    PRIMARY KEY(id)
);

CREATE TABLE transformador (
	id INT PRIMARY KEY AUTO_INCREMENT,
	voltaje FLOAT,
	amperaje FLOAT
);

CREATE TABLE corresponde_portatil (
	id_transformador INT REFERENCES transformador(id),
	id_portatil INT REFERENCES portatil(id),
	PRIMARY KEY(id_transformador, id_portatil)
);

CREATE TABLE corresponde_componente (
	id_transformador INT REFERENCES transformador(id),
	id_componente INT REFERENCES componente(id),
	PRIMARY KEY(id_transformador, id_componente)
);

CREATE TABLE sobremesa (
	id INT REFERENCES ordenador(id),
	tamano VARCHAR(40),
	PRIMARY KEY(id)
);

CREATE TABLE formado (
	id_componente INT REFERENCES componente(id),
	id_ordenador INT REFERENCES ordenador(id),
	PRIMARY KEY(id_ordenador, id_componente),
    UNIQUE(id_componente)
);

CREATE TABLE contiene_cable(
	id_cable INT REFERENCES cable(id),
	id_recogida INT REFERENCES recogida(id),
	PRIMARY KEY(id_cable, id_recogida),
    UNIQUE(id_cable)
);

CREATE TABLE contiene_ordenador(
	id_ordenador INT REFERENCES ordenador(id),
	id_recogida INT REFERENCES recogida(id),
	PRIMARY KEY(id_ordenador, id_recogida),
    UNIQUE(id_ordenador)
);

CREATE TABLE contiene_componente(
	id_componente INT REFERENCES componente(id),
	id_recogida INT REFERENCES recogida(id),
	PRIMARY KEY(id_componente, id_recogida),
    UNIQUE(id_componente)
);

CREATE TABLE contiene_transformador(
	id_transformador INT REFERENCES transformador(id),
	id_recogida INT REFERENCES recogida(id),
	PRIMARY KEY(id_transformador, id_recogida),
    UNIQUE(id_transformador)
);

CREATE TABLE impresora (
	id INT PRIMARY KEY REFERENCES componente(id),
	tinta BOOLEAN,
	escaner BOOLEAN
);

CREATE TABLE escaner(
	id INT PRIMARY KEY REFERENCES componente(id)
);

CREATE TABLE teclado(
	id INT PRIMARY KEY REFERENCES componente(id)
);

CREATE TABLE raton(
	id INT PRIMARY KEY REFERENCES componente(id)
);

CREATE TABLE monitor(
	id INT PRIMARY KEY REFERENCES componente(id),
	resolucion VARCHAR(15)
);

CREATE TABLE disco(
	id INT PRIMARY KEY REFERENCES componente(id),
	capacidad FLOAT,
	tipo ENUM('SSD', 'HDD'),
	conector VARCHAR(20)
);

CREATE TABLE placa_base(
	id INT PRIMARY KEY REFERENCES componente(id)
);

CREATE TABLE ram(
	id INT PRIMARY KEY REFERENCES componente(id),
	capacidad FLOAT,
	tipo VARCHAR(20)
);

CREATE TABLE fuente(
	id INT PRIMARY KEY REFERENCES componente(id),
	potencia INT
);