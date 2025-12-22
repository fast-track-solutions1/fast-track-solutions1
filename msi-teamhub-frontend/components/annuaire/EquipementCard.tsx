import React from 'react';
import { Laptop, Monitor, Smartphone, HardDrive, Keyboard, Mouse, Headphones, Printer, Package } from 'lucide-react';

interface EquipementCardProps {
  equipement: {
    id: number;
    equipement_nom: string;
    equipement_type: string;
    model?: string;
    numero_serie?: string;
    date_affectation: string;
    date_retrait?: string;
    etat: string;
    etat_display: string;
    notes?: string;
    duree_utilisation?: number;
  };
}

const EquipementCard: React.FC<EquipementCardProps> = ({ equipement }) => {
  const getIcon = (type: string) => {
    const typeNormalized = type.toLowerCase();
    if (typeNormalized.includes('laptop') || typeNormalized.includes('portable')) {
      return { 
        icon: <Laptop className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
        bg: 'bg-purple-50 dark:bg-purple-900/30',
        border: 'border-purple-200 dark:border-purple-800'
      };
    }
    if (typeNormalized.includes('monitor') || typeNormalized.includes('écran')) {
      return { 
        icon: <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        border: 'border-blue-200 dark:border-blue-800'
      };
    }
    if (typeNormalized.includes('phone') || typeNormalized.includes('téléphone') || typeNormalized.includes('mobile')) {
      return { 
        icon: <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />,
        bg: 'bg-green-50 dark:bg-green-900/30',
        border: 'border-green-200 dark:border-green-800'
      };
    }
    if (typeNormalized.includes('disk') || typeNormalized.includes('disque') || typeNormalized.includes('storage')) {
      return { 
        icon: <HardDrive className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
        bg: 'bg-orange-50 dark:bg-orange-900/30',
        border: 'border-orange-200 dark:border-orange-800'
      };
    }
    if (typeNormalized.includes('keyboard') || typeNormalized.includes('clavier')) {
      return { 
        icon: <Keyboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
        bg: 'bg-indigo-50 dark:bg-indigo-900/30',
        border: 'border-indigo-200 dark:border-indigo-800'
      };
    }
    if (typeNormalized.includes('mouse') || typeNormalized.includes('souris')) {
      return { 
        icon: <Mouse className="w-5 h-5 text-pink-600 dark:text-pink-400" />,
        bg: 'bg-pink-50 dark:bg-pink-900/30',
        border: 'border-pink-200 dark:border-pink-800'
      };
    }
    if (typeNormalized.includes('headphone') || typeNormalized.includes('casque')) {
      return { 
        icon: <Headphones className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
        bg: 'bg-cyan-50 dark:bg-cyan-900/30',
        border: 'border-cyan-200 dark:border-cyan-800'
      };
    }
    if (typeNormalized.includes('printer') || typeNormalized.includes('imprimante')) {
      return { 
        icon: <Printer className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
        bg: 'bg-teal-50 dark:bg-teal-900/30',
        border: 'border-teal-200 dark:border-teal-800'
      };
    }
    return { 
      icon: <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
      bg: 'bg-gray-50 dark:bg-gray-900/30',
      border: 'border-gray-200 dark:border-gray-800'
    };
  };

  const getEtatBadge = (etat: string) => {
    switch (etat) {
      case 'neuf':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700';
      case 'bon':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700';
      case 'moyen':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700';
      case 'mauvais':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700';
      case 'hs':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const iconConfig = getIcon(equipement.equipement_type);

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border ${iconConfig.border} shadow-sm hover:shadow-md transition-shadow p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${iconConfig.bg} rounded-lg`}>
            {iconConfig.icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{equipement.equipement_nom}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{equipement.equipement_type}</p>
          </div>
        </div>
        
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEtatBadge(equipement.etat)}`}>
          {equipement.etat_display}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        {equipement.model && (
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Modèle:</span>
            <span className="font-medium text-slate-900 dark:text-white">{equipement.model}</span>
          </div>
        )}
        
        {equipement.numero_serie && (
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">N° série:</span>
            <span className="font-mono text-xs text-slate-900 dark:text-white">{equipement.numero_serie}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Affecté le:</span>
          <span className="font-medium text-slate-900 dark:text-white">{formatDate(equipement.date_affectation)}</span>
        </div>

        {equipement.date_retrait && (
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Retiré le:</span>
            <span className="font-medium text-red-600 dark:text-red-400">{formatDate(equipement.date_retrait)}</span>
          </div>
        )}

        {equipement.duree_utilisation !== null && equipement.duree_utilisation !== undefined && (
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Durée:</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {equipement.duree_utilisation} jour{equipement.duree_utilisation > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {equipement.notes && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400 italic">{equipement.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipementCard;
