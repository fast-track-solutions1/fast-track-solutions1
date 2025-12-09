'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface Equipment {
  id?: number;
  nom: string;
  type: string;
  quantite: number;
  statut: string;
  departement: string;
}

interface EquipmentFormProps {
  equipment?: Equipment | null;
  onSave: (data: Omit<Equipment, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export default function EquipmentForm({ equipment, onSave, onCancel }: EquipmentFormProps) {
  const [formData, setFormData] = useState({
    nom: equipment?.nom || '',
    type: equipment?.type || '',
    quantite: equipment?.quantite || 0,
    statut: equipment?.statut || 'Actif',
    departement: equipment?.departement || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nom.trim()) {
      setError('Le nom est obligatoire');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {equipment ? 'Modifier l\'équipement' : 'Ajouter un équipement'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Erreur */}
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded">
              {error}
            </div>
          )}

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nom *
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Nom de l'équipement"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Type
            </label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Type d'équipement"
            />
          </div>

          {/* Quantité */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Quantité
            </label>
            <input
              type="number"
              name="quantite"
              value={formData.quantite}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="0"
            />
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Statut
            </label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
            </select>
          </div>

          {/* Département */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Département
            </label>
            <input
              type="text"
              name="departement"
              value={formData.departement}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Département"
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {equipment ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
