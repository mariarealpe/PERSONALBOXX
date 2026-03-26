import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

// ── jsPDF loader ──────────────────────────────────────────────────────────────
function loadJsPDF(cb) {
    if (window.jspdf?.jsPDF) { cb(window.jspdf.jsPDF); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = () => cb(window.jspdf.jsPDF);
    document.head.appendChild(s);
}

function exportarPDF(liquidaciones) {
    loadJsPDF((jsPDF) => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const W = doc.internal.pageSize.getWidth();
        const pink = [255, 20, 147], dark = [15, 15, 15], gray = [150, 150, 150], green = [34, 197, 94];
        const fmt  = (n) => `$${new Intl.NumberFormat('es-CO').format(n ?? 0)}`;
        const fmtD = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

        // Header
        doc.setFillColor(...dark); doc.rect(0, 0, W, 26, 'F');
        doc.setFontSize(16); doc.setTextColor(...pink); doc.setFont('helvetica', 'bold');
        doc.text('PERSONAL BOX ARMENIA', 14, 11);
        doc.setFontSize(10); doc.setTextColor(...green); doc.setFont('helvetica', 'bold');
        doc.text('HISTORIAL DE LIQUIDACIONES', 14, 20);
        doc.setFontSize(8); doc.setTextColor(...gray); doc.setFont('helvetica', 'normal');
        doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, W - 14, 20, { align: 'right' });

        // Totales rápidos
        const totalHistorico = liquidaciones.reduce((s, l) => s + parseFloat(l.total_pago), 0);
        doc.setFillColor(20, 20, 20); doc.roundedRect(14, 30, W - 28, 16, 3, 3, 'F');
        doc.setFontSize(8); doc.setTextColor(...gray);
        doc.text(`Total registros: ${liquidaciones.length}`, 20, 40);
        doc.setFontSize(11); doc.setTextColor(...green); doc.setFont('helvetica', 'bold');
        doc.text(`Total histórico: ${fmt(totalHistorico)}`, W - 20, 40, { align: 'right' });

        // Tabla
        const headers = ['Instructor', 'Período', 'Clases', 'Asistentes', 'Tarifa', 'Total Pagado', 'Fecha Pago'];
        const colW    = [40, 42, 16, 22, 30, 38, 30];
        let y = 52;

        doc.setFillColor(...pink); doc.rect(14, y, W - 28, 8, 'F');
        doc.setFontSize(7); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
        let cx = 14;
        headers.forEach((h, i) => { doc.text(h, cx + 2, y + 5.5); cx += colW[i]; });

        y += 8;
        liquidaciones.forEach((l, idx) => {
            if (y > 185) { doc.addPage(); y = 14; }
            doc.setFillColor(idx % 2 === 0 ? 20 : 12, idx % 2 === 0 ? 20 : 12, idx % 2 === 0 ? 20 : 12);
            doc.rect(14, y, W - 28, 8, 'F');

            const row = [
                l.instructor_nombre,
                `${fmtD(l.fecha_inicio)} – ${fmtD(l.fecha_fin)}`,
                l.total_clases,
                l.total_asistentes,
                `${l.tipo_tarifa === 'por_asistente' ? 'x asist.' : 'fija'} ${fmt(l.tarifa_aplicada)}`,
                fmt(l.total_pago),
                fmtD(l.fecha_pago),
            ];

            doc.setFont('helvetica', 'normal'); doc.setFontSize(7); cx = 14;
            row.forEach((val, i) => {
                doc.setTextColor(i === 5 ? green[0] : 200, i === 5 ? green[1] : 200, i === 5 ? green[2] : 200);
                doc.text(String(val), cx + 2, y + 5.5);
                cx += colW[i];
            });
            y += 8;
        });

        // Total final
        doc.setFillColor(10, 10, 10); doc.rect(14, y, W - 28, 10, 'F');
        doc.setFontSize(9); doc.setTextColor(...green); doc.setFont('helvetica', 'bold');
        doc.text(fmt(totalHistorico), W - 12, y + 7, { align: 'right' });
        doc.setFontSize(8); doc.setTextColor(...gray); doc.setFont('helvetica', 'normal');
        doc.text('TOTAL HISTÓRICO', W - 12 - 45, y + 7);

        doc.save(`historial_liquidaciones_${new Date().toISOString().split('T')[0]}.pdf`);
    });
}

function exportarExcel(liquidaciones) {
    import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs').then((XLSX) => {
        const fmt  = (n) => `$${new Intl.NumberFormat('es-CO').format(n ?? 0)}`;
        const fmtD = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-CO') : '—';
        const total = liquidaciones.reduce((s, l) => s + parseFloat(l.total_pago), 0);

        const rows = [
            ['PERSONAL BOX ARMENIA — HISTORIAL DE LIQUIDACIONES'],
            [`Generado: ${new Date().toLocaleString('es-CO')}`],
            [`Total registros: ${liquidaciones.length}`, '', '', '', '', `Total histórico: ${fmt(total)}`],
            [],
            ['Instructor', 'Período inicio', 'Período fin', 'Clases', 'Asistentes', 'Tipo tarifa', 'Tarifa aplicada', 'Total pagado', 'Fecha pago', 'Notas'],
            ...liquidaciones.map(l => [
                l.instructor_nombre,
                fmtD(l.fecha_inicio),
                fmtD(l.fecha_fin),
                l.total_clases,
                l.total_asistentes,
                l.tipo_tarifa === 'por_asistente' ? 'Por asistente' : 'Por clase',
                fmt(l.tarifa_aplicada),
                fmt(l.total_pago),
                fmtD(l.fecha_pago),
                l.notas || '—',
            ]),
            [],
            ['', '', '', '', '', '', '', fmt(total), '', ''],
        ];

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [22, 14, 14, 8, 12, 16, 18, 18, 14, 30].map(w => ({ wch: w }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Historial');
        XLSX.writeFile(wb, `historial_liquidaciones_${new Date().toISOString().split('T')[0]}.xlsx`);
    });
}

