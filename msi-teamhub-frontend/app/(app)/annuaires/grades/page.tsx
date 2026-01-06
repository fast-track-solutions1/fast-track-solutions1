'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { AlertCircle, Loader2, BarChart3, Search, Download, RefreshCw } from 'lucide-react'
import { Grade } from '@/lib/grade-api'
import { Societe } from '@/lib/societe-api'
import { Salarie } from '@/lib/salarie-api'
import GradeTable from './components/GradeTable'
import GradeStats from './components/GradeStats'
import GradeDetailModal from './components/GradeDetailModal'

export default function AnnuaireGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [societes, setSocietes] = useState<Societe[]>([])
  const [salaries, setSalaries] = useState<Salarie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActif, setFilterActif] = useState<string>('all')
  const [filterSociete, setFilterSociete] = useState<number | null>(null)
  const [sortField, setSortField] = useState<'nom' | 'ordre'>('nom')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem('access_token')
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

        const [gradesRes, societesRes, salariesRes] = await Promise.all([
          fetch(`${apiUrl}/api/grades/`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          }),
          fetch(`${apiUrl}/api/societes/`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          }),
          fetch(`${apiUrl}/api/salaries/`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          }),
        ])

        if (!gradesRes.ok || !societesRes.ok || !salariesRes.ok) throw new Error('Erreur de chargement')

        const gradesData = await gradesRes.json()
        const societesData = await societesRes.json()
        const salariesData = await salariesRes.json()

        setGrades(Array.isArray(gradesData) ? gradesData : gradesData.results || [])
        setSocietes(Array.isArray(societesData) ? societesData : societesData.results || [])
        setSalaries(Array.isArray(salariesData) ? salariesData : salariesData.results || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredAndSortedGrades = useMemo(() => {
    let result = grades.filter(g => {
      const matchSearch = g.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         g.code.toLowerCase().includes(searchTerm.toLowerCase())
      const matchActif = filterActif === 'all' || (filterActif === 'true' ? g.actif : !g.actif)
      const matchSociete = !filterSociete || g.societe === filterSociete
      return matchSearch && matchActif && matchSociete
    })

    result.sort((a, b) => {
      let comp = 0
      switch (sortField) {
        case 'nom':
          comp = a.nom.localeCompare(b.nom)
          break
        case 'ordre':
          comp = (a.ordre || 0) - (b.ordre || 0)
          break
      }
      return sortOrder === 'asc' ? comp : -comp
    })

    return result
  }, [grades, searchTerm, filterActif, filterSociete, sortField, sortOrder])

  const getSalariesByGrade = useCallback((gradeId: number) => {
    return salaries.filter(s => s.grade === gradeId)
  }, [salaries])

  const handleSort = useCallback((field: 'nom' | 'ordre') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }, [sortField, sortOrder])

  const handleExportCSV = useCallback(() => {
    if (filteredAndSortedGrades.length === 0) {
      alert('Aucune donnée à exporter')
      return
    }

    const headers = ['Ordre', 'Nom', 'Code', 'Société', 'Statut', 'Salariés', 'Date création']
    const rows = filteredAndSortedGrades.map(g => [
      g.ordre || '',
      g.nom,
      g.code,
      societes.find(s => s.id === g.societe)?.nom || '',
      g.actif ? 'Actif' : 'Inactif',
      getSalariesByGrade(g.id).length,
      new Date(g.date_creation).toLocaleDateString('fr-FR'),
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `annuaire_grades_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }, [filteredAndSortedGrades, societes, getSalariesByGrade])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative w-16 h-16 mb-4">
          <Loader2 className="absolute inset-0 animate-spin text-blue-600 dark:text-blue-400" size={64} />
        </div>
        <p className="text-slate-600 dark:text-slate-400 animate-pulse">Chargement des données...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* HEADER - Enhanced */}
      <div className="rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Annuaire des Grades</h1>
            <p className="text-blue-100">
              {filteredAndSortedGrades.length} grade{filteredAndSortedGrades.length !== 1 ? 's' : ''} trouvé{filteredAndSortedGrades.length !== 1 ? 's' : ''} sur{' '}
              <span className="font-semibold">{grades.length}</span> total
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors font-medium"
            >
              <RefreshCw size={18} />
              Actualiser
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                showStats
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <BarChart3 size={18} />
              {showStats ? 'Masquer' : 'Afficher'} Statistiques
            </button>
            <button
              onClick={handleExportCSV}
              disabled={filteredAndSortedGrades.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              Exporter CSV
            </button>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 flex gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-medium text-red-900 dark:text-red-200">Erreur de chargement</p>
            <p className="text-sm text-red-800 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* STATS - Collapsible */}
      {showStats && !error && <GradeStats grades={filteredAndSortedGrades} societes={societes} salaries={salaries} />}

      {/* FILTERS - Enhanced */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher un grade par nom ou code..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <select
          value={filterSociete || ''}
          onChange={e => setFilterSociete(e.target.value ? Number(e.target.value) : null)}
          className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Toutes les sociétés</option>
          {societes.map(s => (
            <option key={s.id} value={s.id}>
              {s.nom}
            </option>
          ))}
        </select>

        <select
          value={filterActif}
          onChange={e => setFilterActif(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="all">Tous les statuts</option>
          <option value="true">Actif</option>
          <option value="false">Inactif</option>
        </select>
      </div>

      {/* TABLE */}
      {!error && filteredAndSortedGrades.length > 0 && (
        <GradeTable
          grades={filteredAndSortedGrades}
          societes={societes}
          salaries={salaries}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          onGradeClick={setSelectedGrade}
        />
      )}

      {/* EMPTY STATE */}
      {!error && filteredAndSortedGrades.length === 0 && (
        <div className="text-center py-16 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 mb-4">
            <AlertCircle className="text-slate-600 dark:text-slate-400" size={32} />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">Aucun grade trouvé</p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
            Essayez de modifier vos filtres de recherche
          </p>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedGrade && (
        <GradeDetailModal
          grade={selectedGrade}
          salaries={getSalariesByGrade(selectedGrade.id)}
          onClose={() => setSelectedGrade(null)}
        />
      )}
    </div>
  )
}
