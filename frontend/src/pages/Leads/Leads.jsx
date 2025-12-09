import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './Leads.css';

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [statusCounts, setStatusCounts] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [pagination, setPagination] = useState({
        total: 0, pages: 0, page: 1, limit: 12, from: 0, to: 0
    });
    const searchTimeout = useRef(null);

    useEffect(() => {
        fetchFormData();
    }, []);

    useEffect(() => {
        fetchLeads();
    }, [pagination.page, statusFilter, sourceFilter]);

    useEffect(() => {
        // Debounce search
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchLeads();
        }, 300);
        return () => clearTimeout(searchTimeout.current);
    }, [search]);

    const fetchFormData = async () => {
        try {
            const response = await api.get('/leads/form-data');
            if (response.data.success) {
                setStatuses(response.data.data.statuses);
                setSources(response.data.data.sources);
            }
        } catch (error) {
            console.error('Error fetching form data:', error);
        }
    };

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const response = await api.get('/leads', {
                params: {
                    page: pagination.page,
                    search,
                    status: statusFilter,
                    source: sourceFilter
                }
            });
            if (response.data.success) {
                setLeads(response.data.data.leads);
                setStatusCounts(response.data.data.statusCounts);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        const result = await Swal.fire({
            title: 'Delete Lead?',
            text: `Are you sure you want to delete "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#fc544b',
            cancelButtonColor: '#6777ef',
            confirmButtonText: 'Yes, Delete'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.delete(`/leads/${id}`);
                if (response.data.success) {
                    setLeads(leads.filter(l => l.id !== id));
                    Swal.fire('Deleted!', 'Lead has been deleted.', 'success');
                    fetchLeads(); // Refresh to update status counts
                }
            } catch (error) {
                const msg = error.response?.data?.message || 'Failed to delete lead';
                Swal.fire('Error', msg, 'error');
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
            {/* Header */}
            <div className="section-header mobile-sec-hdr">
                <h1>Leads</h1>
                <div className="section-header-breadcrumb float-right">
                    <div className="card-header-action mr-2 ipad-margin-left">
                        <select
                            id="filter_status"
                            className="form-control"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Select Status</option>
                            {statuses.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="float-right mr-2">
                    <select
                        id="leadSourceId"
                        className="form-control"
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                    >
                        <option value="">Select Lead Source</option>
                        {sources.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
                <div className="float-right d-flex flex-lg-nowrap flex-wrap">
                    <div className="custom-sm-width">
                        <Link to="/lead-kanban" className="btn btn-warning form-btn mr-2 text-nowrap mt-lg-0 mt-2">
                            Kanban View
                        </Link>
                    </div>
                    <div>
                        <Link to="/lead-chart" className="btn btn-info form-btn mr-2 mt-lg-0 mt-2">
                            Chart
                        </Link>
                    </div>
                    <div>
                        <Link to="/leads/create" className="btn btn-primary form-btn text-nowrap mt-lg-0 mt-2 mr-2">
                            Add <i className="fas fa-plus"></i>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        {/* Search and Status Counts */}
                        <div className="row">
                            <div className="mt-0 mb-3 col-12 d-flex justify-content-end">
                                <div className="p-2">
                                    <input
                                        type="search"
                                        className="form-control"
                                        placeholder="Search"
                                        id="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Loading indicator */}
                            {loading && (
                                <div className="col-md-12">
                                    <div id="live-wire-screen-lock">
                                        <div className="live-wire-infy-loader">
                                            <div className="infy-loader"></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Status Counts Carousel */}
                            <div className="col-md-12">
                                <div className="row justify-content-md-center text-center mb-4">
                                    <div className="status-carousel">
                                        {statusCounts.map(status => (
                                            <div key={status.id} className="item">
                                                <div
                                                    className="ticket-statistics mx-auto"
                                                    style={{ backgroundColor: status.color || '#6777ef' }}
                                                >
                                                    <p>{status.leads_count || 0}</p>
                                                </div>
                                                <h5 className="my-0 mt-1">{status.name}</h5>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Lead Cards */}
                            {!loading && leads.length === 0 ? (
                                <div className="mt-0 mb-5 col-12 d-flex justify-content-center mb-5 rounded">
                                    <div className="p-2">
                                        <p className="text-dark">
                                            {search ? 'No lead found' : 'No lead available'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                leads.map(lead => (
                                    <div key={lead.id} className="col-12 col-md-6 col-lg-4 col-xl-4 extra-large mb-5">
                                        <div
                                            className="livewire-card card shadow rounded user-card-view hover-effect-lead lead-card-height"
                                            style={{ borderTop: `2px solid ${lead.leadStatus?.color || '#6777ef'}` }}
                                        >
                                            <div className="card-header d-flex align-items-center user-card-index d-sm-flex-wrap-0">
                                                <div className="ml-2 w-100 mb-auto">
                                                    <div className="justify-content-between d-flex">
                                                        <div className="d-inline-block lead-card-name">
                                                            <Link to={`/leads/${lead.id}`} className="anchor-underline">
                                                                <span>{truncate(lead.name, 10)}</span>
                                                                <span className="text-grey"> ({lead.company_name})</span>
                                                            </Link>
                                                        </div>
                                                        <div className="dropdown dropdown-list-toggle">
                                                            <a
                                                                href="#"
                                                                data-toggle="dropdown"
                                                                className="notification-toggle action-dropdown position-xs-bottom"
                                                            >
                                                                <i className="fas fa-ellipsis-v action-toggle-mr"></i>
                                                            </a>
                                                            <div className="dropdown-menu dropdown-menu-right">
                                                                <div className="dropdown-list-content dropdown-list-icons">
                                                                    <Link
                                                                        to={`/leads/${lead.id}/edit`}
                                                                        className="dropdown-item dropdown-item-desc edit-btn"
                                                                    >
                                                                        <i className="fas fa-edit mr-2 card-edit-icon"></i> Edit
                                                                    </Link>
                                                                    <a
                                                                        href="#"
                                                                        className="dropdown-item dropdown-item-desc delete-btn"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handleDelete(lead.id, lead.name);
                                                                        }}
                                                                    >
                                                                        <i className="fas fa-trash mr-2 card-delete-icon"></i> Delete
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="card-body pt-1 pl-0 pb-0">
                                                        <div className="line-height-20px">
                                                            <label className="font-weight-bold">Source: </label>
                                                            <span>{truncate(lead.leadSource?.name, 15)}</span>
                                                        </div>
                                                    </div>

                                                    {lead.estimate_budget && (
                                                        <div className="card-body pt-0 pl-0 pb-0">
                                                            <div className="line-height-20px">
                                                                <label className="font-weight-bold">Estimate Budget: </label>
                                                                <span>
                                                                    <i className="fas fa-dollar-sign"></i> {parseFloat(lead.estimate_budget).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="card-body pt-0 pl-0 pb-3 d-flex pr-0">
                                                        <div className="pt-2 mobile-margin-right">
                                                            <span
                                                                className="badge text-uppercase text-white"
                                                                style={{ backgroundColor: lead.leadStatus?.color || '#6777ef' }}
                                                            >
                                                                {lead.leadStatus?.name}
                                                            </span>
                                                        </div>
                                                        <div className="author-box-left pl-0 ml-auto">
                                                            {lead.assignedTo?.image_url && (
                                                                <Link to={`/members/${lead.assign_to}`}>
                                                                    <img
                                                                        alt="image"
                                                                        width="50"
                                                                        src={lead.assignedTo.image_url}
                                                                        className="rounded-circle lead-avatar-image uAvatar"
                                                                        title={lead.assignedTo.full_name}
                                                                    />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Pagination */}
                            {leads.length > 0 && (
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
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Leads;
