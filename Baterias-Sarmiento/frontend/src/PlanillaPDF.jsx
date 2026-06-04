import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function PlanillaPDF({ reporte }) {
    if (!reporte) return null;

   // ... (mantené tus importaciones y el inicio igual)

    const generarPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("REGISTRO DE MANTENIMIENTO - TRENES ARGENTINOS", 20, 15);
        
        // --- CABECERA CON DATOS COMPLETOS ---
        // --- CABECERA CON DATOS EN TU ORDEN (ONCE / MORENO) ---
        doc.setFontSize(10);
        doc.text(`Equipo: ${reporte.equipoId}`, 20, 25);
        doc.text(`Fecha: ${new Date(reporte.fecha).toLocaleDateString()}`, 140, 25);
        
        // AHORA VA PRIMERO ONCE Y DESPUÉS MORENO
        doc.text(`Tiempo Apagado Once: ${reporte.tiempoApagado?.once || 0} min`, 20, 30);
        doc.text(`Tiempo Apagado Moreno: ${reporte.tiempoApagado?.moreno || 0} min`, 140, 30);
        
        if (reporte.tipo === 'china' && reporte.bateriasChinas > 0) {
            doc.text(`Cant. Baterías Chinas: ${reporte.bateriasChinas}`, 20, 35);
        }

        let startY = 45; // Bajamos un poquito la tabla para que no pise los textos
        
        reporte.data.v.forEach((voltajes, idx) => {
            if (startY > 250) {
                doc.addPage();
                startY = 20;
            }
            doc.text(`Cajón ${idx + 1}`, 20, startY - 5);
            doc.autoTable({
                startY: startY,
                head: [['Vaso', 'Voltaje (V)', 'Resistencia (mΩ)']],
                body: voltajes.map((v, i) => [i + 1, v, reporte.data.r[idx][i] || '0']),
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185] }
            });
            startY = doc.lastAutoTable.finalY + 10;
        });

        // --- SECCIÓN CAMBIOS BATERÍAS ---
        if (reporte.cambiosRealizados) {
            doc.setFontSize(12);
            doc.text("REGISTRO DE CAMBIOS DE BATERÍAS:", 20, startY);
            startY += 8;
            
            const cajonesCambiados = [1, 2, 3, 4].filter(num => reporte.cambiosRealizados[`cajon${num}`]);
            doc.setFontSize(10);
            doc.text(`Cajones con cambios: ${cajonesCambiados.length > 0 ? cajonesCambiados.join(', ') : "Ninguno"}`, 20, startY);
            startY += 7;
            doc.text(`Detalle: ${reporte.cambiosRealizados.observaciones || "Sin detalle"}`, 20, startY);
        }

        doc.save(`Reporte_${reporte.equipoId}.pdf`);
    };

    const enviarPorWhatsApp = () => {
        const mensaje = encodeURIComponent(`Hola, envío el informe de mantenimiento del coche ${reporte.equipoId} con fecha ${new Date(reporte.fecha).toLocaleDateString()}.`);
        window.open(`https://wa.me/?text=${mensaje}`, '_blank');
    };

    return (
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
            <button 
                onClick={generarPDF} 
                title="Descargar PDF"
                style={{ padding: '5px 8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
            >
                📄 PDF
            </button>
            <button 
                onClick={enviarPorWhatsApp} 
                title="Enviar por WhatsApp"
                style={{ padding: '5px 8px', backgroundColor: '#25d366', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
            >
                💬 WA
            </button>
        </div>
    );
}