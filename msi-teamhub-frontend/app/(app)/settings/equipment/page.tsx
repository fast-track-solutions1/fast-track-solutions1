'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Filter, RefreshCw, Download, BarChart3, AlertCircle, Loader2, Trash2, Edit2
} from 'lucide-react';
import { useFetch } from '@/hooks/useApi';
import { apiClient } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// ============================================================================
// TYPES
// ============================================================================

interface Equipement {
  id: number;
  nom: string;
  type_equipement: string;
  description?: string;
  stock_total: number;
  stock_disponible: number;
  actif: boolean;
  label_complet: string;
  date_creation: string;
}

interface EquipementInstance {
  id: number;
  equipement: number;
  equipement_nom?: string;
  numero_serie: string;
  salarie?: number | null;
  salarie_nom?: string;
  date_affectation: string;
  date_retrait?: string | null;
  etat: 'neuf' | 'bon' | 'leger' | 'defaut' | 'horsservice';
  notes?: string;
  date_creation: string;
}

interface Salarie {
  id: number;
  prenom: string;
  nom: string;
  email?: string;
  numero_personnel?: string;
}

const EQUIPEMENT_TYPES = [
  { value: 'pc_bureau', label: 'PC de Bureau' },
  { value: 'laptop', label: 'Laptop / Ordinateur Portable' },
  { value: 'tablette', label: 'Tablette' },
  { value: 'all_in_one', label: 'Ordinateur Tout-en-Un' },
  { value: 'poste_travail', label: 'Poste de Travail / Workstation' },
  { value: 'serveur', label: 'Serveur' },
  { value: 'serveur_rack', label: 'Serveur Rack' },
  { value: 'nas', label: 'NAS (Network Attached Storage)' },
  { value: 'san', label: 'SAN (Storage Area Network)' },
  { value: 'mainframe', label: 'Mainframe' },
  { value: 'clavier', label: 'Clavier' },
  { value: 'souris', label: 'Souris' },
  { value: 'souris_trackpad', label: 'Trackpad / Touchpad' },
  { value: 'ecran', label: 'Écran / Moniteur' },
  { value: 'ecran_tactile', label: 'Écran Tactile' },
  { value: 'projecteur', label: 'Projecteur' },
  { value: 'data_show', label: 'Data Show / Videoprojecteur' },
  { value: 'docking', label: 'Docking Station' },
  { value: 'hub_usb', label: 'Hub USB' },
  { value: 'adaptateur', label: 'Adaptateur' },
  { value: 'chargeur', label: 'Chargeur / Alimentation' },
  { value: 'batterie', label: 'Batterie' },
  { value: 'casque_audio', label: 'Casque Audio / Headset' },
  { value: 'casque_usb', label: 'Casque USB' },
  { value: 'microphone', label: 'Microphone' },
  { value: 'haut_parleur', label: 'Haut-Parleur' },
  { value: 'webcam', label: 'Webcam / Caméra Web' },
  { value: 'cable_hdmi', label: 'Câble HDMI' },
  { value: 'cable_usb', label: 'Câble USB' },
  { value: 'cable_reseau', label: 'Câble Réseau / RJ45' },
  { value: 'cable_alimentation', label: 'Câble d\'Alimentation' },
  { value: 'multiprise', label: 'Multiprise / Rallonge' },
  { value: 'imprimante_laser', label: 'Imprimante Laser' },
  { value: 'imprimante_inkjet', label: 'Imprimante Jet d\'Encre' },
  { value: 'imprimante_3d', label: 'Imprimante 3D' },
  { value: 'scanner_document', label: 'Scanner Document' },
  { value: 'scanner_code_barre', label: 'Scanner Code-Barres' },
  { value: 'scanner_main', label: 'Scanneur Portable' },
  { value: 'multifonction', label: 'Multifonction (Imprim/Scan/Copie/Fax)' },
  { value: 'photocopieur', label: 'Photocopieur' },
  { value: 'fax', label: 'Fax / Téléfax' },
  { value: 'routeur', label: 'Routeur' },
  { value: 'routeur_wifi', label: 'Routeur WiFi' },
  { value: 'switch_reseau', label: 'Switch Réseau / Commutateur' },
  { value: 'switch_poe', label: 'Switch PoE' },
  { value: 'point_acces_wifi', label: 'Point d\'Accès WiFi' },
  { value: 'point_acces_mesh', label: 'Point d\'Accès WiFi Mesh' },
  { value: 'modem', label: 'Modem' },
  { value: 'modem_adsl', label: 'Modem ADSL' },
  { value: 'firewall', label: 'Firewall / Pare-feu' },
  { value: 'vpn', label: 'Passerelle VPN' },
  { value: 'antenne_wifi', label: 'Antenne WiFi' },
  { value: 'antenne_5g', label: 'Antenne 5G' },
  { value: 'telephone_fixe', label: 'Téléphone Fixe' },
  { value: 'telephone_ip', label: 'Téléphone IP' },
  { value: 'telephone_mobile', label: 'Téléphone Mobile / Smartphone' },
  { value: 'carte_sim', label: 'Carte SIM' },
  { value: 'pabx', label: 'PABX / Autocommutateur' },
  { value: 'centraliste', label: 'Poste Centraliste' },
  { value: 'disque_dur', label: 'Disque Dur Interne' },
  { value: 'disque_dur_externe', label: 'Disque Dur Externe' },
  { value: 'ssd', label: 'SSD (Solid State Drive)' },
  { value: 'ssd_externe', label: 'SSD Externe' },
  { value: 'cle_usb', label: 'Clé USB' },
  { value: 'cle_usb_securisee', label: 'Clé USB Sécurisée' },
  { value: 'lecteur_cd_dvd', label: 'Lecteur CD/DVD' },
  { value: 'graveur_dvd', label: 'Graveur DVD' },
  { value: 'lecteur_blu_ray', label: 'Lecteur Blu-Ray' },
  { value: 'bande_magnetique', label: 'Bande Magnétique (Sauvegarde)' },
  { value: 'cartouche_backup', label: 'Cartouche Backup' },
  { value: 'ram', label: 'Mémoire RAM' },
  { value: 'processeur', label: 'Processeur / CPU' },
  { value: 'carte_mere', label: 'Carte Mère' },
  { value: 'carte_graphique', label: 'Carte Graphique / GPU' },
  { value: 'carte_reseau', label: 'Carte Réseau' },
  { value: 'carte_son', label: 'Carte Son' },
  { value: 'alimentation_pc', label: 'Alimentation PC' },
  { value: 'ventilateur', label: 'Ventilateur' },
  { value: 'boitier_pc', label: 'Boîtier PC' },
  { value: 'radiateur', label: 'Radiateur' },
  { value: 'camera_surveillance', label: 'Caméra Surveillance / IP Cam' },
  { value: 'camera_thermique', label: 'Caméra Thermique' },
  { value: 'dvr_nvr', label: 'DVR / NVR (Enregistreur Vidéo)' },
  { value: 'capteur_mouvement', label: 'Capteur de Mouvement' },
  { value: 'lecteur_badge', label: 'Lecteur de Badge / RFID' },
  { value: 'biometrie_scanner', label: 'Scanner Biométrique' },
  { value: 'badge_securite', label: 'Badge de Sécurité' },
  { value: 'onduleur_ups', label: 'Onduleur / UPS (Alimentation Secours)' },
  { value: 'stabilisateur_tension', label: 'Stabilisateur de Tension' },
  { value: 'generatrice', label: 'Génératrice' },
  { value: 'clim_serveur', label: 'Climatisation Salle Serveur' },
  { value: 'tableau_interactif', label: 'Tableau Interactif / Smartboard' },
  { value: 'ecran_interactif', label: 'Écran Interactif' },
  { value: 'camera_conference', label: 'Caméra de Conférence' },
  { value: 'microphone_conference', label: 'Microphone de Conférence' },
  { value: 'systeme_visio', label: 'Système de Vidéoconférence' },
  { value: 'lecteur_code_barre_mobile', label: 'Lecteur Code-Barres Mobile' },
  { value: 'terminal_pda', label: 'Terminal PDA' },
  { value: 'lecteur_rfid', label: 'Lecteur RFID' },
  { value: 'imprimante_etiquettes', label: 'Imprimante d\'Étiquettes' },
  { value: 'balance_connectee', label: 'Balance Connectée' },
  { value: 'chrono_badge', label: 'Système de Pointage / Badge Temps' },
  { value: 'autre_it', label: 'Autre Équipement IT' },
];

