import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';

const MemberCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [permissions, setPermissions] = useState({});
    const [errors, setErrors] = useState({}); // Validation errors state

    // Initial form state for reset
    const initialFormData = {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        facebook: '',
        linkedin: '',
        skype: '',
        default_language: '',
        staff_member: false,
        send_welcome_email: false,
        permissions: [],
        image: null
    };

    const [formData, setFormData] = useState(initialFormData);
    const [imagePreview, setImagePreview] = useState('/assets/img/infyom-logo.png');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    useEffect(() => {
        fetchCreateData();
    }, []);

    const fetchCreateData = async () => {
        try {
            const permResponse = await api.get('/permissions');
            if (permResponse.data.success) {
                setPermissions(permResponse.data.data.permissions || {});
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Reset form to initial state
    const resetForm = () => {
        setFormData(initialFormData);
        setImagePreview('/assets/img/infyom-logo.png');
        setErrors({});
        setPasswordVisible(false);
        setConfirmPasswordVisible(false);
        // Reset file input
        const fileInput = document.getElementById('logo');
        if (fileInput) fileInput.value = '';
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Clear error for this field when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }

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
        if (errors.phone) {
            setErrors(prev => ({ ...prev, phone: null }));
        }
    };

    // Client-side validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.first_name.trim()) {
            newErrors.first_name = 'First name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.password_confirmation) {
            newErrors.password_confirmation = 'Password confirmation is required';
        } else if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Passwords do not match';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

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

        try {
            const response = await api.post('/members', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Member created successfully',
                    timer: 2000,
                    showConfirmButton: false
                });

                // Reset form for next entry
                resetForm();

                // Navigate to members list
                navigate('/members');
            }
        } catch (error) {
            console.error('Error creating member:', error);

            // Handle validation errors from backend
            if (error.response?.status === 422 && error.response?.data?.errors) {
                setErrors(error.response.data.errors);

                // Show error toast
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: error.response.data.message || 'Please check the form for errors',
                    timer: 3000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.message || 'Failed to create member'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="section">
            <div className="section-header">
                <h1>New Member</h1>
                <div className="section-header-breadcrumb">
                    <Link to="/members" className="btn btn-primary form-btn float-right-mobile">Back</Link>
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
                                        className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                                        required
                                        autoComplete="off"
                                        placeholder="First Name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                    />
                                    {errors.first_name && <span className="text-danger">{errors.first_name}</span>}
                                </div>
                                <div className="form-group col-sm-6">
                                    <label>Last Name:</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        className="form-control"
                                        autoComplete="off"
                                        placeholder="Last Name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="row">
                                <div className="form-group col-sm-6">
                                    <label>Email:<span className="required">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        required
                                        autoComplete="off"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && <span className="text-danger">{errors.email}</span>}
                                </div>
                                <div className="form-group col-sm-3">
                                    <label>Password:<span className="required">*</span></label>
                                    <div className="input-group">
                                        <input
                                            type={passwordVisible ? "text" : "password"}
                                            name="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            required
                                            autoComplete="off"
                                            minLength="6"
                                            maxLength="10"
                                            placeholder="Password"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <div className="input-group-append" id="show_hide_password">
                                            <div className="input-group-text">
                                                <button
                                                    type="button"
                                                    className="btn btn-default password-show p-0"
                                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                                >
                                                    <i className={`fa fa-eye${!passwordVisible ? '-slash' : ''}`} aria-hidden="true"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {errors.password && <span className="text-danger">{errors.password}</span>}
                                </div>
                                <div className="form-group col-sm-3">
                                    <label>Confirm Password:<span className="required">*</span></label>
                                    <div className="input-group">
                                        <input
                                            type={confirmPasswordVisible ? "text" : "password"}
                                            name="password_confirmation"
                                            className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
                                            required
                                            autoComplete="off"
                                            minLength="6"
                                            maxLength="10"
                                            placeholder="Confirm Password"
                                            value={formData.password_confirmation}
                                            onChange={handleChange}
                                        />
                                        <div className="input-group-append" id="show_hide_cPassword">
                                            <div className="input-group-text">
                                                <button
                                                    type="button"
                                                    className="btn btn-default cPassword-show p-0"
                                                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                                >
                                                    <i className={`fa fa-eye${!confirmPasswordVisible ? '-slash' : ''}`} aria-hidden="true"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {errors.password_confirmation && <span className="text-danger">{errors.password_confirmation}</span>}
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="row">
                                <div className="form-group col-sm-6">
                                    <label>Phone:<span className="required">*</span></label><br/>
                                    <input
                                        type="tel"
                                        name="phone"
                                        id="phoneNumber"
                                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                        required
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                    />
                                    <span id="valid-msg" className="hide">Valid Number</span>
                                    <span id="error-msg" className="hide"></span>
                                    {errors.phone && <span className="text-danger">{errors.phone}</span>}
                                </div>
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
                            </div>

                            {/* Row 4 */}
                            <div className="row">
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
                            </div>

                            {/* Row 5 */}
                            <div className="row">
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
                                <div className="form-group col-sm-6">
                                    <label>Member Security:</label>
                                    <div className="custom-control custom-checkbox">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            name="staff_member"
                                            id="staffMember"
                                            checked={formData.staff_member}
                                            onChange={handleChange}
                                        />
                                        <label className="custom-control-label" htmlFor="staffMember">Staff Member</label>
                                    </div>
                                    <div className="custom-control custom-checkbox">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            name="send_welcome_email"
                                            id="sendWelcomeEmail"
                                            checked={formData.send_welcome_email}
                                            onChange={handleChange}
                                        />
                                        <label className="custom-control-label" htmlFor="sendWelcomeEmail">Send Welcome Email</label>
                                    </div>
                                </div>
                            </div>

                            {/* Row 6 - Profile Image */}
                            <div className="row">
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

export default MemberCreate;
