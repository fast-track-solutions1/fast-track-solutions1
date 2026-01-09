'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { Loader2, Package2, Users, ChevronDown, ChevronUp } from 'lucide-react';

// ✅ IMPORTS DES CLASSES API
import { salarieApi, Salarie } from '@/lib/salarie-api';
import { departementApi, Departement } from '@/lib/departement-api';
import { serviceApi, Service } from '@/lib/service-api';
import { gradeApi, Grade } from '@/lib/grade-api';
import { equipementApi, Equipment, EquipmentInstance } from '@/lib/equipement-api';
import { societeApi, Societe } from '@/lib/societe-api';
import { DEPARTEMENTS_COORDS, getDepartementCoords } from '@/lib/departements-coords';

// Components réutilisés
import AnnuaireCard from '@/app/(app)/annuaires/salaries/components/AnnuaireCard';


// ============================================================================
// CARTE INTERACTIVE - VERSION AMÉLIORÉE AVEC VRAIES COORDONNÉES
// ============================================================================

interface InteractiveMapProps {
  isDark: boolean;
  departments: Departement[];
  salaries: Salarie[];
  services: Service[];
  grades: Grade[];
  onDepartmentClick: (dept: Departement) => void;
}

function InteractiveMap({ isDark, departments, salaries, services, grades, onDepartmentClick }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([46.2276, 2.3522], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 4,
    }).addTo(map.current);

    const depsWithCircuits = departments.filter(d => (d.nombre_circuits || 0) > 0);

    depsWithCircuits.forEach((dept: Departement) => {
      // Récupérer les VRAIES coordonnées
      const coords = getDepartementCoords(dept.numero);
      if (!coords) return;

      const deptSalaries = salaries.filter((s: Salarie) => s.departements?.includes(dept.id));
      const circuits = dept.nombre_circuits || 0;

      let fillColor = '#3b82f6';
      let intensity = 0.6;
      let radius = 18;
      
      if (circuits <= 20) {
        fillColor = '#f59e0b';
        intensity = 0.4;
        radius = 12;
      } else if (circuits <= 50) {
        fillColor = '#3b82f6';
        intensity = 0.6;
        radius = 18;
      } else if (circuits <= 100) {
        fillColor = '#10b981';
        intensity = 0.7;
        radius = 22;
      } else {
        fillColor = '#8b5cf6';
        intensity = 0.85;
        radius = 28;
      }

      const circle = L.circleMarker([coords.lat, coords.lng], {
        radius: radius,
        fillColor: fillColor,
        color: '#1e293b',
        weight: 2.5,
        opacity: 1,
        fillOpacity: intensity,
      }).addTo(map.current!);

      circle.on('click', () => onDepartmentClick(dept));
      circle.on('mouseover', function() {
        this.setStyle({ weight: 3.5, fillOpacity: Math.min(intensity + 0.15, 1) });
      });
      circle.on('mouseout', function() {
        this.setStyle({ weight: 2.5, fillOpacity: intensity });
      });

      circle.bindPopup(`<strong>${dept.nom}</strong><br/>Circuits: ${circuits}<br/>Salariés: ${deptSalaries.length}`);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [departments, salaries, onDepartmentClick]);

  return <div ref={mapContainer} className="w-full h-96 rounded-lg shadow-lg border border-slate-300 dark:border-slate-600" />;
}


// ============================================================================
// TABLEAU DÉTAIL DÉPARTEMENT
// ============================================================================

interface DepartmentDetailTableProps {
  department: Departement;
  salaries: Salarie[];
  services: Service[];
  grades: Grade[];
  isDark: boolean;
}

