import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Basic frontend validation
        const newErrors = {};
        if (!email) newErrors.email = 'Please fill in your email';
        if (!password) newErrors.password = 'Please fill in your password';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
                remember
            });

            const { token, user } = response.data.data; // Assuming standardized API response structure

            // Store token
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Redirect to dashboard (or home for now)
            navigate('/dashboard');

        } catch (err) {
            console.error('Login error:', err);
            if (err.response && err.response.data && err.response.data.errors) {
                // Handle validation errors from backend
                const backendErrors = {};
                err.response.data.errors.forEach(error => {
                    backendErrors[error.path] = error.msg;
                });
                setErrors(backendErrors);
            } else if (err.response && err.response.data && err.response.data.message) {
                // Handle general error message (e.g., invalid credentials)
                setErrors({ email: err.response.data.message });
            } else {
                setErrors({ email: 'An error occurred. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="app">
            <section className="section">
                <div className="container mt-5">
                    <div className="row">
                        <div className="col-md-6 offset-md-3">
                            <div className="login-brand">
                                <img src="/assets/img/infyom-logo.png" alt="logo" width="100" className="shadow-light" />
                            </div>

                            <div className="card card-primary">
                                <div className="card-header"><h4>Login</h4></div>

                                <div className="card-body">
                                    <form method="POST" action="#" onSubmit={handleSubmit}>
                                        <div className="form-group">
                                            <label htmlFor="email">Email<span className="text-danger">*</span></label>
                                            <input
                                                id="email"
                                                type="email"
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                name="email"
                                                tabIndex="1"
                                                required
                                                autoFocus
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                            <div className="invalid-feedback">
                                                {errors.email}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <div className="d-block">
                                                <label htmlFor="password" className="control-label">Password<span className="text-danger">*</span></label>
                                                <div className="float-right">
                                                    <a href="/auth/forgot-password" className="text-small">
                                                        Forgot Password?
                                                    </a>
                                                </div>
                                            </div>
                                            <input
                                                id="password"
                                                type="password"
                                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                name="password"
                                                tabIndex="2"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <div className="invalid-feedback">
                                                {errors.password}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <div className="custom-control custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    name="remember"
                                                    className="custom-control-input"
                                                    tabIndex="3"
                                                    id="remember-me"
                                                    checked={remember}
                                                    onChange={(e) => setRemember(e.target.checked)}
                                                />
                                                <label className="custom-control-label" htmlFor="remember-me">Remember Me</label>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <button type="submit" className="btn btn-primary btn-lg btn-block" tabIndex="4" disabled={loading}>
                                                {loading ? 'Logging in...' : 'Login'}
                                            </button>
                                        </div>
                                    </form>
                                    <div className="mt-5 text-muted text-center">
                                        Don't have an account? <a href="/auth/register">Create One</a>
                                    </div>
                                </div>
                            </div>
                            <div className="simple-footer">
                                All rights reserved &copy; {new Date().getFullYear()} InfyCRM
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Login;
