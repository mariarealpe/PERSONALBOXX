import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import ClienteLayout from '@/Layouts/ClienteLayout';

function NeonSelect({ value, onChange, options, placeholder = 'Todos' }) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);
    const selected = options.find(o => String(o.value) === String(value));

    useEffect(() => {
        const onDoc = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    return (
        <div className="rv-ns" ref={wrapRef}>
            <button type="button" className={`rv-ns-btn ${open ? 'open' : ''}`} onClick={() => setOpen(v => !v)}>
                <span className={selected ? 'rv-ns-val' : 'rv-ns-ph'}>
                    {selected ? selected.label : placeholder}
                </span>
                <span className={`rv-ns-arr ${open ? 'up' : ''}`}>›</span>
            </button>

            {open && (
                <div className="rv-ns-drop">
                    <button
                        type="button"
                        className={`rv-ns-opt ${value === '' ? 'active' : ''}`}
                        onClick={() => { onChange(''); setOpen(false); }}
                    >
                        {placeholder}
                    </button>
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`rv-ns-opt ${String(value) === String(opt.value) ? 'active' : ''}`}
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                        >
                            <span>{opt.label}</span>
                            {String(value) === String(opt.value) && <span className="rv-ns-check">✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Modal de confirmación de cancelación
function ModalCancelarClase({ reserva, isOpen, onClose, onConfirm, isLoading }) {
    if (!isOpen || !reserva) return null;

    const C = '#FF1493';
    const hora = (dt) => dt ? new Date(dt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '';

    const Ico = {
        alert: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
        ),
        x: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        ),
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.25s ease',
        }}>
            <div style={{
                background: 'rgba(10,10,12,0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,20,147,0.2)',
                borderRadius: 16,
                padding: '2rem',
                maxWidth: 'min(420px, calc(100vw - 40px))',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(255,20,147,0.2)',
                animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                position: 'relative',
            }}>
                {/* Header con icono */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                    <span style={{ width: 32, height: 32, display: 'inline-flex', color: '#ef4444', flexShrink: 0 }}>
                        {Ico.alert}
                    </span>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 900, margin: '0 0 0.25rem' }}>
                            Cancelar Reserva
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: 0 }}>
                            Esta acción no se puede deshacer
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 8,
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                        padding: 0,
                    }}
                    onMouseOver={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    }}>
                        <span style={{ width: 14, height: 14, display: 'inline-flex' }}>{Ico.x}</span>
                    </button>
                </div>

                {/* Detalles de la clase */}
                <div style={{
                    background: 'rgba(255,20,147,0.05)',
                    border: '1px solid rgba(255,20,147,0.2)',
                    borderRadius: 12,
                    padding: '1rem',
                    marginBottom: '1.5rem',
                }}>
                    <p style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.4rem', fontSize: '0.95rem' }}>
                        {reserva.clase?.tipo_clase?.nombre ?? 'Clase'}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 0.25rem', fontSize: '0.85rem' }}>
                        Hora: <strong>{hora(reserva.clase?.fecha_hora_inicio)} – {hora(reserva.clase?.fecha_hora_fin)}</strong>
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.85rem' }}>
                        Instructor: <strong>{reserva.clase?.instructor?.name ?? 'Sin asignar'}</strong>
                    </p>
                </div>

                {/* Mensaje de confirmación */}
                <div style={{ marginBottom: '2rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                        ¿Estás seguro de que quieres <strong style={{ color: '#ef4444' }}>cancelar esta reserva</strong>?
                    </p>
                </div>

                {/* Botones */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} disabled={isLoading} style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        borderRadius: 8,
                        padding: '0.65rem 1.5rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        opacity: isLoading ? 0.5 : 1,
                    }}
                    onMouseOver={e => !isLoading && (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                    onMouseOut={e => !isLoading && (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}>
                        Mantener Reserva
                    </button>
                    <button onClick={onConfirm} disabled={isLoading} style={{
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: 8,
                        padding: '0.65rem 1.5rem',
                        fontSize: '0.85rem',
                        fontWeight: 900,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
                        transition: 'all 0.2s',
                        opacity: isLoading ? 0.6 : 1,
                    }}
                    onMouseOver={e => !isLoading && (e.currentTarget.style.boxShadow = '0 6px 18px rgba(239,68,68,0.4)')}
                    onMouseOut={e => !isLoading && (e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.3)')}>
                        {isLoading ? 'Cancelando...' : 'Sí, Cancelar'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
            `}</style>
        </div>
    );
}

export default function ClienteReservas({ user, reservas, filters, horas_min_cancelacion = 2 }) {
    const { props } = usePage();
    const flash = props.flash ?? {};
    const [estado, setEstado] = useState(filters?.estado ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
    const [isLoadingCancel, setIsLoadingCancel] = useState(false);
    const [filteredReservas, setFilteredReservas] = useState(reservas.data ?? []);
    const C = '#FF1493';

    // ── Auto-filtrar reservas cuya clase ya comenzó ──
    useEffect(() => {
        const updateFilteredReservas = () => {
            const ahora = new Date();
            const reservasActivas = (reservas.data ?? []).filter(r => {
                if (!r.clase?.fecha_hora_inicio) return false;
                const inicio = new Date(r.clase.fecha_hora_inicio);
                // Mostrar solo si la clase aún no ha comenzado
                return inicio > ahora;
            });
            setFilteredReservas(reservasActivas);
        };

        updateFilteredReservas();

        // Revisar cada 10 segundos si hay cambios
        const interval = setInterval(updateFilteredReservas, 10000);
        return () => clearInterval(interval);
    }, [reservas.data]);

    const filtrar  = () => router.get('/cliente/reservas', { estado }, { preserveState: true });
    const limpiar  = () => { setEstado(''); router.get('/cliente/reservas'); };

    const abrirModalCancelar = (reserva) => {
        setReservaSeleccionada(reserva);
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setReservaSeleccionada(null);
    };

    const confirmarCancelacion = () => {
        if (!reservaSeleccionada) return;
        setIsLoadingCancel(true);

        router.patch(`/cliente/reservas/${reservaSeleccionada.id}/cancelar`, {}, {
            onSuccess: (page) => {
                setIsLoadingCancel(false);
                cerrarModal();
                // Flash se muestra automáticamente
            },
            onError: (errors) => {
                setIsLoadingCancel(false);
                // Los errores se muestran en el componente
                cerrarModal();
            },
            onFinish: () => {
                setIsLoadingCancel(false);
            },
        });
    };

    const estadoConfig = {
        confirmada: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'Confirmada' },
        en_espera:  { color: '#eab308', bg: 'rgba(234,179,8,0.1)',   label: 'Lista de espera' },
        cancelada:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Cancelada'  },
        completada: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Completada' },
    };

    const fmtFecha = (dt) => dt ? new Date(dt).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const hora     = (dt) => dt ? new Date(dt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '';

    const puedeCancel = (r) => {
        if (!['confirmada', 'en_espera'].includes(r.estado)) return false;
        if (!r.clase?.fecha_hora_inicio) return false;
        const inicio = new Date(r.clase.fecha_hora_inicio);
        const ahora  = new Date();
        if (inicio <= ahora) return false;
        const minutosRestantes = (inicio - ahora) / 60000;
        return minutosRestantes >= horas_min_cancelacion * 60;
    };

    const tiempoLimiteCancelacion = (r) => {
        if (!r.clase?.fecha_hora_inicio) return null;
        const inicio = new Date(r.clase.fecha_hora_inicio);
        const limite = new Date(inicio.getTime() - horas_min_cancelacion * 3600000);
        const ahora  = new Date();
        if (ahora > limite) return null;
        const minutosHastaLimite = Math.floor((limite - ahora) / 60000);
        if (minutosHastaLimite < 60) return `Cancelación disponible por ${minutosHastaLimite} min más`;
        return null;
    };

    const inp = { background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 8, color: '#fff', padding: '0.625rem 1rem', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' };

    const Ico = {
        list: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>
            </svg>
        ),
        search: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
        ),
        x: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        ),
        info: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
        ),
        pin: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
        ),
        user: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
        ),
        wait: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
        ),
        alert: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
        ),
        gym: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6v12"/><path d="M18 6v12"/><path d="M3 9h3"/><path d="M18 9h3"/><path d="M3 15h3"/><path d="M18 15h3"/><path d="M9 12h6"/>
            </svg>
        ),
    };

    const estadoOptions = [
        { value: 'confirmada', label: 'Confirmadas' },
        { value: 'en_espera', label: 'En lista de espera' },
        { value: 'cancelada', label: 'Canceladas' },
        { value: 'completada', label: 'Completadas' },
    ];

    return (
        <ClienteLayout user={user}>
            <Head title="Mis Reservas" />
            <div style={{ maxWidth: 900, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: C, margin: '0 0 0.25rem', textShadow: '0 0 10px rgba(255,20,147,0.5)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 22, height: 22, display: 'inline-flex' }}>{Ico.list}</span>
                        Mis Reservas
                    </h1>
                    <p style={{ color: '#999', margin: 0 }}>Gestiona tus reservas activas</p>
                </div>

                {/* Mensajes flash */}
                {flash.success && (
                    <div style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e', borderRadius: 8, padding: '1rem 1.5rem', marginBottom: '1.5rem', color: '#22c55e', fontWeight: 600 }}>
                        {flash.success}
                    </div>
                )}

                {flash.errors?.cancelar && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid #ef4444', borderRadius: 8, padding: '1rem 1.5rem', marginBottom: '1.5rem', color: '#ef4444', fontWeight: 600 }}>
                        {flash.errors.cancelar}
                    </div>
                )}

                {/* Filtro */}
                <div className="rv-filter-wrap" style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="rv-field" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ color: C, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Estado</label>
                        <NeonSelect value={estado} onChange={setEstado} options={estadoOptions} placeholder="Todos" />
                    </div>

                    <button className="rv-btn" onClick={filtrar} style={{ background: `linear-gradient(135deg, ${C}, #e60083)`, border: 'none', color: '#fff', padding: '0.625rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 14, height: 14, display: 'inline-flex' }}>{Ico.search}</span> Filtrar
                    </button>
                    <button className="rv-btn" onClick={limpiar} style={{ background: 'transparent', border: '2px solid rgba(255,20,147,0.4)', color: C, padding: '0.625rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 14, height: 14, display: 'inline-flex' }}>{Ico.x}</span> Limpiar
                    </button>
                </div>

                {/* Nota sobre política de cancelación */}
                <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 8, padding: '0.75rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ width: '1.1rem', height: '1.1rem', display: 'inline-flex', color: '#93c5fd' }}>{Ico.info}</span>
                    <p style={{ color: '#93c5fd', fontSize: '0.82rem', margin: 0 }}>
                        Puedes cancelar hasta <strong>{horas_min_cancelacion} horas antes</strong> del inicio de la clase. Las clases pasadas se ocultan automáticamente.
                    </p>
                </div>

                {/* ── Lista: ahora usa filteredReservas ── */}
                {filteredReservas.length > 0 ? (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {filteredReservas.map(r => {
                                const cfg          = estadoConfig[r.estado] ?? estadoConfig.confirmada;
                                const puedeCancelar = puedeCancel(r);
                                const avisoLimite   = tiempoLimiteCancelacion(r);
                                return (
                                    <div key={r.id} style={{ background: 'rgba(10,10,10,0.95)', border: `2px solid ${r.estado === 'en_espera' ? 'rgba(234,179,8,0.3)' : 'rgba(255,20,147,0.3)'}`, borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', animation: 'slideIn 0.3s ease' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: r.clase?.tipo_clase?.color ?? C, flexShrink: 0, marginTop: 4 }} />
                                            <div>
                                                <p style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.2rem', fontSize: '1rem' }}>
                                                    {r.clase?.tipo_clase?.nombre ?? 'Clase'}
                                                </p>
                                                <p style={{ color: '#999', margin: '0 0 0.15rem', fontSize: '0.85rem' }}>
                                                    {fmtFecha(r.clase?.fecha_hora_inicio)} · {hora(r.clase?.fecha_hora_inicio)} – {hora(r.clase?.fecha_hora_fin)}
                                                </p>
                                                <p style={{ color: '#666', margin: '0 0 0.15rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                    <span style={{ width: 13, height: 13, display: 'inline-flex' }}>{Ico.pin}</span> {r.clase?.sala ?? 'Sin sala'} ·
                                                    <span style={{ width: 13, height: 13, display: 'inline-flex' }}>{Ico.user}</span> {r.clase?.instructor?.name ?? 'Sin instructor'}
                                                </p>

                                                {/* Posición en lista de espera */}
                                                {r.estado === 'en_espera' && r.posicion_espera && (
                                                    <p style={{ color: '#eab308', margin: '0.2rem 0 0', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                                        <span style={{ width: 13, height: 13, display: 'inline-flex' }}>{Ico.wait}</span>
                                                        Posición #{r.posicion_espera} en lista de espera — te avisaremos si se libera un cupo
                                                    </p>
                                                )}

                                                {/* Aviso de límite de cancelación */}
                                                {avisoLimite && (
                                                    <p style={{ color: '#f97316', margin: '0.2rem 0 0', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                                        <span style={{ width: 13, height: 13, display: 'inline-flex' }}>{Ico.alert}</span>
                                                        {avisoLimite}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flexShrink: 0 }}>
                                            <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}`, borderRadius: 20, padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                {r.estado === 'en_espera'
                                                    ? <><span style={{ width: 12, height: 12, display: 'inline-flex' }}>{Ico.wait}</span> #{r.posicion_espera ?? ''} Espera</>
                                                    : cfg.label}
                                            </span>
                                            {puedeCancelar && (
                                                <button onClick={() => abrirModalCancelar(r)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 8, padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                                                onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                                                onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {reservas.last_page > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {reservas.links.map((link, i) => (
                                    <button key={i} disabled={!link.url} onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            style={{ background: link.active ? C : 'rgba(255,20,147,0.1)', border: '1px solid rgba(255,20,147,0.3)', color: link.active ? '#fff' : C, padding: '0.375rem 0.75rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: link.url ? 'pointer' : 'not-allowed', opacity: link.url ? 1 : 0.4 }} />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.2)', borderRadius: 12, padding: '4rem', textAlign: 'center' }}>
                        <p style={{ color: '#666', margin: '0 0 1rem' }}>No tienes reservas activas.</p>
                        <a href="/cliente/clases" style={{ background: C, color: '#fff', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 14, height: 14, display: 'inline-flex' }}>{Ico.gym}</span>
                            Ver Clases Disponibles
                        </a>
                    </div>
                )}

                {/* Modal de confirmación */}
                <ModalCancelarClase
                    reserva={reservaSeleccionada}
                    isOpen={modalOpen}
                    onClose={cerrarModal}
                    onConfirm={confirmarCancelacion}
                    isLoading={isLoadingCancel}
                />
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .rv-filter-wrap { box-shadow: 0 0 24px rgba(255,20,147,0.08), inset 0 1px 0 rgba(255,255,255,0.04); }
                .rv-field { min-width: 230px; }

                .rv-ns { position: relative; width: 100%; min-width: 220px; }
                .rv-ns-btn {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: .5rem;
                    padding: .62rem .9rem;
                    border-radius: 10px;
                    border: 2px solid rgba(255,20,147,0.3);
                    background: rgba(0,0,0,0.52);
                    color: #fff;
                    font-size: .86rem;
                    cursor: pointer;
                    transition: .2s ease;
                }
                .rv-ns-btn:hover, .rv-ns-btn.open {
                    border-color: rgba(255,20,147,0.65);
                    box-shadow: 0 0 0 3px rgba(255,20,147,0.12), 0 0 16px rgba(255,20,147,0.15);
                }
                .rv-ns-val { color: #fff; font-weight: 600; }
                .rv-ns-ph { color: rgba(255,255,255,.45); }
                .rv-ns-arr { color: #FF1493; transform: rotate(90deg); transition: transform .2s ease; font-size: 1rem; line-height: 1; }
                .rv-ns-arr.up { transform: rotate(-90deg); }

                .rv-ns-drop {
                    position: absolute;
                    top: calc(100% + 6px);
                    left: 0;
                    right: 0;
                    z-index: 80;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid rgba(255,20,147,.35);
                    background: rgba(8,8,10,.96);
                    backdrop-filter: blur(12px);
                    box-shadow: 0 20px 40px rgba(0,0,0,.65), 0 0 20px rgba(255,20,147,.12);
                }
                .rv-ns-opt {
                    width: 100%;
                    border: 0;
                    border-bottom: 1px solid rgba(255,20,147,.1);
                    background: transparent;
                    color: rgba(255,255,255,.75);
                    padding: .68rem .9rem;
                    text-align: left;
                    font-size: .84rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                }
                .rv-ns-opt:last-child { border-bottom: 0; }
                .rv-ns-opt:hover { background: rgba(255,20,147,.12); color: #FF1493; }
                .rv-ns-opt.active { background: rgba(255,20,147,.16); color: #FF1493; font-weight: 700; }
                .rv-ns-check { font-size: .78rem; }

                @media (max-width: 640px) {
                    .rv-filter-wrap { padding: 1rem !important; }
                    .rv-field, .rv-ns { width: 100%; min-width: 100%; }
                    .rv-btn { width: 100%; justify-content: center; }
                }
            `}</style>
        </ClienteLayout>
    );
}
