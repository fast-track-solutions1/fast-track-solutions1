export const API_BASE_URL = 'http://localhost:8000/api';

export const ROLES = {
  ADMIN: 'admin',
  RH: 'rh',
  IT: 'it',
  DAF: 'daf',
  COMPTABLE: 'comptable',
  SALARIE: 'salarie',
  RESPONSABLE: 'responsable',
};

export const ROLE_NAMES = {
  admin: 'Administrateur',
  rh: 'Responsable RH',
  it: 'Responsable IT',
  daf: 'DAF',
  comptable: 'Comptable',
  salarie: 'Salarié',
  responsable: 'Responsable',
};

export const MENU_ITEMS = {
  admin: [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Salariés', path: '/employees', icon: '👥' },
    { label: 'Annuaire', path: '/annuaire', icon: '📞' },
    { label: 'Organigramme', path: '/organigramme', icon: '🏛️' },
  ],
  rh: [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Salariés', path: '/employees', icon: '👥' },
    { label: 'Annuaire', path: '/annuaire', icon: '📞' },
  ],
  salarie: [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Mon Profil', path: '/profile', icon: '👤' },
    { label: 'Annuaire', path: '/annuaire', icon: '📞' },
  ],
};