export default function LiquidacionHistorial({ auth, liquidaciones }) {
    const green = '#22c55e';
    const fmt   = (n) => `$${new Intl.NumberFormat('es-CO').format(n ?? 0)}`;
    const fmtD  = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const totalHistorico = liquidaciones.reduce((s, l) => s + parseFloat(l.total_pago), 0);

    const handleDelete = (id) => {
        if (confirm('¿Eliminar este registro de liquidación?')) {
            router.delete(route('admin.reportes.liquidacion.historial.destroy', id));
        }
    };

    const boxStyle = {
        background: 'rgba(10,10,10,0.95)',
        border: `2px solid ${green}44`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: `0 0 20px ${green}10`,
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Historial de Liquidaciones" />

            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: green, margin: 0, textShadow: `0 0 10px ${green}80` }}>
                            HISTORIAL DE PAGOS
                        </h1>
                        <p style={{ color: '#999', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>
                            Registro de liquidaciones confirmadas a instructores
                        </p>
                    </div>

                    {/* ── RF-17: Botones de exportación ── */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {liquidaciones.length > 0 && (
                            <>
                                <span style={{ color: '#555', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Exportar historial:</span>
                                <button
                                    onClick={() => exportarPDF(liquidaciones)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.5)', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                >
                                    📄 PDF
                                </button>
                                <button
                                    onClick={() => exportarExcel(liquidaciones)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: `rgba(34,197,94,0.1)`, border: `2px solid rgba(34,197,94,0.5)`, color: green, padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(34,197,94,0.25)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}
                                >
                                    📊 Excel
                                </button>
                            </>
                        )}
                        <a
                            href={route('admin.reportes.liquidacion')}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: `rgba(34,197,94,0.1)`, border: `2px solid ${green}55`, color: green, padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}
                        >
                            ← Volver a Liquidación
                        </a>
                    </div>
                </div>

                <div style={boxStyle}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: `${green}18` }}>
                        <tr>
                            {['Instructor', 'Período', 'Clases', 'Asistentes', 'Tipo Tarifa', 'Tarifa', 'Total Pagado', 'Fecha Pago', 'Notas', ''].map(h => (
                                <th key={h} style={{ padding: '1rem', textAlign: 'left', color: green, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: `2px solid ${green}33`, whiteSpace: 'nowrap' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {liquidaciones.length === 0 ? (
                            <tr>
                                <td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: '#555' }}>
                                    No hay liquidaciones registradas aún
                                </td>
                            </tr>
                        ) : liquidaciones.map((l) => (
                            <tr key={l.id} style={{ borderBottom: `1px solid ${green}18` }}>
                                <td style={{ padding: '1rem', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>{l.instructor_nombre}</td>
                                <td style={{ padding: '1rem', color: '#999', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{fmtD(l.fecha_inicio)} — {fmtD(l.fecha_fin)}</td>
                                <td style={{ padding: '1rem', color: '#ccc', textAlign: 'center' }}>{l.total_clases}</td>
                                <td style={{ padding: '1rem', color: '#ccc', textAlign: 'center' }}>{l.total_asistentes}</td>
                                <td style={{ padding: '1rem', color: '#999', fontSize: '0.8rem' }}>
                                    {l.tipo_tarifa === 'por_asistente' ? '👥 Por asistente' : '💼 Por clase'}
                                </td>
                                <td style={{ padding: '1rem', color: '#ccc', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{fmt(l.tarifa_aplicada)}</td>
                                <td style={{ padding: '1rem', color: green, fontWeight: 900, fontSize: '1.1rem', whiteSpace: 'nowrap' }}>{fmt(l.total_pago)}</td>
                                <td style={{ padding: '1rem', color: '#ccc', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{fmtD(l.fecha_pago)}</td>
                                <td style={{ padding: '1rem', color: '#666', fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.notas || '—'}</td>
                                <td style={{ padding: '1rem' }}>
                                    <button
                                        onClick={() => handleDelete(l.id)}
                                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '0.4rem 0.75rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                        {liquidaciones.length > 0 && (
                            <tfoot>
                            <tr style={{ background: `${green}12` }}>
                                <td colSpan={6} style={{ padding: '1rem', color: green, fontWeight: 900, textAlign: 'right', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.85rem' }}>
                                    Total Histórico
                                </td>
                                <td style={{ padding: '1rem', color: green, fontWeight: 900, fontSize: '1.25rem' }}>
                                    {fmt(totalHistorico)}
                                </td>
                                <td colSpan={3} />
                            </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
