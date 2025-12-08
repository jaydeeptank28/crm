import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Get user from localStorage or API
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                setUser({ first_name: 'Admin', full_name: 'Admin User' });
            }
        }
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const toggleSidebar = (e) => {
        e.preventDefault();
        document.body.classList.toggle('sidebar-mini');
    };

    return (
        <div id="app">
            <div className="main-wrapper main-wrapper-1">
                <div className="navbar-bg"></div>
                <nav className="navbar navbar-expand-lg main-navbar">
                    {/* Header - Exact match to layouts/header.blade.php */}
                    <form className="form-inline mr-auto" action="#">
                        <ul className="navbar-nav mr-3">
                            <li>
                                <a href="#" data-toggle="sidebar" className="nav-link nav-link-lg" onClick={toggleSidebar}>
                                    <i className="fas fa-bars"></i>
                                </a>
                            </li>
                            <li>
                                <a href="#" data-toggle="search" className="nav-link nav-link-lg d-sm-none">
                                    <i className="fas fa-search"></i>
                                </a>
                            </li>
                        </ul>
                        <div className="search-element">
                            <input className="form-control search-input-css" type="text" id="searchCustomer" disabled
                                placeholder="Search Customers..." aria-label="Search" autoComplete="off" />
                            <button className="btn" type="submit"><i className="fas fa-search"></i></button>
                            <div className="search-backdrop"></div>
                            <div className="search-result search-result-mobile-w">
                                <div id="customerName" className="py-2">
                                    <h6 className="py-1 px-3 my-0">
                                        <i className="fab fa fa-search text-primary"></i> Search Results
                                    </h6>
                                </div>
                            </div>
                        </div>
                    </form>
                    <ul className="navbar-nav navbar-right">
                        <li className="dropdown dropdown-list-toggle">
                            <a href="#" data-toggle="dropdown" className="nav-link notification-toggle nav-link-lg"
                                title="Notifications" onClick={(e) => e.preventDefault()}>
                                <i className="far fa-bell"></i>
                            </a>
                            <div className="dropdown-menu dropdown-list dropdown-menu-right" id="notification">
                                <div className="dropdown-header">
                                    <div className="row justify-content-between">
                                        <div className="px-3">Notifications</div>
                                        <div className="px-3" id="allRead">
                                            <a href="#" className="text-decoration-none" onClick={(e) => e.preventDefault()}>
                                                Mark all as read
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="dropdown-list-content dropdown-list-icons notification-content"
                                    style={{ overflowY: 'auto' }}>
                                    <div className="empty-state empty-notification" data-height="300" style={{ padding: '0px 40px' }}>
                                        <div className="empty-state-icon">
                                            <i className="fas fa-question mt-4"></i>
                                        </div>
                                        <h2>No notifications</h2>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                    <ul className="navbar-nav navbar-right">
                        <li className="dropdown">
                            <a href="#" data-toggle="dropdown" className="nav-link dropdown-toggle nav-link-lg nav-link-user"
                                onClick={(e) => e.preventDefault()}>
                                <img alt="image" width="50" id="loginUserImage"
                                    src={user?.image_url ? `${API_URL}${user.image_url}` : '/assets/img/avatar/avatar-1.png'}
                                    className="rounded-circle user-avatar-image"
                                    onError={(e) => { e.target.onerror = null; e.target.src = '/assets/img/avatar/avatar-1.png'; }} />
                                <div className="d-sm-none d-lg-inline-block">
                                    Hi, {user?.first_name || 'Admin'}
                                </div>
                            </a>
                            <div className="dropdown-menu dropdown-menu-right">
                                <div className="dropdown-title">
                                    Welcome, {user?.full_name || user?.first_name || 'Admin'}
                                </div>
                                <a href="#" className="dropdown-item has-icon" onClick={(e) => e.preventDefault()}>
                                    <i className="far fa-user mr-2"></i>Edit Profile
                                </a>
                                <a className="dropdown-item has-icon" href="#" onClick={(e) => e.preventDefault()}>
                                    <i className="fa fa-lock mr-2"></i>
                                    <div className="change-pass-wrap">Change Password</div>
                                </a>
                                <a className="dropdown-item" href="#" onClick={(e) => e.preventDefault()}>
                                    <i className="fa fa-language mr-2"></i>Change Language
                                </a>
                                <div className="dropdown-divider"></div>
                                <a href="#" className="dropdown-item has-icon text-danger" onClick={handleLogout}>
                                    <i className="fas fa-sign-out-alt"></i> Logout
                                </a>
                            </div>
                        </li>
                    </ul>
                </nav>

                {/* Sidebar - Exact match to layouts/sidebar.blade.php structure */}
                <div className="main-sidebar sidebar-style-2">
                    <Sidebar />
                </div>

                {/* Main Content */}
                <div className="main-content">
                    {children}
                </div>

                {/* Footer - Exact match to layouts/footer.blade.php */}
                <footer className="main-footer">
                    <div className="row mx-0 productFooter">
                        <div className="col-md-12">
                            All rights reserved &copy; {new Date().getFullYear()}{' '}
                            <a href="#">InfyCRM</a>
                            <span className="float-right version_name">v1.0.0</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Layout;
