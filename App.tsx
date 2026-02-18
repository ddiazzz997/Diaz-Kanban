
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Terminal, Wand2 } from 'lucide-react';
import { Task, ColumnType } from './types';
import { COLUMNS, COLORS } from './constants';
import StatsBar from './components/StatsBar';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import AIChat from './components/AIChat';
import MagicModeOverlay from './components/MagicModeOverlay';

const ConfettiExplosion: React.FC = () => {
  const particles = Array.from({ length: 40 });
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
      {particles.map((_, i) => {
        const x = (Math.random() - 0.5) * 800;
        const y = (Math.random() - 0.5) * 800;
        const r = Math.random() * 720;
        const color = ['#00ff88', '#00d4ff', '#a855f7', '#ffffff'][Math.floor(Math.random() * 4)];
        return (
          <div 
            key={i} 
            className="confetti-particle"
            style={{ 
              '--x': `${x}px`, 
              '--y': `${y}px`, 
              '--r': `${r}deg`,
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}`
            } as any}
          />
        );
      })}
    </div>
  );
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null | undefined>(undefined);
  const [lastSync, setLastSync] = useState<number>(Date.now());
  const [recentlyMovedTaskId, setRecentlyMovedTaskId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [magicMode, setMagicMode] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('diaz_tasks');
    if (saved) {
      try { setTasks(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diaz_tasks', JSON.stringify(tasks));
    setLastSync(Date.now());
  }, [tasks]);

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (taskData.id) {
      setTasks(prev => prev.map(t => t.id === taskData.id ? { ...t, ...taskData } as Task : t));
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: taskData.title || '',
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        progress: taskData.column === 'done' ? 100 : (taskData.column === 'progress' ? 50 : 0),
        column: taskData.column || 'pending',
        createdAt: Date.now(),
      };
      setTasks(prev => [...prev, newTask]);
    }
    setEditingTask(undefined);
  };

  const handleMagicDrop = (taskId: string, columnId: ColumnType) => {
    if (columnId === 'done') {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
    setRecentlyMovedTaskId(taskId);
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          column: columnId,
          progress: columnId === 'done' ? 100 : (columnId === 'progress' ? 50 : t.progress)
        };
      }
      return t;
    }));
    setTimeout(() => setRecentlyMovedTaskId(null), 1000);
  };

  const onDrop = (e: React.DragEvent, columnId: ColumnType) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    handleMagicDrop(taskId, columnId);
  };

  const toggleMagicMode = () => setMagicMode(prev => !prev);

  return (
    <div className={`min-h-screen flex flex-col bg-black text-white/90 ${magicMode ? 'magic-active' : ''}`}>
      {showCelebration && <ConfettiExplosion />}
      {magicMode && <MagicModeOverlay tasks={tasks} onMagicDrop={handleMagicDrop} />}
      
      <header className="px-10 py-8 flex items-center justify-center relative z-10 flex-col gap-4">
        <button 
          onClick={toggleMagicMode}
          title={magicMode ? "Desactivar Modo Mago" : "Activar Modo Mago"}
          className="logo-container group"
        >
          <div className="logo-ring" />
          <div className="logo-aura" />
          <span className="text-3xl font-orbitron font-black text-white z-[2] select-none">D</span>
          <div className="logo-glow" />
        </button>
        <div className="flex items-center">
          <h1 className="text-3xl font-orbitron font-black tracking-[0.25em] text-white">
            DÍAZ <span className="text-[#0088ff] drop-shadow-[0_0_10px_rgba(0,136,255,0.6)]">KANBAN</span>
          </h1>
        </div>
      </header>

      <StatsBar tasks={tasks} lastSync={lastSync} onToggleAI={() => setIsAIChatOpen(true)} />

      <main className="flex-1 px-10 py-6 relative z-10 overflow-x-hidden bg-transparent flex justify-center">
        <div className="flex gap-8 h-full w-full max-w-[1400px] justify-between">
          {COLUMNS.map(col => (
            <div 
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, col.id)}
              className="flex flex-col flex-1 min-w-[320px] max-w-[420px]"
            >
              <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full animate-pulse ring-2 ring-white/5 shadow-[0_0_20px_currentColor]" 
                    style={{ color: col.color, backgroundColor: col.color }} 
                  />
                  <h2 className="text-[11px] font-orbitron font-bold tracking-[0.2em] text-white/80 uppercase">{col.label}</h2>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center">
                  <span className="text-[10px] font-space text-white/40">
                    {tasks.filter(t => t.column === col.id).length}
                  </span>
                </div>
              </div>

              <div 
                data-column-id={col.id}
                className="flex-1 bg-white/[0.01] border rounded-[2.5rem] p-4 space-y-4 min-h-[500px] transition-all hover:bg-white/[0.02]"
                style={{ 
                  borderColor: `${col.color}33`,
                  boxShadow: `0 0 20px ${col.color}0d`
                }}
              >
                {tasks.filter(t => t.column === col.id).map(task => (
                  <div id={`task-${task.id}`} key={task.id}>
                    <TaskCard 
                      task={task} 
                      isRecentlyMoved={recentlyMovedTaskId === task.id}
                      onEdit={setEditingTask}
                      onDelete={(id) => setTasks(prev => prev.filter(t => t.id !== id))}
                      onDragStart={(e, id) => e.dataTransfer.setData('taskId', id)}
                    />
                  </div>
                ))}
                
                {tasks.filter(t => t.column === col.id).length === 0 && (
                  <div 
                    className="h-40 flex flex-col items-center justify-center border border-dashed rounded-3xl group/empty transition-all"
                    style={{ borderColor: `${col.color}33` }}
                  >
                    <Terminal 
                      size={20} 
                      className="mb-2 transition-colors" 
                      style={{ color: `${col.color}4d` }}
                    />
                    <span 
                      className="text-[9px] font-space tracking-widest transition-colors"
                      style={{ color: `${col.color}66` }}
                    >
                      SISTEMA EN ESPERA
                    </span>
                  </div>
                )}
                
                <button 
                  onClick={() => setEditingTask(null)}
                  className="w-full py-5 rounded-2xl border-2 border-dashed transition-all text-[11px] font-orbitron font-black tracking-[0.2em] flex items-center justify-center gap-3 group relative overflow-hidden"
                  style={{ 
                    borderColor: `${col.color}40`,
                    color: `${col.color}cc`,
                    backgroundColor: `${col.color}04`,
                    boxShadow: `0 0 10px ${col.color}08`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = col.color;
                    e.currentTarget.style.color = col.color;
                    e.currentTarget.style.backgroundColor = `${col.color}10`;
                    e.currentTarget.style.boxShadow = `0 0 20px ${col.color}30`;
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${col.color}40`;
                    e.currentTarget.style.color = `${col.color}cc`;
                    e.currentTarget.style.backgroundColor = `${col.color}04`;
                    e.currentTarget.style.boxShadow = `0 0 10px ${col.color}08`;
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" /> 
                  <span className="drop-shadow-[0_0_4px_currentColor]">AGREGAR TAREA</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* AIChat ahora con soporte para Modo Mago y Header bajado */}
      <AIChat 
        tasks={tasks} 
        onAddTask={handleSaveTask} 
        isOpen={isAIChatOpen} 
        onClose={() => setIsAIChatOpen(false)} 
        magicMode={magicMode}
        onToggleMagicMode={toggleMagicMode}
      />

      {editingTask !== undefined && (
        <TaskModal 
          task={editingTask} 
          onClose={() => setEditingTask(undefined)} 
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
};

export default App;
