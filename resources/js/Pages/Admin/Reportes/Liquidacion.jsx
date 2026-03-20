import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';

function loadJsPDF(callback) {
    if (window.jspdf && window.jspdf.jsPDF) { callback(window.jspdf.jsPDF); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = () => callback(window.jspdf.jsPDF);
    document.head.appendChild(s);
}

function exportarPDF(instructor, clases, totalPago, tarifas, filters) {
    loadJsPDF((jsPDF) => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const W = doc.internal.pageSize.getWidth();
        const green = [34, 197, 94], dark = [15, 15, 15], gray = [150, 150, 150];
        const fmt  = (n) => `$${new Intl.NumberFormat('es-CO').format(n ?? 0)}`;
        const fmtD = (d) => d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—';

        doc.setFillColor(...dark); doc.rect(0, 0, W, 30, 'F');
        doc.setFontSize(18); doc.setTextColor(255, 20, 147); doc.setFont('helvetica', 'bold');
        doc.text('PERSONAL BOX ARMENIA', 14, 13);
        doc.setFontSize(10); doc.setTextColor(...green); doc.setFont('helvetica', 'bold');
        doc.text('LIQUIDACIÓN DE INSTRUCTOR', 14, 22);
        doc.setFontSize(8); doc.setTextColor(...gray); doc.setFont('helvetica', 'normal');
        doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, W - 14, 22, { align: 'right' });

        let y = 40;
        doc.setFillColor(20, 20, 20); doc.roundedRect(14, y, W - 28, 28, 3, 3, 'F');
        doc.setFontSize(13); doc.setTextColor(...green); doc.setFont('helvetica', 'bold');
        doc.text(instructor.name, 20, y + 8);
        doc.setFontSize(8); doc.setTextColor(...gray); doc.setFont('helvetica', 'normal');
        doc.text(`Período: ${filters.fecha_inicio} al ${filters.fecha_fin}`, 20, y + 15);
        doc.text(`Tarifa por clase: ${fmt(tarifas.por_clase)}   |   Tarifa por asistente: ${fmt(tarifas.por_asistente)}   |   Clases: ${clases.length}`, 20, y + 22);

        y += 35;
        doc.setFillColor(...dark); doc.roundedRect(14, y, W - 28, 20, 3, 3, 'F');
        doc.setDrawColor(...green); doc.setLineWidth(0.5); doc.roundedRect(14, y, W - 28, 20, 3, 3, 'S');
        doc.setFontSize(9); doc.setTextColor(...gray); doc.text('TOTAL A PAGAR', 20, y + 8);
        doc.setFontSize(18); doc.setTextColor(...green); doc.setFont('helvetica', 'bold');
        doc.text(fmt(totalPago), W - 20, y + 14, { align: 'right' });

        y += 28;
        const headers = ['#', 'Fecha', 'Tipo de Clase', 'Asistentes', 'Tarifa Aplicada', 'Pago'];
        const colW    = [10, 38, 50, 22, 50, 28];
        doc.setFillColor(...green); doc.rect(14, y, W - 28, 8, 'F');
        doc.setFontSize(7); doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'bold');
        let cx = 14;
        headers.forEach((h, i) => { doc.text(h, cx + 2, y + 5.5); cx += colW[i]; });

        y += 8;
        clases.forEach((c, idx) => {
            if (y > 265) { doc.addPage(); y = 14; }
            doc.setFillColor(idx % 2 === 0 ? 20 : 10, idx % 2 === 0 ? 20 : 10, idx % 2 === 0 ? 20 : 10);
            doc.rect(14, y, W - 28, 8, 'F');
            const row = [idx + 1, fmtD(c.fecha_hora_inicio), c.tipo_clase?.nombre || '—', c.asistencias_count,
                tarifas.por_asistente > 0 ? `${c.asistencias_count} × ${fmt(tarifas.por_asistente)}` : 'Fija', fmt(c.pago)];
            doc.setFont('helvetica', 'normal'); doc.setFontSize(7); cx = 14;
            row.forEach((val, i) => {
                if (i === 5) { doc.setTextColor(...green); } else { doc.setTextColor(200, 200, 200); }
                doc.text(String(val), cx + 2, y + 5.5); cx += colW[i];
            });
            y += 8;
        });

        doc.setFillColor(...dark); doc.rect(14, y, W - 28, 10, 'F');
        doc.setFontSize(9); doc.setTextColor(...green); doc.setFont('helvetica', 'bold');
        doc.text(fmt(totalPago), W - 12, y + 7, { align: 'right' });

        y += 30;
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setDrawColor(...gray);
        doc.line(20, y, 90, y); doc.line(W - 90, y, W - 20, y);
        doc.setFontSize(8); doc.setTextColor(...gray); doc.setFont('helvetica', 'normal');
        doc.text('Firma Administrador', 55, y + 6, { align: 'center' });
        doc.text('Firma Instructor', W - 55, y + 6, { align: 'center' });

        doc.save(`liquidacion_${instructor.name.replace(/\s+/g, '_')}_${filters.fecha_inicio}_${filters.fecha_fin}.pdf`);
    });
}

