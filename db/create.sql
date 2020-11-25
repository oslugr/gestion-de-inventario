CREATE TABLE localizacion(
	nombre VARCHAR(40) PRIMARY KEY
);

CREATE TABLE recogida(
	id INT PRIMARY KEY AUTO_INCREMENT,
	localizacion VARCHAR(40) REFERENCES localizacion(nombre),
	fecha DATETIME,
    UNIQUE(localizacion, fecha)
);

CREATE TABLE componente (
	id INT PRIMARY KEY AUTO_INCREMENT,
    estado ENUM('Desconocido', 'Bueno', 'Por revisar', 'No aprovechable', 'Roto') DEFAULT 'Desconocido'
);

CREATE TABLE componente_recogida(
	id_recogida INT REFERENCES recogida(id),
    id_componente INT REFERENCES componente(id),
    PRIMARY KEY(id_recogida, id_componente)
);