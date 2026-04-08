import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// ── Helpers ───────────────────────────────────────────────────────────────────
const DIAS_CORTO = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MESES      = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function toYMD(d) {
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}
function parseYMD(s) {
    if (!s) return new Date();
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}
function startOfWeekMon(d) {
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const r = new Date(d); r.setDate(d.getDate() + diff); r.setHours(0,0,0,0);
    return r;
}
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function isSameDay(a, b) {
    return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}

/**
 * Calcula el estado real de una clase basado en la hora actual.
 * Esto refleja la misma lógica del backend (actualizarEstadosAutomaticos)
 * pero en el cliente para que la UI sea reactiva sin recargar.
 */
function calcEstadoActual(clase) {
    if (!clase.fecha_hora_inicio || !clase.fecha_hora_fin) return clase.estado;
    // No tocar canceladas
    if (clase.estado === 'cancelada') return 'cancelada';
    const ahora = new Date();
    const inicio = new Date(clase.fecha_hora_inicio);
    const fin    = new Date(clase.fecha_hora_fin);
    if (ahora >= fin)    return 'finalizada';
    if (ahora >= inicio) return 'en_curso';
    return 'programada';
}

const estadoConfig = {
    programada: { bg:'rgba(59,130,246,0.18)', border:'#3b82f6', text:'#60a5fa', label:'Programada' },
    en_curso:   { bg:'rgba(34,197,94,0.18)',  border:'#22c55e', text:'#4ade80', label:'En Curso'   },
    finalizada: { bg:'rgba(107,114,128,0.18)',border:'#6b7280', text:'#9ca3af', label:'Finalizada' },
    cancelada:  { bg:'rgba(239,68,68,0.18)',  border:'#ef4444', text:'#f87171', label:'Cancelada'  },
};

const toDatetimeLocal = v => {
    if (!v) return '';
    if (v.includes('T') && !v.includes('Z') && !v.includes('.')) return v.slice(0, 16);
    if (v.includes('Z') || v.includes('.')) {
        const d = new Date(v), p = n => String(n).padStart(2,'0');
        return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
    }
    return v.replace(' ','T').slice(0,16);
};

function fmtDatetime(d) {
    if (!d) return '—';
    return new Date(d).toLocaleString('es-CO', { dateStyle:'short', timeStyle:'short' });
}
function fmtHora(d) {
    if (!d) return '—';
    return new Date(d).toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' });
}
function fmtFechaCorta(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-CO', { weekday:'short', day:'numeric', month:'short' });
}

