// @/components/settings/SalarieForm.tsx - Formulaire complet et correctionné

'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Salarie } from '@/lib/salarie-api';
import { Departement } from '@/lib/departement-api';
import { Societe } from '@/lib/societe-api';
import { Service } from '@/lib/service-api';
import { Grade } from '@/lib/grade-api';

interface SalarieFormProps {
  salarie?: Salarie | null;
  societes: Societe[];
  services: Service[];
  grades: Grade[];
  departements: Departement[];
  salaries: Salarie[];
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

interface FormData {
  nom: string;
  prenom: string;
  matricule: string;
  genre: 'm' | 'f' | 'autre';
  date_naissance: string;
  telephone: string;
  mail_professionnel: string;
  telephone_professionnel: string;
  extension_3cx: string;
  societe: number;
  service: number | null;
  grade: number | null;
  responsable_direct: number | null;
  poste: string;
  departements: number[];
  date_embauche: string;
  statut: 'actif' | 'inactif' | 'conge' | 'arret_maladie';
  date_sortie: string | null;
  creneau_travail: number | null;
  en_poste: boolean;
}

export default function SalarieForm({
  salarie,
  societes,
  services,
  grades,
  departements,
  salaries,
  onSave,
  onCancel,
}: SalarieFormProps) {
  // État du formulaire - INITIALISATION CORRECTE
  const [formData, setFormData] = useState<FormData>({
    nom: salarie?.nom || '',
    prenom: salarie?.prenom || '',
    matricule: salarie?.matricule || '',
    genre: salarie?.genre || 'm',
    date_naissance: salarie?.date_naissance || '',
    telephone: salarie?.telephone || '',
    mail_professionnel: salarie?.mail_professionnel || '',
    telephone_professionnel: salarie?.telephone_professionnel || '',
    extension_3cx: salarie?.extension_3cx || '',
    societe: salarie?.societe || (societes.length > 0 ? societes[0].id : 0),
    service: salarie?.service || null,
    grade: salarie?.grade || null,
    responsable_direct: salarie?.responsable_direct || undefined,
    poste: salarie?.poste || '',
    departements: salarie?.departements || [],
    date_embauche: salarie?.date_embauche || '',
    statut: salarie?.statut || 'actif',
    date_sortie: salarie?.date_sortie || null,
    creneau_travail: salarie?.creneau_travail || null,
    en_poste: salarie?.en_poste ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDepartements, setAvailableDepartements] = useState<Departement[]>([]);
  const [selectedDepartements, setSelectedDepartements] = useState<Departement[]>([]);
  const [draggedDept, setDraggedDept] = useState<Departement | null>(null);

  // EFFET: Mettre à jour les listes de départements quand les données changent
  useEffect(() => {
    const selected = departements.filter((d) => formData.departements.includes(d.id));
    const available = departements.filter((d) => !formData.departements.includes(d.id));
    setSelectedDepartements(selected);
    setAvailableDepartements(available);
  }, [departements, formData.departements]);

  // GESTION DES CHANGEMENTS - Type générique
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (['societe', 'service', 'grade', 'responsable_direct', 'creneau_travail'].includes(name)) {
      // Convertir en nombre, null si vide
      const numValue = value ? Number(value) : undefined;
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // DRAG & DROP HANDLERS
  const handleDragStart = (dept: Departement) => setDraggedDept(dept);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDropOnSelected = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedDept || selectedDepartements.find((d) => d.id === draggedDept.id)) return;

    setSelectedDepartements([...selectedDepartements, draggedDept]);
    setAvailableDepartements(availableDepartements.filter((d) => d.id !== draggedDept.id));
    setFormData((prev) => ({
      ...prev,
      departements: [...prev.departements, draggedDept.id],
    }));
    setDraggedDept(null);
  };

  const handleDropOnAvailable = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedDept || !selectedDepartements.find((d) => d.id === draggedDept.id)) return;

