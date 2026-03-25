import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

export default function LiquidacionHistorial({ auth, liquidaciones }) {
    const green = '#22c55e';
    const fmt   = (n) => `$${new Intl.NumberFormat('es-CO').format(n ?? 0)}`;
    const fmtD  = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    const handleDelete = (id) => {
        if (confirm('¿Eliminar este registro de liquidación?')) {
            router.delete(route('admin.reportes.liquidacion.historial.destroy', id));
        }
    };

    const boxStyle = {
        background: 'rgba(10,10,10,0.95)',
        border: `2px solid ${green}44`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: `0 0 20px ${green}10`,
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Historial de Liquidaciones" />

            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: green, margin: 0, textShadow: `0 0 10px ${green}80` }}>
                            HISTORIAL DE PAGOS
                        </h1>
                        <p style={{ color: '#999', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>
                            Registro de liquidaciones confirmadas a instructores
                        </p>
                    </div>
                    <a
                        href={route('admin.reportes.liquidacion')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: `rgba(34,197,94,0.1)`, border: `2px solid ${green}55`, color: green, padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}
                    >
                        ← Volver a Liquidación
                    </a>
                </div>

                <div style={boxStyle}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: `${green}18` }}>
                        <tr>
                            {['Instructor', 'Período', 'Clases', 'Asistentes', 'Tipo Tarifa', 'Tarifa', 'Total Pagado', 'Fecha Pago', 'Notas', ''].map(h => (
                                <th key={h} style={{ padding: '1rem', textAlign: 'left', color: green, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: `2px solid ${green}33`, whiteSpace: 'nowrap' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {liquidaciones.length === 0 ? (
                            <tr>
                                <td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: '#555' }}>
                                    No hay liquidaciones registradas aún
                                </td>
                            </tr>
                        ) : liquidaciones.map((l) => (
                            <tr key={l.id} style={{ borderBottom: `1px solid ${green}18` }}>
                                <td style={{ padding: '1rem', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                    {l.instructor_nombre}
                                </td>
                                <td style={{ padding: '1rem', color: '#999', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                    {fmtD(l.fecha_inicio)} — {fmtD(l.fecha_fin)}
                                </td>
                                <td style={{ padding: '1rem', color: '#ccc', textAlign: 'center' }}>
                                    {l.total_clases}
                                </td>
                                <td style={{ padding: '1rem', color: '#ccc', textAlign: 'center' }}>
                                    {l.total_asistentes}
                                </td>
                                <td style={{ padding: '1rem', color: '#999', fontSize: '0.8rem' }}>
                                    {l.tipo_tarifa === 'por_asistente' ? '👥 Por asistente' : '💼 Por clase'}
                                </td>
                                <td style={{ padding: '1rem', color: '#ccc', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                    {fmt(l.tarifa_aplicada)}
                                </td>
                                <td style={{ padding: '1rem', color: green, fontWeight: 900, fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
                                    {fmt(l.total_pago)}
                                </td>
                                <td style={{ padding: '1rem', color: '#ccc', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                    {fmtD(l.fecha_pago)}
                                </td>
                                <td style={{ padding: '1rem', color: '#666', fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {l.notas || '—'}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <button
                                        onClick={() => handleDelete(l.id)}
                                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '0.4rem 0.75rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                        {liquidaciones.length > 0 && (
                            <tfoot>
                            <tr style={{ background: `${green}12` }}>
                                <td colSpan={6} style={{ padding: '1rem', color: green, fontWeight: 900, textAlign: 'right', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.85rem' }}>
                                    Total Histórico
                                </td>
                                <td style={{ padding: '1rem', color: green, fontWeight: 900, fontSize: '1.25rem' }}>
                                    {fmt(liquidaciones.reduce((s, l) => s + parseFloat(l.total_pago), 0))}
                                </td>
                                <td colSpan={3} />
                            </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
