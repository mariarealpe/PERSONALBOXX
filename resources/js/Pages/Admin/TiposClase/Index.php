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

    <div className="tipos-clase-container">
        <div className="header">
            <div>
                <h1 className="title">TIPOS DE CLASE</h1>
                <p className="subtitle">Gestiona los diferentes tipos de clases del box</p>
            </div>
            <button onClick={openCreateModal} className="btn-create">
                <span className="icon">➕</span>
                Nuevo Tipo
            </button>
        </div>

        <form onSubmit={handleSearch} className="search-form">
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tipo de clase..."
            className="search-input"
            />
            <button type="submit" className="btn-search">
                🔍 Buscar
            </button>
        </form>

        <div className="table-container">
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
                        No hay tipos de clase registrados
                    </td>
                </tr>
                ) : (

                tiposClase.data.map((tipo) => (
                <tr key={tipo.id}>
                    <td className="td-nombre">{tipo.nombre}</td>
                    <td>
                        <div className="color-badge" style={{ "background-color": tipo.color }}>
                            {tipo.color}
                        </div>
                    </td>
                    <td className="td-descripcion">
                        {tipo.descripcion || '-'}
                    </td>
                    <td>
                        <button
                            onClick={() => handleToggle(tipo)}
                        className={`badge ${tipo.activo ? 'badge-active' : 'badge-inactive'}`}
                        >
                        {tipo.activo ? '✓ Activo' : '✗ Inactivo'}
                        </button>
                    </td>
                    <td>
                        <div className="actions">
                            <button
                                onClick={() => openEditModal(tipo)}
                            className="btn-action btn-edit"
                            title="Editar"
                            >
                            ✏️
                            </button>
                            <button
                                onClick={() => handleDelete(tipo)}
                            className="btn-action btn-delete"
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

        {tiposClase.links.length > 3 && (
        <div className="pagination">
            {tiposClase.links.map((link, index) => (
            <button
                key={index}
                onClick={() => link.url && router.visit(link.url)}
            disabled={!link.url}
            className={`page-link ${link.active ? 'active' : ''}`}
            dangerouslySetInnerHTML={{ __html: link.label }}
            />
            ))}
        </div>
        )}

        {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h2 className="modal-title">
                    {editingTipo ? 'Editar Tipo de Clase' : 'Nuevo Tipo de Clase'}
                </h2>
                <button onClick={closeModal} className="btn-close">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                    <label className="label">Nombre *</label>
                    <input
                        type="text"
                        value={data.nombre}
                        onChange={(e) => setData('nombre', e.target.value)}
                    className="input"
                    placeholder="Ej: Crossfit, Boxeo, Musculación..."
                    required
                    />
                    {errors.nombre && <p className="error">{errors.nombre}</p>}
                </div>

                <div className="form-group">
                    <label className="label">Color *</label>
                    <div className="color-picker-group">
                        <input
                            type="color"
                            value={data.color}
                            onChange={(e) => setData('color', e.target.value)}
                        className="color-picker"
                        />
                        <input
                            type="text"
                            value={data.color}
                            onChange={(e) => setData('color', e.target.value)}
                        className="color-input"
                        placeholder="#FF1493"
                        />
                    </div>
                    {errors.color && <p className="error">{errors.color}</p>}
                </div>

                <div className="form-group">
                    <label className="label">Descripción</label>
                    <textarea
                        value={data.descripcion}
                        onChange={(e) => setData('descripcion', e.target.value)}
                    className="textarea"
                    rows="3"
                    placeholder="Descripción opcional del tipo de clase..."
                    />
                    {errors.descripcion && <p className="error">{errors.descripcion}</p>}
                    </div>

                    <div className="form-group">
                    <label className="checkbox-label">
                    <input
                    type="checkbox"
                    checked={data.activo}
                    onChange={(e) => setData('activo', e.target.checked)}
                    className="checkbox"
                    />
                    <span>Activo</span>
                    </label>
                    </div>

                    <div className="modal-footer">
                    <button
                    type="button"
                    onClick={closeModal}
                    className="btn-cancel"
                    >
                    Cancelar
                    </button>
                    <button
                    type="submit"
                    disabled={processing}
                    className="btn-submit"
                    >
                    {processing ? 'Guardando...' : 'Guardar'}
                    </button>
                    </div>
                    </form>
                    </div>
                    </div>
                    )}
                    </div>

                    <style jsx>{`
                    .tipos-clase-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    }
                    .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                    }
                    .title {
                    font-size: 2rem;
                    font-weight: 900;
                    color: #FF1493;
                    margin: 0;
                    text-shadow: 0 0 10px rgba(255, 20, 147, 0.5);
                    }
                    .subtitle {
                    color: #999;
                    margin: 0.5rem 0 0 0;
                    font-size: 0.875rem;
                    }
                    .btn-create {
                    background: linear-gradient(135deg, #FF1493 0%, #C71585 100%);
                    color: #000;
                    border: none;
                    padding: 0.875rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 900;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 0 20px rgba(255, 20, 147, 0.4);
                    }
                    .btn-create:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 0 30px rgba(255, 20, 147, 0.6);
                    }
                    .icon {
                    font-size: 1.25rem;
                    }
                    .search-form {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    }
                    .search-input {
                    flex: 1;
                    padding: 0.875rem;
                    background: rgba(10, 10, 10, 0.95);
                    border: 2px solid rgba(255, 20, 147, 0.3);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.875rem;
                    transition: all 0.3s;
                    }
                    .search-input:focus {
                    outline: none;
                    border-color: #FF1493;
                    box-shadow: 0 0 10px rgba(255, 20, 147, 0.3);
                    }
                    .btn-search {
                    background: rgba(255, 20, 147, 0.1);
                    border: 2px solid #FF1493;
                    color: #FF1493;
                    padding: 0.875rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    }
                    .btn-search:hover {
                    background: #FF1493;
                    color: #000;
                    }
                    .table-container {
                    background: rgba(10, 10, 10, 0.95);
                    border: 2px solid rgba(255, 20, 147, 0.3);
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 0 20px rgba(255, 20, 147, 0.1);
                    }
                    .table {
                    width: 100%;
                    border-collapse: collapse;
                    }
                    .table thead {
                    background: rgba(255, 20, 147, 0.1);
                    }
                    .table th {
                    padding: 1rem;
                    text-align: left;
                    color: #FF1493;
                    font-weight: 900;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-bottom: 2px solid rgba(255, 20, 147, 0.3);
                    }
                    .table td {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(255, 20, 147, 0.1);
                    color: #ccc;
                    }
                    .table tbody tr:hover {
                    background: rgba(255, 20, 147, 0.05);
                    }
                    .td-nombre {
                    color: #fff;
                    font-weight: 700;
                    }
                    .td-descripcion {
                    max-width: 300px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    }
                    .color-badge {
                    display: inline-block;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.75rem;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
                    box-shadow: 0 0 10px currentColor;
                    }
                    .badge {
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 0.75rem;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s;
                    }
                    .badge-active {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                    border: 1px solid #22c55e;
                    }
                    .badge-inactive {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    border: 1px solid #ef4444;
                    }
                    .actions {
                    display: flex;
                    gap: 0.5rem;
                    }
                    .btn-action {
                    background: rgba(255, 20, 147, 0.1);
                    border: 1px solid rgba(255, 20, 147, 0.3);
                    padding: 0.5rem 0.75rem;
                    border-radius: 6px;
                    font-size: 1.125rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    }
                    .btn-action:hover {
                    border-color: #FF1493;
                    box-shadow: 0 0 10px rgba(255, 20, 147, 0.3);
                    }
                    .btn-edit:hover {
                    background: rgba(59, 130, 246, 0.2);
                    border-color: #3b82f6;
                    }
                    .btn-delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: #ef4444;
                    }
                    .empty-state {
                    text-align: center;
                    padding: 3rem !important;
                    color: #666;
                    }
                    .pagination {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 2rem;
                    }
                    .page-link {
                    background: rgba(255, 20, 147, 0.1);
                    border: 1px solid rgba(255, 20, 147, 0.3);
                    color: #FF1493;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-weight: 600;
                    }
                    .page-link:hover:not(:disabled) {
                    background: #FF1493;
                    color: #000;
                    }
                    .page-link.active {
                    background: #FF1493;
                    color: #000;
                    }
                    .page-link:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                    }
                    .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                    }
                    .modal {
                    background: rgba(10, 10, 10, 0.98);
                    border: 2px solid #FF1493;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 0 40px rgba(255, 20, 147, 0.5);
                    }
                    .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid rgba(255, 20, 147, 0.3);
                    }
                    .modal-title {
                    color: #FF1493;
                    font-size: 1.5rem;
                    font-weight: 900;
                    margin: 0;
                    }
                    .btn-close {
                    background: none;
                    border: none;
                    color: #999;
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    }
                    .btn-close:hover {
                    color: #FF1493;
                    transform: rotate(90deg);
                    }
                    .modal-form {
                    padding: 1.5rem;
                    }
                    .form-group {
                    margin-bottom: 1.5rem;
                    }
                    .label {
                    display: block;
                    color: #FF1493;
                    font-size: 0.75rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    }
                    .input, .textarea {
                    width: 100%;
                    padding: 0.875rem;
                    background: #000;
                    border: 2px solid rgba(255, 20, 147, 0.3);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.875rem;
                    transition: all 0.3s;
                    }
                    .input:focus, .textarea:focus {
                    outline: none;
                    border-color: #FF1493;
                    box-shadow: 0 0 10px rgba(255, 20, 147, 0.3);
                    }
                    .color-picker-group {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    }
                    .color-picker {
                    width: 80px;
                    height: 50px;
                    border: 2px solid rgba(255, 20, 147, 0.3);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s;
                    }
                    .color-picker:hover {
                    border-color: #FF1493;
                    }
                    .color-input {
                    flex: 1;
                    }
                    .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #ccc;
                    cursor: pointer;
                    }
                    .checkbox {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                    }
                    .error {
                    color: #ef4444;
                    font-size: 0.75rem;
                    margin-top: 0.5rem;
                    }
                    .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid rgba(255, 20, 147, 0.3);
                    }
                    .btn-cancel {
                    background: rgba(255, 20, 147, 0.1);
                    border: 2px solid rgba(255, 20, 147, 0.3);
                    color: #FF1493;
                    padding: 0.875rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    }
                    .btn-cancel:hover {
                    border-color: #FF1493;
                    background: rgba(255, 20, 147, 0.2);
                    }
                    .btn-submit {
                    background: linear-gradient(135deg, #FF1493 0%, #C71585 100%);
                    color: #000;
                    border: none;
                    padding: 0.875rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 900;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 0 20px rgba(255, 20, 147, 0.4);
                    }
                    .btn-submit:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 0 30px rgba(255, 20, 147, 0.6);
                    }
                    .btn-submit:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    }
                    @media (max-width: 768px) {
                    .title {
                    font-size: 1.5rem;
                    }
                    .header {
                    flex-direction: column;
                    align-items: flex-start;
                    }
                    .table-container {
                    overflow-x: auto;
                    }
                    .table {
                    min-width: 600px;
                    }
                    }
                    `}</style>
                    </DashboardLayout>
                    );
                    }
