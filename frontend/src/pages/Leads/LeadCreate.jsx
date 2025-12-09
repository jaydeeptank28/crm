import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './Leads.css';

const LeadCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        company_name: '',
        status_id: '',
        source_id: '',
        assign_to: '',
        position: '',
        website: '',
        phone: '',
        description: '',
        default_language: '',
        estimate_budget: '',
        country: '',
        public: false,
        contacted_today: true,
        tags: []
    });
    const [errors, setErrors] = useState({});
    const [formOptions, setFormOptions] = useState({
        statuses: [],
        sources: [],
        members: [],
        countries: [],
        tags: [],
        languages: {}
    });

    // Modals
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showSourceModal, setShowSourceModal] = useState(false);
    const [newStatus, setNewStatus] = useState({ name: '', color: '#6777ef', order: 0 });
    const [newSource, setNewSource] = useState({ name: '' });

    useEffect(() => {
        fetchFormData();
    }, []);

    const fetchFormData = async () => {
        try {
            const response = await api.get('/leads/form-data');
            if (response.data.success) {
                setFormOptions(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching form data:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when field is modified
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleTagChange = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(parseInt(options[i].value));
            }
        }
        setFormData(prev => ({ ...prev, tags: selected }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await api.post('/leads', formData);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Lead created successfully!',
                    timer: 1500,
                    showConfirmButton: false
                });
                navigate('/leads');
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                Swal.fire('Error', error.response?.data?.message || 'Failed to create lead', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddStatus = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/leads/statuses', newStatus);
            if (response.data.success) {
                setFormOptions(prev => ({
                    ...prev,
                    statuses: [...prev.statuses, response.data.data]
                }));
                setFormData(prev => ({ ...prev, status_id: response.data.data.id }));
                setShowStatusModal(false);
                setNewStatus({ name: '', color: '#6777ef', order: 0 });
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to create status', 'error');
        }
    };

    const handleAddSource = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/leads/sources', newSource);
            if (response.data.success) {
                setFormOptions(prev => ({
                    ...prev,
                    sources: [...prev.sources, response.data.data]
                }));
                setFormData(prev => ({ ...prev, source_id: response.data.data.id }));
                setShowSourceModal(false);
                setNewSource({ name: '' });
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to create source', 'error');
        }
    };

    return (
        <section className="section">
            <div className="section-header">
                <h1>New Lead</h1>
                <div className="section-header-breadcrumb">
                    <div className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></div>
                    <div className="breadcrumb-item"><Link to="/leads">Leads</Link></div>
                    <div className="breadcrumb-item active">New Lead</div>
                </div>
            </div>

            <div className="section-body">
                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="card-body">
                            <div className="row">
                                {/* Left Column */}
                                <div className="col-md-6 col-sm-12">
                                    <div className="form-group col-sm-12">
                                        <label htmlFor="name">Name:<span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Name"
                                            required
                                            autoComplete="off"
                                        />
                                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                    </div>

                                    <div className="form-group col-sm-12">
                                        <label htmlFor="company_name">Company Name:<span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="company_name"
                                            id="company_name"
                                            className={`form-control ${errors.company_name ? 'is-invalid' : ''}`}
                                            value={formData.company_name}
                                            onChange={handleChange}
                                            placeholder="Company Name"
                                            required
                                            autoComplete="off"
                                        />
                                        {errors.company_name && <div className="invalid-feedback">{errors.company_name}</div>}
                                    </div>

                                    <div className="form-group col-sm-12">
                                        <label htmlFor="status_id">Status:<span className="required">*</span></label>
                                        <div className="input-group">
                                            <select
                                                name="status_id"
                                                id="statusId"
                                                className={`form-control ${errors.status_id ? 'is-invalid' : ''}`}
                                                value={formData.status_id}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Status</option>
                                                {formOptions.statuses.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                            <div className="input-group-append plus-icon-height">
                                                <div className="input-group-text">
                                                    <a href="#" onClick={(e) => { e.preventDefault(); setShowStatusModal(true); }}>
                                                        <i className="fa fa-plus"></i>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        {errors.status_id && <div className="text-danger small">{errors.status_id}</div>}
                                    </div>

                                    <div className="form-group col-sm-12">
                                        <label htmlFor="assign_to">Member:</label>
                                        <select
                                            name="assign_to"
                                            id="memberId"
                                            className="form-control"
                                            value={formData.assign_to}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Member</option>
                                            {formOptions.members.map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group col-sm-12">
                                        <label htmlFor="website">Website:</label>
                                        <input
                                            type="text"
                                            name="website"
                                            id="website"
                                            className="form-control"
                                            value={formData.website}
                                            onChange={handleChange}
                                            placeholder="Website"
                                            autoComplete="off"
                                        />
                                    </div>

                                    <div className="form-group col-sm-12">
                                        <label htmlFor="tags">Tags:</label>
                                        <select
                                            name="tags"
                                            id="leadTagID"
                                            className="form-control"
                                            multiple
                                            value={formData.tags}
                                            onChange={handleTagChange}
                                            style={{ height: '100px' }}
                                        >
                                            {formOptions.tags.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="col-md-6 col-sm-12">
                                    <div className="form-group col-sm-12">
                                        <label htmlFor="source_id">Source:<span className="required">*</span></label>
                                        <div className="input-group">
                                            <select
                                                name="source_id"
                                                id="sourceId"
                                                className={`form-control ${errors.source_id ? 'is-invalid' : ''}`}
                                                value={formData.source_id}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Source</option>
                                                {formOptions.sources.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                            <div className="input-group-append plus-icon-height">
                                                <div className="input-group-text">
                                                    <a href="#" onClick={(e) => { e.preventDefault(); setShowSourceModal(true); }}>
                                                        <i className="fa fa-plus"></i>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        {errors.source_id && <div className="text-danger small">{errors.source_id}</div>}
                                    </div>

                                    <div className="form-group col-sm-12">
                                        <label htmlFor="position">Position:</label>
                                        <input
                                            type="text"
                                            name="position"
                                            id="position"
                                            className="form-control"
                                            value={formData.position}
                                            onChange={handleChange}
                                            placeholder="Position"
                                            autoComplete="off"
                                        />
                                    </div>

                                    <div className="form-group col-sm-12">
                                        <label htmlFor="estimate_budget">Estimate Budget:</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="estimate_budget"
                                            id="estimate_budget"
                                            className="form-control price-input"
                                            value={formData.estimate_budget}
                                            onChange={handleChange}
                                            placeholder="Estimate Budget"
                                            autoComplete="off"
                                        />
                                    </div>

                                    <div className="form-group col-sm-12">
                                        <label htmlFor="phone">Phone:</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            id="phoneNumber"
                                            className="form-control"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Phone"
                                        />
                                    </div>

                                    <div className="form-group col-sm-12">
                                        <label htmlFor="country">Country:</label>
                                        <select
                                            name="country"
                                            id="countryId"
                                            className="form-control"
                                            value={formData.country}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Country</option>
                                            {formOptions.countries.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group col-sm-12">
                                        <label htmlFor="default_language">Default Language:</label>
                                        <select
                                            name="default_language"
                                            id="languageId"
                                            className="form-control"
                                            value={formData.default_language}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Language</option>
                                            {Object.entries(formOptions.languages || {}).map(([code, name]) => (
                                                <option key={code} value={code}>{name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-group col-sm-12">
                                        <label htmlFor="description">Description:</label>
                                        <textarea
                                            name="description"
                                            id="leadDescription"
                                            className="form-control"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Description"
                                            rows="4"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="row ml-2">
                                <div className="form-group col-sm-2">
                                    <div className="custom-control custom-checkbox">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="check"
                                            name="public"
                                            checked={formData.public}
                                            onChange={handleChange}
                                        />
                                        <label className="custom-control-label" htmlFor="check">Public</label>
                                    </div>
                                </div>
                                <div className="form-group col-sm-3">
                                    <div className="custom-control custom-checkbox">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="checkContact"
                                            name="contacted_today"
                                            checked={formData.contacted_today}
                                            onChange={handleChange}
                                        />
                                        <label className="custom-control-label" htmlFor="checkContact">Contacted Today</label>
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="row ml-2">
                                <div className="form-group col-sm-12">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        id="btnSave"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm"></span> Processing...</>
                                        ) : 'Save'}
                                    </button>
                                    <Link to="/leads" className="btn btn-secondary text-dark ml-2">Cancel</Link>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Add Status Modal */}
            {showStatusModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Lead Status</h5>
                                <button type="button" className="close" onClick={() => setShowStatusModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleAddStatus}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Name<span className="required">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newStatus.name}
                                            onChange={(e) => setNewStatus(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Color</label>
                                        <input
                                            type="color"
                                            className="form-control"
                                            value={newStatus.color}
                                            onChange={(e) => setNewStatus(prev => ({ ...prev, color: e.target.value }))}
                                            style={{ height: '40px' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Order<span className="required">*</span></label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={newStatus.order}
                                            onChange={(e) => setNewStatus(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Source Modal */}
            {showSourceModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Lead Source</h5>
                                <button type="button" className="close" onClick={() => setShowSourceModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleAddSource}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Name<span className="required">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newSource.name}
                                            onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowSourceModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default LeadCreate;
