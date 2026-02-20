import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function DashboardLayout({ children, user }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();

    const isActive = (path) => {
        return url.startsWith(path);
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <svg className="logo-icon" viewBox="0 0 24 24" fill="none">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  fill="currentColor"/>
                        </svg>
                        <div>
                            <h2 className="logo-text">PERSONAL BOX</h2>
                            <p className="logo-subtitle">Sistema de Gestión</p>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link
                        href="/dashboard"
                        className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
                    >
                        <span className="nav-icon">📊</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        href="/admin/tipos-clase"
                        className={`nav-item ${isActive('/admin/tipos-clase') ? 'active' : ''}`}
                    >
                        <span className="nav-icon">🏋️</span>
                        <span>Tipos de Clase</span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <Link href="/profile" className="profile-link">
                        <div className="profile-info">
                            <div className="profile-avatar">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="profile-name">{user.name}</p>
                                <p className="profile-email">{user.email}</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-content">
                {/* Header */}
                <header className="header">
                    <button
                        className="menu-button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        ☰
                    </button>
                    <div className="header-user">
                        <span className="user-name">{user.name}</span>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="logout-button"
                        >
                            Cerrar Sesión
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="content">
                    {children}
                </main>
            </div>

            <style jsx>{`
                .dashboard-container {
                    display: flex;
                    min-height: 100vh;
                    background: #000000;
                }

                .sidebar {
                    width: 280px;
                    background: rgba(10, 10, 10, 0.95);
                    border-right: 2px solid #FF1493;
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    height: 100vh;
                    left: 0;
                    top: 0;
                    transition: transform 0.3s ease;
                    z-index: 100;
                    box-shadow: 0 0 30px rgba(255, 20, 147, 0.3);
                }

                .sidebar-header {
                    padding: 2rem 1.5rem;
                    border-bottom: 1px solid rgba(255, 20, 147, 0.2);
                }

                .logo {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .logo-icon {
                    width: 40px;
                    height: 40px;
                    color: #FF1493;
                    filter: drop-shadow(0 0 10px #FF1493);
                }

                .logo-text {
                    font-size: 1.25rem;
                    font-weight: 900;
                    color: #FF1493;
                    margin: 0;
                    letter-spacing: 2px;
                    text-shadow: 0 0 10px rgba(255, 20, 147, 0.5);
                }

                .logo-subtitle {
                    font-size: 0.65rem;
                    color: #999;
                    margin: 0;
                    letter-spacing: 1px;
                }

                .sidebar-nav {
                    flex: 1;
                    padding: 1rem 0;
                    overflow-y: auto;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 1.5rem;
                    color: #999;
                    text-decoration: none;
                    transition: all 0.3s;
                    border-left: 3px solid transparent;
                    font-weight: 600;
                }

                .nav-item:hover {
                    color: #FF1493;
                    background: rgba(255, 20, 147, 0.05);
                    border-left-color: #FF1493;
                }

                .nav-item.active {
                    color: #FF1493;
                    background: rgba(255, 20, 147, 0.1);
                    border-left-color: #FF1493;
                    box-shadow: inset 0 0 20px rgba(255, 20, 147, 0.1);
                }

                .nav-icon {
                    font-size: 1.25rem;
                }

                .sidebar-footer {
                    padding: 1.5rem;
                    border-top: 1px solid rgba(255, 20, 147, 0.2);
                }

                .profile-link {
                    text-decoration: none;
                }

                .profile-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .profile-avatar {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #FF1493, #C71585);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #000;
                    font-weight: 900;
                    font-size: 1.25rem;
                    box-shadow: 0 0 15px rgba(255, 20, 147, 0.5);
                }

                .profile-name {
                    color: #FF1493;
                    font-weight: 700;
                    margin: 0;
                    font-size: 0.875rem;
                }

                .profile-email {
                    color: #666;
                    margin: 0;
                    font-size: 0.75rem;
                }

                .main-content {
                    flex: 1;
                    margin-left: 280px;
                    display: flex;
                    flex-direction: column;
                }

                .header {
                    background: rgba(10, 10, 10, 0.95);
                    border-bottom: 2px solid #FF1493;
                    padding: 1rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 0 20px rgba(255, 20, 147, 0.2);
                }

                .menu-button {
                    display: none;
                    background: none;
                    border: none;
                    color: #FF1493;
                    font-size: 1.5rem;
                    cursor: pointer;
                }

                .header-user {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .user-name {
                    color: #FF1493;
                    font-weight: 700;
                    font-size: 0.875rem;
                }

                .logout-button {
                    background: rgba(255, 20, 147, 0.1);
                    border: 1px solid #FF1493;
                    color: #FF1493;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .logout-button:hover {
                    background: #FF1493;
                    color: #000;
                    box-shadow: 0 0 15px rgba(255, 20, 147, 0.5);
                }

                .content {
                    flex: 1;
                    padding: 2rem;
                    overflow-y: auto;
                }

                @media (max-width: 768px) {
                    .sidebar {
                        transform: translateX(-100%);
                    }

                    .sidebar.open {
                        transform: translateX(0);
                    }

                    .main-content {
                        margin-left: 0;
                    }

                    .menu-button {
                        display: block;
                    }
                }
            `}</style>
        </div>
    );
}
