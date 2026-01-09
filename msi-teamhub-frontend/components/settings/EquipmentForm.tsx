'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface Equipment {
  id?: number;
  nom: string;
  type_equipement: string;
  description?: string;
  stock_total: number;
  stock_disponible: number;
  actif: boolean;
}

interface EquipmentFormProps {
  equipment?: Equipment | null;
  onSave: (data: Omit<Equipment, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export default function EquipmentForm({ equipment, onSave, onCancel }: EquipmentFormProps) {
  const [formData, setFormData] = useState({
    nom: equipment?.nom || '',
    type_equipement: equipment?.type_equipement || '',
    description: equipment?.description || '',
    stock_total: equipment?.stock_total || 0,
    stock_disponible: equipment?.stock_disponible || 0,
    actif: equipment?.actif ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
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

    if (formData.stock_disponible > formData.stock_total) {
      setError('Stock disponible ne peut pas dépasser le stock total');
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
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {equipment ? 'Modifier l\'équipement' : 'Ajouter un équipement'}
          </h2>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Nom *</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type d'équipement</label>
            <input
              type="text"
              name="type_equipement"
              value={formData.type_equipement}
              onChange={handleChange}
              className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Stock Total</label>
              <input
                type="number"
                name="stock_total"
                value={formData.stock_total}
                onChange={handleChange}
                className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock Disponible</label>
              <input
                type="number"
                name="stock_disponible"
                value={formData.stock_disponible}
                onChange={handleChange}
                className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="actif"
              checked={formData.actif}
              onChange={handleChange}
              className="rounded"
            />
            <label className="text-sm font-medium">Actif</label>
          </div>

          <div className="flex gap-2 justify-end mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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
