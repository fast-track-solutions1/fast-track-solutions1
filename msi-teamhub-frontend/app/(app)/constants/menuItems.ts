import {
  Home, Users, FileText, BookOpen, FolderOpen, Monitor, Lightbulb, Shield,
  Award, Building2, Building, Wrench, DollarSign, LayoutDashboard, Clock,
  CheckCircle, History, FileCheck, FileClock, UserCog, Settings, Lock,
  Mail, Database, HardDrive, TrendingUp, Clipboard
} from 'lucide-react';

export const MENU_ITEMS = [
  {
    id: 'accueil',
    label: 'Accueil',
    href: '/dashboard',
    icon: Home,
  },
  {
    id: 'annuaires',
    label: 'Annuaires',
    icon: BookOpen,
    href: '#',
    submenu: [
      { id: 'annuaires-dashboard', label: 'Tableau de bord', href: '/annuaires', icon: LayoutDashboard },
      { id: 'salaries', label: 'Salariés', href: '/annuaire', icon: Users },
      { id: 'societes', label: 'Sociétés', href: '/annuaires/societes', icon: Building2 },
      { id: 'departements', label: 'Départements', href: '/annuaires/departements', icon: Building },
      { id: 'services', label: 'Services', href: '/annuaires/services', icon: Wrench },
      { id: 'grades', label: 'Grades', href: '/annuaires/grades', icon: Award },
      { id: 'equipements', label: 'Équipements', href: '/annuaires/equipements', icon: Monitor },
      { id: 'fiches-postes', label: 'Fiches de postes', href: '/annuaires/fiches-postes', icon: FileText },
      { id: 'organigrammes', label: 'Organigrammes', href: '/annuaires/organigrammes', icon: TrendingUp },
    ],
  },
  {
    id: 'demandes',
    label: 'Mes Demandes',
    icon: FileText,
    href: '#',
    submenu: [
      { id: 'demande-nouvelle', label: 'Nouvelle demande', href: '/demandes/nouvelle', icon: Clipboard },
      { id: 'demande-attente', label: 'En attente', href: '/demandes/en-attente', icon: Clock },
      { id: 'demande-validees', label: 'Validées', href: '/demandes/validees', icon: CheckCircle },
      { id: 'demande-historique', label: 'Historique', href: '/demandes/historique', icon: History },
    ],
  },
  {
    id: 'coffre-fort',
    label: 'Mon Coffre-Fort',
    icon: FolderOpen,
    href: '#',
    submenu: [
      { id: 'cf-salaires', label: 'Bulletins de salaire', href: '/coffre-fort/salaires', icon: DollarSign },
      { id: 'cf-contrats', label: 'Contrats', href: '/coffre-fort/contrats', icon: FileCheck },
      { id: 'cf-attestations', label: 'Attestations', href: '/coffre-fort/attestations', icon: FileClock },
      { id: 'cf-documents', label: 'Documents admin', href: '/coffre-fort/documents', icon: FileText },
    ],
  },
  {
    id: 'rh',
    label: 'Ressources Humaines',
    icon: Users,
    href: '#',
    submenu: [
      { id: 'rh-dashboard', label: 'Dashboard RH', href: '/rh/dashboard', icon: LayoutDashboard },
      { id: 'rh-demandes', label: 'Demandes à valider', href: '/rh/demandes', icon: CheckCircle },
      { id: 'rh-traitement', label: 'Traitement & Paie', href: '/rh/traitement', icon: DollarSign },
      { id: 'rh-reporting', label: 'Reporting', href: '/rh/reporting', icon: TrendingUp },
    ],
  },
  {
    id: 'it',
    label: 'Équipements IT',
    icon: Monitor,
    href: '#',
    submenu: [
      { id: 'it-dashboard', label: 'Dashboard IT', href: '/it/dashboard', icon: LayoutDashboard },
      { id: 'it-inventaire', label: 'Inventaire', href: '/it/inventaire', icon: Database },
      { id: 'it-demandes', label: 'Demandes à traiter', href: '/it/demandes', icon: Clipboard },
      { id: 'it-maintenance', label: 'Maintenance', href: '/it/maintenance', icon: Wrench },
    ],
  },
  {
    id: 'innovation',
    label: 'Amélioration Continue',
    icon: Lightbulb,
    href: '#',
    submenu: [
      { id: 'innov-dashboard', label: 'Dashboard', href: '/innovation/dashboard', icon: LayoutDashboard },
      { id: 'innov-propositions', label: 'Propositions reçues', href: '/innovation/propositions', icon: Lightbulb },
      { id: 'innov-affecter', label: 'Affecter aux services', href: '/innovation/affecter', icon: Users },
      { id: 'innov-projets', label: 'Projets en cours', href: '/innovation/projets', icon: TrendingUp },
      { id: 'innov-reporting', label: 'Reporting', href: '/innovation/reporting', icon: FileText },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: Shield,
    href: '#',
    submenu: [
      { id: 'admin-dashboard', label: 'Dashboard Admin', href: '/admin/dashboard', icon: LayoutDashboard },
      {
        id: 'admin-users',
        label: 'Utilisateurs & Permissions',
        icon: UserCog,
        href: '#',
        submenu: [
          { id: 'admin-users-list', label: 'Gestion des utilisateurs', href: '/admin/utilisateurs', icon: Users },
          { id: 'admin-users-create', label: 'Créer utilisateur', href: '/admin/utilisateurs/creer', icon: Users },
          { id: 'admin-roles', label: 'Rôles & Permissions', href: '/admin/roles', icon: Shield },
          { id: 'admin-mdp', label: 'Réinitialiser mot de passe', href: '/admin/mdp', icon: Lock },
        ],
      },
      {
        id: 'admin-entreprise',
        label: 'Paramètres Entreprise',
        icon: Building2,
        href: '#',
        submenu: [
          { id: 'admin-societes', label: 'Sociétés', href: '/settings/companies', icon: Building2 },
          { id: 'admin-departements', label: 'Départements', href: '/admin/parametres/departements', icon: Building },
          { id: 'admin-services', label: 'Services', href: '/settings/services', icon: Wrench },
          { id: 'admin-grades', label: 'Grades', href: '/settings/grades', icon: Award },
        ],
      },
      {
        id: 'admin-rh-params',
        label: 'Paramètres RH',
        icon: DollarSign,
        href: '#',
        submenu: [
          { id: 'admin-salaires', label: 'Salaires', href: '/admin/parametres/salaires', icon: DollarSign },
          { id: 'admin-fiches', label: 'Fiches de postes', href: '/admin/parametres/fiches', icon: FileText },
        ],
      },
      {
        id: 'admin-it-params',
        label: 'Paramètres IT',
        icon: Monitor,
        href: '#',
        submenu: [
          { id: 'admin-equipements', label: 'Équipements', href: '/admin/parametres/equipements', icon: Monitor },
        ],
      },
      {
        id: 'admin-config',
        label: 'Configuration Système',
        icon: Settings,
        href: '#',
        submenu: [
          { id: 'admin-securite', label: 'Sécurité', href: '/admin/config/securite', icon: Lock },
          { id: 'admin-email', label: 'Email & Notifications', href: '/admin/config/email', icon: Mail },
          { id: 'admin-backup', label: 'Sauvegardes', href: '/admin/config/sauvegardes', icon: HardDrive },
          { id: 'admin-logs', label: 'Logs & Monitoring', href: '/admin/config/logs', icon: Database },
        ],
      },
    ],
  },
];
