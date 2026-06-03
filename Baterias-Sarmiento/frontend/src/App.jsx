import React, { useState } from 'react';
import FormularioBateria from './FormularioBateria';
import Historial from './Historial';

export default function App() {
  const [config, setConfig] = useState({ equipoId: '02', tipo: 'china' });
  const [iniciado, setIniciado] = useState(false);

  return (
    <div style={{ backgroundColor: '#111827', minHeight: '100vh', padding: '20px', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* PANTALLA DE INICIO (El selector que querías) */}
      {!iniciado ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Gestión de Baterías Sarmiento</h2>
          <input 
            value={config.equipoId} 
            onChange={(e) => setConfig({...config, equipoId: e.target.value})}
            style={{ padding: '10px', marginRight: '10px', borderRadius: '5px' }}
            placeholder="ID Equipo"
          />
          <select 
            value={config.tipo} 
            onChange={(e) => setConfig({...config, tipo: e.target.value})} 
            style={{ padding: '10px', marginRight: '10px', borderRadius: '5px' }}
          >
            <option value="china">Baterías Chinas</option>
            <option value="estandar">Baterías Estándar</option>
          </select>
          <button onClick={() => setIniciado(true)} style={{ padding: '10px 20px', cursor: 'pointer' }}>Ir al Formulario</button>
        </div>
      ) : (
        /* VISTA PRINCIPAL (Cuando ya elegiste el equipo) */
        <>
          <button onClick={() => setIniciado(false)} style={{ marginBottom: '20px' }}>← Volver al Menú</button>
          
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