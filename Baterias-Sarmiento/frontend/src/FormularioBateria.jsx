import React, { useState, useEffect } from 'react';

export default function FormularioBateria({ tipo, equipoId }) {
    const numVasos = tipo === 'china' ? 25 : 4;

    // Función segura para leer localStorage sin errores de formato
    const safeParse = (key, defaultValue) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    };

    // Inicialización de estados
    const [frecuencia, setFrecuencia] = useState(localStorage.getItem('frecuencia') || 'quincenal');
    const [voltajesC1, setVoltajesC1] = useState(() => safeParse(`vC1-${equipoId}`, Array(numVasos).fill('')));
    const [voltajesC2, setVoltajesC2] = useState(() => safeParse(`vC2-${equipoId}`, Array(numVasos).fill('')));
    const [resC1, setResC1] = useState(() => safeParse(`rC1-${equipoId}`, Array(numVasos).fill('')));
    const [resC2, setResC2] = useState(() => safeParse(`rC2-${equipoId}`, Array(numVasos).fill('')));

    useEffect(() => {
        localStorage.setItem(`vC1-${equipoId}`, JSON.stringify(voltajesC1));
        localStorage.setItem(`vC2-${equipoId}`, JSON.stringify(voltajesC2));
        localStorage.setItem(`rC1-${equipoId}`, JSON.stringify(resC1));
        localStorage.setItem(`rC2-${equipoId}`, JSON.stringify(resC2));
        localStorage.setItem('frecuencia', frecuencia);
    }, [voltajesC1, voltajesC2, resC1, resC2, frecuencia, equipoId]);

    const enviarReporte = async () => {
        const reporte = { equipoId, tipo, frecuencia, voltajesC1, voltajesC2, resC1, resC2, fecha: new Date().toISOString() };
        try {
            const response = await fetch('https://baterias-sarmiento-backend.onrender.com/api/guardar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reporte)
            });
            const data = await response.json();
            alert(data.mensaje);
        } catch (error) {
            alert("Error: No se pudo conectar con el servidor.");
        }
    };

    const inputStyle = { padding: '5px', backgroundColor: '#1f2937', color: 'white', border: '1px solid #4b5563', width: '90%' };

    return (
        <div style={{ backgroundColor: '#111827', padding: '20px', color: 'white', borderRadius: '15px' }}>
            <h2 style={{ textAlign: 'center' }}>Equipo {equipoId} ({tipo.toUpperCase()})</h2>
            <select value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px' }}>
                <option value="quincenal">Quincenal</option>
                <option value="bimestral">Bimestral (Vaso a vaso)</option>
            </select>

            <div style={{ display: 'flex', gap: '20px' }}>
                {[ { label: 'Cajón 1', v: voltajesC1, setV: setVoltajesC1, r: resC1, setR: setResC1 },
                   { label: 'Cajón 2', v: voltajesC2, setV: setVoltajesC2, r: resC2, setR: setResC2 } ].map((cajon, idx) => (
                    <div key={idx} style={{ flex: 1 }}>
                        <h3>{cajon.label}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
                            {cajon.v.map((val, i) => (
                                <input key={i} style={inputStyle} placeholder={`V${i+1}`} value={val} 
                                    onChange={(e) => { const n = [...cajon.v]; n[i] = e.target.value; cajon.setV(n); }} />
                            ))}
                        </div>
                        <p>Resistencias (mΩ):</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
                            {cajon.r.map((val, i) => (
                                <input key={i} style={{...inputStyle, borderColor: '#e11d48'}} placeholder={`R${i+1}`} value={val} 
                                    onChange={(e) => { const n = [...cajon.r]; n[i] = e.target.value; cajon.setR(n); }} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={enviarReporte} style={{ marginTop: '20px', width: '100%', padding: '15px', backgroundColor: '#3b82f6', border: 'none', color: 'white', fontWeight: 'bold' }}>
                ENVIAR REPORTE AL SERVIDOR
            </button>
        </div>
    );
}