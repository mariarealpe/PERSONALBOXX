import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState, useEffect, useRef } from 'react';

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
        const pink = [255, 20, 147], dark = [15, 15, 15], gray = [150, 150, 150];
        const fmt  = (n) => `$${new Intl.NumberFormat('es-CO').format(n ?? 0)}`;
        const fmtD = (d) => d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—';

        doc.setFillColor(...dark); doc.rect(0, 0, W, 30, 'F');
        doc.setFontSize(18); doc.setTextColor(255, 20, 147); doc.setFont('helvetica', 'bold');
        doc.text('PERSONAL BOX ARMENIA', 14, 13);
        doc.setFontSize(10); doc.setTextColor(...pink); doc.setFont('helvetica', 'bold');
        doc.text('LIQUIDACIÓN DE INSTRUCTOR', 14, 22);
        doc.setFontSize(8); doc.setTextColor(...gray); doc.setFont('helvetica', 'normal');
        doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, W - 14, 22, { align: 'right' });

        let y = 40;
        doc.setFillColor(20, 20, 20); doc.roundedRect(14, y, W - 28, 28, 3, 3, 'F');
        doc.setFontSize(13); doc.setTextColor(...pink); doc.setFont('helvetica', 'bold');
        doc.text(instructor.name, 20, y + 8);
        doc.setFontSize(8); doc.setTextColor(...gray); doc.setFont('helvetica', 'normal');
        doc.text(`Período: ${filters.fecha_inicio} al ${filters.fecha_fin}`, 20, y + 15);
        doc.text(`Tarifa por clase: ${fmt(tarifas.por_clase)}   |   Tarifa por asistente: ${fmt(tarifas.por_asistente)}   |   Clases: ${clases.length}`, 20, y + 22);

        y += 35;
        doc.setFillColor(...dark); doc.roundedRect(14, y, W - 28, 20, 3, 3, 'F');
        doc.setDrawColor(...pink); doc.setLineWidth(0.5); doc.roundedRect(14, y, W - 28, 20, 3, 3, 'S');
        doc.setFontSize(9); doc.setTextColor(...gray); doc.text('TOTAL A PAGAR', 20, y + 8);
        doc.setFontSize(18); doc.setTextColor(...pink); doc.setFont('helvetica', 'bold');
        doc.text(fmt(totalPago), W - 20, y + 14, { align: 'right' });

        y += 28;
        const headers = ['#', 'Fecha', 'Tipo de Clase', 'Asistentes', 'Tarifa Aplicada', 'Pago'];
        const colW    = [10, 38, 50, 22, 50, 28];
        doc.setFillColor(...pink); doc.rect(14, y, W - 28, 8, 'F');
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
                if (i === 5) { doc.setTextColor(...pink); } else { doc.setTextColor(200, 200, 200); }
                doc.text(String(val), cx + 2, y + 5.5); cx += colW[i];
            });
            y += 8;
        });

        doc.setFillColor(...dark); doc.rect(14, y, W - 28, 10, 'F');
        doc.setFontSize(9); doc.setTextColor(...pink); doc.setFont('helvetica', 'bold');
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
function ModalPago({ instructor, clases, totalPago, tarifas, filters, onClose, onExito }) {
    const pink           = '#FF1493';
    const fmt            = (n) => `$${new Intl.NumberFormat('es-CO').format(n ?? 0)}`;
    const tipoTarifa     = tarifas.por_asistente > 0 ? 'por_asistente' : 'por_clase';
    const tarifaAplicada = tipoTarifa === 'por_asistente' ? tarifas.por_asistente : tarifas.por_clase;

    const [fase, setFase] = useState('form');

    const { data, setData, errors } = useForm({
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

    const confirmar = () => {
        if (fase !== 'form') return;
        setFase('loading');
        router.post(route('admin.reportes.liquidacion.historial.store'), data, {
            preserveScroll: true,
            onSuccess: () => {
                setFase('exito');
                setTimeout(() => { onExito(); }, 2000);
            },
            onError: () => { setFase('form'); },
        });
    };

    const inputStyle = { width: '100%', padding: '0.65rem', background: '#000', border: `2px solid ${pink}44`, borderRadius: 8, color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', color: pink, fontSize: '0.68rem', fontWeight: 700, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#0a0a0a', border: `2px solid ${pink}55`, borderRadius: 16, padding: '2rem', maxWidth: 480, width: '100%', boxShadow: `0 0 40px ${pink}30` }}>

                {fase === 'exito' && (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: `rgba(255,20,147,0.15)`, border: `3px solid ${pink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: pink }}>
                            <Icon name="check" size={34} />
                        </div>
                        <h2 style={{ color: pink, fontWeight: 900, margin: '0 0 0.5rem', fontSize: '1.4rem' }}>Pago registrado</h2>
                        <p style={{ color: '#999', margin: '0 0 0.25rem', fontSize: '0.9rem' }}>Se registró el pago de <strong style={{ color: '#fff' }}>{fmt(totalPago)}</strong></p>
                        <p style={{ color: '#666', margin: 0, fontSize: '0.8rem' }}>para <strong style={{ color: '#ccc' }}>{instructor.name}</strong></p>
                        <div style={{ marginTop: '1.5rem', background: 'rgba(255,20,147,0.08)', border: `1px solid ${pink}44`, borderRadius: 8, padding: '0.75rem', color: '#666', fontSize: '0.75rem' }}>
                            Cerrando automáticamente…
                        </div>
                    </div>
                )}

                {fase === 'loading' && (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{ width: 52, height: 52, borderRadius: '50%', border: `4px solid ${pink}33`, borderTop: `4px solid ${pink}`, margin: '0 auto 1.25rem', animation: 'spin 0.8s linear infinite' }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        <p style={{ color: pink, fontWeight: 700, margin: 0 }}>Registrando pago…</p>
                    </div>
                )}

                {fase === 'form' && (
                    <>
                        <h2 style={{ color: pink, fontWeight: 900, margin: '0 0 0.5rem', fontSize: '1.25rem' }}>Registrar pago</h2>
                        <p style={{ color: '#666', fontSize: '0.8rem', margin: '0 0 1.5rem' }}>Instructor: <strong style={{ color: '#fff' }}>{instructor.name}</strong></p>
                        <div style={{ background: '#111', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#999', fontSize: '0.8rem' }}>Total a registrar</span>
                            <span style={{ color: pink, fontWeight: 900, fontSize: '1.5rem' }}>{fmt(totalPago)}</span>
                        </div>
                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Fecha de Pago *</label>
                                <input type="date" value={data.fecha_pago} onChange={e => setData('fecha_pago', e.target.value)} style={inputStyle} />
                                {errors.fecha_pago && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{errors.fecha_pago}</p>}
                            </div>
                            <div>
                                <label style={labelStyle}>Notas (opcional)</label>
                                <textarea value={data.notas} onChange={e => setData('notas', e.target.value)} rows={3} placeholder="Ej: Pago por transferencia, comprobante #123..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={onClose} style={{ background: 'transparent', border: '2px solid #444', color: '#999', padding: '0.6rem 1.2rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
                                Cancelar
                            </button>
                            <button onClick={confirmar} style={{ display:'inline-flex', alignItems:'center', gap:'.45rem', background: 'linear-gradient(135deg,#FF1493,#C71585)', border: 'none', color: '#000', padding: '0.6rem 1.5rem', borderRadius: 8, cursor: 'pointer', fontWeight: 900 }}>
                                <Icon name="save" /> Confirmar pago
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Liquidacion({ auth, instructor, clases, totalPago, tarifas, instructores, filters, pagoRegistrado }) {
    const [modalAbierto, setModalAbierto] = useState(false);
    const instructorOptions = instructores.map(i => ({ value: i.id, label: i.name }));

    const { data, setData, get, processing } = useForm({
        instructor_id: filters?.instructor_id || '',
        fecha_inicio:  filters?.fecha_inicio  || new Date().toISOString().split('T')[0],
        fecha_fin:     filters?.fecha_fin     || new Date().toISOString().split('T')[0],
    });

    const handleSubmit = (e) => { e.preventDefault(); get(route('admin.reportes.liquidacion')); };

    const fmt        = (n) => `$${new Intl.NumberFormat('es-CO').format(n ?? 0)}`;
    const formatDate = (d) => d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '-';
    const pink       = '#FF1493';

    const inputStyle = { width: '100%', padding: '0.75rem', background: '#000', border: `2px solid ${pink}44`, borderRadius: 8, color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', color: pink, fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 };
    const boxStyle   = { background: 'rgba(10,10,10,0.95)', border: `2px solid ${pink}44`, borderRadius: 12, padding: '1.5rem', boxShadow: `0 0 20px rgba(255,20,147,0.1)` };
    const exportFilters = filters || { fecha_inicio: data.fecha_inicio, fecha_fin: data.fecha_fin };

    // ── Lógica de bloqueo corregida ────────────────────────────────────────
    // Si hay clases finalizadas pendientes → el botón está ACTIVO (hay algo que pagar)
    // Si NO hay clases finalizadas → el botón está BLOQUEADO (no hay nada que pagar)
    // El historial previo se muestra como referencia pero NO bloquea si hay clases nuevas.
    const hayClasesPendientes = clases && clases.length > 0;
    const yaPagado            = pagoRegistrado && !pagoRegistrado.hay_clases_pendientes;

    const handleExito = () => {
        setModalAbierto(false);
        router.get(route('admin.reportes.liquidacion'), {
            instructor_id: filters?.instructor_id,
            fecha_inicio:  filters?.fecha_inicio,
            fecha_fin:     filters?.fecha_fin,
        }, { preserveScroll: false });
    };

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
                    onExito={handleExito}
                />
            )}

            <div className="rep-wrap">
                <div className="rep-head-row">
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: pink, margin: 0, textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>LIQUIDACIÓN</h1>
                        <p style={{ color: '#999', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Cálculo de pagos a instructores</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <a href={route('admin.reportes.liquidacion.historial')} className="rep-btn-link">
                            <Icon name="history" /> Ver historial
                        </a>

                        {instructor && clases.length > 0 && (
                            <>
                                <span style={{ color: '#444', fontSize: '0.75rem' }}>Exportar:</span>
                                <button onClick={() => exportarPDF(instructor, clases, totalPago, tarifas, exportFilters)} className="rep-btn-danger">
                                    <Icon name="pdf" /> PDF
                                </button>
                                <button onClick={() => exportarExcel(instructor, clases, totalPago, tarifas, exportFilters)} className="rep-btn-soft">
                                    <Icon name="excel" /> Excel
                                </button>
                            </>
                        )}

                        {instructor && (
                            <button
                                onClick={() => { if (hayClasesPendientes && !yaPagado) setModalAbierto(true); }}
                                className={`rep-btn-pay ${!hayClasesPendientes ? 'disabled' : ''}`}
                                title={!hayClasesPendientes ? 'No hay clases finalizadas pendientes de pago en este período' : 'Registrar pago de este período'}
                            >
                                <Icon name={hayClasesPendientes ? 'check' : 'history'} />
                                {hayClasesPendientes ? 'Marcar como pagado' : 'Sin pendientes'}
                            </button>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="glass-card filters-grid">
                    {/* Filtros */}
                    <div>
                        <label style={labelStyle}>Instructor *</label>
                        <NeonSelect
                            value={data.instructor_id}
                            onChange={(v) => setData('instructor_id', v)}
                            options={instructorOptions}
                            placeholder="-- Seleccionar --"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Fecha Inicio *</label>
                        <input type="date" value={data.fecha_inicio} onChange={e => setData('fecha_inicio', e.target.value)} required style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Fecha Fin *</label>
                        <input type="date" value={data.fecha_fin} onChange={e => setData('fecha_fin', e.target.value)} required style={inputStyle} />
                    </div>
                    <button type="submit" disabled={processing} className="rep-btn-primary">
                        <Icon name="calc" /> {processing ? 'Calculando...' : 'Calcular'}
                    </button>
                </form>

                {/* Banner: referencia del último pago (informativo, no bloqueante si hay clases pendientes) */}
                {pagoRegistrado && instructor && (
                    <div style={{
                        background: hayClasesPendientes ? 'rgba(234,179,8,0.06)' : 'rgba(255,20,147,0.08)',
                        border: `2px solid ${hayClasesPendientes ? 'rgba(234,179,8,0.4)' : 'rgba(255,20,147,0.55)'}`,
                        borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '2rem',
                        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                    }}>
                        <span style={{ fontSize: '1.5rem', color: hayClasesPendientes ? '#eab308' : pink }}>
                            <Icon name={hayClasesPendientes ? 'history' : 'check'} size={22} />
                        </span>
                        <div style={{ flex: 1 }}>
                            <p style={{
                                color: hayClasesPendientes ? '#eab308' : pink,
                                fontWeight: 900, margin: '0 0 0.3rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1,
                            }}>
                                {hayClasesPendientes
                                    ? 'Último pago registrado (hay clases nuevas pendientes)'
                                    : 'Al día — no hay clases pendientes de pago'}
                            </p>
                            <p style={{ color: '#999', margin: 0, fontSize: '0.85rem' }}>
                                Período: <strong style={{ color: '#ccc' }}>{pagoRegistrado.fecha_inicio} — {pagoRegistrado.fecha_fin}</strong>
                                &nbsp;·&nbsp; Fecha de pago: <strong style={{ color: '#ccc' }}>{pagoRegistrado.fecha_pago}</strong>
                                {pagoRegistrado.notas && <>&nbsp;·&nbsp;Nota: <em style={{ color: '#aaa' }}>{pagoRegistrado.notas}</em></>}
                            </p>
                        </div>
                        <div style={{
                            background: hayClasesPendientes ? 'rgba(234,179,8,0.1)' : 'rgba(255,20,147,0.15)',
                            border: `2px solid ${hayClasesPendientes ? '#eab308' : pink}`,
                            borderRadius: 10, padding: '0.5rem 1.25rem', textAlign: 'center', minWidth: 140,
                        }}>
                            <p style={{ color: '#999', fontSize: '0.7rem', margin: '0 0 0.2rem', textTransform: 'uppercase', letterSpacing: 1 }}>Último pago</p>
                            <p style={{ color: hayClasesPendientes ? '#eab308' : pink, fontWeight: 900, fontSize: '1.4rem', margin: 0 }}>
                                {fmt(pagoRegistrado.total_pago)}
                            </p>
                        </div>
                        <a href={route('admin.reportes.liquidacion.historial')} className="rep-btn-link">
                            <Icon name="history" /> Ver historial
                        </a>
                    </div>
                )}

                {instructor && (
                    <>
                        <div className="summary-grid">
                            <div style={boxStyle}>
                                <h2 style={{ color: pink, fontWeight: 900, margin: '0 0 1rem', fontSize: '1.5rem' }}>{instructor.name}</h2>
                                <p style={{ color: '#999', margin: '0 0 0.5rem', fontSize: '0.875rem', display:'inline-flex', alignItems:'center', gap:'.45rem' }}>
                                    <Icon name="mail" /> {instructor.email}
                                </p>
                                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                    <div>
                                        <span style={{ color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Tarifa por Clase</span>
                                        <div style={{ color: pink, fontWeight: 900, fontSize: '1.25rem' }}>{fmt(tarifas.por_clase)}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Tarifa por Asistente</span>
                                        <div style={{ color: pink, fontWeight: 900, fontSize: '1.25rem' }}>{fmt(tarifas.por_asistente)}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Clases Finalizadas</span>
                                        <div style={{ color: pink, fontWeight: 900, fontSize: '1.25rem' }}>{clases.length}</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ ...boxStyle, textAlign: 'center', minWidth: 200, position: 'relative', border: yaPagado ? `2px solid rgba(255,20,147,0.6)` : `2px solid ${pink}44` }}>
                                {yaPagado && (
                                    <div style={{ position: 'absolute', top: -12, right: 12, background: pink, color: '#000', fontSize: '0.65rem', fontWeight: 900, padding: '0.2rem 0.65rem', borderRadius: 20, letterSpacing: 1 }}>
                                        AL DÍA
                                    </div>
                                )}
                                <div style={{ color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>Total a Pagar</div>
                                <div style={{ color: pink, fontSize: '3rem', fontWeight: 900, textShadow: `0 0 20px rgba(255,20,147,0.5)` }}>{fmt(totalPago)}</div>
                                <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.5rem' }}>COP</div>
                            </div>
                        </div>

                        <div className="glass-card table-card">
                            <div className="table-scroll">
                                <table className="rep-table">
                                    <thead style={{ background: `${pink}18` }}>
                                    <tr>
                                        {['Fecha', 'Tipo de Clase', 'Asistentes', 'Tarifa Aplicada', 'Pago'].map(h => (
                                            <th key={h} style={{ padding: '1rem', textAlign: 'left', color: pink, fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: `2px solid ${pink}33` }}>{h}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {clases.length === 0 ? (
                                        <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No hay clases finalizadas pendientes en este período</td></tr>
                                    ) : clases.map(c => (
                                        <tr key={c.id} style={{ borderBottom: `1px solid ${pink}18` }}>
                                            <td style={{ padding: '1rem', color: '#ccc', fontSize: '0.875rem' }}>{formatDate(c.fecha_hora_inicio)}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.tipo_clase?.color || pink }} />
                                                    <span style={{ color: '#fff', fontWeight: 700 }}>{c.tipo_clase?.nombre}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', color: '#ccc', textAlign: 'center' }}>{c.asistencias_count}</td>
                                            <td style={{ padding: '1rem', color: '#999', fontSize: '0.875rem' }}>
                                                {tarifas.por_asistente > 0 ? `${c.asistencias_count} × ${fmt(tarifas.por_asistente)}` : 'Tarifa fija por clase'}
                                            </td>
                                            <td style={{ padding: '1rem', color: pink, fontWeight: 900, fontSize: '1.125rem' }}>{fmt(c.pago)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    {clases.length > 0 && (
                                        <tfoot>
                                        <tr style={{ background: `${pink}18` }}>
                                            <td colSpan={4} style={{ padding: '1rem', color: pink, fontWeight: 900, textAlign: 'right', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: 1 }}>TOTAL</td>
                                            <td style={{ padding: '1rem', color: pink, fontWeight: 900, fontSize: '1.5rem' }}>{fmt(totalPago)}</td>
                                        </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                .rep-wrap { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
                .rep-head-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }

                .glass-card {
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(22px);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-top: 1px solid rgba(255,255,255,0.12);
                    border-radius: 16px;
                    box-shadow: 0 0 28px rgba(255,20,147,0.08), 0 8px 32px rgba(0,0,0,0.45);
                }

                .filters-grid {
                    padding: 1rem;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    align-items: end;
                }

                .summary-grid { display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: start; }
                .table-card { overflow: hidden; }
                .table-scroll { overflow-x: auto; }
                .rep-table { width: 100%; min-width: 900px; border-collapse: collapse; }

                /* Dropdown neón (filtro instructor) */
                .nsel-wrap { position: relative; }
                .nsel-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.75rem 0.875rem;
                    background: #000;
                    border: 2px solid rgba(255,20,147,0.27);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all .2s;
                    font-family: inherit;
                }
                .nsel-btn:hover, .nsel-btn.open {
                    border-color: rgba(255,20,147,0.55);
                    box-shadow: 0 0 0 3px rgba(255,20,147,0.08);
                }
                .nsel-val { color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .nsel-ph { color: #666; }
                .nsel-arr {
                    color: rgba(255,20,147,0.8);
                    transform: rotate(90deg);
                    transition: transform .2s;
                    font-size: 1rem;
                    line-height: 1;
                }
                .nsel-arr.up { transform: rotate(-90deg); }
                .nsel-drop {
                    position: absolute;
                    top: calc(100% + 6px);
                    left: 0;
                    right: 0;
                    z-index: 30;
                    background: rgba(8,3,14,0.97);
                    border: 1px solid rgba(255,20,147,0.35);
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 16px 40px rgba(0,0,0,0.65), 0 0 24px rgba(255,20,147,0.1);
                    max-height: 240px;
                    overflow-y: auto;
                }
                .nsel-opt {
                    width: 100%;
                    border: none;
                    background: none;
                    color: rgba(255,255,255,0.78);
                    padding: 0.65rem 0.875rem;
                    text-align: left;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.83rem;
                    border-bottom: 1px solid rgba(255,20,147,0.08);
                    font-family: inherit;
                }
                .nsel-opt:last-child { border-bottom: none; }
                .nsel-opt:hover { background: rgba(255,20,147,0.1); color: #FF1493; }
                .nsel-opt.active { background: rgba(255,20,147,0.14); color: #FF1493; font-weight: 700; }
                .nsel-opt-lbl { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .nsel-chk { color: #FF1493; font-size: 0.75rem; }

                @media (max-width: 900px) { .summary-grid { grid-template-columns: 1fr; } }
                @media (max-width: 768px) {
                    .filters-grid { grid-template-columns: 1fr; }
                    .nsel-drop { max-height: 200px; }
                }

                /* ── Estilos de botones y enlaces ──────────────────────────────────────── */
                .rep-btn-primary {
                    display:inline-flex; align-items:center; justify-content:center; gap:.5rem;
                    background: rgba(255,20,147,0.18);
                    border: 1px solid rgba(255,255,255,0.18);
                    color: #FF1493;
                    text-shadow: 0 0 8px rgba(255,20,147,0.35);
                    padding: 0.875rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 900;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    backdrop-filter: blur(10px);
                }
                .rep-btn-primary:hover { background: rgba(255,20,147,0.28); color:#fff; box-shadow: 0 0 20px rgba(255,20,147,0.35); transform: translateY(-1px); }

                .rep-btn-soft, .rep-btn-danger, .rep-btn-link, .rep-btn-pay {
                    display:inline-flex; align-items:center; gap:.5rem;
                    padding:.5rem 1rem; border-radius:8px; font-weight:700; font-size:.8rem; text-decoration:none; cursor:pointer;
                }
                .rep-btn-soft { background: rgba(255,20,147,0.1); border:2px solid rgba(255,20,147,0.5); color:#FF1493; }
                .rep-btn-danger { background: rgba(239,68,68,0.1); border:2px solid rgba(239,68,68,0.5); color:#ef4444; }
                .rep-btn-link { background: rgba(255,20,147,0.1); border:2px solid rgba(255,20,147,0.5); color:#FF1493; }
                .rep-btn-pay  { background: linear-gradient(135deg,#FF1493,#C71585); border:none; color:#000; font-weight:900; padding:.5rem 1.25rem; }
                .rep-btn-pay.disabled { background: rgba(107,114,128,0.15); border:2px solid rgba(107,114,128,0.3); color:#6b7280; cursor:not-allowed; opacity:.6; }

                /* ── Estilos de íconos SVG ────────────────────────────────────────────── */
                svg { display: inline-block; vertical-align: middle; stroke-width: 1.8; }
                svg polyline { fill: none; stroke: currentColor; }
                svg path { fill: none; stroke: currentColor; }
            `}</style>
        </DashboardLayout>
    );
}

function Icon({ name, size = 16 }) {
    const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
    const m = {
        check: <svg {...c}><polyline points="20 6 9 17 4 12"/></svg>,
        save: <svg {...c}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>,
        history: <svg {...c}><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 6.3L3 8"/></svg>,
        pdf: <svg {...c}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
        excel: <svg {...c}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M10 9l4 6M14 9l-4 6"/></svg>,
        calc: <svg {...c}><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/></svg>,
        mail: <svg {...c}><path d="M4 4h16v16H4z"/><polyline points="22,6 12,13 2,6"/></svg>,
    };
    return m[name] || null;
}

function NeonSelect({ value, onChange, options, placeholder = '-- Seleccionar --' }) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);
    const selected = options.find(o => String(o.value) === String(value));

    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [open]);

    return (
        <div className="nsel-wrap" ref={wrapRef}>
            <button
                type="button"
                className={`nsel-btn ${open ? 'open' : ''}`}
                onClick={() => setOpen(o => !o)}
            >
                <span className={selected ? 'nsel-val' : 'nsel-ph'}>
                    {selected ? selected.label : placeholder}
                </span>
                <span className={`nsel-arr ${open ? 'up' : ''}`}>›</span>
            </button>

            {open && (
                <div className="nsel-drop">
                    {options.map((o) => (
                        <button
                            key={o.value}
                            type="button"
                            className={`nsel-opt ${String(value) === String(o.value) ? 'active' : ''}`}
                            onClick={() => { onChange(o.value); setOpen(false); }}
                        >
                            <span className="nsel-opt-lbl">{o.label}</span>
                            {String(value) === String(o.value) && <span className="nsel-chk">✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
