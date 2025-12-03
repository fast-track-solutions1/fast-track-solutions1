// lib/api.ts - API Client pour MSI TeamHub
// Configuration centralisée + Services réutilisables

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Department {
  id: number;
  numero: string;
  nom: string;
  region: string;
  societe: number;
  actif: boolean;
}

export interface Service {
  id: number;
  nom: string;
  description?: string;
  societe: number;
  actif: boolean;
}

export interface Grade {
  id: number;
  nom: string;
  ordre: number;
  societe: number;
  actif: boolean;
}

export interface Employee {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  date_embauche: string;
  service: number;
  grade: number;
  departement: number;
  actif: boolean;
}

export interface Circuit {
  id: number;
  nom: string;
  departement: number;
  actif: boolean;
}

export interface Equipment {
  id: number;
  nom: string;
  type_equipement: string;
  quantite: number;
  actif: boolean;
}

export interface ApiResponse<T> {
  count?: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface ApiError {
  detail?: string;
  error?: string;
  [key: string]: any;
}

// ============================================================================
// API CLIENT PRINCIPAL
// ============================================================================

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  /**
   * Charge le token depuis le localStorage
   */
  private loadToken(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  /**
   * Sauvegarde le token
   */
  public setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  /**
   * Récupère les headers avec authentification
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Effectue une requête GET
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          url.searchParams.append(key, params[key]);
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Effectue une requête POST
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Effectue une requête PUT
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Effectue une requête PATCH
   */
  async patch<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Effectue une requête DELETE
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (response.status === 204) {
      return {} as T;
    }

    return this.handleResponse<T>(response);
  }

  /**
   * Gère les réponses et erreurs
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (response.status === 204) {
      return {} as T;
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error: ApiError = {
        status: response.status,
        statusText: response.statusText,
        ...data,
      };
      throw error;
    }

    return data as T;
  }
}

// ============================================================================
// INSTANCE GLOBALE
// ============================================================================

export const apiClient = new ApiClient();

// ============================================================================
// SERVICES API - DÉPARTEMENTS
// ============================================================================

export const departmentService = {
  /**
   * Récupère tous les départements
   */
  async getAll(params?: { societe?: number; actif?: boolean }): Promise<Department[]> {
    const response = await apiClient.get<ApiResponse<Department>>('/departements/', params);
    return response.results || [];
  },

  /**
   * Récupère un département par ID
   */
  async getById(id: number): Promise<Department> {
    return apiClient.get<Department>(`/departements/${id}/`);
  },

  /**
   * Crée un département
   */
  async create(data: Partial<Department>): Promise<Department> {
    return apiClient.post<Department>('/departements/', data);
  },

  /**
   * Modifie un département
   */
  async update(id: number, data: Partial<Department>): Promise<Department> {
    return apiClient.put<Department>(`/departements/${id}/`, data);
  },

  /**
   * Supprime un département
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete(`/departements/${id}/`);
  },
};

// ============================================================================
// SERVICES API - SERVICES
// ============================================================================

export const serviceService = {
  /**
   * Récupère tous les services
   */
  async getAll(params?: { societe?: number; actif?: boolean }): Promise<Service[]> {
    const response = await apiClient.get<ApiResponse<Service>>('/services/', params);
    return response.results || [];
  },

  /**
   * Récupère un service par ID
   */
  async getById(id: number): Promise<Service> {
    return apiClient.get<Service>(`/services/${id}/`);
  },

  /**
   * Crée un service
   */
  async create(data: Partial<Service>): Promise<Service> {
    return apiClient.post<Service>('/services/', data);
  },

  /**
   * Modifie un service
   */
  async update(id: number, data: Partial<Service>): Promise<Service> {
    return apiClient.put<Service>(`/services/${id}/`, data);
  },

  /**
   * Supprime un service
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete(`/services/${id}/`);
  },
};

// ============================================================================
// SERVICES API - GRADES
// ============================================================================

export const gradeService = {
  /**
   * Récupère tous les grades
   */
  async getAll(params?: { societe?: number; actif?: boolean }): Promise<Grade[]> {
    const response = await apiClient.get<ApiResponse<Grade>>('/grades/', params);
    return response.results || [];
  },

  /**
   * Récupère un grade par ID
   */
  async getById(id: number): Promise<Grade> {
    return apiClient.get<Grade>(`/grades/${id}/`);
  },

  /**
   * Crée un grade
   */
  async create(data: Partial<Grade>): Promise<Grade> {
    return apiClient.post<Grade>('/grades/', data);
  },

  /**
   * Modifie un grade
   */
  async update(id: number, data: Partial<Grade>): Promise<Grade> {
    return apiClient.put<Grade>(`/grades/${id}/`, data);
  },

  /**
   * Supprime un grade
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete(`/grades/${id}/`);
  },
};

// ============================================================================
// SERVICES API - SALARIÉS
// ============================================================================

export const employeeService = {
  /**
   * Récupère tous les salariés
   */
  async getAll(params?: { service?: number; departement?: number; actif?: boolean; search?: string }): Promise<Employee[]> {
    const response = await apiClient.get<ApiResponse<Employee>>('/salaries/', params);
    return response.results || [];
  },

