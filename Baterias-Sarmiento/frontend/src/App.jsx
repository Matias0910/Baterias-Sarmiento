import React, { useState } from 'react';
import FormularioBateria from './FormularioBateria';
import Historial from './Historial';

export default function App() {
  const [equipoId, setEquipoId] = useState('02');
  const [iniciado, setIniciado] = useState(false);
  const [verGlobal, setVerGlobal] = useState(false);

  return (
    <div style={{ backgroundColor: '#111827', minHeight: '100vh', padding: '20px', color: 'white', fontFamily: 'sans-serif' }}>
      
      {!iniciado ? (
        <div style={{ textAlign: 'center', marginTop: '50px', padding: '25px', backgroundColor: '#1f2937', borderRadius: '10px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          <h2 style={{ marginBottom: '20px' }}>Gestión de Baterías Sarmiento</h2>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
            <input 
              value={equipoId} 
              onChange={(e) => setEquipoId(e.target.value)}
              style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#374151', color: 'white', border: '1px solid #4b5563', width: '120px', textAlign: 'center' }}
              placeholder="N° Equipo"
            />
            <button 
              onClick={() => setIniciado(true)} 
              style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
            >
              Ir al Formulario
            </button>
          </div>
        </div>
      ) : (
        <>
          <button onClick={() => setIniciado(false)} style={{ marginBottom: '20px', padding: '8px 12px', backgroundColor: '#374151', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>← Volver al Menú</button>
          
          {/* Formulario donde se muestran las dos puntas a la vista */}
          <FormularioBateria equipoId={equipoId} />
          
          <div style={{ marginTop: '50px', borderTop: '4px solid #374151', paddingTop: '30px' }}>
            <h2 style={{ textAlign: 'center' }}>Historial y Reportes</h2>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button 
                    onClick={() => setVerGlobal(!verGlobal)}
                    style={{ padding: '10px 20px', backgroundColor: verGlobal ? '#10b981' : '#6b7280', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {verGlobal ? "← Ver solo Equipo " + equipoId : "Ver Historial de TODOS los Equipos"}
                </button>
            </div>
            <Historial equipoId={equipoId} isGlobalView={verGlobal} />
          </div>
        </>
      )}
    </div>
  );
}