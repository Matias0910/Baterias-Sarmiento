import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const generarDocPDF = (reporte) => {
        try {
            const esChina = reporte.tipo === 'china';
            const esQuincenal = reporte.frecuencia?.toLowerCase() === 'quincenal';
            const doc = new jsPDF(esChina ? 'l' : 'p');
            const colorTrenes = [0, 150, 214];

            doc.setFontSize(16);
            doc.text("INFORME DE MANTENIMIENTO BATERIAS", 20, 15);
            doc.setFontSize(10);
            doc.text(`Equipo: ${reporte.equipoId} | Fecha: ${new Date(reporte.fecha).toLocaleDateString()}`, 20, 22);
            const marcaOnce = reporte.marcasBaterias?.once || 'N/A';
            const marcaMoreno = reporte.marcasBaterias?.moreno || 'N/A';
            doc.text(`Marcas -> Once: ${marcaOnce} | Moreno: ${marcaMoreno}`, 20, 27);


            doc.text(`Frecuencia: ${reporte.frecuencia?.toUpperCase()}`, 20, 32);

            const shutOnce = reporte.tiempoApagado?.once || '-';
            const shutMoreno = reporte.tiempoApagado?.moreno || '-';
            doc.text(`Tiempo Apagado -> Once: ${shutOnce} min | Moreno: ${shutMoreno} min`, 20, 37);

            let currentY = 45;

            if (reporte.data?.v) {
                reporte.data.v.forEach((voltajes, idx) => {
                    const totalV = voltajes.reduce((acc, v) => acc + (parseFloat(v?.toString().replace(',', '.')) || 0), 0);
                    const resistencias = reporte.data.r ? reporte.data.r[idx] : [];
                    const sumR = resistencias.reduce((acc, r) => acc + (parseFloat(r?.toString().replace(',', '.')) || 0), 0);
                    const totalR = (esChina && voltajes.length === 25 && !esQuincenal) ? sumR / 2 : sumR;

                    const formatNum = (num) => num.toFixed(2).replace('.', ',');

                    doc.setFontSize(12);
                    const labelPunta = idx < 2 ? "Punta ONCE" : "Punta MORENO";
                    doc.text(`${labelPunta} - Cajón ${(idx % 2) + 1}`, 20, currentY);

                    if (esQuincenal) {
                        autoTable(doc, {
                            startY: currentY + 2,
                            head: [['Concepto', 'Total Voltaje (V)', 'Total Resistencia (R)']],
                            body: [['TOTALES', formatNum(totalV), formatNum(totalR)]],
                            theme: 'grid',
                            headStyles: { fillColor: colorTrenes }
                        });
                    } else {
                        if (esChina && voltajes.length === 25 && !esQuincenal) {
                            const gridBody = [];
                            for (let f = 0; f < 5; f++) {
                                const fila = [`Fila ${f + 1}`];
                                for (let c = 0; c < 5; c++) {
                                    const pos = f * 5 + c;
                                    const v = voltajes[pos] || '-';
                                    const r = resistencias[pos] || '-';
                                    fila.push(`${v}V | ${r}R`);
                                }
                                gridBody.push(fila);
                            }
                            // Fila de totales al final de la cuadrícula
                            gridBody.push([
                                { content: 'TOTALES', styles: { fontStyle: 'bold', halign: 'center' } },
                                { content: `V: ${formatNum(totalV)}V`, colSpan: 2, styles: { fontStyle: 'bold', halign: 'center' } },
                                { content: `R: ${formatNum(totalR)}R`, colSpan: 3, styles: { fontStyle: 'bold', halign: 'center' } }
                            ]);

                            autoTable(doc, {
                                startY: currentY + 2,
                                head: [['FILA / COL', '1', '2', '3', '4', '5']],
                                body: gridBody,
                                theme: 'grid',
                                headStyles: { fillColor: colorTrenes, halign: 'center' },
                                bodyStyles: { fontSize: 8, halign: 'center', cellPadding: 2 }
                            });
                        } else {
                            // Nuevo formato para baterías estándar (4 vasos) en formato horizontal
                            const head = [['', 'Vaso 1', 'Vaso 2', 'Vaso 3', 'Vaso 4', 'TOTAL']];
                            const body = [
                                ['Voltaje (V)', ...voltajes.map(v => v?.toString() || '0'), formatNum(totalV)],
                                ['Resist. (R)', ...resistencias.map(r => r?.toString() || '0'), formatNum(totalR)]
                            ];
                            autoTable(doc, { startY: currentY + 2, head, body, theme: 'grid', headStyles: { fillColor: colorTrenes, halign: 'center' }, bodyStyles: { halign: 'center' } });
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
                ? "Rangos: China (2.0V-2.4V, max 2.2 R) | Estándar (12.0V-14.0V, max 7.5 R)"
                : "Rangos aceptables (Estándar): Voltaje [12.0V - 14.0V] | Resistencia máx: 7.5 R";
            doc.text(notaRango, 20, doc.internal.pageSize.getHeight() - 10);
            doc.setTextColor(0); // Volver a negro

            return doc;
        } catch (error) {
            console.error("Error al generar PDF:", error);
            alert("Error al generar el PDF.");
            return null;
        }
};

export default function PlanillaPDF({ reporte }) {
    if (!reporte) return null;

    const getNombreArchivo = () => {
        const fechaFormateada = new Date(reporte.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
        return `RC ${reporte.equipoId || 'N_A'} ${fechaFormateada}.pdf`;
    };

    const verPDF = () => {
        const doc = generarDocPDF(reporte);
        if (doc) {
            doc.output('dataurlnewwindow', { filename: getNombreArchivo() });
        }
    };

    const descargarPDF = () => {
        const doc = generarDocPDF(reporte);
        if (doc) {
            doc.save(getNombreArchivo());
        }
    };

    return (
        <>
            <button 
                onClick={verPDF} 
                title="Ver PDF"
                style={{ padding: '8px 12px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
                Ver PDF
            </button>
            <button 
                onClick={descargarPDF} 
                title="Descargar PDF"
                style={{ padding: '8px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
                Descargar PDF
            </button>
        </>
    );
}