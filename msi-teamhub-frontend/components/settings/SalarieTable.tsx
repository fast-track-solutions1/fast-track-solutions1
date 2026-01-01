// @/components/settings/SalarieTable.tsx - Tableau complet et performant

'use client';

import { Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Salarie } from '@/lib/salarie-api';
import { Societe } from '@/lib/societe-api';
import { Service } from '@/lib/service-api';
import { Grade } from '@/lib/grade-api';

interface SalarieTableProps {
  salaries: Salarie[];
  societes: Societe[];
  services: Service[];
  grades: Grade[];
  onEdit: (salarie: Salarie) => void;
  onDelete: (id: number) => void;
  sortField: 'nom' | 'societe' | 'date_embauche';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'nom' | 'societe' | 'date_embauche') => void;
}

const STATUT_COLORS: Record<string, string> = {
  actif: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactif: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  conge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  arret_maladie: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function SalarieTable({
  salaries,
  societes,
  services,
  grades,
  onEdit,
  onDelete,
  sortField,
  sortOrder,
  onSort,
}: SalarieTableProps) {
  const getSocieteName = (id: number) => societes.find((s) => s.id === id)?.nom || 'N/A';
  const getServiceName = (id: number | null) => services.find((s) => s.id === id)?.nom || 'N/A';
  const getGradeName = (id: number | null) => grades.find((g) => g.id === id)?.nom || 'N/A';

  const SortIcon = ({ field }: { field: 'nom' | 'societe' | 'date_embauche' }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />;
  };

  const getStatutBadge = (statut: string) => {
    const colors = STATUT_COLORS[statut] || STATUT_COLORS.actif;
    const label = {
      actif: 'Actif',
      inactif: 'Inactif',
      conge: 'En congé',
      arret_maladie: 'Arrêt maladie',
    }[statut];

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors}`}>
        {label}
      </span>
    );
  };

  if (salaries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>Aucun salarié trouvé</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <th
              onClick={() => onSort('nom')}
              className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                Nom & Prénom
                <SortIcon field="nom" />
              </div>
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
              Email
            </th>
            <th
              onClick={() => onSort('societe')}
              className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                Société
                <SortIcon field="societe" />
              </div>
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
              Service
            </th>
            <th
              onClick={() => onSort('date_embauche')}
              className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                Date embauche
                <SortIcon field="date_embauche" />
              </div>
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
              Statut
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {salaries.map((salarie) => (
            <tr
              key={salarie.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {salarie.photo ? (
                    <img
                      src={salarie.photo}
                      alt={`${salarie.prenom} ${salarie.nom}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-300">
                      {salarie.prenom[0]}{salarie.nom[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {salarie.prenom} {salarie.nom}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{salarie.matricule}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                {salarie.mail_professionnel || 'N/A'}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                {salarie.societe_nom || getSocieteName(salarie.societe)}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                {salarie.service_nom || getServiceName(salarie.service)}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                {new Date(salarie.date_embauche).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-6 py-4">
                {getStatutBadge(salarie.statut)}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(salarie)}
                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(salarie.id)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
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
