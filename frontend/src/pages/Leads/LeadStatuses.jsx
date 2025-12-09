import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './LeadStatuses.css';

const LeadStatuses = () => {
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', color: '#6777ef', order: 0 });
    const [editId, setEditId] = useState(null);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchStatuses();
    }, []);

    const fetchStatuses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/leads/statuses/all');
            if (response.data.success) {
                setStatuses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching lead statuses:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', color: '#6777ef', order: 0 });
        setErrors({});
        setEditId(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = async (status) => {
        setEditId(status.id);
        setFormData({
            name: status.name,
            color: status.color || '#6777ef',
            order: status.order || 0
        });
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

    const handleColorChange = (e) => {
        setFormData(prev => ({ ...prev, color: e.target.value }));
    };

    const handleSubmitAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            const response = await api.post('/leads/statuses', formData);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Lead status created successfully!',
                    timer: 1500,
                    showConfirmButton: false
                });
                setShowAddModal(false);
                fetchStatuses();
                resetForm();
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
            const response = await api.put(`/leads/statuses/${editId}`, formData);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Lead status updated successfully!',
                    timer: 1500,
                    showConfirmButton: false
                });
                setShowEditModal(false);
                fetchStatuses();
                resetForm();
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
            title: 'Delete Lead Status?',
            text: `Are you sure you want to delete "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#fc544b',
            cancelButtonColor: '#6777ef',
            confirmButtonText: 'Yes, Delete'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.delete(`/leads/statuses/${id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Lead status has been deleted.', 'success');
                    fetchStatuses();
                }
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to delete lead status', 'error');
            }
        }
    };

    return (
        <section className="section">
            <div className="section-header">
                <h1>Lead Status</h1>
                <div className="section-header-breadcrumb">
                    <a
                        href="#"
                        className="btn btn-primary form-btn addLeadStatusModal float-right-mobile"
                        onClick={(e) => { e.preventDefault(); openAddModal(); }}
                    >
                        Add <i className="fas fa-plus"></i>
                    </a>
                </div>
            </div>

            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary"></div>
                                <p className="mt-3">Loading...</p>
                            </div>
                        ) : (
                            <table className="table table-responsive-sm table-striped table-bordered" id="leadStatusTbl">
                                <thead>
                                    <tr>
                                        <th scope="col">Name</th>
                                        <th scope="col">Color</th>
                                        <th scope="col">Order</th>
                                        <th scope="col">Leads</th>
                                        <th scope="col">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statuses.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center">No lead statuses found</td>
                                        </tr>
                                    ) : (
                                        statuses.map(status => (
                                            <tr key={status.id}>
                                                <td>{status.name}</td>
                                                <td>
                                                    <span
                                                        className="badge badge-color-circle"
                                                        style={{ backgroundColor: status.color || '#6777ef' }}
                                                    ></span>
                                                </td>
                                                <td>{status.order}</td>
                                                <td>{status.leads_count || 0}</td>
                                                <td>
                                                    <a
                                                        href="#"
                                                        className="btn btn-warning btn-sm edit-btn"
                                                        title="Edit"
                                                        onClick={(e) => { e.preventDefault(); openEditModal(status); }}
                                                    >
                                                        <i className="fa fa-edit"></i>
                                                    </a>
                                                    <a
                                                        href="#"
                                                        className="btn btn-danger btn-sm delete-btn ml-1"
                                                        title="Delete"
                                                        onClick={(e) => { e.preventDefault(); handleDelete(status.id, status.name); }}
                                                    >
                                                        <i className="fa fa-trash"></i>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal fade show" id="addModal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">New Lead Status</h5>
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
                                        <div className="form-group col-sm-10">
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
                                        <div className="form-group col-sm-2">
                                            <label htmlFor="color">Color:<span className="required">*</span></label>
                                            <div className="color-wrapper">
                                                <input
                                                    type="color"
                                                    name="color"
                                                    className="form-control color-picker"
                                                    value={formData.color}
                                                    onChange={handleColorChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group col-sm-12">
                                            <label htmlFor="order">Order:<span className="required">*</span></label>
                                            <input
                                                type="number"
                                                name="order"
                                                className="form-control"
                                                value={formData.order}
                                                onChange={handleChange}
                                                min="0"
                                                max="100"
                                                required
                                                placeholder="Order"
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
                                <h5 className="modal-title">Edit Lead Status</h5>
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
                                        <div className="form-group col-sm-10">
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
                                        <div className="form-group col-sm-2">
                                            <label htmlFor="edit_color">Color:<span className="required">*</span></label>
                                            <div className="color-wrapper">
                                                <input
                                                    type="color"
                                                    name="color"
                                                    id="edit_color"
                                                    className="form-control color-picker"
                                                    value={formData.color}
                                                    onChange={handleColorChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group col-sm-12">
                                            <label htmlFor="editOrder">Order:<span className="required">*</span></label>
                                            <input
                                                type="number"
                                                name="order"
                                                id="editOrder"
                                                className="form-control"
                                                value={formData.order}
                                                onChange={handleChange}
                                                min="0"
                                                max="100"
                                                required
                                                placeholder="Order"
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

export default LeadStatuses;
