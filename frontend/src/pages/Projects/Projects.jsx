import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './Projects.css';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [billingTypeFilter, setBillingTypeFilter] = useState('');
    const [statusCount, setStatusCount] = useState({
        not_started: 0,
        in_progress: 0,
        on_hold: 0,
        cancelled: 0,
        finished: 0
    });
    const [statusArr, setStatusArr] = useState({});
    const [billingTypes, setBillingTypes] = useState({});

    useEffect(() => {
        fetchProjects();
    }, [statusFilter, billingTypeFilter]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter !== '') params.append('status', statusFilter);
            if (billingTypeFilter !== '') params.append('billing_type', billingTypeFilter);
            if (searchQuery) params.append('search', searchQuery);

            const response = await api.get(`/projects?${params.toString()}`);
            if (response.data.success) {
                setProjects(response.data.data || []);
                setStatusCount(response.data.statusCount || {});
                setStatusArr(response.data.statusArr || {});
                setBillingTypes(response.data.billingTypes || {});
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProjects();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Delete !',
            text: `Are you sure want to delete this "${name}" Project?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#6777ef',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await api.delete(`/projects/${id}`);
                    if (response.data.success) {
                        fetchProjects();
                        Swal.fire('Deleted', 'Project deleted successfully.', 'success');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Error deleting project', 'error');
                }
            }
        });
    };

    // Filter projects based on search
    const filteredProjects = projects.filter(project =>
        project.project_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <div className="section">
                <div className="section-header mobile-sec-header">
                    <h1>Projects</h1>
                </div>
                <div className="section-body">
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <div className="live-wire-infy-loader">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="section">
            <div className="section-header mobile-sec-header">
                <h1>Projects</h1>
                <div className="section-header-breadcrumb float-right">
                    <div className="card-header-action mr-3">
                        <select
                            id="billing_type"
                            className="form-control"
                            value={billingTypeFilter}
                            onChange={(e) => setBillingTypeFilter(e.target.value)}
                        >
                            <option value="">Select Billing Type</option>
                            {Object.entries(billingTypes).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="float-right mr-3">
                    <select
                        id="filter_status"
                        className="form-control"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Select Status</option>
                        {Object.entries(statusArr).map(([key, value]) => (
                            <option key={key} value={key}>{value}</option>
                        ))}
                    </select>
                </div>
                <div className="float-right">
                    <Link to="/projects/create" className="btn btn-primary form-btn">
                        Add <i className="fas fa-plus"></i>
                    </Link>
                </div>
            </div>
            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        <div className="row">
                            {/* Search */}
                            <div className="mt-0 mb-3 col-12 d-flex justify-content-end search-display-block">
                                <div className="p-2">
                                    <input
                                        type="search"
                                        className="form-control"
                                        placeholder="Search"
                                        id="search"
                                        value={searchQuery}
                                        onChange={handleSearch}
                                    />
                                </div>
                            </div>

                            {/* Status Count Carousel - Matching PHP */}
                            <div className="col-md-12">
                                <div className="row justify-content-md-center text-center mb-4">
                                    <div className="owl-carousel-wrapper d-flex justify-content-center flex-wrap gap-3">
                                        <div className="item">
                                            <div className="ticket-statistics mx-auto bg-danger">
                                                <p>{statusCount.not_started || 0}</p>
                                            </div>
                                            <h5 className="my-0 mt-1">Not Started</h5>
                                        </div>
                                        <div className="item">
                                            <div className="ticket-statistics mx-auto bg-primary">
                                                <p>{statusCount.in_progress || 0}</p>
                                            </div>
                                            <h5 className="my-0 mt-1">In Progress</h5>
                                        </div>
                                        <div className="item">
                                            <div className="ticket-statistics mx-auto bg-warning">
                                                <p>{statusCount.on_hold || 0}</p>
                                            </div>
                                            <h5 className="my-0 mt-1">On Hold</h5>
                                        </div>
                                        <div className="item">
                                            <div className="ticket-statistics mx-auto bg-info">
                                                <p>{statusCount.cancelled || 0}</p>
                                            </div>
                                            <h5 className="my-0 mt-1">Cancelled</h5>
                                        </div>
                                        <div className="item">
                                            <div className="ticket-statistics mx-auto bg-success">
                                                <p>{statusCount.finished || 0}</p>
                                            </div>
                                            <h5 className="my-0 mt-1">Finished</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Project Cards Grid - Matching PHP Livewire */}
                            {paginatedProjects.length > 0 ? (
                                paginatedProjects.map(project => (
                                    <div key={project.id} className="col-12 col-md-6 col-lg-6 col-xl-4 extra-large">
                                        <div className={`livewire-card card card-${project.card_color || 'primary'} shadow mb-5 rounded project-card-height`}>
                                            <div className="card-header d-flex justify-content-between align-items-center pt-2 pr-3 pb-3 pl-3">
                                                <div className="d-flex">
                                                    <Link to={`/projects/${project.id}`} className="text-decoration-none">
                                                        <h4 className="text-primary card-report-name">
                                                            {project.project_name?.length > 15
                                                                ? project.project_name.substring(0, 15) + '...'
                                                                : project.project_name}
                                                        </h4>
                                                    </Link>
                                                </div>
                                                {/* 3-dots dropdown menu */}
                                                <div className="dropdown dropdown-list-toggle">
                                                    <a href="#" className="notification-toggle action-dropdown" data-toggle="dropdown">
                                                        <i className="fas fa-ellipsis-v action-toggle-mr"></i>
                                                    </a>
                                                    <div className="dropdown-menu dropdown-menu-right">
                                                        <div className="dropdown-list-content dropdown-list-icons">
                                                            {project.status !== 3 && (
                                                                <Link to={`/projects/${project.id}/edit`} className="dropdown-item dropdown-item-desc edit-btn">
                                                                    <i className="fas fa-edit mr-2 card-edit-icon"></i>
                                                                    Edit
                                                                </Link>
                                                            )}
                                                            <a
                                                                href="#"
                                                                className="dropdown-item dropdown-item-desc delete-btn"
                                                                onClick={(e) => { e.preventDefault(); handleDelete(project.id, project.project_name); }}
                                                            >
                                                                <i className="fas fa-trash mr-2 card-delete-icon"></i>
                                                                Delete
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body pt-0 pl-3">
                                                <div className="float-left">
                                                    <span className="projectStatistics" title="Billing Type">
                                                        {project.billing_type_text || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="float-right project-card-status mt-1">
                                                    <span className={`badge ${project.status_badge || 'badge-secondary'} text-uppercase projectStatus`}>
                                                        {project.status_text || 'N/A'}
                                                    </span>
                                                </div>
                                                <br />
                                                <div className="float-left mt-2">
                                                    <span className="mr-1" title="Customer">
                                                        {project.customer?.company_name || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="card-body d-flex justify-content-between align-items-center pt-0 pl-3 pb-2">
                                                <div className="d-inline-block project-avatar-margin">
                                                    {project.members?.slice(0, 5).map((member, index) => (
                                                        <Link key={index} to={`/members/${member.user?.id}`}>
                                                            <img
                                                                className="projectUserAvatar p-0 mb-1"
                                                                src={member.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user?.first_name || 'M')}&background=6777ef&color=fff`}
                                                                alt={member.user?.first_name}
                                                                title={`${member.user?.first_name} ${member.user?.last_name}`}
                                                            />
                                                        </Link>
                                                    ))}
                                                    {project.members?.length > 5 && (
                                                        <span className="project_remaining_user">
                                                            <b>+ {project.members.length - 5}</b>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="mt-0 mb-5 col-12 d-flex justify-content-center mb-5 rounded">
                                    <div className="p-2">
                                        <p className="text-dark">
                                            {searchQuery ? 'No project found.' : 'No project available.'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Pagination */}
                            {filteredProjects.length > 0 && (
                                <div className="mt-0 mb-5 col-12">
                                    <div className="row paginatorRow">
                                        <div className="col-lg-2 col-md-6 col-sm-12 pt-2">
                                            <span className="d-inline-flex">
                                                Showing <span className="font-weight-bold ml-1 mr-1">{startIndex + 1}</span> -
                                                <span className="font-weight-bold ml-1 mr-1">
                                                    {Math.min(startIndex + itemsPerPage, filteredProjects.length)}
                                                </span> of
                                                <span className="font-weight-bold ml-1">{filteredProjects.length}</span>
                                            </span>
                                        </div>
                                        <div className="col-lg-10 col-md-6 col-sm-12 d-flex justify-content-end">
                                            <nav>
                                                <ul className="pagination">
                                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                            disabled={currentPage === 1}
                                                        >
                                                            &laquo;
                                                        </button>
                                                    </li>
                                                    {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                                                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => setCurrentPage(i + 1)}
                                                            >
                                                                {i + 1}
                                                            </button>
                                                        </li>
                                                    ))}
                                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                            disabled={currentPage === totalPages}
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
        </div>
    );
};

export default Projects;
