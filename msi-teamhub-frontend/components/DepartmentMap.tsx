'use client';

import { useEffect, useState } from 'react';

const DepartmentMap = ({ isDark }: { isDark: boolean }) => {
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<any>(null);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    // Import Leaflet dynamiquement côté client
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  useEffect(() => {
    if (!mounted || !L || map) return;

    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    const newMap = L.map('map-container').setView([46.2276, 2.2137], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(newMap);

    // Département Points
    const departmentsCoords = [
      { name: 'Île-de-France', lat: 48.8566, lng: 2.3522, employees: 450, circuits: 12, active: 430 },
      { name: 'Provence-Alpes-Côte d\'Azur', lat: 43.9352, lng: 6.0679, employees: 180, circuits: 5, active: 170 },
      { name: 'Auvergne-Rhône-Alpes', lat: 45.7640, lng: 4.8357, employees: 220, circuits: 6, active: 210 },
      { name: 'Occitanie', lat: 43.6047, lng: 1.4442, employees: 150, circuits: 4, active: 140 },
      { name: 'Nouvelle-Aquitaine', lat: 44.8378, lng: -0.5792, employees: 130, circuits: 3, active: 120 },
    ];

    departmentsCoords.forEach((dept, idx) => {
      const circle = L.circleMarker([dept.lat, dept.lng], {
        radius
