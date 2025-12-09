// src/hooks/useEquipmentInstances.ts
import { useState } from "react";

export interface EquipmentInstanceState {
  id?: number;
  equipmentId: number;
  serialNumber: string;
  assignedTo: string;
  dateAssignment: string;
  statut: string;
  localisation: string;
}

export const initialInstanceState: EquipmentInstanceState = {
  equipmentId: 0,
  serialNumber: "",
  assignedTo: "",
  dateAssignment: "",
  statut: "actif",
  localisation: "",
};

export function useEquipmentInstances() {
  const [searchTermInstances, setSearchTermInstances] = useState("");
  const [sortByInstances, setSortByInstances] = useState("serialNumber");
  const [sortOrderInstances, setSortOrderInstances] = useState("asc");
  const [filterStatusInstances, setFilterStatusInstances] = useState("all");
  const [showModalInstances, setShowModalInstances] = useState(false);
  const [editingIdInstances, setEditingIdInstances] = useState<number | null>(null);
  const [formDataInstances, setFormDataInstances] = useState<EquipmentInstanceState>(initialInstanceState);

  const handleOpenModalInstances = (item?: EquipmentInstanceState) => {
    if (item) {
      setFormDataInstances(item);
      setEditingIdInstances(item.id || null);
    } else {
      setFormDataInstances(initialInstanceState);
      setEditingIdInstances(null);
    }
    setShowModalInstances(true);
  };

  const handleCloseModalInstances = () => {
    setShowModalInstances(false);
    setFormDataInstances(initialInstanceState);
    setEditingIdInstances(null);
  };

  const handleSubmitInstances = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingIdInstances) {
        console.log("Mise à jour instance:", formDataInstances);
      } else {
        console.log("Création instance:", formDataInstances);
      }
      handleCloseModalInstances();
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const handleDeleteInstances = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette instance ?")) {
      try {
        console.log("Suppression instance:", id);
      } catch (err) {
        console.error("Erreur:", err);
      }
    }
  };

  return {
    searchTermInstances, setSearchTermInstances, sortByInstances, setSortByInstances,
    sortOrderInstances, setSortOrderInstances, filterStatusInstances, setFilterStatusInstances,
    showModalInstances, setShowModalInstances, editingIdInstances, setEditingIdInstances,
    formDataInstances, setFormDataInstances, handleOpenModalInstances, handleCloseModalInstances,
    handleSubmitInstances, handleDeleteInstances,
  };
}
