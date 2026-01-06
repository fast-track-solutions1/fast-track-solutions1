'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  AlertCircle,
  Loader2,
  Grid3x3,
  Table2,
  BarChart3,
} from 'lucide-react'

interface Societe {
  id: number
  nom: string
  email?: string
  adresse?: string
  telephone?: string
  pays?: string
  ville?: string
  actif: boolean
  date_creation: string
}

type ViewType = 'cards' | 'table'

export default function AnnuaireSocietesPage() {
  const router = useRouter()

  // ===== STATE =====
  const [societes, setSocietes] = useState<Societe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // UI
  const [viewType, setViewType] = useState<ViewType>('table')
  const [showStats, setShowStats] = useState(false)

  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActif, setFilterActif] = useState<string>('all')

  // Tri
  const [sortField, setSortField] = useState<'nom' | 'email' | 'pays'>('nom')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // ===== CHARGEMENT DES DONNÉES =====
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (typeof window === 'undefined') {
        throw new Error('Environnement client-side requis')
      }

      console.log('🔍 Recherche du token...')

      // Cherche le token à plusieurs endroits possibles
      let token = 
        localStorage.getItem('token') || 
        localStorage.getItem('access_token') ||
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('token') ||
        sessionStorage.getItem('access_token')

      // Si pas trouvé, essaie les cookies
      if (!token) {
        const cookies = document.cookie.split(';')
        for (let cookie of cookies) {
          const trimmed = cookie.trim()
          if (trimmed.includes('token') || trimmed.includes('auth')) {
            const parts = trimmed.split('=')
            if (parts.length === 2) {
              token = parts[1]
              console.log('✓ Token trouvé dans les cookies')
              break
            }
          }
        }
      }

      if (token) {
        console.log('✓ Token trouvé:', token.substring(0, 20) + '...')
      } else {
        console.warn('⚠️ Aucun token trouvé - La requête sera faite sans authentification')
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const endpoint = `${apiUrl}/api/societes/?limit=1000`

      console.log('📡 Appel API:', endpoint)

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
        credentials: 'include',
      })

      console.log('📊 Statut réponse:', response.status)

      if (response.status === 401) {
        throw new Error('❌ Token expiré ou invalide - Veuillez vous reconnecter')
      }

      if (response.status === 403) {
        throw new Error('❌ Accès refusé - Permissions insuffisantes')
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erreur API:', errorText)
        throw new Error(`Erreur API ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Données reçues:', data)

      // Normalise les données
      if (Array.isArray(data)) {
        setSocietes(data)
      } else if (data.results && Array.isArray(data.results)) {
        setSocietes(data.results)
      } else if (data.data && Array.isArray(data.data)) {
        setSocietes(data.data)
      } else {
        console.warn('⚠️ Format de données inattendu:', data)
        setSocietes([])
      }

      console.log('✅ Sociétés chargées:', data.length || 0)
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('🚨 Erreur complète:', err)
      setError(errorMsg)
      setSocietes([])
    } finally {
      setLoading(false)
    }
  }, [])

  // ===== EFFETS =====
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadData()
    }
  }, [mounted, loadData])

  // ===== FILTRAGE ET TRI =====
  const filteredAndSortedSocietes = useMemo(() => {
    let filtered = [...societes]

    // Recherche
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(s =>
        s.nom.toLowerCase().includes(search) ||
        (s.email && s.email.toLowerCase().includes(search)) ||
        (s.adresse && s.adresse.toLowerCase().includes(search)) ||
        (s.pays && s.pays.toLowerCase().includes(search)) ||
        (s.ville && s.ville.toLowerCase().includes(search)) ||
        (s.telephone && s.telephone.toLowerCase().includes(search))
      )
    }

    // Filtre statut
    if (filterActif !== 'all') {
      filtered = filtered.filter(s =>
        filterActif === 'true' ? s.actif : !s.actif
      )
    }

    // Tri
    filtered.sort((a, b) => {
      let comp = 0
      switch (sortField) {
        case 'nom':
          comp = a.nom.localeCompare(b.nom)
          break
        case 'email':
          comp = (a.email || '').localeCompare(b.email || '')
          break
        case 'pays':
          comp = (a.pays || '').localeCompare(b.pays || '')
          break
        default:
          comp = 0
      }
      return sortOrder === 'asc' ? comp : -comp
    })

    return filtered
  }, [societes, searchTerm, filterActif, sortField, sortOrder])

  // ===== STATISTIQUES =====
  const stats = useMemo(() => {
    return {
      total: societes.length,
      actives: societes.filter(s => s.actif).length,
      inactives: societes.filter(s => !s.actif).length,
      resultats: filteredAndSortedSocietes.length,
    }
  }, [societes, filteredAndSortedSocietes])

  // ===== HANDLERS =====
  const handleExportCSV = useCallback(() => {
    if (filteredAndSortedSocietes.length === 0) {
      alert('Aucune donnée à exporter')
      return
    }

    const headers = [
      'Nom',
      'Email',
      'Adresse',
      'Téléphone',
      'Pays',
      'Ville',
      'Statut',
      'Date de création',
    ]

    const rows = filteredAndSortedSocietes.map(s => [
      s.nom,
      s.email || '',
      s.adresse || '',
      s.telephone || '',
      s.pays || '',
      s.ville || '',
      s.actif ? 'Actif' : 'Inactif',
      new Date(s.date_creation).toLocaleDateString('fr-FR'),
    ])

    const csv = [headers, ...rows]
      .map(row =>
        row
          .map(cell => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `annuaire_societes_${new Date()
      .toISOString()
      .split('T')[0]}.csv`
    link.click()
  }, [filteredAndSortedSocietes])

  const handleSort = useCallback((field: 'nom' | 'email' | 'pays') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }, [sortField, sortOrder])

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (!mounted) return null

  const hasActiveFilters = searchTerm.trim() !== '' || filterActif !== 'all'

  return (
    <div className="flex flex-col gap-6 p-6 bg-white dark:bg-slate-950 min-h-screen">
      {/* ===== EN-TÊTE ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Annuaire des Sociétés
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {filteredAndSortedSocietes.length} société
            {filteredAndSortedSocietes.length !== 1 ? 's' : ''} trouvée
            {filteredAndSortedSocietes.length !== 1 ? 's' : ''} sur {societes.length} total
          </p>
        </div>

        <div className="flex gap-2">
          {/* Stats Button */}
          <button
            onClick={() => setShowStats(!showStats)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showStats
                ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-700 dark:text-blue-300'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            aria-label="Afficher les statistiques"
          >
            <BarChart3 size={18} />
            Stats
          </button>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            disabled={filteredAndSortedSocietes.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white"
            aria-label="Exporter en CSV"
          >
            <Download size={18} />
            Export
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white"
            aria-label="Rafraîchir les données"
          >
            <RefreshCw
              size={18}
              className={loading ? 'animate-spin' : ''}
            />
            Rafraîchir
          </button>
        </div>
      </div>

      {/* ===== ERREUR ===== */}
      {error && (
        <div className="flex gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <p className="font-medium text-red-900 dark:text-red-200">
              Erreur de chargement
            </p>
            <p className="text-sm text-red-800 dark:text-red-300 mt-1">
              {error}
            </p>
            <div className="mt-3 space-y-1 text-red-700 dark:text-red-400 text-xs">
              <p><strong>Solutions:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>✓ Assurez-vous d'être connecté</li>
                <li>✓ Vérifiez que l'API est accessible</li>
                <li>✓ Vérifiez le token d'authentification</li>
                <li>✓ Cliquez sur "Rafraîchir" pour réessayer</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ===== STATISTIQUES ===== */}
      {showStats && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Total
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.total}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Actives
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {stats.actives}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Inactives
            </p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {stats.inactives}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Résultats
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {stats.resultats}
            </p>
          </div>
        </div>
      )}

      {/* ===== RECHERCHE ET FILTRES ===== */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        {/* Recherche */}
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={18}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher une société..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            aria-label="Rechercher une société"
          />
        </div>

        {/* Filtre Statut */}
        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={18}
          />
          <select
            value={filterActif}
            onChange={e => setFilterActif(e.target.value)}
            className="pl-10 pr-8 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </select>
        </div>
      </div>

      {/* ===== SWITCH CARTES/TABLEAU ===== */}
      {!loading && !error && societes.length > 0 && (
        <div className="flex gap-2 bg-slate-200 dark:bg-slate-800 rounded-xl p-1 w-fit">
          <button
            onClick={() => setViewType('cards')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewType === 'cards'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            aria-label="Vue en cartes"
          >
            <Grid3x3 className="h-5 w-5" />
            Cartes
          </button>
          <button
            onClick={() => setViewType('table')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewType === 'table'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            aria-label="Vue en tableau"
          >
            <Table2 className="h-5 w-5" />
            Tableau
          </button>
        </div>
      )}

      {/* ===== AFFICHAGE DES DONNÉES ===== */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
        </div>
      )}

      {filteredAndSortedSocietes.length === 0 && !loading && !error && (
        <div className="text-center py-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-slate-500 dark:text-slate-400">
            {hasActiveFilters
              ? 'Aucune société ne correspond aux filtres'
              : 'Aucune société trouvée'}
          </p>
        </div>
      )}

      {/* ===== VUE CARTES ===== */}
      {viewType === 'cards' &&
        !loading &&
        !error &&
        filteredAndSortedSocietes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredAndSortedSocietes.map(societe => (
              <div
                key={societe.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg dark:hover:shadow-blue-500/20 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2">
                    {societe.nom}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      societe.actif
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                    }`}
                  >
                    {societe.actif ? '✓' : '✗'}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  {societe.email && (
                    <p className="truncate">
                      <span className="font-medium">📧</span> {societe.email}
                    </p>
                  )}
                  {societe.telephone && (
                    <p>
                      <span className="font-medium">📱</span> {societe.telephone}
                    </p>
                  )}
                  {societe.adresse && (
                    <p className="line-clamp-2">
                      <span className="font-medium">📍</span> {societe.adresse}
                    </p>
                  )}
                  {societe.pays && (
                    <p>
                      <span className="font-medium">🌍</span> {societe.pays}
                    </p>
                  )}
                  {societe.ville && (
                    <p>
                      <span className="font-medium">🏙️</span> {societe.ville}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-500">
                  {formatDate(societe.date_creation)}
                </div>
              </div>
            ))}
          </div>
        )}

      {/* ===== VUE TABLEAU ===== */}
      {viewType === 'table' &&
        !loading &&
        !error &&
        filteredAndSortedSocietes.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('nom')}
                      className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Nom
                      {sortField === 'nom' && (
                        <span className="text-xs">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Email
                      {sortField === 'email' && (
                        <span className="text-xs">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white text-sm">
                    Adresse
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white text-sm">
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('pays')}
                      className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Pays
                      {sortField === 'pays' && (
                        <span className="text-xs">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white text-sm">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredAndSortedSocietes.map(societe => (
                  <tr
                    key={societe.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white text-sm">
                      {societe.nom}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                      {societe.email || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                      {societe.adresse || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                      {societe.telephone || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                      {societe.pays || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          societe.actif
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                        }`}
                      >
                        {societe.actif ? '✓ Actif' : '✗ Inactif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  )
}