-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS sqcoins;
USE sqcoins;

-- Crear tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    fechaNacimiento DATE NOT NULL,
    password VARCHAR(255) NOT NULL,
    monedasTotales INT NOT NULL DEFAULT 100,
    UNIQUE KEY unique_user (username),

    cant_apostada_juego1 INT NOT NULL DEFAULT 0,
    cant_ganada_juego1 INT NOT NULL DEFAULT 0,
    cant_perdida_juego1 INT NOT NULL DEFAULT 0,
    cant_creada_juego1 INT NOT NULL DEFAULT 0,

    cant_apostada_juego2 INT NOT NULL DEFAULT 0,
    cant_ganada_juego2 INT NOT NULL DEFAULT 0,
    cant_perdida_juego2 INT NOT NULL DEFAULT 0,
    cant_creada_juego2 INT NOT NULL DEFAULT 0,

    cant_ganada_sorteo INT NOT NULL DEFAULT 0,
    cant_unidos_sorteo INT NOT NULL DEFAULT 0,
    cant_creados_sorteo INT NOT NULL DEFAULT 0,
    cant_gastada_creados_sorteo INT NOT NULL DEFAULT 0
);

-- Crear tabla sorteos
CREATE TABLE IF NOT EXISTS sorteos (
    id_sorteo INT AUTO_INCREMENT PRIMARY KEY,
    id_creador INT NOT NULL,
    cantidad_unidos INT NOT NULL DEFAULT 0,
    total_sorteado INT NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_ganador INT,
    FOREIGN KEY (id_creador) REFERENCES usuarios(id),
    FOREIGN KEY (id_ganador) REFERENCES usuarios(id)
);

-- Crear tabla juego1
CREATE TABLE IF NOT EXISTS juego1 (
    id_sala_juego1 INT AUTO_INCREMENT PRIMARY KEY,
    id_creador INT,
    cant_apostada INT,
    cant_minas INT,
    cant_retirada INT,
    cant_seleccionados INT,
    FOREIGN KEY (id_creador) REFERENCES usuarios(id)
);

-- Crear tabla juego2
CREATE TABLE IF NOT EXISTS juego2 (
    id_sala_juego2 INT AUTO_INCREMENT PRIMARY KEY,
    id_creador INT,
    cant_apostada INT,
    id_ganador INT,
    segundo_jugador BOOLEAN,
    FOREIGN KEY (id_creador) REFERENCES usuarios(id),
    FOREIGN KEY (id_ganador) REFERENCES usuarios(id)
);
