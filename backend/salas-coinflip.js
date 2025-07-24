const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',   // aquí va "db" desde docker-compose
  user: process.env.DB_USER || 'root',        // root según tu compose
  password: process.env.DB_PASSWORD || 'sqcoins123', // tu contraseña
  database: process.env.DB_NAME || 'sqcoins', // base de datos definida
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Crear sala
async function crearSala(idJugador1, cantApostada) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [res] = await connection.query('SELECT monedasTotales FROM usuarios WHERE id = ? FOR UPDATE', [idJugador1]);
    if (res.length === 0) throw new Error('Usuario no encontrado');
    if (res[0].monedasTotales < cantApostada) throw new Error('Saldo insuficiente');

    // Descontar monedas
    await connection.query('UPDATE usuarios SET monedasTotales = monedasTotales - ? WHERE id = ?', [cantApostada, idJugador1]);

    // Crear sala
    const [result] = await connection.query(
      'INSERT INTO juego1 (id_jugador1, cant_apostada) VALUES (?, ?)',
      [idJugador1, cantApostada]
    );

    // Actualizar estadísticas del creador
    await connection.query(`
      UPDATE usuarios 
      SET 
        cant_apostada_juego1 = cant_apostada_juego1 + ?,
        cant_creada_juego1 = cant_creada_juego1 + 1
      WHERE id = ?
    `, [cantApostada, idJugador1]);

    await connection.commit();

    // Obtener la sala creada para devolverla
    const [insertedRows] = await connection.query('SELECT * FROM juego1 WHERE id_sala_juego1 = ?', [result.insertId]);
    return insertedRows[0];
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// Listar salas activas
async function listarSalasActivas() {
  const [rows] = await pool.query(`
    SELECT j.id_sala_juego1, j.cant_apostada, j.id_jugador1, j.id_jugador2, u.nombre as creador
    FROM juego1 j
    JOIN usuarios u ON j.id_jugador1 = u.id
    WHERE j.id_jugador2 IS NULL AND (j.resuelto IS NULL OR j.resuelto = FALSE)
  `);
  return rows;
}

// Unirse a sala
async function unirseASala(idSala, idJugador2) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [salaRes] = await connection.query('SELECT * FROM juego1 WHERE id_sala_juego1 = ? FOR UPDATE', [idSala]);
    if (salaRes.length === 0) throw new Error('Sala inválida');
    const sala = salaRes[0];
    if (sala.id_jugador2) throw new Error('Sala llena');

    const jugador1 = sala.id_jugador1;
    const cant = sala.cant_apostada;

    // Verificar saldo del jugador2
    const [saldoRes] = await connection.query('SELECT monedasTotales FROM usuarios WHERE id = ? FOR UPDATE', [idJugador2]);
    if (saldoRes.length === 0) throw new Error('Jugador no encontrado');
    if (saldoRes[0].monedasTotales < cant) throw new Error('Saldo insuficiente');

    // Descontar monedas del jugador2
    await connection.query('UPDATE usuarios SET monedasTotales = monedasTotales - ? WHERE id = ?', [cant, idJugador2]);

    // Elegir ganador aleatorio
    const ganador = Math.random() < 0.5 ? jugador1 : idJugador2;
    const perdedor = ganador === jugador1 ? idJugador2 : jugador1;

    // Actualizar sala
    await connection.query(`
      UPDATE juego1 
      SET id_jugador2 = ?, id_ganador = ?, resuelto = TRUE 
      WHERE id_sala_juego1 = ?
    `, [idJugador2, ganador, idSala]);

    // Transferencia al ganador
    await connection.query(`
      UPDATE usuarios
      SET monedasTotales = monedasTotales + ?
      WHERE id = ?
    `, [cant * 2, ganador]);

    // Actualizar estadísticas para ambos jugadores
    await connection.query(`
      UPDATE usuarios
      SET 
        cant_apostada_juego1 = cant_apostada_juego1 + ?,
        cant_ganada_juego1 = cant_ganada_juego1 + CASE WHEN id = ? THEN ? ELSE 0 END,
        cant_perdida_juego1 = cant_perdida_juego1 + CASE WHEN id = ? THEN ? ELSE 0 END,
        cant_ganada_total = cant_ganada_total + CASE WHEN id = ? THEN ? ELSE 0 END
      WHERE id IN (?, ?)
    `, [
      cant, // para cant_apostada_juego1
      ganador, cant, // para cant_ganada_juego1
      perdedor, cant, // para cant_perdida_juego1
      ganador, cant, // para cant_ganada_total
      ganador, perdedor
    ]);

    // Obtener nombres del creador y oponente
    const [resNombres] = await connection.query(`
      SELECT u1.nombre AS creador, u2.nombre AS oponente
      FROM juego1 j
      JOIN usuarios u1 ON j.id_jugador1 = u1.id
      LEFT JOIN usuarios u2 ON j.id_jugador2 = u2.id 
      WHERE j.id_sala_juego1 = ?
    `, [idSala]);

    const nombres = resNombres[0];

    await connection.commit();

    return {
      status: 'ok',
      ganador,
      perdedor,
      cant,
      id_jugador1: jugador1,
      id_jugador2: idJugador2,
      id_ganador: ganador,
      id_sala_juego1: idSala,
      creador: nombres?.creador || null,
      oponente: nombres?.oponente || null
    };

  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// Cancelar sala
