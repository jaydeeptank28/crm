import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Select from 'react-select';

const CustomerEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('details');
    const [loading, setLoading] = useState(true);
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
            city: '',
            state: '',
            zip: '',
            country: ''
        },
        shippingAddress: {
            street1: '',
            city: '',
            state: '',
            zip: '',
            country: ''
        }
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [syncResponse, customerResponse] = await Promise.all([
                api.get('/customers/sync-data'),
                api.get(`/customers/${id}/edit`)
            ]);

            if (syncResponse.data.success) {
                setSyncData(syncResponse.data.data);
            }

            if (customerResponse.data.success) {
                const { customer, billingAddress, shippingAddress, selectedGroups } = customerResponse.data.data;
                setFormData({
                    company_name: customer.company_name || '',
                    vat_number: customer.vat_number || '',
                    phone: customer.phone || '',
                    website: customer.website || '',
                    currency: customer.currency || '',
                    country: customer.country || '',
                    default_language: customer.default_language || '',
                    groups: selectedGroups || [],
                    billingAddress: billingAddress || { street1: '', city: '', state: '', zip: '', country: '' },
                    shippingAddress: shippingAddress || { street1: '', city: '', state: '', zip: '', country: '' }
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            Swal.fire('Error', 'Failed to load customer data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (type, field, value) => {
        setFormData(prev => ({
            ...prev,
            [type]: { ...prev[type], [field]: value }
        }));
    };

    const handleGroupChange = (selectedOptions) => {
        const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setFormData(prev => ({ ...prev, groups: selectedIds }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/customers/${id}`, formData);
            if (response.data.success) {
                Swal.fire('Success', 'Customer updated successfully.', 'success');
                navigate('/customers');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Error updating customer';
            Swal.fire('Error', message, 'error');
        }
    };

    if (loading) {
        return <div className="section"><div className="text-center py-5">Loading...</div></div>;
    }

    return (
        <section className="section">
            <div className="section-header">
                <h1>Edit Customer</h1>
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
                            <ul className="nav nav-pills mb-3" role="tablist">
                                <li className="nav-item">
                                    <a className={`nav-link ${activeTab === 'details' ? 'active' : ''}`} href="#"
                                        onClick={(e) => { e.preventDefault(); setActiveTab('details'); }}>Customer Details</a>
                                </li>
                                <li className="nav-item">
                                    <a className={`nav-link ${activeTab === 'address' ? 'active' : ''}`} href="#"
                                        onClick={(e) => { e.preventDefault(); setActiveTab('address'); }}>Address</a>
                                </li>
                            </ul>

                            <div className="tab-content">
                                {activeTab === 'details' && (
                                    <div className="tab-pane fade show active">
                                        <div className="row">
                                            <div className="form-group col-md-6">
                                                <label>Company Name: <span className="required">*</span></label>
                                                <input type="text" name="company_name" className="form-control"
                                                    value={formData.company_name} onChange={handleInputChange} required placeholder="Company Name" />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>VAT Number:</label>
                                                <input type="text" name="vat_number" className="form-control"
                                                    value={formData.vat_number} onChange={handleInputChange} placeholder="VAT Number" />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Website:</label>
                                                <input type="url" name="website" className="form-control"
                                                    value={formData.website} onChange={handleInputChange} placeholder="Website" />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Phone:</label>
                                                <input type="tel" name="phone" className="form-control"
                                                    value={formData.phone} onChange={handleInputChange} placeholder="Phone" />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Currency:</label>
                                                <select name="currency" className="form-control" value={formData.currency} onChange={handleInputChange}>
                                                    <option value="">Select Currency</option>
                                                    {Object.entries(syncData.currencies || {}).map(([key, value]) => (
                                                        <option key={key} value={key}>{value}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Country:</label>
                                                <select name="country" className="form-control" value={formData.country} onChange={handleInputChange}>
                                                    <option value="">Select Country</option>
                                                    {Object.entries(syncData.countries || {}).map(([key, value]) => (
                                                        <option key={key} value={key}>{value}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Default Language:</label>
                                                <select name="default_language" className="form-control" value={formData.default_language} onChange={handleInputChange}>
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

                                {activeTab === 'address' && (
                                    <div className="tab-pane fade show active">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="card"><div className="card-header"><h4>Billing Address</h4></div></div>
                                                <div className="form-group">
                                                    <label>Street:</label>
                                                    <input type="text" className="form-control" value={formData.billingAddress.street1 || ''}
                                                        onChange={(e) => handleAddressChange('billingAddress', 'street1', e.target.value)} placeholder="Street" />
                                                </div>
                                                <div className="form-group">
                                                    <label>City:</label>
                                                    <input type="text" className="form-control" value={formData.billingAddress.city || ''}
                                                        onChange={(e) => handleAddressChange('billingAddress', 'city', e.target.value)} placeholder="City" />
                                                </div>
                                                <div className="form-group">
                                                    <label>Zip Code:</label>
                                                    <input type="text" className="form-control" value={formData.billingAddress.zip || ''}
                                                        onChange={(e) => handleAddressChange('billingAddress', 'zip', e.target.value)} placeholder="Zip" maxLength="6" />
                                                </div>
                                                <div className="form-group">
                                                    <label>State:</label>
                                                    <input type="text" className="form-control" value={formData.billingAddress.state || ''}
                                                        onChange={(e) => handleAddressChange('billingAddress', 'state', e.target.value)} placeholder="State" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="card"><div className="card-header"><h4>Shipping Address</h4></div></div>
                                                <div className="form-group">
                                                    <label>Street:</label>
                                                    <input type="text" className="form-control" value={formData.shippingAddress.street1 || ''}
                                                        onChange={(e) => handleAddressChange('shippingAddress', 'street1', e.target.value)} placeholder="Street" />
                                                </div>
                                                <div className="form-group">
                                                    <label>City:</label>
                                                    <input type="text" className="form-control" value={formData.shippingAddress.city || ''}
                                                        onChange={(e) => handleAddressChange('shippingAddress', 'city', e.target.value)} placeholder="City" />
                                                </div>
                                                <div className="form-group">
                                                    <label>Zip Code:</label>
                                                    <input type="text" className="form-control" value={formData.shippingAddress.zip || ''}
                                                        onChange={(e) => handleAddressChange('shippingAddress', 'zip', e.target.value)} placeholder="Zip" maxLength="6" />
                                                </div>
                                                <div className="form-group">
                                                    <label>State:</label>
                                                    <input type="text" className="form-control" value={formData.shippingAddress.state || ''}
                                                        onChange={(e) => handleAddressChange('shippingAddress', 'state', e.target.value)} placeholder="State" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

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

export default CustomerEdit;
