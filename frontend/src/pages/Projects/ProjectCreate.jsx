import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Select from 'react-select';

const ProjectCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [syncData, setSyncData] = useState({
        customers: {},
        members: {},
        billingTypes: {},
        status: {},
        tags: {}
    });

    const [formData, setFormData] = useState({
        project_name: '',
        customer_id: '',
        contacts: [],
        members: [],
        calculate_progress_through_tasks: false,
        progress: 0,
        billing_type: '',
        status: '',
        estimated_hours: '',
        start_date: '',
        deadline: '',
        tags: [],
        description: '',
        send_email: false
    });

    useEffect(() => {
        fetchSyncData();
    }, []);

    const fetchSyncData = async () => {
        try {
            const response = await api.get('/projects/sync-data');
            if (response.data.success) {
                setSyncData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching sync data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleProgressChange = (e) => {
        setFormData(prev => ({ ...prev, progress: e.target.value }));
    };

    const handleMembersChange = (selectedOptions) => {
        const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setFormData(prev => ({ ...prev, members: selectedIds }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.project_name) {
            Swal.fire('Error', 'Project name is required', 'error');
            return;
        }
        if (!formData.customer_id) {
            Swal.fire('Error', 'Customer is required', 'error');
            return;
        }
        if (formData.members.length === 0) {
            Swal.fire('Error', 'Members are required', 'error');
            return;
        }
        if (!formData.start_date) {
            Swal.fire('Error', 'Start date is required', 'error');
            return;
        }
        if (!formData.deadline) {
            Swal.fire('Error', 'Deadline is required', 'error');
            return;
        }

        try {
            const response = await api.post('/projects', formData);
            if (response.data.success) {
                Swal.fire('Success', 'Project saved successfully.', 'success');
                navigate('/projects');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Error creating project';
            Swal.fire('Error', message, 'error');
        }
    };

    if (loading) {
        return (
            <section className="section">
                <div className="text-center py-5">Loading...</div>
            </section>
        );
    }

    const memberOptions = Object.entries(syncData.members || {}).map(([key, value]) => ({
        value: parseInt(key),
        label: value
    }));

    const selectedMembers = memberOptions.filter(option => formData.members.includes(option.value));

    return (
        <section className="section">
            <div className="section-header">
                <h1>New Project</h1>
                <div className="section-header-breadcrumb">
                    <Link to="/projects" className="btn btn-primary">
                        <i className="fas fa-arrow-left"></i> Back
                    </Link>
                </div>
            </div>
            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="col-lg-12">
                                <div className="row">
                                    {/* Project Name */}
                                    <div className="form-group col-sm-6">
                                        <label>Project Name: <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="project_name"
                                            className="form-control"
                                            value={formData.project_name}
                                            onChange={handleInputChange}
                                            required
                                            autoComplete="off"
                                            placeholder="Project Name"
                                        />
                                    </div>

                                    {/* Customer */}
                                    <div className="form-group col-sm-6">
                                        <label>Customer: <span className="required">*</span></label>
                                        <select
                                            name="customer_id"
                                            className="form-control"
                                            value={formData.customer_id}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Customer</option>
                                            {Object.entries(syncData.customers || {}).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Contacts */}
                                    <div className="form-group col-sm-6">
                                        <label>Contacts: <span className="required">*</span></label>
                                        <Select
                                            isMulti
                                            options={[]}
                                            placeholder="Select Contacts"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    </div>

                                    {/* Members */}
                                    <div className="form-group col-sm-6">
                                        <label>Members: <span className="required">*</span></label>
                                        <Select
                                            isMulti
                                            options={memberOptions}
                                            value={selectedMembers}
                                            onChange={handleMembersChange}
                                            placeholder="Select Members"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    </div>

                                    {/* Calculate Progress */}
                                    <div className="form-group col-sm-6">
                                        <div className="custom-control custom-checkbox">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                name="calculate_progress_through_tasks"
                                                checked={formData.calculate_progress_through_tasks}
                                                onChange={handleInputChange}
                                                id="calculateProgressThroughTasks"
                                            />
                                            <label className="custom-control-label" htmlFor="calculateProgressThroughTasks">
                                                Calculate progress through tasks
                                            </label>
                                        </div>
                                    </div>

                                    {/* Progress Slider */}
                                    <div className="form-group col-sm-11">
                                        <label>Progress:</label>
                                        <input
                                            type="range"
                                            name="progress"
                                            className="form-control-range"
                                            min="0"
                                            max="100"
                                            value={formData.progress}
                                            onChange={handleProgressChange}
                                            id="projectProgress"
                                        />
                                    </div>
                                    <div className="form-group col-sm-1 d-flex align-items-center">
                                        <span className="projectProgressPercentage mt-4">{formData.progress}%</span>
                                    </div>

                                    {/* Billing Type */}
                                    <div className="form-group col-lg-6 col-sm-12">
                                        <label>Billing Type: <span className="required">*</span></label>
                                        <select
                                            name="billing_type"
                                            className="form-control"
                                            value={formData.billing_type}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Billing Type</option>
                                            {Object.entries(syncData.billingTypes || {}).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status */}
                                    <div className="form-group col-lg-6 col-sm-12">
                                        <label>Status: <span className="required">*</span></label>
                                        <select
                                            name="status"
                                            className="form-control"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Status</option>
                                            {Object.entries(syncData.status || {}).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Estimated Hours */}
                                    <div className="form-group col-sm-6">
                                        <label>Estimated Hours:</label>
                                        <div className="input-group">
                                            <div className="input-group-prepend">
                                                <div className="input-group-text">
                                                    <i className="fas fa-clock"></i>
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                name="estimated_hours"
                                                className="form-control"
                                                value={formData.estimated_hours}
                                                onChange={handleInputChange}
                                                placeholder="Estimated Hours"
                                            />
                                        </div>
                                    </div>

                                    {/* Start Date */}
                                    <div className="form-group col-sm-6">
                                        <label>Start Date: <span className="required">*</span></label>
                                        <div className="input-group">
                                            <div className="input-group-prepend">
                                                <div className="input-group-text">
                                                    <i className="fas fa-calendar-alt"></i>
                                                </div>
                                            </div>
                                            <input
                                                type="date"
                                                name="start_date"
                                                className="form-control"
                                                value={formData.start_date}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Deadline */}
                                    <div className="form-group col-sm-6">
                                        <label>Deadline: <span className="required">*</span></label>
                                        <div className="input-group">
                                            <div className="input-group-prepend">
                                                <div className="input-group-text">
                                                    <i className="fas fa-calendar-alt"></i>
                                                </div>
                                            </div>
                                            <input
                                                type="date"
                                                name="deadline"
                                                className="form-control"
                                                value={formData.deadline}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="form-group col-sm-6">
                                        <label>Tags:</label>
                                        <div className="input-group">
                                            <div style={{ flex: 1 }}>
                                                <Select
                                                    isMulti
                                                    options={Object.entries(syncData.tags || {}).map(([key, value]) => ({
                                                        value: parseInt(key),
                                                        label: value
                                                    }))}
                                                    placeholder="Select Tags"
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                />
                                            </div>
                                            <div className="input-group-append plus-icon-height">
                                                <div className="input-group-text">
                                                    <a href="#" title="Add Tag">
                                                        <i className="fa fa-plus"></i>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="form-group col-sm-12 mb-0">
                                        <label>Description:</label>
                                        <textarea
                                            name="description"
                                            className="form-control"
                                            rows="5"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                        ></textarea>
                                    </div>

                                    {/* Send Email */}
                                    <div className="form-group col-12">
                                        <div className="custom-control custom-checkbox">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                name="send_email"
                                                checked={formData.send_email}
                                                onChange={handleInputChange}
                                                id="sendEmail"
                                            />
                                            <label className="custom-control-label" htmlFor="sendEmail">
                                                Send project created email
                                            </label>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <div className="col-sm-12">
                                        <button type="submit" className="btn btn-primary">Save</button>
                                        <Link to="/projects" className="btn btn-secondary text-dark ml-2">Cancel</Link>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProjectCreate;
