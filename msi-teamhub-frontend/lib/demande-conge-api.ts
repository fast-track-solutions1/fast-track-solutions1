// API calls pour les demandes de congé

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface CreateDemandePayload {
  salarie: number;
  type_conge: string;
  date_debut: string;
  date_fin: string;
  nombre_jours: number;
  motif: string;
}

export interface DemandeConge {
  id: number;
  salarie: number;
  salarie_nom: string;
  salarie_prenom: string;
  type_conge: string;
  type_conge_display: string;
  date_debut: string;
  date_fin: string;
  nombre_jours: number;
  motif: string;
  statut: string;
  statut_display: string;
  valide_par_direct: boolean;
  date_validation_direct: string | null;
  commentaire_direct: string | null;
  responsable_direct_nom: string | null;
  valide_par_service: boolean;
  date_validation_service: string | null;
  commentaire_service: string | null;
  responsable_service_nom: string | null;
  rejete: boolean;
  date_rejet: string | null;
  motif_rejet: string | null;
  date_creation: string;
}

// Créer une demande de congé
export const createDemande = async (
  payload: CreateDemandePayload
): Promise<DemandeConge> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/demandes-conge/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[createDemande] Erreur ${response.status}:`, errorText);
      throw new Error(
        `Erreur ${response.status}: Impossible de créer la demande`
      );
    }

    const data = await response.json();
    console.log('✅ Demande créée:', data);
    return data;
  } catch (err) {
    console.error('❌ Erreur création demande:', err);
    throw err;
  }
};

// Récupérer toutes les demandes (de l'utilisateur ou de tous si admin)
export const getDemandes = async (): Promise<DemandeConge[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/demandes-conge/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getDemandes] Erreur ${response.status}:`, errorText);
      throw new Error(
        `Erreur ${response.status}: Impossible de récupérer les demandes`
      );
    }

    const data = await response.json();
    console.log('✅ Demandes récupérées:', data);
    return data;
  } catch (err) {
    console.error('❌ Erreur récupération demandes:', err);
    throw err;
  }
};

// Récupérer une demande spécifique
export const getDemande = async (id: number): Promise<DemandeConge> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/demandes-conge/${id}/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getDemande] Erreur ${response.status}:`, errorText);
      throw new Error(
        `Erreur ${response.status}: Impossible de récupérer la demande`
      );
    }

    const data = await response.json();
    console.log('✅ Demande récupérée:', data);
    return data;
  } catch (err) {
    console.error('❌ Erreur récupération demande:', err);
    throw err;
  }
};

// Valider une demande (responsable direct)
export const validerDemande = async (
  id: number,
  commentaire: string = ''
): Promise<DemandeConge> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/demandes-conge/${id}/valider-direct/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ commentaire }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[validerDemande] Erreur ${response.status}:`, errorText);
      throw new Error(
        `Erreur ${response.status}: Impossible de valider la demande`
      );
    }

    const data = await response.json();
    console.log('✅ Demande validée:', data);
    return data;
  } catch (err) {
    console.error('❌ Erreur validation demande:', err);
    throw err;
  }
};

// Rejeter une demande
export const rejeterDemande = async (
  id: number,
  motifRejet: string
): Promise<DemandeConge> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/demandes-conge/${id}/rejeter/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ motif_rejet: motifRejet }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[rejeterDemande] Erreur ${response.status}:`, errorText);
      throw new Error(
        `Erreur ${response.status}: Impossible de rejeter la demande`
      );
    }

    const data = await response.json();
    console.log('✅ Demande rejetée:', data);
    return data;
  } catch (err) {
    console.error('❌ Erreur rejet demande:', err);
    throw err;
  }
};

// Supprimer une demande
export const deleteDemande = async (id: number): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/demandes-conge/${id}/`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[deleteDemande] Erreur ${response.status}:`, errorText);
      throw new Error(
        `Erreur ${response.status}: Impossible de supprimer la demande`
      );
    }

    console.log('✅ Demande supprimée');
  } catch (err) {
    console.error('❌ Erreur suppression demande:', err);
    throw err;
  }
};
