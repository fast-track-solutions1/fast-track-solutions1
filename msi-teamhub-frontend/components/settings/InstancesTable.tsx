'use client';

import { Edit2, Trash2, CheckCircle, XCircle, ArrowUp, ArrowDown } from 'lucide-react';

interface Instance {
  id: number;
  serialNumber: string;
  assignedTo: string;
  dateAssignment: string;
  statut: string;
  localisation: string;
}

interface InstancesTableProps {
  instances: Instance[];
  onEdit: (instance: Instance) => void;
  onDelete: (id: number) => void;
  sortField: 'serialNumber' | 'assignedTo' | 'dateAssignment';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'serialNumber' | 'assignedTo' | 'dateAssignment') => void;
}

export default function InstancesTable({
  instances,
  onEdit,
  onDelete,
  sortField,
  sortOrder,
  onSort,
}: InstancesTableProps) {
  // 💡 HINT: Crée une fonction pour afficher l'icône de tri
  const SortIcon = ({ field }: { field: 'serialNumber' | 'assignedTo' | 'dateAssignment' }) => {
    if (sortField !== field) return <span className="text-gray-400">⇅</span>;
    return sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="w-full">
        {/* 💡 HINT: En-tête du tableau avec colonnes triables */}
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th onClick={() => onSort('serialNumber')} className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
              <div className="flex items-center gap-2">N° Série <SortIcon field="serialNumber" /></div>
            </th>
            <th onClick={() => onSort('assignedTo')} className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
              <div className="flex items-center gap-2">Assigné à <SortIcon field="assignedTo" /></div>
            </th>
            <th onClick={() => onSort('dateAssignment')} className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
              <div className="flex items-center gap-2">Date <SortIcon field="dateAssignment" /></div>
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Statut</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Localisation</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
          </tr>
        </thead>
        {/* 💡 HINT: Corps du tableau avec les données */}
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {instances.map((instance) => (
            <tr key={instance.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-mono">{instance.serialNumber}</td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{instance.assignedTo}</td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                {new Date(instance.dateAssignment).toLocaleDateString('fr-FR')}
              </td>
              {/* 💡 HINT: Affiche le statut avec icône */}
              <td className="px-6 py-4 text-sm">
                {instance.statut === 'Actif' ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={16} /> Actif
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle size={16} /> Inactif
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{instance.localisation}</td>
              {/* 💡 HINT: Boutons d'action (Modifier et Supprimer) */}
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(instance)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded text-blue-600 dark:text-blue-400"
                    title="Modifier"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(instance.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
