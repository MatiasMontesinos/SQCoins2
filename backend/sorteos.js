const express = require('express');
const app = express();
const { Pool } = require('pg');

app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgresSQcoins',
  password: 'postgres',
  port: 5432
});

// Crear sorteo
app.post('/api/sorteos/crear', async (req, res) => {
  const { cantidad_sorteo, limite_participantes, id_creador } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO sorteos (id_creador, cantidad_sorteo, limite_participantes, completado)
      VALUES ($1, $2, $3, false) RETURNING *
    `, [id_creador, cantidad_sorteo, limite_participantes]);
    res.json({ success: true, sorteo: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al crear sorteo' });
  }
});

// Listar sorteos activos
app.get('/api/sorteos/activos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.nombre as creador,
        (SELECT COUNT(*) FROM sorteos_participantes sp WHERE sp.id_sorteo = s.id_sorteo) as participantes
      FROM sorteos s
      JOIN usuarios u ON s.id_creador = u.id
      WHERE s.completado = false
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar sorteos' });
  }
});

// Unirse a sorteo
app.post('/api/sorteos/unirse', async (req, res) => {
  const { id_usuario, id_sorteo } = req.body;
  try {
    const check = await pool.query(`
      SELECT * FROM sorteos_participantes WHERE id_usuario = $1 AND id_sorteo = $2
    `, [id_usuario, id_sorteo]);
    if (check.rows.length > 0)
      return res.status(400).json({ success: false, message: 'Ya estás inscrito' });

    await pool.query(`
      INSERT INTO sorteos_participantes (id_usuario, id_sorteo) VALUES ($1, $2)
    `, [id_usuario, id_sorteo]);

    const { rows } = await pool.query(`
      SELECT COUNT(*) as cantidad, limite_participantes
      FROM sorteos s
      JOIN sorteos_participantes sp ON sp.id_sorteo = s.id_sorteo
      WHERE s.id_sorteo = $1
      GROUP BY limite_participantes
    `, [id_sorteo]);

    if (parseInt(rows[0].cantidad) >= parseInt(rows[0].limite_participantes)) {
      const participantes = await pool.query(`
        SELECT id_usuario FROM sorteos_participantes WHERE id_sorteo = $1
      `, [id_sorteo]);

      const ganador = participantes.rows[Math.floor(Math.random() * participantes.rows.length)].id_usuario;

      await pool.query(`
        UPDATE sorteos SET completado = true, id_ganador = $1 WHERE id_sorteo = $2
      `, [ganador, id_sorteo]);

      await pool.query(`
        UPDATE usuarios SET cant_monedas = cant_monedas + (
          SELECT cantidad_sorteo FROM sorteos WHERE id_sorteo = $1
        ) WHERE id = $2
      `, [id_sorteo, ganador]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al unirse al sorteo' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
