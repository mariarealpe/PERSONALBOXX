import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState, useRef } from 'react';
import ConfirmDialog from '@/Components/ConfirmDialog';

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

    const fondoStyle = plan.foto_url
        ? { backgroundImage: `url(${plan.foto_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: plan.color_fondo || '#1a1a2e' };

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                width: '100%',
                maxWidth: 320,
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
                justifySelf: 'stretch',
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
        <div className="plan-modal-overlay">
            <div className="plan-modal-card"
                 onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="plan-modal-header">
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

                <form onSubmit={handleSubmit} className="plan-modal-form">
                    <div className="plan-modal-grid">

                        {/* ── Columna izquierda: formulario ── */}
                        <div className="plan-modal-main">

                            {/* Nombre y tipo */}
                            <div className="form-grid-2">
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
                            <div className="form-grid-2">
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
                        <div className="plan-modal-preview">
                            <p style={{ color: '#555', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: '1rem' }}>Vista previa</p>

                            {/* Mini tarjeta preview */}
                            <div style={{ width: '100%', maxWidth: 220, borderRadius: 16, overflow: 'hidden', border: `2px solid ${tipoColor}44`, boxShadow: `0 12px 40px ${tipoColor}30` }}>
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
                    <div className="plan-modal-footer">
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
    const [confirmState, setConfirmState] = useState({
        open: false,
        title: '',
        message: '',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        onConfirm: null,
    });

    const openConfirm = (opts) => setConfirmState({ open: true, ...opts });
    const closeConfirm = () => setConfirmState((s) => ({ ...s, open: false }));

    const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0);

    const abrirCrear = () => { setPlanEditando(null); setModalAbierto(true); };
    const abrirEditar = (plan) => { setPlanEditando(plan); setModalAbierto(true); };
    const cerrarModal = () => { setModalAbierto(false); setPlanEditando(null); };

    const handleDelete = (plan) => {
        openConfirm({
            title: 'Eliminar plan',
            message: `¿Eliminar el plan "${plan.nombre}"? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            onConfirm: () => router.delete(route('admin.planes.destroy', plan.id)),
        });
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

            <ConfirmDialog
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={confirmState.confirmText}
                cancelText={confirmState.cancelText}
                onConfirm={confirmState.onConfirm}
                onClose={closeConfirm}
            />

            <div className="planes-wrap">

                <div className="planes-header">
                    <div>
                        <h1 className="planes-title">PLANES</h1>
                        <p className="planes-sub">Gestiona los planes de membresía del gimnasio</p>
                    </div>
                    <button onClick={abrirCrear} className="btn-primary">
                        ✨ Nuevo Plan
                    </button>
                </div>

                <div className="planes-stats">
                    {[
                        { label: 'Total planes', value: planes.length, icon: '📋', color: '#FF1493' },
                        { label: 'Planes activos', value: planes.filter(p => p.activo).length, icon: '✅', color: '#22c55e' },
                        { label: 'Clientes activos', value: planes.reduce((s, p) => s + p.clientes_activos, 0), icon: '👥', color: '#3b82f6' },
                        { label: 'Ingresos estimados', value: fmt(totalIngresos), icon: '💰', color: '#f59e0b' },
                    ].map(s => (
                        <div key={s.label} className="stat-card" style={{ '--s-color': s.color }}>
                            <span className="stat-ico">{s.icon}</span>
                            <div>
                                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="planes-filters">
                    {[{ key: 'todos', label: 'Todos' }, { key: 'activos', label: 'Activos' }, { key: 'inactivos', label: 'Inactivos' }].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFiltro(f.key)}
                            className={`filter-chip ${filtro === f.key ? 'active' : ''}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {planesFiltrados.length === 0 ? (
                    <div className="empty-state glass-card">
                        <p>No hay planes para mostrar.</p>
                        <button onClick={abrirCrear} className="btn-ghost">✨ Crear primer plan</button>
                    </div>
                ) : (
                    <div className="planes-grid">
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

            <style>{`
                .planes-wrap {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .planes-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .planes-title {
                    font-size: clamp(1.6rem, 4vw, 2.2rem);
                    font-weight: 900;
                    color: #FF1493;
                    margin: 0 0 .25rem;
                    text-shadow: 0 0 12px rgba(255,20,147,0.45);
                }

                .planes-sub { color: #777; margin: 0; font-size: .85rem; }

                .btn-primary {
                    background: rgba(255,20,147,0.18);
                    border: 1px solid rgba(255,255,255,0.18);
                    color: #FF1493;
                    text-shadow: 0 0 8px rgba(255,20,147,0.35);
                    padding: .875rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 900;
                    cursor: pointer;
                    transition: all .25s ease;
                    backdrop-filter: blur(10px);
                }
                .btn-primary:hover { background: rgba(255,20,147,0.28); color: #fff; }

                .btn-ghost {
                    background: rgba(255,20,147,0.08);
                    border: 1px solid rgba(255,20,147,0.35);
                    color: #FF1493;
                    padding: .75rem 1.25rem;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .glass-card {
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(22px);
                    -webkit-backdrop-filter: blur(22px);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-top: 1px solid rgba(255,255,255,0.12);
                    border-radius: 16px;
                    box-shadow: 0 0 28px rgba(255,20,147,0.08), 0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07);
                }

                .planes-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 1rem;
                }

                .stat-card {
                    background: rgba(10,10,10,0.95);
                    border: 1px solid color-mix(in srgb, var(--s-color) 35%, transparent);
                    border-radius: 12px;
                    padding: 1rem 1.1rem;
                    display: flex;
                    align-items: center;
                    gap: .85rem;
                }

                .stat-ico { font-size: 1.5rem; }
                .stat-value { font-size: 1.25rem; font-weight: 900; line-height: 1; }
                .stat-label { color: #666; font-size: .68rem; text-transform: uppercase; letter-spacing: 1px; margin-top: .2rem; }

                .planes-filters { display: flex; gap: .5rem; flex-wrap: wrap; }

                .filter-chip {
                    padding: .5rem 1.1rem;
                    border-radius: 999px;
                    font-weight: 700;
                    font-size: .8rem;
                    cursor: pointer;
                    background: rgba(255,20,147,0.08);
                    color: #FF1493;
                    border: 1px solid rgba(255,20,147,0.3);
                }
                .filter-chip.active {
                    background: rgba(255,20,147,0.25);
                    color: #fff;
                    border-color: rgba(255,20,147,0.6);
                }

                .planes-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 1.2rem;
                    align-items: stretch;
                }

                /* Modal responsive */
                .plan-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.85);
                    z-index: 1000;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding: 1.5rem;
                    overflow-y: auto;
                }

                .plan-modal-card {
                    background: #0a0a0a;
                    border: 2px solid rgba(255,255,255,0.1);
                    border-radius: 16px;
                    width: 100%;
                    max-width: 820px;
                    box-shadow: 0 40px 80px rgba(0,0,0,0.8);
                    margin-bottom: 1.5rem;
                }

                .plan-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: .75rem;
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                }

                .plan-modal-form { width: 100%; }

                .plan-modal-grid {
                    display: grid;
                    grid-template-columns: 1fr 280px;
                    gap: 0;
                }

                .plan-modal-main {
                    padding: 1.75rem 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.2rem;
                    min-width: 0;
                }

                .plan-modal-preview {
                    border-left: 1px solid rgba(255,255,255,0.07);
                    padding: 1.75rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: rgba(0,0,0,0.3);
                }

                .form-grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .plan-modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    padding: 1.25rem 2rem;
                    border-top: 1px solid rgba(255,255,255,0.07);
                    flex-wrap: wrap;
                }

                .empty-state {
                    text-align: center;
                    padding: 3rem 1rem;
                }

                .empty-state p { color: #666; margin: 0 0 1rem; }

                @media (max-width: 1024px) {
                    .plan-modal-grid { grid-template-columns: 1fr; }
                    .plan-modal-preview {
                        border-left: 0;
                        border-top: 1px solid rgba(255,255,255,0.07);
                        padding: 1.25rem 1rem 1.5rem;
                    }
                }

                @media (max-width: 768px) {
                    .planes-header { flex-direction: column; align-items: stretch; }
                    .btn-primary { width: 100%; }
                    .planes-grid { grid-template-columns: 1fr; }
                    .planes-stats { grid-template-columns: 1fr; }
                    .planes-filters { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; }
                    .filter-chip { width: 100%; text-align: center; }
                    .plan-modal-overlay { padding: .75rem; }
                    .plan-modal-header { padding: 1rem 1rem; align-items: flex-start; }
                    .plan-modal-main { padding: 1rem; }
                    .form-grid-2 { grid-template-columns: 1fr; }
                    .plan-modal-footer { padding: 1rem; flex-direction: column; }
                    .plan-modal-footer button { width: 100%; }
                }

                @media (max-width: 480px) {
                    .planes-filters { grid-template-columns: 1fr; }
                    .plan-modal-card { border-radius: 12px; }
                }
            `}</style>
        </DashboardLayout>
    );
}
