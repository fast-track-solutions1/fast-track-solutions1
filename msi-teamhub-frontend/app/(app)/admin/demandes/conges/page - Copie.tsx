'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, XCircle, Plus, Send } from 'lucide-react';

interface Salarie {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  responsable_direct?: string;
  responsable_service?: string;
}

interface DemandeConge {
  id: number;
  salarie: number;
  salarie_info: string;
  type_conge: string;
  date_debut: string;
  date_fin: string;
  nombre_jours: string | null;
  motif: string;
  statut: string;
  statut_display: string;
  valide_par_direct: boolean;
  date_validation_direct: string | null;
  commentaire_direct: string;
  valide_par_service: boolean;
  date_validation_service: string | null;
  commentaire_service: string;
  rejete: boolean;
  date_rejet: string | null;
  motif_rejet: string;
  jours_confirmes_par_salarie?: boolean;
  date_confirmation_salarie?: string | null;
  date_soumission?: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ============================================================================
// HELPER: GET HEADERS WITH AUTH
// ============================================================================
const getAuthHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export default function DemandesCongésPage() {
  // ========================================================================
  // STATE
  // ========================================================================
  const [tab, setTab] = useState('creation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [salarieError, setSalarieError] = useState<string | null>(null);

  // Formulaire création
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [formData, setFormData] = useState({
    salarie: '',
    type_conge: 'maladie',
    date_debut: '',
    date_fin: '',
    motif: '',
  });
  const [selectedSalarie, setSelectedSalarie] = useState<Salarie | null>(null);

  // Demandes
  const [demandes, setDemandes] = useState<DemandeConge[]>([]);
  const [demandeActive, setDemandeActive] = useState<DemandeConge | null>(null);
  const [calculatedDays, setCalculatedDays] = useState<number | null>(null);

  // ========================================================================
  // EFFECTS
  // ========================================================================
  useEffect(() => {
    loadSalaries();
    loadDemandes();
  }, []);

  // ========================================================================
  // FONCTIONS API
  // ========================================================================
  const loadSalaries = async () => {
    try {
      setSalarieError(null);
      console.log('Chargement des salariés...');
      
      const response = await fetch(`${API_URL}/salaries/?limit=1000`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      const results = data.results || [];
      setSalaries(results);
      console.log(`✅ ${results.length} salariés chargés`);
    } catch (err: any) {
      console.error('❌ Erreur chargement salariés:', err);
      setSalarieError(`Erreur: ${err.message}`);
    }
  };

  const loadDemandes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/demandes-conge/mes_demandes/`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setDemandes(data.demandes || []);
      }
    } catch (err) {
      console.error('Erreur chargement demandes:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDemande = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.salarie || !formData.date_debut || !formData.date_fin) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/demandes-conge/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          salarie: parseInt(formData.salarie),
          type_conge: formData.type_conge,
          date_debut: formData.date_debut,
          date_fin: formData.date_fin,
          motif: formData.motif,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur création demande');
      }

      const newDemande = await response.json();
      setDemandes([newDemande, ...demandes]);
      setDemandeActive(newDemande);
      setSuccess('Demande créée ! Confirmez les jours pour continuer.');
      
      // Reset form
      setFormData({
        salarie: '',
        type_conge: 'maladie',
        date_debut: '',
        date_fin: '',
        motif: '',
      });
      setTab('confirmation');
    } catch (err: any) {
      setError(err.message || 'Erreur création demande');
    } finally {
      setLoading(false);
    }
  };

  const confirmerJours = async (demandeId: number) => {
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/demandes-conge/${demandeId}/confirmer_jours/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur confirmation');
      }

      const data = await response.json();
      setCalculatedDays(data.nombre_jours);
      setSuccess(`${data.nombre_jours} jours calculés et confirmés !`);
      
      // Update demande active
      if (demandeActive?.id === demandeId) {
        setDemandeActive({
          ...demandeActive,
          nombre_jours: data.nombre_jours.toString(),
          jours_confirmes_par_salarie: true,
        });
      }

      // Reload demandes
      loadDemandes();
    } catch (err: any) {
      setError(err.message || 'Erreur confirmation');
    } finally {
      setLoading(false);
    }
  };

  const soumettreDemande = async (demandeId: number) => {
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/demandes-conge/${demandeId}/soumettre/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur soumission');
      }

      const data = await response.json();
      setSuccess(data.message);
      
      // Update demande active
      if (demandeActive?.id === demandeId) {
        setDemandeActive({
          ...demandeActive,
          statut: 'en_attente_validation',
          date_soumission: new Date().toISOString(),
        });
      }

      // Reload demandes
      loadDemandes();
    } catch (err: any) {
      setError(err.message || 'Erreur soumission');
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================
  const handleSalarieChange = (salarieId: string) => {
    setFormData({ ...formData, salarie: salarieId });
    const salarie = salaries.find((s) => s.id === parseInt(salarieId));
    setSelectedSalarie(salarie || null);
  };

  const getStatutBadge = (statut: string) => {
    const variants: Record<string, any> = {
      en_attente_confirmation: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      en_attente_validation: { color: 'bg-blue-100 text-blue-800', icon: '📋' },
      en_attente_service: { color: 'bg-blue-100 text-blue-800', icon: '📋' },
      approuvee: { color: 'bg-green-100 text-green-800', icon: '✅' },
      rejetee: { color: 'bg-red-100 text-red-800', icon: '❌' },
    };
    const config = variants[statut] || { color: 'bg-gray-100 text-gray-800', icon: '•' };
    return config;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Demandes de Congé</h1>
        <p className="text-gray-500 mt-2">Créez, confirmez et suivez vos demandes de congé</p>
      </div>

      {/* Messages */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {salarieError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Erreur chargement salariés:</strong> {salarieError}
            <br />
            <small>Vérifiez que l'API est accessible et que vous êtes authentifié.</small>
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="creation">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Demande
          </TabsTrigger>
          <TabsTrigger value="confirmation">
            <Clock className="w-4 h-4 mr-2" />
            Confirmation
          </TabsTrigger>
          <TabsTrigger value="historique">
            <CheckCircle className="w-4 h-4 mr-2" />
            Historique
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/* TAB 1: CRÉATION */}
        {/* ============================================================ */}
        <TabsContent value="creation">
          <Card>
            <CardHeader>
              <CardTitle>Créer une nouvelle demande</CardTitle>
              <CardDescription>
                Remplissez le formulaire et confirmez les jours de congé
              </CardDescription>
            </CardHeader>
            <CardContent>
              {salaries.length === 0 ? (
                <Alert className="mb-6 border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Chargement des salariés en cours...
                  </AlertDescription>
                </Alert>
              ) : null}

              <form onSubmit={createDemande} className="space-y-6">
                {/* Salarié */}
                <div className="space-y-2">
                  <Label htmlFor="salarie">Salarié * ({salaries.length} disponibles)</Label>
                  <select
                    id="salarie"
                    value={formData.salarie}
                    onChange={(e) => handleSalarieChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Sélectionner un salarié --</option>
                    {salaries.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nom} {s.prenom} ({s.matricule})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Info Responsables */}
                {selectedSalarie && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900">Responsables</p>
                    <p className="text-sm text-blue-800 mt-1">
                      Direct: <span className="font-semibold">{selectedSalarie.responsable_direct || '-'}</span>
                    </p>
                    <p className="text-sm text-blue-800">
                      Service: <span className="font-semibold">{selectedSalarie.responsable_service || '-'}</span>
                    </p>
                  </div>
                )}

                {/* Type Congé */}
                <div className="space-y-2">
                  <Label htmlFor="type_conge">Type de congé *</Label>
                  <select
                    id="type_conge"
                    value={formData.type_conge}
                    onChange={(e) => setFormData({ ...formData, type_conge: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="maladie">Maladie</option>
                    <option value="conge_paye">Congé payé</option>
                    <option value="maternite">Maternité</option>
                    <option value="paternite">Paternité</option>
                    <option value="sans_solde">Sans solde</option>
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_debut">Date début *</Label>
                    <Input
                      id="date_debut"
                      type="date"
                      value={formData.date_debut}
                      onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_fin">Date fin *</Label>
                    <Input
                      id="date_fin"
                      type="date"
                      value={formData.date_fin}
                      onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Motif */}
                <div className="space-y-2">
                  <Label htmlFor="motif">Motif</Label>
                  <textarea
                    id="motif"
                    value={formData.motif}
                    onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                    placeholder="Raison de la demande (optionnel)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading || salaries.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Création...' : 'Créer la demande'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB 2: CONFIRMATION */}
        {/* ============================================================ */}
        <TabsContent value="confirmation">
          <Card>
            <CardHeader>
              <CardTitle>Confirmation des jours</CardTitle>
              <CardDescription>
                Confirmez le nombre de jours calculés automatiquement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {demandes.filter((d) => d.statut === 'en_attente_confirmation').length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucune demande en attente de confirmation
                </p>
              ) : (
                <div className="space-y-4">
                  {demandes
                    .filter((d) => d.statut === 'en_attente_confirmation')
                    .map((demande) => (
                      <Card key={demande.id} className="border-l-4 border-l-yellow-500">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            {/* Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm font-semibold text-gray-600">Salarié</p>
                                <p className="text-sm">{demande.salarie_info}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-600">Type</p>
                                <p className="text-sm capitalize">{demande.type_conge}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-600">Début</p>
                                <p className="text-sm">{formatDate(demande.date_debut)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-600">Fin</p>
                                <p className="text-sm">{formatDate(demande.date_fin)}</p>
                              </div>
                            </div>

                            {/* Jours */}
                            {demande.nombre_jours && (
                              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm font-semibold text-green-900">Jours calculés</p>
                                <p className="text-2xl font-bold text-green-700 mt-1">
                                  {demande.nombre_jours} jour(s)
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                  Calcul automatique: lun-sam, moins jours fériés
                                </p>
                              </div>
                            )}

                            {/* Motif */}
                            {demande.motif && (
                              <div>
                                <p className="text-sm font-semibold text-gray-600">Motif</p>
                                <p className="text-sm">{demande.motif}</p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-4">
                              {!demande.nombre_jours ? (
                                <Button
                                  onClick={() => confirmerJours(demande.id)}
                                  disabled={loading}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Confirmer les jours
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => soumettreDemande(demande.id)}
                                  disabled={loading}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  Soumettre la demande
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB 3: HISTORIQUE */}
        {/* ============================================================ */}
        <TabsContent value="historique">
          <Card>
            <CardHeader>
              <CardTitle>Historique des demandes</CardTitle>
              <CardDescription>
                Suivi de toutes vos demandes de congé
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500 text-center py-8">Chargement...</p>
              ) : demandes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune demande</p>
              ) : (
                <div className="space-y-4">
                  {demandes.map((demande) => {
                    const config = getStatutBadge(demande.statut);
                    return (
                      <Card key={demande.id} className="border-l-4" style={{ borderLeftColor: demande.statut === 'approuvee' ? '#16a34a' : demande.statut === 'rejetee' ? '#dc2626' : '#2563eb' }}>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{demande.salarie_info}</p>
                                <p className="text-sm text-gray-600 capitalize">{demande.type_conge}</p>
                              </div>
                              <Badge className={config.color}>
                                {demande.statut_display}
                              </Badge>
                            </div>

                            {/* Dates */}
                            <div className="flex gap-4 text-sm">
                              <div>
                                <span className="font-semibold">Début:</span> {formatDate(demande.date_debut)}
                              </div>
                              <div>
                                <span className="font-semibold">Fin:</span> {formatDate(demande.date_fin)}
                              </div>
                              <div>
                                <span className="font-semibold">Jours:</span> {demande.nombre_jours || '-'}
                              </div>
                            </div>

                            {/* Validations */}
                            {(demande.valide_par_direct || demande.valide_par_service) && (
                              <div className="space-y-2 text-sm bg-gray-50 p-3 rounded">
                                {demande.valide_par_direct && (
                                  <p className="text-green-700">
                                    ✅ Validé par responsable direct le {formatDate(demande.date_validation_direct)}
                                  </p>
                                )}
                                {demande.valide_par_service && (
                                  <p className="text-green-700">
                                    ✅ Validé par responsable service le {formatDate(demande.date_validation_service)}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Rejet */}
                            {demande.rejete && (
                              <div className="text-sm bg-red-50 p-3 rounded">
                                <p className="text-red-700">
                                  ❌ Rejeté le {formatDate(demande.date_rejet)}
                                </p>
                                {demande.motif_rejet && (
                                  <p className="text-red-600 text-xs mt-1">Motif: {demande.motif_rejet}</p>
                                )}
                              </div>
                            )}

                            {/* Motif */}
                            {demande.motif && (
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Motif:</span> {demande.motif}
                              </p>
                            )}

                            {/* Created */}
                            <p className="text-xs text-gray-400">
                              Créée le {formatDate(demande.date_creation)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
