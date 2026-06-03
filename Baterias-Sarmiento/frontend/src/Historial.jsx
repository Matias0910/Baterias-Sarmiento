import React, { useEffect, useState } from 'react';
import PlanillaPDF from './PlanillaPDF';

export default function Historial() {
    const [reportes, setReportes] = useState([]);
    const [reporteSeleccionado, setReporteSeleccionado] = useState(null);

    useEffect(() => {
        // Traemos los datos de tu backend
        fetch('https://baterias-sarmiento-backend.onrender.com/api/reportes')
            .then(res => res.json())
            .then(data => setReportes(data))
            .catch(err => console.error("Error al cargar historial", err));
    }, []);

    return (
        <div style={{ color: 'white', padding: '20px' }}>
            <h2>Historial de Reportes</h2>
            <div style={{ display: 'grid', gap: '10px' }}>
                {reportes.map((rep) => (
                    <div key={rep._id} style={{ border: '1px solid #4b5563', padding: '10px', borderRadius: '5px' }}>
                        <p>Equipo: {rep.equipoId} - Fecha: {new Date(rep.fecha).toLocaleDateString()}</p>
                        <button onClick={() => setReporteSeleccionado(rep)}>Ver Planilla</button>
                    </div>
                ))}
            </div>

            {reporteSeleccionado && (
                <div style={{ marginTop: '30px' }}>
                    <button onClick={() => setReporteSeleccionado(null)}>Cerrar Planilla</button>
                    <PlanillaPDF reporte={reporteSeleccionado} />
                </div>
            )}
        </div>
    );
}