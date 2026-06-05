import React, { useState, useEffect } from 'react';

export default function FormularioBateria({ tipo, equipoId }) {
    const [orientacion, setOrientacion] = useState(localStorage.getItem('orientacion') || 'moreno');
    const [frecuencia, setFrecuencia] = useState(localStorage.getItem('frecuencia') || 'quincenal');
    const [tiempoApagado, setTiempoApagado] = useState({ moreno: '', once: '' });
    const [bateriasChinas, setBateriasChinas] = useState('');
    // Estado para los cambios de batería
    const [cambiosRealizados, setCambiosRealizados] = useState({
        cajon1: false, cajon2: false, cajon3: false, cajon4: false,
        observaciones: ""
    });

    const getVasos = (idx) => {
        if (tipo !== 'china') return 4;
        const esPuntaGrande = orientacion === 'moreno' ? (idx < 2) : (idx >= 2);
        return esPuntaGrande ? 25 : 4;
    };

    const resetData = () => ({
        v: [Array(getVasos(0)).fill(''), Array(getVasos(1)).fill(''), Array(getVasos(2)).fill(''), Array(getVasos(3)).fill('')],
        r: [Array(getVasos(0)).fill(''), Array(getVasos(1)).fill(''), Array(getVasos(2)).fill(''), Array(getVasos(3)).fill('')]
    });

    const [data, setData] = useState(resetData);

    useEffect(() => {
        setData(resetData());
    }, [orientacion, tipo, frecuencia]);

    const updateValue = (type, cajonIdx, valIdx, value) => {
        setData(prevData => {
            const newData = { ...prevData };
            newData[type][cajonIdx][valIdx] = value;
            return newData;
        });
    };

    const enviarReporte = async () => {
        const reporte = { 
            equipoId, tipo, frecuencia, orientacion, tiempoApagado, 
            bateriasChinas: frecuencia === 'quincenal' ? 0 : bateriasChinas,
            cambiosRealizados: { observaciones: cambiosRealizados.observaciones },
            data, 
            fecha: new Date().toISOString() 
        };
        try {
            const response = await fetch('https://baterias-sarmiento-backend.onrender.com/api/guardar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reporte)
            });
            const res = await response.json();
            response.ok ? alert("✅ " + res.mensaje) : alert("❌ " + res.mensaje);
        } catch (e) { alert("⚠️ Error de conexión."); }
    };

    const renderCajon = (idx, label) => {
        const vArray = data.v[idx];
        const rArray = data.r[idx];
        const totalV = vArray.reduce((acc, val) => acc + (parseFloat(val.toString().replace(',', '.')) || 0), 0).toFixed(2);
        let rawSum = rArray.reduce((acc, val) => acc + (parseFloat(val.toString().replace(',', '.')) || 0), 0);
        const totalR = (tipo === 'china' && getVasos(idx) === 25 && frecuencia === 'bimestral' ? (rawSum / 2) : rawSum).toFixed(2);

        return (
            <div style={{ backgroundColor: '#1f2937', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{label} ({getVasos(idx)} vasos)</h4>
                <p>Voltaje:</p>
                {frecuencia === 'bimestral' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
                        {vArray.map((v, i) => <input key={i} style={{ padding: '5px', width: '90%', backgroundColor: '#111827', color: 'white', border: '1px solid #4b5563' }} placeholder={`V${i+1}`} value={v} onChange={(e) => updateValue('v', idx, i, e.target.value)} />)}
                    </div>
                ) : (
                    <input style={{ padding: '5px', width: '90%', backgroundColor: '#111827', color: 'white', border: '1px solid #4b5563' }} placeholder="Voltaje Total" value={vArray[0] || ''} onChange={(e) => updateValue('v', idx, 0, e.target.value)} />
                )}
                <p style={{ color: '#60a5fa' }}>Total: <strong>{totalV} V</strong></p>
                <p>Resistencia (mΩ):</p>
                {frecuencia === 'bimestral' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
                        {rArray.map((r, i) => <input key={i} style={{ padding: '5px', width: '90%', backgroundColor: '#111827', color: 'white', border: '1px solid #e11d48' }} placeholder={`R${i+1}`} value={r} onChange={(e) => updateValue('r', idx, i, e.target.value)} />)}
                    </div>
                ) : (
                    <input style={{ padding: '5px', width: '90%', backgroundColor: '#111827', color: '#e11d48', border: '1px solid #e11d48' }} placeholder="Resistencia Total" value={rArray[0] || ''} onChange={(e) => updateValue('r', idx, 0, e.target.value)} />
                )}
                <p style={{ color: '#e11d48' }}>Total: <strong>{totalR} mΩ</strong></p>
            </div>
        );
    };

    return (
        <div style={{ backgroundColor: '#111827', padding: '20px', color: 'white', borderRadius: '15px', maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', color: '#60a5fa' }}>Equipo {equipoId}</h2>
            {tipo === 'china' && (
                <div style={{ marginBottom: '20px' }}>
                    <label>Cantidad de Baterías Chinas: </label>
                    <input type="number" value={frecuencia === 'quincenal' ? '0' : bateriasChinas} disabled={frecuencia === 'quincenal'} onChange={(e) => setBateriasChinas(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#374151', color: 'white', border: 'none', borderRadius: '5px' }} />
                </div>
            )}
            <div style={{ marginBottom: '15px' }}>
                <label>Punta con vasos grandes: </label>
                <select value={orientacion} onChange={(e) => setOrientacion(e.target.value)} style={{ padding: '5px', backgroundColor: '#374151', color: 'white' }}>
                    <option value="moreno">Moreno</option>
                    <option value="once">Once</option>
                </select>
            </div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}><label>Tiempo Apagado Once: </label><input type="number" style={{ width: '100%', padding: '5px', backgroundColor: '#374151', color: 'white' }} value={tiempoApagado.once} onChange={(e) => setTiempoApagado({...tiempoApagado, once: e.target.value})} /></div>
                <div style={{ flex: 1 }}><label>Tiempo Apagado Moreno: </label><input type="number" style={{ width: '100%', padding: '5px', backgroundColor: '#374151', color: 'white' }} value={tiempoApagado.moreno} onChange={(e) => setTiempoApagado({...tiempoApagado, moreno: e.target.value})} /></div>
            </div>
            <select value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', backgroundColor: '#374151', color: 'white' }}>
                <option value="quincenal">Quincenal</option>
                <option value="bimestral">Bimestral</option>
            </select>
            
            {/* PUNTAS INVERTIDAS: ONCE IZQUIERDA, MORENO DERECHA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><h3 style={{ borderBottom: '2px solid #60a5fa' }}>Punta Once</h3>{renderCajon(2, 'Cajón 1')}{renderCajon(3, 'Cajón 2')}</div>
                <div><h3 style={{ borderBottom: '2px solid #60a5fa' }}>Punta Moreno</h3>{renderCajon(0, 'Cajón 3')}{renderCajon(1, 'Cajón 4')}</div>
            </div>

            {/* SECCIÓN CAMBIOS BATERÍA */}
<div style={{ backgroundColor: '#1f2937', padding: '15px', borderRadius: '10px', marginTop: '20px' }}>
    <h4 style={{ color: '#60a5fa', marginBottom: '10px' }}>CAMBIO DE BATERIAS</h4>
    <textarea 
        style={{ width: '100%', padding: '10px', backgroundColor: '#111827', color: 'white', border: '1px solid #4b5563', borderRadius: '5px', minHeight: '80px' }} 
        placeholder="Escribí aquí qué baterías se cambiaron..." 
        value={cambiosRealizados.observaciones} 
        onChange={(e) => setCambiosRealizados({ ...cambiosRealizados, observaciones: e.target.value })} 
    />
</div>

            <button onClick={enviarReporte} style={{ marginTop: '20px', width: '100%', padding: '15px', backgroundColor: '#3b82f6', border: 'none', color: 'white', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer' }}>ENVIAR REPORTE</button>
        </div>
    );
}