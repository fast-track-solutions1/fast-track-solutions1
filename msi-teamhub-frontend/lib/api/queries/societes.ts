import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../client';
import { z } from 'zod';

const SocieteSchema = z.object({
  id: z.number(),
  nom: z.string(),
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  code_postal: z.string().optional(),
  activite: z.string().optional(),
  actif: z.boolean(),
});

export type Societe = z.infer<typeof SocieteSchema>;

export const societeKeys = {
  all: ['societes'] as const,
  lists: () => [...societeKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...societeKeys.lists(), { filters }] as const,
  details: () => [...societeKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...societeKeys.details(), id] as const,
};

export const useGetSocietes = (filters?: { search?: string }) => {
  return useQuery({
    queryKey: societeKeys.list(filters),
    queryFn: async () => {
      const { data } = await client.get<{ results: Societe[] }>('/societes/', {
        params: filters,
      });
      return (data.results || []).map((s) => SocieteSchema.parse(s));
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetSociete = (id: string | number) => {
  return useQuery({
    queryKey: societeKeys.detail(id),
    queryFn: async () => {
      const { data } = await client.get(`/societes/${id}/`);
      return SocieteSchema.parse(data);
    },
    enabled: !!id,
  });
};

export const useCreateSociete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Societe>) => {
      const { data } = await client.post('/societes/', payload);
      return SocieteSchema.parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: societeKeys.lists() });
    },
  });
};

export const useUpdateSociete = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Societe>) => {
      const { data } = await client.put(`/societes/${id}/`, payload);
      return SocieteSchema.parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: societeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: societeKeys.detail(id) });
    },
  });
};

export const useDeleteSociete = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await client.delete(`/societes/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: societeKeys.lists() });
      queryClient.removeQueries({ queryKey: societeKeys.detail(id) });
    },
  });
};
