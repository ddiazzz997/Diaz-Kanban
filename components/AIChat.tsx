
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Terminal, ShieldCheck } from 'lucide-react';
import { Task, ChatMessage } from '../types';
import { getAIChatResponse } from '../services/gemini';

interface AIChatProps {
  tasks: Task[];
  onAddTask: (taskData: Partial<Task>) => void;
  isOpen: boolean;
  onClose: () => void;
  magicMode: boolean;
  onToggleMagicMode: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ tasks, onAddTask, isOpen, onClose, magicMode, onToggleMagicMode }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: '¡Hola, Daniel! Sistema Neural activo. Estoy listo para procesar tus comandos y optimizar tu flujo de trabajo. ¿Cuál es el siguiente objetivo?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const result = await getAIChatResponse(
      messages.concat(userMsg).map(m => ({ role: m.role, content: m.content })),
      tasks
    );

    if (result.functionCalls) {
      for (const fc of result.functionCalls) {
        if (fc.name === 'createTask') {
          onAddTask(fc.args as any);
        }
      }
    }

    const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: result.text };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <div 
      id="ai-assistant-container"
      className={`fixed inset-0 z-[9990] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible scale-110'
      }`}
    >
      {/* Fondo Inmersivo */}
      <div className="absolute inset-0 bg-[#020205] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,136,255,0.08)_0%,_transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0088ff] to-transparent opacity-50 shadow-[0_0_20px_#0088ff]" />
      </div>

      {/* Contenedor Principal */}
      <div className={`relative h-full w-full flex flex-col pt-24 transition-transform duration-700 ease-out ${isOpen ? 'scale-100' : 'scale-90'}`}>
        
        {/* Header Superior */}
        <header className="px-12 py-10 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-6">
            <button 
              id="ai-logo-toggle"
              onClick={onToggleMagicMode}
              className={`logo-container group !w-14 !h-14 ${magicMode ? 'magic-active' : ''}`}
            >
              <div className="logo-ring" />
              <div className="logo-aura" />
              <span className="text-2xl font-orbitron font-black text-white z-[2] select-none">D</span>
              <div className="logo-glow" />
            </button>
            
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-orbitron font-black text-white tracking-[0.2em] uppercase">Daniel Diaz</h2>
                <span className="px-2 py-0.5 rounded-md bg-[#0088ff]/20 text-[#0088ff] text-[9px] font-bold font-orbitron border border-[#0088ff]/30">PRO AI</span>
              </div>
              <div className="flex items-center gap-4 text-white/30 font-space text-[10px] tracking-widest">
                <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-green-500/50" /> PROTOCOLO SEGURO</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span className="text-[#0088ff]/60 font-bold uppercase tracking-widest">TU ASISTENTE DE IA</span>
              </div>
            </div>
          </div>

          <button 
            id="close-ai-platform"
            onClick={onClose}
            className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/60 hover:text-white"
          >
            <span className="text-[10px] font-orbitron font-bold tracking-widest uppercase">CERRAR PLATAFORMA</span>
            <X size={20} className="group-hover:rotate-90 transition-transform" />
          </button>
        </header>

        {/* Área Central */}
        <div className="flex-1 flex justify-center overflow-hidden">
          <div className="w-full max-w-4xl flex flex-col px-6 h-full">
            <div 
              ref={scrollRef} 
              className="flex-1 overflow-y-auto py-12 space-y-10 custom-scrollbar mask-gradient-v"
            >
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] group ${msg.role === 'user' ? 'flex flex-col items-end' : 'flex gap-6 items-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                        <Bot size={20} className="text-white/40" />
                      </div>
                    )}
                    <div>
                      <span className={`text-[9px] font-orbitron tracking-[0.2em] mb-3 block font-bold ${msg.role === 'user' ? 'text-white/20 text-right' : 'text-[#0088ff]'}`}>
                        {msg.role === 'user' ? 'DANIEL DIAZ' : 'DÍAZ CORE OS'}
                      </span>
                      <div className={`px-8 py-6 rounded-[2rem] text-base font-exo leading-relaxed shadow-2xl transition-all ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-[#0088ff] to-[#004488] text-white rounded-tr-none border border-white/20' 
                          : 'bg-white/[0.03] border border-white/10 text-white/90 rounded-tl-none backdrop-blur-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-6 items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#0088ff]/10 border border-[#0088ff]/20 flex items-center justify-center shrink-0">
                    <Terminal size={18} className="text-[#0088ff] animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[9px] font-orbitron text-[#0088ff] mb-3 block tracking-widest animate-pulse font-bold uppercase">ANALIZANDO DATOS...</span>
                    <div className="flex gap-2 p-4 bg-white/5 rounded-2xl rounded-tl-none border border-white/5">
                      <div className="w-2 h-2 bg-[#0088ff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-[#0088ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-[#0088ff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input de Comandos */}
            <div className="py-12 shrink-0">
              <div className="relative group max-w-3xl mx-auto z-[9995]">
                <input 
                  type="text"
                  id="ai-command-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Transmitir comando de voz o texto..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-[2.5rem] px-10 py-7 text-lg text-white focus:outline-none focus:border-[#0088ff] focus:bg-white/[0.07] transition-all pr-32 placeholder:text-white/15 font-exo shadow-[0_0_40px_rgba(0,0,0,0.4)]"
                />
                
                {/* Botón enviar con hitbox mejorado para el puntero */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <button 
                    id="send-command-btn"
                    onClick={handleSend}
                    disabled={isTyping || !input.trim()}
                    className="w-16 h-16 rounded-full bg-[#0088ff] text-white flex items-center justify-center hover:scale-110 hover:shadow-[0_0_30px_rgba(0,136,255,0.6)] active:scale-95 transition-all disabled:opacity-20 disabled:grayscale z-[9998] relative"
                  >
                    <Send size={24} />
                    {/* Hitbox invisible más grande para facilitar el apuntado con la mano */}
                    <div className="absolute -inset-6 bg-transparent rounded-full" />
                  </button>
                </div>
              </div>
              <p className="text-center mt-6 text-[10px] font-space text-white/15 tracking-[0.4em] uppercase">
                Interfaz de Control Neuronal // Daniel Diaz OS Edition
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .mask-gradient-v {
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,136,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,136,255,0.3); }
      `}</style>
    </div>
  );
};

export default AIChat;
