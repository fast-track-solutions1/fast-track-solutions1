'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Loader, Eye } from 'lucide-react'

interface Service {
  id: number
  nom: string
  description: string | null
  societe: number
  actif: boolean
  date_creation: string
}

interface Societe {
  id: number
  nom: string
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export default function AnnuaireServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [societes, setSocietes] = useState<Societe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSociete, setFilterSociete] = useState('all')
  const [filterActif, setFilterActif] = useState('all')
  const [sortField, setSortField] = useState<'nom' | 'societe'>('nom')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showModal, setShowModal] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const headers = getAuthHeaders()

        const [servicesRes, societesRes] = await Promise.all([
          fetch('http://localhost:8000/api/services/', { headers }),
          fetch('http://localhost:8000/api/societes/', { headers }),
        ])

        if (!servicesRes.ok || !societesRes.ok) {
          throw new Error('Erreur lors du chargement des données')
        }

        const servicesData = await servicesRes.json()
        const societesData = await societesRes.json()

        setServices(Array.isArray(servicesData) ? servicesData : servicesData.results || [])
        setSocietes(Array.isArray(societesData) ? societesData : societesData.results || [])
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredAndSortedServices = services
    .filter((service) => {
      const matchSearch =
        service.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      const matchSociete = filterSociete === 'all' || service.societe === Number(filterSociete)
      const matchActif = filterActif === 'all' || (filterActif === 'actif' ? service.actif : !service.actif)
      return matchSearch && matchSociete && matchActif
    })
    .sort((a, b) => {
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]

      if (sortField === 'societe') {
        aVal = societes.find((s) => s.id === a.societe)?.nom || ''
        bVal = societes.find((s) => s.id === b.societe)?.nom || ''
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortOrder === 'asc' ? (aVal < bVal ? -1 : 1) : aVal > bVal ? -1 : 1
    })

  const handleSort = (field: 'nom' | 'societe') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleViewService = (service: Service) => {
    setSelectedService(service)
    setShowModal(true)
  }

  const getSocieteName = (societeId: number) => {
    return societes.find((s) => s.id === societeId)?.nom || '—'
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
        <div className="text-center">
          <Loader className="inline-block animate-spin text-blue-600 dark:text-blue-400 mb-4" size={32} />
          <p className="text-slate-600 dark:text-slate-400">Chargement des services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Services</h1>
          <p className="text-slate-600 dark:text-slate-400">Annuaire des services et départements</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-red-900 dark:text-red-200">Erreur</p>
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un service..."
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <select
            value={filterSociete}
            onChange={(e) => setFilterSociete(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Toutes les sociétés</option>
            {societes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom}
              </option>
            ))}
          </select>

          <select
            value={filterActif}
            onChange={(e) => setFilterActif(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actifs</option>
            <option value="inactif">Inactifs</option>
          </select>
        </div>

        <div className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          {filteredAndSortedServices.length} service{filteredAndSortedServices.length > 1 ? 's' : ''} trouvé
          {filteredAndSortedServices.length > 1 ? 's' : ''} sur {services.length} total
        </div>

        {filteredAndSortedServices.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('nom')}
                      className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Nom
                      {sortField === 'nom' && <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900 dark:text-white text-sm">Description</th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('societe')}
                      className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Société
                      {sortField === 'societe' && <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900 dark:text-white text-sm">Statut</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-900 dark:text-white text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredAndSortedServices.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{service.nom}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{service.description || '—'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{getSocieteName(service.societe)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          service.actif
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                            : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200'
                        }`}
                      >
                        {service.actif ? '✓ Actif' : '✗ Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewService(service)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <Eye size={16} />
                        <span className="text-sm">Voir</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm || filterSociete !== 'all' || filterActif !== 'all'
                ? 'Aucun service ne correspond aux filtres'
                : 'Aucun service trouvé'}
            </p>
          </div>
        )}
      </div>

      {showModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedService.nom}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-4 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom</label>
                <p className="text-slate-900 dark:text-white">{selectedService.nom}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <p className="text-slate-900 dark:text-white">{selectedService.description || '—'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Société</label>
                <p className="text-slate-900 dark:text-white">{getSocieteName(selectedService.societe)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Statut</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    selectedService.actif
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                      : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200'
                  }`}
                >
                  {selectedService.actif ? 'Actif' : 'Inactif'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date de création</label>
                <p className="text-slate-900 dark:text-white">{formatDate(selectedService.date_creation)}</p>
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}