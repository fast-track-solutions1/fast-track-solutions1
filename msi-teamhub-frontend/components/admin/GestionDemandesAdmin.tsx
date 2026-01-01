'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Eye, Trash2, Download } from 'lucide-react';
import axios from 'axios';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
  const [commentaire, setCommentaire] = useState('');
  const [token, setToken] = useState('');

  // ============================================================================
  // AUTHENTIFICATION & TOKEN
  // ============================================================================

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) {
      setToken(savedToken);
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
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
      if (error.response?.status === 401) {
        console.error('Token invalide - veuillez vous reconnecter');
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

  const handleValidate = async (demandeId, action) => {
    setSelectedDemande(demandeId);
    setValidateAction(action);
    setShowValidateDialog(true);
  };

  const executeValidation = async () => {
    try {
      const url = `${API_BASE_URL}/demandes-conge/${selectedDemande}/${validateAction}/`;
      const response = await axios.post(
        url,
        { commentaire },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Succès:', response.data);
      setShowValidateDialog(false);
      setCommentaire('');
      loadDemandes();
    } catch (error) {
      console.error('Erreur validation:', error);
      alert('Erreur lors de la validation');
    }
  };

  // ============================================================================
  // TABLEAU DEMANDES
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
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Salarié</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dates</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((demande) => (
              <tr key={demande.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-sm text-gray-800">
                  {demande.salarie_info || `Salarié #${demande.salarie}`}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800">
                  <Badge variant="outline">{demande.type_conge}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div className="text-xs">
                    <div>Début: {new Date(demande.date_debut).toLocaleDateString('fr-FR')}</div>
                    <div>Fin: {new Date(demande.date_fin).toLocaleDateString('fr-FR')}</div>
                    <div className="font-semibold text-blue-600">{demande.nombre_jours} jours</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge className={STATUT_COLORS[demande.statut] || 'bg-gray-100 text-gray-800'}>
                    {STATUT_LABELS[demande.statut] || demande.statut}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    {(demande.statut === 'soumise' || demande.statut === 'validée_direct') && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleValidate(demande.id, 'valider_direct')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Valider
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleValidate(demande.id, 'rejeter')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeter
                        </Button>
                      </>
                    )}
                    {demande.statut === 'validée_direct' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleValidate(demande.id, 'valider_service')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approuver
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        console.log('Détails:', demande);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestion des Demandes</h1>
          <p className="text-gray-600">
            Gérez les demandes de congé, acomptes, sorties et travaux exceptionnels
          </p>
        </div>

        {!token && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="pt-6">
              <p className="text-red-800">
                ⚠️ Vous devez être authentifié. Veuillez vous connecter d'abord.
              </p>
            </CardContent>
          </Card>
        )}

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Demandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{demandes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">En attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {demandes.filter((d) => d.statut === 'soumise').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Approuvées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {demandes.filter((d) => d.statut === 'approuvée').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Rejetées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {demandes.filter((d) => d.statut === 'rejetée').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RECHERCHE */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Rechercher par salarié, type ou statut..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* ONGLETS */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b bg-gray-50 p-0 rounded-none">
              <TabsTrigger
                value="mes-demandes"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
              >
                Mes Demandes
              </TabsTrigger>
              <TabsTrigger
                value="a-traiter"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
              >
                À Traiter
              </TabsTrigger>
              <TabsTrigger
                value="historique"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
              >
                Historique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mes-demandes" className="p-6">
              <CardHeader className="px-0 pb-4">
                <CardTitle className="text-lg">Mes Demandes</CardTitle>
                <CardDescription>
                  Les demandes que j'ai soumises ({filteredDemandes.length})
                </CardDescription>
              </CardHeader>
              <TableDemandes data={filteredDemandes} />
            </TabsContent>

            <TabsContent value="a-traiter" className="p-6">
              <CardHeader className="px-0 pb-4">
                <CardTitle className="text-lg">À Traiter</CardTitle>
                <CardDescription>
                  Les demandes en attente de validation ({filteredDemandes.length})
                </CardDescription>
              </CardHeader>
              <TableDemandes data={filteredDemandes} />
            </TabsContent>

            <TabsContent value="historique" className="p-6">
              <CardHeader className="px-0 pb-4">
                <CardTitle className="text-lg">Historique</CardTitle>
                <CardDescription>
                  Les demandes traitées ({filteredDemandes.length})
                </CardDescription>
              </CardHeader>
              <TableDemandes data={filteredDemandes} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* DIALOG VALIDATION */}
      <AlertDialog open={showValidateDialog} onOpenChange={setShowValidateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {validateAction === 'valider_direct' && 'Valider cette demande ?'}
              {validateAction === 'valider_service' && 'Approuver cette demande ?'}
              {validateAction === 'rejeter' && 'Rejeter cette demande ?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {validateAction === 'rejeter' && 'Veuillez préciser la raison du rejet:'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {validateAction === 'rejeter' && (
            <textarea
              placeholder="Motif du rejet..."
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          )}

          <div className="flex gap-3">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeValidation}
              className={validateAction === 'rejeter' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              Confirmer
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
