// @/lib/salarie-api.ts - Client API complet et fonctionnel pour les Salariés

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============================================================================
// INTERFACES
// ============================================================================

export interface Salarie {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  genre: 'm' | 'f' | 'autre';
  date_naissance?: string;
  telephone?: string;
  mail_professionnel?: string;
  telephone_professionnel?: string;
  extension_3cx?: string;
  photo?: string;
  societe: number;
  service?: number | null;
  grade?: number | null;
  responsable_direct?: number | null;
  poste?: string;
  departements: number[];
  circuit?: number | null;
  date_embauche: string;
  statut: 'actif' | 'inactif' | 'conge' | 'arret_maladie';
  date_sortie?: string | null;
  creneau_travail?: number | null;
  en_poste?: boolean;
  date_creation: string;
  date_modification: string;
  // Champs affichage
  service_nom?: string;
  grade_nom?: string;
  societe_nom?: string;
  responsable_direct_nom?: string;
}

interface ApiResponse<T = any> {
  count?: number;
  next?: string;
  previous?: string;
  results?: T[];
  detail?: string;
  error?: string;
}

// ============================================================================
// CLASSE API
// ============================================================================

class SalarieApi {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = `${API_BASE}/api/salaries`;
    this.loadToken();
  }

  /**
   * Charge le token depuis localStorage
   */
  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  /**
   * Construit les headers avec le token
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Gère les erreurs API
   */
  private async handleError(response: Response) {
    let errorData: any = {};
    
    try {
      errorData = await response.json();
    } catch (e) {
      // Si on ne peut pas parser JSON, utiliser le statusText
    }

    const message = errorData?.detail || errorData?.error || `Erreur ${response.status}`;
    console.error('🔴 Erreur API:', {
      status: response.status,
      statusText: response.statusText,
      message,
      detail: errorData,
    });

    const error = new Error(message);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

/**
 * GET /api/salaries/ - Récupère tous les salariés (toutes les pages)
 */
async getSalaries(): Promise<Salarie[]> {
  try {
    let allSalaries: Salarie[] = [];
    let url: string | null = `${this.baseUrl}/`;
    
    // Charger toutes les pages
    while (url) {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      
      if (!response.ok) {
        await this.handleError(response);
      }
      
      const data: ApiResponse<Salarie> = await response.json();
      
      // Ajouter les résultats de cette page
      allSalaries = [...allSalaries, ...(data.results || [])];
      
      // Passer à la page suivante (null si dernière page)
      url = data.next || null;
    }
    
    console.log(`✅ ${allSalaries.length} salariés chargés au total`);
    return allSalaries;
  } catch (error) {
    console.error('❌ Erreur getSalaries:', error);
    throw error;
  }
}


  /**
   * GET /api/salaries/{id}/ - Récupère un salarié
   */
  async getSalarieById(id: number): Promise<Salarie> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ Erreur getSalarieById(${id}):`, error);
      throw error;
    }
  }

  /**
   * POST /api/salaries/ - Crée un nouveau salarié
   */
  async createSalarie(
    data: Omit<Salarie, 'id' | 'date_creation' | 'date_modification'>
  ): Promise<Salarie> {
    try {
      console.log('📤 Création salarié avec données:', data);

      const response = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      const created = await response.json();
      console.log('✅ Salarié créé:', created);
      return created;
    } catch (error) {
      console.error('❌ Erreur createSalarie:', error);
      throw error;
    }
  }

  /**
   * PUT /api/salaries/{id}/ - Met à jour un salarié
   */
  async updateSalarie(id: number, data: Partial<Salarie>): Promise<Salarie> {
  try {
    console.log(`📝 Mise à jour salarié ${id}:`, data);

    // 1️⃣ Récupérer le salarié actuel
    const current = await this.getSalarieById(id);
    console.log('📋 Salarié actuel:', current);

    // 2️⃣ Fusionner les données
    const mergedData = {
      ...current,
      ...data,
    };

    // 3️⃣ Créer un objet propre avec SEULEMENT les champs attendus
    const cleanData = {
      nom: mergedData.nom,
      prenom: mergedData.prenom,
      matricule: mergedData.matricule,
      genre: mergedData.genre,
      date_naissance: mergedData.date_naissance,
      telephone: mergedData.telephone,
      mail_professionnel: mergedData.mail_professionnel,
      telephone_professionnel: mergedData.telephone_professionnel,
      extension_3cx: mergedData.extension_3cx,
      photo: mergedData.photo,
      societe: mergedData.societe,
      service: mergedData.service,
      grade: mergedData.grade,
      responsable_direct: mergedData.responsable_direct,
      poste: mergedData.poste,
      departements: mergedData.departements,
      circuit: mergedData.circuit,
      date_embauche: mergedData.date_embauche,
      statut: mergedData.statut,
      date_sortie: mergedData.date_sortie,
      creneau_travail: mergedData.creneau_travail,
      en_poste: mergedData.en_poste,
    };

    console.log('🔍 responsable_direct dans cleanData:', cleanData.responsable_direct);
    console.log('🔍 departements dans cleanData:', cleanData.departements);
    console.log('📤 Données NETTOYÉES (JSON):', JSON.stringify(cleanData, null, 2));

    // 4️⃣ Envoyer
    const response = await fetch(`${this.baseUrl}/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(cleanData),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    const updated = await response.json();
console.log('✅ Salarié mis à jour (JSON):', JSON.stringify(updated, null, 2));
console.log('🔍 responsable_direct retourné:', updated.responsable_direct);
console.log('🔍 departements retournés:', updated.departements);
return updated;


  } catch (error) {
    console.error(`❌ Erreur updateSalarie(${id}):`, error);
    throw error;
  }
}


  /**
   * DELETE /api/salaries/{id}/ - Supprime un salarié
   */
  async deleteSalarie(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok && response.status !== 204) {
        await this.handleError(response);
      }

      console.log(`✅ Salarié ${id} supprimé`);
    } catch (error) {
      console.error(`❌ Erreur deleteSalarie(${id}):`, error);
      throw error;
    }
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const salarieApi = new SalarieApi();
