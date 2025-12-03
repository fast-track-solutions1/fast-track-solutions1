'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

// ✅ IMPORTS API & HOOKS
import { useFetch } from '@/hooks/useApi';
import type { Department, Service, Grade, Equipment } from '@/lib/api';

// Données de fallback (utilisées si API indisponible)
const fallbackDepartmentsData = [
  { name: 'Île-de-France', code: '75', employees: 450, circuits: 12, active: 430, onLeave: 15, absent: 5 },
  { name: 'Provence-Alpes-Côte d\'Azur', code: '13', employees: 180, circuits: 5, active: 170, onLeave: 8, absent: 2 },
  { name: 'Auvergne-Rhône-Alpes', code: '69', employees: 220, circuits: 6, active: 210, onLeave: 8, absent: 2 },
  { name: 'Occitanie', code: '31', employees: 150, circuits: 4, active: 140, onLeave: 8, absent: 2 },
  { name: 'Nouvelle-Aquitaine', code: '33', employees: 130, circuits: 3, active: 120, onLeave: 8, absent: 2 },
];

const fallbackServiceData = [
  { name: 'IT', employees: 85 },
  { name: 'RH', employees: 42 },
  { name: 'Finance', employees: 65 },
  { name: 'Operations', employees: 110 },
  { name: 'Sales', employees: 128 },
  { name: 'Support', employees: 70 },
];

const fallbackGradeData = [
  { name: 'Manager', employees: 35 },
  { name: 'Senior', employees: 85 },
  { name: 'Confirmé', employees: 180 },
  { name: 'Junior', employees: 200 },
];

const fallbackEquipmentData = [
  { name: 'PC Bureau', value: 320 },
  { name: 'Portables', value: 180 },
  { name: 'Serveurs', value: 45 },
  { name: 'Imprimantes', value: 28 },
];

const departmentsCoordsMap = [
  { name: 'Île-de-France', lng: 2.3522, lat: 48.8566, employees: 450, circuits: 12, active: 430 },
  { name: 'Provence-Alpes-Côte d\'Azur', lng: 6.0679, lat: 43.9352, employees: 180, circuits: 5, active: 170 },
  { name: 'Auvergne-Rhône-Alpes', lng: 4.8357, lat: 45.7640, employees: 220, circuits: 6, active: 210 },
  { name: 'Occitanie', lng: 1.4442, lat: 43.6047, employees: 150, circuits: 4, active: 140 },
  { name: 'Nouvelle-Aquitaine', lng: -0.5792, lat: 44.8378, employees: 130, circuits: 3, active: 120 },
];

const jobSheetData = [
  { month: 'Jan', created: 2, improved: 3 },
  { month: 'Feb', created: 3, improved: 2 },
  { month: 'Mar', created: 4, improved: 4 },
  { month: 'Apr', created: 2, improved: 5 },
  { month: 'May', created: 5, improved: 3 },
  { month: 'Jun', created: 3, improved: 6 },
];

const employeeTrendData = [
  { month: 'Jan', active: 1800, onLeave: 120, remote: 300 },
  { month: 'Feb', active: 1820, onLeave: 140, remote: 320 },
  { month: 'Mar', active: 1850, onLeave: 130, remote: 340 },
  { month: 'Apr', active: 1900, onLeave: 150, remote: 360 },
  { month: 'May', active: 1950, onLeave: 160, remote: 380 },
  { month: 'Jun', active: 2050, onLeave: 140, remote: 420 },
];

const payrollData = [
  { month: 'Jan', salaries: 380, expenses: 200 },
  { month: 'Feb', salaries: 410, expenses: 220 },
  { month: 'Mar', salaries: 390, expenses: 210 },
  { month: 'Apr', salaries: 450, expenses: 240 },
  { month: 'May', salaries: 480, expenses: 260 },
  { month: 'Jun', salaries: 520, expenses: 280 },
];

// ============================================================================
// COMPOSANT CARTE
// ============================================================================

