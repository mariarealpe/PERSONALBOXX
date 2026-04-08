import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import ConfirmDialog from '@/Components/ConfirmDialog';

function Icon({ name, size = 16 }) {
    const c = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
    };
    const icons = {
        plus: <svg {...c}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
        search: <svg {...c}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
        edit: <svg {...c}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>,
        trash: <svg {...c}><polyline points="3 6 5 6 21 6" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></svg>,
        tag: <svg {...c}><path d="M20.59 13.41 11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82Z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>,
        check: <svg {...c}><polyline points="20 6 9 17 4 12" /></svg>,
        close: <svg {...c}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    };
    return icons[name] || null;
}

export default function TiposClaseIndex({ auth, tiposClase, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [editingTipo, setEditingTipo] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const [confirmState, setConfirmState] = useState({
        open: false,
        title: '',
        message: '',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        onConfirm: null,
    });

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

    const openConfirm = (opts) => setConfirmState({ open: true, ...opts });
    const closeConfirm = () => setConfirmState((s) => ({ ...s, open: false }));

    const handleDelete = (tipo) => {
        openConfirm({
            title: 'Eliminar tipo de clase',
            message: `¿Estás segura de eliminar "${tipo.nombre}"?`,
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            onConfirm: () => router.delete(route('admin.tipos-clase.destroy', tipo.id)),
        });
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
                        <Icon name="plus" size={16} />
                        Nuevo Tipo
                    </button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-wrapper">
                        <span className="search-icon"><Icon name="search" size={16} /></span>
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
                                        <span className="empty-icon"><Icon name="tag" size={30} /></span>
                                        <p>No hay tipos de clase registrados</p>
                                    </td>
                                </tr>
                            ) : (
                                tiposClase.data.map((tipo) => (
                                    <tr key={tipo.id}>
                                        <td className="td-nombre" data-label="Nombre">{tipo.nombre}</td>
                                        <td data-label="Color">
                                            <div className="color-badge" style={{ backgroundColor: tipo.color }}>
                                                {tipo.color}
                                            </div>
                                        </td>
                                        <td className="td-descripcion" data-label="Descripción">
                                            {tipo.descripcion || <span className="text-muted">—</span>}
                                        </td>
                                        <td data-label="Estado">
                                            <button
                                                onClick={() => handleToggle(tipo)}
                                                className={`status-badge ${tipo.activo ? 'status-active' : 'status-inactive'}`}
                                            >
                                                <Icon name={tipo.activo ? 'check' : 'close'} size={14} />
                                                {tipo.activo ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td data-label="Acciones">
                                            <div className="actions">
                                                <button
                                                    onClick={() => openEditModal(tipo)}
                                                    className="btn-icon btn-icon-edit"
                                                    title="Editar"
                                                >
                                                    <Icon name="edit" size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tipo)}
                                                    className="btn-icon btn-icon-delete"
                                                    title="Eliminar"
                                                >
                                                    <Icon name="trash" size={16} />
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
                                    <Icon name={editingTipo ? 'edit' : 'plus'} size={16} />
                                    {editingTipo ? 'Editar Tipo' : 'Nuevo Tipo de Clase'}
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
                <ConfirmDialog
                    open={confirmState.open}
                    title={confirmState.title}
                    message={confirmState.message}
                    confirmText={confirmState.confirmText}
                    cancelText={confirmState.cancelText}
                    onConfirm={confirmState.onConfirm}
                    onClose={closeConfirm}
                />
            </div>

            <style>{`
                * { box-sizing: border-box; }

                .page-container { max-width: 1300px; margin: 0 auto; padding: 0.5rem 0; }

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
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255,20,147,0.18);
                    border: 1px solid rgba(255,255,255,0.18);
                    color: #FF1493;
                    text-shadow: 0 0 8px rgba(255,20,147,0.35);
                    padding: 0.875rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 900;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    backdrop-filter: blur(10px);
                    white-space: nowrap;
                }
                .btn-primary:hover:not(:disabled) { background: rgba(255,20,147,0.28); color: #fff; box-shadow: 0 0 20px rgba(255,20,147,0.35); }
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
                    width: 16px;
                    height: 16px;
                    color: rgba(255,255,255,0.5);
                    pointer-events: none;
                    display: inline-flex;
                }

                .search-input {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 2.75rem;
                    background: #000;
                    border: 2px solid rgba(255,20,147,0.27);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                    outline: none;
                }
                .search-input:focus { border-color: rgba(255,20,147,0.55); box-shadow: 0 0 0 3px rgba(255,20,147,0.08); }

                .btn-search {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,20,147,0.1);
                    border: 2px solid rgba(255,20,147,0.5);
                    color: #FF1493;
                    padding: 0.875rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .btn-search:hover { background: rgba(255,20,147,0.18); }

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

                .table-scroll {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                .table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 760px; /* mantener vista tipo desktop y habilitar scroll horizontal en móvil */
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
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
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
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 34px;
                    height: 34px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,20,147,0.2);
                    border-radius: 8px;
                    color: #fff;
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
                .empty-state span.empty-icon {
                    width: 54px;
                    height: 54px;
                    margin: 0 auto 0.75rem;
                    border-radius: 12px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255,20,147,0.85);
                    background: rgba(255,20,147,0.08);
                    border: 1px solid rgba(255,20,147,0.3);
                }
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
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #FF1493;
                    font-size: 1.1rem;
                    font-weight: 900;
                    margin: 0;
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

                @media (max-width: 768px) {
                    /* mantener tabla estilo desktop; solo ajustes de layout general */
                    .page-header { flex-direction: column; align-items: stretch; }
                    .btn-primary { width: 100%; justify-content: center; }
                    .search-form { flex-direction: column; }
                    .btn-search { width: 100%; }
                }
            `}</style>
        </DashboardLayout>
    );
}
