CREATE DATABASE challengealkemy;

CREATE TABLE usuarios (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    pass VARCHAR (255) NOT NULL,
    email VARCHAR (255) NOT NULL
);

CREATE TABLE generos (
    idGenero INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    imagen VARCHAR(255) NOT NULL
);

CREATE TABLE peliculasseries (
    idPeliculaSerie INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    imagen VARCHAR(255) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    fechaCreacion DATETIME NOT NULL,
    calificacion FLOAT NOT NULL,
    idGenero INT NOT NULL,
    FOREIGN KEY (idGenero) REFERENCES generos (idGenero)
);

CREATE TABLE personajes (
    idPersonaje INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    imagen VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    edad INT NOT NULL,
    peso FLOAT NOT NULL,
    historia TEXT NOT NULL
);

CREATE TABLE peliculaspersonajes (
    idPersonaje INT NOT NULL,
    idPeliculaSerie INT NOT NULL,
    PRIMARY KEY (idPersonaje, idPeliculaSerie),
    FOREIGN KEY (idPersonaje) REFERENCES personajes (idPersonaje),
    FOREIGN KEY (idPeliculaSerie) REFERENCES peliculasseries (idPeliculaSerie)
);