import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const [openDropdowns, setOpenDropdowns] = useState({});
    const [menuSearchTerm, setMenuSearchTerm] = useState('');
    const [noResults, setNoResults] = useState(false);

    const isActive = (path) => location.pathname.startsWith(path) ? 'active' : '';

    // Check if any child route is active for a dropdown
    const isDropdownActive = (paths) => {
        return paths.some(path => location.pathname.startsWith(path));
    };

    // Toggle dropdown
    const toggleDropdown = (e, key) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenDropdowns(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Auto-open dropdown if child route is active
    useEffect(() => {
        const dropdownPaths = {
            'customers': ['/customer-groups', '/customers'],
            'articles': ['/article-groups', '/articles'],
            'leads': ['/lead-status', '/lead-sources', '/leads'],
            'tickets': ['/ticket-priorities', '/ticket-statuses', '/predefined-replies', '/tickets'],
            'sales': ['/invoices', '/credit-notes', '/proposals', '/estimates', '/payments-list'],
            'expenses': ['/expense-categories', '/expenses'],
            'products': ['/products', '/product-groups'],
            'contracts': ['/contracts', '/contract-types']
        };

        const newOpenDropdowns = {};
        Object.entries(dropdownPaths).forEach(([key, paths]) => {
            if (isDropdownActive(paths)) {
                newOpenDropdowns[key] = true;
            }
        });
        setOpenDropdowns(prev => ({ ...prev, ...newOpenDropdowns }));
    }, [location.pathname]);

    // Menu search filter - matches PHP exactly
    const isMenuItemVisible = (menuText) => {
        if (!menuSearchTerm) return true;
        return menuText.toLowerCase().includes(menuSearchTerm.toLowerCase());
    };

    // Track no results state
    useEffect(() => {
        if (!menuSearchTerm) {
            setNoResults(false);
            return;
        }
        // Check if any menu items match
        const menuItems = ['Dashboard', 'Customer Groups', 'Customers', 'Members', 'Article Groups', 'Articles',
            'Tags', 'Lead Status', 'Lead Sources', 'Leads', 'Projects', 'Tasks', 'Ticket Priorities',
            'Ticket Status', 'Predefined Replies', 'Tickets', 'Invoices', 'Credit Notes', 'Proposals',
            'Estimates', 'Payments', 'Departments', 'Expense Categories', 'Expenses', 'Payment Modes',
            'Tax Rates', 'Announcements', 'Products', 'Product Groups', 'Contracts', 'Contract Types',
            'Goals', 'Services', 'Settings', 'Countries', 'Activity Logs', 'Translation Manager'];
        const hasMatch = menuItems.some(item => item.toLowerCase().includes(menuSearchTerm.toLowerCase()));
        setNoResults(!hasMatch);
    }, [menuSearchTerm]);

    return (
        <aside id="sidebar-wrapper">
            <div className="sidebar-brand sidebar-sticky sidebar-bottom-padding h-auto line-height-0 padding-bottom-zero">
                <Link className="navbar-brand d-flex align-items-center justify-content-center py-3 px-2" to="/dashboard">
                    <img className="navbar-brand-full w-25" src="/assets/img/infyom-logo.png" width="50px" alt="Logo" />&nbsp;&nbsp;
                    <span className="navbar-brand-full-name text-black text-wrap pl-2 w-75">InfyCRM</span>
                </Link>
                <div className="input-group sidebar-search-box">
                    <input
                        type="text"
                        className="form-control searchTerm"
                        id="searchText"
                        placeholder="Search Menu"
                        value={menuSearchTerm}
                        onChange={(e) => setMenuSearchTerm(e.target.value)}
                    />
                    <div className="input-group-append sGroup">
                        <div className="input-group-text">
                            <i
                                className={`fas fa-search search-sign ${menuSearchTerm ? 'd-none' : ''}`}
                            ></i>
                            <i
                                className={`fas fa-times close-sign ${menuSearchTerm ? '' : 'd-none'}`}
                                onClick={() => setMenuSearchTerm('')}
                                style={{ cursor: 'pointer' }}
                            ></i>
                        </div>
                    </div>
                    <div className={`no-results mt-3 ml-1 ${noResults && menuSearchTerm ? '' : 'd-none'}`}>
                        No matching records found
                    </div>
                </div>
            </div>
            <div className="sidebar-brand sidebar-brand-sm">
                <Link to="/dashboard" className="small text-white">
                    <img className="navbar-brand-full" src="/assets/img/infyom-logo.png" width="50px" alt="Logo" />
                </Link>
            </div>

            <ul className="sidebar-menu">
                <li className="menu-header side-menus">Dashboard</li>
                <li className={`side-menus ${isActive('/dashboard')}`}>
                    <Link className="nav-link" to="/dashboard">
                        <i className="fas fa-lg fa-tachometer-alt"></i>
                        <span className="menu-text-wrap">Dashboard</span>
                    </Link>
                </li>

                <li className="menu-header side-menus">Customers</li>
                <li className={`nav-item dropdown side-menus ${openDropdowns['customers'] ? 'active' : ''}`}>
                    <a href="#" className="nav-link has-dropdown" onClick={(e) => toggleDropdown(e, 'customers')}>
                        <i className="fas fa-lg fa-street-view"></i>
                        <span>Customers</span>
                    </a>
                    <ul className={`dropdown-menu side-menus ${openDropdowns['customers'] ? 'show' : ''}`} style={{ display: openDropdowns['customers'] ? 'block' : 'none' }}>
                        <li className={`side-menus ${isActive('/customer-groups')}`}>
                            <Link className="nav-link" to="/customer-groups">
                                <i className="fas fa-lg fa-people-arrows"></i>
                                <span className="menu-text-wrap">Customer Groups</span>
                            </Link>
                        </li>
                        <li className={`side-menus ${isActive('/customers')}`}>
                            <Link className="nav-link" to="/customers">
                                <i className="fas fa-lg fa-street-view"></i>
                                <span className="menu-text-wrap">Customers</span>
                            </Link>
                        </li>
                    </ul>
                </li>

                <li className={`side-menus ${isActive('/members')}`}>
                    <Link className="nav-link" to="/members">
                        <i className="fas fa-lg fa-user-friends"></i>
                        <span className="menu-text-wrap">Members</span>
                    </Link>
                </li>

                <li className={`nav-item dropdown side-menus ${openDropdowns['articles'] ? 'active' : ''}`}>
                    <a href="#" className="nav-link has-dropdown" onClick={(e) => toggleDropdown(e, 'articles')}>
                        <i className="fab fa-lg fa-autoprefixer"></i>
                        <span>Articles</span>
                    </a>
                    <ul className={`dropdown-menu side-menus ${openDropdowns['articles'] ? 'show' : ''}`} style={{ display: openDropdowns['articles'] ? 'block' : 'none' }}>
                        <li className={`side-menus ${isActive('/article-groups')}`}>
                            <Link className="nav-link" to="/article-groups">
                                <i className="fas fa-lg fa-edit"></i>
                                <span className="menu-text-wrap">Article Groups</span>
                            </Link>
                        </li>
                        <li className={`side-menus ${isActive('/articles')}`}>
                            <Link className="nav-link" to="/articles">
                                <i className="fab fa-lg fa-autoprefixer"></i>
                                <span className="menu-text-wrap">Articles</span>
                            </Link>
                        </li>
                    </ul>
                </li>

                <li className={`side-menus ${isActive('/tags')}`}>
                    <Link className="nav-link" to="/tags">
                        <i className="fas fa-tags"></i>
                        <span className="menu-text-wrap">Tags</span>
                    </Link>
                </li>

                <li className="menu-header side-menus">Leads</li>
                <li className={`nav-item dropdown side-menus ${openDropdowns['leads'] ? 'active' : ''}`}>
                    <a href="#" className="nav-link has-dropdown" onClick={(e) => toggleDropdown(e, 'leads')}>
                        <i className="fas fa-lg fa-tty"></i>
                        <span>Leads</span>
                    </a>
                    <ul className={`dropdown-menu side-menus ${openDropdowns['leads'] ? 'show' : ''}`} style={{ display: openDropdowns['leads'] ? 'block' : 'none' }}>
                        <li className={`side-menus ${isActive('/lead-status')}`}>
                            <Link className="nav-link" to="/lead-status">
                                <i className="fas fa-lg fa-blender-phone"></i>
                                <span className="menu-text-wrap">Lead Status</span>
                            </Link>
                        </li>
                        <li className={`side-menus ${isActive('/lead-sources')}`}>
                            <Link className="nav-link" to="/lead-sources">
                                <i className="fas fa-lg fa-globe"></i>
                                <span className="menu-text-wrap">Lead Sources</span>
                            </Link>
                        </li>
                        <li className={`side-menus ${isActive('/leads')}`}>
                            <Link className="nav-link" to="/leads">
                                <i className="fas fa-lg fa-tty"></i>
                                <span className="menu-text-wrap">Leads</span>
                            </Link>
                        </li>
                    </ul>
                </li>

                <li className="menu-header side-menus">Projects</li>
                <li className={`side-menus ${isActive('/projects')}`}>
                    <Link className="nav-link" to="/projects">
                        <i className="fas fa-lg fa-layer-group"></i>
                        <span className="menu-text-wrap">Projects</span>
                    </Link>
                </li>
                <li className={`side-menus ${isActive('/tasks')}`}>
                    <Link className="nav-link" to="/tasks">
                        <i className="fas fa-lg fa-tasks"></i>
                        <span className="menu-text-wrap">Tasks</span>
                    </Link>
                </li>
                <li className={`nav-item dropdown side-menus ${openDropdowns['tickets'] ? 'active' : ''}`}>
                    <a href="#" className="nav-link has-dropdown" onClick={(e) => toggleDropdown(e, 'tickets')}>
                        <i className="fas fa-lg fa-ticket-alt"></i>
                        <span>Tickets</span>
                    </a>
                    <ul className={`dropdown-menu side-menus ${openDropdowns['tickets'] ? 'show' : ''}`} style={{ display: openDropdowns['tickets'] ? 'block' : 'none' }}>
                        <li className={`side-menus ${isActive('/ticket-priorities')}`}>
                            <Link className="nav-link" to="/ticket-priorities">
                                <i className="fas fa-lg fa-sticky-note"></i>
                                <span className="menu-text-wrap">Ticket Priorities</span>
                            </Link>
                        </li>
                        <li className={`side-menus ${isActive('/ticket-statuses')}`}>
                            <Link className="nav-link" to="/ticket-statuses">
                                <i className="fas fa-lg fa-info-circle"></i>
                                <span className="menu-text-wrap">Ticket Status</span>
                            </Link>
                        </li>
                        <li className={`side-menus ${isActive('/predefined-replies')}`}>
                            <Link className="nav-link" to="/predefined-replies">
                                <i className="fas fa-lg fa-reply"></i>
                                <span className="menu-text-wrap">Predefined Replies</span>
                            </Link>
                        </li>
                        <li className={`side-menus ${isActive('/tickets')}`}>
                            <Link className="nav-link" to="/tickets">
                                <i className="fas fa-lg fa-ticket-alt"></i>
                                <span className="menu-text-wrap">Tickets</span>
                            </Link>
                        </li>
                    </ul>
                </li>

                <li className="menu-header side-menus">Sales</li>
                <li className={`nav-item dropdown side-menus ${openDropdowns['sales'] ? 'active' : ''}`}>
                    <a href="#" className="nav-link has-dropdown" onClick={(e) => toggleDropdown(e, 'sales')}>
                        <i className="fab fa-lg fa-speakap"></i>
                        <span>Sales</span>
                    </a>
                    <ul className={`dropdown-menu side-menus ${openDropdowns['sales'] ? 'show' : ''}`} style={{ display: openDropdowns['sales'] ? 'block' : 'none' }}>
                        <li className={`side-menus ${isActive('/invoices')}`}>
                            <Link className="nav-link" to="/invoices">
                                <i className="fas fa-lg fa-file-invoice"></i>
                                <span className="menu-text-wrap">Invoices</span>
                            </Link>
                        </li>
                        <li className={`side-menus ${isActive('/credit-notes')}`}>
                            <Link className="nav-link" to="/credit-notes">
                                <i className="fas fa-lg fa-clipboard"></i>
                                <span className="menu-text-wrap">Credit Notes</span>
                            </Link>
                        </li>
                        <li className={`side-menus ${isActive('/proposals')}`}>
                            <Link className="nav-link" to="/proposals">
                                <i className="fas fa-lg fa-scroll"></i>
                                <span className="menu-text-wrap">Proposals</span>
                            </Link>
                        </li>
                        <li className={`side-menus ${isActive('/estimates')}`}>
                            <Link className="nav-link" to="/estimates">
                                <i className="fas fa-lg fa-calculator"></i>
                                <span className="menu-text-wrap">Estimates</span>
                            </Link>
                        </li>
                        <li className={`side-menus ${isActive('/payments-list')}`}>
                            <Link className="nav-link" to="/payments-list">
                                <i className="fas fa-lg fa-money-check-alt"></i>
                                <span className="menu-text-wrap">Payments</span>
                            </Link>
                        </li>
                    </ul>
                </li>

                <li className="menu-header side-menus">Support</li>
                <li className={`side-menus ${isActive('/departments')}`}>
                    <Link className="nav-link" to="/departments">
                        <i className="fas fa-lg fa-columns"></i>
                        <span className="menu-text-wrap">Departments</span>
                    </Link>
                </li>

                <li className="menu-header side-menus">Expenses</li>
                <li className={`nav-item dropdown side-menus ${openDropdowns['expenses'] ? 'active' : ''}`}>
                    <a href="#" className="nav-link has-dropdown" onClick={(e) => toggleDropdown(e, 'expenses')}>
                        <i className="fab fa-lg fa-erlang"></i>
                        <span>Expenses</span>
                    </a>
                    <ul className={`dropdown-menu side-menus ${openDropdowns['expenses'] ? 'show' : ''}`} style={{ display: openDropdowns['expenses'] ? 'block' : 'none' }}>
                        <li className={`side-menus ${isActive('/expense-categories')}`}>
                            <Link className="nav-link" to="/expense-categories">
                                <i className="fas fa-lg fa-list-ol"></i>
                                <span className="menu-text-wrap">Expense Categories</span>
                            </Link>
                        </li>
                        <li className={`side-menus ${isActive('/expenses')}`}>
                            <Link className="nav-link" to="/expenses">
                                <i className="fab fa-lg fa-erlang"></i>
                                <span className="menu-text-wrap">Expenses</span>
                            </Link>
                        </li>
                    </ul>
                </li>

                <li className={`side-menus ${isActive('/payment-modes')}`}>
                    <Link className="nav-link" to="/payment-modes">
                        <i className="fab fa-lg fa-product-hunt"></i>
                        <span className="menu-text-wrap">Payment Modes</span>
                    </Link>
                </li>
                <li className={`side-menus ${isActive('/tax-rates')}`}>
                    <Link className="nav-link" to="/tax-rates">
                        <i className="fas fa-lg fa-percent"></i>
                        <span className="menu-text-wrap">Tax Rates</span>
                    </Link>
                </li>

                <li className="menu-header side-menus">Others</li>
                <li className={`side-menus ${isActive('/announcements')}`}>
                    <Link className="nav-link" to="/announcements">
                        <i className="fas fa-lg fa-bullhorn"></i>
                        <span className="menu-text-wrap">Announcements</span>
                    </Link>
                </li>

                <li className={`nav-item dropdown side-menus ${openDropdowns['products'] ? 'active' : ''}`}>
                    <a href="#" className="nav-link has-dropdown" onClick={(e) => toggleDropdown(e, 'products')}>
                        <i className="fas fa-lg fa-sitemap"></i>
                        <span>Products</span>
                    </a>
                    <ul className={`dropdown-menu side-menus ${openDropdowns['products'] ? 'show' : ''}`} style={{ display: openDropdowns['products'] ? 'block' : 'none' }}>
                        <li className={`side-menus ${isActive('/products')}`}>
                            <Link className="nav-link" to="/products">
                                <i className="fas fa-lg fa-sitemap"></i>
                                <span className="menu-text-wrap">Products</span>
                            </Link>
                        </li>
                        <li className={`side-menus ${isActive('/product-groups')}`}>
                            <Link className="nav-link" to="/product-groups">
                                <i className="fas fa-lg fa-object-group"></i>
                                <span className="menu-text-wrap">Product Groups</span>
                            </Link>
                        </li>
                    </ul>
                </li>

                <li className={`nav-item dropdown side-menus ${openDropdowns['contracts'] ? 'active' : ''}`}>
                    <a href="#" className="nav-link has-dropdown" onClick={(e) => toggleDropdown(e, 'contracts')}>
                        <i className="fas fa-lg fa-file-signature"></i>
                        <span>Contracts</span>
                    </a>
                    <ul className={`dropdown-menu side-menus ${openDropdowns['contracts'] ? 'show' : ''}`} style={{ display: openDropdowns['contracts'] ? 'block' : 'none' }}>
                        <li className={`side-menus ${isActive('/contracts')}`}>
                            <Link className="nav-link" to="/contracts">
                                <i className="fas fa-lg fa-file-signature"></i>
                                <span className="menu-text-wrap">Contracts</span>
                            </Link>
                        </li>
                        <li className={`side-menus ${isActive('/contract-types')}`}>
                            <Link className="nav-link" to="/contract-types">
                                <i className="fas fa-lg fa-file-contract"></i>
                                <span className="menu-text-wrap">Contract Types</span>
                            </Link>
                        </li>
                    </ul>
                </li>

                <li className={`side-menus ${isActive('/goals')}`}>
                    <Link className="nav-link" to="/goals">
                        <i className="fas fa-lg fa-bullseye"></i>
                        <span className="menu-text-wrap">Goals</span>
                    </Link>
                </li>

                <li className="menu-header side-menus">CMS</li>
                <li className={`side-menus ${isActive('/services')}`}>
                    <Link className="nav-link" to="/services">
                        <i className="fab fa-lg fa-stripe-s"></i>
                        <span className="menu-text-wrap">Services</span>
                    </Link>
                </li>
                <li className={`side-menus ${isActive('/settings')}`}>
                    <Link className="nav-link" to="/settings">
                        <i className="nav-icon fa-lg fas fa-cogs"></i>
                        <span className="menu-text-wrap">Settings</span>
                    </Link>
                </li>

                <li className={`side-menus ${isActive('/countries')}`}>
                    <Link className="nav-link" to="/countries">
                        <i className="fas fa-lg fa-globe-asia"></i>
                        <span className="menu-text-wrap">Countries</span>
                    </Link>
                </li>
                <li className={`side-menus ${isActive('/activity-logs')}`}>
                    <Link className="nav-link" to="/activity-logs">
                        <i className="fas fa-clipboard-check fa-lg"></i>
                        <span className="menu-text-wrap">Activity Logs</span>
                    </Link>
                </li>
                <li className={`side-menus ${isActive('/translation-manager')}`}>
                    <Link className="nav-link" to="/translation-manager">
                        <i className="fas fa-language"></i>
                        <span className="menu-text-wrap">Translation Manager</span>
                    </Link>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;
