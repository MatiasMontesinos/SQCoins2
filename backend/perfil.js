const express = require('express');
const bcrypt = require('bcrypt');
const { initDb } = require('./db');

const router = express.Router();

router.post('/registro', async (req, res) => {
  const connection = await initDb();
  const { nombre, apodo, fechaNacimiento, password } = req.body;

  console.log(">> POST /api/registro recibido:", req.body);

  if (!nombre || !apodo || !fechaNacimiento || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const [rows] = await connection.execute(
      'SELECT * FROM usuarios WHERE nombre = ? AND apodo = ?',
      [nombre, apodo]
    );

    if (rows.length > 0) {
      return res.status(409).json({ error: 'Usuario ya registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario con monedas totales inicializadas a 100
    await connection.execute(
      'INSERT INTO usuarios (nombre, apodo, fechaNacimiento, password, monedasTotales) VALUES (?, ?, ?, ?, 100)',
      [nombre, apodo, fechaNacimiento, hashedPassword]
    );

    // Obtener datos del usuario recién insertado (para devolverlos)
    const [newUserRows] = await connection.execute(
      'SELECT nombre, apodo, fechaNacimiento, monedasTotales FROM usuarios WHERE nombre = ? AND apodo = ?',
      [nombre, apodo]
    );

    const usuario = newUserRows[0];

    return res.json({
      message: 'Usuario registrado correctamente',
      usuario: usuario
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error en la base de datos' });
  }
});

router.post('/login', async (req, res) => {
  const connection = await initDb();
  const { nombre, password } = req.body;

  if (!nombre || !password) {
    return res.status(400).json({ error: 'Nombre y contraseña son obligatorios' });
  }

  try {
    const [rows] = await connection.execute(
      'SELECT * FROM usuarios WHERE nombre = ?',
      [nombre]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no registrado, debe registrarse primero' });
    }

    const usuario = rows[0];

    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Retornar info del usuario (sin password)
    return res.json({
      message: 'Ingreso correcto',
      usuario: {
        nombre: usuario.nombre,
        apodo: usuario.apodo,
        fechaNacimiento: usuario.fechaNacimiento,
        monedas: usuario.monedasTotales || 0
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error en la base de datos' });
  }
});

// Ruta para actualizar apodo (requiere que el usuario esté logueado)
router.post('/actualizar-apodo', async (req, res) => {
  const connection = await initDb();
  const { nuevoApodo, nombre } = req.body;

  if (!nuevoApodo || !nombre) {
    return res.status(400).json({ error: 'Faltan datos para actualizar apodo' });
  }

  try {
    await connection.execute(
      'UPDATE usuarios SET apodo = ? WHERE nombre = ?',
      [nuevoApodo, nombre]
    );

    return res.json({ message: 'Apodo actualizado correctamente', apodo: nuevoApodo });
  } catch (error) {
    console.error('Error al actualizar apodo:', error);
    return res.status(500).json({ error: 'Error al actualizar apodo' });
  }
});

module.exports = router;
