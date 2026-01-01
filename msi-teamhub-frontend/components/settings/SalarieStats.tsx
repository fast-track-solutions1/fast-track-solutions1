'use client';

import { useMemo } from 'react';
import { Users, TrendingUp, UserCheck, Building2 } from 'lucide-react';
import { Salarie } from '@/lib/salarie-api';
import { Societe } from '@/lib/societe-api';
import { Service } from '@/lib/service-api';
import { Grade } from '@/lib/grade-api';

interface SalarieStatsProps {
  salaries: Salarie[];
  societes: Societe[];
  services: Service[];
  grades: Grade[];
}

export default function SalarieStats({ salaries, societes, services, grades }: SalarieStatsProps) {
  const stats = useMemo(() => {
    const total = salaries.length;
    const actifs = salaries.filter((s) => s.statut === 'actif').length;
    const inactifs = salaries.filter((s) => s.statut !== 'actif').length;
    const avecResponsable = salaries.filter((s) => s.responsable_direct).length;

    const bySociete = societes.map((societe) => {
      const count = salaries.filter((s) => s.societe === societe.id).length;
      return { nom: societe.nom, count };
    }).filter((s) => s.count > 0);

    return {
      total,
      actifs,
      inactifs,
      avecResponsable,
      bySociete,
    };
  }, [salaries, societes]);

  const maxCount = Math.max(...stats.bySociete.map((s) => s.count), 1);

  return (
    <div className="space-y-6">
      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Salariés</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.total}</p>
            </div>
            <Users size={32} className="text-blue-600 opacity-20" />
          </div>
        </div>

        {/* Actifs */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Salariés Actifs</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.actifs}</p>
            </div>
            <TrendingUp size={32} className="text-green-600 opacity-20" />
          </div>
        </div>

        {/* Inactifs */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Salariés Inactifs</p>
              <p className="text-3xl font-bold text-slate-600 mt-2">{stats.inactifs}</p>
            </div>
            <Users size={32} className="text-slate-600 opacity-20" />
          </div>
        </div>

        {/* Avec Responsable */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Avec Responsable</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.avecResponsable}</p>
            </div>
            <UserCheck size={32} className="text-slate-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Répartition par société */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Building2 size={24} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Répartition par société</h3>
        </div>

        {stats.bySociete.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">Aucune donnée disponible</p>
        ) : (
          <div className="space-y-4">
            {stats.bySociete.map((societe) => (
              <div key={societe.nom}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{societe.nom}</span>
                  <span className="text-sm font-bold text-blue-600">{societe.count}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(societe.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
