import { useMutation } from '@tanstack/react-query';
import client from '../client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const { data } = await client.post<LoginResponse>('/token/', credentials);
      
      // Sauvegarde les tokens dans le localStorage
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      return data;
    },
    onError: (error: any) => {
      console.error('Erreur login:', error.response?.data?.detail || error.message);
    },
  });
};

export const useLogout = () => {
  return () => {
    // Supprime les tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Redirige vers login
    window.location.href = '/login';
  };
};
