const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfigNoDb = {
  host: 'localhost',
  user: 'root',
  password: '1234mati',
  port: 3306,
  multipleStatements: true // Permite ejecutar varias sentencias juntas (útil para scripts .sql)
};

const dbConfigWithDb = {
  ...dbConfigNoDb,
  database: 'sqcoins'
};

let connection;

async function initDb() {
  if (!connection) {
    // 1) Conectarse SIN base de datos porque puede no existir
    const connectionNoDb = await mysql.createConnection(dbConfigNoDb);

    // 2) Crear la base de datos si no existe
    await connectionNoDb.query('CREATE DATABASE IF NOT EXISTS sqcoins');

    // 3) Cerrar la conexión sin base
    await connectionNoDb.end();

    // 4) Conectarse ya con la base de datos creada
    connection = await mysql.createConnection(dbConfigWithDb);

    // 5) Leer el script SQL para crear tablas
    const schemaPath = path.join(__dirname, 'scripts', 'db.sql');
    let schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // 6) Ejecutar el script SQL (debe contener sólo las tablas, sin CREATE DATABASE ni USE)
    await connection.query(schemaSQL);

    console.log('Base y tablas inicializadas.');
  }

  return connection;
}

module.exports = { initDb };
