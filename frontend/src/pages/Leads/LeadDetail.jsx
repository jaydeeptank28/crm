import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import './Leads.css';

const LeadDetail = () => {
    const { id } = useParams();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        fetchLead();
    }, [id]);

    const fetchLead = async () => {
        try {
            const response = await api.get(`/leads/${id}`);
            if (response.data.success) {
                setLead(response.data.data.lead);
            }
        } catch (error) {
            console.error('Error fetching lead:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('en-US', options);
    };

    const timeAgo = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 30) return `${diffDays} days ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    const LANGUAGES = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'ru': 'Russian',
        'pt': 'Portuguese',
        'ar': 'Arabic',
        'zh': 'Chinese',
        'tr': 'Turkish'
    };

    if (loading) {
        return (
            <section className="section">
                <div className="section-header">
                    <h1>Lead Details</h1>
                </div>
                <div className="section-body">
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <div className="spinner-border text-primary"></div>
                            <p className="mt-3">Loading...</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!lead) {
        return (
            <section className="section">
                <div className="section-header">
                    <h1>Lead Details</h1>
                </div>
                <div className="section-body">
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <p className="text-danger">Lead not found</p>
                            <Link to="/leads" className="btn btn-primary">Back to Leads</Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section">
            <div className="section-header item-align-right">
                <h1>Lead Details</h1>
                <div className="section-header-breadcrumb float-right">
                    {!lead.lead_convert_customer && (
                        <a href="#" className="btn btn-info mr-2 form-btn" id="leadConvertToCustomer">
                            Convert to Customer
                        </a>
                    )}
                </div>
                <div className="float-right">
                    <Link to={`/leads/${id}/edit`} className="btn btn-warning mr-2 form-btn">Edit</Link>
                    <Link to="/leads" className="btn btn-primary form-btn">Back</Link>
                </div>
            </div>

            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        {/* Tabs */}
                        <ul className="nav nav-tabs mb-3">
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setActiveTab('details'); }}
                                >
                                    Lead Details
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${activeTab === 'notes' ? 'active' : ''}`}
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setActiveTab('notes'); }}
                                >
                                    Notes
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${activeTab === 'proposals' ? 'active' : ''}`}
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setActiveTab('proposals'); }}
                                >
                                    Proposals
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${activeTab === 'reminders' ? 'active' : ''}`}
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setActiveTab('reminders'); }}
                                >
                                    Reminders
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`}
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setActiveTab('tasks'); }}
                                >
                                    Tasks
                                </a>
                            </li>
                        </ul>

                        {/* Tab Content */}
                        {activeTab === 'details' && (
                            <div className="tab-content">
                                <div className="row">
                                    {lead.public === 1 && (
                                        <div className="form-group col-sm-12">
                                            <div className="custom-control custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id="check"
                                                    checked
                                                    disabled
                                                />
                                                <label className="custom-control-label" htmlFor="check">Public</label>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-group col-sm-4">
                                        <label className="font-weight-bold">Name:</label>
                                        <p className="leadName">{lead.name}</p>
                                    </div>

                                    <div className="form-group col-sm-4">
                                        <label className="font-weight-bold">Company Name:</label>
                                        <p className="companyName">{lead.company_name}</p>
                                    </div>

                                    <div className="form-group col-sm-4">
                                        <label className="font-weight-bold">Status:</label>
                                        <p>
                                            <span
                                                className="badge text-white"
                                                style={{ backgroundColor: lead.leadStatus?.color || '#6777ef' }}
                                            >
                                                {lead.leadStatus?.name || 'N/A'}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="form-group col-sm-4">
                                        <label className="font-weight-bold">Source:</label>
                                        <p>{lead.leadSource?.name || 'N/A'}</p>
                                    </div>

                                    <div className="form-group col-sm-4">
                                        <label className="font-weight-bold">Estimate Budget:</label>
                                        <p>
                                            {lead.estimate_budget ? (
                                                <><i className="fas fa-dollar-sign"></i> {parseFloat(lead.estimate_budget).toFixed(2)}</>
                                            ) : 'N/A'}
                                        </p>
                                    </div>

                                    <div className="form-group col-sm-4">
                                        <label className="font-weight-bold">Member:</label>
                                        <p>
                                            {lead.assignedTo ? (
                                                <Link to={`/members/${lead.assign_to}`} className="anchor-underline">
                                                    {lead.assignedTo.full_name}
                                                </Link>
                                            ) : 'N/A'}
                                        </p>
                                    </div>

                                    <div className="form-group col-sm-4">
                                        <label className="font-weight-bold">Tags:</label>
                                        <p>
                                            {lead.tags && lead.tags.length > 0 ? (
                                                lead.tags.map(tag => (
                                                    <span key={tag.id} className="badge border border-secondary mb-1 mr-1">
                                                        {tag.name}
                                                    </span>
                                                ))
                                            ) : 'N/A'}
                                        </p>
                                    </div>

                                    <div className="form-group col-sm-4">
                                        <label className="font-weight-bold">Position:</label>
                                        <p>{lead.position || 'N/A'}</p>
                                    </div>

                                    <div className="form-group col-sm-4">
                                        <label className="font-weight-bold">Website:</label>
                                        <p>
                                            {lead.website ? (
                                                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="anchor-underline">
                                                    {lead.website}
                                                </a>
                                            ) : 'N/A'}
                                        </p>
                                    </div>

                                    <div className="form-group col-sm-4">
                                        <label className="font-weight-bold">Phone:</label>
                                        <p>{lead.phone || 'N/A'}</p>
                                    </div>

                                    <div className="form-group col-sm-4">
                                        <label className="font-weight-bold">Country:</label>
                                        <p>{lead.countryName || 'N/A'}</p>
                                    </div>

                                    <div className="form-group col-sm-4">
                                        <label className="font-weight-bold">Default Language:</label>
                                        <p>{lead.default_language ? LANGUAGES[lead.default_language] : 'N/A'}</p>
                                    </div>

                                    <div className="form-group col-sm-4">
                                        <label className="font-weight-bold">Date Contacted:</label>
                                        <p>{lead.date_contacted ? formatDateTime(lead.date_contacted) : 'N/A'}</p>
                                    </div>

                                    <div className="form-group col-sm-4">
                                        <label className="font-weight-bold">Created On:</label>
                                        <p>
                                            <span title={formatDate(lead.created_at)}>
                                                {timeAgo(lead.created_at)}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="form-group col-sm-4">
                                        <label className="font-weight-bold">Last Updated:</label>
                                        <p>
                                            <span title={formatDate(lead.updated_at)}>
                                                {timeAgo(lead.updated_at)}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="form-group col-sm-12">
                                        <label className="font-weight-bold">Description:</label>
                                        <br />
                                        {lead.description ? (
                                            <span dangerouslySetInnerHTML={{ __html: lead.description.replace(/\n/g, '<br/>') }} />
                                        ) : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notes' && (
                            <div className="tab-content">
                                <div className="text-center py-5">
                                    <p className="text-muted">Notes feature coming soon...</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'proposals' && (
                            <div className="tab-content">
                                <div className="text-center py-5">
                                    <p className="text-muted">Proposals feature coming soon...</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reminders' && (
                            <div className="tab-content">
                                <div className="text-center py-5">
                                    <p className="text-muted">Reminders feature coming soon...</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div className="tab-content">
                                <div className="text-center py-5">
                                    <p className="text-muted">Tasks feature coming soon...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LeadDetail;
