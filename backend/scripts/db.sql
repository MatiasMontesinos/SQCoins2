-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS sqcoins;
USE sqcoins;

-- Crear tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    username VARCHAR(50) NOT NULL,
    fechaNacimiento DATE NOT NULL,
    password VARCHAR(100) NOT NULL,
    monedasTotales INTEGER NOT NULL DEFAULT 100,
    UNIQUE KEY unique_user (username),

    cant_apostada_juego1 INTEGER NOT NULL DEFAULT 0,
    cant_ganada_juego1 INTEGER NOT NULL DEFAULT 0,
    cant_ganada_total INTEGER NOT NULL DEFAULT 0,
    cant_perdida_juego1 INTEGER NOT NULL DEFAULT 0,
    cant_creada_juego1 INTEGER NOT NULL DEFAULT 0,

    cant_apostada_juego2 INTEGER NOT NULL DEFAULT 0,
    cant_ganada_juego2 INTEGER NOT NULL DEFAULT 0,
    cant_perdida_juego2 INTEGER NOT NULL DEFAULT 0,
    cant_creada_juego2 INTEGER NOT NULL DEFAULT 0,

    cant_ganada_sorteo INTEGER NOT NULL DEFAULT 0,
    cant_unidos_sorteo INTEGER NOT NULL DEFAULT 0,
    cant_creados_sorteo INTEGER NOT NULL DEFAULT 0,
    cant_gastada_creados_sorteo INTEGER NOT NULL DEFAULT 0
);

-- Crear tabla sorteos
CREATE TABLE IF NOT EXISTS sorteos (
    id_sorteo SERIAL PRIMARY KEY,
    id_creador INTEGER NOT NULL REFERENCES usuarios(id),
    cantidad_unidos INTEGER NOT NULL DEFAULT 0,
    total_sorteado INTEGER NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_ganador INTEGER REFERENCES usuarios(id)
);

-- Crear tabla juego1
CREATE TABLE IF NOT EXISTS juego1 (
    id_sala_juego1 SERIAL PRIMARY KEY,
    id_jugador1 INTEGER NOT NULL REFERENCES usuarios(id),
    id_jugador2 INTEGER REFERENCES usuarios(id),
    id_ganador INTEGER REFERENCES usuarios(id),
    cant_apostada INTEGER NOT NULL,
    resuelto BOOLEAN NOT NULL DEFAULT FALSE
);

-- Crear tabla juego2
CREATE TABLE IF NOT EXISTS juego2 (
    id_sala_juego2 SERIAL PRIMARY KEY,
    id_creador INTEGER NOT NULL REFERENCES usuarios(id),
    cant_apostada INTEGER NOT NULL,
    cant_minas INTEGER NOT NULL,
    cant_retirada INTEGER NOT NULL,
    cant_seleccionados INTEGER NOT NULL
);
