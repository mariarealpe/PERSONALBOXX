import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

// ── Loader de jsPDF (vía script tag, no dynamic import) ───────────────────────
function loadJsPDF(callback) {
    if (window.jspdf && window.jspdf.jsPDF) { callback(window.jspdf.jsPDF); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = () => callback(window.jspdf.jsPDF);
    document.head.appendChild(s);
}

function exportarPDF(clases, filters, totales) {
    loadJsPDF((jsPDF) => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const W = doc.internal.pageSize.getWidth();
        const pink = [255, 20, 147];
        const dark = [15, 15, 15];
        const gray = [150, 150, 150];

        doc.setFillColor(...dark);
        doc.rect(0, 0, W, 28, 'F');
        doc.setFontSize(18); doc.setTextColor(...pink); doc.setFont('helvetica', 'bold');
        doc.text('PERSONAL BOX ARMENIA', 14, 12);
        doc.setFontSize(10); doc.setTextColor(...gray); doc.setFont('helvetica', 'normal');
        doc.text('Reporte de Asistencia por Clase', 14, 20);
        doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, W - 14, 20, { align: 'right' });

        doc.setFontSize(9); doc.setTextColor(...gray);
        doc.text(`Período: ${filters.fecha_inicio} al ${filters.fecha_fin}`, 14, 34);

        const stats = [
            ['Total Clases', clases.length],
            ['Total Reservas', totales.reservas],
            ['Total Asistentes', totales.asistentes],
        ];
        let sx = 14;
        stats.forEach(([label, val]) => {
            doc.setFillColor(30, 30, 30);
            doc.roundedRect(sx, 38, 55, 18, 3, 3, 'F');
            doc.setFontSize(16); doc.setTextColor(...pink); doc.setFont('helvetica', 'bold');
            doc.text(String(val), sx + 28, 49, { align: 'center' });
            doc.setFontSize(7); doc.setTextColor(...gray); doc.setFont('helvetica', 'normal');
            doc.text(label.toUpperCase(), sx + 28, 54, { align: 'center' });
            sx += 60;
        });

        const headers = ['#', 'Tipo de Clase', 'Instructor', 'Fecha', 'Cap.', 'Reservas', 'Asistentes', 'Tasa'];
        const colW    = [10, 50, 45, 40, 15, 22, 25, 20];
        let y = 64;

        doc.setFillColor(...pink);
        doc.rect(14, y, W - 28, 8, 'F');
        doc.setFontSize(7); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
        let cx = 14;
        headers.forEach((h, i) => { doc.text(h, cx + 2, y + 5.5); cx += colW[i]; });

        y += 8;
        clases.forEach((c, idx) => {
            if (y > 185) { doc.addPage(); y = 14; }
            doc.setFillColor(idx % 2 === 0 ? 20 : 10, idx % 2 === 0 ? 20 : 10, idx % 2 === 0 ? 20 : 10);
            doc.rect(14, y, W - 28, 8, 'F');
            const tasa = c.capacidad_maxima > 0 ? Math.round((c.asistencias_count / c.capacidad_maxima) * 100) : 0;
            const row = [
                idx + 1,
                c.tipo_clase?.nombre || '—',
                c.instructor?.name || '—',
                c.fecha_hora_inicio ? new Date(c.fecha_hora_inicio).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—',
                c.capacidad_maxima,
                c.reservas_confirmadas_count ?? 0,
                c.asistencias_count ?? 0,
                `${tasa}%`,
            ];
            doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
            cx = 14;
            row.forEach((val, i) => {
                if (i === 7) {
                    const col = tasa >= 80 ? [34, 197, 94] : tasa >= 50 ? [255, 193, 7] : [239, 68, 68];
                    doc.setTextColor(...col);
                } else if (i === 6) {
                    doc.setTextColor(...pink);
                } else {
                    doc.setTextColor(200, 200, 200);
                }
                doc.text(String(val), cx + 2, y + 5.5);
                cx += colW[i];
            });
            y += 8;
        });

        doc.save(`asistencia_clases_${filters.fecha_inicio}_${filters.fecha_fin}.pdf`);
    });
}

function exportarExcel(clases, filters, totales) {
    import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs').then((XLSX) => {
        const tasa = (a, c) => c > 0 ? Math.round((a / c) * 100) + '%' : '0%';
        const fmtDate = (d) => d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—';

        const rows = [
            ['PERSONAL BOX ARMENIA — REPORTE DE ASISTENCIA POR CLASE'],
            [`Período: ${filters.fecha_inicio} al ${filters.fecha_fin}`],
            [`Generado: ${new Date().toLocaleString('es-CO')}`],
            [],
            ['Total Clases', clases.length, '', 'Total Reservas', totales.reservas, '', 'Total Asistentes', totales.asistentes],
            [],
            ['#', 'Tipo de Clase', 'Instructor', 'Fecha', 'Capacidad', 'Reservas', 'Asistentes', 'Tasa Asistencia'],
            ...clases.map((c, i) => [
                i + 1,
                c.tipo_clase?.nombre || '—',
                c.instructor?.name || '—',
                fmtDate(c.fecha_hora_inicio),
                c.capacidad_maxima,
                c.reservas_confirmadas_count ?? 0,
                c.asistencias_count ?? 0,
                tasa(c.asistencias_count, c.capacidad_maxima),
            ]),
            [],
            ['', '', '', '', 'TOTALES', totales.reservas, totales.asistentes, ''],
        ];

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [5, 30, 25, 22, 12, 12, 14, 16].map(w => ({ wch: w }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');
        XLSX.writeFile(wb, `asistencia_clases_${filters.fecha_inicio}_${filters.fecha_fin}.xlsx`);
    });
}

