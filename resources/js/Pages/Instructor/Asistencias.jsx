// ════════════════════════════════════════════════════════════
// PASO 7 — CREAR LA PÁGINA DE ASISTENCIAS
// ════════════════════════════════════════════════════════════
//
// Crea el archivo NUEVO:
//   resources/js/Pages/Instructor/Asistencias.jsx
// ────────────────────────────────────────────────────────────

import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import InstructorLayout from '@/Layouts/InstructorLayout';

const Ico = {
    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
    ),
    calendar: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    ),
    users: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    ),
    clock: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
    ),
    search: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    ),
    x: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    ),
};

export default function InstructorAsistencias({ user, clases, claseSeleccionada, asistencias, reservas, filters }) {
    const [fecha, setFecha] = useState(filters?.fecha ?? new Date().toISOString().split('T')[0]);
    const [busqueda, setBusqueda] = useState('');
    const [flash, setFlash] = useState(null);
    const [nowTs, setNowTs] = useState(Date.now());

    useEffect(() => {
        const id = setInterval(() => setNowTs(Date.now()), 30000);
        return () => clearInterval(id);
    }, []);

    const estadoConfig = {
        programada: { color: '#3b82f6', label: 'Programada' },
        en_curso: { color: '#22c55e', label: 'En Curso' },
        finalizada: { color: '#6b7280', label: 'Finalizada' },
        cancelada: { color: '#ef4444', label: 'Cancelada' },
    };

    const getEstadoVisual = (clase) => {
        const estadoDb = clase?.estado ?? 'programada';
        if (estadoDb === 'cancelada' || estadoDb === 'finalizada') return estadoDb;

        const ini = new Date(clase?.fecha_hora_inicio).getTime();
        const fin = new Date(clase?.fecha_hora_fin).getTime();
        if (Number.isNaN(ini) || Number.isNaN(fin)) return estadoDb;

        if (nowTs >= fin) return 'finalizada';
        if (nowTs >= ini && nowTs < fin) return 'en_curso';
        return 'programada';
    };

    const clasesNormalizadas = useMemo(
        () => (clases ?? []).map((c) => ({ ...c, estado_visual: getEstadoVisual(c) })),
        [clases, nowTs]
    );

    const claseSeleccionadaVisual = useMemo(() => {
        if (!claseSeleccionada) return null;
        const enLista = clasesNormalizadas.find((c) => c.id === claseSeleccionada.id);
        return enLista ?? { ...claseSeleccionada, estado_visual: getEstadoVisual(claseSeleccionada) };
    }, [claseSeleccionada, clasesNormalizadas, nowTs]);

    const hora = (dt) => dt ? new Date(dt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '';

    const seleccionarClase = (claseId) => router.get('/instructor/asistencias', { clase_id: claseId, fecha }, { preserveState: false });
    const cambiarFecha = (nuevaFecha) => { setFecha(nuevaFecha); router.get('/instructor/asistencias', { fecha: nuevaFecha }, { preserveState: false }); };

    const registrar = (clienteId) => {
        router.post('/instructor/asistencias', { clase_id: claseSeleccionadaVisual?.id, cliente_id: clienteId }, {
            preserveState: true,
            onSuccess: () => { setFlash({ type: 'success', msg: 'Asistencia registrada' }); setTimeout(() => setFlash(null), 3000); },
            onError: (errors) => { setFlash({ type: 'error', msg: Object.values(errors)[0] ?? 'Error al registrar' }); setTimeout(() => setFlash(null), 3000); },
        });
    };

    const eliminar = (asistenciaId) => {
        if (!confirm('¿Eliminar esta asistencia?')) return;
        router.delete(`/instructor/asistencias/${asistenciaId}`, { preserveState: false });
    };

    const asistioMap = new Set((asistencias ?? []).map(a => a.cliente_id));
    const reservasFilt = (reservas ?? []).filter(r => !busqueda || r.cliente?.name?.toLowerCase().includes(busqueda.toLowerCase()));

    return (
        <InstructorLayout user={user}>
            <Head title="Asistencias" />
            <div className="asis-wrap">
                <div className="asis-head">
                    <h1 className="asis-title"><span className="asis-ico-lg">{Ico.check}</span>Asistencias</h1>
                    <p className="asis-sub">Registra la asistencia de tus alumnos</p>
                </div>

                {flash && <div className={`asis-flash ${flash.type}`}>{flash.msg}</div>}

                <div className="asis-card asis-filter">
                    <label className="asis-label"><span className="asis-ico">{Ico.calendar}</span>Fecha</label>
                    <input type="date" value={fecha} onChange={e => cambiarFecha(e.target.value)} className="asis-input asis-date" />
                    <span className="asis-muted">{clases?.length ?? 0} clase(s) encontrada(s)</span>
                </div>

                <div className="asis-grid">
                    <div className="asis-card asis-left">
                        <div className="asis-card-hd"><h3>Clases del día</h3></div>
                        {clasesNormalizadas?.length ? clasesNormalizadas.map(clase => {
                            const cfg = estadoConfig[clase.estado_visual] ?? estadoConfig.programada;
                            const activa = claseSeleccionadaVisual?.id === clase.id;
                            return (
                                <button key={clase.id} onClick={() => seleccionarClase(clase.id)} className={`asis-class-item ${activa ? 'active' : ''}`}>
                                    <div className="asis-row">
                                        <span className="asis-dot" style={{ background: clase.tipo_clase?.color ?? '#FF1493' }} />
                                        <span className="asis-class-name">{clase.tipo_clase?.nombre}</span>
                                    </div>
                                    <p className="asis-class-meta"><span className="asis-ico-sm">{Ico.clock}</span>{hora(clase.fecha_hora_inicio)} – {hora(clase.fecha_hora_fin)} · {clase.sala ?? ''}</p>
                                    <div className="asis-row between">
                                        <span className="asis-cap"><span className="asis-ico-sm">{Ico.users}</span>{clase.total_reservas ?? 0}/{clase.capacidad_maxima}</span>
                                        <span style={{ color: cfg.color, fontWeight: 700, fontSize: '.72rem' }}>{cfg.label}</span>
                                    </div>
                                </button>
                            );
                        }) : <div className="asis-empty-sm">Sin clases para esta fecha</div>}
                    </div>

                    <div>
                        {claseSeleccionadaVisual ? (
                            <>
                                <div className="asis-card asis-resumen">
                                    <div>
                                        <h2>{claseSeleccionadaVisual.tipo_clase?.nombre}</h2>
                                        <p><span className="asis-ico-sm">{Ico.clock}</span>{hora(claseSeleccionadaVisual.fecha_hora_inicio)} – {hora(claseSeleccionadaVisual.fecha_hora_fin)} · {claseSeleccionadaVisual.sala}</p>
                                    </div>
                                    <div className="asis-kpis">
                                        <div><b className="ok">{asistencias?.length ?? 0}</b><span>Asistieron</span></div>
                                        <div><b className="pink">{reservas?.length ?? 0}</b><span>Reservas</span></div>
                                    </div>
                                </div>

                                <div className="asis-search-wrap">
                                    <span className="asis-search-ico">{Ico.search}</span>
                                    <input
                                        type="text"
                                        placeholder="Buscar alumno por nombre..."
                                        value={busqueda}
                                        onChange={e => setBusqueda(e.target.value)}
                                        className="asis-input asis-search"
                                    />
                                </div>

                                <div className="asis-card">
                                    <div className="asis-card-hd between">
                                        <h3>Alumnos con Reserva</h3>
                                        <span className="asis-muted">{reservasFilt.length} alumnos</span>
                                    </div>

                                    {reservasFilt.length ? reservasFilt.map(reserva => {
                                        const asistio = asistioMap.has(reserva.cliente_id);
                                        const asistenciaObj = (asistencias ?? []).find(a => a.cliente_id === reserva.cliente_id);
                                        return (
                                            <div key={reserva.id} className={`asis-user-row ${asistio ? 'is-ok' : ''}`}>
                                                <div className="asis-user-main">
                                                    <div className={`asis-avatar ${asistio ? 'ok' : ''}`}>{reserva.cliente?.name?.charAt(0).toUpperCase()}</div>
                                                    <div className="asis-user-text">
                                                        <p>{reserva.cliente?.name}</p>
                                                        <small>{reserva.cliente?.email}</small>
                                                    </div>
                                                </div>

                                                <div className="asis-actions">
                                                    {asistio ? (
                                                        <>
                                                            <span className="asis-ok-label"><span className="asis-ico-sm">{Ico.check}</span>Asistió</span>
                                                            {claseSeleccionadaVisual.estado_visual !== 'finalizada' && (
                                                                <button onClick={() => eliminar(asistenciaObj?.id)} className="btn-danger">
                                                                    <span className="asis-ico-sm">{Ico.x}</span>Quitar
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => registrar(reserva.cliente_id)}
                                                            disabled={claseSeleccionadaVisual.estado_visual === 'finalizada' || claseSeleccionadaVisual.estado_visual === 'cancelada'}
                                                            className="btn-success"
                                                        >
                                                            <span className="asis-ico-sm">{Ico.check}</span>Registrar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }) : <div className="asis-empty-lg">{busqueda ? 'No se encontró ningún alumno con ese nombre.' : 'No hay alumnos reservados en esta clase.'}</div>}
                                </div>
                            </>
                        ) : (
                            <div className="asis-card asis-empty-panel">Selecciona una clase para gestionar asistencias</div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .asis-wrap{max-width:1400px;margin:0 auto;display:flex;flex-direction:column;gap:1rem}
                .asis-head{margin-bottom:.4rem}.asis-title{display:flex;align-items:center;gap:.55rem;color:#FF1493;margin:0;font-size:clamp(1.5rem,3.8vw,2rem);font-weight:900;text-shadow:0 0 12px rgba(255,20,147,.45)}
                .asis-sub{color:#777;margin:.25rem 0 0;font-size:.9rem}
                .asis-ico-lg{width:24px;height:24px;display:inline-flex}.asis-ico{width:16px;height:16px;display:inline-flex}.asis-ico-sm{width:14px;height:14px;display:inline-flex;opacity:.85}
                .asis-card{background:rgba(255,255,255,.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.07);border-top:1px solid rgba(255,255,255,.14);border-radius:14px;box-shadow:0 0 24px rgba(255,20,147,.08),0 8px 30px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.06)}
                .asis-flash{padding:.85rem 1rem;border-radius:10px;font-weight:700}.asis-flash.success{color:#22c55e;border:1px solid #22c55e55;background:rgba(34,197,94,.12)}.asis-flash.error{color:#ef4444;border:1px solid #ef444455;background:rgba(239,68,68,.12)}
                .asis-filter{padding:1rem;display:flex;align-items:center;gap:.8rem;flex-wrap:wrap}.asis-label{color:#FF1493;font-weight:800;font-size:.8rem;display:flex;align-items:center;gap:.4rem;text-transform:uppercase;letter-spacing:1px}
                .asis-input{background:rgba(0,0,0,.45);border:1px solid rgba(255,20,147,.35);color:#fff;border-radius:10px;padding:.6rem .8rem;outline:none}
                .asis-date{min-width:180px}.asis-muted{color:#6c6c6c;font-size:.8rem}

                .asis-grid{display:grid;grid-template-columns:320px 1fr;gap:1rem;align-items:start}
                .asis-left{overflow:hidden}.asis-card-hd{padding:.95rem 1rem;border-bottom:1px solid rgba(255,20,147,.2)}.asis-card-hd h3{margin:0;color:#FF1493;font-size:.82rem;font-weight:900;text-transform:uppercase;letter-spacing:1px}
                .asis-row{display:flex;align-items:center;gap:.45rem}.between{justify-content:space-between}
                .asis-class-item{width:100%;text-align:left;padding:.9rem 1rem;background:transparent;border:none;border-left:3px solid transparent;border-bottom:1px solid rgba(255,20,147,.1);cursor:pointer}
                .asis-class-item.active{background:rgba(255,20,147,.1);border-left-color:#FF1493}
                .asis-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}.asis-class-name{color:#fff;font-weight:700;font-size:.88rem}
                .asis-class-meta{margin:.35rem 0;color:#8f8f8f;font-size:.78rem;display:flex;align-items:center;gap:.35rem;flex-wrap:wrap}
                .asis-cap{color:#b5b5b5;font-size:.75rem;display:inline-flex;align-items:center;gap:.35rem}
                .asis-empty-sm{padding:1.6rem;text-align:center;color:#666;font-size:.85rem}

                .asis-resumen{padding:1rem;display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:.8rem}
                .asis-resumen h2{margin:0 0 .2rem;color:#FF1493;font-size:1.15rem;font-weight:900}
                .asis-resumen p{margin:0;color:#949494;font-size:.82rem;display:flex;align-items:center;gap:.35rem;flex-wrap:wrap}
                .asis-kpis{display:flex;gap:1rem}.asis-kpis div{text-align:center}.asis-kpis b{display:block;font-size:1.4rem;line-height:1;font-weight:900}.asis-kpis .ok{color:#22c55e}.asis-kpis .pink{color:#FF1493}.asis-kpis span{font-size:.68rem;color:#666;text-transform:uppercase}

                .asis-search-wrap{position:relative;margin-bottom:.8rem}.asis-search-ico{position:absolute;left:.72rem;top:50%;transform:translateY(-50%);width:15px;height:15px;color:#7a7a7a}
                .asis-search{width:100%;padding-left:2rem}
                .asis-user-row{padding:.8rem 1rem;display:flex;justify-content:space-between;align-items:center;gap:.9rem;border-bottom:1px solid rgba(255,20,147,.08)}
                .asis-user-row.is-ok{background:rgba(34,197,94,.04)}
                .asis-user-main{display:flex;align-items:center;gap:.8rem;min-width:0}.asis-avatar{width:38px;height:38px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:rgba(255,20,147,.12);border:1px solid rgba(255,20,147,.4);color:#FF1493;font-weight:900;flex-shrink:0}
                .asis-avatar.ok{background:rgba(34,197,94,.14);border-color:#22c55e88;color:#22c55e}
                .asis-user-text p{margin:0;color:#fff;font-size:.88rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
                .asis-user-text small{color:#666;font-size:.74rem}
                .asis-actions{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
                .asis-ok-label{color:#22c55e;font-size:.82rem;font-weight:700;display:inline-flex;align-items:center;gap:.3rem}
                .btn-success,.btn-danger{border-radius:8px;padding:.38rem .7rem;display:inline-flex;align-items:center;gap:.3rem;font-weight:700;font-size:.77rem;cursor:pointer}
                .btn-success{background:rgba(34,197,94,.14);border:1px solid #22c55e;color:#22c55e}
                .btn-danger{background:rgba(239,68,68,.12);border:1px solid #ef4444;color:#ef4444}
                .btn-success:disabled{opacity:.5;cursor:not-allowed}
                .asis-empty-lg{padding:2rem;text-align:center;color:#666}
                .asis-empty-panel{padding:3rem 1rem;text-align:center;color:#666}

                @media (max-width:980px){.asis-grid{grid-template-columns:1fr}.asis-left{order:2}}
                @media (max-width:620px){
                    .asis-filter{padding:.85rem}.asis-date{min-width:100%}
                    .asis-user-row{flex-direction:column;align-items:flex-start}.asis-actions{width:100%}
                    .asis-kpis{width:100%;justify-content:flex-start}
                }
            `}</style>
        </InstructorLayout>
    );
}