function DepartmentDetailTable({ department, salaries, services, grades, isDark }: DepartmentDetailTableProps) {
  const deptSalaries = salaries.filter(s => s.departements?.includes(department.id));
  const coords = getDepartementCoords(department.numero);

  // Grouper par service
  const salariesByService = services.map(svc => {
    const employees = deptSalaries.filter(s => s.service === svc.id);
    return {
      service: svc.nom,
      employees: employees,
    };
  }).filter(s => s.employees.length > 0);

  return (
    <div className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
      isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
    }`}>
      <div className="p-6 border-b border-slate-700/30">
        <h3 className={`font-bold text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
          📍 {department.numero} - {department.nom}
        </h3>
      </div>

      {/* Info générale */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-blue-50'}`}>
            <p className={`text-xs font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>RÉGION</p>
            <p className={`font-bold text-lg mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{department.region}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-emerald-50'}`}>
            <p className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>CHEF-LIEU</p>
            <p className={`font-bold text-lg mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{department.chef_lieu}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-purple-50'}`}>
            <p className={`text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>CODE</p>
            <p className={`font-bold text-lg mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{department.numero}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-orange-50'}`}>
            <p className={`text-xs font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>CIRCUITS</p>
            <p className={`font-bold text-lg mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{department.nombre_circuits}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-pink-50'}`}>
            <p className={`text-xs font-bold ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>SALARIÉS</p>
            <p className={`font-bold text-lg mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{deptSalaries.length}</p>
          </div>
        </div>

        {/* Coordonnées GPS */}
        {coords && (
          <div className={`p-4 rounded-lg mb-6 border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              📍 Coordonnées GPS: {coords.lat}, {coords.lng}
            </p>
          </div>
        )}

        {/* Tableau des salariés par service et grade */}
        <div className="space-y-6">
          {salariesByService.map((serviceGroup) => (
            <div key={serviceGroup.service}>
              <h4 className={`font-bold text-lg mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                💼 {serviceGroup.service} ({serviceGroup.employees.length} emp.)
              </h4>

              {/* Grouper par grade */}
              {grades.map((grade) => {
                const gradeEmployees = serviceGroup.employees.filter(s => s.grade === grade.id);
                if (gradeEmployees.length === 0) return null;

                return (
                  <div key={`${serviceGroup.service}-${grade.id}`} className="mb-4">
                    <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      📊 {grade.nom} ({gradeEmployees.length})
                    </p>
                    <div className="overflow-x-auto">
                      <table className={`w-full text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <thead>
                          <tr className={`border-b ${isDark ? 'border-slate-700/50 bg-slate-800/30' : 'border-slate-200 bg-slate-100/50'}`}>
                            <th className="px-3 py-2 text-left">Nom</th>
                            <th className="px-3 py-2 text-left">Prénom</th>
                            <th className="px-3 py-2 text-left">Matricule</th>
                            <th className="px-3 py-2 text-left">Email</th>
                            <th className="px-3 py-2 text-left">3CX</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gradeEmployees.map((emp) => (
                            <tr key={emp.id} className={`border-b ${isDark ? 'border-slate-700/30' : 'border-slate-200/50'}`}>
                              <td className="px-3 py-2 font-semibold">{emp.nom}</td>
                              <td className="px-3 py-2">{emp.prenom}</td>
                              <td className="px-3 py-2 font-mono text-xs">{emp.matricule}</td>
                              <td className="px-3 py-2">
                                <a href={`mailto:${emp.mail_professionnel}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                  {emp.mail_professionnel || 'N/A'}
                                </a>
                              </td>
                              <td className="px-3 py-2">{emp.extension_3cx || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// PAGE PRINCIPALE
// ============================================================================

export default function DashboardPage() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [departments, setDepartments] = useState<Departement[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [instances, setInstances] = useState<EquipmentInstance[]>([]);
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);

  const [selectedDept, setSelectedDept] = useState<Departement | null>(null);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [deptData, serviceData, gradeData, equipData, instanceData, salaryData, societeData] = await Promise.all([
        departementApi.getDepartements(),
        serviceApi.getServices(),
        gradeApi.getGrades(),
        equipementApi.getEquipements(),
        equipementApi.getInstances(),
        salarieApi.getSalaries(),
        societeApi.getSocietes(),
      ]);

      setDepartments(Array.isArray(deptData) ? deptData : []);
      setServices(Array.isArray(serviceData) ? serviceData : []);
      setGrades(Array.isArray(gradeData) ? gradeData : []);
      setEquipment(Array.isArray(equipData) ? equipData : []);
      setInstances(Array.isArray(instanceData) ? instanceData : []);
      setSalaries(Array.isArray(salaryData) ? salaryData : []);
      setSocietes(Array.isArray(societeData) ? societeData : []);
    } catch (err) {
      console.error('❌ Erreur loadAllData:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadAllData();
    }
  }, [mounted, loadAllData]);

  // 📊 CALCULS
  const totalEmployees = salaries.length;
  const totalDepartments = departments.length;
  const deptWithCircuits = departments.filter(d => (d.nombre_circuits || 0) > 0).length;
  const totalServices = services.length;
  const totalGrades = grades.length;
  const totalCircuits = departments.reduce((sum, d) => sum + (d.nombre_circuits || 0), 0);

  // 👥 EFFECTIFS PAR DÉPARTEMENT
  const employeesByDept = departments.map(dept => {
    const count = salaries.filter(s => s.departements?.includes(dept.id)).length;
    return { name: dept.nom, employees: count };
  }).filter(d => d.employees > 0).sort((a, b) => b.employees - a.employees);

  // 👥 EFFECTIFS PAR SERVICE
  const employeesByService = services.map(svc => {
    const count = salaries.filter(s => s.service === svc.id).length;
    return { name: svc.nom, employees: count };
  }).filter(s => s.employees > 0).sort((a, b) => b.employees - a.employees);

  // 👥 EFFECTIFS PAR GRADE
  const employeesByGrade = grades.map(grd => {
    const count = salaries.filter(s => s.grade === grd.id).length;
    return { name: grd.nom, employees: count };
  }).filter(g => g.employees > 0).sort((a, b) => b.employees - a.employees);

  // 👥 EFFECTIFS PAR GENRE
  const employeesByGender = [
    { name: 'Hommes', employees: salaries.filter(s => s.genre === 'm').length },
    { name: 'Femmes', employees: salaries.filter(s => s.genre === 'f').length },
    { name: 'Autre', employees: salaries.filter(s => s.genre === 'autre').length },
  ].filter(g => g.employees > 0);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981'];

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={40} />
      </div>
    );
  }

  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    } p-6 md:p-8`}>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="animate-in fade-in slide-in-from-top-4">
          <h1 className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            📊 Tableau de Bord RH
          </h1>
          <p className={`mt-3 text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            MSI TeamHub - Analytics RH & Gestion Départements
          </p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Employés', value: totalEmployees, icon: '👥', color: 'from-blue-500 to-cyan-500', subtext: 'Total salariés' },
            { title: 'Circuits', value: totalCircuits, icon: '🔗', color: 'from-amber-500 to-orange-500', subtext: `${deptWithCircuits} depts` },
            { title: 'Services', value: totalServices, icon: '📋', color: 'from-purple-500 to-pink-500', subtext: 'Unités' },
            { title: 'Grades', value: totalGrades, icon: '📊', color: 'from-rose-500 to-red-500', subtext: 'Niveaux' },
          ].map((kpi) => (
            <div
              key={kpi.title}
              className={`rounded-xl border backdrop-blur-xl overflow-hidden transition-all hover:shadow-2xl hover:scale-105 cursor-pointer group ${
                isDark
                  ? 'bg-slate-900/40 border-slate-700/50 hover:border-slate-600'
                  : 'bg-white/40 border-white/60 shadow-sm hover:shadow-md'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
              <div className="relative p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-xs font-bold tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {kpi.title}
                    </p>
                    <h3 className={`text-4xl font-bold mt-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {kpi.value}
                    </h3>
                    <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      {kpi.subtext}
                    </p>
                  </div>
                  <span className="text-5xl group-hover:scale-110 transition-transform">{kpi.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CARTE 16/9 */}
        <div className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
          isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
        }`}>
          <div className="p-6 border-b border-slate-700/30">
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
              🗺️ Carte Interactive - Cliquez sur un point pour voir les détails
            </h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Taille des points = nombre de circuits
            </p>
          </div>
          <div className="p-6" style={{ aspectRatio: '16 / 9' }}>
            <InteractiveMap 
              isDark={isDark} 
              departments={departments} 
              salaries={salaries} 
              services={services} 
              grades={grades}
              onDepartmentClick={setSelectedDept}
            />
          </div>
        </div>

        {/* TABLEAU DÉTAIL DÉPARTEMENT */}
        {selectedDept && (
          <DepartmentDetailTable
            department={selectedDept}
            salaries={salaries}
            services={services}
            grades={grades}
            isDark={isDark}
          />
        )}

        {/* Effectifs par Département / Service / Grade */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Départements */}
          <div className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
            isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
          }`}>
            <div className="p-6 border-b border-slate-700/30">
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                🗺️ Employés par Département
              </h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={employeesByDept} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis type="number" stroke={textColor} />
                  <YAxis dataKey="name" type="category" stroke={textColor} width={95} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '8px' }} />
                  <Bar dataKey="employees" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Services */}
          <div className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
            isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
          }`}>
            <div className="p-6 border-b border-slate-700/30">
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                💼 Employés par Service
              </h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={employeesByService} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis type="number" stroke={textColor} />
                  <YAxis dataKey="name" type="category" stroke={textColor} width={95} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '8px' }} />
                  <Bar dataKey="employees" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grades */}
          <div className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
            isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
          }`}>
            <div className="p-6 border-b border-slate-700/30">
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                📊 Employés par Grade
              </h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={employeesByGrade} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis type="number" stroke={textColor} />
                  <YAxis dataKey="name" type="category" stroke={textColor} width={95} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '8px' }} />
                  <Bar dataKey="employees" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Genre Distribution */}
        <div className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
          isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
        }`}>
          <div className="p-6 border-b border-slate-700/30">
            <h3 className={`font-bold text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Users className="w-5 h-5" />
              Distribution par Genre
            </h3>
          </div>
          <div className="p-6 flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={employeesByGender} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="employees"
                  label={({ name, employees }) => `${name}: ${employees}`}
                  labelLine={false}
                >
                  {employeesByGender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${value} emp.`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Salariés */}
        <div className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
          isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
        }`}>
          <div className="p-6 border-b border-slate-700/30">
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
              👥 Top 5 Derniers Salariés
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {salaries.slice(0, 5).map((salarie) => (
                <AnnuaireCard
                  key={salarie.id}
                  salarie={salarie}
                  societes={societes}
                  services={services}
                  grades={grades}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
