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
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

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

  if (loading) {
    return (
      <div className="loading">
        ⏳ Chargement...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="stats-cards">
        <div className="stat-card">
          <h3>Employés</h3>
          <p className="stat-number">{stats.totalEmployees}</p>
        </div>
        <div className="stat-card">
          <h3>Demandes Actives</h3>
          <p className="stat-number">{stats.activeRequests}</p>
        </div>
        <div className="stat-card">
          <h3>En Attente</h3>
          <p className="stat-number">{stats.pendingApprovals}</p>
        </div>
        <div className="stat-card">
          <h3>Départements</h3>
          <p className="stat-number">{stats.totalDepartments}</p>
        </div>
      </div>
      <div className="dashboard-body">
        <h2>Bienvenue sur le tableau de bord RH ! 🎉</h2>
        <p>Vous êtes connecté avec succès.</p>
        <p>Les données de l'API s'affichent ci-dessous :</p>
        <pre className="data-preview">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}
