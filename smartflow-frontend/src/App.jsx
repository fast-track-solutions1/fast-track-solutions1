import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import ParametrageSociete from './pages/Admin/ParametrageSociete';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifiez le token au chargement
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    console.log('🔍 Vérification du token:', token ? '✅ Présent' : '❌ Absent');
    setIsAuthenticated(!!token);
    setLoading(false);
  };

  // Vérifiez régulièrement le token (toutes les 500ms)
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('access_token');
      if (token) {
        console.log('🔄 Token détecté, mise à jour isAuthenticated');
        setIsAuthenticated(true);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>⏳ Chargement...</h2>
      </div>
    );
  }

  console.log('📊 État App.jsx - isAuthenticated:', isAuthenticated);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/admin/parametrage-societe" 
            element={isAuthenticated ? <Layout><ParametrageSociete /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
