'use client';

import { Edit2, Trash2, CheckCircle, XCircle, ArrowUp, ArrowDown } from 'lucide-react';

interface Equipment {
  id: number;
  nom: string;
  type: string;
  quantite: number;
  statut: string;
  departement: string;
}

interface EquipmentTableProps {
  equipments: Equipment[];
  onEdit: (equipment: Equipment) => void;
  onDelete: (id: number) => void;
  sortField: 'nom' | 'type' | 'quantite';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'nom' | 'type' | 'quantite') => void;
}

export default function EquipmentTable({
  equipments,
  onEdit,
  onDelete,
  sortField,
  sortOrder,
  onSort,
}: EquipmentTableProps) {
  const SortIcon = ({ field }: { field: 'nom' | 'type' | 'quantite' }) => {
    if (sortField !== field) return <span className="text-gray-400">⇅</span>;
    return sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th onClick={() => onSort('nom')} className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
              <div className="flex items-center gap-2">Nom <SortIcon field="nom" /></div>
            </th>
            <th onClick={() => onSort('type')} className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
              <div className="flex items-center gap-2">Type <SortIcon field="type" /></div>
            </th>
            <th onClick={() => onSort('quantite')} className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
              <div className="flex items-center justify-center gap-2">Quantité <SortIcon field="quantite" /></div>
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Statut</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Département</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {equipments.map((equipment) => (
            <tr key={equipment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{equipment.nom}</td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{equipment.type}</td>
              <td className="px-6 py-4 text-sm text-center text-slate-900 dark:text-white">{equipment.quantite}</td>
              <td className="px-6 py-4 text-sm">
                {equipment.statut === 'Actif' ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={16} /> Actif
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle size={16} /> Inactif
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{equipment.departement}</td>
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(equipment)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded text-blue-600 dark:text-blue-400"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(equipment.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400"
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