function DepartmentMap({ isDark, departments }: { isDark: boolean; departments: any[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current).setView([46.2276, 2.3522], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    departmentsCoordsMap.forEach((dept) => {
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

  return <div ref={mapContainer} className="w-full h-96" />;
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function DashboardPage() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ✅ FETCH DATA DE L'API
  const { data: departmentsAPI, loading: deptLoading } = useFetch<Department[]>('/departements/');
  const { data: servicesAPI, loading: serviceLoading } = useFetch<Service[]>('/services/');
  const { data: gradesAPI, loading: gradeLoading } = useFetch<Grade[]>('/grades/');
  const { data: equipmentAPI, loading: equipmentLoading } = useFetch<Equipment[]>('/equipements/');

  // ✅ UTILISER LES DONNÉES API OU FALLBACK
  const departments = departmentsAPI || fallbackDepartmentsData;
  const services = servicesAPI || fallbackServiceData;
  const grades = gradesAPI || fallbackGradeData;
  const equipment = equipmentAPI || fallbackEquipmentData;

  // Transformer les données des services
  const serviceData = services.map(s => ({
    name: s.nom,
    employees: Math.floor(Math.random() * 150), // Demo: nombre aléatoire
  }));

  // Transformer les données des grades
  const gradeData = grades.map(g => ({
    name: g.nom,
    employees: Math.floor(Math.random() * 200), // Demo: nombre aléatoire
  }));

  // Transformer les données des équipements
  const equipmentData = equipment.map(e => ({
    name: e.nom,
    value: e.quantite || 0,
  }));

  useEffect(() => {
    setMounted(true);

    // Détecte le mode dark initial
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(isDarkMode);
    };

    checkDarkMode();

    // Observer pour les changements de theme
    const observer = new MutationObserver(() => {
      checkDarkMode();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Écoute les changements de prefers-color-scheme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      checkDarkMode();
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  if (!mounted) return null;

  const totalEmployees = departments.reduce((sum: number, d: any) => sum + d.employees, 0);
  const totalActive = departments.reduce((sum: number, d: any) => sum + d.active, 0);
  const totalEquipment = equipmentData.reduce((sum: number, e: any) => sum + e.value, 0);

  return (
    <div key={`theme-${isDark}`} className={`min-h-screen transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    } p-8`}>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Tableau de Bord RH - MSI TeamHub
          </h1>
          <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Vue complète de la gestion des ressources humaines
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Total Employés', value: totalEmployees.toString(), delta: '+2.5%', trend: 'up', icon: '👥', color: 'from-blue-500 to-cyan-500', loading: deptLoading },
            { title: 'Actifs Maintenant', value: totalActive.toString(), delta: '+1.2%', trend: 'up', icon: '🟢', color: 'from-emerald-500 to-teal-500', loading: deptLoading },
            { title: 'Équipements IT', value: totalEquipment.toString(), icon: '💻', color: 'from-purple-500 to-pink-500', loading: equipmentLoading },
            { title: 'Fiches de Poste', value: '45', icon: '📋', color: 'from-amber-500 to-orange-500', loading: false },
          ].map((kpi) => (
            <div
              key={kpi.title}
              className={`relative overflow-hidden rounded-xl border backdrop-blur-xl transition-all hover:shadow-lg ${
                isDark
                  ? 'bg-slate-900/40 border-slate-700/50 hover:border-slate-600'
                  : 'bg-white/40 border-white/60 hover:border-white/80 shadow-sm'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-5`}></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {kpi.title}
                    </p>
                    <h3 className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {kpi.loading ? '⏳' : kpi.value}
                    </h3>
                  </div>
                  <span className="text-4xl">{kpi.icon}</span>
                </div>
                {kpi.delta && !kpi.loading && (
                  <div className="mt-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      kpi.trend === 'up'
                        ? isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-green-100 text-green-700'
                        : isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-red-100 text-red-700'
                    }`}>
                      {kpi.delta}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Row 1: Masse Salariale + Carte */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart - Masse Salariale */}
          <div className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
            isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
          }`}>
            <div className="p-6 border-b border-slate-700/30">
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                📊 Évolution Masse Salariale
              </h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300} key={`payroll-${isDark}`}>
                <LineChart data={payrollData}>
                  <defs>
                    <linearGradient id="colorSalaries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" stroke={textColor} />
                  <YAxis stroke={textColor} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="salaries"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                    activeDot={{ r: 7 }}
                    isAnimationActive={true}
                    name="Salaires (€K)"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 5 }}
                    activeDot={{ r: 7 }}
                    isAnimationActive={true}
                    name="Dépenses (€K)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Carte de France */}
          <div className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
            isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
          }`}>
            <div className="p-6 border-b border-slate-700/30">
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                🗺️ Implantations - Carte Interactive
              </h3>
            </div>
            <DepartmentMap isDark={isDark} departments={departments} />
          </div>
        </div>

        {/* Row 2: Service + Grade */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Effectifs par Service */}
          <div className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
            isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
          }`}>
            <div className="p-6 border-b border-slate-700/30">
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                🏢 Effectifs par Service {serviceLoading && <span className="text-xs">⏳</span>}
              </h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300} key={`service-${isDark}`}>
                <BarChart data={serviceData.length > 0 ? serviceData : fallbackServiceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" stroke={textColor} />
                  <YAxis stroke={textColor} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="employees"
                    fill="#8b5cf6"
                    radius={[8, 8, 0, 0]}
                    isAnimationActive={true}
                    name="Employés"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Effectifs par Grade */}
          <div className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
            isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
          }`}>
            <div className="p-6 border-b border-slate-700/30">
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                📈 Effectifs par Grade {gradeLoading && <span className="text-xs">⏳</span>}
              </h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300} key={`grade-${isDark}`}>
                <AreaChart data={gradeData.length > 0 ? gradeData : fallbackGradeData}>
                  <defs>
                    <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" stroke={textColor} />
                  <YAxis stroke={textColor} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="employees"
                    stroke="#ec4899"
                    fill="url(#colorGrade)"
                    fillOpacity={0.6}
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 3: Fiches de Poste + Équipements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fiches de Poste */}
          <div className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
            isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
          }`}>
            <div className="p-6 border-b border-slate-700/30">
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                📋 Fiches de Poste (Créées/Améliorées)
              </h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300} key={`jobsheet-${isDark}`}>
                <LineChart data={jobSheetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" stroke={textColor} />
                  <YAxis stroke={textColor} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="created"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    isAnimationActive={true}
                    name="Créées"
                  />
                  <Line
                    type="monotone"
                    dataKey="improved"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    isAnimationActive={true}
                    name="Améliorées"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Équipements */}
          <div className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
            isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
          }`}>
            <div className="p-6 border-b border-slate-700/30">
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                💻 Parc Informatique {equipmentLoading && <span className="text-xs">⏳</span>}
              </h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300} key={`equipment-${isDark}`}>
                <BarChart data={equipmentData.length > 0 ? equipmentData : fallbackEquipmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" stroke={textColor} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke={textColor} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} isAnimationActive={true} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 4: Tendances Employés */}
        <div className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
          isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
        }`}>
          <div className="p-6 border-b border-slate-700/30">
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
              📈 Tendances Effectifs (Actifs/Congés/Remote)
            </h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300} key={`trend-${isDark}`}>
              <AreaChart data={employeeTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" stroke={textColor} />
                <YAxis stroke={textColor} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                    borderRadius: '8px',
                  }}
                />
                <Area type="monotone" dataKey="active" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} isAnimationActive={true} name="Actifs" />
                <Area type="monotone" dataKey="onLeave" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} isAnimationActive={true} name="Congés" />
                <Area type="monotone" dataKey="remote" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} isAnimationActive={true} name="Remote" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tableau Départements */}
        <div className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
          isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
        }`}>
          <div className="p-6 border-b border-slate-700/30">
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
              🗺️ Détail des Effectifs par Département {deptLoading && <span className="text-xs">⏳</span>}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <th className="px-6 py-3 text-left font-semibold">Département</th>
                  <th className="px-6 py-3 text-center font-semibold">Total</th>
                  <th className="px-6 py-3 text-center font-semibold">Actifs</th>
                  <th className="px-6 py-3 text-center font-semibold">Congés</th>
                  <th className="px-6 py-3 text-center font-semibold">Absents</th>
                  <th className="px-6 py-3 text-center font-semibold">Circuits</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept: any) => (
                  <tr key={dept.code || dept.numero} className={`border-b ${isDark ? 'border-slate-700/30' : 'border-slate-200/30'}`}>
                    <td className="px-6 py-3 font-medium">{dept.name || dept.nom}</td>
                    <td className="px-6 py-3 text-center font-semibold">{dept.employees || '—'}</td>
                    <td className="px-6 py-3 text-center text-green-500 font-semibold">{dept.active || '—'}</td>
                    <td className="px-6 py-3 text-center text-amber-500 font-semibold">{dept.onLeave || '—'}</td>
                    <td className="px-6 py-3 text-center text-red-500 font-semibold">{dept.absent || '—'}</td>
                    <td className="px-6 py-3 text-center font-semibold">{dept.circuits || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
