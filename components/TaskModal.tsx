
import React, { useState, useEffect } from 'react';
import { Task, Priority, ColumnType } from '../types';
import { X } from 'lucide-react';
import { COLORS } from '../constants';

interface TaskModalProps {
  task?: Task | null;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    column: 'pending'
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#080812] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-slide-up">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="text-sm font-orbitron font-bold text-white tracking-[0.2em]">
            {task ? 'EDITAR PROTOCOLO' : 'NUEVA MISIÓN'}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-orbitron font-bold tracking-widest text-white/30 uppercase">IDENTIFICADOR</label>
            <input 
              required
              autoFocus
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0088ff] transition-all placeholder:text-white/10"
              placeholder="Ingresar nombre de tarea..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-orbitron font-bold tracking-widest text-white/30 uppercase">DETALLES OPERATIVOS</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0088ff] transition-all resize-none placeholder:text-white/10"
              placeholder="Describir objetivos (máximo 3 líneas)..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-orbitron font-bold tracking-widest text-white/30 uppercase">PRIORIDAD</label>
              <select 
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none cursor-pointer hover:bg-white/[0.07] transition-colors appearance-none"
              >
                <option value="low">BAJA</option>
                <option value="medium">MEDIA</option>
                <option value="high">ALTA</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-orbitron font-bold tracking-widest text-white/30 uppercase">DESPLIEGUE</label>
              <select 
                value={formData.column}
                onChange={e => setFormData({ ...formData, column: e.target.value as ColumnType })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none cursor-pointer appearance-none"
              >
                <option value="pending">PENDIENTE</option>
                <option value="progress">EN PROGRESO</option>
                <option value="done">COMPLETADO</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3.5 rounded-xl border border-white/5 text-white/40 font-orbitron font-bold text-[10px] tracking-widest hover:bg-white/5 transition-colors uppercase"
            >
              ABORTAR
            </button>
            <button 
              type="submit"
              className="flex-[2] px-4 py-3.5 rounded-xl bg-gradient-to-r from-[#0088ff] to-[#00d4ff] text-white font-orbitron font-bold text-[10px] tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,136,255,0.4)] uppercase"
            >
              {task ? 'ACTUALIZAR PROTOCOLO' : 'INICIAR MISIÓN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
