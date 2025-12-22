'use client';

import { useMemo } from 'react';
import { Salarie } from '@/lib/salarie-api';
import { Departement } from '@/lib/departement-api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Users, MapPin, Award, TrendingUp } from 'lucide-react';

interface AnnuaireStatsProps {
  salaries: Salarie[];
  departements: Departement[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnnuaireStats({ salaries, departements }: AnnuaireStatsProps) {
  // Vérifications
  if (!departements || !Array.isArray(departements) || departements.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-200">
          Aucune donnée de département disponible
        </p>
      </div>
    );
  }

  const stats = useMemo(() => {
    // Stats par statut
    const parStatut = [
      { name: 'Actif', value: salaries.filter((s) => s.statut === 'actif').length },
      { name: 'Suspendu', value: salaries.filter((s) => s.statut === 'suspendu').length },
      { name: 'Absent', value: salaries.filter((s) => s.statut === 'absent').length },
      { name: 'Congé', value: salaries.filter((s) => s.statut === 'conge').length },
    ].filter((s) => s.value > 0);

    // Stats par département (top 6)
    const parDepartement: Record<number, number> = {};
    salaries.forEach((s) => {
      s.departements?.forEach((deptId) => {
        parDepartement[deptId] = (parDepartement[deptId] || 0) + 1;
      });
    });

    const topDepartements = Object.entries(parDepartement)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([deptId, count]) => ({
        name: departements.find((d) => d.id === Number(deptId))?.nom || 'Inconnu',
        value: count,
      }));

    // Stats par région (top 6)
    const parRegion: Record<string, number> = {};
    salaries.forEach((s) => {
      s.departements?.forEach((deptId) => {
        const dept = departements.find((d) => d.id === deptId);
        if (dept?.region) {
          parRegion[dept.region] = (parRegion[dept.region] || 0) + 1;
        }
      });
    });

    const topRegions = Object.entries(parRegion)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([region, count]) => ({ name: region, value: count }));

    return { parStatut, topDepartements, topRegions };
  }, [salaries, departements]);

  const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
  }: {
    label: string;
    value: number;
    icon: any;
    color: string;
  }) => (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${color} bg-white dark:bg-slate-900`}
    >
      <div className={`p-2 rounded-lg ${color.replace('border', 'bg').replace('300', '100')}`}>
        <Icon className={`h-4 w-4 ${color.replace('border', 'text').replace('300', '600')}`} />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
      {/* Stats rapides - Compactes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total" value={salaries.length} icon={Users} color="border-blue-300" />
        <StatCard
          label="Actifs"
          value={stats.parStatut.find((s) => s.name === 'Actif')?.value || 0}
          icon={TrendingUp}
          color="border-green-300"
        />
        <StatCard
          label="Départements"
          value={stats.topDepartements.length}
          icon={MapPin}
          color="border-purple-300"
        />
        <StatCard
          label="Régions"
          value={stats.topRegions.length}
          icon={Award}
          color="border-orange-300"
        />
      </div>

      {/* Graphiques - Réduits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Par Statut - Camembert compact */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Par Statut
          </h4>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={stats.parStatut}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {stats.parStatut.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Par Département - Barres compactes */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Top 6 Départements
          </h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.topDepartements}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Par Région - Barres compactes */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Top 6 Régions
          </h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.topRegions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
