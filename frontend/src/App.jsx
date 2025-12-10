import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members/Members';
import MemberCreate from './pages/Members/MemberCreate';
import MemberEdit from './pages/Members/MemberEdit';
import MemberDetail from './pages/Members/MemberDetail';
import Leads from './pages/Leads/Leads';
import LeadCreate from './pages/Leads/LeadCreate';
import LeadEdit from './pages/Leads/LeadEdit';
import LeadDetail from './pages/Leads/LeadDetail';
import LeadStatuses from './pages/Leads/LeadStatuses';
import LeadSources from './pages/Leads/LeadSources';
import LeadChart from './pages/Leads/LeadChart';
import LeadKanban from './pages/Leads/LeadKanban';
import Tasks from './pages/Tasks/Tasks';
import TaskCreate from './pages/Tasks/TaskCreate';
import TaskEdit from './pages/Tasks/TaskEdit';
import TaskDetail from './pages/Tasks/TaskDetail';
import TaskKanban from './pages/Tasks/TaskKanban';
import CustomerGroups from './pages/CustomerGroups/CustomerGroups';
import Customers from './pages/Customers/Customers';
import CustomerCreate from './pages/Customers/CustomerCreate';
import CustomerEdit from './pages/Customers/CustomerEdit';
import CustomerDetail from './pages/Customers/CustomerDetail';
import Projects from './pages/Projects/Projects';
import ProjectCreate from './pages/Projects/ProjectCreate';
import ProjectEdit from './pages/Projects/ProjectEdit';
import ProjectDetail from './pages/Projects/ProjectDetail';
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
                {/* Lead Status Routes */}
                <Route path="/lead-status" element={
                    <ProtectedRoute>
                        <LeadStatuses />
                    </ProtectedRoute>
                } />
                <Route path="/lead-statuses" element={
                    <ProtectedRoute>
                        <LeadStatuses />
                    </ProtectedRoute>
                } />
                {/* Lead Sources Routes */}
                <Route path="/lead-sources" element={
                    <ProtectedRoute>
                        <LeadSources />
                    </ProtectedRoute>
                } />
                {/* Lead Chart Route */}
                <Route path="/lead-chart" element={
                    <ProtectedRoute>
                        <LeadChart />
                    </ProtectedRoute>
                } />
                {/* Lead Kanban Route */}
                <Route path="/lead-kanban" element={
                    <ProtectedRoute>
                        <LeadKanban />
                    </ProtectedRoute>
                } />
                {/* Leads Routes */}
                <Route path="/leads" element={
                    <ProtectedRoute>
                        <Leads />
                    </ProtectedRoute>
                } />
                <Route path="/leads/create" element={
                    <ProtectedRoute>
                        <LeadCreate />
                    </ProtectedRoute>
                } />
                <Route path="/leads/:id" element={
                    <ProtectedRoute>
                        <LeadDetail />
                    </ProtectedRoute>
                } />
                <Route path="/leads/:id/edit" element={
                    <ProtectedRoute>
                        <LeadEdit />
                    </ProtectedRoute>
                } />
                {/* Task Routes */}
                <Route path="/tasks" element={
                    <ProtectedRoute>
                        <Tasks />
                    </ProtectedRoute>
                } />
                <Route path="/tasks/create" element={
                    <ProtectedRoute>
                        <TaskCreate />
                    </ProtectedRoute>
                } />
                <Route path="/tasks/:id" element={
                    <ProtectedRoute>
                        <TaskDetail />
                    </ProtectedRoute>
                } />
                <Route path="/tasks/:id/edit" element={
                    <ProtectedRoute>
                        <TaskEdit />
                    </ProtectedRoute>
                } />
                <Route path="/task-kanban" element={
                    <ProtectedRoute>
                        <TaskKanban />
                    </ProtectedRoute>
                } />
                {/* Customer Group Routes */}
                <Route path="/customer-groups" element={
                    <ProtectedRoute>
                        <CustomerGroups />
                    </ProtectedRoute>
                } />
                {/* Customer Routes */}
                <Route path="/customers" element={
                    <ProtectedRoute>
                        <Customers />
                    </ProtectedRoute>
                } />
                <Route path="/customers/create" element={
                    <ProtectedRoute>
                        <CustomerCreate />
                    </ProtectedRoute>
                } />
                <Route path="/customers/:id" element={
                    <ProtectedRoute>
                        <CustomerDetail />
                    </ProtectedRoute>
                } />
                <Route path="/customers/:id/edit" element={
                    <ProtectedRoute>
                        <CustomerEdit />
                    </ProtectedRoute>
                } />
                {/* Project Routes */}
                <Route path="/projects" element={
                    <ProtectedRoute>
                        <Projects />
                    </ProtectedRoute>
                } />
                <Route path="/projects/create" element={
                    <ProtectedRoute>
                        <ProjectCreate />
                    </ProtectedRoute>
                } />
                <Route path="/projects/:id" element={
                    <ProtectedRoute>
                        <ProjectDetail />
                    </ProtectedRoute>
                } />
                <Route path="/projects/:id/edit" element={
                    <ProtectedRoute>
                        <ProjectEdit />
                    </ProtectedRoute>
                } />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    )
}

export default App;

