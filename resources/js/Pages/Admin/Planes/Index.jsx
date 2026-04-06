import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState, useRef } from 'react';

// ── Tipos de plan con etiquetas legibles ──────────────────────────────────────
const TIPOS = [
    { value: 'adultos_activos', label: 'Adultos Activos' },
    { value: 'membresia',       label: 'Membresía'       },
    { value: 'premium',         label: 'Premium'          },
    { value: 'personalizado',   label: 'Personalizado'    },
];

const TIPO_COLORES = {
    adultos_activos: '#3b82f6',
    membresia:       '#8b5cf6',
    premium:         '#f59e0b',
    personalizado:   '#FF1493',
};

// ── Tarjeta de plan ───────────────────────────────────────────────────────────
function TarjetaPlan({ plan, onEdit, onDelete, onToggle }) {
    const [hover, setHover] = useState(false);
    const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0);
    const tipoColor = TIPO_COLORES[plan.tipo] || '#FF1493';
    const tipoLabel = TIPOS.find(t => t.value === plan.tipo)?.label || plan.tipo;

    // Fondo: foto si existe, sino color sólido
    const fondoStyle = plan.foto_url
        ? { backgroundImage: `url(${plan.foto_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: plan.color_fondo || '#1a1a2e' };

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                width: 280,
                minHeight: 420,
                borderRadius: 20,
                overflow: 'hidden',
                position: 'relative',
                border: `2px solid ${hover ? tipoColor : 'rgba(255,255,255,0.08)'}`,
                boxShadow: hover
                    ? `0 20px 60px ${tipoColor}40, 0 0 0 1px ${tipoColor}30`
                    : '0 8px 32px rgba(0,0,0,0.5)',
                transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                transform: hover ? 'translateY(-6px)' : 'translateY(0)',
                cursor: 'default',
                flexShrink: 0,
            }}
        >
            {/* ── Zona superior: foto o color ── */}
            <div style={{ ...fondoStyle, height: 200, position: 'relative' }}>
                {/* Overlay gradiente para legibilidad */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
                }} />

                {/* Badge tipo */}
                <div style={{
                    position: 'absolute', top: 14, left: 14,
                    background: `${tipoColor}dd`,
                    backdropFilter: 'blur(8px)',
                    color: '#fff', fontSize: '0.65rem', fontWeight: 800,
                    padding: '0.25rem 0.7rem', borderRadius: 20,
                    textTransform: 'uppercase', letterSpacing: 1.5,
                }}>
                    {tipoLabel}
                </div>

                {/* Badge estado activo/inactivo */}
                <div style={{
                    position: 'absolute', top: 14, right: 14,
                    background: plan.activo ? 'rgba(34,197,94,0.9)' : 'rgba(107,114,128,0.9)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff', fontSize: '0.6rem', fontWeight: 800,
                    padding: '0.25rem 0.6rem', borderRadius: 20,
                    textTransform: 'uppercase', letterSpacing: 1,
                }}>
                    {plan.activo ? '● Activo' : '○ Inactivo'}
                </div>

                {/* Precio grande en la zona de imagen */}
                <div style={{
                    position: 'absolute', bottom: 14, left: 14, right: 14,
                }}>
                    <div style={{ color: '#fff', fontSize: '1.9rem', fontWeight: 900, lineHeight: 1, textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
                        {fmt(plan.precio)}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', marginTop: 2 }}>por mes</div>
                </div>
            </div>

            {/* ── Zona inferior: info ── */}
            <div style={{ background: '#0d0d0d', padding: '1.25rem', flex: 1 }}>
                <h3 style={{ color: '#fff', fontWeight: 900, margin: '0 0 0.4rem', fontSize: '1.1rem', lineHeight: 1.2 }}>
                    {plan.nombre}
                </h3>
                {plan.descripcion && (
                    <p style={{ color: '#888', fontSize: '0.78rem', margin: '0 0 1rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {plan.descripcion}
                    </p>
                )}

                {/* Detalles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem' }}>📅</span>
                        <span style={{ color: '#aaa', fontSize: '0.75rem' }}>
                            {plan.es_ilimitado ? 'Clases ilimitadas' : `${plan.clases_por_semana ?? '—'} clases/semana`}
                        </span>
                    </div>
                    {plan.incluye_personalizadas && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem' }}>⭐</span>
                            <span style={{ color: '#aaa', fontSize: '0.75rem' }}>Incluye sesiones personalizadas</span>
                        </div>
                    )}
                    {plan.clientes_activos > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem' }}>👥</span>
                            <span style={{ color: tipoColor, fontSize: '0.75rem', fontWeight: 700 }}>{plan.clientes_activos} cliente{plan.clientes_activos !== 1 ? 's' : ''} activo{plan.clientes_activos !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>

                {/* Beneficios */}
                {plan.beneficios && plan.beneficios.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                        {plan.beneficios.slice(0, 3).map((b, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.25rem' }}>
                                <span style={{ color: tipoColor, fontSize: '0.7rem', marginTop: 1, flexShrink: 0 }}>✓</span>
                                <span style={{ color: '#999', fontSize: '0.72rem', lineHeight: 1.4 }}>{b}</span>
                            </div>
                        ))}
                        {plan.beneficios.length > 3 && (
                            <span style={{ color: '#555', fontSize: '0.7rem' }}>+{plan.beneficios.length - 3} más...</span>
                        )}
                    </div>
                )}

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button
                        onClick={() => onEdit(plan)}
                        style={{ flex: 1, background: `${tipoColor}18`, border: `1px solid ${tipoColor}55`, color: tipoColor, padding: '0.5rem', borderRadius: 8, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = `${tipoColor}30`}
                        onMouseOut={e => e.currentTarget.style.background = `${tipoColor}18`}
                    >
                        ✏️ Editar
                    </button>
                    <button
                        onClick={() => onToggle(plan)}
                        title={plan.activo ? 'Desactivar plan' : 'Activar plan'}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#666', padding: '0.5rem 0.6rem', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                        {plan.activo ? '⏸' : '▶'}
                    </button>
                    <button
                        onClick={() => onDelete(plan)}
                        title="Eliminar plan"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.5rem 0.6rem', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Modal crear/editar plan ───────────────────────────────────────────────────
function ModalPlan({ plan, onClose }) {
    const editando     = !!plan;
    const fotoInputRef = useRef(null);
    const [preview, setPreview]       = useState(plan?.foto_url || null);
    const [beneficioInput, setBeneficioInput] = useState('');
    const [beneficios, setBeneficios] = useState(plan?.beneficios || []);
    const [usarFoto, setUsarFoto]     = useState(!!plan?.foto_url);

    const { data, setData, post, put, processing, errors } = useForm({
        nombre:                  plan?.nombre || '',
        tipo:                    plan?.tipo || 'adultos_activos',
        precio:                  plan?.precio || '',
        descripcion:             plan?.descripcion || '',
        clases_por_semana:       plan?.clases_por_semana || '',
        es_ilimitado:            plan?.es_ilimitado || false,
        incluye_personalizadas:  plan?.incluye_personalizadas || false,
        activo:                  plan?.activo ?? true,
        foto:                    null,
        eliminar_foto:           false,
        color_fondo:             plan?.color_fondo || '#1a1a2e',
        beneficios:              JSON.stringify(plan?.beneficios || []),
    });

    const tipoColor = TIPO_COLORES[data.tipo] || '#FF1493';

    const handleFoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('foto', file);
        setPreview(URL.createObjectURL(file));
        setUsarFoto(true);
    };

    const quitarFoto = () => {
        setData('foto', null);
        setData('eliminar_foto', true);
        setPreview(null);
        setUsarFoto(false);
        if (fotoInputRef.current) fotoInputRef.current.value = '';
    };

    const agregarBeneficio = () => {
        const b = beneficioInput.trim();
        if (!b) return;
        const nuevos = [...beneficios, b];
        setBeneficios(nuevos);
        setData('beneficios', JSON.stringify(nuevos));
        setBeneficioInput('');
    };

    const quitarBeneficio = (i) => {
        const nuevos = beneficios.filter((_, idx) => idx !== i);
        setBeneficios(nuevos);
        setData('beneficios', JSON.stringify(nuevos));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const opts = {
            forceFormData: true,
            onSuccess: onClose,
        };
        if (editando) {
            post(route('admin.planes.update', plan.id) + '?_method=PUT', opts);
        } else {
            post(route('admin.planes.store'), opts);
        }
    };

    const inp = {
        width: '100%', padding: '0.75rem',
        background: 'rgba(0,0,0,0.5)',
        border: '2px solid rgba(255,255,255,0.08)',
        borderRadius: 8, color: '#fff', fontSize: '0.875rem',
        boxSizing: 'border-box', outline: 'none',
        transition: 'border-color 0.2s',
    };
    const lbl = { display: 'block', color: '#aaa', fontSize: '0.68rem', fontWeight: 700, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 };
    const err = { color: '#ef4444', fontSize: '0.72rem', marginTop: 3 };

    // Preview de la tarjeta en tiempo real
    const fondoPreviewStyle = preview && usarFoto
        ? { backgroundImage: `url(${preview})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: data.color_fondo || '#1a1a2e' };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }}>
            <div style={{ background: '#0a0a0a', border: '2px solid rgba(255,255,255,0.1)', borderRadius: 16, width: '100%', maxWidth: 820, boxShadow: '0 40px 80px rgba(0,0,0,0.8)', marginBottom: '1.5rem' }}
                 onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div>
                        <h2 style={{ color: '#fff', fontWeight: 900, margin: 0, fontSize: '1.4rem' }}>
                            {editando ? '✏️ Editar Plan' : '✨ Nuevo Plan'}
                        </h2>
                        <p style={{ color: '#555', margin: '0.2rem 0 0', fontSize: '0.8rem' }}>
                            {editando ? `Modificando: ${plan.nombre}` : 'Crea un nuevo plan de membresía'}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#666', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 0 }}>

                        {/* ── Columna izquierda: formulario ── */}
                        <div style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                            {/* Nombre y tipo */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={lbl}>Nombre del plan *</label>
                                    <input value={data.nombre} onChange={e => setData('nombre', e.target.value)} required placeholder="Ej: Plan Gold" style={inp} />
                                    {errors.nombre && <p style={err}>{errors.nombre}</p>}
                                </div>
                                <div>
                                    <label style={lbl}>Tipo *</label>
                                    <select value={data.tipo} onChange={e => setData('tipo', e.target.value)} required style={{ ...inp, color: '#fff' }}>
                                        {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Precio */}
                            <div>
                                <label style={lbl}>Precio mensual (COP) *</label>
                                <input type="number" value={data.precio} onChange={e => setData('precio', e.target.value)} required min={0} placeholder="150000" style={inp} />
                                {errors.precio && <p style={err}>{errors.precio}</p>}
                            </div>

                            {/* Descripción */}
                            <div>
                                <label style={lbl}>Descripción</label>
                                <textarea value={data.descripcion} onChange={e => setData('descripcion', e.target.value)} rows={2} placeholder="Descripción breve del plan..." style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
                            </div>

                            {/* Opciones */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ ...lbl, marginBottom: 10 }}>Clases por semana</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                                        <input type="checkbox" id="ilimitado" checked={data.es_ilimitado} onChange={e => setData('es_ilimitado', e.target.checked)}
                                               style={{ width: 16, height: 16, accentColor: tipoColor, cursor: 'pointer' }} />
                                        <label htmlFor="ilimitado" style={{ color: '#aaa', fontSize: '0.82rem', cursor: 'pointer' }}>Ilimitadas</label>
                                    </div>
                                    {!data.es_ilimitado && (
                                        <input type="number" value={data.clases_por_semana} onChange={e => setData('clases_por_semana', e.target.value)} min={1} placeholder="Nº de clases" style={{ ...inp, marginTop: 0 }} />
                                    )}
                                </div>
                                <div>
                                    <label style={{ ...lbl, marginBottom: 10 }}>Opciones adicionales</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <input type="checkbox" id="personalizadas" checked={data.incluye_personalizadas} onChange={e => setData('incluye_personalizadas', e.target.checked)}
                                                   style={{ width: 16, height: 16, accentColor: tipoColor, cursor: 'pointer' }} />
                                            <label htmlFor="personalizadas" style={{ color: '#aaa', fontSize: '0.82rem', cursor: 'pointer' }}>Incluye personalizadas</label>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <input type="checkbox" id="activo" checked={data.activo} onChange={e => setData('activo', e.target.checked)}
                                                   style={{ width: 16, height: 16, accentColor: tipoColor, cursor: 'pointer' }} />
                                            <label htmlFor="activo" style={{ color: '#aaa', fontSize: '0.82rem', cursor: 'pointer' }}>Plan activo</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Beneficios */}
                            <div>
                                <label style={lbl}>Beneficios del plan</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                    <input
                                        value={beneficioInput}
                                        onChange={e => setBeneficioInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarBeneficio(); } }}
                                        placeholder="Ej: Acceso a vestuarios..."
                                        style={{ ...inp, flex: 1 }}
                                    />
                                    <button type="button" onClick={agregarBeneficio}
                                            style={{ background: `${tipoColor}22`, border: `1px solid ${tipoColor}55`, color: tipoColor, padding: '0.75rem 1rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0 }}>
                                        + Agregar
                                    </button>
                                </div>
                                {beneficios.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                        {beneficios.map((b, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '0.4rem 0.75rem' }}>
                                                <span style={{ color: '#ccc', fontSize: '0.8rem' }}>✓ {b}</span>
                                                <button type="button" onClick={() => quitarBeneficio(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', padding: '0 0.2rem' }}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Apariencia: foto o color */}
                            <div>
                                <label style={lbl}>Apariencia de la tarjeta</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <button type="button" onClick={() => setUsarFoto(false)}
                                            style={{ flex: 1, padding: '0.5rem', borderRadius: 8, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', background: !usarFoto ? `${tipoColor}22` : 'rgba(255,255,255,0.04)', border: !usarFoto ? `2px solid ${tipoColor}` : '2px solid rgba(255,255,255,0.08)', color: !usarFoto ? tipoColor : '#666', transition: 'all 0.2s' }}>
                                        🎨 Color de fondo
                                    </button>
                                    <button type="button" onClick={() => { setUsarFoto(true); fotoInputRef.current?.click(); }}
                                            style={{ flex: 1, padding: '0.5rem', borderRadius: 8, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', background: usarFoto ? `${tipoColor}22` : 'rgba(255,255,255,0.04)', border: usarFoto ? `2px solid ${tipoColor}` : '2px solid rgba(255,255,255,0.08)', color: usarFoto ? tipoColor : '#666', transition: 'all 0.2s' }}>
                                        🖼️ Foto de portada
                                    </button>
                                </div>

                                {!usarFoto && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <input type="color" value={data.color_fondo} onChange={e => setData('color_fondo', e.target.value)}
                                               style={{ width: 48, height: 48, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'none', padding: 0 }} />
                                        <div>
                                            <input value={data.color_fondo} onChange={e => setData('color_fondo', e.target.value)}
                                                   placeholder="#1a1a2e" maxLength={7}
                                                   style={{ ...inp, width: 120, fontFamily: 'monospace' }} />
                                            <p style={{ color: '#555', fontSize: '0.7rem', margin: '0.2rem 0 0' }}>Código hexadecimal</p>
                                        </div>
                                        {/* Paleta rápida */}
                                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                            {['#1a1a2e','#0f3460','#16213e','#1b4332','#3d0066','#7c2d12','#1e3a5f','#2d1b69'].map(c => (
                                                <button key={c} type="button" onClick={() => setData('color_fondo', c)}
                                                        title={c}
                                                        style={{ width: 24, height: 24, borderRadius: 6, background: c, border: data.color_fondo === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', padding: 0 }} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {usarFoto && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <input ref={fotoInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFoto} style={{ display: 'none' }} />
                                        <button type="button" onClick={() => fotoInputRef.current?.click()}
                                                style={{ background: `${tipoColor}15`, border: `2px dashed ${tipoColor}55`, color: tipoColor, padding: '0.6rem 1.2rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                                            {preview ? '🔄 Cambiar foto' : '📁 Seleccionar foto'}
                                        </button>
                                        {preview && (
                                            <button type="button" onClick={quitarFoto}
                                                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '0.6rem 0.8rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                                                🗑️ Quitar foto
                                            </button>
                                        )}
                                        {errors.foto && <p style={err}>{errors.foto}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Columna derecha: preview en vivo ── */}
                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.07)', padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.3)' }}>
                            <p style={{ color: '#555', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: '1rem' }}>Vista previa</p>

                            {/* Mini tarjeta preview */}
                            <div style={{ width: 220, borderRadius: 16, overflow: 'hidden', border: `2px solid ${tipoColor}44`, boxShadow: `0 12px 40px ${tipoColor}30` }}>
                                {/* Zona de imagen/color */}
                                <div style={{ ...fondoPreviewStyle, height: 150, position: 'relative' }}>
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.7) 100%)' }} />
                                    <div style={{ position: 'absolute', top: 10, left: 10, background: `${tipoColor}dd`, color: '#fff', fontSize: '0.55rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                                        {TIPOS.find(t => t.value === data.tipo)?.label}
                                    </div>
                                    <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
                                        <div style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 900, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                                            {data.precio ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(data.precio) : '$0'}
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem' }}>por mes</div>
                                    </div>
                                </div>
                                {/* Zona info preview */}
                                <div style={{ background: '#0d0d0d', padding: '1rem' }}>
                                    <h4 style={{ color: '#fff', fontWeight: 900, margin: '0 0 0.3rem', fontSize: '0.9rem' }}>{data.nombre || 'Nombre del plan'}</h4>
                                    <p style={{ color: '#888', fontSize: '0.68rem', margin: '0 0 0.75rem', lineHeight: 1.4 }}>{data.descripcion || 'Descripción del plan...'}</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <div style={{ color: '#aaa', fontSize: '0.65rem' }}>
                                            {data.es_ilimitado ? '📅 Clases ilimitadas' : data.clases_por_semana ? `📅 ${data.clases_por_semana} clases/semana` : '📅 —'}
                                        </div>
                                        {data.incluye_personalizadas && <div style={{ color: '#aaa', fontSize: '0.65rem' }}>⭐ Incluye personalizadas</div>}
                                    </div>
                                    {beneficios.length > 0 && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            {beneficios.slice(0, 2).map((b, i) => (
                                                <div key={i} style={{ color: '#888', fontSize: '0.62rem', marginBottom: '0.2rem' }}>
                                                    <span style={{ color: tipoColor }}>✓</span> {b}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p style={{ color: '#444', fontSize: '0.65rem', marginTop: '0.75rem', textAlign: 'center' }}>
                                La tarjeta se actualiza<br/>en tiempo real
                            </p>
                        </div>
                    </div>

                    {/* Footer botones */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.25rem 2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                        <button type="button" onClick={onClose}
                                style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.1)', color: '#666', padding: '0.7rem 1.5rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing}
                                style={{ background: `linear-gradient(135deg, ${tipoColor}, ${tipoColor}cc)`, border: 'none', color: '#000', padding: '0.7rem 2rem', borderRadius: 8, cursor: 'pointer', fontWeight: 900, fontSize: '0.9rem', opacity: processing ? 0.6 : 1 }}>
                            {processing ? 'Guardando...' : editando ? '💾 Guardar cambios' : '✨ Crear plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function PlanesIndex({ auth, planes }) {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [planEditando, setPlanEditando] = useState(null);
    const [filtro, setFiltro]             = useState('todos');

    const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0);

    const abrirCrear = () => { setPlanEditando(null); setModalAbierto(true); };
    const abrirEditar = (plan) => { setPlanEditando(plan); setModalAbierto(true); };
    const cerrarModal = () => { setModalAbierto(false); setPlanEditando(null); };

    const handleDelete = (plan) => {
        if (!confirm(`¿Eliminar el plan "${plan.nombre}"? Esta acción no se puede deshacer.`)) return;
        router.delete(route('admin.planes.destroy', plan.id));
    };

    const handleToggle = (plan) => {
        router.patch(route('admin.planes.toggle', plan.id));
    };

    const planesFiltrados = filtro === 'todos'
        ? planes
        : filtro === 'activos'
            ? planes.filter(p => p.activo)
            : planes.filter(p => !p.activo);

    const totalIngresos = planes.filter(p => p.activo).reduce((s, p) => s + (p.precio * p.clientes_activos), 0);

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Gestión de Planes" />

            {modalAbierto && (
                <ModalPlan plan={planEditando} onClose={cerrarModal} />
            )}

            <div style={{ maxWidth: 1400, margin: '0 auto' }}>

                {/* Encabezado */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#FF1493', margin: 0, textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>PLANES</h1>
                        <p style={{ color: '#999', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Gestiona los planes de membresía del gimnasio</p>
                    </div>
                    <button onClick={abrirCrear}
                            style={{ background: 'linear-gradient(135deg,#FF1493,#C71585)', color: '#000', border: 'none', padding: '0.875rem 1.5rem', borderRadius: 8, fontWeight: 900, cursor: 'pointer', fontSize: '0.875rem', boxShadow: '0 0 20px rgba(255,20,147,0.4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ✨ Nuevo Plan
                    </button>
                </div>

                {/* Stats rápidas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total planes', value: planes.length, icon: '📋', color: '#FF1493' },
                        { label: 'Planes activos', value: planes.filter(p => p.activo).length, icon: '✅', color: '#22c55e' },
                        { label: 'Clientes activos', value: planes.reduce((s, p) => s + p.clientes_activos, 0), icon: '👥', color: '#3b82f6' },
                        { label: 'Ingresos estimados', value: fmt(totalIngresos), icon: '💰', color: '#f59e0b' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(10,10,10,0.95)', border: `2px solid ${s.color}30`, borderRadius: 12, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                            <div>
                                <div style={{ color: s.color, fontSize: '1.5rem', fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                                <div style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filtros */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                    {[{ key: 'todos', label: 'Todos' }, { key: 'activos', label: 'Activos' }, { key: 'inactivos', label: 'Inactivos' }].map(f => (
                        <button key={f.key} onClick={() => setFiltro(f.key)}
                                style={{ padding: '0.5rem 1.25rem', borderRadius: 20, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', background: filtro === f.key ? '#FF1493' : 'rgba(255,20,147,0.08)', color: filtro === f.key ? '#000' : '#FF1493', border: filtro === f.key ? 'none' : '1px solid rgba(255,20,147,0.3)', transition: 'all 0.2s' }}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Grid de tarjetas */}
                {planesFiltrados.length === 0 ? (
                    <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.2)', borderRadius: 12, padding: '4rem', textAlign: 'center' }}>
                        <p style={{ color: '#555', fontSize: '1rem', margin: 0 }}>No hay planes para mostrar.</p>
                        <button onClick={abrirCrear} style={{ marginTop: '1rem', background: 'rgba(255,20,147,0.1)', border: '2px solid #FF1493', color: '#FF1493', padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                            ✨ Crear primer plan
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'flex-start' }}>
                        {planesFiltrados.map(plan => (
                            <TarjetaPlan
                                key={plan.id}
                                plan={plan}
                                onEdit={abrirEditar}
                                onDelete={handleDelete}
                                onToggle={handleToggle}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
