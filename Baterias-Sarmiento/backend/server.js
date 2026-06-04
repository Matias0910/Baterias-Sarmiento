const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Poné tu URL completa acá (con la nueva contraseña)
// Agregamos /SarmientoDB justo después del .net/
const MONGO_URI = "mongodb+srv://chamy241_db_user:Chamycaro0910@cluster0.9rs9wzy.mongodb.net/SarmientoDB?retryWrites=true&w=majority&appName=Cluster0";

// Busca esta parte en tu server.js y cámbiala por esto:
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://chamy241_db_user:Chamycaro0910@cluster0.9rs9wzy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    dbName: 'SarmientoDB' // <--- ESTO ES LO QUE OBLIGA A USAR ESA BASE
})
.then(() => console.log("✅ Conectado a SarmientoDB"))
.catch(err => console.error("❌ Error de conexión:", err));

// Definimos el modelo de datos
const Reporte = mongoose.model('Reporte', new mongoose.Schema({
    equipoId: Number,
    tipo: String,
    frecuencia: String,
    orientacion: String,
    tiempoApagado: { moreno: String, once: String },
    data: Object,
    fecha: Date
}));

// Ruta para recibir el reporte desde el frontend
app.post('/api/guardar', async (req, res) => {
    try {
        const nuevoReporte = new Reporte(req.body);
        await nuevoReporte.save();
        res.status(200).json({ mensaje: "Reporte guardado en la base de datos!" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al guardar en BD: " + error.message });
    }
});

// Ruta para obtener el historial
app.get('/api/reportes', async (req, res) => {
    try {
        const reportes = await Reporte.find().sort({ fecha: -1 }); // Trae los últimos primero
        res.status(200).json(reportes);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener historial: " + error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));