import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import './Tasks.css';

const TaskDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('task_details');

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

    const relatedToOptions = {
        1: 'Invoice',
        2: 'Customer',
        3: 'Ticket',
        4: 'Project',
        5: 'Proposal',
        6: 'Estimate',
        7: 'Lead',
        8: 'Contract'
    };

    useEffect(() => {
        fetchTask();
    }, [id]);

    const fetchTask = async () => {
        try {
            const response = await api.get(`/tasks/${id}`);
            if (response.data.success) {
                setTask(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching task:', error);
        } finally {
            setLoading(false);
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

    const timeAgo = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        return formatDate(dateStr);
    };

    if (loading) {
        return (
            <section className="section">
                <div className="section-header">
                    <h1>Task Details</h1>
                </div>
                <div className="section-body">
                    <div className="card">
                        <div className="card-body text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!task) {
        return (
            <section className="section">
                <div className="section-header">
                    <h1>Task Details</h1>
                </div>
                <div className="section-body">
                    <div className="card">
                        <div className="card-body">
                            <p>Task not found.</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section">
            <div className="section-header item-align-right">
                <h1>Task Details</h1>
                <div className="section-header-breadcrumb float-right">
                    <Link to={`/tasks/${id}/edit`} className="btn btn-warning mr-2 form-btn">
                        Edit
                    </Link>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} className="btn btn-primary form-btn">
                        Back
                    </a>
                </div>
            </div>
            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        {/* Tabs */}
                        <ul className="nav nav-tabs mb-2" role="tablist">
                            <li className="nav-item">
                                <a
                                    href="#"
                                    className={`nav-link ${activeTab === 'task_details' ? 'active' : ''}`}
                                    onClick={(e) => { e.preventDefault(); setActiveTab('task_details'); }}
                                >
                                    Task Details
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    href="#"
                                    className={`nav-link ${activeTab === 'reminders' ? 'active' : ''}`}
                                    onClick={(e) => { e.preventDefault(); setActiveTab('reminders'); }}
                                >
                                    Reminders
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    href="#"
                                    className={`nav-link ${activeTab === 'comments' ? 'active' : ''}`}
                                    onClick={(e) => { e.preventDefault(); setActiveTab('comments'); }}
                                >
                                    Comments
                                </a>
                            </li>
                        </ul>
                        <br />

                        {/* Task Details Tab */}
                        {activeTab === 'task_details' && (
                            <>
                                {/* Checkboxes */}
                                <div className="row">
                                    {task.public && (
                                        <div className="form-group col-6 col-sm-3">
                                            <div className="custom-control custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id="customCheck"
                                                    checked={true}
                                                    disabled
                                                />
                                                <label className="custom-control-label" htmlFor="customCheck">
                                                    Public
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                    {task.billable && (
                                        <div className="form-group col-6 col-sm-4">
                                            <div className="custom-control custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id="customCheck1"
                                                    checked={true}
                                                    disabled
                                                />
                                                <label className="custom-control-label" htmlFor="customCheck1">
                                                    Billable
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Details Row 1 */}
                                <div className="row">
                                    <div className="form-group col-sm-4">
                                        <label>Subject:</label>
                                        <p>{task.subject}</p>
                                    </div>
                                    <div className="form-group col-sm-4">
                                        <label>Hourly Rate:</label>
                                        <p>
                                            {task.hourly_rate ? (
                                                <><i className="fas fa-dollar-sign"></i> {task.hourly_rate}</>
                                            ) : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="form-group col-sm-4">
                                        <label>Start Date:</label>
                                        <p>{formatDate(task.start_date)}</p>
                                    </div>
                                </div>

                                {/* Details Row 2 */}
                                <div className="row">
                                    <div className="form-group col-sm-4">
                                        <label>Due Date:</label>
                                        <p>{formatDate(task.due_date)}</p>
                                    </div>
                                    <div className="form-group col-sm-4">
                                        <label>Priority:</label>
                                        <p>{task.priority ? priorities[task.priority] : 'N/A'}</p>
                                    </div>
                                    <div className="form-group col-sm-4">
                                        <label>Status:</label>
                                        <p>{task.status ? statuses[task.status] : 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Details Row 3 */}
                                <div className="row">
                                    <div className="form-group col-sm-4">
                                        <label>Related To:</label>
                                        <p>{task.related_to ? relatedToOptions[task.related_to] : 'N/A'}</p>
                                    </div>
                                    <div className="form-group col-sm-4">
                                        <label>Assignee:</label>
                                        <p>
                                            {task.user ? (
                                                <Link to={`/members/${task.member_id}`} className="anchor-underline">
                                                    {task.user.full_name}
                                                </Link>
                                            ) : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="form-group col-sm-4">
                                        <label>Created On:</label>
                                        <p>
                                            <span data-toggle="tooltip" title={formatDate(task.created_at)}>
                                                {timeAgo(task.created_at)}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Details Row 4 */}
                                <div className="row">
                                    <div className="form-group col-sm-4">
                                        <label>Last Updated:</label>
                                        <p>
                                            <span data-toggle="tooltip" title={formatDate(task.updated_at)}>
                                                {timeAgo(task.updated_at)}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="form-group col-sm-12">
                                        <label>Description:</label>
                                        <br />
                                        <div dangerouslySetInnerHTML={{ __html: task.description || 'N/A' }} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Reminders Tab */}
                        {activeTab === 'reminders' && (
                            <div className="text-center text-muted py-4">
                                <p>Reminders functionality - Coming Soon</p>
                            </div>
                        )}

                        {/* Comments Tab */}
                        {activeTab === 'comments' && (
                            <div className="text-center text-muted py-4">
                                <p>Comments functionality - Coming Soon</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TaskDetail;
