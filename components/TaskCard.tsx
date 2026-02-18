
import React from 'react';
import { Task } from '../types';
import { COLORS, PRIORITY_LABELS } from '../constants';
import { Edit2, Trash2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isRecentlyMoved?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isRecentlyMoved, onEdit, onDelete, onDragStart }) => {
  const pData = PRIORITY_LABELS[task.priority];
  
  const isPending = task.column === 'pending';
  const isProgress = task.column === 'progress';
  const isDone = task.column === 'done';

  const getThemeColor = () => {
    if (isPending) return COLORS.red;
    if (isProgress) return COLORS.yellow;
    return COLORS.green;
  };

  const getGradientClass = () => {
    if (isPending) return 'from-[#ff3366]/20 via-[#080812]/95 to-[#04040a]';
    if (isProgress) return 'from-[#facc15]/20 via-[#080812]/95 to-[#04040a]';
    return 'from-[#00ff88]/20 via-[#080812]/95 to-[#04040a]';
  };

  const getBorderClass = () => {
    if (isPending) return 'glow-border-pending';
    if (isProgress) return 'glow-border-progress';
    return 'glow-border-done';
  };

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className={`group relative w-full bg-gradient-to-br ${getGradientClass()} backdrop-blur-xl border rounded-[2rem] overflow-hidden transition-all duration-700 hover:translate-y-[-6px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] ${getBorderClass()} ${isRecentlyMoved ? 'animate-drop-impact' : ''}`}
      style={{ color: getThemeColor() }}
    >
      {/* Background Fill Animations - Refined for Gradient Look */}
      {isProgress && (
        <div className="absolute inset-0 animate-diag-flow-yellow opacity-20 pointer-events-none">
          <div className="absolute inset-0 scanline-yellow opacity-40" />
        </div>
      )}
      
      {isDone && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 to-[#00d4ff]/5 shimmer pointer-events-none">
          <div className="absolute inset-0 scanline-green opacity-30" />
        </div>
      )}

      {/* Internal Glow Effect (Top highlight) */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Card Content */}
      <div className="relative p-7 flex flex-col gap-4 z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Pulsing Dot Indicator */}
            <div 
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,0.3)]`}
              style={{ 
                borderColor: isDone ? COLORS.green : (isProgress ? `${COLORS.yellow}aa` : `${COLORS.red}aa`),
                backgroundColor: isDone ? COLORS.green : 'transparent'
              }}
            >
              {(isDone || isProgress) && (
                <div 
                  className={`w-2 h-2 rounded-full transition-colors animate-pulse`}
                  style={{ backgroundColor: isDone ? '#04040a' : COLORS.yellow }}
                />
              )}
            </div>
            <h3 className={`text-base font-orbitron font-bold tracking-wider transition-colors drop-shadow-md`}
                style={{ color: isDone ? COLORS.green : (isProgress ? COLORS.yellow : '#ffffff') }}>
              {task.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            <button onClick={() => onEdit(task)} className="p-2 hover:bg-white/5 rounded-full hover:text-white text-white/30 transition-all"><Edit2 size={14} /></button>
            <button onClick={() => onDelete(task.id)} className="p-2 hover:bg-[#ff3366]/10 rounded-full hover:text-[#ff3366] text-white/30 transition-all"><Trash2 size={14} /></button>
          </div>
        </div>

        <p className="text-xs font-exo text-white/50 leading-relaxed min-h-[40px] line-clamp-3">
          {task.description || "Protocolo sin detalles adicionales."}
        </p>

        {/* Footer Area with Stats-like appearance */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <span 
              className="text-[10px] font-space font-bold px-3 py-1.5 rounded-xl border"
              style={{ 
                color: pData.color, 
                borderColor: `${pData.color}33`, 
                backgroundColor: `${pData.color}11` 
              }}
            >
              {pData.label}
            </span>
          </div>

          <div className="flex flex-col items-end">
             {isProgress && (
              <span className="text-[10px] font-space text-[#facc15] font-black tracking-tighter animate-pulse">PROCESANDO...</span>
            )}
            {isDone && (
              <span className="text-[10px] font-space text-[#00ff88] font-black tracking-widest">FINALIZADO</span>
            )}
            {isPending && (
              <span className="text-[10px] font-space text-[#ff3366]/60 font-black tracking-widest uppercase">EN COLA</span>
            )}
          </div>
        </div>
      </div>

      {/* Subtle background glow that reacts to hover */}
      {/* Fix: Replaced invalid 'from' and 'to' style properties with 'backgroundImage' to resolve TypeScript error on line 131. */}
      <div 
        className="absolute -inset-20 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none blur-[60px]"
        style={{ 
          backgroundImage: `linear-gradient(to bottom right, ${getThemeColor()}33, transparent)`
        }}
      />
    </div>
  );
};

export default TaskCard;
