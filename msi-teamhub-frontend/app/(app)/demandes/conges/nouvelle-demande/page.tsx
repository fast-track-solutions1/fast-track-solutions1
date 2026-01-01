'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSalaries } from '@/lib/salarie-api';
import { createDemande } from '@/lib/demande-conge-api';
import { AlertCircle, CheckCircle, Calendar } from 'lucide-react';

interface Salarie {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  responsable_direct?: number;
}

interface FormData {
  salarie: number | null;
  type_conge: string;
  date_debut: string;
  date_fin: string;
  nombre_jours: number | null;
  motif: string;
}

interface CalculDetail {
  joursCalcules: number;
  joursFeriers: string[];
  nombreJoursFeriers: number;
  weekends: string[];
  nombreWeekends: number;
}

// 🎯 JOURS FÉRIÉS FRANÇAIS 2024-2025
const JOURS_FERIES_FRANCE = [
  { date: '01-01', nom: 'Jour de l\'an' },
  { date: '04-21', nom: 'Lundi de Pâques' },
  { date: '05-01', nom: 'Fête du Travail' },
  { date: '05-08', nom: 'Victoire 1945' },
  { date: '05-29', nom: 'Ascension' },
  { date: '06-09', nom: 'Lundi de Pentecôte' },
  { date: '07-14', nom: 'Fête Nationale' },
  { date: '08-15', nom: 'Assomption' },
  { date: '11-01', nom: 'Toussaint' },
  { date: '11-11', nom: 'Armistice 1918' },
  { date: '12-25', nom: 'Noël' },
];

