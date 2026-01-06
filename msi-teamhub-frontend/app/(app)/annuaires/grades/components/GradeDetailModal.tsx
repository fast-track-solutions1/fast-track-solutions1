'use client'

import { useMemo, useState } from 'react'
import { X, Users, Search, Filter, ArrowUp, ArrowDown } from 'lucide-react'
import { Grade } from '@/lib/grade-api'
import { Salarie } from '@/lib/salarie-api'

interface GradeDetailModalProps {
  grade: Grade
  salaries: Salarie[]
  onClose: () => void
}

// Fonction pour calculer l'ancienneté
function calculateAnciennete(dateEmbauche: string | null): string {
  if (!dateEmbauche) return 'N/A'
  
  const entree = new Date(dateEmbauche)
  const aujourd = new Date()

  let years = aujourd.getFullYear() - entree.getFullYear()
  let months = aujourd.getMonth() - entree.getMonth()

  if (months < 0) {
    years--
    months += 12
  }

  if (years === 0 && months === 0) {
    const jours = Math.floor((aujourd.getTime() - entree.getTime()) / (1000 * 60 * 60 * 24))
    if (jours < 1) return 'Aujourd\'hui'
    if (jours < 7) return `${jours}j`
    const semaines = Math.floor(jours / 7)
    return `${semaines}s`
  }

  let result = ''
  if (years > 0) result += `${years}a`
  if (months > 0) {
    if (result) result += ' '
    result += `${months}m`
  }
  return result
}

export default function GradeDetailModal({ grade, salaries, onClose }: GradeDetailModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterService, setFilterService] = useState<number | null>(null)
  const [sortField, setSortField] = useState<'nom' | 'date_embauche' | 'service_nom'>('nom')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Récupérer tous les services uniques
  const services = useMemo(() => {
    const uniqueServices = new Map<number, string>()
    salaries.forEach(s => {
      if (s.service && s.service_nom) {
        uniqueServices.set(s.service, s.service_nom)
      }
    })
    return Array.from(uniqueServices.entries())
      .map(([id, nom]) => ({ id, nom }))
      .sort((a, b) => a.nom.localeCompare(b.nom))
  }, [salaries])

  // Filtrer et trier les salariés
  const filteredSalaries = useMemo(() => {
    let result = salaries.filter(s => {
      const matchSearch = 
        (s.nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.prenom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.matricule?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      
      const matchService = !filterService || s.service === filterService

      return matchSearch && matchService
    })

    result.sort((a, b) => {
      let comp = 0
      switch (sortField) {
        case 'nom':
          comp = `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`)
          break
        case 'date_embauche':
          const dateA = new Date(a.date_embauche || '').getTime()
          const dateB = new Date(b.date_embauche || '').getTime()
          comp = dateA - dateB
          break
        case 'service_nom':
          comp = (a.service_nom || '').localeCompare(b.service_nom || '')
          break
      }
      return sortOrder === 'asc' ? comp : -comp
    })

    return result
  }, [salaries, searchTerm, filterService, sortField, sortOrder])

  const handleSort = (field: 'nom' | 'date_embauche' | 'service_nom') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const SortIcon = ({ field }: { field: 'nom' | 'date_embauche' | 'service_nom' }) => {
    if (sortField !== field) return <span className="text-xs text-slate-400">↕</span>
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="w-full max-w-6xl max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 dark:from-purple-900 dark:via-purple-800 dark:to-purple-900 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">{grade.nom}</h2>
            <p className="text-purple-100 text-sm">
              {filteredSalaries.length} salarié{filteredSalaries.length !== 1 ? 's' : ''} trouvé{filteredSalaries.length !== 1 ? 's' : ''} sur {salaries.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={28} className="text-white" />
          </button>
        </div>

        {/* Filters */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 px-8 py-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, prénom ou matricule..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter by Service */}
          {services.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={18} className="text-slate-600 dark:text-slate-400" />
              <button
                onClick={() => setFilterService(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterService === null
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                Tous les services
              </button>
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => setFilterService(service.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterService === service.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {service.nom}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {filteredSalaries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('nom')}
                        className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        Nom et Prénom
                        <SortIcon field="nom" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Matricule
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Poste
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('service_nom')}
                        className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        Service
                        <SortIcon field="service_nom" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('date_embauche')}
                        className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        Date Entrée
                        <SortIcon field="date_embauche" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Ancienneté
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredSalaries.map((salarie) => (
                    <tr
                      key={salarie.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {salarie.nom} {salarie.prenom}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {salarie.mail_professionnel}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm font-mono">
                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
                          {salarie.matricule || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                        {salarie.poste || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
                          {salarie.service_nom || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                        {salarie.date_embauche
                          ? new Date(salarie.date_embauche).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-semibold">
                          {calculateAnciennete(salarie.date_embauche)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 px-8">
              <Users size={48} className="mx-auto text-slate-400 dark:text-slate-600 mb-4" />
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                Aucun salarié trouvé
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-8 py-4 flex justify-between items-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {filteredSalaries.length} résultat{filteredSalaries.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
