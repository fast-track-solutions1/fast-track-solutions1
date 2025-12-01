import React, { useEffect, useState } from 'react';
import './Annuaire.css';

export default function Annuaire() {
  const [annuaire, setAnnuaire] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchAnnuaire();
  }, []);

  const fetchAnnuaire = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/salaries/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAnnuaire(data);
        // Extraire les départements uniques
        const depts = [...new Set(data.map(s => s.departement?.nom).filter(Boolean))];
        setDepartments(depts);
      } else {
        setError('Erreur lors du chargement de l\'annuaire');
      }
    } catch (err) {
      setError('Erreur de connexion: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnuaire = annuaire.filter(s => {
    const matchSearch = !searchTerm || 
      s.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchDept = !filterDept || s.departement?.nom === filterDept;
    
    return matchSearch && matchDept;
  });

  if (loading) {
    return <div className="loading">⏳ Chargement de l'annuaire...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="annuaire-container">
      <div className="annuaire-header">
        <h2>Annuaire</h2>
        <p>Répertoire complet des salariés et contacts</p>
      </div>

      <div className="annuaire-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select 
            value={filterDept} 
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="">Tous les départements</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="annuaire-grid">
        {filteredAnnuaire.length > 0 ? (
          filteredAnnuaire.map(s => (
            <div key={s.id} className="annuaire-card">
              <div className="card-header">
                <h3>{s.prenom} {s.nom}</h3>
                <span className="badge">{s.departement?.nom || 'N/A'}</span>
              </div>
              <div className="card-body">
                <p><strong>Email:</strong> {s.email || '-'}</p>
                <p><strong>Téléphone:</strong> {s.telephon || '-'}</p>
                <p><strong>Poste:</strong> {s.grade?.nom || '-'}</p>
                <p><strong>Service:</strong> {s.service?.nom || '-'}</p>
              </div>
              <div className="card-actions">
                <a href={`mailto:${s.email}`} className="btn-contact">📧 Contacter</a>
                <button className="btn-details">👁️ Détails</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">Aucun contact trouvé</div>
        )}
      </div>

      <div className="annuaire-footer">
        <p>Total: {filteredAnnuaire.length} contact(s)</p>
      </div>
    </div>
  );
}
