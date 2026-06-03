import React, { useState } from 'react';
import FormularioBateria from './FormularioBateria';
import Historial from './Historial';

export default function App() {
  const [vista, setVista] = useState('menu'); // 'menu', 'formulario', 'historial'
  const [config, setConfig] = useState({ equipoId: '', tipo: 'china' });

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#111827', minHeight: '100vh' }}>
      
      {/* MENU INICIAL */}
      {vista === 'menu' && (
        <div style={{ textAlign: 'center', color: 'white', marginTop: '50px' }}>
          <h2>Gestión de Baterías Sarmiento</h2>
          <div style={{ marginBottom: '20px' }}>
            <input 
              placeholder="ID del Equipo" 
              value={config.equipoId}
              onChange={(e) => setConfig({...config, equipoId: e.target.value})}
              style={{ padding: '10px', marginRight: '10px' }}
            />
            <select 
              value={config.tipo}
              onChange={(e) => setConfig({...config, tipo: e.target.value})}
              style={{ padding: '10px' }}
            >
              <option value="china">Baterías Chinas</option>
              <option value="estandar">Baterías Estándar</option>
            </select>
          </div>
          <button onClick={() => setVista('formulario')} style={{ padding: '10px 20px', marginRight: '10px' }}>Ir al Formulario</button>
          <button onClick={() => setVista('historial')} style={{ padding: '10px 20px' }}>Ver Historial</button>
        </div>
      )}

      {/* VISTAS DINÁMICAS */}
      {vista === 'formulario' && (
        <>
          <button onClick={() => setVista('menu')} style={{ marginBottom: '10px' }}>← Volver al Menú</button>
          <FormularioBateria equipoId={config.equipoId} tipo={config.tipo} />
        </>
      )}

      {vista === 'historial' && (
        <>
          <button onClick={() => setVista('menu')} style={{ marginBottom: '10px' }}>← Volver al Menú</button>
          <Historial />
        </>
      )}
    </div>
  );
}