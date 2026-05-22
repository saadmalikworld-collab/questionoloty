import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CalculatorPage from './pages/CalculatorPage';
import { UsersPage, RolesPage, ClientsPage, CurrenciesPage, InsurancePage, CountryConfigPage } from './pages/AdminPages';

const Guard = ({ children, adminOnly }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  if (!user) return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*"      element={<Navigate to="/login" replace />} />
    </Routes>
  );
  return (
    <Layout>
      <Routes>
        <Route path="/"                    element={<Guard><DashboardPage /></Guard>} />
        <Route path="/calculator"          element={<Guard><CalculatorPage /></Guard>} />
        <Route path="/admin/users"         element={<Guard adminOnly><UsersPage /></Guard>} />
        <Route path="/admin/roles"         element={<Guard adminOnly><RolesPage /></Guard>} />
        <Route path="/admin/clients"       element={<Guard adminOnly><ClientsPage /></Guard>} />
        <Route path="/admin/currencies"    element={<Guard adminOnly><CurrenciesPage /></Guard>} />
        <Route path="/admin/insurance"     element={<Guard adminOnly><InsurancePage /></Guard>} />
        <Route path="/admin/country-config"element={<Guard adminOnly><CountryConfigPage /></Guard>} />
        <Route path="/login"               element={<Navigate to="/" replace />} />
        <Route path="*"                    element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration:3000, style:{ fontSize:13.5, borderRadius:8, fontFamily:'Inter,sans-serif' } }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
