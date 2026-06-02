const express = require('express');
const cors = require('cors');
const app = express();

// Configuración de middlewares
app.use(cors()); // Permite que tu frontend de Vercel hable con este servidor
app.use(express.json()); // Necesario para entender los datos que envía el frontend

// Ruta principal para recibir los datos
app.post('/api/guardar', (req, res) => {
    const { equipoId, tipo, frecuencia, voltajesC1, voltajesC2, resC1, resC2, fecha } = req.body;

    // Validación de seguridad: resistencias máximas
    const validarRes = (arr) => arr.some(r => parseFloat(r) > 25);

    if (validarRes(resC1) || validarRes(resC2)) {
        return res.status(400).json({ 
            mensaje: "ERROR: Alguna resistencia supera los 25 mΩ. Revisá los valores." 
        });
    }

    // Aquí es donde procesarías los datos (guardar en base de datos, etc.)
    console.log(`Reporte recibido para equipo ${equipoId} el ${fecha}`);

    // Respuesta de éxito
    res.status(200).json({ mensaje: "Reporte guardado correctamente en el servidor." });
});

// Inicio del servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});