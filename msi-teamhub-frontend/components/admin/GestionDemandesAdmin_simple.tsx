'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Couleurs pour les statuts
const STATUT_COLORS = {
  brouillon: 'bg-gray-100 text-gray-800',
  soumise: 'bg-blue-100 text-blue-800',
  validée_direct: 'bg-yellow-100 text-yellow-800',
  validée_service: 'bg-orange-100 text-orange-800',
  approuvée: 'bg-green-100 text-green-800',
  rejetée: 'bg-red-100 text-red-800',
  payée: 'bg-green-100 text-green-800',
};

const STATUT_LABELS = {
  brouillon: 'Brouillon',
  soumise: 'Soumise',
  validée_direct: 'Validée par responsable',
  validée_service: 'Validée par service',
  approuvée: 'Approuvée',
  rejetée: 'Rejetée',
  payée: 'Payée',
};

export default function GestionDemandesAdmin() {
  const [activeTab, setActiveTab] = useState('mes-demandes');
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showValidateDialog, setShowValidateDialog] = useState(false);
  const [validateAction, setValidateAction] = useState(null);
  const [motifRejet, setMotifRejet] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  // ============================================================================
  // AUTHENTIFICATION & TOKEN
  // ============================================================================

  useEffect(() => {
    // Essayez d'obtenir le token depuis localStorage
    const savedToken = localStorage.getItem('jwt_token');
    if (savedToken) {
      setToken(savedToken);
    } else {
      setError('❌ Vous devez être authentifié. Token non trouvé.');
    }
  }, []);

  // ============================================================================
  // CHARGER LES DEMANDES SELON L'ONGLET
  // ============================================================================

  useEffect(() => {
    if (token) {
      loadDemandes();
    }
  }, [activeTab, token]);

  const loadDemandes = async () => {
    setLoading(true);
    try {
      let endpoint = `${API_BASE_URL}/demandes-conge/`;

      if (activeTab === 'mes-demandes') {
        endpoint = `${API_BASE_URL}/demandes-conge/mes_demandes/`;
      } else if (activeTab === 'a-traiter') {
        endpoint = `${API_BASE_URL}/demandes-conge/a_traiter/`;
      } else if (activeTab === 'historique') {
        endpoint = `${API_BASE_URL}/demandes-conge/historique/`;
      }

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setDemandes(response.data || []);
      setError('');
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
      if (error.response?.status === 401) {
        setError('❌ Token invalide - veuillez vous reconnecter');
      } else {
        setError('❌ Erreur lors du chargement des demandes');
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // FILTRER LES DEMANDES
  // ============================================================================

  const filteredDemandes = demandes.filter((demande) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      demande.salarie_info?.toLowerCase().includes(search) ||
      demande.type_conge?.toLowerCase().includes(search) ||
      demande.statut?.toLowerCase().includes(search)
    );
  });

  // ============================================================================
  // VALIDER / REJETER
  // ============================================================================

  const handleValidate = (demandeId, action) => {
    setSelectedDemande(demandeId);
    setValidateAction(action);
    setShowValidateDialog(true);
    setMotifRejet('');
  };

  const executeValidation = async () => {
    try {
      const url = `${API_BASE_URL}/demandes-conge/${selectedDemande}/${validateAction}/`;
      const body = { commentaire: motifRejet };

      await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setShowValidateDialog(false);
      setMotifRejet('');
      loadDemandes();
      alert('✅ Action réussie');
    } catch (error) {
      console.error('Erreur validation:', error);
      alert('❌ Erreur lors de la validation');
    }
  };

  // ============================================================================
  // COMPOSANT TABLEAU
  // ============================================================================

  const TableDemandes = ({ data }) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Clock className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg">Aucune demande pour le moment</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Salarié</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Dates</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Jours</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Statut</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((demande) => (
              <tr key={demande.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800">
                  {demande.salarie_info || `Salarié #${demande.salarie}`}
                </td>
                <td className="px-4 py-3 text-gray-800">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                    {demande.type_conge}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  <div>🕒 {new Date(demande.date_debut).toLocaleDateString('fr-FR')}</div>
                  <div>🕒 {new Date(demande.date_fin).toLocaleDateString('fr-FR')}</div>
                </td>
                <td className="px-4 py-3 font-semibold text-blue-600">
                  {demande.nombre_jours}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[demande.statut] || 'bg-gray-100'}`}>
                    {STATUT_LABELS[demande.statut] || demande.statut}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    {(demande.statut === 'soumise' || demande.statut === 'validée_direct') && (
                      <>
                        <button
                          onClick={() => handleValidate(demande.id, 'valider_direct')}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" /> Valider
                        </button>
                        <button
                          onClick={() => handleValidate(demande.id, 'rejeter')}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Rejeter
                        </button>
                      </>
                    )}
                    {demande.statut === 'validée_direct' && (
                      <button
                        onClick={() => handleValidate(demande.id, 'valider_service')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Approuver
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📋 Gestion des Demandes</h1>
          <p className="text-gray-600">Gérez les demandes de congé, acomptes, sorties et travaux exceptionnels</p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {error}
          </div>
        )}

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Demandes</p>
            <div className="text-3xl font-bold text-gray-900">{demandes.length}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">En attente</p>
            <div className="text-3xl font-bold text-yellow-600">
              {demandes.filter((d) => d.statut === 'soumise').length}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Approuvées</p>
            <div className="text-3xl font-bold text-green-600">
              {demandes.filter((d) => d.statut === 'approuvée').length}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Rejetées</p>
            <div className="text-3xl font-bold text-red-600">
              {demandes.filter((d) => d.statut === 'rejetée').length}
            </div>
          </div>
        </div>

        {/* RECHERCHE */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 Recherche</h2>
          <input
            type="text"
            placeholder="Rechercher par salarié, type ou statut..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ONGLETS */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* TAB BUTTONS */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('mes-demandes')}
              className={`px-6 py-4 font-semibold text-sm ${
                activeTab === 'mes-demandes'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 Mes Demandes
            </button>
            <button
              onClick={() => setActiveTab('a-traiter')}
              className={`px-6 py-4 font-semibold text-sm ${
                activeTab === 'a-traiter'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⏳ À Traiter
            </button>
            <button
              onClick={() => setActiveTab('historique')}
              className={`px-6 py-4 font-semibold text-sm ${
                activeTab === 'historique'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ✅ Historique
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="p-6">
            {activeTab === 'mes-demandes' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Mes Demandes</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Les demandes que j'ai soumises ({filteredDemandes.length})
                </p>
                <TableDemandes data={filteredDemandes} />
              </div>
            )}

            {activeTab === 'a-traiter' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">À Traiter</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Les demandes en attente de validation ({filteredDemandes.length})
                </p>
                <TableDemandes data={filteredDemandes} />
              </div>
            )}

            {activeTab === 'historique' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Historique</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Les demandes traitées ({filteredDemandes.length})
                </p>
                <TableDemandes data={filteredDemandes} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DIALOG VALIDATION */}
      {showValidateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {validateAction === 'valider_direct' && '✅ Valider cette demande ?'}
              {validateAction === 'valider_service' && '✅ Approuver cette demande ?'}
              {validateAction === 'rejeter' && '❌ Rejeter cette demande ?'}
            </h2>

            {validateAction === 'rejeter' && (
              <textarea
                placeholder="Motif du rejet..."
                value={motifRejet}
                onChange={(e) => setMotifRejet(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                rows={4}
              />
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowValidateDialog(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm"
              >
                Annuler
              </button>
              <button
                onClick={executeValidation}
                className={`px-4 py-2 text-white rounded-lg font-semibold text-sm ${
                  validateAction === 'rejeter'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
