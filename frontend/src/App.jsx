import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members/Members';
import MemberCreate from './pages/Members/MemberCreate';
import MemberEdit from './pages/Members/MemberEdit';
import MemberDetail from './pages/Members/MemberDetail';
import Layout from './components/Layout/Layout';

// Protected Route - redirects to login if not authenticated, wraps with Layout
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    // Wrap with Layout to show sidebar, header, footer
    return <Layout>{children}</Layout>;
};

// Guest Route - redirects to dashboard if already authenticated
const GuestRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Login - redirect to dashboard if already logged in */}
                <Route path="/login" element={
                    <GuestRoute>
                        <Login />
                    </GuestRoute>
                } />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                {/* Members Routes */}
                <Route path="/members" element={
                    <ProtectedRoute>
                        <Members />
                    </ProtectedRoute>
                } />
                <Route path="/members/create" element={
                    <ProtectedRoute>
                        <MemberCreate />
                    </ProtectedRoute>
                } />
                <Route path="/members/:id" element={
                    <ProtectedRoute>
                        <MemberDetail />
                    </ProtectedRoute>
                } />
                <Route path="/members/:id/edit" element={
                    <ProtectedRoute>
                        <MemberEdit />
                    </ProtectedRoute>
                } />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    )
}

export default App;
