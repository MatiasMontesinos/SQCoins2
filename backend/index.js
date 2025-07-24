const express = require('express');
const path = require('path');
const { initDb } = require('./db');
const perfilRoutes = require('./perfil');

const app = express();

const frontendPath = path.join(__dirname, '../frontend');

app.use(express.static(frontendPath));
app.use(express.json());

const session = require('express-session');

app.use(session({
  secret: 'pagina_web_sqcoins_trabajo_practico_facultad', // clave de seguridad puesta para firmar la cookite
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 día en ms
    httpOnly: true,
    // secure: true, // activa solo si usas HTTPS
  }
}));


app.use('/api', perfilRoutes);

initDb()
  .then(() => {
    console.log('Base de datos inicializada correctamente');

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

require('./coinflip')(app, frontendPath);