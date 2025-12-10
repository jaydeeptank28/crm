import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import './CustomerDetail.css';

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [billingAddress, setBillingAddress] = useState(null);
    const [shippingAddress, setShippingAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [customers, setCustomers] = useState([]);
    const [profileTab, setProfileTab] = useState('details');

    // Related data for tabs
    const [contacts, setContacts] = useState([]);
    const [notes, setNotes] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [tasks, setTasks] = useState([]);

    // Note form
    const [noteText, setNoteText] = useState('');

    const tabs = [
        { id: 'profile', name: 'Profile' },
        { id: 'contacts', name: 'Contacts' },
        { id: 'notes', name: 'Notes' },
        { id: 'reminders', name: 'Reminders' },
        { id: 'tasks', name: 'Tasks' },
        { id: 'projects', name: 'Projects' },
        { id: 'tickets', name: 'Tickets' },
        { id: 'invoices', name: 'Invoices' },
        { id: 'proposals', name: 'Proposals' },
        { id: 'estimates', name: 'Estimates' },
        { id: 'credit_notes', name: 'Credit Notes' },
        { id: 'contracts', name: 'Contracts' },
        { id: 'expenses', name: 'Expenses' }
    ];

    useEffect(() => {
        fetchCustomerData();
        fetchCustomersList();
    }, [id]);

    useEffect(() => {
        // Fetch tab-specific data
        if (activeTab === 'contacts') fetchContacts();
        if (activeTab === 'notes') fetchNotes();
        if (activeTab === 'reminders') fetchReminders();
        if (activeTab === 'tasks') fetchTasks();
    }, [activeTab, id]);

    const fetchCustomerData = async () => {
        try {
            const response = await api.get(`/customers/${id}`);
            if (response.data.success) {
                setCustomer(response.data.data.customer);
                setBillingAddress(response.data.data.billingAddress);
                setShippingAddress(response.data.data.shippingAddress);
            }
        } catch (error) {
            console.error('Error fetching customer:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomersList = async () => {
        try {
            const response = await api.get('/customers');
            if (response.data.success) {
                setCustomers(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching customers list:', error);
        }
    };

    const fetchContacts = async () => {
        try {
            const response = await api.get(`/contacts?customer_id=${id}`);
            if (response.data.success) {
                setContacts(response.data.data || []);
            }
        } catch (error) {
            setContacts([]);
        }
    };

    const fetchNotes = async () => {
        try {
            const response = await api.get(`/notes?owner_type=Customer&owner_id=${id}`);
            if (response.data.success) {
                setNotes(response.data.data || []);
            }
        } catch (error) {
            setNotes([]);
        }
    };

    const fetchReminders = async () => {
        try {
            const response = await api.get(`/reminders?customer_id=${id}`);
            if (response.data.success) {
                setReminders(response.data.data || []);
            }
        } catch (error) {
            setReminders([]);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await api.get(`/tasks?owner_type=Customer&owner_id=${id}`);
            if (response.data.success) {
                setTasks(response.data.data || []);
            }
        } catch (error) {
            setTasks([]);
        }
    };

    const handleCustomerChange = (e) => {
        navigate(`/customers/${e.target.value}`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const handleAddNote = async () => {
        if (!noteText.trim()) return;
        try {
            await api.post('/notes', {
                note: noteText,
                owner_type: 'Customer',
                owner_id: id
            });
            setNoteText('');
            fetchNotes();
            Swal.fire('Success', 'Note added successfully', 'success');
        } catch (error) {
            Swal.fire('Error', 'Failed to add note', 'error');
        }
    };

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

    if (!customer) {
        return (
            <section className="section">
                <div className="text-center py-5">Customer not found</div>
            </section>
        );
    }

    // Profile Tab - Customer Details Sub-tab
    const renderProfileDetailsTab = () => (
        <div className="tab-pane fade show active">
            <div className="row">
                <div className="form-group col-sm-6">
                    <label>Company Name:</label>
                    <p>{customer.company_name}</p>
                </div>
                <div className="form-group col-sm-6">
                    <label>VAT Number:</label>
                    <p>{customer.vat_number || 'N/A'}</p>
                </div>
            </div>
            <div className="row">
                <div className="form-group col-sm-6">
                    <label>Phone:</label>
                    <p>{customer.phone || 'N/A'}</p>
                </div>
                <div className="form-group col-sm-6">
                    <label>Website:</label>
                    <p>
                        {customer.website ? (
                            <a href={customer.website} target="_blank" rel="noopener noreferrer" className="anchor-underline">
                                {customer.website}
                            </a>
                        ) : 'N/A'}
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="form-group col-sm-6">
                    <label>Currency:</label>
                    <p>{customer.currency || 'N/A'}</p>
                </div>
                <div className="form-group col-sm-6">
                    <label>Default Language:</label>
                    <p>{customer.default_language || 'N/A'}</p>
                </div>
            </div>
            <div className="row">
                <div className="form-group col-sm-6">
                    <label>Country:</label>
                    <p>{customer.country || 'N/A'}</p>
                </div>
                <div className="form-group col-sm-6">
                    <label>Groups:</label>
                    <p>
                        {customer.customerGroups && customer.customerGroups.length > 0 ? (
                            customer.customerGroups.map(group => (
                                <span key={group.id} className="badge border border-secondary mb-1 mr-1">
                                    {group.name}
                                </span>
                            ))
                        ) : 'N/A'}
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="form-group col-sm-6">
                    <label>Created On:</label>
                    <p>{formatDate(customer.created_at)}</p>
                </div>
                <div className="form-group col-sm-6">
                    <label>Last Updated:</label>
                    <p>{formatDate(customer.updated_at)}</p>
                </div>
            </div>
        </div>
    );

    // Profile Tab - Address Details Sub-tab
    const renderProfileAddressTab = () => (
        <div className="tab-pane fade show active">
            <div className="row">
                <div className="col-md-6 col-sm-12">
                    <div className="card my-0">
                        <div className="card-header pl-2">
                            <h4 className="text-black-50 font-weight-bold">Billing Address</h4>
                        </div>
                    </div>
                    {billingAddress ? (
                        <>
                            <div className="form-group col-sm-12">
                                <label>Street:</label>
                                <p>{billingAddress.street1 || 'N/A'}</p>
                            </div>
                            <div className="form-group col-sm-12">
                                <label>City:</label>
                                <p>{billingAddress.city || 'N/A'}</p>
                            </div>
                            <div className="form-group col-sm-12">
                                <label>Zip Code:</label>
                                <p>{billingAddress.zip || 'N/A'}</p>
                            </div>
                            <div className="form-group col-sm-12">
                                <label>State:</label>
                                <p>{billingAddress.state || 'N/A'}</p>
                            </div>
                            <div className="form-group col-sm-12">
                                <label>Country:</label>
                                <p>{billingAddress.country || 'N/A'}</p>
                            </div>
                        </>
                    ) : (
                        <div className="address-control col-sm-12 text-center">
                            <p className="font-weight-bold">Billing address details not available</p>
                        </div>
                    )}
                </div>
                <div className="col-md-6 col-sm-12">
                    <div className="card my-0">
                        <div className="card-header pl-2">
                            <h4 className="text-black-50 font-weight-bold">Shipping Address</h4>
                        </div>
                    </div>
                    {shippingAddress ? (
                        <>
                            <div className="form-group col-sm-12">
                                <label>Street:</label>
                                <p>{shippingAddress.street1 || 'N/A'}</p>
                            </div>
                            <div className="form-group col-sm-12">
                                <label>City:</label>
                                <p>{shippingAddress.city || 'N/A'}</p>
                            </div>
                            <div className="form-group col-sm-12">
                                <label>Zip Code:</label>
                                <p>{shippingAddress.zip || 'N/A'}</p>
                            </div>
                            <div className="form-group col-sm-12">
                                <label>State:</label>
                                <p>{shippingAddress.state || 'N/A'}</p>
                            </div>
                            <div className="form-group col-sm-12">
                                <label>Country:</label>
                                <p>{shippingAddress.country || 'N/A'}</p>
                            </div>
                        </>
                    ) : (
                        <div className="address-control col-sm-12 text-center">
                            <p className="font-weight-bold">Shipping address details not available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Contacts Tab
    const renderContactsTab = () => (
        <section className="section">
            <div className="section-body">
                <div className="card">
                    <div className="card-header">
                        <div className="row w-100 justify-content-end">
                            <Link to={`/contacts/create?customer_id=${id}`} className="btn btn-primary form-btn add-button">
                                Add <i className="fas fa-plus"></i>
                            </Link>
                        </div>
                    </div>
                    <div className="card-body">
                        <DataTable
                            columns={[
                                { name: 'Name', selector: row => row.full_name || 'N/A', sortable: true },
                                { name: 'Email', selector: row => row.email || 'N/A', sortable: true },
                                { name: 'Phone', selector: row => row.phone || 'N/A', sortable: false },
                                { name: 'Position', selector: row => row.position || 'N/A', sortable: false },
                                {
                                    name: 'Action',
                                    cell: row => (
                                        <div className="action-buttons">
                                            <Link to={`/contacts/${row.id}`} className="btn btn-sm btn-info mr-1">
                                                <i className="fas fa-eye"></i>
                                            </Link>
                                            <Link to={`/contacts/${row.id}/edit`} className="btn btn-sm btn-primary mr-1">
                                                <i className="fas fa-pencil-alt"></i>
                                            </Link>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteContact(row.id)}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    )
                                }
                            ]}
                            data={contacts}
                            pagination
                            paginationPerPage={10}
                            highlightOnHover
                            striped
                            noDataComponent="No contacts found"
                        />
                    </div>
                </div>
            </div>
        </section>
    );

    const handleDeleteContact = async (contactId) => {
        const result = await Swal.fire({
            title: 'Delete!',
            text: 'Are you sure you want to delete this contact?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#6777ef',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        });
        if (result.isConfirmed) {
            try {
                await api.delete(`/contacts/${contactId}`);
                fetchContacts();
                Swal.fire('Deleted', 'Contact deleted successfully', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to delete contact', 'error');
            }
        }
    };

    // Notes Tab
    const renderNotesTab = () => (
        <section className="section">
            <div className="section-body">
                <div className="card">
                    <div className="row p-3">
                        <div className="form-group col-lg-6">
                            <strong><label>Add Note</label></strong>
                            <textarea
                                className="form-control quill-editor-container"
                                rows="5"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Write your note here..."
                            ></textarea>
                            <div className="text-left mt-3">
                                <button type="button" className="btn btn-primary" onClick={handleAddNote}>
                                    Save
                                </button>
                                <button type="button" className="btn btn-light ml-1" onClick={() => setNoteText('')}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                        <div className="col-lg-6 note-scroll">
                            <div className="notes">
                                {notes.length === 0 ? (
                                    <div className="text-center">
                                        <span className="flex-1">No notes added yet</span>
                                    </div>
                                ) : (
                                    <div className="activities">
                                        {notes.map(note => (
                                            <div key={note.id} className="activity clearfix notes__information mb-3 p-2 border rounded">
                                                <div className="activity-detail">
                                                    <div className="d-flex justify-content-between flex-wrap mb-2">
                                                        <span className="font-weight-bold">{note.user?.full_name || 'Unknown User'}</span>
                                                        <span className="text-muted">{formatDate(note.created_at)}</span>
                                                    </div>
                                                    <div className="user__comment" dangerouslySetInnerHTML={{ __html: note.note }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );

    // Tasks Tab
    const renderTasksTab = () => (
        <section className="section">
            <div className="section-body">
                <div className="card">
                    <div className="card-header">
                        <div className="row w-100 justify-content-end">
                            <div className="justify-content-end mr-2">
                                <select className="form-control" id="filter_status">
                                    <option value="">Select Status</option>
                                    <option value="1">Not Started</option>
                                    <option value="2">In Progress</option>
                                    <option value="3">Testing</option>
                                    <option value="4">Awaiting Feedback</option>
                                    <option value="5">Complete</option>
                                </select>
                            </div>
                            <div>
                                <Link to={`/tasks/create?owner_type=Customer&owner_id=${id}`} className="btn btn-primary form-btn add-button">
                                    Add <i className="fas fa-plus"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <DataTable
                            columns={[
                                { name: 'Subject', selector: row => row.subject || 'N/A', sortable: true },
                                { name: 'Status', selector: row => row.status || 'N/A', sortable: true },
                                { name: 'Start Date', selector: row => formatDate(row.start_date), sortable: true },
                                { name: 'Due Date', selector: row => formatDate(row.due_date), sortable: true },
                                { name: 'Priority', selector: row => row.priority || 'N/A', sortable: true },
                                {
                                    name: 'Action',
                                    cell: row => (
                                        <div className="action-buttons">
                                            <Link to={`/tasks/${row.id}`} className="btn btn-sm btn-info mr-1">
                                                <i className="fas fa-eye"></i>
                                            </Link>
                                            <Link to={`/tasks/${row.id}/edit`} className="btn btn-sm btn-primary">
                                                <i className="fas fa-pencil-alt"></i>
                                            </Link>
                                        </div>
                                    )
                                }
                            ]}
                            data={tasks}
                            pagination
                            paginationPerPage={10}
                            highlightOnHover
                            striped
                            noDataComponent="No tasks found"
                        />
                    </div>
                </div>
            </div>
        </section>
    );

    // Reminders Tab
    const renderRemindersTab = () => (
        <section className="section">
            <div className="section-body">
                <div className="card">
                    <div className="card-header">
                        <div className="row w-100 justify-content-end">
                            <button className="btn btn-primary form-btn add-button" data-toggle="modal" data-target="#reminderModal">
                                Add <i className="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <DataTable
                            columns={[
                                { name: 'Description', selector: row => row.description || 'N/A', sortable: true },
                                { name: 'Date', selector: row => formatDate(row.reminder_at), sortable: true },
                                { name: 'Notified', selector: row => row.notified ? 'Yes' : 'No', sortable: true },
                                {
                                    name: 'Action',
                                    cell: row => (
                                        <div className="action-buttons">
                                            <button className="btn btn-sm btn-primary mr-1" title="Edit">
                                                <i className="fas fa-pencil-alt"></i>
                                            </button>
                                            <button className="btn btn-sm btn-danger" title="Delete">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    )
                                }
                            ]}
                            data={reminders}
                            pagination
                            paginationPerPage={10}
                            highlightOnHover
                            striped
                            noDataComponent="No reminders found"
                        />
                    </div>
                </div>
            </div>
        </section>
    );

    // Placeholder tab with coming soon message
    const renderPlaceholderTab = (tabName) => (
        <section className="section">
            <div className="section-body">
                <div className="card">
                    <div className="card-header">
                        <div className="row w-100 justify-content-end">
                            <button className="btn btn-primary form-btn add-button">
                                Add <i className="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div className="card-body text-center py-5">
                        <i className="fas fa-database fa-3x text-muted mb-3"></i>
                        <p className="text-muted">No {tabName.toLowerCase()} found for this customer</p>
                    </div>
                </div>
            </div>
        </section>
    );

    // Render active tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <>
                        <ul className="nav nav-tabs mb-3" role="tablist">
                            <li className="nav-item">
                                <a className={`nav-link ${profileTab === 'details' ? 'active' : ''}`} href="#"
                                    onClick={(e) => { e.preventDefault(); setProfileTab('details'); }}>Customer Details</a>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link ${profileTab === 'address' ? 'active' : ''}`} href="#"
                                    onClick={(e) => { e.preventDefault(); setProfileTab('address'); }}>Address Details</a>
                            </li>
                        </ul>
                        {profileTab === 'details' ? renderProfileDetailsTab() : renderProfileAddressTab()}
                    </>
                );
            case 'contacts':
                return renderContactsTab();
            case 'notes':
                return renderNotesTab();
            case 'reminders':
                return renderRemindersTab();
            case 'tasks':
                return renderTasksTab();
            case 'projects':
                return renderPlaceholderTab('Projects');
            case 'tickets':
                return renderPlaceholderTab('Tickets');
            case 'invoices':
                return renderPlaceholderTab('Invoices');
            case 'proposals':
                return renderPlaceholderTab('Proposals');
            case 'estimates':
                return renderPlaceholderTab('Estimates');
            case 'credit_notes':
                return renderPlaceholderTab('Credit Notes');
            case 'contracts':
                return renderPlaceholderTab('Contracts');
            case 'expenses':
                return renderPlaceholderTab('Expenses');
            default:
                return renderProfileDetailsTab();
        }
    };

    return (
        <section className="section">
            <div className="section-header item-align-right">
                <h1>Customer Details</h1>
                <div className="section-header-breadcrumb mr-3 float-right">
                    <select className="form-control" value={id} onChange={handleCustomerChange}>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.company_name}</option>
                        ))}
                    </select>
                </div>
                <div className="float-right">
                    <Link to={`/customers/${id}/edit`} className="btn btn-warning mr-2 form-btn">Edit</Link>
                    <Link to="/customers" className="btn btn-primary form-btn">Back</Link>
                </div>
            </div>
            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        {/* Main Navigation Tabs - Matching PHP show_fields.blade.php */}
                        <ul className="nav nav-tabs mb-3" id="customerTab" role="tablist">
                            {tabs.map(tab => (
                                <li key={tab.id} className="nav-item">
                                    <a
                                        className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
                                    >
                                        {tab.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <br />
                        {/* Tab Content */}
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CustomerDetail;
