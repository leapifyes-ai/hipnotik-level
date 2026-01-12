import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Sales from './pages/Sales';
import Packs from './pages/Packs';
import Incidents from './pages/Incidents';
import Objectives from './pages/Objectives';
import Fichajes from './pages/Fichajes';
import Contacts from './pages/Contacts';
import Calculator from './pages/Calculator';
import Reports from './pages/Reports';
import Commissions from './pages/Commissions';
import Help from './pages/Help';
import Settings from './pages/Settings';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
      <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
      <Route path="/packs" element={<PrivateRoute><Packs /></PrivateRoute>} />
      <Route path="/incidents" element={<PrivateRoute><Incidents /></PrivateRoute>} />
      <Route path="/objectives" element={<PrivateRoute><Objectives /></PrivateRoute>} />
      <Route path="/fichajes" element={<PrivateRoute><Fichajes /></PrivateRoute>} />
      <Route path="/contacts" element={<PrivateRoute><Contacts /></PrivateRoute>} />
      <Route path="/calculator" element={<PrivateRoute><Calculator /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
      <Route path="/commissions" element={<PrivateRoute><Commissions /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
