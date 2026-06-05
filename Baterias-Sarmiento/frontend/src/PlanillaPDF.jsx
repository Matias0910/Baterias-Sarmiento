import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PlanillaPDF({ reporte }) {
    if (!reporte) return null;

    const generarPDF = () => {
        try {
            const esChina = reporte.tipo === 'china';
            const esQuincenal = reporte.frecuencia?.toLowerCase() === 'quincenal';
            const doc = new jsPDF(esChina ? 'l' : 'p');
            const colorTrenes = [0, 150, 214];

            doc.setFontSize(16);
            doc.text("INFORME DE MANTENIMIENTO BATERIAS", 20, 15);
            doc.setFontSize(10);
            doc.text(`Equipo: ${reporte.equipoId} | Fecha: ${new Date(reporte.fecha).toLocaleDateString()}`, 20, 22);
            doc.text(`Tipo: ${esChina ? 'Batería CHINA' : 'Batería ESTÁNDAR'}`, 20, 27);

            let currentY = 40;

            if (reporte.data?.v) {
                reporte.data.v.forEach((voltajes, idx) => {
                    const totalV = voltajes.reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
                    const resistencias = reporte.data.r ? reporte.data.r[idx] : [];
                    const totalR = resistencias.reduce((acc, r) => acc + (parseFloat(r) || 0), 0);

                    doc.setFontSize(12);
                    doc.text(`Cajón ${idx + 1}`, 20, currentY);

                    if (esQuincenal) {
                        autoTable(doc, {
                            startY: currentY + 2,
                            head: [['Concepto', 'Total Voltaje (V)', 'Total Resistencia (R)']],
                            body: [['TOTALES', totalV.toFixed(2), totalR.toFixed(2)]],
                            theme: 'grid',
                            headStyles: { fillColor: colorTrenes }
                        });
                    } else {
                        if (esChina) {
                            const head = [['Vaso', ...voltajes.map((_, i) => i + 1), 'TOTAL']];
                            const body = [
                                ['Voltaje (V)', ...voltajes, totalV.toFixed(2)],
                                ['Resist. (R)', ...resistencias, totalR.toFixed(2)]
                            ];
                            autoTable(doc, { startY: currentY + 2, head, body, theme: 'grid', headStyles: { fillColor: colorTrenes } });
                        } else {
                            const body = voltajes.map((v, i) => [i + 1, v || '0', resistencias[i] || '0']);
                            body.push([{ content: 'TOTAL', styles: { fontStyle: 'bold' } }, totalV.toFixed(2), totalR.toFixed(2)]);
                            autoTable(doc, { startY: currentY + 2, head: [['Vaso', 'Voltaje (V)', 'Resistencia (R)']], body, theme: 'grid', headStyles: { fillColor: colorTrenes } });
                        }
                    }
                    currentY = doc.lastAutoTable.finalY + 10;
                });
            }

const observaciones = reporte.cambiosRealizados?.observaciones?.trim();
const textoCambios = observaciones && observaciones !== "" ? observaciones : "Sin cambios registrados";

doc.setFontSize(14);
doc.text("CAMBIO DE BATERIAS", 20, currentY);
doc.setFontSize(10);
const splitTexto = doc.splitTextToSize(textoCambios, esChina ? 250 : 170);
doc.text(splitTexto, 20, currentY + 10);

            doc.save(`Reporte_${reporte.equipoId}.pdf`);
        } catch (error) {
            console.error("Error al generar PDF:", error);
            alert("Error al generar el PDF.");
        }
    };

    return <button onClick={generarPDF} style={{ padding: '10px', backgroundColor: '#0096d6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>📄 PDF</button>;
}