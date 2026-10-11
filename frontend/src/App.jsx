import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientDashboard from './pages/PatientDashboard';
import PatientList from './pages/Patients/List';
import AppointmentList from './pages/Appointments/List';
import ProcedureList from './pages/Procedures/List';
import UserList from './pages/Users/List';
import AuditList from './pages/Audit/List';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import { MotionConfig } from 'framer-motion';

function PrivateRoute({ children }) {
  const { signed, loading, user } = useAuth();

  if (loading) {
    return <div role="status" className="min-h-screen flex items-center justify-center">Carregando sua sessão…</div>;
  }

  if (!signed || user?.first_access) {
    return <Navigate to="/login" />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  const isPatient = user?.role === 'patient';

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            {isPatient ? <PatientDashboard /> : <Dashboard />}
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/patients" element={
        <PrivateRoute>
          <Layout><PatientList /></Layout>
        </PrivateRoute>
      } />
      <Route path="/appointments" element={
        <PrivateRoute>
          <Layout><AppointmentList /></Layout>
        </PrivateRoute>
      } />
      <Route path="/procedures" element={
        <PrivateRoute>
          <Layout><ProcedureList /></Layout>
        </PrivateRoute>
      } />
      <Route path="/users" element={
        <PrivateRoute>
          <Layout><UserList /></Layout>
        </PrivateRoute>
      } />
      <Route path="/audit" element={
        <PrivateRoute>
          <Layout><AuditList /></Layout>
        </PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute>
          <Layout><Profile /></Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }}>
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Toaster position="top-right" />
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </AuthProvider>
    </MotionConfig>
  );
}
