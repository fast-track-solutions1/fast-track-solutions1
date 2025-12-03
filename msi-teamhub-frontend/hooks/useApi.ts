// hooks/useApi.ts - Hook personnalisé pour les appels API
// Gestion d'état + loading + erreurs

'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient, formatApiError, isApiError } from '@/lib/api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiFunctions<T> {
  execute: () => Promise<void>;
  refetch: () => Promise<void>;
  reset: () => void;
  setData: (data: T | null) => void;
}

// ============================================================================
// HOOK - FETCH DATA (GET)
// ============================================================================

/**
 * Hook pour récupérer des données
 * 
 * @example
 * const { data, loading, error } = useFetch('/salaries/', { service: 1 });
 */
export function useFetch<T>(
  endpoint: string,
  params?: Record<string, any>,
  options?: { immediate?: boolean }
): UseApiState<T> & UseApiFunctions<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<T>(endpoint, params);
      setData(result);
    } catch (err: any) {
      const errorMessage = formatApiError(err);
      setError(errorMessage);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, params]);

  const refetch = useCallback(async () => {
    await execute();
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Exécute automatiquement au montage si immediate = true
  useEffect(() => {
    if (options?.immediate !== false) {
      execute();
    }
  }, [execute, options?.immediate]);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    reset,
    setData,
  };
}

// ============================================================================
// HOOK - MUTATE DATA (POST, PUT, DELETE)
// ============================================================================

export type MutationType = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Hook pour modifier les données
 * 
 * @example
 * const { mutate, loading, error } = useMutation('POST', '/salaries/');
 * await mutate({ nom: 'Dupont', prenom: 'Jean' });
 */
export function useMutation<T>(
  method: MutationType,
  endpoint: string
): UseApiState<T> & {
  mutate: (data?: any) => Promise<T>;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (payload?: any): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        let result: T;

        switch (method) {
          case 'POST':
            result = await apiClient.post<T>(endpoint, payload);
            break;
          case 'PUT':
            result = await apiClient.put<T>(endpoint, payload);
            break;
          case 'PATCH':
            result = await apiClient.patch<T>(endpoint, payload);
            break;
          case 'DELETE':
            result = await apiClient.delete<T>(endpoint);
            break;
          default:
            throw new Error(`Unknown method: ${method}`);
        }

        setData(result);
        return result;
      } catch (err: any) {
        const errorMessage = formatApiError(err);
        setError(errorMessage);
        console.error('API Mutation Error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [method, endpoint]
  );

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  const setErrorManual = (err: string | null) => setError(err);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
    setData: setErrorManual as any,
  };
}

// ============================================================================
// HOOK - PAGINATED DATA
// ============================================================================

export interface PaginationState {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface UsePaginatedResult<T> extends UseApiState<T[]> {
  pagination: PaginationState;
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  setPageSize: (size: number) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer des données paginées
 * 
 * @example
 * const { data, pagination, nextPage } = usePaginated('/salaries/', { service: 1 }, 20);
 */
export function usePaginated<T>(
  endpoint: string,
  params?: Record<string, any>,
  pageSize: number = 10
): UsePaginatedResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize,
    totalCount: 0,
    totalPages: 0,
  });

  const fetchPage = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<any>(endpoint, {
          ...params,
          page,
          page_size: pageSize,
        });

        setData(response.results || response);
        setPagination({
          page,
          pageSize,
          totalCount: response.count || 0,
          totalPages: Math.ceil((response.count || 0) / pageSize),
        });
      } catch (err: any) {
        const errorMessage = formatApiError(err);
        setError(errorMessage);
        console.error('API Pagination Error:', err);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, params, pageSize]
  );

  const goToPage = useCallback(
    async (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        await fetchPage(page);
      }
    },
    [fetchPage, pagination.totalPages]
  );

  const nextPage = useCallback(async () => {
    if (pagination.page < pagination.totalPages) {
      await goToPage(pagination.page + 1);
    }
  }, [pagination.page, pagination.totalPages, goToPage]);

  const prevPage = useCallback(async () => {
    if (pagination.page > 1) {
      await goToPage(pagination.page - 1);
    }
  }, [pagination.page, goToPage]);

  const setPageSizeNew = useCallback(
    async (newSize: number) => {
      setPagination(prev => ({ ...prev, pageSize: newSize }));
      await fetchPage(1);
    },
    [fetchPage]
  );

  const refetch = useCallback(async () => {
    await fetchPage(pagination.page);
  }, [fetchPage, pagination.page]);

  const reset = () => {
    setData([]);
    setError(null);
    setLoading(false);
    setPagination({
      page: 1,
      pageSize,
      totalCount: 0,
      totalPages: 0,
    });
  };

  // Charge la première page au montage
  useEffect(() => {
    fetchPage(1);
  }, []);

  return {
    data,
    loading,
    error,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    setPageSize: setPageSizeNew,
    refetch,
    reset: () => reset(),
    setData,
  };
}

