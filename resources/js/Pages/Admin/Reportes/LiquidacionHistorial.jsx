import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import ConfirmDialog from '@/Components/ConfirmDialog';

// ── jsPDF loader ──────────────────────────────────────────────────────────────
function loadJsPDF(cb) {
    if (window.jspdf?.jsPDF) { cb(window.jspdf.jsPDF); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = () => cb(window.jspdf.jsPDF);
    document.head.appendChild(s);
}

/**
 * Formatea una fecha que puede llegar en cualquiera de estos formatos:
 *   - '2026-03-26'                      (string date puro)
 *   - '2026-03-26T00:00:00.000000Z'     (ISO UTC serializado por Laravel Carbon)
 *   - '2026-03-26T05:00:00.000000Z'     (con offset)
 *
 * La solución: tomar solo la parte antes de la T (la fecha), parsear
 * los componentes manualmente y construir la fecha sin conversión de zona.
 * Así '2026-03-26T00:00:00.000000Z' nunca se convierte a '2026-03-25' por UTC-5.
 */
function fmtD(d) {
    if (!d) return '—';
    // Tomar solo la parte de fecha (antes de la T si la hay)
    const soloFecha = String(d).split('T')[0];
    const partes    = soloFecha.split('-');
    if (partes.length !== 3) return '—';
    const [anio, mes, dia] = partes.map(Number);
    if (!anio || !mes || !dia) return '—';
    // new Date(año, mes-1, día) crea la fecha en hora local sin UTC
    return new Date(anio, mes - 1, dia)
        .toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function exportarPDF(liquidaciones) {
    loadJsPDF((jsPDF) => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const W = doc.internal.pageSize.getWidth();
        const pink = [255, 20, 147], dark = [15, 15, 15], gray = [150, 150, 150];

        doc.setFillColor(...dark); doc.rect(0, 0, W, 26, 'F');
        doc.setFontSize(16); doc.setTextColor(...pink); doc.setFont('helvetica', 'bold');
        doc.text('PERSONAL BOX ARMENIA', 14, 11);
        doc.setFontSize(10); doc.setTextColor(...pink); doc.setFont('helvetica', 'bold');
        doc.text('HISTORIAL DE LIQUIDACIONES', 14, 20);
        doc.setFontSize(8); doc.setTextColor(...gray); doc.setFont('helvetica', 'normal');
        doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, W - 14, 20, { align: 'right' });

        const totalHistorico = liquidaciones.reduce((s, l) => s + parseFloat(l.total_pago), 0);
        doc.setFillColor(20, 20, 20); doc.roundedRect(14, 30, W - 28, 16, 3, 3, 'F');
        doc.setFontSize(8); doc.setTextColor(...gray);
        doc.text(`Total registros: ${liquidaciones.length}`, 20, 40);
        doc.setFontSize(11); doc.setTextColor(...pink); doc.setFont('helvetica', 'bold');
        doc.text(`Total histórico: ${fmt(totalHistorico)}`, W - 20, 40, { align: 'right' });

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
                doc.setTextColor(i === 5 ? pink[0] : 200, i === 5 ? pink[1] : 200, i === 5 ? pink[2] : 200);
                doc.text(String(val), cx + 2, y + 5.5);
                cx += colW[i];
            });
            y += 8;
        });

        doc.setFillColor(10, 10, 10); doc.rect(14, y, W - 28, 10, 'F');
        doc.setFontSize(9); doc.setTextColor(...pink); doc.setFont('helvetica', 'bold');
        doc.text(fmt(totalHistorico), W - 12, y + 7, { align: 'right' });
        doc.setFontSize(8); doc.setTextColor(...gray); doc.setFont('helvetica', 'normal');
        doc.text('TOTAL HISTÓRICO', W - 12 - 45, y + 7);

        doc.save(`historial_liquidaciones_${new Date().toISOString().split('T')[0]}.pdf`);
    });
}

