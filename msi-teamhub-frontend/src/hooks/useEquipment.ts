import { useState } from "react";

export function useEquipment() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nom: "", type: "", quantite: 0, departement: "" });
  const [editingId, setEditingId] = useState(null);

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData(item);
      setEditingId(item.id);
    } else {
      setFormData({ nom: "", type: "", quantite: 0, departement: "" });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(false);
  };

  return {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    showModal,
    setShowModal,
    formData,
    setFormData,
    editingId,
    handleOpenModal,
    handleSubmit,
  };
}
