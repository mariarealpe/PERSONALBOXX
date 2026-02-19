import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

export default function AdminDashboard({ user, stats }) {
    return (
        <DashboardLayout user={user}>
            <Head title="Dashboard Administrador" />

            <div className="dashboard-admin">
                <div className="welcome-section">
                    <h1 className="page-title">¡Bienvenido, {user.name}!</h1>
                    <p className="page-subtitle">Panel de Administración - Personal Box Armenia</p>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <p className="stat-label">Total Clientes</p>
                            <h3 className="stat-value">{stats.total_clientes}</h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🏋️</div>
                        <div className="stat-content">
                            <p className="stat-label">Instructores</p>
                            <h3 className="stat-value">{stats.total_instructores}</h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-content">
                            <p className="stat-label">Clases Hoy</p>
                            <h3 className="stat-value">{stats.clases_hoy}</h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <p className="stat-label">Clases esta Semana</p>
                            <h3 className="stat-value">{stats.clases_semana}</h3>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h2 className="section-title">Acciones Rápidas</h2>
                    <div className="actions-grid">
                        <button className="action-button">
                            <span className="action-icon">➕</span>
                            <span>Crear Clase</span>
                        </button>
                        <button className="action-button">
                            <span className="action-icon">👤</span>
                            <span>Nuevo Cliente</span>
                        </button>
                        <button className="action-button">
                            <span className="action-icon">🏋️</span>
                            <span>Nuevo Instructor</span>
                        </button>
                        <button className="action-button">
                            <span className="action-icon">📋</span>
                            <span>Ver Reportes</span>
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="recent-activity">
                    <h2 className="section-title">Actividad Reciente</h2>
                    <div className="activity-card">
                        <p className="empty-state">No hay actividad reciente para mostrar.</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .dashboard-admin {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .welcome-section {
                    margin-bottom: 2rem;
                }

                .page-title {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: #FF1493;
                    margin: 0 0 0.5rem 0;
                    text-shadow: 0 0 10px rgba(255, 20, 147, 0.5);
                }

                .page-subtitle {
                    color: #999;
                    font-size: 1rem;
                    margin: 0;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .stat-card {
                    background: rgba(10, 10, 10, 0.95);
                    border: 2px solid rgba(255, 20, 147, 0.3);
                    border-radius: 12px;
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    transition: all 0.3s;
                    box-shadow: 0 0 20px rgba(255, 20, 147, 0.1);
                }

                .stat-card:hover {
                    border-color: #FF1493;
                    box-shadow: 0 0 30px rgba(255, 20, 147, 0.3);
                    transform: translateY(-5px);
                }

                .stat-icon {
                    font-size: 3rem;
                    filter: drop-shadow(0 0 10px rgba(255, 20, 147, 0.5));
                }

                .stat-content {
                    flex: 1;
                }

                .stat-label {
                    color: #999;
                    font-size: 0.875rem;
                    margin: 0 0 0.5rem 0;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .stat-value {
                    color: #FF1493;
                    font-size: 2.5rem;
                    font-weight: 900;
                    margin: 0;
                    text-shadow: 0 0 10px rgba(255, 20, 147, 0.3);
                }

                .quick-actions {
                    margin-bottom: 3rem;
                }

                .section-title {
                    color: #FF1493;
                    font-size: 1.5rem;
                    font-weight: 900;
                    margin: 0 0 1.5rem 0;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }

                .action-button {
                    background: rgba(255, 20, 147, 0.1);
                    border: 2px solid #FF1493;
                    color: #FF1493;
                    padding: 1.5rem 1rem;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                }

                .action-button:hover {
                    background: #FF1493;
                    color: #000;
                    box-shadow: 0 0 25px rgba(255, 20, 147, 0.5);
                    transform: translateY(-3px);
                }

                .action-icon {
                    font-size: 2rem;
                }

                .recent-activity {
                    margin-bottom: 2rem;
                }

                .activity-card {
                    background: rgba(10, 10, 10, 0.95);
                    border: 2px solid rgba(255, 20, 147, 0.3);
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: 0 0 20px rgba(255, 20, 147, 0.1);
                }

                .empty-state {
                    color: #666;
                    text-align: center;
                    padding: 2rem;
                    margin: 0;
                }

                @media (max-width: 768px) {
                    .page-title {
                        font-size: 2rem;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .actions-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
        </DashboardLayout>
    );
}
