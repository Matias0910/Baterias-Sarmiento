import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function PlanillaPDF({ reporte }) {
    if (!reporte) return null;

    const generarPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("REGISTRO DE MANTENIMIENTO - TRENES ARGENTINOS", 20, 15);
        doc.setFontSize(10);
        doc.text(`Equipo: ${reporte.equipoId}`, 20, 25);
        doc.text(`Fecha: ${new Date(reporte.fecha).toLocaleDateString()}`, 140, 25);

        let startY = 40;
        reporte.data.v.forEach((voltajes, idx) => {
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