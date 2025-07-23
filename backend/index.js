const express = require('express');
const path = require('path');
const { initDb } = require('./db');
const perfilRoutes = require('./perfil');

const app = express();

const frontendPath = path.join(__dirname, '../frontend');

app.use(express.static(frontendPath));
app.use(express.json()); // para parsear JSON en POST

// Montar rutas perfil con prefijo /api
app.use('/api', perfilRoutes);

initDb()
  .then(() => {
    console.log('Base de datos inicializada correctamente');

    // Enviar index.html para cualquier ruta no API
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });

    const port = 3000;
    app.listen(port, () => {
      console.log(`Servidor en http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Error al inicializar la base de datos:', err);
    process.exit(1);
  });
