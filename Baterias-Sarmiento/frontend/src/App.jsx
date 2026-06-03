import React from 'react';
import FormularioBateria from './FormularioBateria';
import Historial from './Historial';

export default function App() {
  return (
    <div style={{ backgroundColor: '#111827', minHeight: '100vh', padding: '20px' }}>
      
      {/* Tu formulario original arriba de todo */}
      <FormularioBateria equipoId="02" tipo="china" />

      {/* Sección nueva, separada visualmente */}
      <div style={{ marginTop: '50px', borderTop: '4px solid #374151', paddingTop: '30px' }}>
        <h2 style={{ color: 'white', textAlign: 'center' }}>Historial y Reportes</h2>
        <Historial />
      </div>

    </div>
  );
}