const mongoose = require('mongoose');

const reporteSchema = new mongoose.Schema({
    equipoId: Number,
    tipo: String, // 'china' o 'estandar'
    frecuencia: String,
    orientacion: String,
    tiempoApagado: {
        moreno: Number,
        once: Number
    },
    data: {
        v: [[Number]], // Array de arrays de voltajes
        r: [[Number]], // Array de arrays de resistencias
        totR: [Number] // Resistencias totales manuales
    },
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reporte', reporteSchema);