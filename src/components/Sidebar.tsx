import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  TrendingUp, 
  CloudRain, 
  Cpu, 
  Ambulance, 
  SlidersHorizontal, 
  Bell, 
  FileCode2,
  Server,
  Database,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  unreadAlertsCount: number;
  serverOnline: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  unreadAlertsCount,
  serverOnline,
}) => {
  const navItems = [
    { id: 'overview', label: 'City Overview', icon: LayoutDashboard, badge: null, category: 'CORE' },
    { id: 'map', label: 'GIS Digital Twin Map', icon: Map, badge: 'Live GIS', category: 'CORE' },
    { id: 'traffic', label: 'AI Traffic Prediction', icon: TrendingUp, badge: 'ML Model', category: 'INTELLIGENCE' },
    { id: 'flood', label: 'AI Flood Prediction', icon: CloudRain, badge: 'Hydro AI', category: 'INTELLIGENCE' },
    { id: 'infrastructure', label: 'IoT Infrastructure', icon: Cpu, badge: '8 Sensors', category: 'MONITORING' },
    { id: 'emergency', label: 'Emergency Routing', icon: Ambulance, badge: 'Dijkstra', category: 'OPERATIONS' },
    { id: 'simulation', label: 'What-If Simulation', icon: SlidersHorizontal, badge: 'Cascade', category: 'OPERATIONS' },
    { id: 'alerts', label: 'Alerts & Incidents', icon: Bell, badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : null, badgeColor: 'rose', category: 'OPERATIONS' },
    { id: 'architecture', label: 'API & Supabase DDL', icon: Database, badge: 'Supabase SQL', badgeColor: 'purple', category: 'SYSTEM' },
  ];

  const categories = ['CORE', 'INTELLIGENCE', 'MONITORING', 'OPERATIONS', 'SYSTEM'];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
        {categories.map((cat) => {
          const items = navItems.filter(item => item.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat} className="space-y-1.5">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {cat}
              </div>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                          item.badgeColor === 'rose'
                            ? 'bg-rose-500 text-white animate-pulse'
                            : item.badgeColor === 'purple'
                            ? 'bg-purple-950 text-purple-300 border border-purple-700 shadow-sm'
                            : isActive
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer system status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
        <div className="flex items-center justify-between text-[11px] px-1">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Backend Core:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${serverOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className={`font-mono text-[10px] font-bold ${serverOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
              {serverOnline ? 'ONLINE' : 'CONNECTING'}
            </span>
          </div>
        </div>

        <button 
          onClick={() => setActiveModule('architecture')}
          className="w-full flex items-center justify-between text-[11px] px-1 py-1 rounded hover:bg-slate-800/60 transition-colors text-left"
          title="Inspect Supabase PostgreSQL Database Status"
        >
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400">DB State:</span>
          </div>
          <span className="font-mono text-[10px] text-purple-400 font-bold hover:underline">
            SUPABASE / PG ↗
          </span>
        </button>

        <div className="pt-1 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-500 px-1">
          <span>Bengaluru DEMO Grid</span>
          <span className="font-mono">12.9716° N</span>
        </div>
      </div>
    </aside>
  );
};
