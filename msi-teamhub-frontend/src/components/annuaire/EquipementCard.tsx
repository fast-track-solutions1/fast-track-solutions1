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
  // Sélection de l'icône en fonction du type d'équipement
  const getIcon = (type: string) => {
    const typeNormalized = type.toLowerCase();
    if (typeNormalized.includes('laptop') || typeNormalized.includes('portable')) {
      return <Laptop className="w-5 h-5 text-blue-600" />;
    }
    if (typeNormalized.includes('monitor') || typeNormalized.includes('écran')) {
      return <Monitor className="w-5 h-5 text-blue-600" />;
    }
    if (typeNormalized.includes('phone') || typeNormalized.includes('téléphone') || typeNormalized.includes('mobile')) {
      return <Smartphone className="w-5 h-5 text-blue-600" />;
    }
    if (typeNormalized.includes('disk') || typeNormalized.includes('disque') || typeNormalized.includes('storage')) {
      return <HardDrive className="w-5 h-5 text-blue-600" />;
    }
    if (typeNormalized.includes('keyboard') || typeNormalized.includes('clavier')) {
      return <Keyboard className="w-5 h-5 text-blue-600" />;
    }
    if (typeNormalized.includes('mouse') || typeNormalized.includes('souris')) {
      return <Mouse className="w-5 h-5 text-blue-600" />;
    }
    if (typeNormalized.includes('headphone') || typeNormalized.includes('casque')) {
      return <Headphones className="w-5 h-5 text-blue-600" />;
    }
    if (typeNormalized.includes('printer') || typeNormalized.includes('imprimante')) {
      return <Printer className="w-5 h-5 text-blue-600" />;
    }
    return <Package className="w-5 h-5 text-blue-600" />;
  };

  // Badge de couleur selon l'état
  const getEtatBadge = (etat: string) => {
    switch (etat) {
      case 'neuf':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'bon':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'moyen':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'mauvais':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'hs':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Format de date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
      {/* Header avec icône et nom */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p
