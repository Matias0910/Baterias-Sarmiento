import React, { useEffect, useState } from 'react';
import PlanillaPDF from './PlanillaPDF';

export default function Historial({ equipoId }) { // <--- Recibimos equipoId acá
    const [reportes, setReportes] = useState([]);

   // En Historial.jsx
useEffect(() => {
    const fetchReportes = async () => {
        try {
            const response = await fetch('https://baterias-sarmiento-backend.onrender.com/api/reportes');
            const data = await response.json();
            
            // Comparamos convirtiendo ambos a Number. 
            // Number("02") es 2 y Number(2) es 2. ¡Coinciden!
            const filtrados = data.filter(r => Number(r.equipoId) === Number(equipoId));
            
            setReportes(filtrados);
        } catch (error) {
            console.error("Error al traer reportes:", error);
        }
    };
    fetchReportes();
}, [equipoId]);

    return (
        <div style={{ padding: '20px', backgroundColor: '#1f2937', borderRadius: '10px', marginTop: '20px' }}>
            <h2 style={{ color: '#60a5fa', textAlign: 'center' }}>Registros Históricos</h2>
            
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', color: 'white', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#374151' }}>
                            <th style={{ padding: '10px' }}>Fecha</th>
                            <th style={{ padding: '10px' }}>Equipo</th>
                            <th style={{ padding: '10px' }}>Tipo</th>
                            <th style={{ padding: '10px' }}>Frecuencia</th>
                            <th style={{ padding: '10px' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportes.map((rep, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #4b5563' }}>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{new Date(rep.fecha).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{rep.equipoId}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{rep.tipo}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{rep.frecuencia}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                    {/* Aquí activas tu PlanillaPDF pasando el reporte específico */}
                                    <PlanillaPDF reporte={rep} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}