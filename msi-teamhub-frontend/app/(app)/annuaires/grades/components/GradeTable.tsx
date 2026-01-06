'use client'

import { CheckCircle, XCircle, ArrowUp, ArrowDown, Users } from 'lucide-react'
import { Grade } from '@/lib/grade-api'
import { Societe } from '@/lib/societe-api'
import { Salarie } from '@/lib/salarie-api'

interface GradeTableProps {
  grades: Grade[]
  societes: Societe[]
  salaries: Salarie[]
  sortField?: 'nom' | 'ordre'
  sortOrder?: 'asc' | 'desc'
  onSort?: (field: 'nom' | 'ordre') => void
  onGradeClick?: (grade: Grade) => void
}

export default function GradeTable({
  grades,
  societes,
  salaries,
  sortField = 'nom',
  sortOrder = 'asc',
  onSort,
  onGradeClick,
}: GradeTableProps) {
  const getSocieteName = (id: number) => societes.find(s => s.id === id)?.nom || 'N/A'

  const getSalariesCount = (gradeId: number) => {
    return salaries.filter(s => s.grade === gradeId).length
  }

  const SortIcon = ({ field }: { field: 'nom' | 'ordre' }) => {
    if (sortField !== field) return <span className="text-xs text-slate-400">↕</span>
    return sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md hover:shadow-lg transition-shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <button
                  onClick={() => onSort?.('ordre')}
                  className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Ordre
                  <SortIcon field="ordre" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <button
                  onClick={() => onSort?.('nom')}
                  className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Nom
                  <SortIcon field="nom" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Société
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Salariés
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {grades.map((grade) => {
              const salariesCount = getSalariesCount(grade.id)
              return (
                <tr
                  key={grade.id}
                  onClick={() => onGradeClick?.(grade)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm font-mono font-semibold">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                      #{grade.ordre || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-white text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      {grade.nom}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm font-mono">
                    <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {grade.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                    {getSocieteName(grade.societe)}
                  </td>
                  <td className="px-6 py-4">
                    {grade.actif ? (
                      <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Actif</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                        <XCircle size={16} className="text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Inactif</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onGradeClick?.(grade)
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 transition-colors group/btn"
                    >
                      <Users size={16} className="text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                        {salariesCount}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                    {new Date(grade.date_creation).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {grades.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">Aucun grade à afficher</p>
        </div>
      )}
    </div>
  )
}
