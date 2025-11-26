import React, { useState, useEffect } from 'react';
import './ParametrageSociete.css';

export default function ParametrageSociete() {
  // ---------------------- ÉTATS GÉNÉRAUX ----------------------
  const [activeTab, setActiveTab] = useState('informations');
  const [societes, setSocietes] = useState([]);
  const [selectedSociete, setSelectedSociete] = useState(null);
  const [formData, setFormData] = useState({
    nom: '', email: '', telephone: '', adresse: '', ville: '', code_postal: '',
    activite: '', clients: '', actif: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Départements
  const [allDepartements, setAllDepartements] = useState([]);
  const [searchDept, setSearchDept] = useState('');
  const [sortByDept, setSortByDept] = useState('numero');
  const [editingDept, setEditingDept] = useState(null);
  const [deptFormData, setDeptFormData] = useState({
    numero: '', nom: '', region: '', nombre_circuits: 1, actif: true, societe: null,
  });

  // Services
  const [services, setServices] = useState([]);
  const [searchService, setSearchService] = useState('');
  const [sortByService, setSortByService] = useState('nom');
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    nom: '', description: '', societe: null, responsable: null
  });

  // Grades
  const [grades, setGrades] = useState([]);
  const [searchGrade, setSearchGrade] = useState('');
  const [sortByGrade, setSortByGrade] = useState('ordre');
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState(null);
  const [gradeFormData, setGradeFormData] = useState({ nom: '', ordre: 0, societe: null });

  // Salariés (responsables de services)
  const [salairies, setSalairies] = useState([]);

  const token = localStorage.getItem('access_token');

  // ---------------------- FETCH INIT ----------------------
  useEffect(() => {
    fetchSocietes();
    fetchAllDepartements();
    fetchSalairies();
  }, []);
  useEffect(() => {
    if (selectedSociete && activeTab === 'services') fetchServices();
  }, [selectedSociete, activeTab]);
  useEffect(() => {
    if (selectedSociete && activeTab === 'grades') fetchGrades();
  }, [selectedSociete, activeTab]);

  // ---------------------- FETCH API ----------------------
  const fetchSocietes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/societes/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSocietes(data.results || data);
        if ((data.results || data).length > 0) handleSelectSociete((data.results || data)[0]);
      } else {
        setError('Erreur chargement sociétés');
      }
    } catch {
      setError('Erreur API sociétés');
    }
    setLoading(false);
  };
  const fetchAllDepartements = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/departements/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAllDepartements(data.results || data);
      }
    } catch {}
  };
  const fetchSalairies = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/salaries/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSalairies(data.results || data);
      }
    } catch {}
  };
  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/services/?societe=${selectedSociete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setServices(data.results || data);
      }
    } catch {
      setError('Erreur chargement services');
    }
    setLoading(false);
  };
  const fetchGrades = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/grades/?societe=${selectedSociete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGrades(data.results || data);
      }
    } catch {
      setError('Erreur chargement grades');
    }
    setLoading(false);
  };

  // ------------------------ CRUD SOCIÉTÉ ------------------------
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  const handleSelectSociete = (societe) => {
    setSelectedSociete(societe);
    setFormData(societe);
    setIsEditing(false); setEditingType(null);
    setError('');
  };
  const handleNewSociete = () => {
    setSelectedSociete(null);
    setFormData({
      nom: '', email: '', telephone: '', adresse: '', ville: '', code_postal: '',
      activite: '', clients: '', actif: true,
    });
    setIsEditing(true); setEditingType('societe'); setError('');
  };
  const handleCreateSociete = async () => {
    if (!formData.nom.trim()) { setError('Nom obligatoire'); return; }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/societes/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) return setError('Erreur création société');
      const newSociete = await response.json();
      setSocietes([...societes, newSociete]);
      handleSelectSociete(newSociete);
      setIsEditing(false); setEditingType(null);
      setSuccessMessage('Société créée !'); setTimeout(() => setSuccessMessage(''), 3000);
    } catch { setError('Erreur API société'); }
    setLoading(false);
  };
  const handleSaveSociete = async () => {
    if (!selectedSociete) { setError('Aucune société'); return; }
    if (!formData.nom.trim()) { setError('Nom obligatoire'); return; }
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/societes/${selectedSociete.id}/`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) return setError('Erreur modification société');
      const updatedSociete = await response.json();
      setSocietes(societes.map(s => s.id === updatedSociete.id ? updatedSociete : s));
      handleSelectSociete(updatedSociete);
      setIsEditing(false); setEditingType(null);
      setSuccessMessage('Société modifiée !'); setTimeout(() => setSuccessMessage(''), 3000);
    } catch { setError('Erreur API société'); }
    setLoading(false);
  };
  const handleDeleteSociete = async (id) => {
    if (!window.confirm("Supprimer la société ?")) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/societes/${id}/`,
        { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok || response.status === 204) {
        setSocietes(societes.filter(s => s.id !== id));
        setSelectedSociete(null);
        setSuccessMessage('Société supprimée !'); setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch { setError('Erreur API'); }
    setLoading(false);
  };
  const handleCancel = () => {
    setIsEditing(false); setEditingType(null);
    if (selectedSociete) { setFormData(selectedSociete); }
  };
  // ------------------------ CRUD DEPARTEMENT ------------------------
  const handleDeptInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDeptFormData({
      ...deptFormData,
      [name]: type === 'checkbox' ? checked : (name === 'nombre_circuits' ? parseInt(value) : (name === 'societe' ? parseInt(value) : value)),
    });
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

  const handleCreateDepartement = async () => {
    if (!deptFormData.numero.trim() || !deptFormData.nom.trim()) {
      setError('Le numéro et le nom du département sont obligatoires');
      return;
    }
    if (!deptFormData.societe) {
      setError('Vous devez sélectionner une société');
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
        setSuccessMessage('Département créé avec succès !');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchAllDepartements();
      } else {
        const errorData = await response.json();
        setError('Erreur: ' + JSON.stringify(errorData));
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDepartement = async () => {
    if (!deptFormData.numero.trim() || !deptFormData.nom.trim()) {
      setError('Le numéro et le nom du département sont obligatoires');
      return;
    }
    if (!deptFormData.societe) {
      setError('Vous devez sélectionner une société');
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
        setSuccessMessage('Département modifié avec succès !');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchAllDepartements();
      } else {
        const errorData = await response.json();
        setError('Erreur: ' + JSON.stringify(errorData));
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartement = async (deptId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
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
        setSuccessMessage('Département supprimé !');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchAllDepartements();
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // ------------------- RECHERCHE & TRI -------------------
  const filteredDepartements = allDepartements
    .filter(dept =>
      dept.numero.includes(searchDept) ||
      dept.nom.toLowerCase().includes(searchDept.toLowerCase()) ||
      (dept.region && dept.region.toLowerCase().includes(searchDept.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortByDept === 'numero') return a.numero.localeCompare(b.numero);
      if (sortByDept === 'nom') return a.nom.localeCompare(b.nom);
      if (sortByDept === 'region') return (a.region || '').localeCompare(b.region || '');
      return 0;
    });
  // ------------------ CRUD SERVICES ------------------
  const handleSaveService = async () => {
    if (!serviceFormData.nom.trim()) {
      setError('Le nom du service est obligatoire');
      return;
    }
    if (!serviceFormData.societe) {
      setError('Vous devez sélectionner une société');
      return;
    }
    setLoading(true);
    try {
      const url = editingServiceId
        ? `http://localhost:8000/api/services/${editingServiceId}/`
        : 'http://localhost:8000/api/services/';
      const method = editingServiceId ? 'PUT' : 'POST';
      const payload = {
        nom: serviceFormData.nom,
        description: serviceFormData.description,
        societe: serviceFormData.societe,
        responsable: serviceFormData.responsable || null,
        actif: true,
      };
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json();
        if (editingServiceId) {
          setServices(services.map(s => s.id === data.id ? data : s));
        } else {
          setServices([...services, data]);
        }
        setServiceFormData({ nom: '', description: '', societe: null, responsable: null });
        setEditingServiceId(null);
        setShowServiceForm(false);
        setSuccessMessage(editingServiceId ? 'Service modifié !' : 'Service créé !');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchServices();
      } else {
        const errorData = await response.json();
        setError('Erreur: ' + JSON.stringify(errorData));
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
    setLoading(false);
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
        fetchServices();
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
    setLoading(false);
  };

  // Recherche / tri service
  const filterAndSortServices = () => {
    let filtered = [...services];
    if (searchService.trim()) {
      const search = searchService.toLowerCase();
      filtered = filtered.filter(s =>
        s.nom.toLowerCase().includes(search) ||
        (s.description && s.description.toLowerCase().includes(search)) ||
        (getSalarieFullName(s.responsable).toLowerCase().includes(search))
      );
    }
    switch (sortByService) {
      case 'nom':
        filtered.sort((a, b) => a.nom.localeCompare(b.nom));
        break;
      case 'responsable':
        filtered.sort((a, b) => getSalarieFullName(a.responsable).localeCompare(getSalarieFullName(b.responsable)));
        break;
      case 'date':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        break;
    }
    return filtered;
  };
  const filteredServices = filterAndSortServices();

  // Helper salarie
  const getSalarieFullName = (id) => {
    const sal = salairies.find(s => s.id === id);
    return sal ? `${sal.prenom} ${sal.nom}` : '';
  };
  // ------------------ CRUD GRADES ------------------
  const handleSaveGrade = async () => {
    if (!gradeFormData.nom.trim()) {
      setError('Le nom du grade est obligatoire');
      return;
    }
    if (!gradeFormData.societe) {
      setError('Vous devez sélectionner une société');
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
          societe: gradeFormData.societe,
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
        setGradeFormData({ nom: '', ordre: 0, societe: null });
        setEditingGradeId(null);
        setShowGradeForm(false);
        setSuccessMessage(editingGradeId ? 'Grade modifié !' : 'Grade créé !');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchGrades();
      } else {
        const errorData = await response.json();
        setError('Erreur: ' + JSON.stringify(errorData));
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
    setLoading(false);
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
        fetchGrades();
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
    setLoading(false);
  };

  // Recherche / tri grade
  const filterAndSortGrades = () => {
    let filtered = [...grades];
    if (searchGrade.trim()) {
      const search = searchGrade.toLowerCase();
      filtered = filtered.filter(g => g.nom.toLowerCase().includes(search));
    }
    switch (sortByGrade) {
      case 'nom':
        filtered.sort((a, b) => a.nom.localeCompare(b.nom));
        break;
      case 'ordre':
        filtered.sort((a, b) => a.ordre - b.ordre);
        break;
      case 'ordre-desc':
        filtered.sort((a, b) => b.ordre - a.ordre);
        break;
      default:
        break;
    }
    return filtered;
  };
  const filteredGrades = filterAndSortGrades();
  // ------------------------ RENDER ------------------------
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
            <button className={`tab-button ${activeTab === 'informations' ? 'active' : ''}`} onClick={() => setActiveTab('informations')}>Informations</button>
            <button className={`tab-button ${activeTab === 'departements' ? 'active' : ''}`} onClick={() => setActiveTab('departements')}>Départements</button>
            <button className={`tab-button ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>Services</button>
            <button className={`tab-button ${activeTab === 'grades' ? 'active' : ''}`} onClick={() => setActiveTab('grades')}>Grades</button>
          </div>

          {/* ------------ INFORMATIONS SOCIETE ------------- */}
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
                        onClick={() => handleSelectSociete(societe)}>
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
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} onClick={handleNewSociete}>+ Nouvelle</button>
                </div>
                {(selectedSociete || isEditing) ? (
                  <div className="societe-form">
                    <h3>{selectedSociete ? 'Modifier la société' : 'Créer une société'}</h3>
                    <div className="form-group">
                      <div className="form-row">
                        <div className="form-col">
                          <label>Nom *</label>
                          <input type="text" name="nom" value={formData.nom} onChange={handleInputChange} placeholder="Nom de la société" />
                        </div>
                        <div className="form-col">
                          <label>Activité</label>
                          <input type="text" name="activite" value={formData.activite} onChange={handleInputChange} placeholder="Secteur d'activité" />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-col">
                          <label>Email</label>
                          <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" />
                        </div>
                        <div className="form-col">
                          <label>Téléphone</label>
                          <input type="text" name="telephone" value={formData.telephone} onChange={handleInputChange} placeholder="Téléphone" />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-col">
                          <label>Adresse</label>
                          <textarea name="adresse" value={formData.adresse} onChange={handleInputChange} placeholder="Adresse" rows="3" />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-col">
                          <label>Ville</label>
                          <input type="text" name="ville" value={formData.ville} onChange={handleInputChange} placeholder="Ville" />
                        </div>
                        <div className="form-col">
                          <label>Code Postal</label>
                          <input type="text" name="code_postal" value={formData.code_postal} onChange={handleInputChange} placeholder="Code Postal" />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-col">
                          <label>Clients</label>
                          <textarea name="clients" value={formData.clients} onChange={handleInputChange} placeholder="Clients" rows="3" />
                        </div>
                      </div>
                      <div className="form-col checkbox">
                        <input type="checkbox" id="actif" name="actif" checked={formData.actif} onChange={handleInputChange} />
                        <label htmlFor="actif">Actif</label>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button className="btn btn-primary"
                        onClick={selectedSociete ? handleSaveSociete : handleCreateSociete}
                        disabled={loading}>
                        {loading ? 'Enregistrement...' : selectedSociete ? 'Modifier' : 'Créer'}
                      </button>
                      <button className="btn btn-secondary" onClick={handleCancel}>Annuler</button>
                      {selectedSociete && (
                        <button className="btn btn-delete"
                          onClick={() => handleDeleteSociete(selectedSociete.id)}
                          disabled={loading}>Supprimer</button>
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

          {/* ------------------- ONGLET DEPARTEMENTS ------------------- */}
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
                        <input type="text" name="numero" value={deptFormData.numero}
                          onChange={handleDeptInputChange} placeholder="Ex: 75" />
                      </div>
                      <div className="form-col">
                        <label>Nom *</label>
                        <input type="text" name="nom" value={deptFormData.nom}
                          onChange={handleDeptInputChange} placeholder="Ex: Paris" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-col">
                        <label>Région</label>
                        <input type="text" name="region" value={deptFormData.region}
                          onChange={handleDeptInputChange} placeholder="Ex: Île-de-France" />
                      </div>
                      <div className="form-col">
                        <label>Nombre de circuits</label>
                        <input type="number" name="nombre_circuits" value={deptFormData.nombre_circuits}
                          onChange={handleDeptInputChange} min="1" />
                      </div>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-primary"
                      onClick={editingDept ? handleSaveDepartement : handleCreateDepartement}
                      disabled={loading}>
                      {loading ? 'Enregistrement...' : editingDept ? 'Modifier' : 'Créer'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Annuler</button>
                    {editingDept && (
                      <button className="btn btn-delete"
                        onClick={() => handleDeleteDepartement(editingDept.id)}
                        disabled={loading}>Supprimer</button>
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
                  <select value={sortByDept} onChange={(e) => setSortByDept(e.target.value)}>
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
                        <th>Nom</th>
                        <th>Région</th>
                        <th>Circuits</th>
                        <th style={{ width: '120px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDepartements.map((dept) => (
                        <tr key={dept.id}>
                          <td className="dept-numero">{dept.numero}</td>
                          <td className="dept-nom">{dept.nom}</td>
                          <td className="dept-region">{dept.region || '-'}</td>
                          <td><span className="dept-circuits">{dept.nombre_circuits || 0}</span></td>
                          <td>
                            <button className="btn-icon-edit" onClick={() => handleEditDepartement(dept)} title="Modifier">✎</button>
                            <button className="btn-icon-delete" onClick={() => handleDeleteDepartement(dept.id)} title="Supprimer">🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="table-footer">
                    {filteredDepartements.length} / {allDepartements.length}
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

          {/* ------------------ ONGLET SERVICES ------------------ */}
          {activeTab === 'services' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Gestion des Services</h2>
                <button className="btn btn-primary" onClick={() => {
                  setShowServiceForm(!showServiceForm);
                  setEditingServiceId(null);
                  setServiceFormData({ nom: '', description: '', societe: selectedSociete?.id || null, responsable: null });
                }}>
                  {showServiceForm ? '✕ Fermer' : '+ Nouveau Service'}
                </button>
              </div>
              {showServiceForm && (
                <div className="societe-form">
                  <h3>{editingServiceId ? 'Modifier le service' : 'Créer un service'}</h3>
                  <div className="form-group">
                    <div className="form-row">
                      <div className="form-col">
                        <label>Société *</label>
                        <select value={serviceFormData.societe || ''}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, societe: parseInt(e.target.value) || null })}>
                          <option value="">-- Sélectionner --</option>
                          {societes.map(s => (
                            <option key={s.id} value={s.id}>{s.nom}</option>
                          ))}
                        </select>
                      </div>
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
                        <label>Responsable</label>
                        <select
                          value={serviceFormData.responsable || ''}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, responsable: e.target.value ? parseInt(e.target.value) : null })}>
                          <option value="">-- Aucun responsable --</option>
                          {salairies.map(s => (
                            <option key={s.id} value={s.id}>{s.prenom} {s.nom}</option>
                          ))}
                        </select>
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
                        setServiceFormData({ nom: '', description: '', societe: null, responsable: null });
                      }}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <div className="adv-filters">
                <div className="filter-group">
                  <label>Recherche</label>
                  <input
                    type="text"
                    placeholder="Nom ou description..."
                    value={searchService}
                    onChange={(e) => setSearchService(e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label>Trier par</label>
                  <select value={sortByService} onChange={(e) => setSortByService(e.target.value)}>
                    <option value="nom">Nom (A-Z)</option>
                    <option value="responsable">Responsable</option>
                    <option value="date">Plus récent</option>
                  </select>
                </div>
              </div>
              {!loading && filteredServices.length > 0 && (
                <div className="dept-table-wrapper">
                  <table className="dept-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Responsable</th>
                        <th>Description</th>
                        <th>Statut</th>
                        <th style={{ width: '120px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((service) => (
                        <tr key={service.id}>
                          <td><strong>{service.nom}</strong></td>
                          <td>{getSalarieFullName(service.responsable) || '-'}</td>
                          <td>{service.description ? service.description.substring(0, 50) + '...' : '-'}</td>
                          <td>
                            <span className={`badge ${service.actif ? 'active' : 'inactive'}`}>
                              {service.actif ? '✓ Actif' : '✗ Inactif'}
                            </span>
                          </td>
                          <td>
                            <button className="btn-icon-edit" onClick={() => {
                              setEditingServiceId(service.id);
                              setServiceFormData({
                                nom: service.nom,
                                description: service.description || '',
                                societe: service.societe,
                                responsable: service.responsable
                              });
                              setShowServiceForm(true);
                            }} title="Modifier">✎</button>
                            <button className="btn-icon-delete" onClick={() => handleDeleteService(service.id)} title="Supprimer">🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="table-footer">
                    {filteredServices.length} / {services.length}
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

          {/* ------------------- ONGLET GRADES ------------------- */}
          {activeTab === 'grades' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Gestion des Grades</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowGradeForm(!showGradeForm);
                    setEditingGradeId(null);
                    setGradeFormData({ nom: '', ordre: 0, societe: selectedSociete?.id || null });
                  }}>
                  {showGradeForm ? '✕ Fermer' : '+ Nouveau Grade'}
                </button>
              </div>
              {showGradeForm && (
                <div className="societe-form">
                  <h3>{editingGradeId ? 'Modifier le grade' : 'Créer un grade'}</h3>
                  <div className="form-group">
                    <div className="form-row">
                      <div className="form-col">
                        <label>Société *</label>
                        <select
                          value={gradeFormData.societe || ''}
                          onChange={(e) => setGradeFormData({ ...gradeFormData, societe: parseInt(e.target.value) || null })}>
                          <option value="">-- Sélectionner --</option>
                          {societes.map(s => (
                            <option key={s.id} value={s.id}>{s.nom}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-col">
                        <label>Nom du grade *</label>
                        <input
                          type="text"
                          value={gradeFormData.nom}
                          onChange={(e) => setGradeFormData({ ...gradeFormData, nom: e.target.value })}
                          placeholder="Ex: Manager, Assistant"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-col">
                        <label>Ordre hiérarchique (0-100)</label>
                        <input
                          type="number"
                          value={gradeFormData.ordre}
                          onChange={(e) => setGradeFormData({ ...gradeFormData, ordre: e.target.value })}
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
                    <button className="btn btn-secondary" onClick={() => {
                      setShowGradeForm(false);
                      setEditingGradeId(null);
                      setGradeFormData({ nom: '', ordre: 0, societe: null });
                    }}>Annuler</button>
                  </div>
                </div>
              )}

              <div className="adv-filters">
                <div className="filter-group">
                  <label>Recherche</label>
                  <input
                    type="text"
                    placeholder="Nom du grade..."
                    value={searchGrade}
                    onChange={(e) => setSearchGrade(e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label>Trier par</label>
                  <select value={sortByGrade} onChange={(e) => setSortByGrade(e.target.value)}>
                    <option value="ordre">Ordre (croissant)</option>
                    <option value="ordre-desc">Ordre (décroissant)</option>
                    <option value="nom">Nom (A-Z)</option>
                  </select>
                </div>
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
                          <td><strong style={{ fontSize: '18px', color: 'var(--color-primary)' }}>{grade.ordre}</strong></td>
                          <td>
                            <span className={`badge ${grade.actif ? 'active' : 'inactive'}`}>{grade.actif ? '✓ Actif' : '✗ Inactif'}</span>
                          </td>
                          <td>
                            <button className="btn-icon-edit" onClick={() => {
                              setEditingGradeId(grade.id);
                              setGradeFormData({ nom: grade.nom, ordre: grade.ordre, societe: grade.societe });
                              setShowGradeForm(true);
                            }} title="Modifier">✎</button>
                            <button className="btn-icon-delete" onClick={() => handleDeleteGrade(grade.id)} title="Supprimer">🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="table-footer">
                    {filteredGrades.length} / {grades.length}
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