// Vérifier si une date est un jour férié français
const getJourFerie = (date: Date): { nom: string } | null => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${month}-${day}`;
  const found = JOURS_FERIES_FRANCE.find((jf) => jf.date === dateStr);
  return found || null;
};

// Obtenir le nom du jour de la semaine
const getDayName = (date: Date): string => {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[date.getDay()];
};

// Calculer les jours ouvrables avec détails
// Compte UNIQUEMENT lundi-vendredi (0 = dimanche, 6 = samedi)
const calculateWorkingDaysDetailed = (
  debut: string,
  fin: string
): CalculDetail => {
  try {
    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);

    if (dateFin <= dateDebut) {
      return {
        joursCalcules: 0,
        joursFeriers: [],
        nombreJoursFeriers: 0,
        weekends: [],
        nombreWeekends: 0,
      };
    }

    let count = 0;
    const joursFeriers: string[] = [];
    const weekends: string[] = [];
    const current = new Date(dateDebut);

    while (current <= dateFin) {
      const dayOfWeek = current.getDay();
      const dateStr = current.toLocaleDateString('fr-FR');
      const dayName = getDayName(current);

      // Vérifier si c'est un jour férié
      const jf = getJourFerie(current);
      if (jf) {
        joursFeriers.push(`${dateStr} (${jf.nom})`);
      }

      // Vérifier si c'est samedi (6) ou dimanche (0)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekends.push(`${dateStr} (${dayName})`);
      }

      // Compter UNIQUEMENT lundi-vendredi (1-5)
      // Exclure samedi (6), dimanche (0), et jours fériés
      if (dayOfWeek >= 1 && dayOfWeek <= 5 && !jf) {
        count++;
      }

      current.setDate(current.getDate() + 1);
    }

    return {
      joursCalcules: count,
      joursFeriers,
      nombreJoursFeriers: joursFeriers.length,
      weekends,
      nombreWeekends: weekends.length,
    };
  } catch (err) {
    console.error('❌ Erreur calcul:', err);
    return {
      joursCalcules: 0,
      joursFeriers: [],
      nombreJoursFeriers: 0,
      weekends: [],
      nombreWeekends: 0,
    };
  }
};

export default function NouvelleDemandePage() {
  const router = useRouter();
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [currentUser, setCurrentUser] = useState<Salarie | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    salarie: null,
    type_conge: 'normal',
    date_debut: '',
    date_fin: '',
    nombre_jours: null,
    motif: '',
  });

  // États pour le calcul des jours
  const [calculDetail, setCalculDetail] = useState<CalculDetail | null>(null);
  const [joursValidates, setJoursValidates] = useState(false);
  const [joursEditable, setJoursEditable] = useState(false);
  const [joursEditValue, setJoursEditValue] = useState<string>('');

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getSalaries();
        setSalaries(response);

        const userResponse = await fetch('/api/auth/user/', {
          credentials: 'include',
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('🔐 Utilisateur actuel:', userData);

          setIsAdmin(userData.is_staff || false);

          if (!userData.is_staff && userData.profil_salarie) {
            const userSalarie = response.find(
              (s) => s.id === userData.profil_salarie.id
            );
            if (userSalarie) {
              setCurrentUser(userSalarie);
              setFormData((prev) => ({
                ...prev,
                salarie: userData.profil_salarie.id,
              }));
            }
          } else if (userData.is_staff) {
            if (response.length > 0) {
              setFormData((prev) => ({
                ...prev,
                salarie: response[0].id,
              }));
            }
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('❌ Erreur chargement:', err);
        setError('Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculer les jours quand les dates changent
  useEffect(() => {
    if (formData.date_debut && formData.date_fin) {
      const detail = calculateWorkingDaysDetailed(
        formData.date_debut,
        formData.date_fin
      );
      setCalculDetail(detail);
      setJoursValidates(false);
      setJoursEditable(false);
    }
  }, [formData.date_debut, formData.date_fin]);

  // Valider les jours calculés
  const handleConfirmDays = () => {
    if (calculDetail && calculDetail.joursCalcules > 0) {
      setFormData((prev) => ({
        ...prev,
        nombre_jours: calculDetail.joursCalcules,
      }));
      setJoursValidates(true);
    }
  };

  // Corriger les jours
  const handleCorrectDays = () => {
    setJoursEditable(true);
    setJoursEditValue(calculDetail?.joursCalcules.toString() || '');
  };

  // Sauvegarder la correction des jours
  const handleSaveCorrectedDays = () => {
    const correctedValue = parseFloat(joursEditValue);
    if (correctedValue > 0) {
      setFormData((prev) => ({
        ...prev,
        nombre_jours: correctedValue,
      }));
      setJoursValidates(true);
      setJoursEditable(false);
    }
  };

  // Soumettre la demande
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.salarie) {
      setError('Sélectionnez un salarié');
      return;
    }

    if (!formData.date_debut || !formData.date_fin) {
      setError('Remplissez les dates');
      return;
    }

    if (!joursValidates || formData.nombre_jours === null) {
      setError('Validez le nombre de jours');
      return;
    }

    try {
      setSubmitting(true);
      const result = await createDemande({
        salarie: formData.salarie,
        type_conge: formData.type_conge,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        nombre_jours: formData.nombre_jours,
        motif: formData.motif,
      });

      console.log('✅ Demande créée:', result);
      setSuccess(true);

      setTimeout(() => {
        router.push('/demandes/conges/mes-demandes');
      }, 2000);
    } catch (err: any) {
      console.error('❌ Erreur création:', err);
      setError(err.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>⏳ Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>📝 Nouvelle Demande de Congé</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ✅ Demande créée avec succès ! Redirection...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Salarié */}
              <div>
                <Label htmlFor="salarie">Salarié *</Label>
                <select
                  id="salarie"
                  value={formData.salarie || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salarie: parseInt(e.target.value) || null,
                    })
                  }
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Sélectionner un salarié --</option>
                  {salaries.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom} {s.prenom} ({s.matricule})
                    </option>
                  ))}
                </select>
                {!isAdmin && currentUser && (
                  <p className="text-sm text-gray-600 mt-2">
                    ℹ️ Pré-sélectionné: {currentUser.nom} {currentUser.prenom}
                  </p>
                )}
              </div>

              {/* 2. Type de Congé */}
              <div>
                <Label htmlFor="type_conge">Type de Congé *</Label>
                <select
                  id="type_conge"
                  value={formData.type_conge}
                  onChange={(e) =>
                    setFormData({ ...formData, type_conge: e.target.value })
                  }
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Congé normal</option>
                  <option value="maladie">Congé maladie</option>
                  <option value="maternite">Congé maternité</option>
                  <option value="sans_solde">Congé sans solde</option>
                  <option value="sabbatique">Congé sabbatique</option>
                </select>
              </div>

              {/* 3. Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_debut">Date Début *</Label>
                  <Input
                    id="date_debut"
                    type="date"
                    value={formData.date_debut}
                    onChange={(e) =>
                      setFormData({ ...formData, date_debut: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="date_fin">Date Fin *</Label>
                  <Input
                    id="date_fin"
                    type="date"
                    value={formData.date_fin}
                    onChange={(e) =>
                      setFormData({ ...formData, date_fin: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
              </div>

              {/* 4. Calcul des Jours - Détaillé */}
              {calculDetail && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Résumé */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <p className="text-lg font-semibold">
                          Jours ouvrables calculés:{' '}
                          {joursEditable ? (
                            <input
                              type="number"
                              value={joursEditValue}
                              onChange={(e) =>
                                setJoursEditValue(e.target.value)
                              }
                              className="w-20 px-2 py-1 border rounded"
                              step="0.5"
                            />
                          ) : (
                            <span className="text-blue-600 font-bold">
                              {calculDetail.joursCalcules} jour
                              {calculDetail.joursCalcules > 1 ? 's' : ''}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Détail du calcul */}
                      {!joursEditable && (
                        <div className="bg-white p-4 rounded border border-blue-200 text-sm space-y-2">
                          <p className="font-semibold text-gray-700">
                            📊 Détail du calcul:
                          </p>
                          <p className="text-gray-600">
                            • Samedi & Dimanche déduits:{' '}
                            <span className="font-semibold text-red-600">
                              {calculDetail.nombreWeekends}
                            </span>
                          </p>
                          {calculDetail.nombreJoursFeriers > 0 && (
                            <>
                              <p className="text-gray-600">
                                • Jours fériés déduits:{' '}
                                <span className="font-semibold text-red-600">
                                  {calculDetail.nombreJoursFeriers}
                                </span>
                              </p>
                              <div className="ml-4 bg-red-50 p-2 rounded border border-red-200">
                                {calculDetail.joursFeriers.map((jf, idx) => (
                                  <p key={idx} className="text-red-700 text-xs">
                                    {jf}
                                  </p>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Boutons */}
                      {joursValidates ? (
                        <p className="text-sm text-green-700 font-semibold">
                          ✅ Validé
                        </p>
                      ) : (
                        <div className="flex gap-2">
                          {!joursEditable ? (
                            <>
                              <Button
                                type="button"
                                onClick={handleConfirmDays}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                ✓ Valider
                              </Button>
                              <Button
                                type="button"
                                onClick={handleCorrectDays}
                                variant="outline"
                              >
                                ✎ Corriger
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                type="button"
                                onClick={handleSaveCorrectedDays}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                💾 Sauvegarder
                              </Button>
                              <Button
                                type="button"
                                onClick={() => setJoursEditable(false)}
                                variant="outline"
                              >
                                ✕ Annuler
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 5. Motif */}
              <div>
                <Label htmlFor="motif">Motif</Label>
                <textarea
                  id="motif"
                  value={formData.motif}
                  onChange={(e) =>
                    setFormData({ ...formData, motif: e.target.value })
                  }
                  placeholder="Indiquez le motif de votre demande (optionnel)"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={
                    submitting || !joursValidates || !formData.salarie
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? '⏳ Création...' : '➕ Créer la Demande'}
                </Button>
                <Button
                  type="button"
                  onClick={() => router.back()}
                  variant="outline"
                >
                  ✕ Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
