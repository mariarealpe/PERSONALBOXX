import { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function DashboardLayout({ children, user }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { url } = usePage();

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
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        display: 'block',
                        border: '2px solid #FF1493',
                        boxShadow: '0 0 12px rgba(255,20,147,0.5)',
                    }}
                />
            );
        }
        return (
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF1493, #C71585)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                fontWeight: 900,
                fontSize: '1.15rem',
                border: '2px solid #FF1493',
                boxShadow: '0 0 12px rgba(255,20,147,0.5)',
            }}>
                {user.name.charAt(0).toUpperCase()}
            </div>
        );
    };

    return (
        <div className="dashboard-container">

            {/* Overlay para cerrar sidebar en móvil */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

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
                            <p className="logo-subtitle">Sistema de Gestión</p>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link href="/dashboard" className={`nav-item ${isActive('/dashboard') && !isActive('/admin') ? 'active' : ''}`}>
                        <span className="nav-icon">📊</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/admin/tipos-clase" className={`nav-item ${isActive('/admin/tipos-clase') ? 'active' : ''}`}>
                        <span className="nav-icon">🏷️</span>
                        <span>Tipos de Clase</span>
                    </Link>
                    <Link href="/admin/instructores" className={`nav-item ${isActive('/admin/instructores') ? 'active' : ''}`}>
                        <span className="nav-icon">👨‍🏫</span>
                        <span>Instructores</span>
                    </Link>
                    <Link href="/admin/clientes" className={`nav-item ${isActive('/admin/clientes') ? 'active' : ''}`}>
                        <span className="nav-icon">👥</span>
                        <span>Clientes</span>
                    </Link>
                    <Link href="/admin/clases" className={`nav-item ${isActive('/admin/clases') ? 'active' : ''}`}>
                        <span className="nav-icon">📅</span>
                        <span>Clases</span>
                    </Link>
                    <Link href="/admin/asistencias" className={`nav-item ${isActive('/admin/asistencias') ? 'active' : ''}`}>
                        <span className="nav-icon">✅</span>
                        <span>Asistencias</span>
                    </Link>
                    <Link href="/admin/planes" className={`nav-item ${isActive('/admin/planes') ? 'active' : ''}`}>
                        <span className="nav-icon">💳</span>
                        <span>Planes</span>
                    </Link>
                    <Link href="/admin/reportes" className={`nav-item ${isActive('/admin/reportes') ? 'active' : ''}`}>
                        <span className="nav-icon">📈</span>
                        <span>Reportes</span>
                    </Link>
                </nav>
            </aside>

            {/* ── Main ── */}
            <div className="main-content">

                {/* FIX: header con position: relative e isolation: isolate para crear stacking context propio.
                    El dropdown usa z-index: 9999 y position: fixed para salir siempre por encima de todo. */}
                <header className="header" style={{ isolation: 'isolate' }}>
                    <button className="menu-button" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        ☰
                    </button>

                    <div style={{ position: 'relative', marginLeft: 'auto' }} ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="avatar-btn"
                            title={user.name}
                        >
                            <AvatarContent />
                            <span className="ring-pulse" />
                        </button>

                        {dropdownOpen && (
                            <div className="dropdown-menu">
                                <div className="dropdown-user-info">
                                    <p className="dropdown-name">{user.name}</p>
                                    <p className="dropdown-email">{user.email}</p>
                                </div>

                                <div className="dropdown-divider" />

                                <Link
                                    href="/profile"
                                    onClick={() => setDropdownOpen(false)}
                                    className="dropdown-item"
                                >
                                    <span>👤</span> Mi Perfil
                                </Link>

                                <div className="dropdown-divider" />

                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    onClick={() => setDropdownOpen(false)}
                                    className="dropdown-item dropdown-item-danger"
                                >
                                    <span>🚪</span> Cerrar Sesión
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                <main className="content">
                    {children}
                </main>
            </div>

            <style jsx>{`
                * { box-sizing: border-box; }

                .dashboard-container {
                    display: flex;
                    min-height: 100vh;
                    background: #050505;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                }

                /* ── Sidebar ── */
                .sidebar {
                    width: 270px;
                    background: rgba(15, 5, 15, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-right: 1px solid rgba(255, 20, 147, 0.25);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    height: 100vh;
                    left: 0; top: 0;
                    transition: transform 0.3s cubic-bezier(.4,0,.2,1);
                    z-index: 200;
                    box-shadow: 4px 0 40px rgba(255, 20, 147, 0.12), inset -1px 0 0 rgba(255,20,147,0.1);
                }

                .sidebar-overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    z-index: 199;
                    backdrop-filter: blur(2px);
                }

                .sidebar-header {
                    padding: 1.75rem 1.5rem;
                    border-bottom: 1px solid rgba(255, 20, 147, 0.15);
                    flex-shrink: 0;
                    background: rgba(255,20,147,0.03);
                }

                .logo { display: flex; align-items: center; gap: 0.875rem; }

                .logo-icon {
                    width: 38px; height: 38px;
                    color: #FF1493;
                    filter: drop-shadow(0 0 12px rgba(255,20,147,0.8));
                    flex-shrink: 0;
                }

                .logo-text {
                    font-size: 1.1rem; font-weight: 900; color: #FF1493;
                    margin: 0; letter-spacing: 2px;
                    text-shadow: 0 0 15px rgba(255,20,147,0.6);
                }

                .logo-subtitle {
                    font-size: 0.6rem; color: rgba(255,20,147,0.5); margin: 0.2rem 0 0;
                    letter-spacing: 2px; text-transform: uppercase;
                }

                .sidebar-nav { flex: 1; padding: 1rem 0.75rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.2rem; }

                .nav-item {
                    display: flex; align-items: center; gap: 0.875rem;
                    padding: 0.875rem 1rem;
                    color: rgba(255,255,255,0.45);
                    text-decoration: none;
                    transition: all 0.25s ease;
                    border-radius: 10px;
                    font-weight: 600; font-size: 0.875rem;
                    border: 1px solid transparent;
                }
                .nav-item:hover {
                    color: #FF1493;
                    background: rgba(255, 20, 147, 0.08);
                    border-color: rgba(255,20,147,0.2);
                    transform: translateX(3px);
                }
                .nav-item.active {
                    color: #FF1493;
                    background: rgba(255, 20, 147, 0.12);
                    border-color: rgba(255,20,147,0.3);
                    box-shadow: inset 0 0 20px rgba(255,20,147,0.08), 0 0 15px rgba(255,20,147,0.1);
                }
                .nav-icon { font-size: 1.1rem; flex-shrink: 0; }

                /* ── Main ── */
                .main-content {
                    flex: 1; margin-left: 270px;
                    display: flex; flex-direction: column;
                    min-width: 0;
                }

                /* FIX CLAVE: el header no crea stacking context que entierre el dropdown.
                   El dropdown usa position:absolute con z-index muy alto. */
                .header {
                    background: rgba(10, 3, 10, 0.8);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255, 20, 147, 0.2);
                    padding: 0.75rem 1.75rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: sticky; top: 0;
                    z-index: 300;
                    box-shadow: 0 4px 30px rgba(255,20,147,0.1), 0 1px 0 rgba(255,20,147,0.15);
                }

                .menu-button {
                    display: none; background: none; border: 1px solid rgba(255,20,147,0.3);
                    color: #FF1493; font-size: 1.2rem; cursor: pointer;
                    padding: 0.4rem 0.6rem; border-radius: 8px;
                    transition: all 0.2s;
                }
                .menu-button:hover {
                    background: rgba(255,20,147,0.1);
                }

                /* Avatar button */
                .avatar-btn {
                    background: none; border: none; padding: 3px;
                    cursor: pointer; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    position: relative;
                }

                .ring-pulse {
                    position: absolute; inset: -3px; border-radius: 50%;
                    border: 2px solid rgba(255,20,147,0.5);
                    animation: ringPulse 3s ease-in-out infinite;
                    pointer-events: none;
                }

                /* FIX DROPDOWN: position absolute con z-index 9999 asegura que salga por encima de todo */
                .dropdown-menu {
                    position: absolute;
                    top: calc(100% + 12px);
                    right: 0;
                    min-width: 230px;
                    background: rgba(10, 3, 15, 0.92);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 20, 147, 0.35);
                    border-radius: 16px;
                    box-shadow:
                        0 20px 60px rgba(0,0,0,0.7),
                        0 0 40px rgba(255,20,147,0.15),
                        inset 0 1px 0 rgba(255,20,147,0.2);
                    overflow: hidden;
                    z-index: 9999;
                    animation: dropIn 0.2s cubic-bezier(.34,1.56,.64,1);
                }

                .dropdown-user-info {
                    padding: 1rem 1.25rem 0.875rem;
                }

                .dropdown-name {
                    color: #fff; font-weight: 700; font-size: 0.9rem;
                    margin: 0 0 0.2rem; white-space: nowrap;
                    overflow: hidden; text-overflow: ellipsis;
                }

                .dropdown-email {
                    color: rgba(255,255,255,0.35); font-size: 0.75rem;
                    margin: 0; white-space: nowrap;
                    overflow: hidden; text-overflow: ellipsis;
                }

                .dropdown-divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,20,147,0.2), transparent);
                }

                .dropdown-item {
                    display: flex; align-items: center; gap: 0.75rem;
                    padding: 0.875rem 1.25rem;
                    color: rgba(255,255,255,0.7); font-size: 0.875rem; font-weight: 600;
                    text-decoration: none; transition: all 0.2s;
                    background: none; border: none; width: 100%;
                    text-align: left; cursor: pointer; font-family: inherit;
                }
                .dropdown-item:hover {
                    background: rgba(255,20,147,0.1);
                    color: #FF1493;
                }

                .dropdown-item-danger:hover {
                    background: rgba(239,68,68,0.1) !important;
                    color: #ef4444 !important;
                }

                .content { flex: 1; padding: 2rem 1.75rem; overflow-y: auto; }

                @keyframes ringPulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50%       { transform: scale(1.12); opacity: 1; }
                }

                @keyframes dropIn {
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                @media (max-width: 900px) {
                    .sidebar { transform: translateX(-100%); z-index: 400; }
                    .sidebar.open { transform: translateX(0); }
                    .sidebar-overlay { display: block; }
                    .main-content { margin-left: 0; }
                    .menu-button { display: flex; }
                    .content { padding: 1.25rem 1rem; }
                    .header { padding: 0.75rem 1rem; }
                }

                @media (max-width: 480px) {
                    .dropdown-menu { min-width: 200px; right: -0.5rem; }
                    .content { padding: 1rem 0.75rem; }
                }
            `}</style>
        </div>
    );
}
