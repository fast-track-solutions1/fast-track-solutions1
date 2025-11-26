import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';

import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import ParametrageSociete from './pages/Admin/ParametrageSociete';
import Salaries from './pages/Salaries';
import Annuaire from './pages/Annuaire';
import Organigramme from './pages/Organigramme';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAuth(); }, []);
  useEffect(() => {
    const interval = setInterval(checkAuth, 500);
    return () => clearInterval(interval);
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>
        <h2>⏳ Chargement...</h2>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={
            !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
          }/>
          <Route
            element={
              isAuthenticated
                ? <MainLayout />
                : <Navigate to="/login" replace />
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/salaries" element={<Salaries />} />
            <Route path="/annuaire" element={<Annuaire />} />
            <Route path="/organigramme" element={<Organigramme />} />
            <Route path="/admin/parametrage-societe" element={<ParametrageSociete />} />
          </Route>
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
