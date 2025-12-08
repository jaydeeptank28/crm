/**
 * Member Detail Page - Replicates members/show.blade.php + members/views/member_details.blade.php
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MemberDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('member_details');

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const response = await api.get(`/members/${id}`);
                if (response.data.success) {
                    setMember(response.data.data.member);
                }
            } catch (error) {
                console.error('Error fetching member:', error);
                if (error.response?.status === 404) {
                    navigate('/members');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchMember();
    }, [id, navigate]);

    if (loading) {
        return (
            <section className="section">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            </section>
        );
    }

    if (!member) return null;

    return (
        <section className="section">
            <div className="section-header item-align-right">
                <h1>Member Details</h1>
                <div className="section-header-breadcrumb float-right">
                    <Link to={`/members/${id}/edit`} className="btn btn-warning mr-2 form-btn">
                        Edit
                    </Link>
                    <Link to="/members" className="btn btn-primary form-btn">
                        Back
                    </Link>
                </div>
            </div>
            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        {/* Tabs */}
                        <ul className="nav nav-tabs mb-3" role="tablist">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'member_details' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('member_details')}
                                >
                                    Member Details
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('tasks')}
                                >
                                    Tasks
                                </button>
                            </li>
                        </ul>
                        <br />

                        {/* Content */}
                        {activeTab === 'member_details' && (
                            <div className="tab-context">
                                {/* Row 1 */}
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Name:</label>
                                            <p dangerouslySetInnerHTML={{ __html: member.full_name }}></p>
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
                                            <p>{member.email}</p>
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
                                            <p>{member.role_names?.includes('Staff Member') || !member.is_admin ? 'Yes' : 'No'}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Send Welcome Email:</label>
                                            <p>No</p> {/* This field isn't returned by API usually, defaulted to No */}
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
                                            <span title={format(new Date(member.created_at), 'do MMM, yyyy')}>
                                                {format(new Date(member.created_at), 'do MMM, yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Last Updated:</label>
                                            <br />
                                            <span title={format(new Date(member.updated_at), 'do MMM, yyyy')}>
                                                {format(new Date(member.updated_at), 'do MMM, yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 4 - Permissions */}
                                <div className="row">
                                    <div className="col-sm-12">
                                        <label className="section-title">Permissions:</label>
                                    </div>
                                    {member.permissionsGrouped && Object.entries(member.permissionsGrouped).map(([type, perms]) => (
                                        <div key={type} className="col-md-6 col-lg-4 col-xl-3 col-sm-4 permission-text">
                                            <div className="card-body">
                                                <div className="section-title mt-0">{type}</div>
                                                {perms.map(permission => (
                                                    <div key={permission.id}>
                                                        <label>{permission.display_name || permission.name}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div className="text-center py-5">
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
