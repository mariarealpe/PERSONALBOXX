import { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function ClienteLayout({ children, user }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { url } = usePage();

    const C = '#FF1493';

    const isActive = (path) => url.startsWith(path);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const AvatarContent = () => {
        if (user.foto_url) {
            return (
                <img
                    src={user.foto_url}
                    alt={user.name}
                    style={{
                        width: '44px', height: '44px',
                        borderRadius: '50%', objectFit: 'cover',
                        objectPosition: 'center', display: 'block',
                        border: `2px solid ${C}`,
                        boxShadow: '0 0 12px rgba(255,20,147,0.5)',
                    }}
                />
            );
        }
        return (
            <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${C}, #C71585)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#000', fontWeight: 900, fontSize: '1.15rem',
                border: `2px solid ${C}`,
                boxShadow: '0 0 12px rgba(255,20,147,0.5)',
            }}>
                {user.name.charAt(0).toUpperCase()}
            </div>
        );
    };

    const navItems = [
        { href: '/dashboard',         icon: '📊', label: 'Dashboard',          match: (u) => u === '/dashboard' },
        { href: '/cliente/clases',    icon: '🏋️', label: 'Clases Disponibles', match: (u) => u.startsWith('/cliente/clases') },
        { href: '/cliente/reservas',  icon: '📋', label: 'Mis Reservas',       match: (u) => u.startsWith('/cliente/reservas') },
        { href: '/cliente/historial', icon: '📈', label: 'Mi Historial',       match: (u) => u.startsWith('/cliente/historial') },
        { href: '/cliente/mi-plan',   icon: '💳', label: 'Mi Plan',            match: (u) => u.startsWith('/cliente/mi-plan') },
    ];

    return (
        <div className="dashboard-container">

            {/* ── Sidebar ── */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <svg className="logo-icon" viewBox="0 0 24 24" fill="none">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                  stroke="currentColor" strokeWidth="2" fill="currentColor"/>
                        </svg>
                        <div>
                            <h2 className="logo-text">PERSONAL BOX</h2>
                            <p className="logo-subtitle">Portal Cliente</p>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => {
                        const active = item.match(url);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-item ${active ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Sin footer — usuario va en el header */}
            </aside>

            {/* ── Main ── */}
            <div className="main-content">

                <header className="header">
                    <button className="menu-button" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

                    {/* Avatar dropdown arriba a la derecha */}
                    <div style={{ position: 'relative', marginLeft: 'auto' }} ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            style={{
                                background: 'none', border: 'none', padding: '3px',
                                cursor: 'pointer', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                position: 'relative',
                            }}
                            title={user.name}
                        >
                            <AvatarContent />
                            <span style={{
                                position: 'absolute', inset: '-3px', borderRadius: '50%',
                                border: '2px solid rgba(255,20,147,0.5)',
                                animation: 'ringPulse 3s ease-in-out infinite',
                                pointerEvents: 'none',
                            }} />
                        </button>

                        {dropdownOpen && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                                minWidth: '220px', background: 'rgba(10,10,10,0.98)',
                                border: '2px solid rgba(255,20,147,0.4)', borderRadius: '12px',
                                boxShadow: '0 8px 40px rgba(255,20,147,0.2), 0 4px 15px rgba(0,0,0,0.6)',
                                overflow: 'hidden', zIndex: 200, animation: 'dropIn 0.18s ease',
                            }}>
                                <div style={{ padding: '1rem 1.25rem 0.875rem' }}>
                                    <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', margin: '0 0 0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user.name}
                                    </p>
                                    <p style={{ color: '#555', fontSize: '0.75rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user.email}
                                    </p>
                                </div>

                                <div style={{ height: '1px', background: 'rgba(255,20,147,0.15)' }} />

                                <Link
                                    href="/profile"
                                    onClick={() => setDropdownOpen(false)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', color: '#ccc', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
                                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,20,147,0.08)'; e.currentTarget.style.color = C; }}
                                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ccc'; }}
                                >
                                    <span>👤</span> Mi Perfil
                                </Link>

                                <div style={{ height: '1px', background: 'rgba(255,20,147,0.15)' }} />

                                <Link
                                    href="/logout" method="post" as="button"
                                    onClick={() => setDropdownOpen(false)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', color: '#777', fontSize: '0.875rem', fontWeight: 600, background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#777'; }}
                                >
                                    <span>🚪</span> Cerrar Sesión
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                <main className="content">{children}</main>
            </div>

            <style>{`
                .dashboard-container { display: flex; min-height: 100vh; background: #000000; }
                .sidebar {
                    width: 280px; background: rgba(10,10,10,0.95);
                    border-right: 2px solid ${C}; display: flex; flex-direction: column;
                    position: fixed; height: 100vh; left: 0; top: 0;
                    transition: transform 0.3s ease; z-index: 100;
                    box-shadow: 0 0 30px rgba(255,20,147,0.25);
                }
                .sidebar-header { padding: 2rem 1.5rem; border-bottom: 1px solid rgba(255,20,147,0.2); flex-shrink: 0; }
                .logo { display: flex; align-items: center; gap: 1rem; }
                .logo-icon { width: 40px; height: 40px; color: ${C}; filter: drop-shadow(0 0 10px ${C}); flex-shrink: 0; }
                .logo-text { font-size: 1.25rem; font-weight: 900; color: ${C}; margin: 0; letter-spacing: 2px; text-shadow: 0 0 10px rgba(255,20,147,0.5); }
                .logo-subtitle { font-size: 0.65rem; color: #999; margin: 0; letter-spacing: 1px; text-transform: uppercase; }
                .sidebar-nav { flex: 1; padding: 1rem 0; overflow-y: auto; }
                .nav-item { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; color: #999; text-decoration: none; transition: all 0.3s; border-left: 3px solid transparent; font-weight: 600; font-size: 0.9rem; }
                .nav-item:hover { color: ${C}; background: rgba(255,20,147,0.05); border-left-color: ${C}; }
                .nav-item.active { color: ${C}; background: rgba(255,20,147,0.1); border-left-color: ${C}; box-shadow: inset 0 0 20px rgba(255,20,147,0.1); }
                .nav-icon { font-size: 1.2rem; flex-shrink: 0; }
                .main-content { flex: 1; margin-left: 280px; display: flex; flex-direction: column; }
                .header {
                    background: rgba(10,10,10,0.95); border-bottom: 2px solid ${C};
                    padding: 0.875rem 2rem; display: flex; justify-content: space-between;
                    align-items: center; position: sticky; top: 0; z-index: 50;
                    box-shadow: 0 0 20px rgba(255,20,147,0.2);
                }
                .menu-button { display: none; background: none; border: none; color: ${C}; font-size: 1.5rem; cursor: pointer; }
                .content { flex: 1; padding: 2rem; overflow-y: auto; }
                @keyframes ringPulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.12); opacity: 1; }
                }
                @keyframes dropIn {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @media (max-width: 768px) {
                    .sidebar { transform: translateX(-100%); }
                    .sidebar.open { transform: translateX(0); }
                    .main-content { margin-left: 0; }
                    .menu-button { display: block; }
                }
            `}</style>
        </div>
    );
}