async function cancelarSala(idSala, idUsuario) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [salaRes] = await connection.query(
      'SELECT * FROM juego1 WHERE id_sala_juego1 = ? AND id_jugador1 = ? AND id_jugador2 IS NULL',
      [idSala, idUsuario]
    );
    if (salaRes.length === 0) {
      await connection.rollback();
      return false;
    }
    const sala = salaRes[0];

    await connection.query('DELETE FROM juego1 WHERE id_sala_juego1 = ?', [idSala]);
    await connection.query('UPDATE usuarios SET monedasTotales = monedasTotales + ? WHERE id = ?', [
      sala.cant_apostada,
      idUsuario,
    ]);

    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// Resolver manualmente
async function manejarResolverCoinflip({ id_sala_juego1, id_ganador, monto }) {
  try {
    console.log('Resolver coinflip:', { id_sala_juego1, id_ganador, monto });

    const ganancia = monto * 2;

    await pool.query(`
      UPDATE usuarios
      SET 
        monedasTotales = monedasTotales + ?,
        cant_ganada_juego1 = cant_ganada_juego1 + ?,
        cant_ganada_total = cant_ganada_total + ?
      WHERE id = ?
    `, [ganancia, ganancia, ganancia, id_ganador]);

    await pool.query(`
      UPDATE juego1 
      SET resuelto = TRUE, id_ganador = ? 
      WHERE id_sala_juego1 = ?
    `, [id_ganador, id_sala_juego1]);

    return { status: 'ok' };
  } catch (err) {
    console.error('Error en manejarResolverCoinflip:', err);
    return { status: 'error', error: 'No se pudo resolver' };
  }
}

// GET sala por ID
async function obtenerSalaPorID(idSala) {
  const [rows] = await pool.query(`
    SELECT j.id_sala_juego1, j.cant_apostada, j.id_jugador1, j.id_jugador2, 
           u1.nombre as creador,
           u2.nombre as oponente
    FROM juego1 j
    JOIN usuarios u1 ON j.id_jugador1 = u1.id
    LEFT JOIN usuarios u2 ON j.id_jugador2 = u2.id
    WHERE j.id_sala_juego1 = ?
  `, [idSala]);

  return rows[0];
}

async function coinflipHandler(req, res) {
  const { id_usuario, monto, id_sala } = req.body;
  console.log('coinflipHandler recibido:', req.body);

  try {
    if (!id_sala) {
      const sala = await crearSala(id_usuario, monto);
      return res.json({ status: 'sala_creada', sala });
    } else {
      const resultado = await unirseASala(id_sala, id_usuario);
      return res.json({ status: 'resuelto', ...resultado });
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
}

async function manejarUnirseASala(body) {
  return await unirseASala(body.id_sala_juego1, body.id_usuario);
}

module.exports = {
  crearSala,
  listarSalasActivas,
  unirseASala,
  cancelarSala,
  coinflipHandler,
  manejarUnirseASala,
  manejarResolverCoinflip,
  obtenerSalaPorID,
};
