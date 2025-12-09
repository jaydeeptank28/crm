
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to match Laravel's Str::limit
const strLimit = (str, limit = 12, end = '...') => {
    if (!str) return '';
    return str.length > limit ? str.substring(0, limit) + end : str;
};

const Members = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('2'); // 2 = All, 1 = Active, 0 = Deactive
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState({ from: 0, to: 0, total: 0 });
    const [loggedInUserId, setLoggedInUserId] = useState(null);

    useEffect(() => {
        // Get logged in user ID from localStorage
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const parsed = JSON.parse(user);
                setLoggedInUserId(parsed.id);
            } catch (e) {
                console.error('Error parsing user:', e);
            }
        }
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchMembers();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, status, page]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/members', {
                params: {
                    page,
                    search,
                    status: status === '2' ? '' : status
                }
            });
            if (response.data.success) {
                setMembers(response.data.data.members || []);
                setTotalPages(response.data.data.pagination?.last_page || 1);
                setPagination({
                    from: response.data.data.pagination?.from || 0,
                    to: response.data.data.pagination?.to || 0,
                    total: response.data.data.pagination?.total || 0
                });
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        try {
            await api.patch(`/members/${id}/toggle-status`, { is_enable: !currentStatus });
            fetchMembers(); // Refresh list
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
            Toast.fire({
                icon: 'success',
                title: 'Status updated successfully'
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Member?',
            text: 'Are you sure want to delete this member?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#fc544b',
            cancelButtonColor: '#6777ef',
            confirmButtonText: 'Yes, Delete'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.delete(`/members/${id}`);
                // Remove from local state immediately for better UX
                setMembers(members.filter(m => m.id !== id));
                Swal.fire('Deleted!', 'Member has been deleted.', 'success');
            } catch (error) {
                console.error('Error deleting member:', error);
                const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to delete member';
                Swal.fire('Error', errorMsg, 'error');
            }
        }
    };

    const handleResendVerification = async (id) => {
        try {
            await api.post(`/members/${id}/resend-verification`);
            Swal.fire('Sent!', 'Verification email has been sent.', 'success');
        } catch (error) {
            console.error('Error sending verification:', error);
            Swal.fire('Error', 'Failed to send verification email', 'error');
        }
    };

    const handleImpersonate = async (id) => {
        // Placeholder for impersonation logic
        console.log('Impersonate', id);
        alert('Impersonate feature coming soon');
    };

    return (
        <section className="section">
            <div className="section-header m-section item-align-right">
                <h1>Members</h1>
                <div className="section-header-breadcrumb float-right">
                    <div className="card-header-action mr-3 select2-mobile-margin">
                        <select
                            className="form-control"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="2">Select Status</option>
                            <option value="1">Active</option>
                            <option value="0">Deactive</option>
                        </select>
                    </div>
                </div>
                <div className="float-right">
                    <Link to="/members/create" className="btn btn-primary form-btn">
                        Add <i className="fas fa-plus"></i>
                    </Link>
                </div>
            </div>

            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        {/* Search */}
                        <div className="row">
                            <div className="mt-0 mb-3 col-12 d-flex justify-content-end">
                                <div className="p-2">
                                    <input
                                        type="search"
                                        className="form-control"
                                        placeholder="Search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="row">
                            {loading ? (
                                <div className="col-12 text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                            ) : members.length > 0 ? (
                                members.map((member, index) => (
                                    <div key={member.id} className="col-12 col-md-6 col-lg-4 col-xl-4 extra-large">
                                        <div className={`livewire-card card ${index % 2 === 0 ? 'card-primary' : 'card-dark'} shadow mb-5 rounded user-card-view user-card-mbl-height`}>
                                            <div className="card-header d-flex align-items-center user-card-index d-sm-flex-wrap-0">
                                                <div className="author-box-left pl-0 mb-auto">
                                                    <img
                                                        alt="image"
                                                        width="50"
                                                        src={member.image_url ? `${API_URL}${member.image_url}` : '/assets/img/avatar.png'}
                                                        className="rounded-circle user-avatar-image uAvatar"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = '/assets/img/avatar.png'; }}
                                                    />
                                                </div>
                                                <div className="ml-2 w-100 mb-auto">
                                                    <div className="justify-content-between d-flex">
                                                        <div className="user-card-name pb-1">
                                                            <Link to={`/members/${member.id}`} className="anchor-underline">
                                                                <h4>{strLimit(member.first_name, 12, '...')}</h4>
                                                            </Link>
                                                        </div>
                                                        {/* Dropdown - matching PHP exactly */}
                                                        <a className="dropdown dropdown-list-toggle">
                                                            <a href="#" data-toggle="dropdown"
                                                                className="notification-toggle action-dropdown position-xs-bottom"
                                                                onClick={(e) => e.preventDefault()}>
                                                                <i className="fas fa-ellipsis-v action-toggle-mr"></i>
                                                            </a>
                                                            <div className="dropdown-menu dropdown-menu-right">
                                                                <div className="dropdown-list-content dropdown-list-icons">
                                                                    <Link to={`/members/${member.id}/edit`}
                                                                        className="dropdown-item dropdown-item-desc edit-btn"
                                                                        data-id={member.id}>
                                                                        <i className="fas fa-edit mr-2 card-edit-icon"></i> Edit
                                                                    </Link>
                                                                    {loggedInUserId !== member.id && (
                                                                        <a href="#"
                                                                            className="dropdown-item dropdown-item-desc delete-btn"
                                                                            data-id={member.id}
                                                                            onClick={(e) => { e.preventDefault(); handleDelete(member.id); }}>
                                                                            <i className="fas fa-trash mr-2 card-delete-icon"></i> Delete
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </a>
                                                    </div>
                                                    {member.role_names && (
                                                        <div className="card-member-role">
                                                            {member.role_names}
                                                        </div>
                                                    )}
                                                    <div className="card-user-email pt-1 mb-1">
                                                        {member.email}
                                                        {member.email_verified_at ? (
                                                            <span data-toggle="tooltip" title="Email is verified"><i className="fas fa-check-circle email-verified"></i></span>
                                                        ) : (
                                                            <span data-toggle="tooltip" title="Email is not verified"><i className="fas fa-times-circle email-not-verified"></i></span>
                                                        )}
                                                    </div>
                                                    <div className="mr-3 mt-2">
                                                        <span className="badge badge-primary">{member.projects_count || 0}</span> Projects
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body d-flex align-items-center pt-0 pl-3 ml-2">
                                                {/* Status toggle - matching PHP exactly */}
                                                {member.id !== loggedInUserId && (
                                                    <div className="mt-2 member-card-toggle card-toggle-mr">
                                                        <label className="custom-switch pl-0" data-placement="bottom"
                                                            data-toggle="tooltip" title="Status">
                                                            <input
                                                                type="checkbox"
                                                                name="is_enable"
                                                                className="custom-switch-input is-administrator"
                                                                data-id={member.id}
                                                                value="1"
                                                                data-class="is_enable"
                                                                checked={member.is_enable}
                                                                onChange={() => handleStatusToggle(member.id, member.is_enable)}
                                                            />
                                                            <span className="custom-switch-indicator"></span>
                                                        </label>
                                                    </div>
                                                )}

                                                {!member.email_verified_at ? (
                                                    <div className="ml-auto mt-1 member-card-toggle">
                                                        <button
                                                            className="btn btn-danger btn-sm p-0 pl-1 pr-1 email-verify-btn"
                                                            data-id={member.id}
                                                            data-toggle="tooltip"
                                                            title="Email Verify"
                                                        >
                                                            <i className="fas fa-envelope font-size-12px"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-primary btn-sm p-0 pl-1 pr-1 email-btn"
                                                            data-id={member.id}
                                                            data-toggle="tooltip"
                                                            title="Resend Email Verification"
                                                            onClick={() => handleResendVerification(member.id)}
                                                        >
                                                            <i className="fas fa-sync font-size-12px"></i>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="ml-auto mt-1 member-card-toggle">
                                                        {!member.is_admin && member.is_enable && (
                                                            <a href="#" onClick={(e) => { e.preventDefault(); handleImpersonate(member.id); }}>
                                                                <button
                                                                    className="btn btn-primary btn-sm p-0 pl-1 pr-1 email-verified-btn"
                                                                    data-toggle="tooltip"
                                                                    title="Impersonate"
                                                                >
                                                                    <i className="fas fa-user font-size-12px"></i>
                                                                </button>
                                                            </a>
                                                        )}
                                                        <button
                                                            className="btn btn-success btn-sm p-0 pl-1 pr-1 email-verified-btn"
                                                            data-toggle="tooltip"
                                                            title="Email Verified"
                                                        >
                                                            <i className="fas fa-envelope font-size-12px"></i>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-12 text-center py-5">
                                    <p className="text-muted">No members found</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {members.length > 0 && (
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
                                        <ul className="pagination mb-0">
                                            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                                <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</button>
                                            </li>
                                            <li className="page-item active">
                                                <span className="page-link">{page}</span>
                                            </li>
                                            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                                <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next</button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Members;
