const express = require('express');
const path = require('path');
const app = express();

const frontendPath = path.join(__dirname, '../frontend');

app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});
