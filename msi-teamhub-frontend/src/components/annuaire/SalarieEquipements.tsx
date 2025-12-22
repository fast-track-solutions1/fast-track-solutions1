'use client';

import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, Loader2 } from 'lucide-react';
import EquipementCard from './EquipementCard';

interface Equipement {
  id: number;
  equipement_nom: string;
  equipement_type: string;
  model?: string;
  numero_serie?: string;
  date_affectation: string;
  date_retrait?: string;
  etat: string;
  etat_display: string;
  notes?: string;
  duree_utilisation?: number;
}

interface SalarieEquipementsProps {
  salarieId: number;
  salarieNom: string;
  salariePrenom: string;
}

const SalarieEquipements: React.FC<SalarieEquipementsProps> = ({
  salarieId,
  salarieNom,
  salariePrenom,
}) => {
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipements = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Token non trouvé');
        }

        const response = await fetch(`http://localhost:8000/api/salaries/${salarieId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }

        const data = await response.json();
        setEquipements(data.equipements || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipements();
  }, [salarieId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Chargement des équipements...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Équipements</h2>
            <p className="text-sm text-gray-500">
              {equipements.length} équipement{equipements.length > 1 ? 's' : ''} affecté{equipements.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Liste des équipements */}
      {equipements.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            Aucun équipement affecté à {salariePrenom} {salarieNom}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipements.map((equipement) => (
            <EquipementCard key={equipement.id} equipement={equipement} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SalarieEquipements;