export default function AsistenciaClase({ auth, clases, instructores, tiposClase, filters }) {
    const { data, setData, get, processing } = useForm({
        fecha_inicio: filters?.fecha_inicio || new Date().toISOString().split('T')[0],
        fecha_fin: filters?.fecha_fin || new Date().toISOString().split('T')[0],
        instructor_id: filters?.instructor_id || '',
        tipo_clase_id: filters?.tipo_clase_id || '',
    });

    const handleSubmit = (e) => { e.preventDefault(); get(route('admin.reportes.asistencia-clase')); };

    const fmt = (n) => new Intl.NumberFormat('es-CO').format(n ?? 0);
    const formatDate = (d) => d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '-';
    const tasa = (asist, cap) => cap > 0 ? Math.round((asist / cap) * 100) : 0;

    const totales = clases.reduce((acc, c) => ({
        reservas: acc.reservas + (c.reservas_confirmadas_count || 0),
        asistentes: acc.asistentes + (c.asistencias_count || 0),
    }), { reservas: 0, asistentes: 0 });

    const inputStyle = { width: '100%', padding: '0.75rem', background: '#000', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', color: '#FF1493', fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 };
    const boxStyle = { background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.5rem', boxShadow: '0 0 20px rgba(255,20,147,0.1)' };
    const exportFilters = filters || { fecha_inicio: data.fecha_inicio, fecha_fin: data.fecha_fin };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Reporte de Asistencia por Clase" />
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#FF1493', margin: 0, textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>REPORTE DE ASISTENCIA</h1>
                        <p style={{ color: '#999', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Detalle de asistencia por clase en un período</p>
                    </div>
                    {clases.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <span style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Exportar:</span>
                            <button onClick={() => exportarPDF(clases, exportFilters, totales)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.5)', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                                📄 PDF
                            </button>
                            <button onClick={() => exportarExcel(clases, exportFilters, totales)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.5)', color: '#22c55e', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(34,197,94,0.25)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}>
                                📊 Excel
                            </button>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} style={{ ...boxStyle, marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                    <div><label style={labelStyle}>Fecha Inicio *</label><input type="date" value={data.fecha_inicio} onChange={e => setData('fecha_inicio', e.target.value)} required style={inputStyle} /></div>
                    <div><label style={labelStyle}>Fecha Fin *</label><input type="date" value={data.fecha_fin} onChange={e => setData('fecha_fin', e.target.value)} required style={inputStyle} /></div>
                    <div>
                        <label style={labelStyle}>Instructor</label>
                        <select value={data.instructor_id} onChange={e => setData('instructor_id', e.target.value)} style={{ ...inputStyle, color: data.instructor_id ? '#fff' : '#666' }}>
                            <option value="">Todos</option>
                            {instructores.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Tipo de Clase</label>
                        <select value={data.tipo_clase_id} onChange={e => setData('tipo_clase_id', e.target.value)} style={{ ...inputStyle, color: data.tipo_clase_id ? '#fff' : '#666' }}>
                            <option value="">Todos</option>
                            {tiposClase.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </select>
                    </div>
                    <button type="submit" disabled={processing} style={{ background: 'linear-gradient(135deg,#FF1493,#C71585)', color: '#000', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 900, cursor: 'pointer', opacity: processing ? 0.5 : 1 }}>
                        🔍 {processing ? 'Buscando...' : 'Generar Reporte'}
                    </button>
                </form>

                {clases.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                        {[
                            { label: 'Total Clases', value: clases.length, icon: '📅' },
                            { label: 'Total Reservas', value: fmt(totales.reservas), icon: '📋' },
                            { label: 'Total Asistentes', value: fmt(totales.asistentes), icon: '✅' },
                        ].map(s => (
                            <div key={s.label} style={{ ...boxStyle, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '2rem' }}>{s.icon}</span>
                                <div>
                                    <div style={{ color: '#FF1493', fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                                    <div style={{ color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ ...boxStyle, padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,20,147,0.1)' }}>
                        <tr>
                            {['Clase', 'Instructor', 'Fecha', 'Capacidad', 'Reservas', 'Asistentes', 'Tasa'].map(h => (
                                <th key={h} style={{ padding: '1rem', textAlign: 'left', color: '#FF1493', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid rgba(255,20,147,0.3)' }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {clases.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No hay datos para el período seleccionado</td></tr>
                        ) : clases.map(c => {
                            const t = tasa(c.asistencias_count, c.capacidad_maxima);
                            const color = t >= 80 ? '#22c55e' : t >= 50 ? '#ffc107' : '#ef4444';
                            return (
                                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,20,147,0.1)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.tipo_clase?.color || '#FF1493', flexShrink: 0 }} />
                                            <span style={{ color: '#fff', fontWeight: 700 }}>{c.tipo_clase?.nombre}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#ccc' }}>{c.instructor?.name}</td>
                                    <td style={{ padding: '1rem', color: '#ccc', fontSize: '0.875rem' }}>{formatDate(c.fecha_hora_inicio)}</td>
                                    <td style={{ padding: '1rem', color: '#ccc', textAlign: 'center' }}>{c.capacidad_maxima}</td>
                                    <td style={{ padding: '1rem', color: '#ccc', textAlign: 'center' }}>{c.reservas_confirmadas_count ?? 0}</td>
                                    <td style={{ padding: '1rem', color: '#FF1493', fontWeight: 700, textAlign: 'center' }}>{c.asistencias_count ?? 0}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{ color, fontWeight: 700, background: `${color}22`, border: `1px solid ${color}`, padding: '0.25rem 0.6rem', borderRadius: 4, fontSize: '0.8rem' }}>{t}%</span>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
