'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

/**
 * Types pour l'organigramme
 */

export interface Service {
  id: number;
  nom: string;
  parent_service: number | null;
  responsable?: number;
  responsable_info?: string; // ← NOM DU RESPONSABLE
  description?: string;
}

export interface Grade {
  id: number;
  nom: string;
  ordre: number;
}

export interface Salarie {
  id: number;
  nom: string;
  prenom: string;
  email?: string;
  mail_professionnel?: string;
  service: number;
  grade: number;
  salaire?: number;
  en_poste?: boolean;
}

export interface ServiceEmployee {
  id: number;
  nom: string;
  prenom: string;
  grade: string;
  ordre: number;
  salaire?: number;
}

export interface ServiceNode {
  id: number;
  nom: string;
  responsable_nom?: string; // ← NOM DU RESPONSABLE
  children: ServiceNode[];
  salaries: ServiceEmployee[];
}

/**
 * Hook personnalisé pour récupérer et construire l'organigramme
 */
export function useOrganigrammeData() {
  const [nodes, setNodes] = useState<ServiceNode[]>([]);
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [servicesResp, salariesResp, gradesResp] = await Promise.all([
          apiClient.get<any>('/api/services/'),
          apiClient.get<any>('/api/salaries/'),
          apiClient.get<any>('/api/grades/'),
        ]);

        const servicesData: Service[] = servicesResp.results ?? servicesResp;
        const salariesData: Salarie[] = salariesResp.results ?? salariesResp;
        const gradesData: Grade[] = gradesResp.results ?? gradesResp;

        console.log('📦 Services reçus:', servicesData.length);
        console.log('📦 Salaries reçus:', salariesData.length);

        setGrades(gradesData);
        setSalaries(salariesData);

        const hierarchy = buildHierarchy(servicesData, salariesData, gradesData);
        console.log('🌳 Hiérarchie construite:', hierarchy.length, 'racines');

        setNodes(hierarchy);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        console.error("❌ Erreur lors du chargement de l'organigramme:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { nodes, salaries, grades, loading, error };
}

/**
 * Construit la hiérarchie des services avec leurs salariés
 */
function buildHierarchy(
  services: Service[],
  salaries: Salarie[],
  grades: Grade[]
): ServiceNode[] {
  const servicesMap = new Map<number, Service>(services.map((s) => [s.id, s]));
  const gradesMap = new Map<number, Grade>(grades.map((g) => [g.id, g]));

  const salariesByService = new Map<number, ServiceEmployee[]>();

  salaries.forEach((salarie) => {
    const grade = gradesMap.get(salarie.grade);
    if (!grade) return;

    const employee: ServiceEmployee = {
      id: salarie.id,
      nom: salarie.nom,
      prenom: salarie.prenom,
      grade: grade.nom,
      ordre: grade.ordre,
      salaire: salarie.salaire,
    };

    if (!salariesByService.has(salarie.service)) {
      salariesByService.set(salarie.service, []);
    }
    salariesByService.get(salarie.service)!.push(employee);
  });

  salariesByService.forEach((employees) => {
    employees.sort((a, b) => a.ordre - b.ordre);
  });

  const buildNode = (serviceId: number): ServiceNode | null => {
    const service = servicesMap.get(serviceId);
    if (!service) return null;

    const childServices = services.filter((s) => s.parent_service === serviceId);
    const children = childServices.map((child) => buildNode(child.id)).filter((node): node is ServiceNode => node !== null);

    const serviceEmployees = salariesByService.get(serviceId) || [];

    return {
      id: serviceId,
      nom: service.nom,
      responsable_nom: service.responsable_info, // ← SIMPLE: on prend directement de l'API
      children,
      salaries: serviceEmployees,
    };
  };

  const rootServices = services.filter(
    (s) => s.parent_service === null || s.parent_service === undefined || s.parent_service === 0
  );

  console.log('🌱 Services racines trouvés:', rootServices.length, rootServices.map((s) => s.nom));

  const hierarchy = rootServices.map((root) => buildNode(root.id)).filter((node): node is ServiceNode => node !== null);

  return hierarchy;
}

/**
 * Utilitaire: compter le nombre total d'employés dans la hiérarchie
 */
function countTotalEmployees(nodes: ServiceNode[]): number {
  let total = 0;
  const traverse = (node: ServiceNode) => {
    total += node.salaries.length;
    node.children.forEach(traverse);
  };
  nodes.forEach(traverse);
  return total;
}

/**
 * Utilitaire: aplatir l'hiérarchie pour l'annuaire
 */
export function flattenServiceHierarchy(nodes: ServiceNode[]): ServiceEmployee[] {
  const flat: ServiceEmployee[] = [];

  const traverse = (node: ServiceNode) => {
    flat.push(...node.salaries);
    node.children.forEach(traverse);
  };

  nodes.forEach(traverse);
  return flat;
}

/**
 * Utilitaire: compter les sous-services
 */
export function countSubServices(node: ServiceNode): number {
  if (node.children.length === 0) return 0;
  return (
    node.children.length +
    node.children.reduce((sum, child) => sum + countSubServices(child), 0)
  );
}
