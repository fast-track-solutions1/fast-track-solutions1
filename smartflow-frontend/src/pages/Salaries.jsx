import React, { useEffect, useState } from 'react';
import './Salaries.css';

export default function Salaries() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
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
        setSalaries(data);
      } else {
        setError('Erreur lors du chargement des salariés');
      }
    } catch (err) {
      setError('Erreur de connexion: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSalaries = salaries.filter(s =>
    s.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">⏳ Chargement des salariés...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="salaries-container">
      <div className="salaries-header">
        <h2>Gestion des Salariés</h2>
        <button className="btn-add">+ Ajouter un salarié</button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Rechercher par nom, prénom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="salaries-table">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Département</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSalaries.length > 0 ? (
              filteredSalaries.map(s => (
                <tr key={s.id}>
                  <td>{s.nom || '-'}</td>
                  <td>{s.prenom || '-'}</td>
                  <td>{s.email || '-'}</td>
                  <td>{s.telephon || '-'}</td>
                  <td>{s.departement?.nom || '-'}</td>
                  <td>
                    <button className="btn-edit">✏️ Modifier</button>
                    <button className="btn-delete">🗑️ Supprimer</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">Aucun salarié trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="salaries-footer">
        <p>Total: {filteredSalaries.length} salarié(s)</p>
      </div>
    </div>
  );
}