const INSTANCE_STATES = [
  { value: 'neuf', label: 'Neuf' },
  { value: 'bon', label: 'Bon État' },
  { value: 'leger', label: 'Usure Légère' },
  { value: 'defaut', label: 'Défaut' },
  { value: 'horsservice', label: 'Hors Service' },
];

const STATE_COLORS: Record<string, string> = {
  neuf: '#10b981',
  bon: '#3b82f6',
  leger: '#f59e0b',
  defaut: '#ef4444',
  horsservice: '#8b5cf6',
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function EquipmentSettingsPage() {
  const [activeTab, setActiveTab] = useState<'equipment' | 'instances'>('equipment');
  const [mounted, setMounted] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // ============= STATE =============
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [showInstanceForm, setShowInstanceForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipement | null>(null);
  const [editingInstance, setEditingInstance] = useState<EquipementInstance | null>(null);
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [instanceSearch, setInstanceSearch] = useState('');
  const [filterEquipmentType, setFilterEquipmentType] = useState('all');
  const [filterEquipmentActif, setFilterEquipmentActif] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [equipmentFormData, setEquipmentFormData] = useState({
    nom: '',
    type_equipement: 'pc',
    description: '',
    stock_total: 0,
    stock_disponible: 0,
    actif: true,
  });

  const [instanceFormData, setInstanceFormData] = useState({
    equipement: 0,
    numero_serie: '',
    salarie: null as number | null,
    date_affectation: new Date().toISOString().split('T')[0],
    date_retrait: '' as string,
    etat: 'neuf' as const,
    notes: '',
  });

  // ============= API CALLS =============
  const { data: equipments = [], loading: equipLoading, refetch: refetchEquip } =
    useFetch('/api/equipements/');

  const { data: instances = [], loading: instanceLoading, refetch: refetchInstances } =
    useFetch('/api/equipement-instances/');

  const { data: stats, refetch: refetchStats } = useFetch('/api/equipements/statistics/');

  const { data: salaries = [], loading: salariesLoading } = useFetch('/api/salaries/');

  // ============= LIFECYCLE =============
  useEffect(() => {
    setMounted(true);
  }, []);

  // ============= FILTRAGE ET TRI =============
  const equipmentsList = Array.isArray(equipments) ? equipments : equipments?.results || [];
  const instancesList = Array.isArray(instances) ? instances : instances?.results || [];
  const sariesList = Array.isArray(salaries) ? salaries : salaries?.results || [];

  const filteredAndSortedEquipments = useMemo(() => {
    let filtered = [...equipmentsList];

    if (equipmentSearch) {
      filtered = filtered.filter(eq =>
        eq.nom.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
        eq.type_equipement.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
        eq.description?.toLowerCase().includes(equipmentSearch.toLowerCase())
      );
    }

    if (filterEquipmentType !== 'all') {
      filtered = filtered.filter(eq => eq.type_equipement === filterEquipmentType);
    }

    if (filterEquipmentActif !== 'all') {
      filtered = filtered.filter(eq => eq.actif === (filterEquipmentActif === 'true'));
    }

    return filtered.sort((a, b) => a.nom.localeCompare(b.nom));
  }, [equipmentsList, equipmentSearch, filterEquipmentType, filterEquipmentActif]);

  const filteredInstances = useMemo(() => {
    return instancesList.filter(inst =>
      inst.numero_serie?.toLowerCase().includes(instanceSearch.toLowerCase()) ||
      inst.salarie_nom?.toLowerCase().includes(instanceSearch.toLowerCase()) ||
      inst.equipement_nom?.toLowerCase().includes(instanceSearch.toLowerCase())
    );
  }, [instancesList, instanceSearch]);

  // ============= DONNÉES GRAPHIQUES =============
  const equipmentByType = useMemo(() => {
    const grouped = new Map<string, number>();
    equipmentsList.forEach(eq => {
      grouped.set(eq.type_equipement, (grouped.get(eq.type_equipement) || 0) + 1);
    });
    return Array.from(grouped).map(([name, value]) => ({ name, value }));
  }, [equipmentsList]);

  const instancesByState = useMemo(() => {
    const grouped = new Map<string, number>();
    instancesList.forEach(inst => {
      grouped.set(inst.etat, (grouped.get(inst.etat) || 0) + 1);
    });
    return Array.from(grouped).map(([name, value]) => ({
      name: INSTANCE_STATES.find(s => s.value === name)?.label || name,
      value,
    }));
  }, [instancesList]);

  // ============= HANDLERS API DIRECTE =============
  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    if (!equipmentFormData.nom.trim()) {
      setError('Le nom est obligatoire');
      setSaving(false);
      return;
    }
    if (equipmentFormData.stock_total < 0) {
      setError('Le stock doit être positif');
      setSaving(false);
      return;
    }
    if (equipmentFormData.stock_disponible > equipmentFormData.stock_total) {
      setError('Le stock disponible ne peut pas dépasser le stock total');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        nom: equipmentFormData.nom.trim(),
        type_equipement: equipmentFormData.type_equipement,
        description: equipmentFormData.description.trim() || '',
        stock_total: equipmentFormData.stock_total,
        stock_disponible: equipmentFormData.stock_disponible,
        actif: equipmentFormData.actif,
      };

      if (editingEquipment) {
        await apiClient.put(`/api/equipements/${editingEquipment.id}/`, payload);
        setSuccessMessage('Équipement modifié avec succès');
      } else {
        await apiClient.post('/api/equipements/', payload);
        setSuccessMessage('Équipement créé avec succès');
      }

      await refetchEquip();
      await refetchStats();
      closeEquipmentForm();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Erreur lors de la sauvegarde');
      console.error('Erreur sauvegarde équipement:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    if (!instanceFormData.numero_serie.trim()) {
      setError('Le numéro de série est obligatoire');
      setSaving(false);
      return;
    }
    if (!instanceFormData.equipement) {
      setError('Veuillez sélectionner un équipement');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        equipement: Number(instanceFormData.equipement),
        numero_serie: instanceFormData.numero_serie.trim(),
        salarie: instanceFormData.salarie ? Number(instanceFormData.salarie) : null,
        date_affectation: instanceFormData.date_affectation,
        date_retrait: instanceFormData.date_retrait || null,
        etat: instanceFormData.etat,
        notes: instanceFormData.notes.trim() || '',
      };

      if (editingInstance) {
        await apiClient.put(`/api/equipement-instances/${editingInstance.id}/`, payload);
        setSuccessMessage('Instance modifiée avec succès');
      } else {
        await apiClient.post('/api/equipement-instances/', payload);
        setSuccessMessage('Instance créée avec succès');
      }

      await refetchInstances();
      await refetchStats();
      closeInstanceForm();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Erreur lors de la sauvegarde');
      console.error('Erreur sauvegarde instance:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditEquipment = (eq: Equipement) => {
    setEquipmentFormData({
      nom: eq.nom,
      type_equipement: eq.type_equipement,
      description: eq.description || '',
      stock_total: eq.stock_total,
      stock_disponible: eq.stock_disponible,
      actif: eq.actif,
    });
    setEditingEquipment(eq);
    setShowEquipmentForm(true);
    setError(null);
  };

  const handleEditInstance = (inst: EquipementInstance) => {
    setInstanceFormData({
      equipement: inst.equipement,
      numero_serie: inst.numero_serie,
      salarie: inst.salarie || null,
      date_affectation: inst.date_affectation,
      date_retrait: inst.date_retrait || '',
      etat: inst.etat,
      notes: inst.notes || '',
    });
    setEditingInstance(inst);
    setShowInstanceForm(true);
    setError(null);
  };

  const closeEquipmentForm = () => {
    setShowEquipmentForm(false);
    setEditingEquipment(null);
    setEquipmentFormData({
      nom: '',
      type_equipement: 'pc',
      description: '',
      stock_total: 0,
      stock_disponible: 0,
      actif: true,
    });
    setError(null);
  };

  const closeInstanceForm = () => {
    setShowInstanceForm(false);
    setEditingInstance(null);
    setInstanceFormData({
      equipement: 0,
      numero_serie: '',
      salarie: null,
      date_affectation: new Date().toISOString().split('T')[0],
      date_retrait: '',
      etat: 'neuf',
      notes: '',
    });
    setError(null);
  };

  const handleDeleteEquipment = async (id: number, nom: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${nom} ?`)) return;

    try {
      await apiClient.delete(`/api/equipements/${id}/`);
      await refetchEquip();
      await refetchStats();
      setSuccessMessage('Équipement supprimé avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleDeleteInstance = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette instance ?')) return;

    try {
      await apiClient.delete(`/api/equipement-instances/${id}/`);
      await refetchInstances();
      await refetchStats();
      setSuccessMessage('Instance supprimée avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleRefresh = async () => {
    await refetchEquip();
    await refetchInstances();
    await refetchStats();
    setSuccessMessage('Données rafraîchies');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nom', 'Type', 'Stock Total', 'Disponible', 'Actif', 'Date création'];
    const rows = filteredAndSortedEquipments.map(eq => [
      eq.id,
      eq.nom,
      eq.type_equipement,
      eq.stock_total,
      eq.stock_disponible,
      eq.actif ? 'Oui' : 'Non',
      new Date(eq.date_creation).toLocaleDateString('fr-FR'),
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `equipements-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* EN-TÊTE */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Paramètres Équipements</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {activeTab === 'equipment'
              ? `${filteredAndSortedEquipments.length} équipement${filteredAndSortedEquipments.length > 1 ? 's' : ''} trouvé${filteredAndSortedEquipments.length > 1 ? 's' : ''}`
              : `${filteredInstances.length} instance${filteredInstances.length > 1 ? 's' : ''} trouvée${filteredInstances.length > 1 ? 's' : ''}`}
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
          >
            <BarChart3 size={18} />
            Stats
          </button>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            disabled={activeTab !== 'equipment' || filteredAndSortedEquipments.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <Download size={18} />
            Export
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={equipLoading || instanceLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={equipLoading || instanceLoading ? 'animate-spin' : ''} />
            Rafraîchir
          </button>

          {/* Add Button */}
          <button
            onClick={() => {
              if (activeTab === 'equipment') {
                setEditingEquipment(null);
                setEquipmentFormData({
                  nom: '',
                  type_equipement: 'pc',
                  description: '',
                  stock_total: 0,
                  stock_disponible: 0,
                  actif: true,
                });
                setShowEquipmentForm(true);
              } else {
                setEditingInstance(null);
                setInstanceFormData({
                  equipement: 0,
                  numero_serie: '',
                  salarie: null,
                  date_affectation: new Date().toISOString().split('T')[0],
                  date_retrait: '',
                  etat: 'neuf',
                  notes: '',
                });
                setShowInstanceForm(true);
              }
              setError(null);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            <Plus size={18} />
            Ajouter
          </button>
        </div>
      </div>

      {/* STATISTIQUES */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <StatCard label="Total équipements" value={stats.total_equipements} />
          <StatCard label="Total instances" value={stats.total_instances} />
          <StatCard label="Instances actives" value={stats.instances_actives} />
          <StatCard label="Stock disponible" value={stats.stock_disponible || 0} />
          <StatCard label="Stock utilisé" value={(stats.total_equipements || 0) - (stats.stock_disponible || 0)} />
        </div>
      )}

      {/* MESSAGES */}
      {error && (
        <div className="flex gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
          <p className="font-medium text-red-900 dark:text-red-200">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
          <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
          <p className="font-medium text-green-900 dark:text-green-200">{successMessage}</p>
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('equipment')}
          className={`pb-3 px-1 font-medium border-b-2 transition-colors ${
            activeTab === 'equipment'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400'
          }`}
        >
          Équipements
        </button>
        <button
          onClick={() => setActiveTab('instances')}
          className={`pb-3 px-1 font-medium border-b-2 transition-colors ${
            activeTab === 'instances'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400'
          }`}
        >
          Instances
        </button>
      </div>

      {/* CONTENU TAB: EQUIPEMENTS */}
      {activeTab === 'equipment' && (
        <div className="space-y-4">
          {/* FILTRES */}
          <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un équipement..."
                value={equipmentSearch}
                onChange={e => setEquipmentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Type Filtre */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-slate-400" size={18} />
              <select
                value={filterEquipmentType}
                onChange={e => setFilterEquipmentType(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
              >
                <option value="all">Tous les types</option>
                {Array.from(new Set(equipmentsList.map(e => e.type_equipement))).map(type => (
                  <option key={type} value={type}>
                    {EQUIPEMENT_TYPES.find(t => t.value === type)?.label || type}
                  </option>
                ))}
              </select>
            </div>

            {/* Actif Filtre */}
            <select
              value={filterEquipmentActif}
              onChange={e => setFilterEquipmentActif(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>

          {/* TABLEAU ÉQUIPEMENTS */}
          {equipLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
            </div>
          ) : filteredAndSortedEquipments.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-slate-500 dark:text-slate-400">
                {equipmentSearch || filterEquipmentType !== 'all' || filterEquipmentActif !== 'all'
                  ? 'Aucun équipement ne correspond aux filtres'
                  : 'Aucun équipement trouvé'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Nom</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Type</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-900 dark:text-white">Stock</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-900 dark:text-white">Disponible</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-900 dark:text-white">Statut</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedEquipments.map(eq => (
                    <tr key={eq.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{eq.nom}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {EQUIPEMENT_TYPES.find(t => t.value === eq.type_equipement)?.label || eq.type_equipement}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-900 dark:text-white">{eq.stock_total}</td>
                      <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-medium">{eq.stock_disponible}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            eq.actif
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}
                        >
                          {eq.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditEquipment(eq)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteEquipment(eq.id, eq.nom)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* GRAPHIQUES */}
          {showStats && equipmentByType.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Équipements par Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={equipmentByType} cx="50%" cy="50%" labelLine={false} label outerRadius={80} fill="#8884d8" dataKey="value">
                      {equipmentByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Instances par État</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={instancesByState}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENU TAB: INSTANCES */}
      {activeTab === 'instances' && (
        <div className="space-y-4">
          {/* FILTRES */}
          <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher une instance..."
                value={instanceSearch}
                onChange={e => setInstanceSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* TABLEAU INSTANCES */}
          {instanceLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
            </div>
          ) : filteredInstances.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-slate-500 dark:text-slate-400">Aucune instance trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">N° Série</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Équipement</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Assigné</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Affectation</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Retrait</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-900 dark:text-white">État</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInstances.map(inst => (
                    <tr key={inst.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-slate-900 dark:text-white">{inst.numero_serie}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{inst.equipement_nom}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{inst.salarie_nom || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(inst.date_affectation).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {inst.date_retrait ? new Date(inst.date_retrait).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold text-white" style={{ backgroundColor: STATE_COLORS[inst.etat] }}>
                          {INSTANCE_STATES.find(s => s.value === inst.etat)?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditInstance(inst)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteInstance(inst.id)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL ÉQUIPEMENT */}
      {showEquipmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {editingEquipment ? 'Modifier équipement' : 'Ajouter équipement'}
            </h2>
            <form onSubmit={handleSaveEquipment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={equipmentFormData.nom}
                  onChange={e => setEquipmentFormData({ ...equipmentFormData, nom: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Laptop Dell"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type *</label>
                <select
                  required
                  value={equipmentFormData.type_equipement}
                  onChange={e => setEquipmentFormData({ ...equipmentFormData, type_equipement: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {EQUIPEMENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={equipmentFormData.description}
                  onChange={e => setEquipmentFormData({ ...equipmentFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="Description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock Total *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={equipmentFormData.stock_total}
                    onChange={e => setEquipmentFormData({ ...equipmentFormData, stock_total: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Disponible *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={equipmentFormData.stock_disponible}
                    onChange={e => setEquipmentFormData({ ...equipmentFormData, stock_disponible: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="actif"
                  checked={equipmentFormData.actif}
                  onChange={e => setEquipmentFormData({ ...equipmentFormData, actif: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="actif" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Actif
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  {saving ? 'En cours...' : editingEquipment ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={closeEquipmentForm}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INSTANCE */}
      {showInstanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {editingInstance ? 'Modifier Instance' : 'Ajouter Instance'}
            </h2>
            <form onSubmit={handleSaveInstance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Équipement *</label>
                <select
                  required
                  value={instanceFormData.equipement}
                  onChange={e => setInstanceFormData({ ...instanceFormData, equipement: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>-- Sélectionner --</option>
                  {equipmentsList.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.nom} ({EQUIPEMENT_TYPES.find(t => t.value === eq.type_equipement)?.label || eq.type_equipement})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">N° Série *</label>
                <input
                  type="text"
                  required
                  value={instanceFormData.numero_serie}
                  onChange={e => setInstanceFormData({ ...instanceFormData, numero_serie: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: SN001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Salarié</label>
                <select
                  value={instanceFormData.salarie || 0}
                  onChange={e => setInstanceFormData({ ...instanceFormData, salarie: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>-- Sélectionner un salarié --</option>
                  {sariesList.map(sal => (
                    <option key={sal.id} value={sal.id}>
                      {sal.prenom} {sal.nom} ({sal.numero_personnel || sal.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date Affectation *</label>
                <input
                  type="date"
                  required
                  value={instanceFormData.date_affectation}
                  onChange={e => setInstanceFormData({ ...instanceFormData, date_affectation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date Retrait</label>
                <input
                  type="date"
                  value={instanceFormData.date_retrait}
                  onChange={e => setInstanceFormData({ ...instanceFormData, date_retrait: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">État *</label>
                <select
                  required
                  value={instanceFormData.etat}
                  onChange={e => setInstanceFormData({ ...instanceFormData, etat: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {INSTANCE_STATES.map(state => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <textarea
                  value={instanceFormData.notes}
                  onChange={e => setInstanceFormData({ ...instanceFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="Notes"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  {saving ? 'En cours...' : editingInstance ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={closeInstanceForm}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT STAT CARD
// ============================================================================

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{label}</p>
      <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{value}</h3>
    </div>
  );
}
