import { useState, useEffect } from 'react';

export default function FormularioBateria({ tipo, equipoId }) {
  const numVasosPorCajon = tipo === 'china' ? 25 : 4;
  
  // Función auxiliar para inicializar estados de forma segura
  const getInitialState = (key, length) => {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Si el tamaño guardado coincide con el esperado, lo devolvemos
      if (Array.isArray(parsed) && parsed.length === length) return parsed;
    }
    // Si no existe o el tamaño cambió, devolvemos el arreglo nuevo
    return Array(length).fill('');
  };

  // Estados
  const [voltajesC1, setVoltajesC1] = useState(() => getInitialState(`vC1-${equipoId}`, numVasosPorCajon));
  const [voltajesC2, setVoltajesC2] = useState(() => getInitialState(`vC2-${equipoId}`, numVasosPorCajon));
  const [resC1, setResC1] = useState(() => localStorage.getItem(`rC1-${equipoId}`) || '');
  const [resC2, setResC2] = useState(() => localStorage.getItem(`rC2-${equipoId}`) || '');
  const [frecuencia, setFrecuencia] = useState(() => localStorage.getItem('frecuencia') || 'quincenal');

  // Forzar actualización si cambia el tipo de batería
  useEffect(() => {
    setVoltajesC1(getInitialState(`vC1-${equipoId}`, numVasosPorCajon));
    setVoltajesC2(getInitialState(`vC2-${equipoId}`, numVasosPorCajon));
  }, [tipo, numVasosPorCajon, equipoId]);

  // Guardado automático en localStorage
  useEffect(() => {
    localStorage.setItem(`vC1-${equipoId}`, JSON.stringify(voltajesC1));
    localStorage.setItem(`vC2-${equipoId}`, JSON.stringify(voltajesC2));
    localStorage.setItem(`rC1-${equipoId}`, resC1);
    localStorage.setItem(`rC2-${equipoId}`, resC2);
    localStorage.setItem('frecuencia', frecuencia);
  }, [voltajesC1, voltajesC2, resC1, resC2, frecuencia, equipoId]);

  const parseVal = (v) => parseFloat(String(v).replace(',', '.')) || 0;
  const calcularTotal = (arr) => arr.reduce((acc, v) => acc + parseVal(v), 0).toFixed(2);

  const enviarReporte = async () => {
    const reporte = { equipoId, tipo, frecuencia, voltajesC1, voltajesC2, resC1, resC2, fecha: new Date().toISOString() };
    try {
      const response = await fetch('https://baterias-sarmiento-backend.onrender.com/api/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reporte)
      });
      const data = await response.json();
      alert(data.mensaje || 'Reporte enviado con éxito'); 
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor.');
    }
  };

  const styles = {
    container: { backgroundColor: '#111827', padding: '25px', borderRadius: '15px', color: '#f3f4f6', maxWidth: '800px', margin: '0 auto', border: '1px solid #374151' },
    input: { padding: '8px', backgroundColor: '#1f2937', color: 'white', border: '1px solid #4b5563', borderRadius: '4px', width: '90%', marginBottom: '5px' },
    select: { padding: '10px', backgroundColor: '#1f2937', color: 'white', border: '1px solid #4b5563', borderRadius: '8px', width: '100%', marginBottom: '20px' },
    cajonBox: { flex: 1, backgroundColor: '#1e293b', padding: '15px', borderRadius: '10px' },
    button: { marginTop: '20px', padding: '15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center', color: '#60a5fa' }}>Equipo {equipoId} - Configuración {tipo.toUpperCase()} ({numVasosPorCajon} vasos)</h2>
      
      <select value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)} style={styles.select}>
        <option value="quincenal">Quincenal (Carga de Totales)</option>
        <option value="bimestral">Bimestral (Carga vaso a vaso)</option>
      </select>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={styles.cajonBox}>
          <h3 style={{ textAlign: 'center' }}>Cajón 1</h3>
          {frecuencia === 'bimestral' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
              {voltajesC1.map((v, i) => (
                <input key={i} style={styles.input} type="text" placeholder={`V${i+1}`} value={v} 
                  onChange={(e) => { const n = [...voltajesC1]; n[i] = e.target.value; setVoltajesC1(n); }} />
              ))}
            </div>
          ) : (
            <input style={styles.input} type="text" placeholder="Voltaje Total C1" value={voltajesC1[0]} 
                   onChange={(e) => { const n = [...voltajesC1]; n[0] = e.target.value; setVoltajesC1(n); }} />
          )}
          <p>Total C1: <strong>{calcularTotal(voltajesC1)} V</strong></p>
          <input style={styles.input} type="text" placeholder="Resistencia C1" value={resC1} onChange={(e) => setResC1(e.target.value)} />
        </div>

        <div style={styles.cajonBox}>
          <h3 style={{ textAlign: 'center' }}>Cajón 2</h3>
          {frecuencia === 'bimestral' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
              {voltajesC2.map((v, i) => (
                <input key={i} style={styles.input} type="text" placeholder={`V${i+1}`} value={v} 
                  onChange={(e) => { const n = [...voltajesC2]; n[i] = e.target.value; setVoltajesC2(n); }} />
              ))}
            </div>
          ) : (
            <input style={styles.input} type="text" placeholder="Voltaje Total C2" value={voltajesC2[0]} 
                   onChange={(e) => { const n = [...voltajesC2]; n[0] = e.target.value; setVoltajesC2(n); }} />
          )}
          <p>Total C2: <strong>{calcularTotal(voltajesC2)} V</strong></p>
          <input style={styles.input} type="text" placeholder="Resistencia C2" value={resC2} onChange={(e) => setResC2(e.target.value)} />
        </div>
      </div>

      <button onClick={enviarReporte} style={styles.button}>ENVIAR REPORTE AL SERVIDOR</button>
    </div>
  );
}