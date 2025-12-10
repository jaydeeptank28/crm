import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Select from 'react-select';

const CustomerCreate = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('details');
    const [syncData, setSyncData] = useState({
        customerGroups: {},
        countries: {},
        languages: {},
        currencies: {}
    });

    const [formData, setFormData] = useState({
        company_name: '',
        vat_number: '',
        phone: '',
        website: '',
        currency: '',
        country: '',
        default_language: '',
        groups: [],
        billingAddress: {
            street1: '',
            street2: '',
            city: '',
            state: '',
            zip: '',
            country: ''
        },
        shippingAddress: {
            street1: '',
            street2: '',
            city: '',
            state: '',
            zip: '',
            country: ''
        }
    });

    useEffect(() => {
        fetchSyncData();
    }, []);

    const fetchSyncData = async () => {
        try {
            const response = await api.get('/customers/sync-data');
            if (response.data.success) {
                setSyncData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching sync data:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddressChange = (type, field, value) => {
        setFormData(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }));
    };

    const handleGroupChange = (selectedOptions) => {
        const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setFormData(prev => ({
            ...prev,
            groups: selectedIds
        }));
    };

    const copyBillingToShipping = (e) => {
        if (e.target.checked) {
            setFormData(prev => ({
                ...prev,
                shippingAddress: { ...prev.billingAddress }
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post('/customers', formData);
            if (response.data.success) {
                Swal.fire('Success', 'Customer saved successfully.', 'success');
                navigate('/customers');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Error creating customer';
            Swal.fire('Error', message, 'error');
        }
    };

    return (
        <section className="section">
            <div className="section-header">
                <h1>New Customer</h1>
                <div className="section-header-breadcrumb">
                    <Link to="/customers" className="btn btn-primary">
                        <i className="fas fa-arrow-left"></i> Back
                    </Link>
                </div>
            </div>
            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            {/* Tabs */}
                            <ul className="nav nav-pills mb-3" role="tablist">
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); setActiveTab('details'); }}
                                    >
                                        Customer Details
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${activeTab === 'address' ? 'active' : ''}`}
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); setActiveTab('address'); }}
                                    >
                                        Address
                                    </a>
                                </li>
                            </ul>

                            <div className="tab-content">
                                {/* Customer Details Tab */}
                                {activeTab === 'details' && (
                                    <div className="tab-pane fade show active">
                                        <div className="row">
                                            <div className="form-group col-md-6">
                                                <label>Company Name: <span className="required">*</span></label>
                                                <input
                                                    type="text"
                                                    name="company_name"
                                                    className="form-control"
                                                    value={formData.company_name}
                                                    onChange={handleInputChange}
                                                    required
                                                    autoFocus
                                                    placeholder="Company Name"
                                                />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>VAT Number:</label>
                                                <input
                                                    type="text"
                                                    name="vat_number"
                                                    className="form-control"
                                                    value={formData.vat_number}
                                                    onChange={handleInputChange}
                                                    placeholder="VAT Number"
                                                />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Website:</label>
                                                <input
                                                    type="url"
                                                    name="website"
                                                    className="form-control"
                                                    value={formData.website}
                                                    onChange={handleInputChange}
                                                    placeholder="Website"
                                                />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Phone:</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    className="form-control"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="Phone"
                                                />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Currency:</label>
                                                <select
                                                    name="currency"
                                                    className="form-control"
                                                    value={formData.currency}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Select Currency</option>
                                                    {Object.entries(syncData.currencies || {}).map(([key, value]) => (
                                                        <option key={key} value={key}>{value}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Country:</label>
                                                <select
                                                    name="country"
                                                    className="form-control"
                                                    value={formData.country}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Select Country</option>
                                                    {Object.entries(syncData.countries || {}).map(([key, value]) => (
                                                        <option key={key} value={key}>{value}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Default Language:</label>
                                                <select
                                                    name="default_language"
                                                    className="form-control"
                                                    value={formData.default_language}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Select Language</option>
                                                    {Object.entries(syncData.languages || {}).map(([key, value]) => (
                                                        <option key={key} value={key}>{value}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Groups:</label>
                                                <div className="input-group">
                                                    <div style={{ flex: 1 }}>
                                                        <Select
                                                            isMulti
                                                            options={Object.entries(syncData.customerGroups || {}).map(([key, value]) => ({
                                                                value: parseInt(key),
                                                                label: value
                                                            }))}
                                                            value={Object.entries(syncData.customerGroups || {})
                                                                .filter(([key]) => formData.groups.includes(parseInt(key)))
                                                                .map(([key, value]) => ({ value: parseInt(key), label: value }))}
                                                            onChange={handleGroupChange}
                                                            placeholder="Select Groups"
                                                            className="react-select-container"
                                                            classNamePrefix="react-select"
                                                        />
                                                    </div>
                                                    <div className="input-group-append">
                                                        <Link to="/customer-groups" className="input-group-text plus-icon-height" title="Add Customer Group">
                                                            <i className="fa fa-plus"></i>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Address Tab */}
                                {activeTab === 'address' && (
                                    <div className="tab-pane fade show active">
                                        <div className="row">
                                            {/* Billing Address */}
                                            <div className="col-md-6">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h4>Billing Address</h4>
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label>Street:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={formData.billingAddress.street1}
                                                        onChange={(e) => handleAddressChange('billingAddress', 'street1', e.target.value)}
                                                        placeholder="Street"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>City:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={formData.billingAddress.city}
                                                        onChange={(e) => handleAddressChange('billingAddress', 'city', e.target.value)}
                                                        placeholder="City"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Zip Code:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={formData.billingAddress.zip}
                                                        onChange={(e) => handleAddressChange('billingAddress', 'zip', e.target.value)}
                                                        placeholder="Zip Code"
                                                        maxLength="6"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>State:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={formData.billingAddress.state}
                                                        onChange={(e) => handleAddressChange('billingAddress', 'state', e.target.value)}
                                                        placeholder="State"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Country:</label>
                                                    <select
                                                        className="form-control"
                                                        value={formData.billingAddress.country}
                                                        onChange={(e) => handleAddressChange('billingAddress', 'country', e.target.value)}
                                                    >
                                                        <option value="">Select Country</option>
                                                        {Object.entries(syncData.countries || {}).map(([key, value]) => (
                                                            <option key={key} value={key}>{value}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Shipping Address */}
                                            <div className="col-md-6">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h4>Shipping Address</h4>
                                                        <div className="card-header-action">
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    onChange={copyBillingToShipping}
                                                                    className="mr-1"
                                                                />
                                                                Copy Billing Address
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label>Street:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={formData.shippingAddress.street1}
                                                        onChange={(e) => handleAddressChange('shippingAddress', 'street1', e.target.value)}
                                                        placeholder="Street"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>City:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={formData.shippingAddress.city}
                                                        onChange={(e) => handleAddressChange('shippingAddress', 'city', e.target.value)}
                                                        placeholder="City"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Zip Code:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={formData.shippingAddress.zip}
                                                        onChange={(e) => handleAddressChange('shippingAddress', 'zip', e.target.value)}
                                                        placeholder="Zip Code"
                                                        maxLength="6"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>State:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={formData.shippingAddress.state}
                                                        onChange={(e) => handleAddressChange('shippingAddress', 'state', e.target.value)}
                                                        placeholder="State"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Country:</label>
                                                    <select
                                                        className="form-control"
                                                        value={formData.shippingAddress.country}
                                                        onChange={(e) => handleAddressChange('shippingAddress', 'country', e.target.value)}
                                                    >
                                                        <option value="">Select Country</option>
                                                        {Object.entries(syncData.countries || {}).map(([key, value]) => (
                                                            <option key={key} value={key}>{value}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit Buttons */}
                            <div className="row mt-3">
                                <div className="form-group col-sm-12">
                                    <button type="submit" className="btn btn-primary">Save</button>
                                    <Link to="/customers" className="btn btn-secondary text-dark ml-2">Cancel</Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CustomerCreate;
