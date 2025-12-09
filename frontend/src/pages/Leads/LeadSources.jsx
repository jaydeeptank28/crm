import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './LeadSources.css';

const LeadSources = () => {
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        total: 0, pages: 0, page: 1, limit: 12, from: 0, to: 0
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({ name: '' });
    const [editId, setEditId] = useState(null);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const searchTimeout = useRef(null);

    useEffect(() => {
        fetchSources();
    }, [pagination.page]);

    useEffect(() => {
        // Debounce search
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setPagination(prev => ({ ...prev, page: 1 }));
            fetchSources();
        }, 100);
        return () => clearTimeout(searchTimeout.current);
    }, [search]);

    const fetchSources = async (pageOverride = null, searchOverride = null) => {
        setLoading(true);
        try {
            const response = await api.get('/leads/sources/paginated', {
                params: {
                    page: pageOverride !== null ? pageOverride : pagination.page,
                    search: searchOverride !== null ? searchOverride : search
                }
            });
            if (response.data.success) {
                setSources(response.data.data.sources);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching lead sources:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '' });
        setErrors({});
        setEditId(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (source) => {
        setEditId(source.id);
        setFormData({ name: source.name });
        setErrors({});
        setShowEditModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmitAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            const response = await api.post('/leads/sources', formData);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Lead source created successfully!',
                    timer: 1500,
                    showConfirmButton: false
                });
                setShowAddModal(false);
                resetForm();
                fetchSources(1, '');
            }
        } catch (error) {
            if (error.response?.data?.message) {
                setErrors({ name: error.response.data.message });
            }
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            const response = await api.put(`/leads/sources/${editId}`, formData);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Lead source updated successfully!',
                    timer: 1500,
                    showConfirmButton: false
                });
                setShowEditModal(false);
                resetForm();
                fetchSources(1, '');
            }
        } catch (error) {
            if (error.response?.data?.message) {
                setErrors({ name: error.response.data.message });
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        const result = await Swal.fire({
            title: 'Delete Lead Source?',
            text: `Are you sure you want to delete "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#fc544b',
            cancelButtonColor: '#6777ef',
            confirmButtonText: 'Yes, Delete'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.delete(`/leads/sources/${id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Lead source has been deleted.', 'success');
                    fetchSources(1, '');
                }
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to delete lead source', 'error');
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const truncate = (str, len) => {
        if (!str) return '';
        return str.length > len ? str.substring(0, len) + '...' : str;
    };

    return (
        <section className="section">
            <div className="section-header">
                <h1>Lead Sources</h1>
                <div className="section-header-breadcrumb">
                    <a
                        href="#"
                        className="btn btn-primary form-btn addLeadSourceModal float-right-mobile"
                        onClick={(e) => { e.preventDefault(); openAddModal(); }}
                    >
                        Add <i className="fas fa-plus"></i>
                    </a>
                </div>
            </div>

            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-12">
                                {loading && (
                                    <div id="overlay-screen-lock">
                                        <div className="live-wire-infy-loader">
                                            <div className="infy-loader"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="col-lg-12 col-md-12">
                                {/* Search */}
                                <div className="row mb-3 justify-content-end flex-wrap">
                                    <div>
                                        <div className="selectgroup mr-3">
                                            <input
                                                type="search"
                                                autoComplete="off"
                                                id="search"
                                                placeholder="Search"
                                                className="form-control"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                {sources.length > 0 ? (
                                    <div className="content">
                                        <div className="row position-relative">
                                            {sources.map(source => (
                                                <div key={source.id} className="col-12 col-sm-12 col-md-6 col-xl-4 mb-3">
                                                    <div className="hover-effect-lead-source position-relative mb-4 lead-source-card-hover-border">
                                                        <div className="lead-source-listing-details">
                                                            <div className="d-flex lead-source-listing-description">
                                                                <div className="lead-source-data">
                                                                    <h3 className="lead-source-listing-title mb-1">
                                                                        <a
                                                                            href="#"
                                                                            className="text-dark text-decoration-none lead-sources-listing-text show-btn"
                                                                            data-toggle="tooltip"
                                                                            title={source.name}
                                                                            onClick={(e) => e.preventDefault()}
                                                                        >
                                                                            {truncate(source.name, 20)}
                                                                        </a>
                                                                    </h3>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="text-center badge badge-success font-weight-bold lead-count"
                                                            data-toggle="tooltip"
                                                            data-placement="top"
                                                            title="Leads"
                                                        >
                                                            {source.leads_count || 0}
                                                        </div>
                                                        <div className="lead-source-action-btn">
                                                            <a
                                                                title="Edit"
                                                                className="btn action-btn edit-btn lead-source-edit"
                                                                href="#"
                                                                onClick={(e) => { e.preventDefault(); openEditModal(source); }}
                                                            >
                                                                <i className="fa fa-edit"></i>
                                                            </a>
                                                            <a
                                                                title="Delete"
                                                                className="btn action-btn delete-btn lead-source-delete"
                                                                href="#"
                                                                onClick={(e) => { e.preventDefault(); handleDelete(source.id, source.name); }}
                                                            >
                                                                <i className="fa fa-trash"></i>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {sources.length > 0 && (
                                            <div className="mt-0 mb-5 col-12">
                                                <div className="row paginatorRow">
                                                    <div className="col-lg-2 col-md-6 col-sm-12 pt-2">
                                                        <span className="d-inline-flex">
                                                            Showing
                                                            <span className="font-weight-bold ml-1 mr-1">{pagination.from}</span> -
                                                            <span className="font-weight-bold ml-1 mr-1">{pagination.to}</span> of
                                                            <span className="font-weight-bold ml-1">{pagination.total}</span>
                                                        </span>
                                                    </div>
                                                    <div className="col-lg-10 col-md-6 col-sm-12 d-flex justify-content-end">
                                                        <nav>
                                                            <ul className="pagination">
                                                                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                                                    <button
                                                                        className="page-link"
                                                                        onClick={() => handlePageChange(pagination.page - 1)}
                                                                    >
                                                                        &laquo;
                                                                    </button>
                                                                </li>
                                                                {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                                                                    const pageNum = i + 1;
                                                                    return (
                                                                        <li
                                                                            key={pageNum}
                                                                            className={`page-item ${pagination.page === pageNum ? 'active' : ''}`}
                                                                        >
                                                                            <button
                                                                                className="page-link"
                                                                                onClick={() => handlePageChange(pageNum)}
                                                                            >
                                                                                {pageNum}
                                                                            </button>
                                                                        </li>
                                                                    );
                                                                })}
                                                                <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                                                                    <button
                                                                        className="page-link"
                                                                        onClick={() => handlePageChange(pagination.page + 1)}
                                                                    >
                                                                        &raquo;
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </nav>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="col-lg-12 col-md-12 d-flex justify-content-center">
                                        {!loading && (
                                            <p className="text-dark">
                                                {search ? 'No lead source found' : 'No lead source available'}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal fade show" id="addModal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">New Lead Source</h5>
                                <button type="button" aria-label="Close" className="close" onClick={() => setShowAddModal(false)}>
                                    <span>×</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmitAdd} id="addNewForm">
                                <div className="modal-body">
                                    {errors.name && (
                                        <div className="alert alert-danger" id="validationErrorsBox">{errors.name}</div>
                                    )}
                                    <div className="row">
                                        <div className="form-group col-sm-12">
                                            <label htmlFor="name">Name:<span className="required">*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="form-control"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                autoComplete="off"
                                                placeholder="Name"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            id="btnSave"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <><span className="spinner-border spinner-border-sm"></span> Processing...</>
                                            ) : 'Save'}
                                        </button>
                                        <button
                                            type="button"
                                            id="btnCancel"
                                            className="btn btn-light ml-1"
                                            onClick={() => setShowAddModal(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal fade show" id="editModal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Lead Source</h5>
                                <button type="button" className="close" onClick={() => setShowEditModal(false)} aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmitEdit} id="editForm">
                                <div className="modal-body">
                                    {errors.name && (
                                        <div className="alert alert-danger" id="editValidationErrorsBox">{errors.name}</div>
                                    )}
                                    <div className="row">
                                        <div className="form-group col-sm-12">
                                            <label htmlFor="editName">Name:<span className="required">*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="editName"
                                                className="form-control"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                autoComplete="off"
                                                placeholder="Name"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            id="btnEditSave"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <><span className="spinner-border spinner-border-sm"></span> Processing...</>
                                            ) : 'Save'}
                                        </button>
                                        <button
                                            type="button"
                                            id="btnEditCancel"
                                            className="btn btn-light ml-1"
                                            onClick={() => setShowEditModal(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default LeadSources;
