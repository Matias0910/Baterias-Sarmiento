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
            doc.text(`Tipo: ${esChina ? 'Batería CHINA/ESTANDAR' : 'Batería ESTÁNDAR'}`, 20, 27);

            let currentY = 40;

            if (reporte.data?.v) {
                reporte.data.v.forEach((voltajes, idx) => {
                    const totalV = voltajes.reduce((acc, v) => acc + (parseFloat(v?.toString().replace(',', '.')) || 0), 0);
                    const resistencias = reporte.data.r ? reporte.data.r[idx] : [];
                    const totalR = resistencias.reduce((acc, r) => acc + (parseFloat(r?.toString().replace(',', '.')) || 0), 0);

                    const formatNum = (num) => num.toFixed(2).replace('.', ',');

                    doc.setFontSize(12);
                    const labelPunta = idx < 2 ? "Punta ONCE" : "Punta MORENO";
                    doc.text(`${labelPunta} - Cajón ${idx + 1}`, 20, currentY);

                    if (esQuincenal) {
                        autoTable(doc, {
                            startY: currentY + 2,
                            head: [['Concepto', 'Total Voltaje (V)', 'Total Resistencia (R)']],
                            body: [['TOTALES', formatNum(totalV), formatNum(totalR)]],
                            theme: 'grid',
                            headStyles: { fillColor: colorTrenes }
                        });
                    } else {
                        if (esChina) {
                            const head = [['Vaso', ...voltajes.map((_, i) => i + 1), 'TOTAL']];
                            const body = [
                                ['Voltaje (V)', ...voltajes.map(v => v?.toString() || '0'), formatNum(totalV)],
                                ['Resist. (R)', ...resistencias.map(r => r?.toString() || '0'), formatNum(totalR)]
                            ];
                            autoTable(doc, { startY: currentY + 2, head, body, theme: 'grid', headStyles: { fillColor: colorTrenes } });
                        } else {
                            const body = voltajes.map((v, i) => [i + 1, v?.toString() || '0', resistencias[i]?.toString() || '0']);
                            body.push([{ content: 'TOTAL', styles: { fontStyle: 'bold' } }, formatNum(totalV), formatNum(totalR)]);
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

            doc.setFontSize(9);
            doc.setTextColor(100);
            const notaRango = reporte.tipo === 'china' 
                ? "Rangos aceptables (China): Voltaje [1.9V - 2.4V] | Resistencia máx: 2.2 mΩ"
                : "Rangos aceptables (Estándar): Voltaje [11.4V - 14,4V] | Resistencia máx: 7.5 mΩ";
            doc.text(notaRango, 20, doc.internal.pageSize.getHeight() - 10);
            doc.setTextColor(0); // Volver a negro

            doc.save(`Reporte_${reporte.equipoId}.pdf`);
        } catch (error) {
            console.error("Error al generar PDF:", error);
            alert("Error al generar el PDF.");
        }
    };

    return <button onClick={generarPDF} style={{ padding: '10px', backgroundColor: '#0096d6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>📄 PDF</button>;
}