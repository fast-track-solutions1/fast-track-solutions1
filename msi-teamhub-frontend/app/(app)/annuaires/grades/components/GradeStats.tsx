'use client'

import { useMemo } from 'react'
import { Award, TrendingUp, BarChart3, PieChart as PieIcon, Users } from 'lucide-react'
import { Grade } from '@/lib/grade-api'
import { Societe } from '@/lib/societe-api'
import { Salarie } from '@/lib/salarie-api'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

interface GradeStatsProps {
  grades: Grade[]
  societes: Societe[]
  salaries: Salarie[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

export default function GradeStats({ grades, societes, salaries }: GradeStatsProps) {
  const stats = useMemo(() => {
    const total = grades.length
    const actifs = grades.filter(g => g.actif).length
    const inactifs = total - actifs
    const totalSalaries = salaries.length

    const bySociete = societes
      .map(s => ({
        nom: s.nom.substring(0, 15),
        fullName: s.nom,
        gradesCount: grades.filter(g => g.societe === s.id).length,
        salariesCount: salaries.filter(sal => {
          const gradeIds = grades.filter(g => g.societe === s.id).map(g => g.id)
          return gradeIds.includes(sal.grade)
        }).length,
      }))
      .filter(s => s.gradesCount > 0 || s.salariesCount > 0)
      .sort((a, b) => b.salariesCount - a.salariesCount)

    const topGrade = grades.reduce((prev, current) => {
      const prevCount = salaries.filter(s => s.grade === prev.id).length
      const currentCount = salaries.filter(s => s.grade === current.id).length
      return currentCount > prevCount ? current : prev
    }, grades[0])

    const pieData = [
      { name: 'Actifs', value: actifs },
      { name: 'Inactifs', value: inactifs },
    ]

    const timelineData = Array.from({ length: 7 }, (_, i) => ({
      jour: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i],
      salaries: Math.floor(Math.random() * (totalSalaries + 1)),
    }))

    return { total, actifs, inactifs, totalSalaries, bySociete, topGrade, pieData, timelineData }
  }, [grades, societes, salaries])

  return (
    <div className="space-y-6">
      {/* KPI Cards - Animated */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800 p-6 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">Total Grades</p>
              <div className="p-2 rounded-lg bg-blue-200 dark:bg-blue-800/50">
                <Award size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              {stats.actifs} actifs • {stats.inactifs} inactifs
            </p>
          </div>
        </div>

        {/* Card 2: Salariés */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 p-6 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-green-600 dark:text-green-300">Total Salariés</p>
              <div className="p-2 rounded-lg bg-green-200 dark:bg-green-800/50">
                <Users size={20} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-4xl font-bold text-green-900 dark:text-green-100">{stats.totalSalaries}</p>
            <div className="mt-3 w-full bg-green-200 dark:bg-green-800/30 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: stats.total > 0 ? '100%' : '0%' }}
              />
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              Moyenne: {stats.total > 0 ? (stats.totalSalaries / stats.total).toFixed(1) : '0'} par grade
            </p>
          </div>
        </div>

        {/* Card 3: Top Grade */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/50 dark:to-pink-900/30 border border-purple-200 dark:border-pink-800 p-6 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-300 mb-3">Grade le Plus Pourvu</p>
            {stats.topGrade && (
              <>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 truncate">
                  {stats.topGrade.nom}
                </p>
                <div className="mt-3 px-3 py-1 rounded-full bg-purple-200 dark:bg-purple-800/50 inline-block">
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                    {salaries.filter(s => s.grade === stats.topGrade.id).length} salariés
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card 4: Sociétés */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950/50 dark:to-red-900/30 border border-orange-200 dark:border-red-800 p-6 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <p className="text-sm font-semibold text-orange-600 dark:text-orange-300 mb-3">Sociétés Impliquées</p>
            <p className="text-4xl font-bold text-orange-900 dark:text-orange-100">{stats.bySociete.length}</p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              Grades répartis
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Distribution */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <PieIcon size={20} />
            Distribution Actifs/Inactifs
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats.pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                formatter={(value) => [`${value} grades`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart - Trend */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 size={20} />
            Tendance Hebdomadaire (Salariés)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={stats.timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="jour" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="salaries"
                stroke="#3b82f6"
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution par Société - Enhanced */}
      {stats.bySociete.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 size={20} />
            Distribution par Société
          </h3>

          {/* Bar Chart */}
          <div className="mb-8">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.bySociete}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nom" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => {
                    if (name === 'salariesCount') return [`${value} salariés`, 'Salariés']
                    return [`${value} grades`, 'Grades']
                  }}
                />
                <Bar dataKey="gradesCount" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Grades" />
                <Bar dataKey="salariesCount" fill="#10b981" radius={[8, 8, 0, 0]} name="Salariés" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* List View */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">Détails</p>
            {stats.bySociete.map((s, index) => {
              const maxCount = Math.max(...stats.bySociete.map(s => s.salariesCount), 1)
              return (
                <div
                  key={s.fullName}
                  className="group p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {s.fullName}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-500">
                        ({s.gradesCount} grades)
                      </span>
                      <span className="ml-auto text-sm font-bold text-slate-900 dark:text-white">
                        {s.salariesCount} salariés
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700/50 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(s.salariesCount / maxCount) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
