
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MemberEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [permissions, setPermissions] = useState({});
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        facebook: '',
        linkedin: '',
        skype: '',
        default_language: '',
        staff_member: false,
        send_welcome_email: false, // Even if not shown in some UIs, edit_fields has it
        permissions: [],
        image: null
    });
    const [imagePreview, setImagePreview] = useState('/assets/img/infyom-logo.png');
    const [fetchLoading, setFetchLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Member
                const memberResponse = await api.get(`/members/${id}`);
                const member = memberResponse.data.data.member;

                // Fetch Permissions
                const permResponse = await api.get('/permissions');
                setPermissions(permResponse.data.data);

                // Set Form Data
                setFormData({
                    first_name: member.first_name || '',
                    last_name: member.last_name || '',
                    email: member.email || '',
                    phone: member.phone || '',
                    facebook: member.facebook || '',
                    linkedin: member.linkedin || '',
                    skype: member.skype || '',
                    default_language: member.default_language || '',
                    staff_member: member.staff_member || false,
                    send_welcome_email: member.send_welcome_email || false,
                    permissions: member.permissions || [],
                    image: null
                });

                // Set Image Preview
                if (member.image_url) {
                    setImagePreview(`${API_URL}${member.image_url}`);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
                if (error.response?.status === 404) {
                    navigate('/members');
                }
            } finally {
                setFetchLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            if (name === 'permissions') {
                const permissionId = parseInt(value);
                setFormData(prev => {
                    const newPermissions = checked
                        ? [...prev.permissions, permissionId]
                        : prev.permissions.filter(id => id !== permissionId);
                    return { ...prev, permissions: newPermissions };
                });
            } else {
                setFormData(prev => ({ ...prev, [name]: checked }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        setFormData(prev => ({ ...prev, phone: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'permissions') {
                formData.permissions.forEach(p => data.append('permissions[]', p));
            } else if (key === 'image') {
                if (formData.image) data.append('image', formData.image);
            } else if (key === 'staff_member' || key === 'send_welcome_email') {
                data.append(key, formData[key] ? '1' : '0');
            } else {
                data.append(key, formData[key] || '');
            }
        });

        // Method spoofing for PUT with FormData
        data.append('_method', 'PUT');

        try {
            await api.put(`/members/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/members');
        } catch (error) {
            console.error('Error updating member:', error);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
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

    return (
        <section className="section">
            <div className="section-header">
                <h1>Edit Member</h1>
                <div className="section-header-breadcrumb">
                    <Link to="/members" className="btn btn-primary form-btn float-right">Back</Link>
                </div>
            </div>
            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            {/* Row 1 */}
                            <div className="row">
                                <div className="form-group col-sm-6">
                                    <label>First Name:<span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        className="form-control"
                                        required
                                        placeholder="First Name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group col-sm-6">
                                    <label>Last Name:</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        className="form-control"
                                        placeholder="Last Name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Row 2 (Email & Phone) */}
                            <div className="row">
                                <div className="form-group col-sm-6">
                                    <label>Email:<span className="required">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        required
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group col-sm-6">
                                    <label>Phone:<span className="required">*</span></label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-control"
                                        required
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                    />
                                </div>
                            </div>

                            {/* Row 3 (Facebook & LinkedIn) */}
                            <div className="row">
                                <div className="form-group col-sm-6">
                                    <label>Facebook:</label>
                                    <input
                                        type="text"
                                        name="facebook"
                                        className="form-control"
                                        placeholder="Facebook URL"
                                        value={formData.facebook}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group col-sm-6">
                                    <label>LinkedIn:</label>
                                    <input
                                        type="text"
                                        name="linkedin"
                                        className="form-control"
                                        placeholder="LinkedIn URL"
                                        value={formData.linkedin}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Row 4 (Skype & Default Language) */}
                            <div className="row">
                                <div className="form-group col-sm-6">
                                    <label>Skype:</label>
                                    <input
                                        type="text"
                                        name="skype"
                                        className="form-control"
                                        placeholder="Skype URL"
                                        value={formData.skype}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group col-sm-6">
                                    <label>Default Language:</label>
                                    <select
                                        name="default_language"
                                        className="form-control"
                                        value={formData.default_language}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Language</option>
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                        <option value="ru">Russian</option>
                                        <option value="pt">Portuguese</option>
                                        <option value="ar">Arabic</option>
                                        <option value="zh">Chinese</option>
                                        <option value="tr">Turkish</option>
                                    </select>
                                </div>
                            </div>

                            {/* Row 5 (Security & Profile Image) */}
                            <div className="row">
                                <div className="form-group col-sm-6">
                                    <label>Member Security:</label>
                                    <div className="custom-control custom-checkbox">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            name="staff_member"
                                            id="isEditStaffMember"
                                            checked={formData.staff_member}
                                            onChange={handleChange}
                                        />
                                        <label className="custom-control-label" htmlFor="isEditStaffMember">Staff Member</label>
                                    </div>
                                    <div className="custom-control custom-checkbox">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            name="send_welcome_email"
                                            id="isEditSendWelcomeEmail"
                                            checked={formData.send_welcome_email}
                                            onChange={handleChange}
                                        />
                                        <label className="custom-control-label" htmlFor="isEditSendWelcomeEmail">Send Welcome Email</label>
                                    </div>
                                </div>
                                <div className="form-group col-lg-3 col-md-6 col-sm-12">
                                    <div className="row">
                                        <div className="col-6">
                                            <label className="profile-label-color">Profile:</label>
                                            <label className="image__file-upload text-white">
                                                Choose
                                                <input
                                                    type="file"
                                                    name="image"
                                                    id="logo"
                                                    className="d-none"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        </div>
                                        <div className="col-2 pl-0 mt-1">
                                            <img
                                                id="logoPreview"
                                                className="img-thumbnail thumbnail-preview"
                                                src={imagePreview}
                                                alt="Preview"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="row">
                                <div className="form-group col-sm-12">
                                    <label className="section-title">Permissions:</label>
                                </div>
                            </div>
                            <div className="row">
                                {Object.entries(permissions).map(([type, perms]) => (
                                    <div key={type} className="col-md-6 col-lg-4 col-xl-3 col-sm-4 permission-text">
                                        <div className="card-body">
                                            <div className="section-title mt-0">{type}</div>
                                            {perms.map(permission => (
                                                <div key={permission.id} className="custom-control custom-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        className="custom-control-input"
                                                        id={`customCheck${permission.id}`}
                                                        name="permissions"
                                                        value={permission.id}
                                                        checked={formData.permissions.includes(permission.id)}
                                                        onChange={handleChange}
                                                    />
                                                    <label className="custom-control-label" htmlFor={`customCheck${permission.id}`}>
                                                        {permission.display_name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Buttons */}
                            <div className="row">
                                <div className="form-group col-sm-12">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        id="btnSave"
                                        disabled={loading}
                                    >
                                        {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Save'} {loading && 'Processing...'}
                                    </button>
                                    <Link to="/members" className="btn btn-secondary text-dark ml-1">Cancel</Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MemberEdit;
