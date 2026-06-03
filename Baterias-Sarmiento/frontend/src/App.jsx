import React, { useState } from 'react';
import FormularioBateria from './FormularioBateria';
import Historial from './Historial';

export default function App() {
  const [config, setConfig] = useState({ equipoId: '02', tipo: 'china' });
  const [iniciado, setIniciado] = useState(false);

  return (
    <div style={{ backgroundColor: '#111827', minHeight: '100vh', padding: '20px', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* MENÚ DE SELECCIÓN */}
      <div style={{ textAlign: 'center', marginBottom: '40px', padding: '20px', backgroundColor: '#1f2937', borderRadius: '10px' }}>
        <h2 style={{ marginTop: 0 }}>Gestión de Baterías Sarmiento</h2>
        <input 
          value={config.equipoId} 
          onChange={(e) => setConfig({...config, equipoId: e.target.value})}
          style={{ padding: '8px', marginRight: '10px', borderRadius: '5px', border: 'none' }}
          placeholder="ID Equipo"
        />
        <select 
          value={config.tipo} 
          onChange={(e) => setConfig({...config, tipo: e.target.value})} 
          style={{ padding: '8px', marginRight: '10px', borderRadius: '5px', border: 'none' }}
        >
          <option value="china">Baterías Chinas</option>
          <option value="estandar">Baterías Estándar</option>
        </select>
        <button onClick={() => setIniciado(true)} style={{ padding: '8px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Cargar Reporte
        </button>
      </div>

      {/* FORMULARIO E HISTORIAL */}
      {iniciado && (
        <>
          <FormularioBateria equipoId={config.equipoId} tipo={config.tipo} />
          
          <div style={{ marginTop: '50px', borderTop: '4px solid #374151', paddingTop: '30px' }}>
            <h2 style={{ textAlign: 'center' }}>Historial y Reportes</h2>
            <Historial />
          </div>
        </>
      )}
    </div>
  );
}