// coinflip.js
const path = require('path');
const mysql = require('mysql2/promise');

// Conexión al pool de MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'tu_usuario',
  password: 'tu_password',
  database: 'tu_base_de_datos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Funciones del backend coinflip
const {
  coinflipHandler,
  listarSalasActivas,
  cancelarSala,
  manejarUnirseASala,
  manejarResolverCoinflip,
  obtenerSalaPorID
} = require('./salas-coinflip');

module.exports = function(app, frontendPath) {
  
  // Ruta de prueba de salud
  app.get('/health', (req, res) => {
    res.json({ status: "OK!" });
  });

  // Ruta para obtener datos de una sala (primero con lógica del backend, luego con DB directa)
  app.get('/coinflip/sala/:idSala', async (req, res) => {
    const idSala = req.params.idSala;

    try {
      const sala = await obtenerSalaPorID(idSala);
      if (sala) {
        return res.json(sala);
      }

      const [rows] = await pool.query(`
        SELECT j.*, u1.nombre AS creador, u2.nombre AS oponente
        FROM juego1 j
        JOIN usuarios u1 ON j.id_jugador1 = u1.id
        LEFT JOIN usuarios u2 ON j.id_jugador2 = u2.id
        WHERE j.id_sala_juego1 = ?
      `, [idSala]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Sala no encontrada' });
      }

      res.json(rows[0]);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Ruta para listar salas activas
  app.get('/coinflip/salas', async (req, res) => {
    try {
      const salas = await listarSalasActivas();
      res.json(salas);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Ruta para cargar la página del juego
  app.get('/coinflip/:idSala', (req, res) => {
    res.sendFile(path.join(frontendPath, 'Paginas/coinflip-juego.html'));
  });

  // Ruta para cancelar sala
  app.post('/coinflip/cancelar', async (req, res) => {
    const { idSala, idUsuario } = req.body;

    try {
      const ok = await cancelarSala(idSala, idUsuario);
      if (ok) {
        res.json({ status: 'cancelado' });
      } else {
        res.status(400).json({ error: 'No se pudo cancelar la sala' });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Ruta principal del coinflip
  app.post('/coinflip', coinflipHandler);

  // Ruta para unirse a una sala
  app.post('/coinflip/unirse', async (req, res) => {
    console.log('Solicitud a /coinflip/unirse:', req.body);
    const data = await manejarUnirseASala(req.body);
    console.log('Respuesta del backend:', data);
    res.json(data);
  });

  // Ruta para resolver el coinflip
  app.post('/coinflip/resolver', async (req, res) => {
    const data = await manejarResolverCoinflip(req.body);
    res.json(data);
  });
};
