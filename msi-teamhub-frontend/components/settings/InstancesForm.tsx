'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface Instance {
  id?: number;
  serialNumber: string;
  assignedTo: string;
  dateAssignment: string;
  statut: string;
  localisation: string;
}

interface InstancesFormProps {
  instance?: Instance | null;
  onSave: (data: Omit<Instance, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export default function InstancesForm({ instance, onSave, onCancel }: InstancesFormProps) {
  // 💡 HINT: Initialise le formulaire avec les données existantes ou des valeurs vides
  const [formData, setFormData] = useState({
    serialNumber: instance?.serialNumber || '',
    assignedTo: instance?.assignedTo || '',
    dateAssignment: instance?.dateAssignment || '',
    statut: instance?.statut || 'Actif',
    localisation: instance?.localisation || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 💡 HINT: Gère les changements de champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 💡 HINT: Soumet le formulaire avec validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.serialNumber.trim()) {
      setError('Le numéro de série est obligatoire');
      return;
    }
    if (!formData.assignedTo.trim()) {
      setError('Le champ "Assigné à" est obligatoire');
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
        {/* 💡 HINT: En-tête de la modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {instance ? 'Modifier l\'instance' : 'Ajouter une instance'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* 💡 HINT: Formulaire avec validation et gestion d'erreurs */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Affichage des erreurs */}
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded">
              {error}
            </div>
          )}

          {/* Numéro de série */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Numéro de série *
            </label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="SN001"
            />
          </div>

          {/* Assigné à */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Assigné à *
            </label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Nom de la personne"
            />
          </div>

          {/* Date d'assignation */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date d'assignation
            </label>
            <input
              type="date"
              name="dateAssignment"
              value={formData.dateAssignment}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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

          {/* Localisation */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Localisation
            </label>
            <input
              type="text"
              name="localisation"
              value={formData.localisation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Bureau 101"
            />
          </div>

          {/* 💡 HINT: Boutons d'action avec état de chargement */}
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
              {instance ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
