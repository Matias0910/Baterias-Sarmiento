const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/guardar', (req, res) => {
    const { equipoId, tipo, frecuencia, orientacion, tiempoApagado, data, fecha } = req.body;

    // Validación: Buscar si alguna resistencia total manual o individual supera los 25 mΩ
    // (Ajustamos para que valide tanto las manuales como las individuales si existen)
    const resistencias = [...data.r.flat(), ...data.totR.filter(r => r !== '')];
    const sobrepasaLimite = resistencias.some(r => parseFloat(r) > 25);

    if (sobrepasaLimite) {
        return res.status(400).json({ 
            mensaje: "¡ALERTA! Resistencia crítica detectada (>25 mΩ). No se puede guardar." 
        });
    }

    // Aquí iría tu lógica de guardado en MongoDB o PostgreSQL
    console.log(`Reporte recibido: Equipo ${equipoId}, Tipo: ${tipo}, Fecha: ${fecha}`);
    console.log("Datos:", { orientacion, tiempoApagado, data });

    res.status(200).json({ mensaje: "Reporte guardado con éxito." });
});

app.listen(3001, () => console.log('Servidor corriendo en puerto 3001'));