function exportarExcel(liquidaciones) {
    import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs').then((XLSX) => {
        const fmt   = (n) => `$${new Intl.NumberFormat('es-CO').format(n ?? 0)}`;
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

function Icon({ name, size = 16 }) {
    const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
    const m = {
        pdf: <svg {...c}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
        excel: <svg {...c}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M10 9l4 6M14 9l-4 6"/></svg>,
        back: <svg {...c}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
        trash: <svg {...c}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    };
    return m[name] || null;
}

export default function LiquidacionHistorial({ auth, liquidaciones }) {
    const pink  = '#FF1493';
    const fmt   = (n) => `$${new Intl.NumberFormat('es-CO').format(n ?? 0)}`;
    const totalHistorico = liquidaciones.reduce((s, l) => s + parseFloat(l.total_pago), 0);

    const [confirmState, setConfirmState] = useState({
        open: false, title: '', message: '', confirmText: 'Confirmar', cancelText: 'Cancelar', onConfirm: null,
    });
    const openConfirm = (opts) => setConfirmState({ open: true, ...opts });
    const closeConfirm = () => setConfirmState((s) => ({ ...s, open: false }));

    const handleDelete = (id) => {
        openConfirm({
            title: 'Eliminar registro',
            message: '¿Eliminar este registro de liquidación? Esta acción no se puede deshacer.',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            onConfirm: () => router.delete(route('admin.reportes.liquidacion.historial.destroy', id)),
        });
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Historial de Liquidaciones" />

            <div className="rep-wrap">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: pink, margin: 0, textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>
                            HISTORIAL DE PAGOS
                        </h1>
                        <p style={{ color: '#999', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>
                            Registro de liquidaciones confirmadas a instructores
                        </p>
                    </div>

                    <div className="rep-actions">
                        {liquidaciones.length > 0 && (
                            <>
                                <span style={{ color: '#555', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Exportar historial:</span>
                                <button onClick={() => exportarPDF(liquidaciones)} className="rep-btn-soft"><Icon name="pdf" /> PDF</button>
                                <button onClick={() => exportarExcel(liquidaciones)} className="rep-btn-soft"><Icon name="excel" /> Excel</button>
                            </>
                        )}
                        <a href={route('admin.reportes.liquidacion')} className="rep-btn-soft">
                            <Icon name="back" /> Volver a liquidación
                        </a>
                    </div>
                </div>

                <div className="glass-card table-card">
                    <div className="table-scroll">
                        <table className="rep-table">
                            <thead style={{ background: 'rgba(255,20,147,0.1)' }}>
                            <tr>
                                {['Instructor', 'Período', 'Clases', 'Asistentes', 'Tipo Tarifa', 'Tarifa', 'Total Pagado', 'Fecha Pago', 'Notas', ''].map(h => (
                                    <th key={h} style={{ padding: '1rem', textAlign: 'left', color: '#FF1493', fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid rgba(255,20,147,0.3)', whiteSpace: 'nowrap' }}>
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
                                <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,20,147,0.18)' }}>
                                    <td style={{ padding: '1rem', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                        {l.instructor_nombre}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#999', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                        {fmtD(l.fecha_inicio)} — {fmtD(l.fecha_fin)}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#ccc', textAlign: 'center' }}>
                                        {l.total_clases}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#ccc', textAlign: 'center' }}>
                                        {l.total_asistentes}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#999', fontSize: '0.8rem' }}>
                                        {l.tipo_tarifa === 'por_asistente' ? 'Por asistente' : 'Por clase'}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#ccc', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                        {fmt(l.tarifa_aplicada)}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#FF1493', fontWeight: 900, fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
                                        {fmt(l.total_pago)}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#ccc', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                        {fmtD(l.fecha_pago)}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#666', fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {l.notas || '—'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            onClick={() => handleDelete(l.id)}
                                            className="rep-btn-del"
                                        >
                                            <Icon name="trash" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                            {liquidaciones.length > 0 && (
                                <tfoot>
                                    <tr style={{ background: 'rgba(255,20,147,0.08)' }}>
                                        <td colSpan={6} style={{ padding: '1rem', color: '#FF1493', fontWeight: 900, textAlign: 'right', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.85rem' }}>
                                            Total Histórico
                                        </td>
                                        <td style={{ padding: '1rem', color: '#FF1493', fontWeight: 900, fontSize: '1.25rem' }}>
                                            {fmt(totalHistorico)}
                                        </td>
                                        <td colSpan={3} />
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={confirmState.confirmText}
                cancelText={confirmState.cancelText}
                onConfirm={confirmState.onConfirm}
                onClose={closeConfirm}
            />

            <style>{`
                .rep-wrap { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }

                .glass-card {
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(22px);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-top: 1px solid rgba(255,255,255,0.12);
                    border-radius: 16px;
                    box-shadow: 0 0 28px rgba(255,20,147,0.08), 0 8px 32px rgba(0,0,0,0.45);
                }

                .table-card { overflow: hidden; }
                .table-scroll { overflow-x: auto; }
                .rep-table { width: 100%; min-width: 1200px; border-collapse: collapse; }

                .rep-actions { display:flex; gap:.75rem; align-items:center; flex-wrap:wrap; }
                .rep-btn-soft {
                    display:inline-flex; align-items:center; gap:.5rem;
                    background: rgba(255,20,147,0.1); border:2px solid rgba(255,20,147,0.5);
                    color:#FF1493; padding:.5rem 1rem; border-radius:8px; font-weight:700; font-size:.8rem; text-decoration:none; cursor:pointer;
                }
                .rep-btn-del {
                    display:inline-flex; align-items:center; justify-content:center;
                    background: rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.4);
                    color:#ef4444; padding:.4rem .65rem; border-radius:6px; cursor:pointer;
                }

                @media (max-width: 768px) {
                    .rep-wrap { gap: 1rem; }
                    .rep-actions { width:100%; }
                    .rep-btn-soft { width:100%; justify-content:center; }
                }
            `}</style>
        </DashboardLayout>
    );
}
