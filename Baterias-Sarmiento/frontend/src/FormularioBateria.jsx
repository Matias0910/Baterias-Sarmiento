import React, { useState, useEffect } from 'react';

export default function FormularioBateria({ equipoId }) {
    const [orientacion, setOrientacion] = useState(localStorage.getItem('orientacion_' + equipoId) || 'moreno');
    const [frecuencia, setFrecuencia] = useState(localStorage.getItem('frecuencia_' + equipoId) || 'quincenal');
    const [tiempoApagado, setTiempoApagado] = useState({ moreno: '', once: '' });

    const [marcasBaterias, setMarcasBaterias] = useState(() => {
      // Le agregamos el equipoId al nombre para que sea único por equipo
      const saved = localStorage.getItem('marcasBaterias_' + equipoId);
      return saved ? JSON.parse(saved) : { once: 'Hoppecke', moreno: 'Detroit' };
    });

  useEffect(() => {
      // Acá también lo guardamos con el nombre único
      localStorage.setItem('marcasBaterias_' + equipoId, JSON.stringify(marcasBaterias));
    }, [marcasBaterias, equipoId]); // Agregamos equipoId acá
    
    // Estado para manejar fechas anteriores o personalizadas
    const [fechaReporte, setFechaReporte] = useState(
        new Date().toISOString().slice(0, 16)
    );

    // Estados para el Asistente
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [textoManual, setTextoManual] = useState("");
    const [cajonActivo, setCajonActivo] = useState(0); // 0: Once C1, 1: Once C2, 2: Moreno C1, 3: Moreno C2

    // Estado para los cambios de batería
    const [cambiosRealizados, setCambiosRealizados] = useState({
        observaciones: ""
    });

    // Validamos por punta según la marca seleccionada de cada una
    const getVasos = (idx) => {
        const esPuntaOnce = idx < 2;
        const marcaPunta = esPuntaOnce ? marcasBaterias.once : marcasBaterias.moreno;
        
        // Si la marca de esa punta no es china (ej. Hoppecke, Vision, Detroit, Kaise), usa 4 vasos
        if (marcaPunta !== 'Chinas') return 4;
        
        // Si es China, evaluamos cuál punta tiene los vasos grandes (25 vasos) según la orientación general
        const esPuntaGrande = orientacion === 'moreno' ? (idx >= 2) : (idx < 2);
        return esPuntaGrande ? 25 : 4;
    };

    const resetData = () => ({
        v: [Array(getVasos(0)).fill(''), Array(getVasos(1)).fill(''), Array(getVasos(2)).fill(''), Array(getVasos(3)).fill('')],
        r: [Array(getVasos(0)).fill(''), Array(getVasos(1)).fill(''), Array(getVasos(2)).fill(''), Array(getVasos(3)).fill('')]
    });

    const [data, setData] = useState(resetData);

    useEffect(() => {
        setData(resetData());
    }, [orientacion, marcasBaterias, frecuencia]);

    const updateValue = (type, cajonIdx, valIdx, value) => {
        setData(prevData => {
            const newData = { ...prevData };
            newData[type][cajonIdx][valIdx] = value;
            return newData;
        });
    };

    // --- LÓGICA DEL ASISTENTE ---
    const iniciarEscucha = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("⚠️ Tu navegador no soporta reconocimiento de voz. Usá Google Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'es-AR';
        recognition.continuous = false; 
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript("Escuchando...");
        };

        recognition.onresult = (event) => {
            const texto = event.results[0][0].transcript.toLowerCase().trim();
            setTranscript(texto);
            interpretarComando(texto);
        };

        recognition.onerror = (event) => {
            console.error("Error de voz:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const interpretarComando = (texto) => {
        console.log("Comando procesado:", texto);
        setTranscript(`Procesado: "${texto}"`);

        if (texto.includes('once cajón 1') || texto.includes('once cajon 1')) {
            setCajonActivo(0);
            return;
        }
        if (texto.includes('once cajón 2') || texto.includes('once cajon 2')) {
            setCajonActivo(1);
            return;
        }
        if (texto.includes('moreno cajón 1') || texto.includes('moreno cajon 1')) {
            setCajonActivo(2);
            return;
        }
        if (texto.includes('moreno cajón 2') || texto.includes('moreno cajon 2')) {
            setCajonActivo(3);
            return;
        }

        const partes = texto.split(' ');
        const todosLosNumeros = partes.filter(p => /\d+[\.,]?\d*/.test(p));

        if (todosLosNumeros.length === 0) return;

        if (frecuencia === 'quincenal') {
            const valVoltaje = todosLosNumeros[0]?.replace(',', '.');
            const valResistencia = todosLosNumeros[1]?.replace(',', '.');

            setData(prevData => {
                const newData = { ...prevData };
                if (valVoltaje) newData.v[cajonActivo][0] = valVoltaje;
                if (valResistencia) newData.r[cajonActivo][0] = valResistencia;
                return newData;
            });
            return;
        }

        let indexVasoWord = partes.indexOf('vaso');
        let numVaso = 0;
        let valVoltaje = "";
        let valResistencia = "";

        if (indexVasoWord !== -1 && partes[indexVasoWord + 1]) {
            numVaso = parseInt(partes[indexVasoWord + 1]) - 1;
            const numerosRestantes = partes.slice(indexVasoWord + 2).filter(p => /\d+[\.,]?\d*/.test(p));
            
            if (numerosRestantes.length >= 2) {
                valVoltaje = numerosRestantes[0].replace(',', '.');
                valResistencia = numerosRestantes[1].replace(',', '.');
            }
        } else if (todosLosNumeros.length >= 3) {
            numVaso = parseInt(todosLosNumeros[0]) - 1;
            valVoltaje = todosLosNumeros[1].replace(',', '.');
            valResistencia = todosLosNumeros[2].replace(',', '.');
        }

        if (valVoltaje && valResistencia && !isNaN(numVaso)) {
            setData(prevData => {
                const newData = { ...prevData };
                if (newData.v[cajonActivo] && newData.v[cajonActivo][numVaso] !== undefined) {
                    newData.v[cajonActivo][numVaso] = valVoltaje;
                }
                if (newData.r[cajonActivo] && newData.r[cajonActivo][numVaso] !== undefined) {
                    newData.r[cajonActivo][numVaso] = valResistencia;
                }
                return newData;
            });
        }
    };
    // ----------------------------------------

    const obtenerAlerta = (valor, tipoDato, idx) => {
        if (!valor) return false;
        
        let valorLimpio = valor.toString().trim();
        if (valorLimpio.endsWith('.') || valorLimpio.endsWith(',')) {
            valorLimpio = valorLimpio.slice(0, -1);
        }

        const v = parseFloat(valorLimpio.replace(',', '.'));
        if (isNaN(v)) return false;

        const esVasoChina = getVasos(idx) === 25;

        if (!esVasoChina) {
            return false; 
        }

        if (tipoDato === 'v') return v < 1.9 || v > 2.4;
        if (tipoDato === 'r') return v > 2.2;

        return false;
    };

    const enviarReporte = async () => {
        const reporte = { 
            equipoId, 
            marcasBaterias, // Enviamos las marcas fijas independientes de cada punta
            frecuencia, 
            orientacion, 
            tiempoApagado,
            cambiosRealizados: { observaciones: cambiosRealizados.observaciones },
            data, 
            fecha: new Date(fechaReporte).toISOString() 
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
        const totalV = vArray.reduce((acc, val) => acc + (parseFloat(val?.toString().replace(',', '.')) || 0), 0).toFixed(2).replace('.', ',');
        let rawSum = rArray.reduce((acc, val) => acc + (parseFloat(val.toString().replace(',', '.')) || 0), 0);
        const totalR = (getVasos(idx) === 25 && frecuencia === 'bimestral' ? (rawSum / 2) : rawSum).toFixed(2).replace('.', ',');

        const esActivo = cajonActivo === idx;

        return (
            <div style={{ backgroundColor: esActivo ? '#1e3a8a' : '#1f2937', border: esActivo ? '2px solid #60a5fa' : '1px solid transparent', padding: '15px', borderRadius: '10px', marginBottom: '15px', transition: 'all 0.3s ease' }}>
                <h4 style={{ margin: '0 0 10px 0', color: esActivo ? '#93c5fd' : 'white' }}>
                    {label} ({getVasos(idx)} vasos) {esActivo && ' 👈 (ACTIVO)'}
                </h4>
                <p>Voltaje:</p>
                {frecuencia === 'bimestral' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
                        {vArray.map((v, i) => <input key={i} style={{ padding: '5px', width: '90%', backgroundColor: obtenerAlerta(v, 'v', idx) ? '#7f1d1d' : '#111827', color: 'white', border: '1px solid #4b5563' }} placeholder={`V${i+1}`} value={v} onChange={(e) => updateValue('v', idx, i, e.target.value)} />)}
                    </div>
                ) : (
                    <input style={{ padding: '5px', width: '90%', backgroundColor: '#111827', color: 'white', border: '1px solid #4b5563' }} placeholder="Voltaje Total" value={vArray[0] || ''} onChange={(e) => updateValue('v', idx, 0, e.target.value)} />
                )}
                <p style={{ color: '#60a5fa' }}>Total: <strong>{totalV} V</strong></p>
                <p>Resistencia (R):</p>
                {frecuencia === 'bimestral' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
                        {rArray.map((r, i) => <input key={i} style={{ padding: '5px', width: '90%', backgroundColor: obtenerAlerta(r, 'r', idx) ? '#7f1d1d' : '#111827', color: 'white', border: '1px solid #e11d48' }} placeholder={`R${i+1}`} value={r} onChange={(e) => updateValue('r', idx, i, e.target.value)} />)}
                    </div>
                ) : (
                    <input style={{ padding: '5px', width: '90%', backgroundColor: '#111827', color: 'white', border: '1px solid #e11d48' }} placeholder="Resistencia Total" value={rArray[0] || ''} onChange={(e) => updateValue('r', idx, 0, e.target.value)} />
                )}
                <p style={{ color: '#e11d48' }}>Total: <strong>{totalR} R</strong></p>
            </div>
        );
    };

    return (
        <div style={{ backgroundColor: '#111827', padding: '20px', color: 'white', borderRadius: '15px', maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', color: '#60a5fa' }}>Equipo {equipoId}</h2>
            
            {/* SECCIÓN DE MARCAS FIJAS PARA CADA PUNTA A LA VISTA */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', backgroundColor: '#1f2937', padding: '15px', borderRadius: '10px' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#60a5fa', fontWeight: 'bold' }}>Marca Punta Once:</label>
                    <select 
                        value={marcasBaterias.once} 
                        onChange={(e) => setMarcasBaterias({ ...marcasBaterias, once: e.target.value })} 
                        style={{ width: '100%', padding: '8px', backgroundColor: '#374151', color: 'white', borderRadius: '5px', border: '1px solid #4b5563' }}
                    >
                        <option value="Chinas">Chinas</option>
                        <option value="Hoppecke">Hoppecke</option>
                        <option value="Vision">Vision</option>
                        <option value="Detroit">Detroit</option>
                        <option value="Kaise">Kaise</option>
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#60a5fa', fontWeight: 'bold' }}>Marca Punta Moreno:</label>
                    <select 
                        value={marcasBaterias.moreno} 
                        onChange={(e) => setMarcasBaterias({ ...marcasBaterias, moreno: e.target.value })} 
                        style={{ width: '100%', padding: '8px', backgroundColor: '#374151', color: 'white', borderRadius: '5px', border: '1px solid #4b5563' }}
                    >
                        <option value="Chinas">Chinas</option>
                        <option value="Hoppecke">Hoppecke</option>
                        <option value="Vision">Vision</option>
                        <option value="Detroit">Detroit</option>
                        <option value="Kaise">Kaise</option>
                    </select>
                </div>
            </div>
            
            {/* Selector de Fecha para registros pasados */}
            <div style={{ backgroundColor: '#1f2937', padding: '12px', borderRadius: '10px', marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#60a5fa' }}>
                    📅 Fecha y Hora del Mantenimiento:
                </label>
                <input 
                    type="datetime-local" 
                    value={fechaReporte} 
                    onChange={(e) => setFechaReporte(e.target.value)}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#111827', color: 'white', border: '1px solid #4b5563', borderRadius: '5px' }}
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>Punta con vasos grandes (Solo aplica si hay baterías Chinas): </label>
                <select value={orientacion} onChange={(e) => setOrientacion(e.target.value)} style={{ padding: '5px', backgroundColor: '#374151', color: 'white' }}>
                    <option value="moreno">Moreno</option>
                    <option value="once">Once</option>
                </select>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}><label>Tiempo Apagado Once (minutos): </label><input type="number" style={{ width: '100%', padding: '5px', backgroundColor: '#374151', color: 'white' }} value={tiempoApagado.once} onChange={(e) => setTiempoApagado({...tiempoApagado, once: e.target.value})} /></div>
                <div style={{ flex: 1 }}><label>Tiempo Apagado Moreno (minutos): </label><input type="number" style={{ width: '100%', padding: '5px', backgroundColor: '#374151', color: 'white' }} value={tiempoApagado.moreno} onChange={(e) => setTiempoApagado({...tiempoApagado, moreno: e.target.value})} /></div>
            </div>
            
            <select value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', backgroundColor: '#374151', color: 'white' }}>
                <option value="quincenal">Quincenal</option>
                <option value="bimestral">Bimestral</option>
            </select>

            {/* PANEL DE ASISTENTE CON SELECTOR MANUAL DE CAJONES, VOZ Y TEXTO */}
            <div style={{ backgroundColor: '#1f2937', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '2px solid #3b82f6', textAlign: 'center' }}>
                <h4 style={{ color: '#60a5fa', margin: '0 0 10px 0' }}>🤖 Panel de Control y Asistente</h4>
                
                <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>Seleccioná el cajón activo tocando los botones:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', maxWidth: '400px', margin: '0 auto' }}>
                        <button 
                            onClick={() => setCajonActivo(0)} 
                            style={{ padding: '8px', backgroundColor: cajonActivo === 0 ? '#2563eb' : '#374151', color: 'white', border: cajonActivo === 0 ? '2px solid #93c5fd' : '1px solid #4b5563', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            ⚡ Once - Cajón 1
                        </button>
                        <button 
                            onClick={() => setCajonActivo(1)} 
                            style={{ padding: '8px', backgroundColor: cajonActivo === 1 ? '#2563eb' : '#374151', color: 'white', border: cajonActivo === 1 ? '2px solid #93c5fd' : '1px solid #4b5563', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            ⚡ Once - Cajón 2
                        </button>
                        <button 
                            onClick={() => setCajonActivo(2)} 
                            style={{ padding: '8px', backgroundColor: cajonActivo === 2 ? '#2563eb' : '#374151', color: 'white', border: cajonActivo === 2 ? '2px solid #93c5fd' : '1px solid #4b5563', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            🔋 Moreno - Cajón 1
                        </button>
                        <button 
                            onClick={() => setCajonActivo(3)} 
                            style={{ padding: '8px', backgroundColor: cajonActivo === 3 ? '#2563eb' : '#374151', color: 'white', border: cajonActivo === 3 ? '2px solid #93c5fd' : '1px solid #4b5563', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            🔋 Moreno - Cajón 2
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    <button 
                        onClick={iniciarEscucha} 
                        style={{ 
                            padding: '10px 20px', 
                            backgroundColor: isListening ? '#ef4444' : '#10b981', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '50px', 
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}
                    >
                        {isListening ? "🎙️ Escuchando... (Hable ahora)" : "🎤 Activar Micrófono"}
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', maxWidth: '450px', margin: '0 auto' }}>
                    <input 
                        type="text" 
                        placeholder="O escribí el comando acá (ej: Vaso 5, 2.15, 1.5)..." 
                        value={textoManual}
                        onChange={(e) => setTextoManual(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && textoManual.trim()) {
                                interpretarComando(textoManual.toLowerCase().trim());
                                setTextoManual("");
                            }
                        }}
                        style={{ flex: 1, padding: '8px', backgroundColor: '#111827', color: 'white', border: '1px solid #4b5563', borderRadius: '5px' }}
                    />
                    <button 
                        onClick={() => {
                            if (textoManual.trim()) {
                                interpretarComando(textoManual.toLowerCase().trim());
                                setTextoManual("");
                            }
                        }}
                        style={{ padding: '8px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Enviar
                    </button>
                </div>

                {transcript && <div style={{ marginTop: '8px', fontSize: '12px', color: '#e5e7eb', fontStyle: 'italic' }}>{transcript}</div>}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><h3 style={{ borderBottom: '2px solid #60a5fa' }}>Punta Once</h3>{renderCajon(0, 'Cajón 1')}{renderCajon(1, 'Cajón 2')}</div>
                <div><h3 style={{ borderBottom: '2px solid #60a5fa' }}>Punta Moreno</h3>{renderCajon(2, 'Cajón 1')}{renderCajon(3, 'Cajón 2')}</div>
            </div>

            <div style={{ backgroundColor: '#1f2937', padding: '15px', borderRadius: '10px', marginTop: '20px' }}>
                <h4 style={{ color: '#60a5fa', marginBottom: '5px' }}>REGISTRO DE CAMBIO DE BATERÍAS</h4>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '10px' }}>
                    Indiqué qué baterías o cajones se cambiaron y sus nombres/identificadores.
                </p>
                <textarea 
                    style={{ width: '100%', padding: '10px', backgroundColor: '#111827', color: 'white', border: '1px solid #4b5563', borderRadius: '5px', minHeight: '80px' }} 
                    placeholder="Ej: Se cambió el vaso 12 del Cajón 1 de Once..." 
                    value={cambiosRealizados.observaciones} 
                    onChange={(e) => setCambiosRealizados({ ...cambiosRealizados, observaciones: e.target.value })} 
                />
            </div>

            <button onClick={enviarReporte} style={{ marginTop: '20px', width: '100%', padding: '15px', backgroundColor: '#3b82f6', border: 'none', color: 'white', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer' }}>ENVIAR REPORTE</button>
        </div>
    );
}