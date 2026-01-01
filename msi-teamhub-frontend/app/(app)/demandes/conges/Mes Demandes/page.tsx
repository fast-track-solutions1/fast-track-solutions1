'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getDemandes } from '@/lib/demande-conge-api';
import { formatDateFR } from '@/lib/date-utils';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface DemandeConge {
  id: number;
  salarie: number;
  salarie_info: string;
  salarie_nom: string;
  salarie_prenom: string;
  type_conge: string;
  type_conge_display: string;
  date_debut: string;
  date_fin: string;
  nombre_jours: number;
  motif: string;
  statut: string;
  statut_display: string;
  valide_par_direct: boolean;
  date_validation_direct: string | null;
  commentaire_direct: string | null;
  responsable_direct_nom: string | null;
  valide_par_service: boolean;
  date_validation_service: string | null;
  commentaire_service: string | null;
  responsable_service_nom: string | null;
  rejete: boolean;
  date_rejet: string | null;
  motif_rejet: string | null;
  date_creation: string;
}

export default function MesDemandesPage() {
  const router = useRouter();
  const [demandes, setDemandes] = useState<DemandeConge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDemande, setSelectedDemande] = useState<DemandeConge | null>(
    null
  );

  useEffect(() => {
    const loadDemandes = async () => {
      try {
        const response = await getDemandes();
        console.log('✅ Demandes chargées:', response);
        setDemandes(response);
        setLoading(false);
      } catch (err) {
        console.error('❌ Erreur chargement:', err);
        setError('Erreur lors du chargement des demandes');
        setLoading(false);
      }
    };

    loadDemandes();
  }, []);

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'brouillon':
        return <Badge className="bg-gray-500">📝 Brouillon</Badge>;
      case 'soumise':
        return <Badge className="bg-blue-500">📤 Soumise</Badge>;
      case 'en_attente_validation':
        return <Badge className="bg-yellow-500">⏳ En attente validation</Badge>;
      case 'en_attente_service':
        return <Badge className="bg-yellow-600">⏳ En attente service</Badge>;
      case 'approuvee':
        return <Badge className="bg-green-500">✅ Approuvée</Badge>;
      case 'rejetee':
        return <Badge className="bg-red-500">❌ Rejetée</Badge>;
      default:
        return <Badge>{statut}</Badge>;
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">📋 Mes Demandes de Congé</h1>
          <Button
            onClick={() => router.push('/demandes/conges/nouvelle-demande')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            ➕ Nouvelle Demande
          </Button>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {demandes.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500 mb-4">Aucune demande de congé</p>
              <Button
                onClick={() => router.push('/demandes/conges/nouvelle-demande')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                ➕ Créer une première demande
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {/* Liste des demandes */}
            <div className="space-y-4">
              {demandes.map((demande) => (
                <Card
                  key={demande.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedDemande(demande)}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {demande.type_conge_display}
                          </h3>
                          {getStatutBadge(demande.statut)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          📅 {demande.date_debut} à {demande.date_fin}
                        </p>
                        <p className="text-sm text-gray-600">
                          📊 {demande.nombre_jours} jour
                          {demande.nombre_jours > 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-2">Créée le</p>
                        <p className="text-sm">{formatDateFR(demande.date_creation)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Détail sélectionné */}
            {selectedDemande && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle>📄 Détail de la Demande #{selectedDemande.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Informations générales */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Salarié
                      </label>
                      <p className="text-lg">
                        {selectedDemande.salarie_nom}{' '}
                        {selectedDemande.salarie_prenom}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Type de Congé
                      </label>
                      <p className="text-lg">
                        {selectedDemande.type_conge_display}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Dates
                      </label>
                      <p className="text-lg">
                        {selectedDemande.date_debut} à {selectedDemande.date_fin}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Nombre de jours
                      </label>
                      <p className="text-lg font-bold text-blue-600">
                        {selectedDemande.nombre_jours} jour
                        {selectedDemande.nombre_jours > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Statut */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Statut
                    </label>
                    <div className="flex items-center gap-2">
                      {getStatutBadge(selectedDemande.statut)}
                      <span className="text-sm text-gray-600">
                        {selectedDemande.statut_display}
                      </span>
                    </div>
                  </div>

                  {/* Motif */}
                  {selectedDemande.motif && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Motif
                      </label>
                      <p className="bg-white p-3 rounded border border-gray-300">
                        {selectedDemande.motif}
                      </p>
                    </div>
                  )}

                  {/* Validations */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-4">🔄 Workflow de Validation</h4>

                    {/* Validation Responsable Direct */}
                    <div className="mb-4 p-4 bg-white rounded border">
                      <div className="flex items-center gap-2 mb-2">
                        {selectedDemande.valide_par_direct ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                        <span className="font-semibold">
                          Responsable Direct
                        </span>
                      </div>
                      {selectedDemande.responsable_direct_nom ? (
                        <p className="text-sm text-gray-600 ml-7">
                          👤 {selectedDemande.responsable_direct_nom}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600 ml-7">Non assigné</p>
                      )}
                      {selectedDemande.valide_par_direct ? (
                        <>
                          <p className="text-sm text-green-700 ml-7 mt-1">
                            ✅ Validé le {formatDateFR(selectedDemande.date_validation_direct!)}
                          </p>
                          {selectedDemande.commentaire_direct && (
                            <p className="text-sm text-gray-600 ml-7 mt-1">
                              Commentaire: {selectedDemande.commentaire_direct}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-yellow-700 ml-7 mt-1">
                          ⏳ En attente de validation
                        </p>
                      )}
                    </div>

                    {/* Validation Responsable Service */}
                    <div className="mb-4 p-4 bg-white rounded border">
                      <div className="flex items-center gap-2 mb-2">
                        {selectedDemande.valide_par_service ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                        <span className="font-semibold">
                          Responsable Service
                        </span>
                      </div>
                      {selectedDemande.responsable_service_nom ? (
                        <p className="text-sm text-gray-600 ml-7">
                          👤 {selectedDemande.responsable_service_nom}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600 ml-7">Non assigné</p>
                      )}
                      {selectedDemande.valide_par_service ? (
                        <>
                          <p className="text-sm text-green-700 ml-7 mt-1">
                            ✅ Validé le {formatDateFR(selectedDemande.date_validation_service!)}
                          </p>
                          {selectedDemande.commentaire_service && (
                            <p className="text-sm text-gray-600 ml-7 mt-1">
                              Commentaire: {selectedDemande.commentaire_service}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-yellow-700 ml-7 mt-1">
                          ⏳ En attente de validation
                        </p>
                      )}
                    </div>

                    {/* Rejet */}
                    {selectedDemande.rejete && (
                      <div className="p-4 bg-red-50 rounded border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span className="font-semibold text-red-700">
                            Rejetée
                          </span>
                        </div>
                        <p className="text-sm text-red-700 ml-7">
                          {selectedDemande.date_rejet &&
                            `Le ${formatDateFR(selectedDemande.date_rejet)}`}
                        </p>
                        {selectedDemande.motif_rejet && (
                          <p className="text-sm text-red-700 ml-7 mt-1">
                            Motif: {selectedDemande.motif_rejet}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bouton fermer */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => setSelectedDemande(null)}
                      variant="outline"
                    >
                      ✕ Fermer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