    setAvailableDepartements([...availableDepartements, draggedDept]);
    setSelectedDepartements(selectedDepartements.filter((d) => d.id !== draggedDept.id));
    setFormData((prev) => ({
      ...prev,
      departements: prev.departements.filter((id) => id !== draggedDept.id),
    }));
    setDraggedDept(null);
  };

  const handleAddDept = (dept: Departement) => {
    setSelectedDepartements([...selectedDepartements, dept]);
    setAvailableDepartements(availableDepartements.filter((d) => d.id !== dept.id));
    setFormData((prev) => ({
      ...prev,
      departements: [...prev.departements, dept.id],
    }));
  };

  const handleRemoveDept = (dept: Departement) => {
    setAvailableDepartements([...availableDepartements, dept]);
    setSelectedDepartements(selectedDepartements.filter((d) => d.id !== dept.id));
    setFormData((prev) => ({
      ...prev,
      departements: prev.departements.filter((id) => id !== dept.id),
    }));
  };

  // SOUMISSION DU FORMULAIRE
  // SOUMISSION DU FORMULAIRE
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  console.log('========== FORMULAIRE SOUMIS ==========');
  console.log('📝 formData COMPLET:', formData);
  console.log('🔍 responsable_direct:', formData.responsable_direct);
  console.log('🔍 departements:', formData.departements);
  console.log('🔍 Type responsable_direct:', typeof formData.responsable_direct);
  console.log('🔍 Longueur departements:', formData.departements?.length);
  console.log('======================================');

  // Validation
  if (!formData.nom.trim()) return setError('Le nom est obligatoire');
  if (!formData.prenom.trim()) return setError('Le prénom est obligatoire');
  if (!formData.mail_professionnel.trim()) return setError("L'email professionnel est obligatoire");
  if (!formData.date_naissance) return setError('La date de naissance est obligatoire');
  if (!formData.date_embauche) return setError("La date d'embauche est obligatoire");

  try {
    setLoading(true);
    console.log('🚀 Envoi au serveur avec ces données:', formData);
    await onSave(formData);
    console.log('✅ Sauvegarde réussie!');
  } catch (err: any) {
    console.error('❌ Erreur:', err);
    setError(err.message || 'Erreur lors de la sauvegarde');
  } finally {
    setLoading(false);
  }
};


  // Filtre les salariés disponibles (exclure celui actuellement en édition)
  const availableSalaries = salaries.filter((s) => !salarie || s.id !== salarie.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center border-b border-blue-800">
          <div>
            <h2 className="text-2xl font-bold">{salarie ? 'Modifier le salarié' : 'Ajouter un salarié'}</h2>
            <p className="text-blue-100 text-sm mt-1">Complétez le formulaire ci-dessous</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Erreur */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Identité */}
          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Identité</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Matricule
                </label>
                <input
                  type="text"
                  name="matricule"
                  value={formData.matricule}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Genre
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="m">Homme</option>
                  <option value="f">Femme</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date de naissance *
                </label>
                <input
                  type="date"
                  name="date_naissance"
                  value={formData.date_naissance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Téléphone personnel
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Contact Professionnel */}
          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Contact Professionnel</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email professionnel *
                </label>
                <input
                  type="email"
                  name="mail_professionnel"
                  value={formData.mail_professionnel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Téléphone professionnel
                </label>
                <input
                  type="tel"
                  name="telephone_professionnel"
                  value={formData.telephone_professionnel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Extension 3CX
                </label>
                <input
                  type="text"
                  name="extension_3cx"
                  value={formData.extension_3cx}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Professionnel */}
          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Informations Professionnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Poste
                </label>
                <input
                  type="text"
                  name="poste"
                  value={formData.poste}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Statut
                </label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="conge">Congé</option>
                  <option value="arret_maladie">Arrêt maladie</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date d'embauche *
                </label>
                <input
                  type="date"
                  name="date_embauche"
                  value={formData.date_embauche}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Société *
                </label>
                <select
                  name="societe"
                  value={formData.societe}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={0}>-- Choisir une société --</option>
                  {societes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Service
                </label>
                <select
                  name="service"
                  value={formData.service || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Aucun --</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Grade
                </label>
                <select
                  name="grade"
                  value={formData.grade || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Aucun --</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Responsable direct
                </label>
                <select
                  name="responsable_direct"
                  value={formData.responsable_direct || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Aucun responsable --</option>
                  {availableSalaries.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.prenom} {s.nom} ({s.matricule})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Départements - Drag & Drop */}
          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Départements assignés</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Disponibles: {availableDepartements.length} | Sélectionnés: {selectedDepartements.length}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Disponibles */}
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Disponibles ({availableDepartements.length})
                </h4>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDropOnAvailable}
                  className="min-h-[300px] p-4 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg space-y-2"
                >
                  {availableDepartements.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Tous les depts sont sélectionnés</p>
                  ) : (
                    availableDepartements.map((dept) => (
                      <div
                        key={dept.id}
                        draggable
                        onDragStart={() => handleDragStart(dept)}
                        onClick={() => handleAddDept(dept)}
                        className="p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 cursor-move hover:shadow-md transition-all hover:bg-blue-50 dark:hover:bg-slate-600"
                      >
                        <p className="font-medium text-slate-900 dark:text-white">
                          {dept.numero} - {dept.nom}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{dept.region}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sélectionnés */}
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Sélectionnés ({selectedDepartements.length})
                </h4>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDropOnSelected}
                  className="min-h-[300px] p-4 bg-blue-50 dark:bg-blue-900/30 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg space-y-2"
                >
                  {selectedDepartements.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Drag & drop des depts ici</p>
                  ) : (
                    selectedDepartements.map((dept) => (
                      <div
                        key={dept.id}
                        draggable
                        onDragStart={() => handleDragStart(dept)}
                        onClick={() => handleRemoveDept(dept)}
                        className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg border border-blue-300 dark:border-blue-600 cursor-move hover:shadow-md transition-all"
                      >
                        <p className="font-medium text-slate-900 dark:text-white">
                          {dept.numero} - {dept.nom}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{dept.region}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Boutons d'action */}
          <div className="flex gap-4 justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {salarie ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
