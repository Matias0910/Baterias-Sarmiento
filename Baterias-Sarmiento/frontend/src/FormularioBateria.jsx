import React, { useState, useEffect } from 'react';

export default function FormularioBateria({ tipo, equipoId }) {
    const [orientacion, setOrientacion] = useState(localStorage.getItem('orientacion') || 'moreno');
    const [frecuencia, setFrecuencia] = useState(localStorage.getItem('frecuencia') || 'quincenal');

    const getVasos = (idx) => {
        if (tipo !== 'china') return 4;
        const esGrande = orientacion === 'moreno' ? (idx < 2) : (idx >= 2);
        return esGrande ? 25 : 4;
    };

    const [data, setData] = useState({
        v: [Array(getVasos(0)).fill(''), Array(getVasos(1)).fill(''), Array(getVasos(2)).fill(''), Array(getVasos(3)).fill('')],
        r: [Array(getVasos(0)).fill(''), Array(getVasos(1)).fill(''), Array(getVasos(2)).fill(''), Array(getVasos(3)).fill('')],
        totR: ['', '', '', '']
    });

    useEffect(() => {
        setData({
            v: [Array(getVasos(0)).fill(''), Array(getVasos(1)).fill(''), Array(getVasos(2)).fill(''), Array(getVasos(3)).fill('')],
            r: [Array(getVasos(0)).fill(''), Array(getVasos(1)).fill(''), Array(getVasos(2)).fill(''), Array(getVasos(3)).fill('')],
            totR: ['', '', '', '']
        });
        localStorage.setItem('orientacion', orientacion);
    }, [orientacion, tipo]);

    useEffect(() => {
        localStorage.setItem(`data-${equipoId}-${tipo}-${orientacion}`, JSON.stringify(data));
        localStorage.setItem('frecuencia', frecuencia);
    }, [data, frecuencia, equipoId, tipo, orientacion]);

    const updateValue = (type, cajonIdx, valIdx, value) => {
        const newData = { ...data };
        newData[type][cajonIdx][valIdx] = value;
        setData(newData);
    };

    const updateManualTotR = (cajonIdx, value) => {
        const newData = { ...data };
        newData.totR[cajonIdx] = value;
        setData(newData);
    };

    const enviarReporte = async () => {
        const reporte = { equipoId, tipo, frecuencia, orientacion, data, fecha: new Date().toISOString() };
        try {
            const response = await fetch('https://baterias-sarmiento-backend.onrender.com/api/guardar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reporte)
            });
            const res = await response.json();
            alert(res.mensaje);
        } catch (e) { alert("Error de conexión"); }
    };

    const renderCajon = (idx, label) => {
        const totalV = data.v[idx].reduce((acc, v) => acc + (parseFloat(v) || 0), 0).toFixed(2);
        const autoTotalR = data.r[idx].reduce((acc, r) => acc + (parseFloat(r) || 0), 0).toFixed(2);
        
        return (
            <div style={{ backgroundColor: '#1f2937', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{label} ({getVasos(idx)} vasos)</h4>
                
                <p style={{ margin: '5px 0' }}>Voltaje:</p>
                {frecuencia === 'bimestral' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
                        {data.v[idx].map((v, i) => <input key={i} style={{ padding: '5px', width: '90%', backgroundColor: '#111827', color: 'white', border: '1px solid #4b5563' }} placeholder={`V${i+1}`} value={v} onChange={(e) => updateValue('v', idx, i, e.target.value)} />)}
                    </div>
                ) : (
                    <input style={{ padding: '5px', width: '90%', backgroundColor: '#111827', color: 'white', border: '1px solid #4b5563' }} placeholder="Voltaje Total" value={data.v[idx][0] || ''} onChange={(e) => updateValue('v', idx, 0, e.target.value)} />
                )}
                <p style={{ margin: '8px 0', color: '#60a5fa' }}>Total V: <strong>{totalV} V</strong></p>

                <p style={{ margin: '8px 0' }}>Resistencia (mΩ):</p>
                {tipo === 'china' ? (
                    <input style={{ padding: '5px', width: '90%', backgroundColor: '#111827', color: '#34d399', border: '1px solid #34d399', fontWeight: 'bold' }} placeholder="Ingresar Resistencia Total Manual" value={data.totR[idx]} onChange={(e) => updateManualTotR(idx, e.target.value)} />
                ) : (
                    frecuencia === 'bimestral' ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
                                {data.r[idx].map((r, i) => <input key={i} style={{ padding: '5px', width: '90%', backgroundColor: '#111827', color: 'white', border: '1px solid #e11d48' }} placeholder={`R${i+1}`} value={r} onChange={(e) => updateValue('r', idx, i, e.target.value)} />)}
                            </div>
                            <p style={{ marginTop: '8px', color: '#e11d48' }}>Total R Automático: <strong>{autoTotalR} mΩ</strong></p>
                        </>
                    ) : (
                        <input style={{ padding: '5px', width: '90%', backgroundColor: '#111827', color: '#e11d48', border: '1px solid #e11d48' }} placeholder="Resistencia Total" value={data.r[idx][0] || ''} onChange={(e) => updateValue('r', idx, 0, e.target.value)} />
                    )
                )}
            </div>
        );
    };

    return (
        <div style={{ backgroundColor: '#111827', padding: '20px', color: 'white', borderRadius: '15px', maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', color: '#60a5fa' }}>Equipo {equipoId}</h2>
            {tipo === 'china' && (
                <div style={{ marginBottom: '15px' }}>
                    <label>Orientación de vasos grandes (25): </label>
                    <select value={orientacion} onChange={(e) => setOrientacion(e.target.value)} style={{ padding: '5px', backgroundColor: '#374151', color: 'white' }}>
                        <option value="moreno">Punta Moreno (Cajón 1 y 2)</option>
                        <option value="once">Punta Once (Cajón 3 y 4)</option>
                    </select>
                </div>
            )}
            <select value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', backgroundColor: '#374151', color: 'white' }}>
                <option value="quincenal">Quincenal</option>
                <option value="bimestral">Bimestral</option>
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><h3 style={{ borderBottom: '2px solid #60a5fa' }}>Punta Moreno</h3>{renderCajon(0, 'Cajón 1')}{renderCajon(1, 'Cajón 2')}</div>
                <div><h3 style={{ borderBottom: '2px solid #60a5fa' }}>Punta Once</h3>{renderCajon(2, 'Cajón 3')}{renderCajon(3, 'Cajón 4')}</div>
            </div>
            <button onClick={enviarReporte} style={{ marginTop: '20px', width: '100%', padding: '15px', backgroundColor: '#3b82f6', border: 'none', color: 'white', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer' }}>ENVIAR REPORTE</button>
        </div>
    );
}