function exportarExcel(instructor, clases, totalPago, tarifas, filters) {
    import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs').then((XLSX) => {
        const fmt  = (n) => `$${new Intl.NumberFormat('es-CO').format(n ?? 0)}`;
        const fmtD = (d) => d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—';
        const rows = [
            ['PERSONAL BOX ARMENIA — LIQUIDACIÓN DE INSTRUCTOR'],
            [`Instructor: ${instructor.name}`],
            [`Período: ${filters.fecha_inicio} al ${filters.fecha_fin}`],
            [`Tarifa por clase: ${fmt(tarifas.por_clase)}`, '', `Tarifa por asistente: ${fmt(tarifas.por_asistente)}`],
            [`Generado: ${new Date().toLocaleString('es-CO')}`],
            [], ['TOTAL A PAGAR', fmt(totalPago)], [],
            ['#', 'Fecha', 'Tipo de Clase', 'Asistentes', 'Tarifa Aplicada', 'Pago'],
            ...clases.map((c, i) => [i + 1, fmtD(c.fecha_hora_inicio), c.tipo_clase?.nombre || '—', c.asistencias_count,
                tarifas.por_asistente > 0 ? `${c.asistencias_count} × ${fmt(tarifas.por_asistente)}` : 'Fija por clase', fmt(c.pago)]),
            [], ['', '', '', '', 'TOTAL', fmt(totalPago)],
        ];
        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [5, 25, 28, 14, 28, 18].map(w => ({ wch: w }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Liquidación');
        XLSX.writeFile(wb, `liquidacion_${instructor.name.replace(/\s+/g, '_')}_${filters.fecha_inicio}_${filters.fecha_fin}.xlsx`);
    });
}

