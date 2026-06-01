import { useState } from 'react';
import FormularioBateria from './FormularioBateria';

function App() {
  const [modo, setModo] = useState('estandar');
  const [equipo, setEquipo] = useState(1);

  return (
    <div style={{ backgroundColor: '#030712', minHeight: '100vh', padding: '20px', color: 'white', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#3b82f6', marginBottom: '20px' }}>Baterías Sarmiento - Gestión</h1>
      
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px' }}>Seleccionar Equipo: </label>
          <select value={equipo} onChange={(e) => setEquipo(parseInt(e.target.value))} style={{ padding: '5px', backgroundColor: '#1f2937', color: 'white', border: '1px solid #4b5563' }}>
            {[...Array(25)].map((_, i) => (
              <option key={i + 1} value={i + 1}>Equipo {i + 1}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => setModo('estandar')} style={{ padding: '10px', marginRight: '10px', cursor: 'pointer' }}>Modo Estándar (8 vasos)</button>
          <button onClick={() => setModo('china')} style={{ padding: '10px', cursor: 'pointer' }}>Modo Chino (50 vasos)</button>
        </div>
      </div>

      {/* La clave "key={modo}" hace que el componente se recargue al cambiar */}
      <FormularioBateria key={modo} tipo={modo} equipoId={equipo} />
    </div>
  )
}

export default App