// ── Custom Neon Select con Portal (fix dropdown cortado) ─────────────────────
function NeonSelect({ value, onChange, options, placeholder = '-- Seleccionar --' }) {
    const [open,    setOpen]    = useState(false);
    const [dropPos, setDropPos] = useState({ top:0, left:0, width:0 });
    const btnRef = useRef(null);
    const dropRef = useRef(null);

    // Calcular posición con getBoundingClientRect para usar position:fixed
    const openDropdown = useCallback(() => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropH = Math.min(options.length * 44 + 8, 240);
            const showAbove = spaceBelow < dropH && rect.top > dropH;
            setDropPos({
                top:   showAbove ? rect.top - dropH - 4 : rect.bottom + 4,
                left:  rect.left,
                width: rect.width,
            });
        }
        setOpen(o => !o);
    }, [options.length]);

    useEffect(() => {
        if (!open) return;
        const h = e => {
            if (
                btnRef.current && !btnRef.current.contains(e.target) &&
                dropRef.current && !dropRef.current.contains(e.target)
            ) setOpen(false);
        };
        const onScroll = () => setOpen(false);
        document.addEventListener('mousedown', h);
        document.addEventListener('scroll', onScroll, true);
        return () => {
            document.removeEventListener('mousedown', h);
            document.removeEventListener('scroll', onScroll, true);
        };
    }, [open]);

    const selected = options.find(o => String(o.value) === String(value));

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                onClick={openDropdown}
                className={`nsel-btn ${open ? 'open' : ''}`}
            >
                <span className={selected ? 'nsel-val' : 'nsel-ph'}>
                    {selected ? (
                        <span style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                            {selected.dot && <span className="nsel-dot-sm" style={{ background:selected.dot }} />}
                            {selected.label}
                        </span>
                    ) : placeholder}
                </span>
                <span className={`nsel-arr ${open ? 'up' : ''}`}>›</span>
            </button>

            {open && createPortal(
                <div
                    ref={dropRef}
                    className="nsel-drop"
                    style={{
                        position: 'fixed',
                        top:   dropPos.top,
                        left:  dropPos.left,
                        width: dropPos.width,
                        zIndex: 99999,
                    }}
                >
                    <button type="button" className="nsel-opt nsel-opt-empty"
                            onClick={() => { onChange(''); setOpen(false); }}>
                        {placeholder}
                    </button>
                    {options.map(o => (
                        <button type="button" key={o.value}
                                className={`nsel-opt ${String(value)===String(o.value) ? 'active' : ''}`}
                                onClick={() => { onChange(o.value); setOpen(false); }}>
                            {o.dot && <span className="nsel-dot-sm" style={{ background:o.dot }} />}
                            <span className="nsel-opt-lbl">{o.label}</span>
                            {String(value)===String(o.value) && <span className="nsel-chk">✓</span>}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
}

// ── Calendario mensual grande ─────────────────────────────────────────────────
function BigCalendar({ selectedDate, onSelectDate, clasesMap, viewMonth, onPrevMonth, onNextMonth }) {
    const sel   = parseYMD(selectedDate);
    const today = new Date(); today.setHours(0,0,0,0);

    const firstDay = new Date(viewMonth.year, viewMonth.month, 1);
    const lastDay  = new Date(viewMonth.year, viewMonth.month + 1, 0);
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
                <button className="bcal-navbtn" onClick={onPrevMonth}>‹</button>
                <h2 className="bcal-title">{MESES[viewMonth.month]} <span className="bcal-year">{viewMonth.year}</span></h2>
                <button className="bcal-navbtn" onClick={onNextMonth}>›</button>
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
                            const cnt   = clasesMap[toYMD(d)]?.length ?? 0;
                            return (
                                <button key={toYMD(d)} onClick={() => onSelectDate(toYMD(d))}
                                        className={`bcal-cell ${isSel ? 'sel' : ''} ${isTod && !isSel ? 'tod' : ''}`}>
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

// ── Strip semanal ─────────────────────────────────────────────────────────────
function WeekStrip({ selectedDate, onSelectDate, clasesMap }) {
    const sel   = parseYMD(selectedDate);
    const today = new Date(); today.setHours(0,0,0,0);
    const week  = useMemo(() => {
        const mon = startOfWeekMon(sel);
        return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
    }, [selectedDate]);

    return (
        <div className="wstrip">
            <button className="wstrip-nav" onClick={() => onSelectDate(toYMD(addDays(parseYMD(selectedDate), -7)))}>‹</button>
            <div className="wstrip-days">
                {week.map(d => {
                    const ymd   = toYMD(d);
                    const isSel = isSameDay(d, sel);
                    const isTod = isSameDay(d, today);
                    const dot   = (clasesMap[ymd]?.length ?? 0) > 0;
                    return (
                        <button key={ymd} onClick={() => onSelectDate(ymd)}
                                className={`wday ${isSel ? 'sel' : ''} ${isTod && !isSel ? 'tod' : ''}`}>
                            <span className="wday-dow">{DIAS_CORTO[d.getDay() === 0 ? 6 : d.getDay()-1]}</span>
                            <span className="wday-num">{d.getDate()}</span>
                            {dot && <span className={`wdot ${isSel ? 'wdot-sel' : ''}`} />}
                        </button>
                    );
                })}
            </div>
            <button className="wstrip-nav" onClick={() => onSelectDate(toYMD(addDays(parseYMD(selectedDate), 7)))}>›</button>
        </div>
    );
}

// ── Tarjeta clase ─────────────────────────────────────────────────────────────
function ClaseCard({ clase, onEdit, onDelete, onNavigate, showDate = false }) {
    // Auto-calcular estado basado en hora actual
    const estadoReal = calcEstadoActual(clase);
    const est        = estadoConfig[estadoReal] ?? estadoConfig.programada;

    // Solo se puede editar/eliminar si está programada o cancelada
    const esEditable    = estadoReal === 'programada' || estadoReal === 'cancelada';
    const esEliminable  = estadoReal === 'programada' || estadoReal === 'cancelada';

    const pct = clase.capacidad_maxima > 0
        ? Math.round(((clase.total_reservas ?? 0) / clase.capacidad_maxima) * 100) : 0;

    return (
        <div className={`ccard ${!esEditable ? 'ccard-locked' : ''}`}
             style={{ '--cc': clase.tipo_clase?.color ?? '#FF1493' }}
             onClick={() => onNavigate(clase)}>
            <div className="ccard-bar" style={{ background: clase.tipo_clase?.color ?? '#FF1493' }} />
            <div className="ccard-body">
                <div className="ccard-row">
                    <div className="ccard-info">
                        <div className="ccard-name-row">
                            <span className="ccard-name">{clase.tipo_clase?.nombre ?? '—'}</span>
                            {estadoReal === 'en_curso' && (
                                <span className="live-badge">● LIVE</span>
                            )}
                        </div>
                        {showDate && (
                            <span className="ccard-date">{fmtFechaCorta(clase.fecha_hora_inicio)}</span>
                        )}
                        <span className="ccard-time">{fmtHora(clase.fecha_hora_inicio)} — {fmtHora(clase.fecha_hora_fin)}</span>
                        <span className="ccard-instr">{clase.instructor?.name ?? '—'}</span>
                        {clase.sala && <span className="ccard-sala">{clase.sala}</span>}
                    </div>
                    <div className="ccard-meta">
                        <span className="ccard-badge" style={{ background:est.bg, color:est.text, border:`1px solid ${est.border}40` }}>
                            {est.label}
                        </span>
                        <div className="ccard-cupos">
                            <span style={{ color: clase.tipo_clase?.color ?? '#FF1493', fontWeight:900 }}>
                                {clase.total_reservas ?? 0}/{clase.capacidad_maxima}
                            </span>
                            <span className="cupos-lbl">cupos</span>
                        </div>
                    </div>
                </div>

                <div className="ocp-track">
                    <div className="ocp-fill" style={{
                        width:`${Math.min(pct,100)}%`,
                        background: pct>=90 ? '#ef4444' : pct>=60 ? '#f59e0b' : (clase.tipo_clase?.color ?? '#FF1493'),
                    }} />
                </div>

                <div className="ccard-acts" onClick={e => e.stopPropagation()}>
                    {esEditable ? (
                        <button className="cact cact-edit" onClick={() => onEdit(clase)}>Editar</button>
                    ) : (
                        <span className="cact-blocked" title={
                            estadoReal === 'en_curso'   ? 'No se puede editar una clase en curso' :
                                estadoReal === 'finalizada' ? 'Clase finalizada — se eliminará al liquidar' : ''
                        }>
                            {estadoReal === 'en_curso'   ? 'En curso'   : ''}
                            {estadoReal === 'finalizada' ? 'Finalizada' : ''}
                        </span>
                    )}
                    {esEliminable ? (
                        <button className="cact cact-del" onClick={() => onDelete(clase)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                    ) : estadoReal === 'finalizada' ? (
                        <span className="cact-lock" title="Se elimina al registrar el pago de liquidación">Liquidar</span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

// ── Modal crear/editar ────────────────────────────────────────────────────────
function ClaseModal({ clase, tiposClase, instructores, onClose }) {
    const editando = !!clase;
    const { data, setData, post, put, processing, errors } = useForm({
        tipo_clase_id:     clase?.tipo_clase_id     ?? '',
        instructor_id:     clase?.instructor_id     ?? '',
        fecha_hora_inicio: clase?.fecha_hora_inicio_local ?? (clase ? toDatetimeLocal(clase.fecha_hora_inicio) : ''),
        fecha_hora_fin:    clase?.fecha_hora_fin_local    ?? (clase ? toDatetimeLocal(clase.fecha_hora_fin)    : ''),
        capacidad_maxima:  clase?.capacidad_maxima  ?? '',
        sala:              clase?.sala              ?? '',
        estado:            clase?.estado            ?? 'programada',
    });

    const handleSubmit = e => {
        e.preventDefault();
        if (editando) put(route('admin.clases.update', clase.id), { onSuccess: onClose });
        else          post(route('admin.clases.store'),            { onSuccess: onClose });
    };

    return (
        <div className="moverlay" onClick={onClose}>
            <div className="mglass" onClick={e => e.stopPropagation()}>
                <div className="mhd">
                    <h2 className="mhd-title">{editando ? 'Editar Clase' : 'Nueva Clase'}</h2>
                    <button className="mclose" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit} className="mform">
                    <div className="frow2">
                        <div className="fg">
                            <label className="flbl">Tipo de Clase *</label>
                            <NeonSelect value={data.tipo_clase_id} onChange={v => setData('tipo_clase_id', v)}
                                        options={tiposClase.map(t => ({ value:t.id, label:t.nombre, dot:t.color }))}
                                        placeholder="-- Seleccionar --" />
                            {errors.tipo_clase_id && <p className="ferr">{errors.tipo_clase_id}</p>}
                        </div>
                        <div className="fg">
                            <label className="flbl">Instructor *</label>
                            <NeonSelect value={data.instructor_id} onChange={v => setData('instructor_id', v)}
                                        options={instructores.map(i => ({ value:i.id, label:i.name }))}
                                        placeholder="-- Seleccionar --" />
                            {errors.instructor_id && <p className="ferr">{errors.instructor_id}</p>}
                        </div>
                    </div>
                    <div className="frow2">
                        <div className="fg">
                            <label className="flbl">Inicio *</label>
                            <input type="datetime-local" value={data.fecha_hora_inicio}
                                   onChange={e => setData('fecha_hora_inicio', e.target.value)} required className="finp" />
                            {errors.fecha_hora_inicio && <p className="ferr">{errors.fecha_hora_inicio}</p>}
                        </div>
                        <div className="fg">
                            <label className="flbl">Fin *</label>
                            <input type="datetime-local" value={data.fecha_hora_fin}
                                   onChange={e => setData('fecha_hora_fin', e.target.value)} required className="finp" />
                            {errors.fecha_hora_fin && <p className="ferr">{errors.fecha_hora_fin}</p>}
                        </div>
                    </div>
                    <div className="frow2">
                        <div className="fg">
                            <label className="flbl">Capacidad *</label>
                            <input type="number" value={data.capacidad_maxima}
                                   onChange={e => setData('capacidad_maxima', e.target.value)} required min={1} placeholder="20" className="finp" />
                            {errors.capacidad_maxima && <p className="ferr">{errors.capacidad_maxima}</p>}
                        </div>
                        <div className="fg">
                            <label className="flbl">Sala</label>
                            <input type="text" value={data.sala}
                                   onChange={e => setData('sala', e.target.value)} placeholder="Sala Principal" className="finp" />
                        </div>
                    </div>
                    {editando && (
                        <div className="fg">
                            <label className="flbl">Estado</label>
                            <NeonSelect value={data.estado} onChange={v => setData('estado', v || 'programada')}
                                        options={[
                                            { value:'programada', label:'Programada' },
                                            { value:'en_curso',   label:'En Curso'   },
                                            { value:'finalizada', label:'Finalizada' },
                                            { value:'cancelada',  label:'Cancelada'  },
                                        ]} />
                        </div>
                    )}
                    <div className="mfoot">
                        <button type="button" onClick={onClose} className="mbtn-c">Cancelar</button>
                        <button type="submit" disabled={processing} className="mbtn-ok">
                            {processing ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear clase'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function ClasesIndex({ auth, clases, tiposClase, instructores, filters }) {
    const today = new Date(); today.setHours(0,0,0,0);

    // Vista principal: 'calendario' | 'todas'
    const [mainView,     setMainView]     = useState('calendario');
    const [selectedDate, setSelectedDate] = useState(filters.fecha || toYMD(today));
    const [calView,      setCalView]      = useState('month');
    const [viewMonth,    setViewMonth]    = useState(() => {
        const d = parseYMD(filters.fecha || toYMD(today));
        return { year: d.getFullYear(), month: d.getMonth() };
    });
    const [showModal,    setShowModal]    = useState(false);
    const [editingClase, setEditingClase] = useState(null);
    const [tipoFiltro,   setTipoFiltro]  = useState(filters.tipo_clase_id ?? '');
    const [instrFiltro,  setInstrFiltro] = useState(filters.instructor_id ?? '');
    // Filtro de estado para la vista "todas"
    const [estadoFiltro, setEstadoFiltro] = useState('');

    // Auto-refresh de estados cada 30 segundos
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 30_000);
        return () => clearInterval(id);
    }, []);

    // Indexar clases por fecha
    const clasesMap = useMemo(() => {
        const m = {};
        clases.forEach(c => {
            if (!c.fecha_hora_inicio) return;
            const ymd = toDatetimeLocal(c.fecha_hora_inicio).slice(0, 10);
            if (!m[ymd]) m[ymd] = [];
            m[ymd].push(c);
        });
        return m;
    }, [clases]);

    // Clases del día seleccionado
    const clasesDia = useMemo(() => {
        const lista = clasesMap[selectedDate] ?? [];
        return lista
            .filter(c => !tipoFiltro  || String(c.tipo_clase_id) === String(tipoFiltro))
            .filter(c => !instrFiltro || String(c.instructor_id) === String(instrFiltro))
            .sort((a, b) => new Date(a.fecha_hora_inicio) - new Date(b.fecha_hora_inicio));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clasesMap, selectedDate, tipoFiltro, instrFiltro, tick]);

    // Todas las clases con filtros
    const todasClases = useMemo(() => {
        return clases
            .filter(c => !tipoFiltro    || String(c.tipo_clase_id) === String(tipoFiltro))
            .filter(c => !instrFiltro   || String(c.instructor_id) === String(instrFiltro))
            .filter(c => !estadoFiltro  || calcEstadoActual(c) === estadoFiltro)
            .sort((a, b) => new Date(b.fecha_hora_inicio) - new Date(a.fecha_hora_inicio));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clases, tipoFiltro, instrFiltro, estadoFiltro, tick]);

    // Conteo por estado (para los chips de filtro)
    const cuentaEstados = useMemo(() => {
        const c = { programada:0, en_curso:0, finalizada:0, cancelada:0 };
        clases.forEach(cl => { const e = calcEstadoActual(cl); if (c[e] !== undefined) c[e]++; });
        return c;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clases, tick]);

    const handleSelectDate = d => {
        setSelectedDate(d);
        const pd = parseYMD(d);
        setViewMonth({ year: pd.getFullYear(), month: pd.getMonth() });
        router.get(route('admin.clases.index'), {
            fecha: d, vista: 'dia',
            tipo_clase_id: tipoFiltro || undefined,
            instructor_id: instrFiltro || undefined,
        }, { preserveState: true, replace: true });
    };

    const prevMonth = () => setViewMonth(v => {
        const d = new Date(v.year, v.month - 1, 1);
        return { year: d.getFullYear(), month: d.getMonth() };
    });
    const nextMonth = () => setViewMonth(v => {
        const d = new Date(v.year, v.month + 1, 1);
        return { year: d.getFullYear(), month: d.getMonth() };
    });

    const handleDelete = c => {
        const estadoReal = calcEstadoActual(c);
        if (estadoReal === 'finalizada' || estadoReal === 'en_curso') return;
        if (confirm(`¿Eliminar la clase de ${c.tipo_clase?.nombre}?`)) router.delete(route('admin.clases.destroy', c.id));
    };

    const handleEdit = c => {
        const estadoReal = calcEstadoActual(c);
        if (estadoReal === 'finalizada' || estadoReal === 'en_curso') return;
        setEditingClase(c);
        setShowModal(true);
    };

    const selParsed = parseYMD(selectedDate);
    const dayLabel  = selParsed.toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' });
    const isToday   = isSameDay(selParsed, today);

    const tiposOpts  = tiposClase.map(t => ({ value:t.id, label:t.nombre, dot:t.color }));
    const instrOpts  = instructores.map(i => ({ value:i.id, label:i.name }));

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Gestión de Clases" />

            {showModal && (
                <ClaseModal clase={editingClase} tiposClase={tiposClase} instructores={instructores}
                            onClose={() => { setShowModal(false); setEditingClase(null); }} />
            )}

            <div className="cr">

                {/* ── Header ── */}
                <div className="cr-hd">
                    <div>
                        <h1 className="cr-title">CLASES</h1>
                        {mainView === 'calendario' && (
                            <p className="cr-sub">
                                {isToday && <span className="hoy-chip">Hoy</span>}
                                <span style={{ textTransform:'capitalize' }}>{dayLabel}</span>
                            </p>
                        )}
                        {mainView === 'todas' && (
                            <p className="cr-sub">
                                <span>{clases.length} clases cargadas</span>
                            </p>
                        )}
                    </div>
                    <button className="btn-new" onClick={() => { setEditingClase(null); setShowModal(true); }}>
                        <span>＋</span> Nueva Clase
                    </button>
                </div>

                {/* ── Tabs vista principal ── */}
                <div className="main-tabs">
                    <button
                        className={`mtab ${mainView === 'calendario' ? 'act' : ''}`}
                        onClick={() => setMainView('calendario')}
                    >Calendario</button>
                    <button
                        className={`mtab ${mainView === 'todas' ? 'act' : ''}`}
                        onClick={() => setMainView('todas')}
                    >Todas las Clases</button>
                </div>

                {/* ══════════════════════════════════════════════
                    VISTA CALENDARIO
                ══════════════════════════════════════════════ */}
                {mainView === 'calendario' && (
                    <>
                        {/* Toggle mes/semana */}
                        <div className="view-tabs">
                            <button className={`vtab ${calView==='month' ? 'act' : ''}`} onClick={() => setCalView('month')}>Mes</button>
                            <button className={`vtab ${calView==='week'  ? 'act' : ''}`} onClick={() => setCalView('week')}>Semana</button>
                        </div>

                        <div className="cr-layout">
                            {/* Columna calendario */}
                            <div className="cr-cal-col">
                                <div className="cal-card">
                                    {calView === 'month' ? (
                                        <BigCalendar selectedDate={selectedDate} onSelectDate={handleSelectDate}
                                                     clasesMap={clasesMap} viewMonth={viewMonth}
                                                     onPrevMonth={prevMonth} onNextMonth={nextMonth} />
                                    ) : (
                                        <div style={{ padding:'1.25rem 1.25rem 0.5rem' }}>
                                            <WeekStrip selectedDate={selectedDate} onSelectDate={handleSelectDate} clasesMap={clasesMap} />
                                        </div>
                                    )}
                                    <div className="cal-bottom">
                                        <div className="legend-row">
                                            {Object.entries(estadoConfig).map(([k,v]) => (
                                                <div key={k} className="leg-item">
                                                    <span className="leg-dot" style={{ background:v.border }} />
                                                    <span className="leg-txt">{v.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="filters-grid">
                                            <div className="fg">
                                                <label className="flbl-sm">Tipo</label>
                                                <NeonSelect value={tipoFiltro} onChange={setTipoFiltro} options={tiposOpts} placeholder="Todos" />
                                            </div>
                                            <div className="fg">
                                                <label className="flbl-sm">Instructor</label>
                                                <NeonSelect value={instrFiltro} onChange={setInstrFiltro} options={instrOpts} placeholder="Todos" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Columna lista del día */}
                            <div className="cr-list-col">
                                <div className="day-stats">
                                    {[
                                        { n:clasesDia.length, l:'Clases' },
                                        { n:clasesDia.reduce((s,c)=>s+(c.total_reservas??0),0), l:'Reservas' },
                                        { n:clasesDia.filter(c=>calcEstadoActual(c)==='en_curso').length, l:'En curso' },
                                        { n:clasesDia.reduce((s,c)=>s+(c.capacidad_maxima??0),0), l:'Capacidad' },
                                    ].map(({ n, l }) => (
                                        <div key={l} className="dstat">
                                            <span className="dstat-n">{n}</span>
                                            <span className="dstat-l">{l}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="clases-list">
                                    {clasesDia.length === 0 ? (
                                        <div className="empty-day">
                                            <span className="empty-ico">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:40,height:40,color:'rgba(255,20,147,0.35)'}}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                            </span>
                                            <p className="empty-txt">Sin clases este día</p>
                                            <button className="btn-new-sm" onClick={() => { setEditingClase(null); setShowModal(true); }}>
                                                ＋ Crear clase
                                            </button>
                                        </div>
                                    ) : clasesDia.map(c => (
                                        <ClaseCard key={c.id} clase={c}
                                                   onEdit={handleEdit}
                                                   onDelete={handleDelete}
                                                   onNavigate={cl => router.visit(route('admin.clases.show', cl.id))} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ══════════════════════════════════════════════
                    VISTA TODAS LAS CLASES
                ══════════════════════════════════════════════ */}
                {mainView === 'todas' && (
                    <div className="todas-layout">

                        {/* Filtros superiores */}
                        <div className="todas-filters">
                            <div className="fg" style={{ minWidth:160 }}>
                                <label className="flbl-sm">Tipo de clase</label>
                                <NeonSelect value={tipoFiltro} onChange={setTipoFiltro} options={tiposOpts} placeholder="Todos" />
                            </div>
                            <div className="fg" style={{ minWidth:160 }}>
                                <label className="flbl-sm">Instructor</label>
                                <NeonSelect value={instrFiltro} onChange={setInstrFiltro} options={instrOpts} placeholder="Todos" />
                            </div>
                        </div>

                        {/* Chips de estado */}
                        <div className="estado-chips">
                            <button
                                className={`echip ${estadoFiltro === '' ? 'act' : ''}`}
                                onClick={() => setEstadoFiltro('')}
                            >
                                Todas <span className="echip-count">{clases.length}</span>
                            </button>
                            {Object.entries(estadoConfig).map(([k, v]) => (
                                <button key={k}
                                        className={`echip ${estadoFiltro === k ? 'act' : ''}`}
                                        style={estadoFiltro === k
                                            ? { background: v.bg, borderColor: v.border, color: v.text }
                                            : {}}
                                        onClick={() => setEstadoFiltro(prev => prev === k ? '' : k)}
                                >
                                    <span className="echip-dot" style={{ background: v.border }} />
                                    {v.label}
                                    <span className="echip-count">{cuentaEstados[k]}</span>
                                </button>
                            ))}
                        </div>

                        {/* Info de restricciones */}
                        <div className="restricciones-info">
                            <span className="rinfo-item">
                                <span className="rinfo-dot" style={{ background:'#22c55e' }} /> Las clases <strong>En Curso</strong> no se pueden editar ni eliminar
                            </span>
                            <span className="rinfo-sep">·</span>
                            <span className="rinfo-item">
                                <span className="rinfo-dot" style={{ background:'#6b7280' }} /> Las clases <strong>Finalizadas</strong> se eliminan al liquidar al instructor
                            </span>
                            <span className="rinfo-sep">·</span>
                            <span className="rinfo-item">
                                <span className="rinfo-dot" style={{ background:'#60a5fa' }} /> Los estados cambian <strong>automáticamente</strong> según el horario
                            </span>
                        </div>

                        {/* Lista */}
                        {todasClases.length === 0 ? (
                            <div className="empty-day" style={{ marginTop:'1rem' }}>
                                <span className="empty-ico">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:40,height:40,color:'rgba(255,20,147,0.35)'}}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
                                </span>
                                <p className="empty-txt">No hay clases que coincidan con los filtros</p>
                            </div>
                        ) : (
                            <div className="todas-list">
                                {todasClases.map(c => (
                                    <ClaseCard key={c.id} clase={c} showDate
                                               onEdit={handleEdit}
                                               onDelete={handleDelete}
                                               onNavigate={cl => router.visit(route('admin.clases.show', cl.id))} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
/* ── Root ── */
* { box-sizing:border-box; }
.cr { max-width:1400px; margin:0 auto; display:flex; flex-direction:column; gap:1rem; }

/* Header */
.cr-hd { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.75rem; }
.cr-title { font-size:clamp(1.8rem,5vw,2.4rem); font-weight:900; color:#FF1493; margin:0; letter-spacing:2px; text-shadow:0 0 20px rgba(255,20,147,0.5); }
.cr-sub   { color:rgba(255,255,255,0.45); font-size:0.875rem; margin:0.25rem 0 0; display:flex; align-items:center; gap:0.5rem; }
.hoy-chip { background:rgba(255,20,147,0.15); border:1px solid rgba(255,20,147,0.4); color:#FF1493; font-size:0.6rem; font-weight:800; padding:0.1rem 0.5rem; border-radius:20px; text-transform:uppercase; letter-spacing:1px; }
.btn-new  { background:linear-gradient(135deg,#FF1493,#C71585); color:#000; border:none; padding:0.75rem 1.5rem; border-radius:12px; font-weight:900; font-size:0.875rem; cursor:pointer; display:flex; align-items:center; gap:0.5rem; white-space:nowrap; box-shadow:0 4px 20px rgba(255,20,147,0.4); transition:all 0.25s; }
.btn-new:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(255,20,147,0.55); }

/* Tabs principales */
.main-tabs { display:flex; gap:0.35rem; background:rgba(255,20,147,0.04); border:1px solid rgba(255,20,147,0.15); border-radius:12px; padding:0.3rem; width:fit-content; }
.mtab { background:none; border:none; color:rgba(255,255,255,0.4); padding:0.55rem 1.2rem; border-radius:9px; font-size:0.85rem; font-weight:700; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
.mtab.act { background:rgba(255,20,147,0.18); border:1px solid rgba(255,20,147,0.4); color:#FF1493; }
.mtab:hover:not(.act) { color:rgba(255,20,147,0.7); }

/* Toggle cal/semana */
.view-tabs { display:flex; gap:0.35rem; }
.vtab { background:rgba(255,20,147,0.04); border:1px solid rgba(255,20,147,0.15); color:rgba(255,255,255,0.4); padding:0.45rem 1rem; border-radius:9px; font-size:0.78rem; font-weight:700; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
.vtab.act { background:rgba(255,20,147,0.15); border-color:rgba(255,20,147,0.4); color:#FF1493; }
.vtab:hover:not(.act) { color:rgba(255,20,147,0.7); }

/* Layout 2 columnas */
.cr-layout { display:grid; grid-template-columns:440px 1fr; gap:1.25rem; align-items:start; }

/* Card calendario */
.cal-card { background:rgba(255,20,147,0.03); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid rgba(255,20,147,0.2); border-radius:20px; overflow:visible; box-shadow:0 8px 32px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,20,147,0.1); position:sticky; top:80px; }

/* ═══ CALENDARIO ═══ */
.bcal { padding:1.5rem 1.5rem 1rem; }
.bcal-nav { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.1rem; }
.bcal-navbtn { background:rgba(255,20,147,0.08); border:1px solid rgba(255,20,147,0.25); color:#FF1493; width:36px; height:36px; border-radius:10px; cursor:pointer; font-size:1.2rem; display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
.bcal-navbtn:hover { background:rgba(255,20,147,0.2); }
.bcal-title { color:#fff; font-size:1.25rem; font-weight:900; margin:0; }
.bcal-year  { color:rgba(255,20,147,0.65); font-size:0.9rem; font-weight:600; margin-left:0.35rem; }
.bcal-dow-row { display:grid; grid-template-columns:repeat(7,1fr); margin-bottom:0.3rem; }
.bcal-dow { text-align:center; color:rgba(255,20,147,0.6); font-size:0.65rem; font-weight:800; padding:0.4rem 0; letter-spacing:1px; text-transform:uppercase; }
.bcal-body { display:flex; flex-direction:column; gap:2px; }
.bcal-week { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
.bcal-cell { aspect-ratio:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; background:none; border:none; color:rgba(255,255,255,0.65); border-radius:10px; cursor:pointer; transition:all 0.15s; padding:0.15rem; min-height:44px; }
.bcal-cell:not(.empty):hover:not(.sel) { background:rgba(255,20,147,0.1); color:#FF1493; }
.bcal-cell.empty { cursor:default; }
.bcal-cell.tod .bcal-num { color:#FF1493; font-weight:900; background:rgba(255,20,147,0.12); border:1.5px solid rgba(255,20,147,0.45); border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; }
.bcal-cell.sel { background:#FF1493 !important; color:#000 !important; box-shadow:0 2px 14px rgba(255,20,147,0.5); }
.bcal-cell.sel .bcal-num { color:#000 !important; font-weight:900; }
.bcal-num { font-size:0.85rem; font-weight:500; line-height:1; }
.bcal-dots { display:flex; gap:3px; }
.bdot { width:5px; height:5px; border-radius:50%; background:#FF1493; }
.bdot-sel { background:rgba(0,0,0,0.55); }

/* ═══ WEEK STRIP ═══ */
.wstrip { display:flex; align-items:center; gap:0.3rem; }
.wstrip-nav { background:rgba(255,20,147,0.08); border:1px solid rgba(255,20,147,0.2); color:#FF1493; width:32px; height:32px; border-radius:8px; cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; }
.wstrip-nav:hover { background:rgba(255,20,147,0.2); }
.wstrip-days { flex:1; display:grid; grid-template-columns:repeat(7,1fr); gap:3px; }
.wday { display:flex; flex-direction:column; align-items:center; gap:3px; padding:0.7rem 0.2rem; border-radius:12px; border:none; background:none; cursor:pointer; transition:all 0.15s; }
.wday:hover:not(.sel) { background:rgba(255,20,147,0.08); }
.wday.tod .wday-num { color:#FF1493; font-weight:900; }
.wday.tod .wday-dow { color:rgba(255,20,147,0.7); }
.wday.sel { background:#FF1493 !important; }
.wday.sel .wday-dow, .wday.sel .wday-num { color:#000 !important; }
.wday-dow { font-size:0.58rem; font-weight:800; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.5px; }
.wday-num { font-size:1rem; font-weight:600; color:rgba(255,255,255,0.8); }
.wdot { width:5px; height:5px; border-radius:50%; background:#FF1493; }
.wdot-sel { background:rgba(0,0,0,0.5); }

/* ═══ CAL BOTTOM ═══ */
.cal-bottom { padding:1rem 1.5rem 1.5rem; border-top:1px solid rgba(255,20,147,0.1); display:flex; flex-direction:column; gap:0.875rem; }
.legend-row { display:flex; flex-wrap:wrap; gap:0.6rem; }
.leg-item { display:flex; align-items:center; gap:0.4rem; }
.leg-dot  { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.leg-txt  { color:rgba(255,255,255,0.45); font-size:0.7rem; }
.filters-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
.flbl-sm { color:rgba(255,20,147,0.8); font-size:0.62rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:0.3rem; }

/* ═══ NEON SELECT (fixed portal) ═══ */
.nsel-btn { width:100%; display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0.875rem; background:rgba(255,20,147,0.05); border:1px solid rgba(255,20,147,0.2); border-radius:10px; color:rgba(255,255,255,0.8); font-size:0.82rem; cursor:pointer; transition:all 0.2s; text-align:left; gap:0.5rem; font-family:inherit; }
.nsel-btn:hover, .nsel-btn.open { border-color:rgba(255,20,147,0.55); background:rgba(255,20,147,0.08); }
.nsel-val { color:#fff; font-weight:600; flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.nsel-ph  { color:rgba(255,255,255,0.3); flex:1; }
.nsel-arr { color:rgba(255,20,147,0.7); font-size:1rem; flex-shrink:0; transform:rotate(90deg); transition:transform 0.2s; display:inline-block; }
.nsel-arr.up { transform:rotate(-90deg); }
.nsel-dot-sm { width:8px; height:8px; border-radius:50%; display:inline-block; flex-shrink:0; }
/* El .nsel-drop se renderiza en el body via portal, por eso usa position:fixed desde JS */
.nsel-drop { background:rgba(8,3,14,0.97); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid rgba(255,20,147,0.35); border-radius:12px; overflow:hidden; box-shadow:0 16px 40px rgba(0,0,0,0.75),0 0 30px rgba(255,20,147,0.1); max-height:240px; overflow-y:auto; animation:nsdrop 0.15s cubic-bezier(.34,1.56,.64,1); }
@keyframes nsdrop { from{opacity:0;transform:translateY(-8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
.nsel-opt { width:100%; display:flex; align-items:center; gap:0.55rem; padding:0.65rem 0.875rem; background:none; border:none; border-bottom:1px solid rgba(255,20,147,0.07); color:rgba(255,255,255,0.7); font-size:0.82rem; font-weight:500; text-align:left; cursor:pointer; transition:all 0.15s; font-family:inherit; }
.nsel-opt:last-child { border-bottom:none; }
.nsel-opt:hover { background:rgba(255,20,147,0.1); color:#FF1493; }
.nsel-opt.active { background:rgba(255,20,147,0.13); color:#FF1493; font-weight:700; }
.nsel-opt-empty { color:rgba(255,255,255,0.3); font-style:italic; }
.nsel-opt-lbl { flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.nsel-chk { margin-left:auto; color:#FF1493; font-size:0.75rem; }
.nsel-drop::-webkit-scrollbar { width:4px; }
.nsel-drop::-webkit-scrollbar-track { background:transparent; }
.nsel-drop::-webkit-scrollbar-thumb { background:rgba(255,20,147,0.3); border-radius:4px; }

/* ═══ LISTA DEL DÍA ═══ */
.cr-list-col { display:flex; flex-direction:column; gap:1rem; }
.day-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:0.75rem; }
.dstat { background:rgba(255,20,147,0.04); border:1px solid rgba(255,20,147,0.14); border-radius:12px; padding:0.875rem; text-align:center; }
.dstat-n { display:block; color:#FF1493; font-size:1.6rem; font-weight:900; line-height:1; }
.dstat-l { display:block; color:rgba(255,255,255,0.3); font-size:0.6rem; text-transform:uppercase; letter-spacing:1px; margin-top:0.25rem; }
.clases-list { display:flex; flex-direction:column; gap:0.75rem; }
.empty-day { text-align:center; padding:3.5rem 1rem; background:rgba(255,20,147,0.02); border:1px dashed rgba(255,20,147,0.2); border-radius:16px; }
.empty-ico  { font-size:2.5rem; display:block; margin-bottom:0.75rem; }
.empty-txt  { color:rgba(255,255,255,0.3); margin:0 0 1rem; }
.btn-new-sm { background:rgba(255,20,147,0.1); border:1px solid rgba(255,20,147,0.35); color:#FF1493; padding:0.5rem 1.25rem; border-radius:8px; font-weight:700; font-size:0.8rem; cursor:pointer; transition:all 0.2s; }
.btn-new-sm:hover { background:rgba(255,20,147,0.18); }

/* ═══ VISTA TODAS ═══ */
.todas-layout { display:flex; flex-direction:column; gap:1rem; }

.todas-filters { display:flex; gap:0.875rem; flex-wrap:wrap; background:rgba(255,20,147,0.03); border:1px solid rgba(255,20,147,0.15); border-radius:14px; padding:1rem 1.25rem; }

/* Chips de estado */
.estado-chips { display:flex; gap:0.5rem; flex-wrap:wrap; }
.echip {
    display:flex; align-items:center; gap:0.45rem;
    padding:0.45rem 0.875rem;
    background:rgba(255,20,147,0.04);
    border:1px solid rgba(255,20,147,0.15);
    border-radius:20px;
    color:rgba(255,255,255,0.5);
    font-size:0.78rem; font-weight:700;
    cursor:pointer; transition:all 0.2s;
}
.echip:hover { border-color:rgba(255,20,147,0.4); color:#FF1493; }
.echip.act { background:rgba(255,20,147,0.15); border-color:rgba(255,20,147,0.5); color:#FF1493; }
.echip-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
.echip-count { background:rgba(255,255,255,0.08); border-radius:20px; padding:0.05rem 0.45rem; font-size:0.7rem; margin-left:0.1rem; }

/* Info restricciones */
.restricciones-info {
    display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;
    background:rgba(59,130,246,0.06); border:1px solid rgba(59,130,246,0.2);
    border-radius:10px; padding:0.7rem 1rem;
    color:rgba(255,255,255,0.5); font-size:0.75rem;
}
.rinfo-item { display:flex; align-items:center; gap:0.35rem; }
.rinfo-item strong { color:rgba(255,255,255,0.75); }
.rinfo-sep { color:rgba(255,255,255,0.2); }
.rinfo-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }

.todas-list { display:flex; flex-direction:column; gap:0.75rem; }

/* ═══ TARJETA CLASE ═══ */
.ccard { display:flex; background:rgba(255,20,147,0.03); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid rgba(255,20,147,0.14); border-radius:14px; overflow:hidden; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 12px rgba(0,0,0,0.3); }
.ccard:hover { border-color:var(--cc,#FF1493); box-shadow:0 4px 24px rgba(255,20,147,0.15); transform:translateY(-1px); background:rgba(255,20,147,0.05); }
.ccard-locked { opacity:0.85; }
.ccard-locked:hover { border-color:rgba(107,114,128,0.35) !important; box-shadow:0 2px 12px rgba(0,0,0,0.3) !important; transform:none !important; }
.ccard-bar  { width:4px; flex-shrink:0; }
.ccard-body { flex:1; padding:0.875rem 1rem; min-width:0; display:flex; flex-direction:column; gap:0.6rem; }
.ccard-row  { display:flex; justify-content:space-between; gap:0.75rem; }
.ccard-info { display:flex; flex-direction:column; gap:0.18rem; min-width:0; }
.ccard-name-row { display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; }
.ccard-name { color:#fff; font-weight:800; font-size:1rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.live-badge { background:rgba(34,197,94,0.2); border:1px solid rgba(34,197,94,0.5); color:#4ade80; font-size:0.6rem; font-weight:900; padding:0.1rem 0.45rem; border-radius:20px; letter-spacing:0.5px; animation:livePulse 2s ease-in-out infinite; }
@keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
.ccard-date  { color:rgba(255,20,147,0.65); font-size:0.72rem; font-weight:700; }
.ccard-time  { color:rgba(255,255,255,0.5); font-size:0.78rem; }
.ccard-instr { color:rgba(255,255,255,0.4); font-size:0.74rem; }
.ccard-sala  { color:rgba(255,255,255,0.3); font-size:0.7rem; }
.ccard-meta  { display:flex; flex-direction:column; align-items:flex-end; gap:0.35rem; flex-shrink:0; }
.ccard-badge { padding:0.25rem 0.55rem; border-radius:6px; font-size:0.63rem; font-weight:700; white-space:nowrap; }
.ccard-cupos { text-align:right; font-size:0.88rem; }
.cupos-lbl   { display:block; color:rgba(255,255,255,0.25); font-size:0.58rem; text-transform:uppercase; letter-spacing:0.5px; }
.ocp-track { height:3px; background:rgba(255,255,255,0.06); border-radius:2px; overflow:hidden; }
.ocp-fill  { height:100%; border-radius:2px; transition:width 0.4s ease; }
.ccard-acts { display:flex; gap:0.5rem; align-items:center; }
.cact { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); color:rgba(255,255,255,0.55); padding:0.28rem 0.7rem; border-radius:7px; font-size:0.7rem; font-weight:700; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:0.3rem; }
.cact-edit:hover { background:rgba(59,130,246,0.15); border-color:#3b82f6; color:#60a5fa; }
.cact-del:hover  { background:rgba(239,68,68,0.15);  border-color:#ef4444; color:#f87171; }
.cact-blocked { color:rgba(255,255,255,0.3); font-size:0.7rem; padding:0.28rem 0.5rem; font-weight:600; }
.cact-lock { color:rgba(107,114,128,0.5); font-size:0.65rem; padding:0.28rem 0.4rem; }

/* ═══ MODAL ═══ */
.moverlay { position:fixed; inset:0; background:rgba(0,0,0,0.78); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:1000; padding:1rem; }
.mglass { background:rgba(8,3,14,0.93); backdrop-filter:blur(30px); -webkit-backdrop-filter:blur(30px); border:1px solid rgba(255,20,147,0.35); border-radius:20px; width:100%; max-width:600px; max-height:90vh; overflow-y:auto; box-shadow:0 30px 80px rgba(0,0,0,0.7),0 0 60px rgba(255,20,147,0.12),inset 0 1px 0 rgba(255,20,147,0.18); animation:mIn 0.22s cubic-bezier(.34,1.56,.64,1); }
@keyframes mIn { from{opacity:0;transform:scale(0.93) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
.mhd { display:flex; justify-content:space-between; align-items:center; padding:1.5rem 1.75rem; border-bottom:1px solid rgba(255,20,147,0.15); background:rgba(255,20,147,0.04); border-radius:20px 20px 0 0; }
.mhd-title { color:#FF1493; font-size:1.2rem; font-weight:900; margin:0; }
.mclose { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.5); width:32px; height:32px; border-radius:8px; cursor:pointer; font-size:0.9rem; display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
.mclose:hover { color:#FF1493; border-color:rgba(255,20,147,0.4); background:rgba(255,20,147,0.1); transform:rotate(90deg); }
.mform { padding:1.5rem 1.75rem; display:flex; flex-direction:column; gap:1rem; }
.frow2 { display:grid; grid-template-columns:1fr 1fr; gap:0.875rem; }
.fg    { display:flex; flex-direction:column; gap:0.35rem; }
.flbl  { color:rgba(255,20,147,0.9); font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; }
.finp  { padding:0.7rem 0.875rem; background:rgba(255,20,147,0.05); border:1px solid rgba(255,20,147,0.2); border-radius:10px; color:#fff; font-size:0.875rem; outline:none; transition:all 0.2s; width:100%; box-sizing:border-box; font-family:inherit; }
.finp::placeholder { color:rgba(255,255,255,0.25); }
.finp:focus { border-color:rgba(255,20,147,0.6); background:rgba(255,20,147,0.08); box-shadow:0 0 0 3px rgba(255,20,147,0.08); }
.ferr  { color:#ef4444; font-size:0.72rem; margin:0.1rem 0 0; }
.mfoot { display:flex; justify-content:flex-end; gap:0.75rem; padding-top:0.75rem; margin-top:0.25rem; border-top:1px solid rgba(255,20,147,0.12); flex-wrap:wrap; }
.mbtn-c  { background:rgba(255,20,147,0.06); border:1px solid rgba(255,20,147,0.25); color:#FF1493; padding:0.7rem 1.25rem; border-radius:10px; font-weight:700; cursor:pointer; font-size:0.875rem; transition:all 0.2s; font-family:inherit; }
.mbtn-c:hover { background:rgba(255,20,147,0.12); }
.mbtn-ok { background:linear-gradient(135deg,#FF1493,#C71585); color:#000; border:none; padding:0.7rem 1.5rem; border-radius:10px; font-weight:900; cursor:pointer; font-size:0.875rem; box-shadow:0 4px 16px rgba(255,20,147,0.4); transition:all 0.25s; font-family:inherit; }
.mbtn-ok:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 22px rgba(255,20,147,0.55); }
.mbtn-ok:disabled { opacity:0.5; cursor:not-allowed; }

/* ═══ RESPONSIVE ═══ */
@media (max-width:1100px) {
    .cr-layout { grid-template-columns:360px 1fr; }
}
@media (max-width:850px) {
    .cr-layout { grid-template-columns:1fr; }
    .cal-card { position:static; }
    .bcal { padding:1rem; }
    .bcal-cell { min-height:46px; }
    .day-stats { grid-template-columns:repeat(2,1fr); }
    .filters-grid { grid-template-columns:1fr; }
    .cr-hd { flex-direction:column; align-items:flex-start; }
    .btn-new { width:100%; justify-content:center; }
    .restricciones-info { flex-direction:column; align-items:flex-start; }
    .rinfo-sep { display:none; }
}
@media (max-width:540px) {
    .cr-title { font-size:1.6rem; }
    .bcal-cell { min-height:40px; }
    .bcal-dow  { font-size:0.55rem; }
    .frow2 { grid-template-columns:1fr; }
    .mfoot { flex-direction:column; }
    .mbtn-c, .mbtn-ok { width:100%; text-align:center; justify-content:center; }
    .ccard-row { flex-direction:column; }
    .ccard-meta { align-items:flex-start; flex-direction:row; gap:0.75rem; }
    .estado-chips { gap:0.35rem; }
    .echip { font-size:0.72rem; padding:0.4rem 0.7rem; }
}
            `}</style>
        </DashboardLayout>
    );
}
