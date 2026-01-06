// @/components/settings/page.tsx - Page principale salariés (CORRECTE)

'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, RefreshCw, Download, AlertCircle, Loader2 } from 'lucide-react';
import { Salarie, salarieApi } from '@/lib/salarie-api';
import { Societe, societeApi } from '@/lib/societe-api';
import { Service, serviceApi } from '@/lib/service-api';
import { Grade, gradeApi } from '@/lib/grade-api';
import { Departement, departementApi } from '@/lib/departement-api';
import SalarieStats from '@/components/settings/SalarieStats';
import SalarieTable from '@/components/settings/SalarieTable';
import SalarieForm from '@/components/settings/SalarieForm';

export default function SalariesPage() {
  // États principaux
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSalarie, setEditingSalarie] = useState<Salarie | null>(null);
  const [mounted, setMounted] = useState(false);

  // Filtres et tri
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSociete, setFilterSociete] = useState<string | number>('all');
  const [filterStatut, setFilterStatut] = useState('all');
  const [sortField, setSortField] = useState<'nom' | 'societe' | 'date_embauche'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Marquer comme monté (hydratation Next.js)
  useEffect(() => {
    setMounted(true);
  }, []);

  // CHARGER LES DONNÉES
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [salariesData, societesData, servicesData, gradesData, departementsData] = await Promise.all([
        salarieApi.getSalaries(),
        societeApi.getSocietes(),
        serviceApi.getServices(),
        gradeApi.getGrades(),
        departementApi.getDepartements(),
      ]);

      console.log('✅ Données chargées:', {
        salaries: salariesData.length,
        societes: societesData.length,
        services: servicesData.length,
        grades: gradesData.length,
        departements: departementsData.length,
      });

      setSalaries(salariesData);
      setSocietes(societesData);
      setServices(servicesData);
      setGrades(gradesData);
      setDepartements(departementsData);
    } catch (err: any) {
      console.error('❌ Erreur chargement:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [mounted]);

  // FILTRAGE ET TRI
  const filteredAndSortedSalaries = useMemo(() => {
    let filtered = [...salaries];

    // Recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((s) =>
        s.nom.toLowerCase().includes(term) ||
        s.prenom.toLowerCase().includes(term) ||
        s.mail_professionnel?.toLowerCase().includes(term) ||
        s.poste?.toLowerCase().includes(term) ||
        s.matricule.toLowerCase().includes(term)
      );
    }

    // Filtre société
    if (filterSociete !== 'all') {
      const societeId = typeof filterSociete === 'string' ? Number(filterSociete) : filterSociete;
      filtered = filtered.filter((s) => s.societe === societeId);
    }

    // Filtre statut
    if (filterStatut !== 'all') {
      filtered = filtered.filter((s) => s.statut === filterStatut);
    }

    // Tri
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'societe') {
        aVal = societes.find((s) => s.id === a.societe)?.nom || '';
        bVal = societes.find((s) => s.id === b.societe)?.nom || '';
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return sortOrder === 'asc' ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1);
    });

    return filtered;
  }, [salaries, searchTerm, filterSociete, filterStatut, sortField, sortOrder, societes]);

  // CRUD OPERATIONS

  const handleCreate = async (data: any) => {
    try {
      console.log('🚀 Création salarié:', data);
      const newSalarie = await salarieApi.createSalarie(data);
      console.log('✅ Salarié créé:', newSalarie);

      // Ajouter à la liste
      setSalaries([...salaries, newSalarie]);

      // Fermer le formulaire
      setShowForm(false);
      setError(null);

      console.log('✨ Formulaire fermé, liste mise à jour');
    } catch (err: any) {
      console.error('❌ Erreur création:', err);
      throw err;
    }
  };

  const handleUpdate = async (id: number, data: any) => {
    try {
      console.log(`🔧 Mise à jour salarié ${id}:`, data);
      const updated = await salarieApi.updateSalarie(id, data);
      console.log('✅ Salarié mis à jour:', updated);

      // Mettre à jour la liste
      setSalaries(salaries.map((s) => (s.id === id ? updated : s)));

      // Fermer le formulaire
      setEditingSalarie(null);
      setShowForm(false);
      setError(null);

      console.log('✨ Formulaire fermé, liste mise à jour');
    } catch (err: any) {
      console.error('❌ Erreur mise à jour:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce salarié ?')) return;

    try {
      console.log(`🗑️ Suppression salarié ${id}`);
      await salarieApi.deleteSalarie(id);

      // Supprimer de la liste
      setSalaries(salaries.filter((s) => s.id !== id));

      setError(null);
      console.log('✅ Salarié supprimé');
    } catch (err: any) {
      console.error('❌ Erreur suppression:', err);
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleSort = (field: 'nom' | 'societe' | 'date_embauche') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // EXPORT CSV
  const handleExportCSV = () => {
    const headers = ['Matricule', 'Nom', 'Prénom', 'Email', 'Société', 'Service', 'Grade', 'Statut'];
    const rows = filteredAndSortedSalaries.map((s) => [
      s.matricule,
      s.nom,
      s.prenom,
      s.mail_professionnel || '',
      societes.find((sc) => sc.id === s.societe)?.nom || '',
      services.find((sv) => sv.id === s.service)?.nom || '',
      grades.find((g) => g.id === s.grade)?.nom || '',
      s.statut,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `salaries-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Rendu avec hydratation
  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Salariés</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Gestion des fiches salarié et informations
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
          >
            <Download size={18} />
            Export
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-400 dark:hover:bg-slate-600 font-medium transition-colors"
          >
            <RefreshCw size={18} />
            Rafraîchir
          </button>
          <button
            onClick={() => {
              setEditingSalarie(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            <Plus size={18} />
            Ajouter un salarié
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="flex gap-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
          <AlertCircle size={20} className="flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Statistiques */}
      <SalarieStats salaries={salaries} societes={societes} services={services} grades={grades} />

      {/* Filtres */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, email ou matricule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={filterSociete}
            onChange={(e) => setFilterSociete(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Toutes les sociétés</option>
            {societes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom}
              </option>
            ))}
          </select>

          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="conge">En congé</option>
            <option value="arret_maladie">Arrêt maladie</option>
          </select>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          {filteredAndSortedSalaries.length} salarié{filteredAndSortedSalaries.length > 1 ? 's' : ''} trouvé
          {filteredAndSortedSalaries.length > 1 ? 's' : ''} sur {salaries.length} total
        </p>
      </div>

      {/* Tableau */}
      {filteredAndSortedSalaries.length > 0 ? (
        <SalarieTable
          salaries={filteredAndSortedSalaries}
          societes={societes}
          services={services}
          grades={grades}
          onEdit={(salarie) => {
            setEditingSalarie(salarie);
            setShowForm(true);
          }}
          onDelete={handleDelete}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">
            {searchTerm || filterSociete !== 'all' || filterStatut !== 'all'
              ? 'Aucun salarié ne correspond aux filtres'
              : 'Aucun salarié trouvé'}
          </p>
        </div>
      )}

      {/* Modal Formulaire */}
      {showForm && (
        <SalarieForm
          salarie={editingSalarie}
          societes={societes}
          services={services}
          grades={grades}
          departements={departements}
          salaries={salaries}
          onSave={editingSalarie ? (data) => handleUpdate(editingSalarie.id, data) : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingSalarie(null);
          }}
        />
      )}
    </div>
  );
}