// ============================================================================
// HOOK - SEARCH DATA
// ============================================================================

/**
 * Hook pour rechercher des données
 * 
 * @example
 * const { results, searching, search } = useSearch('/salaries/', 'nom');
 * search('Dupont');
 */
export function useSearch<T>(
  endpoint: string,
  searchField: string = 'search'
): UseApiState<T[]> & {
  search: (query: string) => Promise<void>;
  searching: boolean;
} {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setData([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<any>(endpoint, {
          [searchField]: query,
        });

        setData(response.results || response);
      } catch (err: any) {
        const errorMessage = formatApiError(err);
        setError(errorMessage);
        console.error('Search Error:', err);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, searchField]
  );

  const reset = () => {
    setData([]);
    setError(null);
    setLoading(false);
  };

  return {
    data,
    loading: loading,
    error,
    searching: loading,
    search,
    execute: search as any,
    refetch: search as any,
    reset,
    setData,
  };
}

// ============================================================================
// HOOK - FORM SUBMISSION
// ============================================================================

export interface UseFormState<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  loading: boolean;
}

/**
 * Hook pour gérer les formulaires
 * 
 * @example
 * const form = useForm(
 *   { nom: '', prenom: '' },
 *   async (data) => await employeeService.create(data)
 * );
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<any>
): UseFormState<T> & {
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  reset: () => void;
  loading: boolean;
  error: string | null;
} {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setValues(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    },
    []
  );

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setErrors({});

      try {
        await onSubmit(values);
        setValues(initialValues);
        setTouched({});
      } catch (err: any) {
        if (isApiError(err)) {
          if (typeof err === 'object' && err !== null) {
            const fieldErrors: Record<string, string> = {};
            for (const [key, value] of Object.entries(err)) {
              if (key !== 'detail' && key !== 'error' && Array.isArray(value)) {
                fieldErrors[key] = (value as any)[0];
              }
            }
            if (Object.keys(fieldErrors).length > 0) {
              setErrors(fieldErrors);
            } else {
              setError(formatApiError(err));
            }
          } else {
            setError(formatApiError(err));
          }
        } else {
          setError(formatApiError(err));
        }
      } finally {
        setLoading(false);
      }
    },
    [values, initialValues, onSubmit]
  );

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setError(null);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    loading,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    reset,
    error,
  };
}

// ============================================================================
// HOOK - DEBOUNCED SEARCH
// ============================================================================

/**
 * Hook pour recherche avec délai
 * 
 * @example
 * const { results } = useDebouncedSearch('/salaries/', 300);
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export function useDebouncedSearch<T>(
  endpoint: string,
  delay: number = 300
): UseApiState<T[]> & {
  debouncedSearch: (query: string) => void;
} {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = { current: null as any };

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<any>(endpoint, { search: query });
      setData(response.results || response);
    } catch (err: any) {
      const errorMessage = formatApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const debouncedSearch = useCallback(
    (query: string) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, delay);
    },
    [delay, performSearch]
  );

  return {
    data,
    loading,
    error,
    debouncedSearch,
    execute: debouncedSearch as any,
    refetch: performSearch as any,
    reset: () => {
      setData([]);
      setError(null);
    },
    setData,
  };
}

// ============================================================================
// HOOK - POLLING DATA
// ============================================================================

/**
 * Hook pour récupérer des données régulièrement
 * 
 * @example
 * const { data } = usePolling('/dashboard/stats/', 5000); // Toutes les 5s
 */
export function usePolling<T>(
  endpoint: string,
  interval: number = 5000,
  params?: Record<string, any>
): UseApiState<T> & {
  stop: () => void;
  start: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = { current: null as any };
  const [isActive, setIsActive] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiClient.get<T>(endpoint, params);
      setData(result);
      setError(null);
    } catch (err: any) {
      const errorMessage = formatApiError(err);
      setError(errorMessage);
      console.error('Polling Error:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, params]);

  const start = useCallback(() => {
    setIsActive(true);
    fetch();
    intervalRef.current = setInterval(fetch, interval);
  }, [fetch, interval]);

  const stop = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      start();
    }
    return () => stop();
  }, [isActive, start, stop]);

  return {
    data,
    loading,
    error,
    stop,
    start,
    execute: fetch as any,
    refetch: fetch as any,
    reset: () => {
      setData(null);
      setError(null);
    },
    setData,
  };
}
