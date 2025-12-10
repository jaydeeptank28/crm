import { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import './CustomerGroups.css';

const CustomerGroups = () => {
    const [customerGroups, setCustomerGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchCustomerGroups();
    }, []);

    const fetchCustomerGroups = async () => {
        try {
            const response = await api.get('/customer-groups');
            if (response.data.success) {
                setCustomerGroups(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching customer groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post('/customer-groups', formData);
            if (response.data.success) {
                setShowAddModal(false);
                setFormData({ name: '', description: '' });
                fetchCustomerGroups();
                Swal.fire('Success', 'Customer Group saved successfully.', 'success');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Error creating customer group';
            Swal.fire('Error', message, 'error');
        }
    };

    const handleEdit = async (id) => {
        try {
            const response = await api.get(`/customer-groups/${id}`);
            if (response.data.success) {
                setFormData({
                    name: response.data.data.name,
                    description: response.data.data.description || ''
                });
                setEditId(id);
                setShowEditModal(true);
            }
        } catch (error) {
            Swal.fire('Error', 'Error fetching customer group', 'error');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const response = await api.put(`/customer-groups/${editId}`, formData);
            if (response.data.success) {
                setShowEditModal(false);
                setFormData({ name: '', description: '' });
                setEditId(null);
                fetchCustomerGroups();
                Swal.fire('Success', 'Customer Group updated successfully.', 'success');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Error updating customer group';
            Swal.fire('Error', message, 'error');
        }
    };

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Delete !',
            text: `Are you sure want to delete this "${name}" Customer Group?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#6777ef',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await api.delete(`/customer-groups/${id}`);
                    if (response.data.success) {
                        fetchCustomerGroups();
                        Swal.fire('Deleted', 'Customer Group deleted successfully.', 'success');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Error deleting customer group', 'error');
                }
            }
        });
    };

    const columns = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true
        },
        {
            name: 'Description',
            selector: row => row.description || 'N/A',
            sortable: false
        },
        {
            name: 'Action',
            cell: row => (
                <div className="action-buttons">
                    <a
                        href="#"
                        title="Edit"
                        className="btn btn-sm btn-primary mr-1"
                        onClick={(e) => { e.preventDefault(); handleEdit(row.id); }}
                    >
                        <i className="fas fa-pencil-alt"></i>
                    </a>
                    <a
                        href="#"
                        title="Delete"
                        className="btn btn-sm btn-danger delete-btn"
                        onClick={(e) => { e.preventDefault(); handleDelete(row.id, row.name); }}
                    >
                        <i className="fas fa-trash"></i>
                    </a>
                </div>
            )
        }
    ];

    return (
        <section className="section">
            <div className="section-header">
                <h1>Customer Groups</h1>
                <div className="section-header-breadcrumb">
                    <button
                        className="btn btn-primary form-btn float-right-mobile"
                        onClick={() => setShowAddModal(true)}
                    >
                        Add <i className="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        <DataTable
                            columns={columns}
                            data={customerGroups}
                            progressPending={loading}
                            pagination
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[10, 25, 50, 100]}
                            highlightOnHover
                            striped
                        />
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">New Customer Group</h5>
                                <button type="button" className="close" onClick={() => { setShowAddModal(false); setFormData({ name: '', description: '' }); }}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Name: <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Description:</label>
                                        <textarea
                                            className="form-control"
                                            rows="5"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary">Save</button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => { setShowAddModal(false); setFormData({ name: '', description: '' }); }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Customer Group</h5>
                                <button type="button" className="close" onClick={() => { setShowEditModal(false); setFormData({ name: '', description: '' }); setEditId(null); }}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleUpdate}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Name: <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Description:</label>
                                        <textarea
                                            className="form-control"
                                            rows="5"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary">Save</button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => { setShowEditModal(false); setFormData({ name: '', description: '' }); setEditId(null); }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default CustomerGroups;
