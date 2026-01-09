// lib/equipement-api.ts
// API Client pour gérer les Équipements

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Equipment {
  id: number;
  nom: string;
  type_equipement: string;
  description?: string;
  stock_total: number;
  stock_disponible: number;
  actif: boolean;
  date_creation: string;
}

export interface EquipmentInstance {
  id: number;
  equipement: number;
  equipement_nom?: string;
  numero_serie: string;
  salarie?: number;
  salarie_nom?: string;
  date_affectation: string;
  date_retrait?: string;
  etat: 'neuf' | 'bon' | 'leger' | 'defaut' | 'horsservice';
  notes?: string;
}

export interface EquipmentStats {
  total_equipements: number;
  stock_total: number;
  stock_disponible: number;
  stock_utilise: number;
  taux_utilisation: number;
  instances_total: number;
  instances_actives: number;
  etat_distribution: Array<{ etat: string; count: number }>;
}

export interface ApiResponse<T> {
  count?: number;
  next?: string;
  previous?: string;
  results?: T[];
  detail?: string;
  error?: string;
}

class EquipementApiClient {
  private baseUrl = `${API_BASE_URL}/api/equipements`;
  private instancesUrl = `${API_BASE_URL}/api/equipement-instances`;
  private statsUrl = `${API_BASE_URL}/api/equipements/statistics`;
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token =
        localStorage.getItem('auth_token') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private handleError(response: Response, data: any) {
    const message = data?.detail || data?.error || `Erreur ${response.status}`;
    const error = new Error(message);
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  // ✅ ÉQUIPEMENTS - LECTURE
  async getEquipements(params?: {
    search?: string;
    type_equipement?: string;
    actif?: boolean;
    ordering?: string;
  }): Promise<Equipment[]> {
    try {
      let allResults: Equipment[] = [];
      let nextUrl: string | null = null;

      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.type_equipement) queryParams.append('type_equipement', params.type_equipement);
      if (params?.actif !== undefined) queryParams.append('actif', params.actif.toString());
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      queryParams.append('limit', '500');

      let url = `${this.baseUrl}/?${queryParams.toString()}`;

      do {
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          this.handleError(response, data);
        }

        const data: ApiResponse<Equipment> = await response.json();
        allResults = [...allResults, ...(data.results || [])];
        nextUrl = data.next || null;
        url = nextUrl || '';
      } while (nextUrl);

      return allResults;
    } catch (error) {
      console.error('Erreur API (getEquipements):', error);
      throw error;
    }
  }

  // ✅ ÉQUIPEMENTS - RÉCUPÈRE PAR ID
  async getEquipementById(id: number): Promise<Equipment> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API (getEquipementById):', error);
      throw error;
    }
  }

  // ✅ ÉQUIPEMENTS - CRÉATION
  async createEquipement(
    equipement: Omit<Equipment, 'id' | 'date_creation' | 'stock_disponible'>
  ): Promise<Equipment> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(equipement),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API (createEquipement):', error);
      throw error;
    }
  }

  // ✅ ÉQUIPEMENTS - MODIFICATION
  async updateEquipement(id: number, equipement: Partial<Equipment>): Promise<Equipment> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(equipement),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API (updateEquipement):', error);
      throw error;
    }
  }

  // ✅ ÉQUIPEMENTS - SUPPRESSION
  async deleteEquipement(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }
    } catch (error) {
      console.error('Erreur API (deleteEquipement):', error);
      throw error;
    }
  }

  // ✅ INSTANCES - LECTURE
  async getInstances(params?: {
    search?: string;
    etat?: string;
    equipement?: number;
  }): Promise<EquipmentInstance[]> {
    try {
      let allResults: EquipmentInstance[] = [];
      let nextUrl: string | null = null;

      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.etat) queryParams.append('etat', params.etat);
      if (params?.equipement) queryParams.append('equipement', params.equipement.toString());
      queryParams.append('limit', '500');

      let url = `${this.instancesUrl}/?${queryParams.toString()}`;

      do {
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          this.handleError(response, data);
        }

        const data: ApiResponse<EquipmentInstance> = await response.json();
        allResults = [...allResults, ...(data.results || [])];
        nextUrl = data.next || null;
        url = nextUrl || '';
      } while (nextUrl);

      return allResults;
    } catch (error) {
      console.error('Erreur API (getInstances):', error);
      throw error;
    }
  }

  // ✅ INSTANCES - CRÉATION
  async createInstance(
    instance: Omit<EquipmentInstance, 'id' | 'equipement_nom' | 'salarie_nom'>
  ): Promise<EquipmentInstance> {
    try {
      const response = await fetch(`${this.instancesUrl}/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(instance),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API (createInstance):', error);
      throw error;
    }
  }

  // ✅ INSTANCES - MODIFICATION
  async updateInstance(
    id: number,
    instance: Partial<EquipmentInstance>
  ): Promise<EquipmentInstance> {
    try {
      const response = await fetch(`${this.instancesUrl}/${id}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(instance),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API (updateInstance):', error);
      throw error;
    }
  }

  // ✅ INSTANCES - SUPPRESSION
  async deleteInstance(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.instancesUrl}/${id}/`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }
    } catch (error) {
      console.error('Erreur API (deleteInstance):', error);
      throw error;
    }
  }

  // ✅ STATISTIQUES
  async getStats(): Promise<EquipmentStats> {
    try {
      const response = await fetch(this.statsUrl, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API (getStats):', error);
      throw error;
    }
  }
}

export const equipementApi = new EquipementApiClient();
