// ════════════════════════════════════════════════════════════
// PASO 8 — CREAR LA PÁGINA DE LIQUIDACIÓN
// ════════════════════════════════════════════════════════════
//
// Crea el archivo NUEVO:
//   resources/js/Pages/Instructor/Liquidacion.jsx
// ────────────────────────────────────────────────────────────

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import InstructorLayout from '@/Layouts/InstructorLayout';

export default function InstructorLiquidacion({ user, instructor, clases, totales, filters, periodoLabel }) {

    const [fechaInicio, setFechaInicio] = useState(filters?.fecha_inicio ?? '');
    const [fechaFin,    setFechaFin]    = useState(filters?.fecha_fin    ?? '');

    const hasData     = clases && clases.length > 0;
    const tipoTarifa  = instructor?.tarifa_por_asistente > 0 ? 'por_asistente' : 'por_clase';

    const calcular = () => {
        if (!fechaInicio || !fechaFin) return;
        router.get('/instructor/liquidacion', { fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    };

    const limpiar = () => {
        setFechaInicio(''); setFechaFin('');
        router.get('/instructor/liquidacion', {});
    };

    const fmtCOP   = (n)  => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0);
    const fmtFecha = (dt) => dt ? new Date(dt).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const hora     = (dt) => dt ? new Date(dt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '';

    const inp = {
        background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(6,182,212,0.3)',
        borderRadius: 8, color: '#fff', padding: '0.625rem 1rem',
        fontSize: '0.875rem', outline: 'none',
    };

    return (
        <InstructorLayout user={user}>
            <Head title="Mi Liquidación" />

            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* Título */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#06b6d4', margin: '0 0 0.5rem', textShadow: '0 0 10px rgba(6,182,212,0.5)' }}>
                        💰 Mi Liquidación
                    </h1>
                    <p style={{ color: '#999', margin: 0 }}>Consulta tu pago estimado por período</p>
                </div>

                {/* Banner de tarifa */}
                <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(6,182,212,0.3)', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '2rem' }}>💼</span>
                    <div>
                        <p style={{ color: '#06b6d4', fontWeight: 700, margin: '0 0 0.2rem', fontSize: '1rem' }}>{user.name}</p>
                        <p style={{ color: '#999', margin: 0, fontSize: '0.875rem' }}>
                            {tipoTarifa === 'por_asistente'
                                ? `Tarifa por asistente: ${fmtCOP(instructor?.tarifa_por_asistente)} por persona`
                                : `Tarifa fija por clase: ${fmtCOP(instructor?.tarifa_por_clase)}`
                            }
                        </p>
                    </div>
                    <div style={{ marginLeft: 'auto', background: tipoTarifa === 'por_asistente' ? 'rgba(147,51,234,0.1)' : 'rgba(6,182,212,0.1)', border: `1px solid ${tipoTarifa === 'por_asistente' ? '#9333ea' : '#06b6d4'}`, borderRadius: 20, padding: '0.375rem 1rem', color: tipoTarifa === 'por_asistente' ? '#9333ea' : '#06b6d4', fontSize: '0.8rem', fontWeight: 700 }}>
                        {tipoTarifa === 'por_asistente' ? '$ Por Asistente' : '$ Tarifa Fija'}
                    </div>
                </div>

                {/* Filtro de período */}
                <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(6,182,212,0.3)', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#06b6d4', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Desde</label>
                        <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={inp} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#06b6d4', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Hasta</label>
                        <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} style={inp} />
                    </div>
                    <button
                        onClick={calcular}
                        disabled={!fechaInicio || !fechaFin}
                        style={{ background: !fechaInicio || !fechaFin ? 'rgba(6,182,212,0.3)' : 'linear-gradient(135deg,#06b6d4,#0891b2)', border: 'none', color: '#000', padding: '0.625rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: !fechaInicio || !fechaFin ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}
                    >
                        📊 Calcular
                    </button>
                    {hasData && (
                        <button onClick={limpiar} style={{ background: 'transparent', border: '2px solid rgba(6,182,212,0.4)', color: '#06b6d4', padding: '0.625rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                            ✕ Limpiar
                        </button>
                    )}
                </div>

                {/* Resultado */}
                {hasData ? (
                    <>
                        {/* Tarjetas resumen */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            {[
                                { label: 'Clases Dictadas',  value: totales?.total_clases ?? 0,          icon: '📅', color: '#3b82f6', big: false },
                                { label: 'Total Asistentes', value: totales?.total_asistentes ?? 0,       icon: '👥', color: '#22c55e', big: false },
                                { label: 'Total a Pagar',    value: fmtCOP(totales?.total_pago ?? 0),    icon: '💰', color: '#06b6d4', big: true  },
                            ].map(s => (
                                <div key={s.label} style={{ background: 'rgba(10,10,10,0.95)', border: `2px solid ${s.color}40`, borderRadius: 12, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: `0 0 20px ${s.color}15` }}>
                                    <span style={{ fontSize: '2.5rem' }}>{s.icon}</span>
                                    <div>
                                        <p style={{ color: '#999', fontSize: '0.8rem', margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</p>
                                        <h3 style={{ color: s.color, fontSize: s.big ? '1.75rem' : '2rem', fontWeight: 900, margin: 0 }}>{s.value}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tabla detalle */}
                        <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(6,182,212,0.3)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 0 30px rgba(6,182,212,0.1)' }}>
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '2px solid rgba(6,182,212,0.2)' }}>
                                <h3 style={{ color: '#06b6d4', fontWeight: 900, margin: 0, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Detalle por Clase · {periodoLabel}
                                </h3>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                    <tr style={{ borderBottom: '2px solid rgba(6,182,212,0.2)' }}>
                                        {['Fecha', 'Tipo de Clase', 'Horario', 'Sala', 'Asistentes', 'Tarifa aplicada', 'Subtotal'].map(h => (
                                            <th key={h} style={{ padding: '1rem 1.25rem', color: '#06b6d4', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {clases.map((clase, i) => (
                                        <tr key={clase.id} style={{ borderBottom: '1px solid rgba(6,182,212,0.08)', background: i % 2 === 0 ? 'transparent' : 'rgba(6,182,212,0.02)' }}>
                                            <td style={{ padding: '1rem 1.25rem', color: '#fff', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                                {fmtFecha(clase.fecha_hora_inicio)}
                                            </td>
                                            <td style={{ padding: '1rem 1.25rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: clase.tipo_clase?.color ?? '#06b6d4' }} />
                                                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>{clase.tipo_clase?.nombre}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.25rem', color: '#ccc', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                                {hora(clase.fecha_hora_inicio)} – {hora(clase.fecha_hora_fin)}
                                            </td>
                                            <td style={{ padding: '1rem 1.25rem', color: '#ccc', fontSize: '0.875rem' }}>{clase.sala ?? '—'}</td>
                                            <td style={{ padding: '1rem 1.25rem', color: '#22c55e', fontSize: '0.875rem', fontWeight: 700, textAlign: 'center' }}>
                                                {clase.total_asistentes}
                                            </td>
                                            <td style={{ padding: '1rem 1.25rem', color: '#999', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                {tipoTarifa === 'por_asistente'
                                                    ? `${fmtCOP(instructor?.tarifa_por_asistente)} × ${clase.total_asistentes}`
                                                    : `Fija: ${fmtCOP(instructor?.tarifa_por_clase)}`
                                                }
                                            </td>
                                            <td style={{ padding: '1rem 1.25rem', color: '#06b6d4', fontSize: '0.9rem', fontWeight: 900, whiteSpace: 'nowrap' }}>
                                                {fmtCOP(clase.pago)}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    <tfoot>
                                    <tr style={{ borderTop: '2px solid rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.05)' }}>
                                        <td colSpan="6" style={{ padding: '1rem 1.25rem', color: '#06b6d4', fontWeight: 900, textAlign: 'right', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.875rem' }}>
                                            TOTAL A PAGAR
                                        </td>
                                        <td style={{ padding: '1rem 1.25rem', color: '#06b6d4', fontWeight: 900, fontSize: '1.25rem' }}>
                                            {fmtCOP(totales?.total_pago)}
                                        </td>
                                    </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(6,182,212,0.2)', borderRadius: 12, padding: '4rem', textAlign: 'center' }}>
                        <p style={{ color: '#666', fontSize: '1rem', margin: '0 0 0.5rem' }}>Selecciona un período para calcular tu liquidación.</p>
                        <p style={{ color: '#444', fontSize: '0.875rem', margin: 0 }}>
                            Solo se incluyen clases con estado <strong style={{ color: '#6b7280' }}>finalizada</strong>.
                        </p>
                    </div>
                )}
            </div>
        </InstructorLayout>
    );
}
