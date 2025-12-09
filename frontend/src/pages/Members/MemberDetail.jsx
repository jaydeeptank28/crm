/**
 * Member Detail Page - Replicates members/show.blade.php + members/views/member_details.blade.php
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to format date without date-fns
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    } catch (e) {
        return 'N/A';
    }
};

// Helper function to get relative time
const getRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 30) return `${diffDays} days ago`;
        if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        }
        const years = Math.floor(diffDays / 365);
        return `${years} year${years > 1 ? 's' : ''} ago`;
    } catch (e) {
        return 'N/A';
    }
};

const MemberDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('member_details');

    useEffect(() => {
        const fetchMember = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`/members/${id}`);
                console.log('Member API Response:', response.data);
                if (response.data.success) {
                    setMember(response.data.data.member);
                } else {
                    setError('Failed to fetch member data');
                }
            } catch (err) {
                console.error('Error fetching member:', err);
                setError(err.message || 'Error fetching member');
                if (err.response?.status === 404) {
                    navigate('/members');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchMember();
    }, [id, navigate]);

    // Loading state
    if (loading) {
        return (
            <section className="section">
                <div className="section-header item-align-right">
                    <h1>Member Details</h1>
                    <div className="section-header-breadcrumb float-right">
                        <Link to="/members" className="btn btn-primary form-btn">Back</Link>
                    </div>
                </div>
                <div className="section-body">
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                            <p className="mt-3">Loading member details...</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="section">
                <div className="section-header item-align-right">
                    <h1>Member Details</h1>
                    <div className="section-header-breadcrumb float-right">
                        <Link to="/members" className="btn btn-primary form-btn">Back</Link>
                    </div>
                </div>
                <div className="section-body">
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <div className="text-danger">
                                <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
                                <h4>Error Loading Member</h4>
                                <p>{error}</p>
                            </div>
                            <Link to="/members" className="btn btn-primary mt-3">Back to Members</Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // No member found
    if (!member) {
        return (
            <section className="section">
                <div className="section-header item-align-right">
                    <h1>Member Details</h1>
                    <div className="section-header-breadcrumb float-right">
                        <Link to="/members" className="btn btn-primary form-btn">Back</Link>
                    </div>
                </div>
                <div className="section-body">
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <p className="text-muted">Member not found</p>
                            <Link to="/members" className="btn btn-primary mt-3">Back to Members</Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section">
            <div className="section-header item-align-right">
                <h1>Member Details</h1>
                <div className="section-header-breadcrumb float-right">
                    {!member.is_admin && (
                        <Link to={`/members/${id}/edit`} className="btn btn-warning mr-2 form-btn">
                            Edit
                        </Link>
                    )}
                    <Link to="/members" className="btn btn-primary form-btn">
                        Back
                    </Link>
                </div>
            </div>
            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        {/* Tabs - matching PHP show_fields.blade.php */}
                        <ul className="nav nav-tabs mb-3" role="tablist">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'member_details' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('member_details')}
                                    type="button"
                                >
                                    Member Details
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('tasks')}
                                    type="button"
                                >
                                    Tasks
                                </button>
                            </li>
                        </ul>
                        <br />

                        {/* Tab Content */}
                        {activeTab === 'member_details' && (
                            <div className="tab-content">
                                {/* Row 1 - matching PHP member_details.blade.php */}
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Name:</label>
                                            <p>{member.full_name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Phone:</label>
                                            <p>{member.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Email:</label>
                                            <p>{member.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Status:</label>
                                            <p>{member.is_enable ? 'Active' : 'Deactive'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2 */}
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Staff Member:</label>
                                            <p>{member.is_admin ? 'No' : 'Yes'}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Send Welcome Email:</label>
                                            <p>No</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Facebook:</label>
                                            <p>{member.facebook || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Skype:</label>
                                            <p>{member.skype || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 3 */}
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>LinkedIn:</label>
                                            <p>{member.linkedin || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Default Language:</label>
                                            <p>{member.default_language || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Created On:</label>
                                            <br />
                                            <span
                                                data-toggle="tooltip"
                                                data-placement="right"
                                                title={formatDate(member.created_at)}
                                            >
                                                {getRelativeTime(member.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Last Updated:</label>
                                            <br />
                                            <span
                                                data-toggle="tooltip"
                                                data-placement="right"
                                                title={formatDate(member.updated_at)}
                                            >
                                                {getRelativeTime(member.updated_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 4 - Permissions */}
                                <div className="row">
                                    <div className="col-sm-12">
                                        <label className="section-title">Permissions:</label>
                                    </div>
                                    {member.permissionsGrouped && Object.keys(member.permissionsGrouped).length > 0 ? (
                                        Object.entries(member.permissionsGrouped).map(([type, perms]) => (
                                            <div key={type} className="col-md-6 col-lg-4 col-xl-3 col-sm-4 permission-text">
                                                <div className="card-body">
                                                    <div className="section-title mt-0">{type}</div>
                                                    {Array.isArray(perms) && perms.map((permission, idx) => (
                                                        <div key={permission.id || idx}>
                                                            <label>{permission.display_name || permission.name}</label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-12">
                                            <p className="text-muted">No permissions assigned</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div className="tab-content text-center py-5">
                                <p className="text-muted">No Tasks Found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MemberDetail;
