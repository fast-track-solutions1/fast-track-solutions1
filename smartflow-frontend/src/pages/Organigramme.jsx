import React, { useEffect, useState } from 'react';
import './Organigramme.css';

export default function Organigramme() {
  const [organisations, setOrganisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrg, setExpandedOrg] = useState(null);

  useEffect(() => {
    fetchOrganisations();
  }, []);

  const fetchOrganisations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/organisations/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrganisations(data);
      } else {
        setError('Erreur lors du chargement de l\'organigramme');
      }
    } catch (err) {
      setError('Erreur de connexion: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (orgId) => {
    setExpandedOrg(expandedOrg === orgId ? null : orgId);
  };

  if (loading) {
    return <div className="loading">⏳ Chargement de l'organigramme...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="organigramme-container">
      <div className="organigramme-header">
        <h2>Organigramme</h2>
        <p>Structure organisationnelle de l'entreprise</p>
      </div>

      {organisations.length > 0 ? (
        <div className="organigramme-tree">
          {organisations.map(org => (
            <div key={org.id} className="org-node">
              <div 
                className="org-card"
                onClick={() => toggleExpand(org.id)}
              >
                <div className="org-info">
                  <h3>{org.nom}</h3>
                  <p className="org-type">{org.type || 'Organisation'}</p>
                </div>
                <div className="org-toggle">
                  {org.departements && org.departements.length > 0 && (
                    <span className="toggle-icon">
                      {expandedOrg === org.id ? '▼' : '▶'}
                    </span>
                  )}
                </div>
              </div>

              {expandedOrg === org.id && org.departements && org.departements.length > 0 && (
                <div className="org-children">
                  {org.departements.map(dept => (
                    <div key={dept.id} className="dept-node">
                      <div className="dept-card">
                        <h4>{dept.nom}</h4>
                        <p className="dept-numero">Département #{dept.numero}</p>
                        {dept.responsable && (
                          <p className="dept-responsable">
                            Chef: {dept.responsable.prenom} {dept.responsable.nom}
                          </p>
                        )}
                      </div>

                      {dept.services && dept.services.length > 0 && (
                        <div className="services-list">
                          {dept.services.map(service => (
                            <div key={service.id} className="service-item">
                              <span className="service-name">{service.nom}</span>
                              {service.description && (
                                <span className="service-desc">{service.description}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data">Aucune organisation trouvée</div>
      )}

      <div className="organigramme-footer">
        <p>Total: {organisations.length} organisation(s)</p>
      </div>
    </div>
  );
}
