import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './Customers.css';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/customers');
            if (response.data.success) {
                setCustomers(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Delete !',
            text: `Are you sure want to delete this "${name}" Customer?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#6777ef',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await api.delete(`/customers/${id}`);
                    if (response.data.success) {
                        fetchCustomers();
                        Swal.fire('Deleted', 'Customer deleted successfully.', 'success');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Error deleting customer', 'error');
                }
            }
        });
    };

    // Filter customers based on search
    const filteredCustomers = customers.filter(customer =>
        customer.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <section className="section">
                <div className="section-header">
                    <h1>Customers</h1>
                </div>
                <div className="section-body">
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <div className="live-wire-infy-loader">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section">
            <div className="section-header">
                <h1>Customers</h1>
                <div className="section-header-breadcrumb">
                    <Link to="/customers/create" className="btn btn-primary form-btn float-right-mobile">
                        Add <i className="fas fa-plus"></i>
                    </Link>
                </div>
            </div>
            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        {/* Search Row - Matching PHP */}
                        <div className="row mb-3 justify-content-end flex-wrap">
                            <div>
                                <div className="selectgroup">
                                    <input
                                        type="search"
                                        id="searchByCustomer"
                                        placeholder="Search"
                                        autoComplete="off"
                                        className="form-control customer-dashboard-ticket-search"
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cards Grid - Matching PHP Livewire */}
                        <div className="users-card">
                            <div className="row">
                                {paginatedCustomers.length > 0 ? (
                                    paginatedCustomers.map(customer => (
                                        <div key={customer.id} className="col-xl-4 col-md-6">
                                            <div className="hover-effect-users position-relative mb-5 users-card-hover-border users-border">
                                                <div className="users-listing-details">
                                                    <div className="d-flex users-listing-description align-items-center justify-content-center flex-column">
                                                        {/* Avatar */}
                                                        <div className="pl-0 mb-2 users-avatar">
                                                            <img
                                                                src="/assets/icons/male.png"
                                                                alt="user-avatar-img"
                                                                className="img-responsive users-avatar-img users-img mr-2"
                                                                onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(customer.company_name || 'C') + '&background=6777ef&color=fff'; }}
                                                            />
                                                        </div>
                                                        {/* Company Name */}
                                                        <div className="mb-auto w-100 users-data">
                                                            <div className="d-flex justify-content-center align-items-center w-100">
                                                                <div>
                                                                    <Link
                                                                        to={`/customers/${customer.id}`}
                                                                        className="users-listing-title text-decoration-none"
                                                                    >
                                                                        {customer.company_name?.length > 15
                                                                            ? customer.company_name.substring(0, 15) + '...'
                                                                            : customer.company_name}
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Badges - Contact Count & Project Count */}
                                                <div className="d-flex align-items-center justify-content-between assigned-user pt-0 pl-3 px-5">
                                                    <div>
                                                        <div
                                                            className="text-center badge badge-primary font-weight-bold"
                                                            title="Total Contact"
                                                        >
                                                            {customer.contact_count || 0}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div
                                                            className="text-center badge badge-success font-weight-bold"
                                                            title="Total Project"
                                                        >
                                                            {customer.project_count || 0}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Action Buttons */}
                                                <div className="users-action-btn">
                                                    <Link
                                                        to={`/customers/${customer.id}/edit`}
                                                        title="Edit"
                                                        className="action-btn edit-btn users-edit"
                                                    >
                                                        <i className="fa fa-edit"></i>
                                                    </Link>
                                                    <a
                                                        href="#"
                                                        title="Delete"
                                                        className="action-btn customer-delete-btn users-delete"
                                                        onClick={(e) => { e.preventDefault(); handleDelete(customer.id, customer.company_name); }}
                                                    >
                                                        <i className="fa fa-trash"></i>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-md-12 d-flex justify-content-center mt-3">
                                        <p className="text-dark">
                                            {searchQuery ? 'No customer found' : 'No customer available'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pagination - Matching PHP */}
                        {filteredCustomers.length > 0 && (
                            <div className="mt-0 mb-5 col-12">
                                <div className="row paginatorRow">
                                    <div className="col-lg-2 col-md-6 col-sm-12 pt-2">
                                        <span className="d-inline-flex">
                                            Showing <span className="font-weight-bold ml-1 mr-1">{startIndex + 1}</span> -
                                            <span className="font-weight-bold ml-1 mr-1">
                                                {Math.min(startIndex + itemsPerPage, filteredCustomers.length)}
                                            </span> of
                                            <span className="font-weight-bold ml-1">{filteredCustomers.length}</span>
                                        </span>
                                    </div>
                                    <div className="col-lg-10 col-md-6 col-sm-12 d-flex justify-content-end">
                                        <nav>
                                            <ul className="pagination">
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={currentPage === 1}
                                                    >
                                                        &laquo;
                                                    </button>
                                                </li>
                                                {[...Array(totalPages)].map((_, i) => (
                                                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => setCurrentPage(i + 1)}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    </li>
                                                ))}
                                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        &raquo;
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Customers;
