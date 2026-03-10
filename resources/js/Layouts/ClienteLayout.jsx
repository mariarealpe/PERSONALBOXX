import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function ClienteLayout({ children, user }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();

    const C       = '#FF1493';
    const Cdim    = 'rgba(255,20,147,0.3)';
    const Cbg     = 'rgba(255,20,147,0.1)';
    const Cshadow = 'rgba(255,20,147,0.25)';

    const navItems = [
        { href: '/dashboard',        icon: '📊', label: 'Dashboard',          match: (u) => u === '/dashboard' },
        { href: '/cliente/clases',   icon: '🏋️', label: 'Clases Disponibles', match: (u) => u.startsWith('/cliente/clases') },
        { href: '/cliente/reservas', icon: '📋', label: 'Mis Reservas',       match: (u) => u.startsWith('/cliente/reservas') },
        { href: '/cliente/historial',icon: '📈', label: 'Mi Historial',       match: (u) => u.startsWith('/cliente/historial') },
        { href: '/cliente/mi-plan',  icon: '💳', label: 'Mi Plan',            match: (u) => u.startsWith('/cliente/mi-plan') },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#000' }}>

            <aside style={{ width: 280, background: 'rgba(10,10,10,0.95)', borderRight: `2px solid ${C}`, display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', left: 0, top: 0, zIndex: 100, boxShadow: `0 0 30px ${Cshadow}` }}>

                <div style={{ padding: '2rem 1.5rem', borderBottom: `1px solid ${Cdim}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <svg style={{ width: 40, height: 40, color: C, filter: `drop-shadow(0 0 10px ${C})` }} viewBox="0 0 24 24" fill="none">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
                        </svg>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: C, margin: 0, letterSpacing: 2, textShadow: `0 0 10px ${Cshadow}` }}>PERSONAL BOX</h2>
                            <p style={{ fontSize: '0.65rem', color: '#999', margin: 0, letterSpacing: 1, textTransform: 'uppercase' }}>Portal Cliente</p>
                        </div>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
                    {navItems.map(item => {
                        const active = item.match(url);
                        return (
                            <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.5rem', color: active ? C : '#999', textDecoration: 'none', borderLeft: active ? `3px solid ${C}` : '3px solid transparent', background: active ? Cbg : 'transparent', fontWeight: 600, transition: 'all 0.3s' }}>
                                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                                <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: '1.5rem', borderTop: `1px solid ${Cdim}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${C}, #e60083)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.1rem', boxShadow: `0 0 15px ${Cshadow}`, flexShrink: 0 }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ color: C, fontWeight: 700, margin: 0, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                            <p style={{ color: '#666', margin: 0, fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            <div style={{ flex: 1, marginLeft: 280, display: 'flex', flexDirection: 'column' }}>
                <header style={{ background: 'rgba(10,10,10,0.95)', borderBottom: `2px solid ${C}`, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: C, fontSize: '1.5rem', cursor: 'pointer' }}>☰</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: C, fontWeight: 700, fontSize: '0.875rem' }}>{user.name}</span>
                        <Link href="/logout" method="post" as="button" style={{ background: Cbg, border: `1px solid ${C}`, color: C, padding: '0.5rem 1rem', borderRadius: 6, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                            Cerrar Sesión
                        </Link>
                    </div>
                </header>
                <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