  /**
   * Récupère un salarié par ID
   */
  async getById(id: number): Promise<Employee> {
    return apiClient.get<Employee>(`/salaries/${id}/`);
  },

  /**
   * Crée un salarié
   */
  async create(data: Partial<Employee>): Promise<Employee> {
    return apiClient.post<Employee>('/salaries/', data);
  },

  /**
   * Modifie un salarié
   */
  async update(id: number, data: Partial<Employee>): Promise<Employee> {
    return apiClient.put<Employee>(`/salaries/${id}/`, data);
  },

  /**
   * Supprime un salarié
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete(`/salaries/${id}/`);
  },

  /**
   * Recherche des salariés
   */
  async search(query: string): Promise<Employee[]> {
    return this.getAll({ search: query });
  },
};

// ============================================================================
// SERVICES API - CIRCUITS
// ============================================================================

export const circuitService = {
  /**
   * Récupère tous les circuits
   */
  async getAll(params?: { departement?: number; actif?: boolean }): Promise<Circuit[]> {
    const response = await apiClient.get<ApiResponse<Circuit>>('/circuits/', params);
    return response.results || [];
  },

  /**
   * Récupère un circuit par ID
   */
  async getById(id: number): Promise<Circuit> {
    return apiClient.get<Circuit>(`/circuits/${id}/`);
  },

  /**
   * Crée un circuit
   */
  async create(data: Partial<Circuit>): Promise<Circuit> {
    return apiClient.post<Circuit>('/circuits/', data);
  },

  /**
   * Modifie un circuit
   */
  async update(id: number, data: Partial<Circuit>): Promise<Circuit> {
    return apiClient.put<Circuit>(`/circuits/${id}/`, data);
  },

  /**
   * Supprime un circuit
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete(`/circuits/${id}/`);
  },
};

// ============================================================================
// SERVICES API - ÉQUIPEMENTS
// ============================================================================

export const equipmentService = {
  /**
   * Récupère tous les équipements
   */
  async getAll(params?: { type_equipement?: string; actif?: boolean }): Promise<Equipment[]> {
    const response = await apiClient.get<ApiResponse<Equipment>>('/equipements/', params);
    return response.results || [];
  },

  /**
   * Récupère un équipement par ID
   */
  async getById(id: number): Promise<Equipment> {
    return apiClient.get<Equipment>(`/equipements/${id}/`);
  },

  /**
   * Crée un équipement
   */
  async create(data: Partial<Equipment>): Promise<Equipment> {
    return apiClient.post<Equipment>('/equipements/', data);
  },

  /**
   * Modifie un équipement
   */
  async update(id: number, data: Partial<Equipment>): Promise<Equipment> {
    return apiClient.put<Equipment>(`/equipements/${id}/`, data);
  },

  /**
   * Supprime un équipement
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete(`/equipements/${id}/`);
  },
};

// ============================================================================
// SERVICES API - DASHBOARD (STATS)
// ============================================================================

export interface DashboardStats {
  total_employees: number;
  active_employees: number;
  total_equipment: number;
  total_job_sheets: number;
  employees_by_department: Array<{ name: string; count: number }>;
  employees_by_service: Array<{ name: string; count: number }>;
  employees_by_grade: Array<{ name: string; count: number }>;
}

export const dashboardService = {
  /**
   * Récupère les statistiques du dashboard
   */
  async getStats(): Promise<DashboardStats> {
    try {
      return await apiClient.get<DashboardStats>('/dashboard/stats/');
    } catch (error) {
      console.warn('Dashboard stats not available, using fallback data');
      throw error;
    }
  },

  /**
   * Récupère les effectifs par département
   */
  async getDepartmentStats(): Promise<Array<{ name: string; employees: number; circuits: number; active: number }>> {
    try {
      return await apiClient.get('/dashboard/departments/');
    } catch (error) {
      console.warn('Department stats not available');
      throw error;
    }
  },

  /**
   * Récupère les effectifs par service
   */
  async getServiceStats(): Promise<Array<{ name: string; employees: number }>> {
    try {
      return await apiClient.get('/dashboard/services/');
    } catch (error) {
      console.warn('Service stats not available');
      throw error;
    }
  },

  /**
   * Récupère les effectifs par grade
   */
  async getGradeStats(): Promise<Array<{ name: string; employees: number }>> {
    try {
      return await apiClient.get('/dashboard/grades/');
    } catch (error) {
      console.warn('Grade stats not available');
      throw error;
    }
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Formate une erreur API en message lisible
 */
export function formatApiError(error: any): string {
  if (error.detail) return error.detail;
  if (error.error) return error.error;
  if (error.message) return error.message;
  if (typeof error === 'string') return error;
  
  return 'Une erreur est survenue. Veuillez réessayer.';
}

/**
 * Vérifie si une réponse est une erreur API
 */
export function isApiError(error: any): error is ApiError {
  return error && (error.detail || error.error || error.status);
}
