import React, { useState } from 'react';
import FormularioBateria from './FormularioBateria';
import Historial from './Historial';

export default function App() {
  const [vista, setVista] = useState('formulario'); // 'formulario' o 'historial'

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button 
          onClick={() => setVista('formulario')}
          style={{ marginRight: '10px', padding: '10px' }}
        >
          Cargar Nuevo Reporte
        </button>
        <button 
          onClick={() => setVista('historial')}
          style={{ padding: '10px' }}
        >
          Ver Historial
        </button>
      </div>

      {vista === 'formulario' ? (
        <FormularioBateria equipoId="02" tipo="china" />
      ) : (
        <Historial />
      )}
    </div>
  );
}