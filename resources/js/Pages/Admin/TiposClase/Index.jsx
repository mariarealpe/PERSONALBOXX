import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';

export default function TiposClaseIndex({ auth, tiposClase, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [editingTipo, setEditingTipo] = useState(null);
    const [search, setSearch] = useState(filters.search || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nombre: '',
        descripcion: '',
        color: '#FF1493',
        activo: true,
    });

    const openCreateModal = () => {
        reset();
        setData('color', '#FF1493');
        setEditingTipo(null);
        setShowModal(true);
    };

    const openEditModal = (tipo) => {
        setData({
            nombre: tipo.nombre,
            descripcion: tipo.descripcion || '',
            color: tipo.color,
            activo: tipo.activo,
        });
        setEditingTipo(tipo);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTipo(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTipo) {
            put(route('admin.tipos-clase.update', editingTipo.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.tipos-clase.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (tipo) => {
        if (confirm(`¿Estás segura de eliminar "${tipo.nombre}"?`)) {
            router.delete(route('admin.tipos-clase.destroy', tipo.id));
        }
    };

    const handleToggle = (tipo) => {
        router.patch(route('admin.tipos-clase.toggle', tipo.id));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.tipos-clase.index'), { search }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Tipos de Clase" />

            <div className="page-container">

                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">TIPOS DE CLASE</h1>
                        <p className="page-subtitle">Gestiona los diferentes tipos de clases del box</p>
                    </div>
                    <button onClick={openCreateModal} className="btn-primary">
                        <span>＋</span>
                        Nuevo Tipo
                    </button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar tipo de clase..."
                            className="search-input"
                        />
                    </div>
                    <button type="submit" className="btn-search">
                        Buscar
                    </button>
                </form>

                {/* Table glass card */}
                <div className="glass-card">
                    <div className="table-scroll">
                        <table className="table">
                            <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Color</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tiposClase.data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-state">
                                        <span>🏷️</span>
                                        <p>No hay tipos de clase registrados</p>
                                    </td>
                                </tr>
                            ) : (
                                tiposClase.data.map((tipo) => (
                                    <tr key={tipo.id}>
                                        <td className="td-nombre">{tipo.nombre}</td>
                                        <td>
                                            <div className="color-badge" style={{ backgroundColor: tipo.color }}>
                                                {tipo.color}
                                            </div>
                                        </td>
                                        <td className="td-descripcion">
                                            {tipo.descripcion || <span className="text-muted">—</span>}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleToggle(tipo)}
                                                className={`status-badge ${tipo.activo ? 'status-active' : 'status-inactive'}`}
                                            >
                                                {tipo.activo ? '✓ Activo' : '✗ Inactivo'}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="actions">
                                                <button
                                                    onClick={() => openEditModal(tipo)}
                                                    className="btn-icon btn-icon-edit"
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tipo)}
                                                    className="btn-icon btn-icon-delete"
                                                    title="Eliminar"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {tiposClase.links.length > 3 && (
                    <div className="pagination">
                        {tiposClase.links.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => link.url && router.visit(link.url)}
                                disabled={!link.url}
                                className={`page-btn ${link.active ? 'active' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">
                                    {editingTipo ? '✏️ Editar Tipo' : '✨ Nuevo Tipo de Clase'}
                                </h2>
                                <button onClick={closeModal} className="btn-close">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Nombre *</label>
                                    <input
                                        type="text"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        className="form-input"
                                        placeholder="Ej: Crossfit, Boxeo, Musculación..."
                                        required
                                    />
                                    {errors.nombre && <p className="form-error">{errors.nombre}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Color *</label>
                                    <div className="color-picker-row">
                                        <input
                                            type="color"
                                            value={data.color}
                                            onChange={(e) => setData('color', e.target.value)}
                                            className="color-swatch"
                                        />
                                        <input
                                            type="text"
                                            value={data.color}
                                            onChange={(e) => setData('color', e.target.value)}
                                            className="form-input"
                                            placeholder="#FF1493"
                                        />
                                        <div
                                            className="color-preview"
                                            style={{ backgroundColor: data.color }}
                                        />
                                    </div>
                                    {errors.color && <p className="form-error">{errors.color}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Descripción</label>
                                    <textarea
                                        value={data.descripcion}
                                        onChange={(e) => setData('descripcion', e.target.value)}
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Descripción opcional del tipo de clase..."
                                    />
                                    {errors.descripcion && <p className="form-error">{errors.descripcion}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="toggle-label">
                                        <input
                                            type="checkbox"
                                            checked={data.activo}
                                            onChange={(e) => setData('activo', e.target.checked)}
                                            className="toggle-checkbox"
                                        />
                                        <span className="toggle-text">Activo</span>
                                    </label>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" onClick={closeModal} className="btn-cancel">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={processing} className="btn-primary">
                                        {processing ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                * { box-sizing: border-box; }

                .page-container {
                    max-width: 1300px;
                    margin: 0 auto;
                    padding: 0.5rem 0;
                }

                /* ── Header ── */
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.75rem;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .page-title {
                    font-size: clamp(1.6rem, 4vw, 2.2rem);
                    font-weight: 900;
                    color: #FF1493;
                    margin: 0;
                    letter-spacing: 2px;
                    text-shadow: 0 0 20px rgba(255,20,147,0.5), 0 0 40px rgba(255,20,147,0.2);
                }

                .page-subtitle {
                    color: rgba(255,255,255,0.4);
                    margin: 0.4rem 0 0;
                    font-size: 0.875rem;
                }

                /* ── Buttons ── */
                .btn-primary {
                    background: linear-gradient(135deg, #FF1493 0%, #C71585 100%);
                    color: #000;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 900;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 4px 20px rgba(255,20,147,0.4), 0 0 0 1px rgba(255,20,147,0.3);
                    white-space: nowrap;
                }
                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(255,20,147,0.55);
                }
                .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

                /* ── Search ── */
                .search-form {
                    display: flex;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                }

                .search-wrapper {
                    flex: 1;
                    min-width: 200px;
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-icon {
                    position: absolute;
                    left: 1rem;
                    font-size: 1rem;
                    pointer-events: none;
                }

                .search-input {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 2.75rem;
                    background: rgba(255,20,147,0.04);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,20,147,0.2);
                    border-radius: 12px;
                    color: #fff;
                    font-size: 0.875rem;
                    transition: all 0.3s;
                    outline: none;
                }
                .search-input::placeholder { color: rgba(255,255,255,0.3); }
                .search-input:focus {
                    border-color: rgba(255,20,147,0.6);
                    background: rgba(255,20,147,0.07);
                    box-shadow: 0 0 0 3px rgba(255,20,147,0.1);
                }

                .btn-search {
                    background: rgba(255,20,147,0.08);
                    border: 1px solid rgba(255,20,147,0.4);
                    color: #FF1493;
                    padding: 0.875rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.25s;
                    white-space: nowrap;
                }
                .btn-search:hover {
                    background: rgba(255,20,147,0.18);
                    border-color: #FF1493;
                    box-shadow: 0 0 15px rgba(255,20,147,0.2);
                }

                /* ── Glass Card ── */
                .glass-card {
                    background: rgba(255, 20, 147, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 20, 147, 0.2);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow:
                        0 8px 32px rgba(0,0,0,0.4),
                        0 0 0 1px rgba(255,20,147,0.05),
                        inset 0 1px 0 rgba(255,20,147,0.1);
                }

                .table-scroll { overflow-x: auto; }

                /* ── Table ── */
                .table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 550px;
                }

                .table thead {
                    background: rgba(255,20,147,0.07);
                }

                .table th {
                    padding: 1rem 1.25rem;
                    text-align: left;
                    color: #FF1493;
                    font-weight: 800;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    border-bottom: 1px solid rgba(255,20,147,0.2);
                    white-space: nowrap;
                }

                .table td {
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid rgba(255,20,147,0.07);
                    color: rgba(255,255,255,0.75);
                    font-size: 0.875rem;
                }

                .table tbody tr {
                    transition: background 0.2s;
                }
                .table tbody tr:hover {
                    background: rgba(255,20,147,0.04);
                }
                .table tbody tr:last-child td {
                    border-bottom: none;
                }

                .td-nombre {
                    color: #fff !important;
                    font-weight: 700;
                }

                .td-descripcion {
                    max-width: 280px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .text-muted { color: rgba(255,255,255,0.25); }

                .color-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.4rem 0.875rem;
                    border-radius: 8px;
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.72rem;
                    letter-spacing: 0.5px;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.6);
                    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
                }

                .status-badge {
                    padding: 0.4rem 0.875rem;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 0.72rem;
                    border: none;
                    cursor: pointer;
                    transition: all 0.25s;
                    white-space: nowrap;
                }
                .status-active {
                    background: rgba(34,197,94,0.15);
                    color: #22c55e;
                    border: 1px solid rgba(34,197,94,0.35);
                    box-shadow: 0 0 10px rgba(34,197,94,0.1);
                }
                .status-inactive {
                    background: rgba(239,68,68,0.15);
                    color: #ef4444;
                    border: 1px solid rgba(239,68,68,0.35);
                }

                .actions { display: flex; gap: 0.5rem; }

                .btn-icon {
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,20,147,0.2);
                    padding: 0.4rem 0.6rem;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-icon-edit:hover {
                    background: rgba(59,130,246,0.15);
                    border-color: #3b82f6;
                    box-shadow: 0 0 10px rgba(59,130,246,0.2);
                }
                .btn-icon-delete:hover {
                    background: rgba(239,68,68,0.15);
                    border-color: #ef4444;
                    box-shadow: 0 0 10px rgba(239,68,68,0.2);
                }

                .empty-state {
                    text-align: center;
                    padding: 3.5rem 1rem !important;
                    color: rgba(255,255,255,0.25) !important;
                }
                .empty-state span { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }
                .empty-state p { margin: 0; }

                /* ── Pagination ── */
                .pagination {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 0.4rem;
                    margin-top: 1.5rem;
                }

                .page-btn {
                    background: rgba(255,20,147,0.07);
                    border: 1px solid rgba(255,20,147,0.2);
                    color: #FF1493;
                    padding: 0.5rem 0.875rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 600;
                    font-size: 0.8rem;
                }
                .page-btn:hover:not(:disabled) {
                    background: rgba(255,20,147,0.18);
                    border-color: #FF1493;
                }
                .page-btn.active {
                    background: #FF1493;
                    color: #000;
                    border-color: #FF1493;
                }
                .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

                /* ── Modal ── */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.75);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                .modal-glass {
                    background: rgba(10, 3, 15, 0.88);
                    backdrop-filter: blur(30px);
                    -webkit-backdrop-filter: blur(30px);
                    border: 1px solid rgba(255,20,147,0.35);
                    border-radius: 20px;
                    width: 100%;
                    max-width: 560px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow:
                        0 30px 80px rgba(0,0,0,0.7),
                        0 0 60px rgba(255,20,147,0.15),
                        inset 0 1px 0 rgba(255,20,147,0.2);
                    animation: modalIn 0.25s cubic-bezier(.34,1.56,.64,1);
                }

                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.92) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem 1.75rem;
                    border-bottom: 1px solid rgba(255,20,147,0.15);
                    background: rgba(255,20,147,0.04);
                    border-radius: 20px 20px 0 0;
                }

                .modal-title {
                    color: #FF1493;
                    font-size: 1.25rem;
                    font-weight: 900;
                    margin: 0;
                    letter-spacing: 0.5px;
                }

                .btn-close {
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: rgba(255,255,255,0.5);
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    width: 32px; height: 32px;
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                }
                .btn-close:hover {
                    color: #FF1493;
                    border-color: rgba(255,20,147,0.4);
                    background: rgba(255,20,147,0.1);
                    transform: rotate(90deg);
                }

                .modal-body {
                    padding: 1.75rem;
                }

                /* ── Form ── */
                .form-group { margin-bottom: 1.25rem; }

                .form-label {
                    display: block;
                    color: rgba(255,20,147,0.9);
                    font-size: 0.72rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .form-input, .form-textarea {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    background: rgba(255,20,147,0.05);
                    border: 1px solid rgba(255,20,147,0.2);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 0.875rem;
                    transition: all 0.25s;
                    outline: none;
                }
                .form-input::placeholder, .form-textarea::placeholder { color: rgba(255,255,255,0.25); }
                .form-input:focus, .form-textarea:focus {
                    border-color: rgba(255,20,147,0.6);
                    background: rgba(255,20,147,0.08);
                    box-shadow: 0 0 0 3px rgba(255,20,147,0.1);
                }
                .form-textarea { resize: vertical; font-family: inherit; }

                .color-picker-row {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                }

                .color-swatch {
                    width: 56px;
                    height: 44px;
                    border: 1px solid rgba(255,20,147,0.3);
                    border-radius: 10px;
                    cursor: pointer;
                    padding: 2px;
                    background: transparent;
                    flex-shrink: 0;
                }

                .color-preview {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    flex-shrink: 0;
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                }

                .form-error {
                    color: #ef4444;
                    font-size: 0.75rem;
                    margin: 0.4rem 0 0;
                }

                .toggle-label {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: rgba(255,255,255,0.7);
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 600;
                }

                .toggle-checkbox {
                    width: 18px;
                    height: 18px;
                    accent-color: #FF1493;
                    cursor: pointer;
                }

                .toggle-text { color: rgba(255,255,255,0.7); }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    padding-top: 1.25rem;
                    margin-top: 0.5rem;
                    border-top: 1px solid rgba(255,20,147,0.12);
                    flex-wrap: wrap;
                }

                .btn-cancel {
                    background: rgba(255,20,147,0.06);
                    border: 1px solid rgba(255,20,147,0.25);
                    color: #FF1493;
                    padding: 0.75rem 1.25rem;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.875rem;
                }
                .btn-cancel:hover {
                    background: rgba(255,20,147,0.12);
                    border-color: rgba(255,20,147,0.5);
                }

                /* ── Responsive ── */
                @media (max-width: 640px) {
                    .page-header { flex-direction: column; align-items: flex-start; }
                    .btn-primary { width: 100%; justify-content: center; }
                    .search-form { flex-direction: column; }
                    .btn-search { width: 100%; }
                    .modal-footer { flex-direction: column; }
                    .btn-cancel, .btn-primary { width: 100%; justify-content: center; }
                    .color-picker-row { flex-wrap: wrap; }
                }
            `}</style>
        </DashboardLayout>
    );
}
