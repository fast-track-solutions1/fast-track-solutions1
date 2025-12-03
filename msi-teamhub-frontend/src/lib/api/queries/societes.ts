import { useQuery } from '@tanstack/react-query';
import { client } from '../client';

export interface Societe {
  id: number;
  nom: string;
  email?: string;
  created_at?: string;
}

const societeKeys = {
  all: ['societes'] as const,
  lists: () => [...societeKeys.all, 'list'] as const,
  list: (filters?: any) => [...societeKeys.lists(), { filters }] as const,
  details: () => [...societeKeys.all, 'detail'] as const,
  detail: (id: number) => [...societeKeys.details(), id] as const,
};

export const useGetSocietes = (filters?: { search?: string }) => {
  return useQuery({
    queryKey: societeKeys.list(filters),
    queryFn: async () => {
      const { data } = await client.get<{ results: Societe[] }>('/societes/', {
        params: filters,
      });
      return data.results;
    },
  });
};

export const useGetSociete = (id: number) => {
  return useQuery({
    queryKey: societeKeys.detail(id),
    queryFn: async () => {
      const { data } = await client.get<Societe>(`/societes/${id}/`);
      return data;
    },
  });
};
