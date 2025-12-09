import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import RichTextEditor from '../../components/RichTextEditor/RichTextEditor';
import './Tasks.css';

const TaskCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [formData, setFormData] = useState({
        subject: '',
        hourly_rate: '',
        start_date: '',
        due_date: '',
        priority: '',
        member_id: '',
        related_to: '',
        owner_id: '',
        description: '',
        public: false,
        billable: false
    });

    // Constants matching PHP
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
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await api.get('/tasks/members');
            if (response.data.success) {
                setMembers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDescriptionChange = (content) => {
        setFormData(prev => ({ ...prev, description: content }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/tasks', {
                ...formData,
                status: 1 // Default to "Not Started"
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Task saved successfully.',
                    timer: 1500,
                    showConfirmButton: false
                });
                navigate('/tasks');
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to create task';
            Swal.fire('Error', msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="section">
            <div className="section-header">
                <h1>New Task</h1>
                <div className="section-header-breadcrumb">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} className="btn btn-primary form-btn float-right-mobile">
                        Back
                    </a>
                </div>
            </div>
            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        <form onSubmit={handleSubmit} id="createTasks">
                            <div className="row">
                                {/* Public Checkbox */}
                                <div className="form-group col-6 col-sm-3">
                                    <div className="custom-control custom-checkbox">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="customCheck"
                                            name="public"
                                            checked={formData.public}
                                            onChange={handleChange}
                                        />
                                        <label className="custom-control-label" htmlFor="customCheck">
                                            Public
                                        </label>
                                    </div>
                                </div>

                                {/* Billable Checkbox */}
                                <div className="form-group col-6 col-sm-4">
                                    <div className="custom-control custom-checkbox">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="customCheck1"
                                            name="billable"
                                            checked={formData.billable}
                                            onChange={handleChange}
                                        />
                                        <label className="custom-control-label" htmlFor="customCheck1">
                                            Billable
                                        </label>
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="form-group col-sm-6">
                                    <label htmlFor="subject">Subject:<span className="required">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Subject"
                                        autoComplete="off"
                                        required
                                    />
                                </div>

                                {/* Hourly Rate */}
                                <div className="form-group col-sm-6">
                                    <label htmlFor="hourly_rate">Hourly Rate:</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text">
                                                <i className="fas fa-dollar-sign"></i>
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control price-input"
                                            name="hourly_rate"
                                            value={formData.hourly_rate}
                                            onChange={handleChange}
                                            placeholder="Hourly Rate"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>

                                {/* Start Date */}
                                <div className="form-group col-sm-6">
                                    <label htmlFor="start_date">Start Date:</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text">
                                                <i className="fas fa-calendar-alt"></i>
                                            </div>
                                        </div>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            id="startDate"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleChange}
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>

                                {/* Due Date */}
                                <div className="form-group col-sm-6">
                                    <label htmlFor="due_date">Due Date:</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text">
                                                <i className="fas fa-calendar-alt"></i>
                                            </div>
                                        </div>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            id="dueDate"
                                            name="due_date"
                                            value={formData.due_date}
                                            onChange={handleChange}
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>

                                {/* Priority */}
                                <div className="form-group col-sm-6">
                                    <label htmlFor="priority">Priority:<span className="required">*</span></label>
                                    <select
                                        id="priorityId"
                                        className="form-control"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Priority</option>
                                        {Object.entries(priorities).map(([key, val]) => (
                                            <option key={key} value={key}>{val}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Assignee */}
                                <div className="form-group col-sm-6">
                                    <label htmlFor="member_id">Assignee:</label>
                                    <select
                                        id="memberId"
                                        className="form-control"
                                        name="member_id"
                                        value={formData.member_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Assignee</option>
                                        {members.map(m => (
                                            <option key={m.id} value={m.id}>{m.full_name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Related To */}
                                <div className="form-group col-sm-6">
                                    <label htmlFor="related_to">Related To:</label>
                                    <select
                                        id="relatedToId"
                                        className="form-control"
                                        name="related_to"
                                        value={formData.related_to}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Option</option>
                                        {Object.entries(relatedToOptions).map(([key, val]) => (
                                            <option key={key} value={key}>{val}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Description */}
                                <div className="form-group col-sm-12 mb-0">
                                    <label htmlFor="description">Description:</label>
                                    <RichTextEditor
                                        id="taskDescription"
                                        value={formData.description}
                                        onChange={handleDescriptionChange}
                                        placeholder="Description"
                                    />
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="row">
                                <div className="form-group col-sm-12">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        id="btnSave"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm"></span> Processing...
                                            </>
                                        ) : 'Save'}
                                    </button>
                                    <a
                                        href="#"
                                        className="btn btn-secondary text-dark ml-2"
                                        onClick={(e) => { e.preventDefault(); navigate(-1); }}
                                    >
                                        Cancel
                                    </a>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TaskCreate;
