import React, { useEffect, useState } from 'react';
import PlanillaPDF from './PlanillaPDF';

export default function Historial({ equipoId, isGlobalView }) { 
    const [reportes, setReportes] = useState([]);

    useEffect(() => {
        const fetchReportes = async () => {
            try {
                const response = await fetch('https://baterias-sarmiento-backend.onrender.com/api/reportes');
                const data = await response.json();
                
                let filtrados = data;
                
                if (!isGlobalView) {
                    // Si no es vista global, filtramos por el equipo seleccionado
                    filtrados = data.filter(r => Number(r.equipoId) === Number(equipoId));
                }
                
                setReportes(filtrados);
            } catch (error) {
                console.error("Error al traer reportes:", error);
            }
        };
        fetchReportes();
    }, [equipoId, isGlobalView]);

    // Función para eliminar un reporte
    const eliminarReporte = async (id) => {
        if (!window.confirm("¿Estás seguro de que querés eliminar este reporte permanentemente?")) return;

        try {
            const response = await fetch(`https://baterias-sarmiento-backend.onrender.com/api/reportes/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            
            if (response.ok) {
                alert("🗑️ " + (data.mensaje || "Reporte eliminado"));
                // Quitamos el reporte eliminado del estado local para que se actualice la tabla al instante
                setReportes(prev => prev.filter(rep => rep._id !== id));
            } else {
                alert("❌ " + (data.mensaje || "No se pudo eliminar"));
            }
        } catch (e) {
            console.error(e);
            alert("⚠️ Error de conexión al intentar eliminar.");
        }
    };

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
                            <th style={{ padding: '10px' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportes.map((rep, idx) => (
                            <tr key={rep._id || idx} style={{ borderBottom: '1px solid #4b5563' }}>
                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                    {new Date(rep.fecha).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{rep.equipoId}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{rep.tipo}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{rep.frecuencia}</td>
                                <td style={{ padding: '10px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
                                    {/* Botón / Componente de PDF */}
                                    <PlanillaPDF reporte={rep} />
                                    
                                    {/* Botón de Eliminar */}
                                    <button 
                                        onClick={() => eliminarReporte(rep._id)}
                                        style={{ 
                                            padding: '6px 12px', 
                                            backgroundColor: '#ef4444', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '5px', 
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {reportes.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                                    No hay registros históricos disponibles.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}