// ── Modal para registrar pago ─────────────────────────────────────────────────
function ModalPago({ instructor, clases, totalPago, tarifas, filters, onClose }) {
    const green = '#22c55e';
    const fmt   = (n) => `$${new Intl.NumberFormat('es-CO').format(n ?? 0)}`;
    const tipoTarifa = tarifas.por_asistente > 0 ? 'por_asistente' : 'por_clase';
    const tarifaAplicada = tipoTarifa === 'por_asistente' ? tarifas.por_asistente : tarifas.por_clase;

    const { data, setData, post, processing, errors } = useForm({
        instructor_id:    instructor.id,
        fecha_inicio:     filters.fecha_inicio,
        fecha_fin:        filters.fecha_fin,
        total_clases:     clases.length,
        total_asistentes: clases.reduce((s, c) => s + (c.asistencias_count || 0), 0),
        tipo_tarifa:      tipoTarifa,
        tarifa_aplicada:  tarifaAplicada,
        total_pago:       totalPago,
        fecha_pago:       new Date().toISOString().split('T')[0],
        notas:            '',
    });

    const inputStyle = { width: '100%', padding: '0.65rem', background: '#000', border: `2px solid ${green}44`, borderRadius: 8, color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', color: green, fontSize: '0.68rem', fontWeight: 700, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#0a0a0a', border: `2px solid ${green}55`, borderRadius: 16, padding: '2rem', maxWidth: 480, width: '100%', boxShadow: `0 0 40px ${green}30` }}>
                <h2 style={{ color: green, fontWeight: 900, margin: '0 0 0.5rem', fontSize: '1.25rem' }}>✅ Registrar Pago</h2>
                <p style={{ color: '#666', fontSize: '0.8rem', margin: '0 0 1.5rem' }}>Instructor: <strong style={{ color: '#fff' }}>{instructor.name}</strong></p>

                <div style={{ background: '#111', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#999', fontSize: '0.8rem' }}>Total a registrar</span>
                    <span style={{ color: green, fontWeight: 900, fontSize: '1.5rem' }}>{fmt(totalPago)}</span>
                </div>

                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Fecha de Pago *</label>
                        <input type="date" value={data.fecha_pago} onChange={e => setData('fecha_pago', e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Notas (opcional)</label>
                        <textarea value={data.notas} onChange={e => setData('notas', e.target.value)} rows={3}
                                  placeholder="Ej: Pago por transferencia, comprobante #123..."
                                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ background: 'transparent', border: '2px solid #444', color: '#999', padding: '0.6rem 1.2rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
                        Cancelar
                    </button>
                    <button onClick={() => post(route('admin.reportes.liquidacion.historial.store'))} disabled={processing}
                            style={{ background: `linear-gradient(135deg,${green},#16a34a)`, border: 'none', color: '#000', padding: '0.6rem 1.5rem', borderRadius: 8, cursor: 'pointer', fontWeight: 900, opacity: processing ? 0.6 : 1 }}>
                        {processing ? 'Guardando...' : '💾 Confirmar Pago'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Liquidacion({ auth, instructor, clases, totalPago, tarifas, instructores, filters }) {
    const [modalAbierto, setModalAbierto] = useState(false);
    const { data, setData, get, processing } = useForm({
        instructor_id: filters?.instructor_id || '',
        fecha_inicio:  filters?.fecha_inicio  || new Date().toISOString().split('T')[0],
        fecha_fin:     filters?.fecha_fin     || new Date().toISOString().split('T')[0],
    });

    const handleSubmit = (e) => { e.preventDefault(); get(route('admin.reportes.liquidacion')); };

    const fmt = (n) => `$${new Intl.NumberFormat('es-CO').format(n ?? 0)}`;
    const formatDate = (d) => d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '-';
    const green = '#22c55e';

    const inputStyle = { width: '100%', padding: '0.75rem', background: '#000', border: `2px solid ${green}44`, borderRadius: 8, color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', color: green, fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 };
    const boxStyle   = { background: 'rgba(10,10,10,0.95)', border: `2px solid ${green}44`, borderRadius: 12, padding: '1.5rem', boxShadow: `0 0 20px ${green}10` };
    const exportFilters = filters || { fecha_inicio: data.fecha_inicio, fecha_fin: data.fecha_fin };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Liquidación de Instructores" />

            {modalAbierto && instructor && (
                <ModalPago
                    instructor={instructor}
                    clases={clases}
                    totalPago={totalPago}
                    tarifas={tarifas}
                    filters={exportFilters}
                    onClose={() => setModalAbierto(false)}
                />
            )}

            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: green, margin: 0, textShadow: `0 0 10px ${green}80` }}>LIQUIDACIÓN</h1>
                        <p style={{ color: '#999', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Cálculo de pagos a instructores</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Historial */}
                        <a href={route('admin.reportes.liquidacion.historial')}
                           style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', border: '2px solid rgba(99,102,241,0.5)', color: '#818cf8', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>
                            📋 Ver Historial
                        </a>
                        {instructor && clases.length > 0 && (
                            <>
                                <span style={{ color: '#444', fontSize: '0.75rem' }}>Exportar:</span>
                                <button onClick={() => exportarPDF(instructor, clases, totalPago, tarifas, exportFilters)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.5)', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                                    📄 PDF
                                </button>
                                <button onClick={() => exportarExcel(instructor, clases, totalPago, tarifas, exportFilters)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: `rgba(34,197,94,0.1)`, border: `2px solid rgba(34,197,94,0.5)`, color: green, padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(34,197,94,0.25)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}>
                                    📊 Excel
                                </button>
                                <button onClick={() => setModalAbierto(true)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: `linear-gradient(135deg,${green},#16a34a)`, border: 'none', color: '#000', padding: '0.5rem 1.25rem', borderRadius: 8, cursor: 'pointer', fontWeight: 900, fontSize: '0.85rem' }}>
                                    ✅ Marcar como Pagado
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Filtros */}
                <form onSubmit={handleSubmit} style={{ ...boxStyle, marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                    <div>
                        <label style={labelStyle}>Instructor *</label>
                        <select value={data.instructor_id} onChange={e => setData('instructor_id', e.target.value)} required style={{ ...inputStyle, color: data.instructor_id ? '#fff' : '#666' }}>
                            <option value="">-- Seleccionar --</option>
                            {instructores.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </div>
                    <div><label style={labelStyle}>Fecha Inicio *</label><input type="date" value={data.fecha_inicio} onChange={e => setData('fecha_inicio', e.target.value)} required style={inputStyle} /></div>
                    <div><label style={labelStyle}>Fecha Fin *</label><input type="date" value={data.fecha_fin} onChange={e => setData('fecha_fin', e.target.value)} required style={inputStyle} /></div>
                    <button type="submit" disabled={processing} style={{ background: `linear-gradient(135deg,${green},#16a34a)`, color: '#000', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 900, cursor: 'pointer', opacity: processing ? 0.5 : 1 }}>
                        💰 {processing ? 'Calculando...' : 'Calcular'}
                    </button>
                </form>

                {instructor && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', marginBottom: '2rem', alignItems: 'start' }}>
                            <div style={boxStyle}>
                                <h2 style={{ color: green, fontWeight: 900, margin: '0 0 1rem', fontSize: '1.5rem' }}>{instructor.name}</h2>
                                <p style={{ color: '#999', margin: '0 0 0.5rem', fontSize: '0.875rem' }}>📧 {instructor.email}</p>
                                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                                    <div><span style={{ color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Tarifa por Clase</span><div style={{ color: green, fontWeight: 900, fontSize: '1.25rem' }}>{fmt(tarifas.por_clase)}</div></div>
                                    <div><span style={{ color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Tarifa por Asistente</span><div style={{ color: green, fontWeight: 900, fontSize: '1.25rem' }}>{fmt(tarifas.por_asistente)}</div></div>
                                    <div><span style={{ color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Clases Finalizadas</span><div style={{ color: green, fontWeight: 900, fontSize: '1.25rem' }}>{clases.length}</div></div>
                                </div>
                            </div>
                            <div style={{ ...boxStyle, textAlign: 'center', minWidth: 200 }}>
                                <div style={{ color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>Total a Pagar</div>
                                <div style={{ color: green, fontSize: '3rem', fontWeight: 900, textShadow: `0 0 20px ${green}80` }}>{fmt(totalPago)}</div>
                                <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.5rem' }}>COP</div>
                            </div>
                        </div>

                        <div style={{ ...boxStyle, padding: 0, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: `${green}18` }}>
                                <tr>
                                    {['Fecha', 'Tipo de Clase', 'Asistentes', 'Tarifa Aplicada', 'Pago'].map(h => (
                                        <th key={h} style={{ padding: '1rem', textAlign: 'left', color: green, fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: `2px solid ${green}33` }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {clases.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No hay clases finalizadas en el período seleccionado</td></tr>
                                ) : clases.map(c => (
                                    <tr key={c.id} style={{ borderBottom: `1px solid ${green}18` }}>
                                        <td style={{ padding: '1rem', color: '#ccc', fontSize: '0.875rem' }}>{formatDate(c.fecha_hora_inicio)}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.tipo_clase?.color || green }} />
                                                <span style={{ color: '#fff', fontWeight: 700 }}>{c.tipo_clase?.nombre}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#ccc', textAlign: 'center' }}>{c.asistencias_count}</td>
                                        <td style={{ padding: '1rem', color: '#999', fontSize: '0.875rem' }}>
                                            {tarifas.por_asistente > 0 ? `${c.asistencias_count} × ${fmt(tarifas.por_asistente)}` : 'Tarifa fija por clase'}
                                        </td>
                                        <td style={{ padding: '1rem', color: green, fontWeight: 900, fontSize: '1.125rem' }}>{fmt(c.pago)}</td>
                                    </tr>
                                ))}
                                </tbody>
                                {clases.length > 0 && (
                                    <tfoot>
                                    <tr style={{ background: `${green}18` }}>
                                        <td colSpan={4} style={{ padding: '1rem', color: green, fontWeight: 900, textAlign: 'right', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: 1 }}>TOTAL</td>
                                        <td style={{ padding: '1rem', color: green, fontWeight: 900, fontSize: '1.5rem' }}>{fmt(totalPago)}</td>
                                    </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
