import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const columns = [
        {
            name: 'Company Name',
            selector: row => row.company_name,
            sortable: true
        },
        {
            name: 'Phone',
            selector: row => row.phone || 'N/A',
            sortable: false
        },
        {
            name: 'Website',
            selector: row => row.website ? (
                <a href={row.website} target="_blank" rel="noopener noreferrer">{row.website}</a>
            ) : 'N/A',
            sortable: false
        },
        {
            name: 'Action',
            cell: row => (
                <div className="action-buttons">
                    <Link
                        to={`/customers/${row.id}`}
                        title="View"
                        className="btn btn-sm btn-info mr-1"
                    >
                        <i className="fas fa-eye"></i>
                    </Link>
                    <Link
                        to={`/customers/${row.id}/edit`}
                        title="Edit"
                        className="btn btn-sm btn-primary mr-1"
                    >
                        <i className="fas fa-pencil-alt"></i>
                    </Link>
                    <a
                        href="#"
                        title="Delete"
                        className="btn btn-sm btn-danger delete-btn"
                        onClick={(e) => { e.preventDefault(); handleDelete(row.id, row.company_name); }}
                    >
                        <i className="fas fa-trash"></i>
                    </a>
                </div>
            )
        }
    ];

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
                        <DataTable
                            columns={columns}
                            data={customers}
                            progressPending={loading}
                            pagination
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[10, 25, 50, 100]}
                            highlightOnHover
                            striped
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Customers;
