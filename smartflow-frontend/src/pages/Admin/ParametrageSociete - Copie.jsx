import React, { useState, useEffect } from 'react';
import './ParametrageSociete.css';

export default function ParametrageSociete() {
  const [activeTab, setActiveTab] = useState('informations');
  const [societes, setSocietes] = useState([]);
  const [allDepartements, setAllDepartements] = useState([]);
  const [services, setServices] = useState([]);
  const [grades, setGrades] = useState([]);
  
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
  
  const [searchService, setSearchService] = useState('');
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({ nom: '', description: '' });
  
  const [searchGrade, setSearchGrade] = useState('');
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState(null);
  const [gradeFormData, setGradeFormData] = useState({ nom: '', ordre: 0 });
  
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

  useEffect(() => {
    if (selectedSociete && activeTab === 'services') {
      fetchServices();
    }
  }, [selectedSociete, activeTab]);

  useEffect(() => {
    if (selectedSociete && activeTab === 'grades') {
      fetchGrades();
    }
  }, [selectedSociete, activeTab]);

  // ==================== SOCIÉTÉS ====================
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
        if ((data.results || data).length > 0) {
          handleSelectSociete((data.results || data)[0]);
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

  // ==================== SERVICES ====================
  const fetchServices = async () => {
    if (!selectedSociete) return;
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/services/?societe=${selectedSociete.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setServices(data.results || data);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveService = async () => {
    if (!serviceFormData.nom.trim()) {
      setError('Le nom du service est obligatoire');
      return;
    }
    if (!selectedSociete) {
      setError('Sélectionnez une société');
      return;
    }

    setLoading(true);
    try {
      const url = editingServiceId
        ? `http://localhost:8000/api/services/${editingServiceId}/`
        : 'http://localhost:8000/api/services/';

      const method = editingServiceId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: serviceFormData.nom,
          description: serviceFormData.description,
          societe: selectedSociete.id,
          actif: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (editingServiceId) {
          setServices(services.map(s => s.id === data.id ? data : s));
        } else {
          setServices([...services, data]);
        }
        setServiceFormData({ nom: '', description: '' });
        setEditingServiceId(null);
        setShowServiceForm(false);
        setSuccessMessage(editingServiceId ? 'Service modifié !' : 'Service créé !');
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

  const handleDeleteService = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/services/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok || response.status === 204) {
        setServices(services.filter(s => s.id !== id));
        setSuccessMessage('Service supprimé !');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // ==================== GRADES ====================
  const fetchGrades = async () => {
    if (!selectedSociete) return;
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/grades/?societe=${selectedSociete.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setGrades(data.results || data);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des grades');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrade = async () => {
    if (!gradeFormData.nom.trim()) {
      setError('Le nom du grade est obligatoire');
      return;
    }
    if (!selectedSociete) {
      setError('Sélectionnez une société');
      return;
    }

    setLoading(true);
    try {
      const url = editingGradeId
        ? `http://localhost:8000/api/grades/${editingGradeId}/`
        : 'http://localhost:8000/api/grades/';

      const method = editingGradeId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: gradeFormData.nom,
          ordre: parseInt(gradeFormData.ordre) || 0,
          societe: selectedSociete.id,
          actif: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (editingGradeId) {
          setGrades(grades.map(g => g.id === data.id ? data : g));
        } else {
          setGrades([...grades, data]);
        }
        setGradeFormData({ nom: '', ordre: 0 });
        setEditingGradeId(null);
        setShowGradeForm(false);
        setSuccessMessage(editingGradeId ? 'Grade modifié !' : 'Grade créé !');
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

  const handleDeleteGrade = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce grade ?')) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/grades/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok || response.status === 204) {
        setGrades(grades.filter(g => g.id !== id));
        setSuccessMessage('Grade supprimé !');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // ==================== FONCTIONS UTILES ====================
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

  const filteredServices = services.filter(s =>
    s.nom.toLowerCase().includes(searchService.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchService.toLowerCase()))
  );

  const filteredGrades = grades
    .filter(g => g.nom.toLowerCase().includes(searchGrade.toLowerCase()))
    .sort((a, b) => a.ordre - b.ordre);

  return (
    <div className="parametrage-societe-container">
      <div className="page-header">
        <h1>⚙️ Paramétrage Société</h1>
        <p>Configurez les paramètres de votre société et organisation</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {loading && !isEditing && <div className="loading">Chargement...</div>}

      {!loading && societes.length > 0 && (
        <>
          <div className="tabs-navigation">
            <button
              className={`tab-button ${activeTab === 'informations' ? 'active' : ''}`}
              onClick={() => setActiveTab('informations')}
            >
              Informations
            </button>
            <button
              className={`tab-button ${activeTab === 'departements' ? 'active' : ''}`}
              onClick={() => setActiveTab('departements')}
            >
              Départements
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
              <div className="societe-management">
                <div className="societe-list">
                  <h3>Sociétés</h3>
                  <div className="list-items">
                    {societes.map((societe) => (
                      <div
                        key={societe.id}
                        className={`list-item ${selectedSociete?.id === societe.id ? 'selected' : ''}`}
                        onClick={() => handleSelectSociete(societe)}
                      >
                        <div className="list-item-content">
                          <div className="item-header">
                            <h4>{societe.nom}</h4>
                            <span className={`badge ${societe.actif ? 'active' : 'inactive'}`}>
                              {societe.actif ? '✓' : '✗'}
                            </span>
                          </div>
                          <p className="item-meta">{societe.activite}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-primary" onClick={handleNewSociete} style={{ width: '100%', marginTop: '10px' }}>
                    + Nouvelle
                  </button>
                </div>

                {selectedSociete || isEditing ? (
                  <div className="societe-form">
                    <h3>{selectedSociete ? 'Modifier la société' : 'Créer une société'}</h3>
                    <div className="form-group">
                      <div className="form-row">
                        <div className="form-col">
                          <label>Nom *</label>
                          <input
                            type="text"
                            name="nom"
                            value={formData.nom}
                            onChange={handleInputChange}
                            placeholder="Nom de la société"
                          />
                        </div>
                        <div className="form-col">
                          <label>Activité</label>
                          <input
                            type="text"
                            name="activite"
                            value={formData.activite}
                            onChange={handleInputChange}
                            placeholder="Secteur d'activité"
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-col">
                          <label>Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                          />
                        </div>
                        <div className="form-col">
                          <label>Téléphone</label>
                          <input
                            type="text"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleInputChange}
                            placeholder="Téléphone"
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
                            placeholder="Adresse"
                            rows="3"
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
                            placeholder="Ville"
                          />
                        </div>
                        <div className="form-col">
                          <label>Code Postal</label>
                          <input
                            type="text"
                            name="code_postal"
                            value={formData.code_postal}
                            onChange={handleInputChange}
                            placeholder="Code Postal"
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
                            placeholder="Clients"
                            rows="3"
                          />
                        </div>
                      </div>
                      <div className="form-col checkbox">
                        <input
                          type="checkbox"
                          id="actif"
                          name="actif"
                          checked={formData.actif}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="actif">Actif</label>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button
                        className="btn btn-primary"
                        onClick={selectedSociete ? handleSaveSociete : handleCreateSociete}
                        disabled={loading}
                      >
                        {loading ? 'Enregistrement...' : selectedSociete ? 'Modifier' : 'Créer'}
                      </button>
                      <button className="btn btn-secondary" onClick={handleCancel}>
                        Annuler
                      </button>
                      {selectedSociete && (
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDeleteSociete(selectedSociete.id)}
                          disabled={loading}
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="empty-form">
                    <p>Sélectionnez une société dans la liste</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'departements' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Gestion des Départements</h2>
                <button className="btn btn-primary" onClick={handleNewDepartement}>
                  + Nouveau Département
                </button>
              </div>

              {isEditing && editingType === 'departement' && (
                <div className="societe-form">
                  <h3>{editingDept ? 'Modifier le département' : 'Créer un département'}</h3>
                  <div className="form-group">
                    <div className="form-row">
                      <div className="form-col">
                        <label>Numéro *</label>
                        <input
                          type="text"
                          name="numero"
                          value={deptFormData.numero}
                          onChange={handleDeptInputChange}
                          placeholder="Ex: 75"
                        />
                      </div>
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
                        <label>Région</label>
                        <input
                          type="text"
                          name="region"
                          value={deptFormData.region}
                          onChange={handleDeptInputChange}
                          placeholder="Ex: Île-de-France"
                        />
                      </div>
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
                  </div>
                  <div className="form-actions">
                    <button
                      className="btn btn-primary"
                      onClick={editingDept ? handleSaveDepartement : handleCreateDepartement}
                      disabled={loading}
                    >
                      {loading ? 'Enregistrement...' : editingDept ? 'Modifier' : 'Créer'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                      Annuler
                    </button>
                    {editingDept && (
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDeleteDepartement(editingDept.id)}
                        disabled={loading}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="dept-filters">
                <div className="filter-group">
                  <label>Rechercher</label>
                  <input
                    type="text"
                    placeholder="Numéro, nom ou région..."
                    value={searchDept}
                    onChange={(e) => setSearchDept(e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label>Trier par</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="numero">Numéro</option>
                    <option value="nom">Nom</option>
                    <option value="region">Région</option>
                  </select>
                </div>
              </div>

              {!loading && filteredDepartements.length > 0 && (
                <div className="dept-table-wrapper">
                  <table className="dept-table">
                    <thead>
                      <tr>
                        <th>Numéro</th>
                        <th>Nom Département</th>
                        <th>Région</th>
                        <th>Nb Circuits</th>
                        <th style={{ width: '120px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDepartements.map((dept) => (
                        <tr key={dept.id}>
                          <td className="dept-numero">{dept.numero}</td>
                          <td className="dept-nom">{dept.nom}</td>
                          <td className="dept-region">{dept.region || '-'}</td>
                          <td>
                            <span className="dept-circuits">{dept.nombre_circuits || 0}</span>
                          </td>
                          <td>
                            <button
                              className="btn-icon-edit"
                              onClick={() => handleEditDepartement(dept)}
                              title="Modifier"
                            >
                              ✎
                            </button>
                            <button
                              className="btn-icon-delete"
                              onClick={() => handleDeleteDepartement(dept.id)}
                              title="Supprimer"
                            >
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="table-footer">
                    {filteredDepartements.length} département(s) affiché(s) / {allDepartements.length} total
                  </div>
                </div>
              )}

              {!loading && filteredDepartements.length === 0 && (
                <div className="empty-state">
                  <p>Aucun département trouvé</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'services' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Gestion des Services</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowServiceForm(!showServiceForm);
                    setEditingServiceId(null);
                    setServiceFormData({ nom: '', description: '' });
                  }}
                >
                  {showServiceForm ? '✕ Annuler' : '+ Nouveau Service'}
                </button>
              </div>

              {loading && <div className="loading">Chargement...</div>}

              {showServiceForm && (
                <div className="societe-form">
                  <h3>{editingServiceId ? 'Modifier le service' : 'Créer un service'}</h3>
                  <div className="form-group">
                    <div className="form-row">
                      <div className="form-col">
                        <label>Nom du service *</label>
                        <input
                          type="text"
                          value={serviceFormData.nom}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, nom: e.target.value })}
                          placeholder="Ex: Ressources Humaines"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-col">
                        <label>Description</label>
                        <textarea
                          value={serviceFormData.description}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                          placeholder="Description du service"
                          rows="4"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-primary" onClick={handleSaveService} disabled={loading}>
                      {loading ? 'Enregistrement...' : editingServiceId ? 'Modifier' : 'Créer'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowServiceForm(false);
                        setEditingServiceId(null);
                        setServiceFormData({ nom: '', description: '' });
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Rechercher un service..."
                  value={searchService}
                  onChange={(e) => setSearchService(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                  }}
                />
              </div>

              {!loading && filteredServices.length > 0 && (
                <div className="dept-table-wrapper">
                  <table className="dept-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Description</th>
                        <th>Statut</th>
                        <th style={{ width: '120px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((service) => (
                        <tr key={service.id}>
                          <td><strong>{service.nom}</strong></td>
                          <td>{service.description || '-'}</td>
                          <td>
                            <span className={`badge ${service.actif ? 'active' : 'inactive'}`}>
                              {service.actif ? '✓ Actif' : '✗ Inactif'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-icon-edit"
                              onClick={() => {
                                setEditingServiceId(service.id);
                                setServiceFormData({ nom: service.nom, description: service.description || '' });
                                setShowServiceForm(true);
                              }}
                              title="Modifier"
                            >
                              ✎
                            </button>
                            <button
                              className="btn-icon-delete"
                              onClick={() => handleDeleteService(service.id)}
                              title="Supprimer"
                            >
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="table-footer">
                    {filteredServices.length} service(s) affiché(s) / {services.length} total
                  </div>
                </div>
              )}

              {!loading && filteredServices.length === 0 && (
                <div className="empty-state">
                  <p>Aucun service trouvé</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Gestion des Grades</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowGradeForm(!showGradeForm);
                    setEditingGradeId(null);
                    setGradeFormData({ nom: '', ordre: 0 });
                  }}
                >
                  {showGradeForm ? '✕ Annuler' : '+ Nouveau Grade'}
                </button>
              </div>

              {loading && <div className="loading">Chargement...</div>}

              {showGradeForm && (
                <div className="societe-form">
                  <h3>{editingGradeId ? 'Modifier le grade' : 'Créer un grade'}</h3>
                  <div className="form-group">
                    <div className="form-row">
                      <div className="form-col">
                        <label>Nom du grade *</label>
                        <input
                          type="text"
                          value={gradeFormData.nom}
                          onChange={(e) => setGradeFormData({ ...gradeFormData, nom: e.target.value })}
                          placeholder="Ex: Manager, Assistant, Directeur"
                        />
                      </div>
                      <div className="form-col">
                        <label>Ordre hiérarchique</label>
                        <input
                          type="number"
                          value={gradeFormData.ordre}
                          onChange={(e) => setGradeFormData({ ...gradeFormData, ordre: e.target.value })}
                          placeholder="0 = bas, 10 = haut"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-primary" onClick={handleSaveGrade} disabled={loading}>
                      {loading ? 'Enregistrement...' : editingGradeId ? 'Modifier' : 'Créer'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowGradeForm(false);
                        setEditingGradeId(null);
                        setGradeFormData({ nom: '', ordre: 0 });
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Rechercher un grade..."
                  value={searchGrade}
                  onChange={(e) => setSearchGrade(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                  }}
                />
              </div>

              {!loading && filteredGrades.length > 0 && (
                <div className="dept-table-wrapper">
                  <table className="dept-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Ordre</th>
                        <th>Statut</th>
                        <th style={{ width: '120px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGrades.map((grade) => (
                        <tr key={grade.id}>
                          <td><strong>{grade.nom}</strong></td>
                          <td><strong style={{ fontSize: '18px' }}>{grade.ordre}</strong></td>
                          <td>
                            <span className={`badge ${grade.actif ? 'active' : 'inactive'}`}>
                              {grade.actif ? '✓ Actif' : '✗ Inactif'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-icon-edit"
                              onClick={() => {
                                setEditingGradeId(grade.id);
                                setGradeFormData({ nom: grade.nom, ordre: grade.ordre });
                                setShowGradeForm(true);
                              }}
                              title="Modifier"
                            >
                              ✎
                            </button>
                            <button
                              className="btn-icon-delete"
                              onClick={() => handleDeleteGrade(grade.id)}
                              title="Supprimer"
                            >
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="table-footer">
                    {filteredGrades.length} grade(s) affiché(s) / {grades.length} total
                  </div>
                </div>
              )}

              {!loading && filteredGrades.length === 0 && (
                <div className="empty-state">
                  <p>Aucun grade trouvé</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
