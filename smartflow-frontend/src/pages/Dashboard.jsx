import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeRequests: 0,
    pendingApprovals: 0,
    totalDepartments: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifiez si l'utilisateur est authentifié
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Récupérez les informations de l'utilisateur
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/salaries/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📊 Données reçues:', data);
          setUser(data);
          
          // Mettez à jour les stats
          setStats({
            totalEmployees: data.length || 0,
            activeRequests: 12,
            pendingApprovals: 5,
            totalDepartments: 15,
          });
        } else {
          console.error('Erreur API:', response.status);
        }
      } catch (err) {
        console.error('Erreur de connexion:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  if (loading) {
    return <div className="dashboard-container"><p>⏳ Chargement...</p></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>✅ MSI TeamHub - Dashboard</h1>
        <button onClick={handleLogout} className="btn-logout">🚪 Déconnexion</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.totalEmployees}</h3>
          <p>Employés</p>
        </div>
        <div className="stat-card">
          <h3>{stats.activeRequests}</h3>
          <p>Demandes Actives</p>
        </div>
        <div className="stat-card">
          <h3>{stats.pendingApprovals}</h3>
          <p>En Attente</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalDepartments}</h3>
          <p>Départements</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="card">
          <h2>✨ Bienvenue !</h2>
          <p>Vous êtes connecté avec succès ! 🎉</p>
          <p>Les données de l'API s'affichent ci-dessous :</p>
        </div>

        <div className="card">
          <h3>📊 Données API (JSON)</h3>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
