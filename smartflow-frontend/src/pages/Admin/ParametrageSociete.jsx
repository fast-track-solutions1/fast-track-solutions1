import React, { useState, useEffect } from 'react';
import './ParametrageSociete.css';

export default function ParametrageSociete() {
  const [activeTab, setActiveTab] = useState('informations');
  const [societes, setSocietes] = useState([]);
  const [allDepartements, setAllDepartements] = useState([]);
  const [selectedSociete, setSelectedSociete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [searchDept, setSearchDept] = useState('');
  const [sortBy, setSortBy] = useState('numero');
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [editingDept, setEditingDept] = useState(null);
  const [societeDeptsAssigned, setSocieteDeptsAssigned] = useState([]);

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    code_postal: '',
    activite: '',
    clients: '',
    actif: true,
  });

  const [deptFormData, setDeptFormData] = useState({
    numero: '',
    nom: '',
    region: '',
    nombre_circuits: 1,
    actif: true,
    societe: null,
  });

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchSocietes();
    fetchAllDepartements();
  }, []);

  const fetchSocietes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/societes/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSocietes(data.results || data);
        if (data.results && data.results.length > 0) {
          handleSelectSociete(data.results[0]);
        }
      } else {
        setError('Erreur lors du chargement des societes');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Erreur de connexion a l API');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDepartements = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/departements/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllDepartements(data.results || data);
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const fetchSocieteDepartements = async (societeId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/departements/?societe=${societeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSocieteDeptsAssigned(data.results || data);
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleDeptInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDeptFormData({
      ...deptFormData,
      [name]: type === 'checkbox' ? checked : (name === 'nombre_circuits' ? parseInt(value) : (name === 'societe' ? parseInt(value) : value)),
    });
  };

  const handleSelectSociete = (societe) => {
    setSelectedSociete(societe);
    setFormData(societe);
    setIsEditing(false);
    setEditingType(null);
    setError('');
    setSuccessMessage('');
    setSearchDept('');
    setSortBy('numero');
    setSelectedDepts([]);
    setEditingDept(null);
    setDeptFormData({
      numero: '',
      nom: '',
      region: '',
      nombre_circuits: 1,
      actif: true,
      societe: societe.id,
    });
    fetchSocieteDepartements(societe.id);
  };

  const handleNewSociete = () => {
    setSelectedSociete(null);
    setFormData({
      nom: '',
      email: '',
      telephone: '',
      adresse: '',
      ville: '',
      code_postal: '',
      activite: '',
      clients: '',
      actif: true,
    });
    setIsEditing(true);
    setEditingType('societe');
    setError('');
  };

  const handleNewDepartement = () => {
    setEditingDept(null);
    setDeptFormData({
      numero: '',
      nom: '',
      region: '',
      nombre_circuits: 1,
      actif: true,
      societe: selectedSociete?.id || null,
    });
    setIsEditing(true);
    setEditingType('departement');
    setError('');
  };

  const handleEditDepartement = (dept) => {
    setEditingDept(dept);
    setDeptFormData({
      numero: dept.numero,
      nom: dept.nom,
      region: dept.region || '',
      nombre_circuits: dept.nombre_circuits || 1,
      actif: dept.actif,
      societe: dept.societe,
    });
    setIsEditing(true);
    setEditingType('departement');
    setError('');
  };

  const handleCreateSociete = async () => {
    if (!formData.nom.trim()) {
      setError('Le nom de la societe est obligatoire');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/societes/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newSociete = await response.json();
        setSocietes([...societes, newSociete]);
        handleSelectSociete(newSociete);
        setIsEditing(false);
        setEditingType(null);
        setSuccessMessage('Societe creee avec succes !');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setError('Erreur: ' + JSON.stringify(errorData));
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSociete = async () => {
    if (!selectedSociete) {
      setError('Aucune societe selectionnee');
      return;
    }

    if (!formData.nom.trim()) {
      setError('Le nom de la societe est obligatoire');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/societes/${selectedSociete.id}/`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const updatedSociete = await response.json();
        handleSelectSociete(updatedSociete);
        setSocietes(
          societes.map((s) => (s.id === updatedSociete.id ? updatedSociete : s))
        );
        setIsEditing(false);
        setEditingType(null);
        setSuccessMessage('Societe mise a jour avec succes !');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setError('Erreur: ' + JSON.stringify(errorData));
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSociete = async (societeId) => {
    if (!window.confirm('Etes-vous sur de vouloir supprimer cette societe ?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/societes/${societeId}/`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok || response.status === 204) {
        setSocietes(societes.filter((s) => s.id !== societeId));
        setSelectedSociete(null);
        setFormData({
          nom: '',
          email: '',
          telephone: '',
          adresse: '',
          ville: '',
          code_postal: '',
          activite: '',
          clients: '',
          actif: true,
        });
        setSuccessMessage('Societe supprimee !');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartement = async () => {
    if (!deptFormData.numero.trim() || !deptFormData.nom.trim()) {
      setError('Le numero et le nom du departement sont obligatoires');
      return;
    }

    if (!deptFormData.societe) {
      setError('Vous devez selectionner une societe');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/departements/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deptFormData),
      });

      if (response.ok) {
        const newDept = await response.json();
        setAllDepartements([...allDepartements, newDept]);
        setIsEditing(false);
        setEditingType(null);
        setSuccessMessage('Departement cree avec succes !');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchSocieteDepartements(deptFormData.societe);
      } else {
        const errorData = await response.json();
        setError('Erreur: ' + JSON.stringify(errorData));
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDepartement = async () => {
    if (!deptFormData.numero.trim() || !deptFormData.nom.trim()) {
      setError('Le numero et le nom du departement sont obligatoires');
      return;
    }

    if (!deptFormData.societe) {
      setError('Vous devez selectionner une societe');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/departements/${editingDept.id}/`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(deptFormData),
        }
      );

      if (response.ok) {
        const updatedDept = await response.json();
        setAllDepartements(
          allDepartements.map((d) => (d.id === updatedDept.id ? updatedDept : d))
        );
        setIsEditing(false);
        setEditingType(null);
        setEditingDept(null);
        setSuccessMessage('Departement modifie avec succes !');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchSocieteDepartements(deptFormData.societe);
      } else {
        const errorData = await response.json();
        setError('Erreur: ' + JSON.stringify(errorData));
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartement = async (deptId) => {
    if (!window.confirm('Etes-vous sur de vouloir supprimer ce departement ?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/departements/${deptId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok || response.status === 204) {
        setAllDepartements(allDepartements.filter((d) => d.id !== deptId));
        setSuccessMessage('Departement supprime !');
        setTimeout(() => setSuccessMessage(''), 3000);
        if (selectedSociete) {
          fetchSocieteDepartements(selectedSociete.id);
        }
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingType(null);
    setEditingDept(null);
    setError('');
    if (selectedSociete) {
      setFormData(selectedSociete);
    }
  };

  const filteredDepartements = allDepartements
    .filter(dept => 
      dept.numero.includes(searchDept) ||
      dept.nom.toLowerCase().includes(searchDept.toLowerCase()) ||
      (dept.region && dept.region.toLowerCase().includes(searchDept.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'numero') return a.numero.localeCompare(b.numero);
      if (sortBy === 'nom') return a.nom.localeCompare(b.nom);
      if (sortBy === 'region') return (a.region || '').localeCompare(b.region || '');
      return 0;
    });

  return (
    <div className="parametrage-societe-container">
      <div className="page-header">
        <h1>Parametrage - Gestion Societe</h1>
        <p>Configurez les parametres de votre societe et organisation</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="tabs-navigation">
        <button
          className={`tab-button ${activeTab === 'informations' ? 'active' : ''}`}
          onClick={() => setActiveTab('informations')}
        >
          Informations Societe
        </button>
        <button
          className={`tab-button ${activeTab === 'departements' ? 'active' : ''}`}
          onClick={() => setActiveTab('departements')}
        >
          Departements
        </button>
        <button
          className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          Services
        </button>
        <button
          className={`tab-button ${activeTab === 'grades' ? 'active' : ''}`}
          onClick={() => setActiveTab('grades')}
        >
          Grades
        </button>
      </div>

      {activeTab === 'informations' && (
        <div className="tab-content">
          <div className="tab-header">
            <h2>Informations Societe</h2>
            <button 
              className="btn btn-primary" 
              onClick={handleNewSociete}
              type="button"
            >
              Nouvelle Societe
            </button>
          </div>

          {loading && <p className="loading">Chargement...</p>}

          {!loading && societes.length > 0 && (
            <div className="societe-management">
              <div className="societe-list">
                <h3>Societes existantes</h3>
                <div className="list-items">
                  {societes.map((societe) => (
                    <div
                      key={societe.id}
                      className={`list-item ${selectedSociete?.id === societe.id ? 'selected' : ''}`}
                    >
                      <div 
                        className="list-item-content"
                        onClick={() => handleSelectSociete(societe)}
                      >
                        <div className="item-header">
                          <h4>{societe.nom}</h4>
                          <span className={`badge ${societe.actif ? 'active' : 'inactive'}`}>
                            {societe.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        <p className="item-meta">{societe.activite}</p>
                      </div>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDeleteSociete(societe.id)}
                        type="button"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="societe-form">
                <h3>{isEditing && editingType === 'societe' ? 'Nouvelle Societe' : selectedSociete?.nom || 'Selectionnez une societe'}</h3>

                {!isEditing && !selectedSociete && (
                  <div className="empty-form">
                    <p>Selectionnez une societe dans la liste</p>
                  </div>
                )}

                {(isEditing && editingType === 'societe') || (selectedSociete && !isEditing) ? (
                  <form className="form-group">
                    <div className="form-row">
                      <div className="form-col">
                        <label>Nom de la Societe *</label>
                        <input
                          type="text"
                          name="nom"
                          value={formData.nom}
                          onChange={handleInputChange}
                          placeholder="Ex: MSI France"
                          disabled={!isEditing || editingType !== 'societe'}
                        />
                      </div>
                      <div className="form-col">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="contact@societe.fr"
                          disabled={!isEditing || editingType !== 'societe'}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-col">
                        <label>Telephone</label>
                        <input
                          type="tel"
                          name="telephone"
                          value={formData.telephone}
                          onChange={handleInputChange}
                          placeholder="01 23 45 67 89"
                          disabled={!isEditing || editingType !== 'societe'}
                        />
                      </div>
                      <div className="form-col">
                        <label>Activite</label>
                        <input
                          type="text"
                          name="activite"
                          value={formData.activite}
                          onChange={handleInputChange}
                          placeholder="Ex: Ressources Humaines"
                          disabled={!isEditing || editingType !== 'societe'}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-col">
                        <label>Adresse</label>
                        <textarea
                          name="adresse"
                          value={formData.adresse}
                          onChange={handleInputChange}
                          placeholder="Adresse complete"
                          rows="2"
                          disabled={!isEditing || editingType !== 'societe'}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-col">
                        <label>Ville</label>
                        <input
                          type="text"
                          name="ville"
                          value={formData.ville}
                          onChange={handleInputChange}
                          placeholder="Paris"
                          disabled={!isEditing || editingType !== 'societe'}
                        />
                      </div>
                      <div className="form-col">
                        <label>Code Postal</label>
                        <input
                          type="text"
                          name="code_postal"
                          value={formData.code_postal}
                          onChange={handleInputChange}
                          placeholder="75000"
                          disabled={!isEditing || editingType !== 'societe'}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-col">
                        <label>Clients</label>
                        <textarea
                          name="clients"
                          value={formData.clients}
                          onChange={handleInputChange}
                          placeholder="Liste des principaux clients"
                          rows="2"
                          disabled={!isEditing || editingType !== 'societe'}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-col checkbox">
                        <label>
                          <input
                            type="checkbox"
                            name="actif"
                            checked={formData.actif}
                            onChange={handleInputChange}
                            disabled={!isEditing || editingType !== 'societe'}
                          />
                          <span>Societe Active</span>
                        </label>
                      </div>
                    </div>
                  </form>
                ) : null}

                <div className="form-actions">
                  {!isEditing && selectedSociete && (
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setIsEditing(true);
                          setEditingType('societe');
                        }}
                        type="button"
                      >
                        Modifier
                      </button>
                      <button className="btn btn-secondary" onClick={handleCancel} type="button">
                        Annuler
                      </button>
                    </>
                  )}
                  {isEditing && editingType === 'societe' && (
                    <>
                      <button
                        className="btn btn-success"
                        onClick={selectedSociete ? handleSaveSociete : handleCreateSociete}
                        disabled={loading}
                        type="button"
                      >
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                      <button className="btn btn-secondary" onClick={handleCancel} type="button">
                        Annuler
                      </button>
                    </>
                  )}
                </div>

                {selectedSociete && societeDeptsAssigned.length > 0 && !isEditing && (
                  <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #eee' }}>
                    <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '18px', fontWeight: '600' }}>Departements affectes</h3>
                    <div className="dept-table-wrapper">
                      <table className="dept-table">
                        <thead>
                          <tr>
                            <th>Numero</th>
                            <th>Nom Departement</th>
                            <th>Region</th>
                            <th>Nb Circuits</th>
                            <th style={{ width: '150px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {societeDeptsAssigned.map((dept) => (
                            <tr key={dept.id}>
                              <td className="dept-numero">{dept.numero}</td>
                              <td className="dept-nom">{dept.nom}</td>
                              <td className="dept-region">{dept.region || '-'}</td>
                              <td className="dept-circuits">{dept.nombre_circuits || 0}</td>
                              <td style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="btn-icon-edit"
                                  onClick={() => handleEditDepartement(dept)}
                                  title="Modifier"
                                  type="button"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="btn-icon-delete"
                                  onClick={() => handleDeleteDepartement(dept.id)}
                                  title="Supprimer"
                                  type="button"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && societes.length === 0 && (
            <div className="empty-state">
              <p>Aucune societe trouvee</p>
              <button 
                className="btn btn-primary" 
                onClick={handleNewSociete}
                type="button"
              >
                Creer une societe
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'departements' && (
        <div className="tab-content">
          <div className="tab-header">
            <h2>Gestion Departements</h2>
            <button className="btn btn-primary" onClick={handleNewDepartement} type="button">
              Nouveau Departement
            </button>
          </div>

          <div className="dept-filters">
            <div className="filter-group">
              <label>Recherche</label>
              <input
                type="text"
                placeholder="Numero, nom ou region..."
                value={searchDept}
                onChange={(e) => setSearchDept(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Trier par</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="numero">Numero</option>
                <option value="nom">Nom</option>
                <option value="region">Region</option>
              </select>
            </div>
          </div>

          {loading && <p className="loading">Chargement...</p>}

          {!loading && (
            <div className="dept-table-wrapper">
              <table className="dept-table">
                <thead>
                  <tr>
                    <th>Numero</th>
                    <th>Nom Departement</th>
                    <th>Region</th>
                    <th>Nb Circuits</th>
                    <th style={{ width: '180px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartements.map((dept) => (
                    <tr key={dept.id}>
                      <td className="dept-numero">{dept.numero}</td>
                      <td className="dept-nom">{dept.nom}</td>
                      <td className="dept-region">{dept.region || '-'}</td>
                      <td className="dept-circuits">{dept.nombre_circuits || 0}</td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn-icon-edit"
                          onClick={() => handleEditDepartement(dept)}
                          title="Modifier"
                          type="button"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon-delete"
                          onClick={() => handleDeleteDepartement(dept.id)}
                          title="Supprimer"
                          type="button"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDepartements.length === 0 && (
                <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  Aucun departement trouve
                </p>
              )}
              <div className="table-footer">
                <p>{filteredDepartements.length} departement(s) affiche(s) / {allDepartements.length} total</p>
              </div>
            </div>
          )}

          {isEditing && editingType === 'departement' && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>{editingDept ? 'Modifier Departement' : 'Nouveau Departement'}</h3>
                <form className="form-group">
                  <div className="form-row">
                    <div className="form-col">
                      <label>Societe *</label>
                      <select
                        name="societe"
                        value={deptFormData.societe || ''}
                        onChange={handleDeptInputChange}
                      >
                        <option value="">-- Selectionnez une societe --</option>
                        {societes.map((societe) => (
                          <option key={societe.id} value={societe.id}>
                            {societe.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-col">
                      <label>Numero *</label>
                      <input
                        type="text"
                        name="numero"
                        value={deptFormData.numero}
                        onChange={handleDeptInputChange}
                        placeholder="Ex: 75"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-col">
                      <label>Nom *</label>
                      <input
                        type="text"
                        name="nom"
                        value={deptFormData.nom}
                        onChange={handleDeptInputChange}
                        placeholder="Ex: Paris"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-col">
                      <label>Region</label>
                      <input
                        type="text"
                        name="region"
                        value={deptFormData.region}
                        onChange={handleDeptInputChange}
                        placeholder="Ex: Ile-de-France"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-col">
                      <label>Nombre de circuits</label>
                      <input
                        type="number"
                        name="nombre_circuits"
                        value={deptFormData.nombre_circuits}
                        onChange={handleDeptInputChange}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-col checkbox">
                      <label>
                        <input
                          type="checkbox"
                          name="actif"
                          checked={deptFormData.actif}
                          onChange={handleDeptInputChange}
                        />
                        <span>Departement Actif</span>
                      </label>
                    </div>
                  </div>
                </form>

                <div className="form-actions">
                  <button
                    className="btn btn-success"
                    onClick={editingDept ? handleSaveDepartement : handleCreateDepartement}
                    disabled={loading}
                    type="button"
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button className="btn btn-secondary" onClick={handleCancel} type="button">
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'services' && (
        <div className="tab-content">
          <h2>Services</h2>
          <p>A implementer - Gestion des services</p>
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="tab-content">
          <h2>Grades</h2>
          <p>A implementer - Gestion des grades</p>
        </div>
      )}
    </div>
  );
}
