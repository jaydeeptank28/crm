import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import DataTable from 'react-data-table-component';
import './ProjectDetail.css';

const ProjectDetail = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('project_details');
    const [tasks, setTasks] = useState([]);
    const [taskStatusFilter, setTaskStatusFilter] = useState('');

    useEffect(() => {
        fetchProject();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'tasks') {
            fetchTasks();
        }
    }, [activeTab, taskStatusFilter]);

    const fetchProject = async () => {
        try {
            const response = await api.get(`/projects/${id}`);
            if (response.data.success) {
                setProject(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            let url = `/tasks?owner_type=App\\Models\\Project&owner_id=${id}`;
            if (taskStatusFilter !== '') {
                url += `&status=${taskStatusFilter}`;
            }
            const response = await api.get(url);
            if (response.data.success) {
                setTasks(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        const day = date.getDate();
        const suffix = ['th', 'st', 'nd', 'rd'][day % 10 > 3 ? 0 : (day % 100 - day % 10 != 10 ? day % 10 : 0)];
        return `${day}${suffix} ${date.toLocaleString('default', { month: 'short' })}, ${date.getFullYear()}`;
    };

    const timeAgo = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 }
        ];
        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }
        return 'just now';
    };

    const taskColumns = [
        { name: 'Subject', selector: row => row.subject, sortable: true },
        { name: 'Start Date', selector: row => row.start_date, sortable: true },
        { name: 'Due Date', selector: row => row.due_date, sortable: true },
        {
            name: 'Status',
            cell: row => <span className={`badge ${getTaskStatusBadge(row.status)}`}>{getTaskStatusText(row.status)}</span>
        },
        {
            name: 'Priority',
            cell: row => <span className={`badge ${getTaskPriorityBadge(row.priority)}`}>{getTaskPriorityText(row.priority)}</span>
        }
    ];

    const getTaskStatusText = (status) => {
        const statusMap = { 1: 'Not Started', 2: 'In Progress', 3: 'Testing', 4: 'Awaiting Feedback', 5: 'Complete' };
        return statusMap[status] || 'N/A';
    };

    const getTaskStatusBadge = (status) => {
        const badgeMap = { 1: 'badge-danger', 2: 'badge-primary', 3: 'badge-warning', 4: 'badge-info', 5: 'badge-success' };
        return badgeMap[status] || 'badge-secondary';
    };

    const getTaskPriorityText = (priority) => {
        const priorityMap = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Urgent' };
        return priorityMap[priority] || 'N/A';
    };

    const getTaskPriorityBadge = (priority) => {
        const badgeMap = { 1: 'badge-success', 2: 'badge-info', 3: 'badge-warning', 4: 'badge-danger' };
        return badgeMap[priority] || 'badge-secondary';
    };

    if (loading || !project) {
        return (
            <section className="section">
                <div className="text-center py-5">Loading...</div>
            </section>
        );
    }

    const renderProjectDetailsTab = () => (
        <div className="row">
            <div className="form-group col-md-4 col-12">
                <label>Project Name:</label>
                <p>{project.project_name}</p>
            </div>
            <div className="form-group col-md-4 col-12">
                <label>Customer:</label>
                <p>
                    <Link to={`/customers/${project.customer?.id}`} className="anchor-underline">
                        {project.customer?.company_name || 'N/A'}
                    </Link>
                </p>
            </div>
            <div className="form-group col-md-4 col-12">
                <label>Contacts:</label>
                <p>
                    {project.projectContacts?.length > 0 ? (
                        project.projectContacts.map((contact, i) => (
                            <span key={i} className="badge border border-secondary mb-1 mr-1">
                                <Link to={`/contacts/${contact.id}`} className="anchor-underline">
                                    {contact.user?.full_name}
                                </Link>
                            </span>
                        ))
                    ) : (
                        'N/A'
                    )}
                </p>
            </div>
            <div className="form-group col-md-4 col-12">
                <label>Members:</label>
                <p>
                    {project.members?.length > 0 ? (
                        project.members.map((member, i) => (
                            <span key={i} className="badge border border-secondary mb-1 mr-1">
                                <Link to={`/members/${member.user?.id}`} className="anchor-underline">
                                    {member.user?.first_name} {member.user?.last_name}
                                </Link>
                            </span>
                        ))
                    ) : (
                        'N/A'
                    )}
                </p>
            </div>
            <div className="form-group col-md-4 col-12">
                <label>Progress:</label>
                <p>{project.progress || 0}%</p>
            </div>
            <div className="form-group col-md-4 col-12">
                <label>Billing Type:</label>
                <p>{project.billing_type_text || 'N/A'}</p>
            </div>
            <div className="form-group col-md-4 col-12">
                <label>Status:</label>
                <p>{project.status_text || 'N/A'}</p>
            </div>
            <div className="form-group col-md-4 col-12">
                <label>Estimated Hours:</label>
                <p>{project.estimated_hours || 'N/A'} Hours</p>
            </div>
            <div className="form-group col-md-4 col-12">
                <label>Start Date:</label>
                <p>{formatDate(project.start_date)}</p>
            </div>
            <div className="form-group col-md-4 col-12">
                <label>Deadline:</label>
                <p>{formatDate(project.deadline)}</p>
            </div>
            <div className="form-group col-md-4 col-12">
                <label>Tags:</label>
                <p>
                    {project.tags?.length > 0 ? (
                        project.tags.map((tag, i) => (
                            <span key={i} className="badge border border-secondary mb-1 mr-1">
                                {tag.name}
                            </span>
                        ))
                    ) : (
                        'N/A'
                    )}
                </p>
            </div>
            <div className="form-group col-md-4 col-12">
                <label>Created On:</label>
                <p title={formatDate(project.created_at)}>{timeAgo(project.created_at)}</p>
            </div>
            <div className="form-group col-md-4 col-12">
                <label>Last Updated:</label>
                <p title={formatDate(project.updated_at)}>{timeAgo(project.updated_at)}</p>
            </div>
            <div className="row">
                <div className="form-group col-md-4 col-12">
                    <label>Description:</label>
                    <br />
                    <div dangerouslySetInnerHTML={{ __html: project.description || 'N/A' }} />
                </div>
            </div>
        </div>
    );

    const renderTasksTab = () => (
        <section className="section">
            <div className="section-body">
                <div className="card">
                    <div className="card-header">
                        <div className="row w-100 justify-content-end">
                            <div className="justify-content-end">
                                <select
                                    className="form-control"
                                    id="filter_status"
                                    value={taskStatusFilter}
                                    onChange={(e) => setTaskStatusFilter(e.target.value)}
                                >
                                    <option value="">Select Status</option>
                                    <option value="1">Not Started</option>
                                    <option value="2">In Progress</option>
                                    <option value="3">Testing</option>
                                    <option value="4">Awaiting Feedback</option>
                                    <option value="5">Complete</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <DataTable
                            columns={taskColumns}
                            data={tasks}
                            pagination
                            paginationPerPage={10}
                            highlightOnHover
                            striped
                            noDataComponent={<p className="text-center py-3">No tasks found.</p>}
                        />
                    </div>
                </div>
            </div>
        </section>
    );

    return (
        <section className="section">
            <div className="section-header item-align-right">
                <h1>Project Details</h1>
                <div className="section-header-breadcrumb float-right">
                    {project.status !== 3 && project.status !== 4 && (
                        <Link to={`/projects/${id}/edit`} className="btn btn-warning mr-2 form-btn">
                            Edit
                        </Link>
                    )}
                    <Link to="/projects" className="btn btn-primary form-btn">
                        Back
                    </Link>
                </div>
            </div>
            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        {/* Tabs - Matching PHP show_fields.blade.php */}
                        <ul className="nav nav-tabs mb-3" role="tablist">
                            <li className="nav-item">
                                <a
                                    href="#"
                                    className={`nav-link ${activeTab === 'project_details' ? 'active' : ''}`}
                                    onClick={(e) => { e.preventDefault(); setActiveTab('project_details'); }}
                                >
                                    Project Details
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    href="#"
                                    className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`}
                                    onClick={(e) => { e.preventDefault(); setActiveTab('tasks'); }}
                                >
                                    Tasks
                                </a>
                            </li>
                        </ul>
                        <br />

                        {/* Tab Content */}
                        {activeTab === 'project_details' && renderProjectDetailsTab()}
                        {activeTab === 'tasks' && renderTasksTab()}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProjectDetail;
