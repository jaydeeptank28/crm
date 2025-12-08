import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
    // State for dashboard data
    const [invoiceStatusCount, setInvoiceStatusCount] = useState({
        drafted: 0, unpaid: 0, partially_paid: 0, paid: 0, cancelled: 0, total_invoices: 0
    });
    const [estimateStatusCount, setEstimateStatusCount] = useState({
        drafted: 0, sent: 0, declined: 0, accepted: 0, expired: 0, total_estimates: 0
    });
    const [proposalStatusCount, setProposalStatusCount] = useState({
        drafted: 0, open: 0, revised: 0, accepted: 0, declined: 0, total_proposals: 0
    });
    const [projectStatusCount, setProjectStatusCount] = useState({
        not_started: 0, in_progress: 0, on_hold: 0, cancelled: 0, finished: 0, total_projects: 0
    });
    const [memberCount, setMemberCount] = useState({
        active_members: 0, deactive_members: 0, total_members: 0
    });
    const [customerCount, setCustomerCount] = useState({
        total_customers: 0
    });
    const [leadStatuses, setLeadStatuses] = useState([]);
    const [ticketStats, setTicketStats] = useState([]);
    const [currentWeekInvoices, setCurrentWeekInvoices] = useState({});
    const [lastWeekInvoices, setLastWeekInvoices] = useState({});
    const [incomeVsExpense, setIncomeVsExpense] = useState({ income: {}, expenses: {} });
    const [loading, setLoading] = useState(true);

    const totalCountForDashboard = (total) => total > 0 ? total : 1;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getDashboardStats();
                const data = response.data;

                setInvoiceStatusCount(data.invoiceStatusCount);
                setEstimateStatusCount(data.estimateStatusCount);
                setProposalStatusCount(data.proposalStatusCount);
                setProjectStatusCount(data.projectStatusCount);
                setMemberCount(data.memberCount);
                setCustomerCount(data.customerCount);
                setLeadStatuses(data.leadStatuses || []);
                setTicketStats(data.ticketStatus || []);
                setCurrentWeekInvoices(data.currentWeekInvoices || {});
                setLastWeekInvoices(data.lastWeekInvoices || {});
                setIncomeVsExpense(data.monthWiseRecords || { income: {}, expenses: {} });

                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Chart Data Preparation ---

    // 1. Leads Chart (Doughnut)
    const leadChartData = {
        labels: leadStatuses.map(s => s.name),
        datasets: [{
            data: leadStatuses.map(s => s.leads_count),
            backgroundColor: leadStatuses.map(s => s.color || '#6777ef'),
            hoverOffset: 4
        }]
    };

    // 2. Project Status Chart (Doughnut)
    const projectLabels = ['Cancelled', 'Finished', 'In Progress', 'Not Started', 'On Hold'];
    const projectData = [
        projectStatusCount.cancelled,
        projectStatusCount.finished,
        projectStatusCount.in_progress,
        projectStatusCount.not_started,
        projectStatusCount.on_hold
    ];
    const projectColors = ["#fc544b", "#47c363", "#6777ef", "#3abaf4", "#ffa426"];

    const projectChartData = {
        labels: projectLabels,
        datasets: [{
            data: projectData,
            backgroundColor: projectColors,
            hoverOffset: 4
        }]
    };

    // 3. Tickets Chart (Doughnut)
    const ticketChartData = {
        labels: ticketStats.map(t => t.name),
        datasets: [{
            data: ticketStats.map(t => t.tickets_count),
            backgroundColor: ticketStats.map(t => t.pick_color || '#6777ef'),
            hoverOffset: 4
        }]
    };

    // 4. Weekly Payment Chart (Bar)
    const weekLabels = Object.keys(currentWeekInvoices);
    const weeklyPaymentData = {
        labels: weekLabels,
        datasets: [
            {
                label: 'This Week Payments',
                data: Object.values(currentWeekInvoices),
                backgroundColor: "#d3ebd3",
                borderColor: "#91cb41",
                borderWidth: 2
            },
            {
                label: 'Last Week Payments',
                data: Object.values(lastWeekInvoices),
                backgroundColor: "#e29ed4",
                borderColor: "#d36dbe",
                borderWidth: 2
            }
        ]
    };

    // 5. Income vs Expense Chart (Bar)
    const monthLabels = Object.keys(incomeVsExpense.income);
    const incomeExpenseData = {
        labels: monthLabels,
        datasets: [
            {
                label: 'Incomes',
                data: Object.values(incomeVsExpense.income),
                backgroundColor: "#d3ebd3",
                borderColor: "#91cb41",
                borderWidth: 2
            },
            {
                label: 'Expenses',
                data: Object.values(incomeVsExpense.expenses),
                backgroundColor: "#feabb3",
                borderColor: "#fd6c7b",
                borderWidth: 2
            }
        ]
    };

    const doughnutOptions = {
        plugins: {
            legend: {
                display: false
            }
        },
        maintainAspectRatio: false
    };

    const barOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        },
        maintainAspectRatio: false
    };

    if (loading) {
        return (
            <section className="section">
                <div className="section-header">
                    <h1>Dashboard</h1>
                </div>
                <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
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
                <h1>Dashboard</h1>
            </div>

            {/* Charts Row - Leads, Projects, Tickets */}
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="row">
                            <div className="col-md-12 col-lg-4 col-sm-6">
                                <div className="col-sm-12">
                                    <p className="mt-2"><b>Leads Overview</b></p>
                                    <hr />
                                    <div style={{ height: '250px', marginBottom: '20px' }}>
                                        <Doughnut data={leadChartData} options={doughnutOptions} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-12 col-lg-4 col-sm-6">
                                <div className="col-sm-12">
                                    <p className="mt-2"><b>Statistics by Project Status</b></p>
                                    <hr />
                                    <div style={{ height: '250px', marginBottom: '20px' }}>
                                        <Doughnut data={projectChartData} options={doughnutOptions} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-12 col-lg-4 col-sm-6">
                                <div className="col-sm-12">
                                    <p className="mt-2"><b>Tickets Status</b></p>
                                    <hr />
                                    <div style={{ height: '250px', marginBottom: '20px' }}>
                                        <Doughnut data={ticketChartData} options={doughnutOptions} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards Row */}
            <div className="row">
                {/* Invoices Card */}
                <div className="col-xl-4 col-lg-6 col-md-12 col-sm-12 dashboard-card-css">
                    <div className="card card-statistic-2 d-total-one-border">
                        <div className="card-stats">
                            <div className="card-stats-title">
                                <a href="#" className="font-weight-bold anchor-underline">Invoices</a>
                            </div>
                            <div className="card-stats-items d-stat-items-flex">
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{invoiceStatusCount.drafted}</div>
                                    <span className="text-warning font-weight-bold">Drafted</span>
                                </div>
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{invoiceStatusCount.unpaid}</div>
                                    <span className="text-primary font-weight-bold">Unpaid</span>
                                </div>
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{invoiceStatusCount.partially_paid}</div>
                                    <span className="text-info font-weight-bold">Partially Paid</span>
                                </div>
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{invoiceStatusCount.paid}</div>
                                    <span className="text-success font-weight-bold">Paid</span>
                                </div>
                            </div>
                        </div>
                        <div className="card-icon shadow-primary d-total-one-bg d-border-radius">
                            <i className="fas fa-file-invoice"></i>
                        </div>
                        <div className="card-wrap">
                            <div className="card-header">
                                <h4>Total Invoices</h4>
                            </div>
                            <div className="card-body">
                                {invoiceStatusCount.total_invoices}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estimates Card */}
                <div className="col-xl-4 col-lg-6 col-md-12 col-sm-12 dashboard-card-css">
                    <div className="card card-statistic-2 d-total-two-border">
                        <div className="card-stats">
                            <div className="card-stats-title">
                                <a href="#" className="font-weight-bold anchor-underline">Estimates</a>
                            </div>
                            <div className="card-stats-items d-stat-items-flex">
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{estimateStatusCount.drafted}</div>
                                    <span className="text-warning font-weight-bold">Drafted</span>
                                </div>
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{estimateStatusCount.sent}</div>
                                    <span className="text-primary font-weight-bold">Sent</span>
                                </div>
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{estimateStatusCount.declined}</div>
                                    <span className="text-info font-weight-bold">Declined</span>
                                </div>
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{estimateStatusCount.accepted}</div>
                                    <span className="text-success font-weight-bold">Accepted</span>
                                </div>
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{estimateStatusCount.expired}</div>
                                    <span className="text-danger font-weight-bold">Expired</span>
                                </div>
                            </div>
                        </div>
                        <div className="card-icon shadow-primary d-total-two-bg d-border-radius">
                            <i className="fas fa-calculator"></i>
                        </div>
                        <div className="card-wrap">
                            <div className="card-header">
                                <h4>Total Estimates</h4>
                            </div>
                            <div className="card-body">
                                {estimateStatusCount.total_estimates}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Proposals Card */}
                <div className="col-xl-4 col-lg-6 col-md-12 col-sm-12 dashboard-card-css">
                    <div className="card card-statistic-2 d-total-three-border">
                        <div className="card-stats">
                            <div className="card-stats-title">
                                <a href="#" className="font-weight-bold anchor-underline">Proposals</a>
                            </div>
                            <div className="card-stats-items d-stat-items-flex">
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{proposalStatusCount.drafted}</div>
                                    <span className="text-warning font-weight-bold">Drafted</span>
                                </div>
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{proposalStatusCount.open}</div>
                                    <span className="text-danger font-weight-bold">Open</span>
                                </div>
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{proposalStatusCount.revised}</div>
                                    <span className="text-primary font-weight-bold">Revised</span>
                                </div>
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{proposalStatusCount.accepted}</div>
                                    <span className="text-success font-weight-bold">Accepted</span>
                                </div>
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{proposalStatusCount.declined}</div>
                                    <span className="text-info font-weight-bold">Declined</span>
                                </div>
                            </div>
                        </div>
                        <div className="card-icon shadow-primary d-total-three-bg d-border-radius">
                            <i className="fas fa-scroll"></i>
                        </div>
                        <div className="card-wrap">
                            <div className="card-header">
                                <h4>Total Proposal</h4>
                            </div>
                            <div className="card-body">
                                {proposalStatusCount.total_proposals}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects Card */}
                <div className="col-xl-4 col-lg-6 col-md-12 col-sm-12 dashboard-card-css">
                    <div className="card card-statistic-2 d-total-four-border">
                        <div className="card-stats">
                            <div className="card-stats-title">
                                <a href="#" className="font-weight-bold anchor-underline">Projects</a>
                            </div>
                            <div className="card-stats-items d-stat-items-flex">
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{projectStatusCount.not_started}</div>
                                    <span className="text-danger font-weight-bold">Not Started</span>
                                </div>
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{projectStatusCount.in_progress}</div>
                                    <span className="text-primary font-weight-bold">In Progress</span>
                                </div>
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{projectStatusCount.on_hold}</div>
                                    <span className="text-warning font-weight-bold">On Hold</span>
                                </div>
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{projectStatusCount.cancelled}</div>
                                    <span className="text-info font-weight-bold">Cancelled</span>
                                </div>
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{projectStatusCount.finished}</div>
                                    <span className="text-success font-weight-bold">Finished</span>
                                </div>
                            </div>
                        </div>
                        <div className="card-icon shadow-primary d-total-four-bg d-border-radius">
                            <i className="fas fa-layer-group"></i>
                        </div>
                        <div className="card-wrap">
                            <div className="card-header">
                                <h4>Total Projects</h4>
                            </div>
                            <div className="card-body">
                                {projectStatusCount.total_projects}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Members Card */}
                <div className="col-xl-4 col-lg-6 col-md-12 col-sm-12 dashboard-card-css">
                    <div className="card card-statistic-2 d-total-five-border">
                        <div className="card-stats">
                            <div className="card-stats-title">
                                <a href="#" className="font-weight-bold anchor-underline">Members</a>
                            </div>
                            <div className="card-stats-items d-stat-items-flex">
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{memberCount.active_members}</div>
                                    <span className="text-success font-weight-bold">Active</span>
                                </div>
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{memberCount.deactive_members}</div>
                                    <span className="text-danger font-weight-bold">Deactive</span>
                                </div>
                            </div>
                        </div>
                        <div className="card-icon shadow-primary d-total-five-bg d-border-radius">
                            <i className="fas fa-user-friends"></i>
                        </div>
                        <div className="card-wrap">
                            <div className="card-header">
                                <h4>Total Members</h4>
                            </div>
                            <div className="card-body">
                                {memberCount.total_members}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customers Card */}
                <div className="col-xl-4 col-lg-6 col-md-12 col-sm-12 dashboard-card-css">
                    <div className="card card-statistic-2 d-total-six-border">
                        <div className="card-stats">
                            <div className="card-stats-title">
                                <a href="#" className="font-weight-bold anchor-underline">Customers</a>
                            </div>
                            <div className="card-stats-items d-stat-items-flex">
                                <div className="card-stats-item d-stat-item-flex">
                                    <div className="card-stats-item-count">{customerCount.total_customers}</div>
                                    <span className="text-success font-weight-bold">Active</span>
                                </div>
                            </div>
                        </div>
                        <div className="card-icon shadow-primary d-total-six-bg d-border-radius">
                            <i className="fas fa-street-view"></i>
                        </div>
                        <div className="card-wrap">
                            <div className="card-header">
                                <h4>Total Customers</h4>
                            </div>
                            <div className="card-body">
                                {customerCount.total_customers}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bars Row */}
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="row">
                            {/* Invoice Overview */}
                            <div className="col-md-12 col-lg-4 col-sm-6">
                                <div className="col-sm-12">
                                    <p className="text-dark mt-3">
                                        <a href="#" className="inline-block font-weight-bold anchor-underline">Invoice Overview</a>
                                    </p>
                                    <hr />
                                </div>
                                <div className="col-md-12 d-flex">
                                    <span className="inline-block font-weight-bold text-warning"> Drafted</span>
                                </div>
                                <div className="col-md-12 progress-finance-status">
                                    <div className="progress progress-bar-mini height-25 mt-3">
                                        <div className="progress-bar" role="progressbar"
                                            style={{ width: `${invoiceStatusCount.drafted * 100 / totalCountForDashboard(invoiceStatusCount.total_invoices)}%` }}
                                            aria-valuenow={invoiceStatusCount.drafted * 100 / totalCountForDashboard(invoiceStatusCount.total_invoices)}
                                            aria-valuemin="0" aria-valuemax="100">
                                            {(invoiceStatusCount.drafted * 100 / totalCountForDashboard(invoiceStatusCount.total_invoices)).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="col-sm-12 mt-3 d-flex">
                                    <span className="inline-block font-weight-bold text-primary">Unpaid</span>
                                </div>
                                <div className="col-md-12 progress-finance-status">
                                    <div className="progress progress-bar-mini height-25 mt-3">
                                        <div className="progress-bar" role="progressbar"
                                            style={{ width: `${invoiceStatusCount.unpaid * 100 / totalCountForDashboard(invoiceStatusCount.total_invoices)}%` }}
                                            aria-valuenow={invoiceStatusCount.unpaid * 100 / totalCountForDashboard(invoiceStatusCount.total_invoices)}
                                            aria-valuemin="0" aria-valuemax="100">
                                            {(invoiceStatusCount.unpaid * 100 / totalCountForDashboard(invoiceStatusCount.total_invoices)).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="col-sm-12 mt-3 d-flex">
                                    <span className="inline-block font-weight-bold text-success">Paid</span>
                                </div>
                                <div className="col-md-12 progress-finance-status">
                                    <div className="progress progress-bar-mini height-25 mt-3">
                                        <div className="progress-bar" role="progressbar"
                                            style={{ width: `${invoiceStatusCount.paid * 100 / totalCountForDashboard(invoiceStatusCount.total_invoices)}%` }}
                                            aria-valuenow={invoiceStatusCount.paid * 100 / totalCountForDashboard(invoiceStatusCount.total_invoices)}
                                            aria-valuemin="0" aria-valuemax="100">
                                            {(invoiceStatusCount.paid * 100 / totalCountForDashboard(invoiceStatusCount.total_invoices)).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Estimate Overview */}
                            <div className="col-md-12 col-lg-4 col-sm-6">
                                <div className="col-sm-12">
                                    <p className="text-dark mt-3">
                                        <a href="#" className="inline-block font-weight-bold anchor-underline">Estimate Overview</a>
                                    </p>
                                    <hr />
                                </div>
                                <div className="col-sm-12 d-flex">
                                    <span className="inline-block font-weight-bold ml-2 text-warning"> Drafted</span>
                                </div>
                                <div className="col-md-12 text-right progress-finance-status">
                                    <div className="progress progress-bar-mini height-25 mt-3">
                                        <div className="progress-bar" role="progressbar"
                                            style={{ width: `${estimateStatusCount.drafted * 100 / totalCountForDashboard(estimateStatusCount.total_estimates)}%` }}
                                            aria-valuenow={estimateStatusCount.drafted * 100 / totalCountForDashboard(estimateStatusCount.total_estimates)}
                                            aria-valuemin="0" aria-valuemax="100">
                                            {(estimateStatusCount.drafted * 100 / totalCountForDashboard(estimateStatusCount.total_estimates)).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="col-sm-12 mt-3 d-flex">
                                    <span className="inline-block font-weight-bold ml-2 text-primary"> Sent</span>
                                </div>
                                <div className="col-md-12 text-right progress-finance-status">
                                    <div className="progress progress-bar-mini height-25 mt-3">
                                        <div className="progress-bar" role="progressbar"
                                            style={{ width: `${estimateStatusCount.sent * 100 / totalCountForDashboard(estimateStatusCount.total_estimates)}%` }}
                                            aria-valuenow={estimateStatusCount.sent * 100 / totalCountForDashboard(estimateStatusCount.total_estimates)}
                                            aria-valuemin="0" aria-valuemax="100">
                                            {(estimateStatusCount.sent * 100 / totalCountForDashboard(estimateStatusCount.total_estimates)).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="col-sm-12 mt-3 d-flex">
                                    <span className="inline-block font-weight-bold ml-2 text-success"> Accepted</span>
                                </div>
                                <div className="col-md-12 text-right progress-finance-status">
                                    <div className="progress progress-bar-mini height-25 mt-3">
                                        <div className="progress-bar" role="progressbar"
                                            style={{ width: `${estimateStatusCount.accepted * 100 / totalCountForDashboard(estimateStatusCount.total_estimates)}%` }}
                                            aria-valuenow={estimateStatusCount.accepted * 100 / totalCountForDashboard(estimateStatusCount.total_estimates)}
                                            aria-valuemin="0" aria-valuemax="100">
                                            {(estimateStatusCount.accepted * 100 / totalCountForDashboard(estimateStatusCount.total_estimates)).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="col-sm-12 mt-3 d-flex">
                                    <span className="inline-block font-weight-bold ml-2 text-danger"> Expired</span>
                                </div>
                                <div className="col-md-12 text-right progress-finance-status">
                                    <div className="progress progress-bar-mini height-25 mt-3">
                                        <div className="progress-bar" role="progressbar"
                                            style={{ width: `${estimateStatusCount.expired * 100 / totalCountForDashboard(estimateStatusCount.total_estimates)}%` }}
                                            aria-valuenow={estimateStatusCount.expired * 100 / totalCountForDashboard(estimateStatusCount.total_estimates)}
                                            aria-valuemin="0" aria-valuemax="100">
                                            {(estimateStatusCount.expired * 100 / totalCountForDashboard(estimateStatusCount.total_estimates)).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Proposal Overview */}
                            <div className="col-md-12 col-lg-4 col-sm-6">
                                <div className="col-sm-12">
                                    <p className="text-dark mt-3">
                                        <a href="#" className="inline-block font-weight-bold anchor-underline">Proposal Overview</a>
                                    </p>
                                    <hr />
                                </div>
                                <div className="col-sm-12 d-flex">
                                    <span className="inline-block font-weight-bold text-warning"> Drafted</span>
                                </div>
                                <div className="col-md-12 text-right progress-finance-status">
                                    <div className="progress progress-bar-mini height-25 mt-3">
                                        <div className="progress-bar" role="progressbar"
                                            style={{ width: `${proposalStatusCount.drafted * 100 / totalCountForDashboard(proposalStatusCount.total_proposals)}%` }}
                                            aria-valuenow={proposalStatusCount.drafted * 100 / totalCountForDashboard(proposalStatusCount.total_proposals)}
                                            aria-valuemin="0" aria-valuemax="100">
                                            {(proposalStatusCount.drafted * 100 / totalCountForDashboard(proposalStatusCount.total_proposals)).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="col-sm-12 mt-3 d-flex">
                                    <span className="inline-block font-weight-bold text-danger"> Open</span>
                                </div>
                                <div className="col-md-12 text-right progress-finance-status">
                                    <div className="progress progress-bar-mini height-25 mt-3">
                                        <div className="progress-bar" role="progressbar"
                                            style={{ width: `${proposalStatusCount.open * 100 / totalCountForDashboard(proposalStatusCount.total_proposals)}%` }}
                                            aria-valuenow={proposalStatusCount.open * 100 / totalCountForDashboard(proposalStatusCount.total_proposals)}
                                            aria-valuemin="0" aria-valuemax="100">
                                            {(proposalStatusCount.open * 100 / totalCountForDashboard(proposalStatusCount.total_proposals)).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="col-sm-12 mt-3 d-flex">
                                    <span className="inline-block font-weight-bold text-primary"> Revised</span>
                                </div>
                                <div className="col-md-12 text-right progress-finance-status">
                                    <div className="progress progress-bar-mini height-25 mt-3">
                                        <div className="progress-bar" role="progressbar"
                                            style={{ width: `${proposalStatusCount.revised * 100 / totalCountForDashboard(proposalStatusCount.total_proposals)}%` }}
                                            aria-valuenow={proposalStatusCount.revised * 100 / totalCountForDashboard(proposalStatusCount.total_proposals)}
                                            aria-valuemin="0" aria-valuemax="100">
                                            {(proposalStatusCount.revised * 100 / totalCountForDashboard(proposalStatusCount.total_proposals)).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="col-sm-12 mt-3 d-flex">
                                    <span className="inline-block font-weight-bold text-success"> Accepted</span>
                                </div>
                                <div className="col-md-12 text-right progress-finance-status">
                                    <div className="progress progress-bar-mini height-25 mt-3">
                                        <div className="progress-bar" role="progressbar"
                                            style={{ width: `${proposalStatusCount.accepted * 100 / totalCountForDashboard(proposalStatusCount.total_proposals)}%` }}
                                            aria-valuenow={proposalStatusCount.accepted * 100 / totalCountForDashboard(proposalStatusCount.total_proposals)}
                                            aria-valuemin="0" aria-valuemax="100">
                                            {(proposalStatusCount.accepted * 100 / totalCountForDashboard(proposalStatusCount.total_proposals)).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Payment Chart */}
            <div className="row">
                <div className="col-lg-12 col-md-12 col-sm-12">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="text-dark">Weekly Payment Records</h6>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '300px' }}>
                                <Bar data={weeklyPaymentData} options={barOptions} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Income vs Expense Chart */}
            <div className="row">
                <div className="col-lg-12 col-md-12 col-sm-12">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="text-dark">Incomes vs Expenses</h6>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '300px' }}>
                                <Bar data={incomeExpenseData} options={barOptions} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contracts Expiring This Month */}
            <div className="row">
                <div className="col-lg-12 col-md-12 col-sm-12">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="text-dark w-100">Contracts Expiring This Month</h6>
                            <div>
                                <select className="form-control" id="monthId">
                                    <option value="1">January</option>
                                    <option value="2">February</option>
                                    <option value="3">March</option>
                                    <option value="4">April</option>
                                    <option value="5">May</option>
                                    <option value="6">June</option>
                                    <option value="7">July</option>
                                    <option value="8">August</option>
                                    <option value="9">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                </select>
                            </div>
                        </div>
                        <div className="card-body">
                            <table className="table table-striped table-bordered table-responsive-sm" id="contractExpiredTable">
                                <thead className="text-white contract-table-bg-color">
                                    <tr>
                                        <td>Subject</td>
                                        <td>Customer</td>
                                        <td>Start Date</td>
                                        <td>End Date</td>
                                    </tr>
                                </thead>
                                <tbody className="expiring-contracts">
                                    {/* Contract rows would be rendered here from API */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Dashboard;
