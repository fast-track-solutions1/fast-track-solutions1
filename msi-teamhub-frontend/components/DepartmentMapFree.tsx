'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

export default function DepartmentMapFree({ isDark }: { isDark: boolean }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  const departmentsCoords = [
    { name: 'Île-de-France', lng: 2.3522, lat: 48.8566, employees: 450, circuits: 12, active: 430 },
    { name: 'Provence-Alpes-Côte d\'Azur', lng: 6.0679, lat: 43.9352, employees: 180, circuits: 5, active: 170 },
    { name: 'Auvergne-Rhône-Alpes', lng: 4.8357, lat: 45.7640, employees: 220, circuits: 6, active: 210 },
    { name: 'Occitanie', lng: 1.4442, lat: 43.6047, employees: 150, circuits: 4, active: 140 },
    { name: 'Nouvelle-Aquitaine', lng: -0.5792, lat: 44.8378, employees: 130, circuits: 3, active: 120 },
  ];

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Crée la carte
    map.current = L.map(mapContainer.current).setView([46.2276, 2.3522], 5);

    // Ajoute OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Ajoute les points
    departmentsCoords.forEach((dept) => {
      const circle = L.circleMarker([dept.lat, dept.lng], {
        radius: Math.sqrt(dept.employees) / 2.5,
        fillColor: '#3b82f6',
        color: '#1e40af',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.7,
      }).addTo(map.current!);

      circle.bindPopup(`
        <div style="font-size: 13px; font-weight: bold; color: #333;">
          <strong style="display: block; margin-bottom: 4px; font-size: 14px;">${dept.name}</strong>
          👥 Total: ${dept.employees}<br/>
          🟢 Actifs: ${dept.active}<br/>
          🔗 Circuits: ${dept.circuits}
        </div>
      `);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
      isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
    }`}>
      <div className="p-6 border-b border-slate-700/30">
        <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
          🗺️ Implantations - Carte Interactive OpenStreetMap
        </h3>
      </div>
      
      <div ref={mapContainer} className="w-full h-96" />

      {/* Légende */}
      <div className="p-6 border-t border-slate-700/30">
        <p className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Légende:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departmentsCoords.map((dept, idx) => (
            <div key={idx} className={`flex items-center gap-2 p-2 rounded ${isDark ? 'bg-slate-800/30' : 'bg-blue-50/30'}`}>
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{idx + 1}</span>
              </div>
              <div className="text-xs">
                <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                  {dept.name}
                </p>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {dept.employees} emp. / {dept.circuits} circuits
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
