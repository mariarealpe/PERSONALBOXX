import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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

function Icon({ name, size = 16 }) {
    const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
    const m = {
        pdf: <svg {...c}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
        excel: <svg {...c}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M10 9l4 6M14 9l-4 6"/></svg>,
        search: <svg {...c}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
        clases: <svg {...c}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
        reservas: <svg {...c}><path d="M4 7h16M4 12h16M4 17h10"/></svg>,
        asistentes: <svg {...c}><polyline points="20 6 9 17 4 12"/></svg>,
    };
    return m[name] || null;
}

function NeonSelect({ value, onChange, options, placeholder = 'Todos' }) {
    const [open, setOpen] = useState(false);
    const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
    const btnRef = useRef(null);
    const dropRef = useRef(null);
    const selected = options.find(o => String(o.value) === String(value));

    const openDropdown = () => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            const dropH = Math.min((options.length + 1) * 44 + 8, 240);
            const spaceBelow = window.innerHeight - rect.bottom;
            const showAbove = spaceBelow < dropH && rect.top > dropH;

            setDropPos({
                top: showAbove ? rect.top - dropH - 4 : rect.bottom + 4,
                left: rect.left,
                width: rect.width,
            });
        }
        setOpen(o => !o);
    };

    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e) => {
            if (
                btnRef.current && !btnRef.current.contains(e.target) &&
                dropRef.current && !dropRef.current.contains(e.target)
            ) setOpen(false);
        };
        const onScroll = () => setOpen(false);
        const onResize = () => setOpen(false);

        document.addEventListener('mousedown', onClickOutside);
        document.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onResize);

        return () => {
            document.removeEventListener('mousedown', onClickOutside);
            document.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onResize);
        };
    }, [open]);

    return (
        <>
            <div className="nsel-wrap">
                <button
                    ref={btnRef}
                    type="button"
                    className={`nsel-btn ${open ? 'open' : ''}`}
                    onClick={openDropdown}
                >
                    <span className={selected ? 'nsel-val' : 'nsel-ph'}>
                        {selected ? selected.label : placeholder}
                    </span>
                    <span className={`nsel-arr ${open ? 'up' : ''}`}>›</span>
                </button>
            </div>

            {open && createPortal(
                <div
                    ref={dropRef}
                    className="nsel-drop"
                    style={{
                        position: 'fixed',
                        top: dropPos.top,
                        left: dropPos.left,
                        width: dropPos.width,
                        zIndex: 99999,
                    }}
                >
                    <button
                        type="button"
                        className={`nsel-opt ${value === '' ? 'active' : ''}`}
                        onClick={() => { onChange(''); setOpen(false); }}
                    >
                        <span className="nsel-opt-lbl">{placeholder}</span>
                        {value === '' && <span className="nsel-chk">✓</span>}
                    </button>
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
                </div>,
                document.body
            )}
        </>
    );
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
            <div className="rep-wrap">
                <div className="rep-head-row">
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#FF1493', margin: 0, textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>REPORTE DE ASISTENCIA</h1>
                        <p style={{ color: '#999', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Detalle de asistencia por clase en un período</p>
                    </div>
                    {clases.length > 0 && (
                        <div className="rep-actions">
                            <span className="rep-actions-label">Exportar:</span>
                            <button onClick={() => exportarPDF(clases, exportFilters, totales)} className="rep-btn-sec">
                                <Icon name="pdf" /> PDF
                            </button>
                            <button onClick={() => exportarExcel(clases, exportFilters, totales)} className="rep-btn-sec">
                                <Icon name="excel" /> Excel
                            </button>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="glass-card filters-grid">
                    <div><label style={labelStyle}>Fecha Inicio *</label><input type="date" value={data.fecha_inicio} onChange={e => setData('fecha_inicio', e.target.value)} required style={inputStyle} /></div>
                    <div><label style={labelStyle}>Fecha Fin *</label><input type="date" value={data.fecha_fin} onChange={e => setData('fecha_fin', e.target.value)} required style={inputStyle} /></div>
                    <div>
                        <label style={labelStyle}>Instructor</label>
                        <NeonSelect
                            value={data.instructor_id}
                            onChange={(v) => setData('instructor_id', v)}
                            options={instructores.map(i => ({ value: i.id, label: i.name }))}
                            placeholder="Todos"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Tipo de Clase</label>
                        <NeonSelect
                            value={data.tipo_clase_id}
                            onChange={(v) => setData('tipo_clase_id', v)}
                            options={tiposClase.map(t => ({ value: t.id, label: t.nombre }))}
                            placeholder="Todos"
                        />
                    </div>
                    <button type="submit" disabled={processing} className="rep-btn-primary">
                        <Icon name="search" /> {processing ? 'Buscando...' : 'Generar reporte'}
                    </button>
                </form>

                {clases.length > 0 && (
                    <div className="stats-grid">
                        {[
                            { label: 'Total Clases', value: clases.length, icon: 'clases' },
                            { label: 'Total Reservas', value: fmt(totales.reservas), icon: 'reservas' },
                            { label: 'Total Asistentes', value: fmt(totales.asistentes), icon: 'asistentes' },
                        ].map(s => (
                            <div key={s.label} style={{ ...boxStyle, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ color: '#FF1493', display: 'inline-flex' }}><Icon name={s.icon} size={28} /></span>
                                <div>
                                    <div style={{ color: '#FF1493', fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                                    <div style={{ color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="glass-card table-card">
                    <div className="table-scroll">
                        <table className="rep-table">
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
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1rem;
                    align-items: end;
                }

                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
                .table-card { overflow: hidden; }
                .table-scroll { overflow-x: auto; }
                .rep-table { width: 100%; min-width: 860px; border-collapse: collapse; }

                .rep-actions { display: flex; gap: .75rem; align-items: center; flex-wrap: wrap; }
                .rep-actions-label { color: #666; font-size: .75rem; text-transform: uppercase; letter-spacing: 1px; }

                .rep-btn-sec {
                    display: inline-flex; align-items: center; gap: .5rem;
                    background: rgba(255,20,147,0.1); border: 2px solid rgba(255,20,147,0.5);
                    color: #FF1493; padding: .5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: .8rem;
                }

                .rep-btn-primary {
                    display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
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
                .rep-btn-primary:hover { background: rgba(255,20,147,0.28); color: #fff; }

                /* Dropdown neón */
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
                .nsel-arr { color: rgba(255,20,147,0.8); transform: rotate(90deg); transition: transform .2s; font-size: 1rem; line-height: 1; }
                .nsel-arr.up { transform: rotate(-90deg); }
                .nsel-drop {
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

                @media (max-width: 900px) { .stats-grid { grid-template-columns: 1fr; } }
                @media (max-width: 768px) {
                    .filters-grid { grid-template-columns: 1fr; }
                    .rep-actions { width: 100%; }
                    .rep-btn-sec { flex: 1; justify-content: center; }
                    .rep-btn-primary { width: 100%; }
                }
            `}</style>
        </DashboardLayout>
    );
}
