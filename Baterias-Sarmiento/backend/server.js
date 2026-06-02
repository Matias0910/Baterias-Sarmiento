const express = require('express');
const cors = require('cors'); // Importamos cors
const app = express();
const PORT = 3001;

// Configuramos CORS para permitir peticiones desde tu frontend
app.use(cors());
app.use(express.json()); // Necesario para recibir los datos en formato JSON

app.get('/', (req, res) => {
  res.send('Servidor de Baterías Sarmiento activo');
});

// Ejemplo de ruta donde recibiremos los datos del formulario
app.post('/api/guardar', (req, res) => {
  const reporte = req.body;
  console.log('Reporte recibido:', reporte);
  res.json({ mensaje: 'Reporte guardado correctamente' });
});

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});