import { Head } from '@inertiajs/react';
import { Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import InstructorLayout from '@/Layouts/InstructorLayout';

const DIAS_CORTO = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function toYMD(d) {
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function parseYMD(s) {
    if (!s) return new Date();
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}
function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function startOfWeekMon(d) {
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const r = new Date(d); r.setDate(d.getDate() + diff); r.setHours(0,0,0,0);
    return r;
}
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

function BigCalendar({ selectedDate, onSelectDate, clasesMap, viewMonth, onPrevMonth, onNextMonth }) {
    const sel = parseYMD(selectedDate);
    const today = new Date(); today.setHours(0,0,0,0);

    const firstDay = new Date(viewMonth.year, viewMonth.month, 1);
    const lastDay = new Date(viewMonth.year, viewMonth.month + 1, 0);
    const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const cells = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(viewMonth.year, viewMonth.month, d));
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    return (
        <div className="bcal">
            <div className="bcal-nav">
                <button type="button" className="bcal-navbtn" onClick={onPrevMonth}>‹</button>
                <h2 className="bcal-title">{MESES[viewMonth.month]} <span className="bcal-year">{viewMonth.year}</span></h2>
                <button type="button" className="bcal-navbtn" onClick={onNextMonth}>›</button>
            </div>
            <div className="bcal-dow-row">
                {DIAS_CORTO.map(d => <div key={d} className="bcal-dow">{d}</div>)}
            </div>
            <div className="bcal-body">
                {weeks.map((week, wi) => (
                    <div key={wi} className="bcal-week">
                        {week.map((d, di) => {
                            if (!d) return <div key={`e-${wi}-${di}`} className="bcal-cell empty" />;
                            const isSel = isSameDay(d, sel);
                            const isTod = isSameDay(d, today);
                            const cnt = clasesMap[toYMD(d)]?.length ?? 0;
                            return (
                                <button
                                    type="button"
                                    key={toYMD(d)}
                                    onClick={() => onSelectDate(toYMD(d))}
                                    className={`bcal-cell ${isSel ? 'sel' : ''} ${isTod && !isSel ? 'tod' : ''}`}
                                >
                                    <span className="bcal-num">{d.getDate()}</span>
                                    {cnt > 0 && (
                                        <div className="bcal-dots">
                                            {Array.from({ length: Math.min(cnt, 3) }).map((_, i) => (
                                                <span key={i} className={`bdot ${isSel ? 'bdot-sel' : ''}`} />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

function WeekStrip({ selectedDate, onSelectDate, clasesMap }) {
    const sel = parseYMD(selectedDate);
    const today = new Date(); today.setHours(0,0,0,0);
    const week = useMemo(() => {
        const mon = startOfWeekMon(sel);
        return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
    }, [selectedDate]);

    return (
        <div className="wstrip">
            <button type="button" className="wstrip-nav" onClick={() => onSelectDate(toYMD(addDays(parseYMD(selectedDate), -7)))}>‹</button>
            <div className="wstrip-days">
                {week.map(d => {
                    const ymd = toYMD(d);
                    const isSel = isSameDay(d, sel);
                    const isTod = isSameDay(d, today);
                    const dot = (clasesMap[ymd]?.length ?? 0) > 0;
                    return (
                        <button type="button" key={ymd} onClick={() => onSelectDate(ymd)} className={`wday ${isSel ? 'sel' : ''} ${isTod && !isSel ? 'tod' : ''}`}>
                            <span className="wday-dow">{DIAS_CORTO[d.getDay() === 0 ? 6 : d.getDay() - 1]}</span>
                            <span className="wday-num">{d.getDate()}</span>
                            {dot && <span className={`wdot ${isSel ? 'wdot-sel' : ''}`} />}
                        </button>
                    );
                })}
            </div>
            <button type="button" className="wstrip-nav" onClick={() => onSelectDate(toYMD(addDays(parseYMD(selectedDate), 7)))}>›</button>
        </div>
    );
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

            const vpPad = 8;
            const width = Math.min(rect.width, window.innerWidth - vpPad * 2);
            const left = Math.min(Math.max(rect.left, vpPad), window.innerWidth - width - vpPad);

            setDropPos({
                top: showAbove ? Math.max(vpPad, rect.top - dropH - 4) : rect.bottom + 4,
                left,
                width,
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

export default function InstructorClases({ user, clases, filters }) {
    const [fecha,  setFecha]  = useState(filters?.fecha  ?? '');
    const [estado, setEstado] = useState(filters?.estado ?? '');

    const estadoConfig = {
        programada: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  label: 'Programada' },
        en_curso:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'En Curso'   },
        finalizada: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Finalizada' },
        cancelada:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Cancelada'  },
    };

    const buscar  = () => router.get('/instructor/clases', { fecha, estado }, { preserveState: true });
    const fmtFecha = (dt) => dt ? new Date(dt).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const hora     = (dt) => dt ? new Date(dt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '';

    const inp = { background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: '#fff', padding: '0.625rem 1rem', fontSize: '0.875rem', outline: 'none' };

    const today = new Date(); today.setHours(0,0,0,0);
    const [selectedDate, setSelectedDate] = useState(filters?.fecha || toYMD(today));
    const [calView, setCalView] = useState('month');
    const [viewMonth, setViewMonth] = useState(() => {
        const d = parseYMD(filters?.fecha || toYMD(today));
        return { year: d.getFullYear(), month: d.getMonth() };
    });

    const clasesMap = useMemo(() => {
        const m = {};
        (clases?.data ?? []).forEach(c => {
            if (!c.fecha_hora_inicio) return;
            const ymd = new Date(c.fecha_hora_inicio);
            const key = toYMD(ymd);
            if (!m[key]) m[key] = [];
            m[key].push(c);
        });
        return m;
    }, [clases?.data]);

    const handleSelectDate = (d) => {
        setSelectedDate(d);
        setFecha(d); // solo sincroniza visual + input, mantiene flujo actual de botón Filtrar
        const pd = parseYMD(d);
        setViewMonth({ year: pd.getFullYear(), month: pd.getMonth() });
    };

    const prevMonth = () => setViewMonth(v => {
        const d = new Date(v.year, v.month - 1, 1);
        return { year: d.getFullYear(), month: d.getMonth() };
    });
    const nextMonth = () => setViewMonth(v => {
        const d = new Date(v.year, v.month + 1, 1);
        return { year: d.getFullYear(), month: d.getMonth() };
    });

    const limpiar = () => {
        setFecha('');
        setEstado('');
        setSelectedDate(toYMD(today));
        setViewMonth({ year: today.getFullYear(), month: today.getMonth() });
        router.get('/instructor/clases', {});
    };

    const estadoOptions = [
        { value: 'programada', label: 'Programada' },
        { value: 'en_curso', label: 'En Curso' },
        { value: 'finalizada', label: 'Finalizada' },
        { value: 'cancelada', label: 'Cancelada' },
    ];

    return (
        <InstructorLayout user={user}>
            <Head title="Mis Clases" />
            <div className="icr">
                <div className="icr-hd">
                    <h1 className="icr-title">CLASES</h1>
                    <p className="icr-sub">Consulta todas tus clases asignadas</p>
                </div>

                <div className="ical-card ical-card-compact" style={{ marginBottom: '0.75rem' }}>
                    <div className="view-tabs" style={{ padding: '1rem 1rem 0' }}>
                        <button type="button" className={`vtab ${calView === 'month' ? 'act' : ''}`} onClick={() => setCalView('month')}>Mes</button>
                        <button type="button" className={`vtab ${calView === 'week' ? 'act' : ''}`} onClick={() => setCalView('week')}>Semana</button>
                    </div>
                    {calView === 'month' ? (
                        <BigCalendar
                            selectedDate={selectedDate}
                            onSelectDate={handleSelectDate}
                            clasesMap={clasesMap}
                            viewMonth={viewMonth}
                            onPrevMonth={prevMonth}
                            onNextMonth={nextMonth}
                        />
                    ) : (
                        <div style={{ padding: '1rem 1rem 0.8rem' }}>
                            <WeekStrip selectedDate={selectedDate} onSelectDate={handleSelectDate} clasesMap={clasesMap} />
                        </div>
                    )}
                </div>

                <div className="ifilters">
                    <div className="ifg">
                        <label className="ilabel">Fecha</label>
                        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inp} />
                    </div>
                    <div className="ifg">
                        <label className="ilabel">Estado</label>
                        <NeonSelect
                            value={estado}
                            onChange={setEstado}
                            options={estadoOptions}
                            placeholder="Todos"
                        />
                    </div>
                    <button onClick={buscar} className="if-btn if-btn-primary">Filtrar</button>
                    <button onClick={limpiar} className="if-btn if-btn-ghost">Limpiar</button>
                </div>

                <div className="itable-card">
                    {clases.data && clases.data.length > 0 ? (
                        <>
                            <div className="itable-desktop" style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                    <tr style={{ borderBottom: '2px solid rgba(255,20,147,0.3)' }}>
                                        {['Fecha','Tipo de Clase','Horario','Sala','Reservas','Asistencias','Estado','Acciones'].map(h => (
                                            <th key={h} style={{ padding: '1rem 1.25rem', color: '#FF1493', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {clases.data.map((clase, i) => {
                                        const cfg = estadoConfig[clase.estado] ?? estadoConfig.programada;
                                        return (
                                            <tr key={clase.id} style={{ borderBottom: '1px solid rgba(255,20,147,0.1)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,20,147,0.02)' }}>
                                                <td style={{ padding: '1rem 1.25rem', color: '#fff', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{fmtFecha(clase.fecha_hora_inicio)}</td>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: clase.tipo_clase?.color ?? '#FF1493', flexShrink: 0 }} />
                                                        <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>{clase.tipo_clase?.nombre}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem', color: '#ccc', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{hora(clase.fecha_hora_inicio)} – {hora(clase.fecha_hora_fin)}</td>
                                                <td style={{ padding: '1rem 1.25rem', color: '#ccc', fontSize: '0.875rem' }}>{clase.sala ?? '—'}</td>
                                                <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                                                    <span style={{ color: (clase.total_reservas ?? 0) >= clase.capacidad_maxima ? '#ef4444' : '#22c55e', fontWeight: 700, fontSize: '0.875rem' }}>{clase.total_reservas ?? 0}</span>
                                                    <span style={{ color: '#666', fontSize: '0.875rem' }}> / {clase.capacidad_maxima}</span>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem', color: '#FF1493', fontSize: '0.875rem', fontWeight: 700, textAlign: 'center' }}>{clase.asistencias_count ?? 0}</td>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}`, borderRadius: 20, padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{cfg.label}</span>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    {(clase.estado === 'programada' || clase.estado === 'en_curso') && (
                                                        <Link href={`/instructor/asistencias?clase_id=${clase.id}`} style={{ background: 'rgba(255,20,147,0.15)', border: '1px solid #FF1493', color: '#FF1493', borderRadius: 6, padding: '0.375rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>✅ Asistencia</Link>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="itable-mobile">
                                {clases.data.map((clase) => {
                                    const cfg = estadoConfig[clase.estado] ?? estadoConfig.programada;
                                    return (
                                        <div key={`m-${clase.id}`} className="mclass">
                                            <div className="mclass-row">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                                                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: clase.tipo_clase?.color ?? '#FF1493', flexShrink: 0 }} />
                                                    <strong style={{ color: '#fff', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {clase.tipo_clase?.nombre}
                                                    </strong>
                                                </div>
                                                <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}55`, borderRadius: 20, padding: '0.2rem 0.6rem', fontSize: '0.68rem', fontWeight: 700 }}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <div className="mclass-grid">
                                                <span>{fmtFecha(clase.fecha_hora_inicio)}</span>
                                                <span>{hora(clase.fecha_hora_inicio)} – {hora(clase.fecha_hora_fin)}</span>
                                                <span>Sala: {clase.sala ?? '—'}</span>
                                                <span>Reservas: {clase.total_reservas ?? 0}/{clase.capacidad_maxima}</span>
                                                <span>Asistencias: {clase.asistencias_count ?? 0}</span>
                                            </div>
                                            {(clase.estado === 'programada' || clase.estado === 'en_curso') && (
                                                <div style={{ marginTop: '0.6rem' }}>
                                                    <Link
                                                        href={`/instructor/asistencias?clase_id=${clase.id}`}
                                                        style={{ background: 'rgba(255,20,147,0.15)', border: '1px solid #FF1493', color: '#FF1493', borderRadius: 6, padding: '0.35rem 0.7rem', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex' }}
                                                    >
                                                        Asistencia
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {clases.last_page > 1 && (
                                <div className="ipager">
                                    <span style={{ color: '#666', fontSize: '0.875rem' }}>Mostrando {clases.from}–{clases.to} de {clases.total} clases</span>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {clases.links.map((link, i) => (
                                            <button key={i} disabled={!link.url} onClick={() => link.url && router.get(link.url)} dangerouslySetInnerHTML={{ __html: link.label }}
                                                    style={{ background: link.active ? '#FF1493' : 'rgba(255,20,147,0.1)', border: '1px solid rgba(255,20,147,0.3)', color: link.active ? '#000' : '#FF1493', padding: '0.375rem 0.75rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: link.url ? 'pointer' : 'not-allowed', opacity: link.url ? 1 : 0.4 }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="iempty">
                            <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>No se encontraron clases con los filtros aplicados.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                /* ...existing code... */
                .icr { max-width: 1100px; margin: 0 auto; display:flex; flex-direction:column; gap:1rem; }
                .icr-hd { margin-bottom: 0.25rem; }
                .icr-title { font-size: clamp(1.8rem, 5vw, 2.3rem); font-weight: 900; color: #FF1493; margin: 0 0 0.35rem; letter-spacing: 1.5px; text-shadow: 0 0 20px rgba(255,20,147,0.5); }
                .icr-sub { color: rgba(255,255,255,0.45); margin: 0; font-size: 0.9rem; }

                .ical-card { background:rgba(255,20,147,0.03); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid rgba(255,20,147,0.2); border-radius:20px; overflow:visible; box-shadow:0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,20,147,0.1); }

                /* Compacto en desktop (como admin, pero más contenido) */
                .ical-card-compact { width: 100%; max-width: 820px; margin-left: auto; margin-right: auto; }

                .view-tabs { display:flex; gap:0.35rem; }
                .vtab { background:rgba(255,20,147,0.04); border:1px solid rgba(255,20,147,0.15); color:rgba(255,255,255,0.4); padding:0.45rem 1rem; border-radius:9px; font-size:0.78rem; font-weight:700; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
                .vtab.act { background:rgba(255,20,147,0.15); border-color:rgba(255,20,147,0.4); color:#FF1493; }

                .bcal { padding:1rem; }
                .bcal-nav { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
                .bcal-navbtn { background:rgba(255,20,147,0.08); border:1px solid rgba(255,20,147,0.25); color:#FF1493; width:34px; height:34px; border-radius:10px; cursor:pointer; font-size:1.1rem; display:flex; align-items:center; justify-content:center; }
                .bcal-title { color:#fff; font-size:1.1rem; font-weight:900; margin:0; }
                .bcal-year { color:rgba(255,20,147,0.65); font-size:0.85rem; font-weight:600; margin-left:0.3rem; }
                .bcal-dow-row { display:grid; grid-template-columns:repeat(7,1fr); margin-bottom:0.25rem; }
                .bcal-dow { text-align:center; color:rgba(255,20,147,0.6); font-size:0.62rem; font-weight:800; padding:0.35rem 0; letter-spacing:1px; text-transform:uppercase; }
                .bcal-body { display:flex; flex-direction:column; gap:2px; }
                .bcal-week { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
                .bcal-cell { aspect-ratio:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; background:none; border:none; color:rgba(255,255,255,0.65); border-radius:10px; cursor:pointer; padding:0.15rem; min-height:42px; }
                .bcal-cell.empty { cursor:default; }
                .bcal-cell:not(.empty):hover:not(.sel) { background:rgba(255,20,147,0.1); color:#FF1493; }
                .bcal-cell.tod .bcal-num { color:#FF1493; font-weight:900; background:rgba(255,20,147,0.12); border:1.5px solid rgba(255,20,147,0.45); border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; }
                .bcal-cell.sel { background:#FF1493 !important; color:#000 !important; box-shadow:0 2px 14px rgba(255,20,147,0.5); }
                .bcal-num { font-size:0.82rem; font-weight:500; line-height:1; }
                .bcal-dots { display:flex; gap:3px; }
                .bdot { width:5px; height:5px; border-radius:50%; background:#FF1493; }
                .bdot-sel { background:rgba(0,0,0,0.55); }

                .wstrip { display:flex; align-items:center; gap:0.3rem; }
                .wstrip-nav { background:rgba(255,20,147,0.08); border:1px solid rgba(255,20,147,0.2); color:#FF1493; width:32px; height:32px; border-radius:8px; cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
                .wstrip-days { flex:1; display:grid; grid-template-columns:repeat(7,1fr); gap:3px; }
                .wday { display:flex; flex-direction:column; align-items:center; gap:3px; padding:0.62rem 0.2rem; border-radius:12px; border:none; background:none; cursor:pointer; }
                .wday:hover:not(.sel) { background:rgba(255,20,147,0.08); }
                .wday.sel { background:#FF1493 !important; }
                .wday.sel .wday-dow, .wday.sel .wday-num { color:#000 !important; }
                .wday-dow { font-size:0.56rem; font-weight:800; color:rgba(255,255,255,0.4); text-transform:uppercase; }
                .wday-num { font-size:0.95rem; font-weight:600; color:rgba(255,255,255,0.8); }
                .wdot { width:5px; height:5px; border-radius:50%; background:#FF1493; }

                .ifilters { background:rgba(255,20,147,0.03); border:1px solid rgba(255,20,147,0.2); border-radius:14px; padding:1rem 1.1rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:flex-end; }
                .ifg { display:flex; flex-direction:column; gap:0.4rem; min-width:180px; }
                .ilabel { color:#FF1493; font-size:0.68rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; }
                .if-btn { border-radius:10px; padding:0.62rem 1.1rem; font-size:0.82rem; font-weight:800; cursor:pointer; border:none; }
                .if-btn-primary { background:linear-gradient(135deg,#FF1493,#C71585); color:#000; }
                .if-btn-ghost { background:transparent; border:1px solid rgba(255,20,147,0.4); color:#FF1493; }

                .itable-card { background:rgba(255,20,147,0.03); border:1px solid rgba(255,20,147,0.2); border-radius:14px; overflow:hidden; box-shadow:0 8px 28px rgba(0,0,0,0.25); }
                .itable-mobile { display:none; padding:0.75rem; gap:0.65rem; }
                .mclass { background:rgba(255,20,147,0.04); border:1px solid rgba(255,20,147,0.15); border-radius:12px; padding:0.75rem; }
                .mclass-row { display:flex; justify-content:space-between; align-items:center; gap:0.5rem; }
                .mclass-grid { display:grid; grid-template-columns:1fr; gap:0.2rem; margin-top:0.55rem; color:rgba(255,255,255,0.72); font-size:0.78rem; }
                .ipager { padding:1rem 1.25rem; border-top:1px solid rgba(255,20,147,0.2); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; }
                .iempty { padding:3rem 1rem; text-align:center; }

                /* Dropdown neón (igual línea visual a AsistenciaClase) */
                .nsel-wrap { position: relative; }
                .nsel-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.625rem 1rem;
                    background: rgba(0,0,0,0.5);
                    border: 2px solid rgba(255,20,147,0.3);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all .2s;
                    font-family: inherit;
                    min-height: 42px;
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

                @media (max-width: 900px) {
                    .itable-desktop { display:none; }
                    .itable-mobile { display:flex; flex-direction:column; }
                    .ifilters { padding:0.9rem; }

                    /* En móvil vuelve a ocupar todo el ancho */
                    .ical-card-compact { max-width: 100%; }
                }

                @media (max-width: 640px) {
                    .icr-title { font-size:1.6rem; }
                    .ifg { min-width:100%; }
                    .if-btn { width:100%; }
                    .bcal-cell { min-height:40px; }
                    .bcal-dow { font-size:0.55rem; }
                    .nsel-btn { min-height: 44px; }
                    .nsel-drop { max-height: min(50vh, 260px); }
                }
                /* ...existing code... */
            `}</style>
        </InstructorLayout>
    );
}
