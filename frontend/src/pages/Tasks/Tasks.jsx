import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './Tasks.css';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [statusCount, setStatusCount] = useState({
        not_started: 0,
        in_progress: 0,
        testing: 0,
        awaiting_feedback: 0,
        completed: 0
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [pagination, setPagination] = useState({
        total: 0, pages: 0, page: 1, limit: 10, from: 0, to: 0
    });
    const searchTimeout = useRef(null);

    // Constants matching PHP
    const statuses = {
        1: 'Not Started',
        2: 'In Progress',
        3: 'Testing',
        4: 'Awaiting Feedback',
        5: 'Completed'
    };

    const priorities = {
        1: 'Low',
        2: 'Medium',
        3: 'High',
        4: 'Urgent'
    };

    const statusColors = {
        1: 'danger',
        2: 'primary',
        3: 'warning',
        4: 'info',
        5: 'success'
    };

    useEffect(() => {
        fetchStatusCount();
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [pagination.page, statusFilter, priorityFilter]);

    useEffect(() => {
        // Debounce search
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchTasks();
        }, 300);
        return () => clearTimeout(searchTimeout.current);
    }, [search]);

    const fetchStatusCount = async () => {
        try {
            const response = await api.get('/tasks/status-count');
            if (response.data.success) {
                setStatusCount(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching status counts:', error);
        }
    };

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tasks', {
                params: {
                    page: pagination.page,
                    search,
                    status: statusFilter,
                    priority: priorityFilter
                }
            });
            if (response.data.success) {
                setTasks(response.data.data.tasks);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, subject) => {
        const result = await Swal.fire({
            title: 'Delete Task?',
            text: `Are you sure you want to delete "${subject}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#fc544b',
            cancelButtonColor: '#6777ef',
            confirmButtonText: 'Yes, Delete'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.delete(`/tasks/${id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Task deleted successfully.', 'success');
                    fetchTasks();
                    fetchStatusCount();
                }
            } catch (error) {
                const msg = error.response?.data?.message || 'Failed to delete task';
                Swal.fire('Error', msg, 'error');
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleString('en', { month: 'short' });
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        return `${day} ${month}, ${year} ${hour12}:${minutes} ${ampm}`;
    };

    return (
        <section className="section">
            {/* Header */}
            <div className="section-header task-sec-mbl-hdr">
                <h1>Tasks</h1>
                <div className="section-header-breadcrumb float-right">
                    <div className="card-header-action mr-3">
                        <select
                            id="priorityId"
                            className="form-control"
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            style={{ width: '150px' }}
                        >
                            <option value="">Select Priority</option>
                            {Object.entries(priorities).map(([key, val]) => (
                                <option key={key} value={key}>{val}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="float-right mr-3">
                    <select
                        id="filter_status"
                        className="form-control select2-mobile-margin"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ width: '150px' }}
                    >
                        <option value="">Select Status</option>
                        {Object.entries(statuses).map(([key, val]) => (
                            <option key={key} value={key}>{val}</option>
                        ))}
                    </select>
                </div>
                <div className="float-right">
                    <Link to="/task-kanban" className="btn btn-warning form-btn mr-2 text-nowrap">
                        Kanban View
                    </Link>
                    <Link to="/tasks/create" className="btn btn-primary form-btn text-nowrap">
                        Add <i className="fas fa-plus"></i>
                    </Link>
                </div>
            </div>

            {/* Status Counts Carousel */}
            <div className="section-body mb-4">
                <div className="row justify-content-md-center text-center">
                    <div className="owl-carousel owl-theme d-flex justify-content-center flex-wrap">
                        <div className="item mx-3 my-2">
                            <div className="ticket-statistics mx-auto bg-danger">
                                <p>{statusCount.not_started}</p>
                            </div>
                            <h5 className="my-0 mt-1">Not Started</h5>
                        </div>
                        <div className="item mx-3 my-2">
                            <div className="ticket-statistics mx-auto bg-primary">
                                <p>{statusCount.in_progress}</p>
                            </div>
                            <h5 className="my-0 mt-1">In Progress</h5>
                        </div>
                        <div className="item mx-3 my-2">
                            <div className="ticket-statistics mx-auto bg-warning">
                                <p>{statusCount.testing}</p>
                            </div>
                            <h5 className="my-0 mt-1">Testing</h5>
                        </div>
                        <div className="item mx-3 my-2">
                            <div className="ticket-statistics mx-auto bg-info">
                                <p>{statusCount.awaiting_feedback}</p>
                            </div>
                            <h5 className="my-0 mt-1">Awaiting Feedback</h5>
                        </div>
                        <div className="item mx-3 my-2">
                            <div className="ticket-statistics mx-auto bg-success">
                                <p>{statusCount.completed}</p>
                            </div>
                            <h5 className="my-0 mt-1">Completed</h5>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        <div className="table-responsive-sm table-responsive-md overflow-hidden">
                            <div className="dataTables_wrapper">
                                {/* Search */}
                                <div className="row mb-3">
                                    <div className="col-sm-12 col-md-6"></div>
                                    <div className="col-sm-12 col-md-6">
                                        <div className="dataTables_filter float-right">
                                            <label>
                                                Search:
                                                <input
                                                    type="search"
                                                    className="form-control form-control-sm ml-2"
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Table */}
                                <table className="table table-responsive-sm table-responsive-md table-striped table-bordered" id="tasksTbl">
                                    <thead>
                                        <tr>
                                            <th scope="col">Subject</th>
                                            <th scope="col" style={{ width: '10%' }}>Priority</th>
                                            <th scope="col" style={{ width: '15%' }}>Start Date</th>
                                            <th scope="col" style={{ width: '15%' }}>Due Date</th>
                                            <th scope="col" style={{ width: '5%' }} className="text-center">Assignee</th>
                                            <th scope="col" style={{ width: '10%' }}>Status</th>
                                            <th scope="col" style={{ width: '6%' }} className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="text-center">
                                                    <div className="spinner-border text-primary" role="status">
                                                        <span className="sr-only">Loading...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : tasks.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center">No data available in table</td>
                                            </tr>
                                        ) : (
                                            tasks.map(task => (
                                                <tr key={task.id}>
                                                    <td>
                                                        <Link to={`/tasks/${task.id}`} className="font-weight-bold anchor-underline">
                                                            {task.subject}
                                                        </Link>
                                                    </td>
                                                    <td>{task.priority ? priorities[task.priority] : 'N/A'}</td>
                                                    <td>{formatDate(task.start_date)}</td>
                                                    <td>{formatDate(task.due_date)}</td>
                                                    <td className="text-center">
                                                        {task.user ? (
                                                            <Link to={`/members/${task.member_id}`}>
                                                                <img
                                                                    src={task.user.image_url || '/assets/img/avatar-1.png'}
                                                                    className="thumbnail-rounded"
                                                                    data-toggle="tooltip"
                                                                    title={task.user.full_name}
                                                                    alt={task.user.full_name}
                                                                    style={{ width: '35px', height: '35px', borderRadius: '50%' }}
                                                                />
                                                            </Link>
                                                        ) : 'N/A'}
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-${statusColors[task.status] || 'secondary'}`}>
                                                            {statuses[task.status] || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="dropdown d-inline">
                                                            <button className="btn btn-primary btn-sm dropdown-toggle" type="button" data-toggle="dropdown">
                                                                <i className="fas fa-cog"></i>
                                                            </button>
                                                            <div className="dropdown-menu">
                                                                <Link to={`/tasks/${task.id}/edit`} className="dropdown-item">
                                                                    <i className="fa fa-edit"></i> Edit
                                                                </Link>
                                                                <button
                                                                    className="dropdown-item text-danger"
                                                                    onClick={() => handleDelete(task.id, task.subject)}
                                                                >
                                                                    <i className="fa fa-trash"></i> Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                {!loading && pagination.pages > 0 && (
                                    <div className="row">
                                        <div className="col-sm-12 col-md-5">
                                            <div className="dataTables_info">
                                                Showing {pagination.from} to {pagination.to} of {pagination.total} entries
                                            </div>
                                        </div>
                                        <div className="col-sm-12 col-md-7">
                                            <div className="dataTables_paginate paging_simple_numbers float-right">
                                                <ul className="pagination">
                                                    <li className={`paginate_button page-item previous ${pagination.page === 1 ? 'disabled' : ''}`}>
                                                        <button className="page-link" onClick={() => handlePageChange(pagination.page - 1)}>
                                                            Previous
                                                        </button>
                                                    </li>
                                                    {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                                                        let pageNum;
                                                        if (pagination.pages <= 5) {
                                                            pageNum = i + 1;
                                                        } else if (pagination.page <= 3) {
                                                            pageNum = i + 1;
                                                        } else if (pagination.page >= pagination.pages - 2) {
                                                            pageNum = pagination.pages - 4 + i;
                                                        } else {
                                                            pageNum = pagination.page - 2 + i;
                                                        }
                                                        return (
                                                            <li key={pageNum} className={`paginate_button page-item ${pagination.page === pageNum ? 'active' : ''}`}>
                                                                <button className="page-link" onClick={() => handlePageChange(pageNum)}>
                                                                    {pageNum}
                                                                </button>
                                                            </li>
                                                        );
                                                    })}
                                                    <li className={`paginate_button page-item next ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                                                        <button className="page-link" onClick={() => handlePageChange(pagination.page + 1)}>
                                                            Next
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Tasks;
