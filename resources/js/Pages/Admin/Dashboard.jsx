import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

export default function AdminDashboard({ user, stats }) {
    const fmt = (n) => new Intl.NumberFormat('es-CO').format(n ?? 0);

    const statCards = [
        { label: 'Total Clientes', value: fmt(stats.total_clientes), icon: '👥' },
        { label: 'Instructores', value: fmt(stats.total_instructores), icon: '👨‍🏫' },
        { label: 'Clases Hoy', value: fmt(stats.clases_hoy), icon: '📅' },
        { label: 'Clases Semana', value: fmt(stats.clases_semana), icon: '📊' },
        { label: 'Asistencias Hoy', value: fmt(stats.asistencias_hoy), icon: '✅' },
    ];

    const quickActions = [

    ];

    return (
        <DashboardLayout user={user}>
            <Head title="Dashboard Administrador" />
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FF1493', margin: '0 0 0.5rem', textShadow: '0 0 10px rgba(255,20,147,0.5)' }}>¡Bienvenido, {user.name}!</h1>
                    <p style={{ color: '#999', fontSize: '1rem', margin: 0 }}>Panel de Administración — Personal Box Armenia</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    {statCards.map(s => (
                        <div key={s.label} style={{ background: 'rgba(10,10,10,0.95)', border: '2px solid rgba(255,20,147,0.3)', borderRadius: 12, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', transition: 'all 0.3s', boxShadow: '0 0 20px rgba(255,20,147,0.1)' }}>
                            <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 10px rgba(255,20,147,0.5))' }}>{s.icon}</span>
                            <div>
                                <p style={{ color: '#999', fontSize: '0.875rem', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</p>
                                <h3 style={{ color: '#FF1493', fontSize: '2.5rem', fontWeight: 900, margin: 0, textShadow: '0 0 10px rgba(255,20,147,0.3)' }}>{s.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                        {quickActions.map(a => (
                            <Link key={a.label} href={a.href} style={{ textDecoration: 'none' }}>
                                <div style={{ background: 'rgba(255,20,147,0.1)', border: '2px solid #FF1493', color: '#FF1493', padding: '1.5rem 1rem', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center' }}>
                                    <span style={{ fontSize: '2rem' }}>{a.icon}</span>
                                    <span>{a.label}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
