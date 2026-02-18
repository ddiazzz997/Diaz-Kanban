
import React from 'react';
import { Task } from '../types';
import { COLORS } from '../constants';
import { Activity, CheckCircle, List, TrendingUp, Bot } from 'lucide-react';

interface StatsBarProps {
  tasks: Task[];
  lastSync: number;
  onToggleAI: () => void;
}

const StatsBar: React.FC<StatsBarProps> = ({ tasks, onToggleAI }) => {
  const total = tasks.length;
  const inProgress = tasks.filter(t => t.column === 'progress').length;
  const completed = tasks.filter(t => t.column === 'done').length;
  
  const globalProgress = total > 0 
    ? Math.round(tasks.reduce((acc, t) => acc + t.progress, 0) / total) 
    : 0;

  return (
    <div className="w-full bg-[#080812]/80 backdrop-blur-md border-b border-white/5 py-3 px-6 flex items-center justify-center relative z-10">
      <div className="flex items-center gap-12 flex-wrap justify-center">
        <StatItem 
          icon={<List size={18} />} 
          label="TOTAL" 
          value={total} 
          color={COLORS.cyan} 
        />
        <StatItem 
          icon={<Activity size={18} />} 
          label="EN PROGRESO" 
          value={inProgress} 
          color={COLORS.cyan} 
        />
        <StatItem 
          icon={<CheckCircle size={18} />} 
          label="COMPLETADAS" 
          value={completed} 
          color={COLORS.cyan} 
        />
        <StatItem 
          icon={<TrendingUp size={18} />} 
          label="PROGRESO GLOBAL" 
          value={`${globalProgress}%`} 
          color={COLORS.cyan} 
        />
        
        {/* Botón Asistente de IA Actualizado: Daniel Diaz */}
        <button 
          onClick={onToggleAI}
          id="ai-assistant-trigger"
          className="flex items-center gap-4 px-5 py-2 rounded-full bg-[#0088ff]/10 border border-[#0088ff]/30 hover:bg-[#0088ff]/20 hover:border-[#0088ff]/60 transition-all group shadow-[0_0_20px_rgba(0,136,255,0.1)] hover:shadow-[0_0_25px_rgba(0,136,255,0.4)]"
        >
          <div className="text-[#0088ff] drop-shadow-[0_0_10px_#0088ff] group-hover:scale-110 transition-transform">
            <Bot size={22} />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[10px] font-orbitron tracking-[0.15em] text-[#0088ff] font-black uppercase group-hover:text-white transition-colors">
              DANIEL DIAZ
            </span>
            <span className="text-[8px] font-space font-bold text-white/40 uppercase tracking-tighter">
              TU ASISTENTE DE IA
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-1 shadow-[0_0_10px_#4ade80]" />
        </button>
      </div>
    </div>
  );
};

const StatItem: React.FC<{ 
  icon: React.ReactNode, 
  label: string, 
  value: string | number, 
  color: string
}> = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-3">
    <div 
      style={{ color }} 
      className="drop-shadow-[0_0_8px_currentColor] opacity-90"
    >
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-[9px] font-orbitron tracking-[0.2em] text-white/30 font-bold">{label}</span>
      <span className="text-sm font-space font-bold text-white/90 tabular-nums">{value}</span>
    </div>
  </div>
);

export default StatsBar;
