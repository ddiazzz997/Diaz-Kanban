
import React, { useEffect, useRef, useState } from 'react';
import { Task, ColumnType } from '../types';

interface MagicModeOverlayProps {
  tasks: Task[];
  onMagicDrop: (taskId: string, columnId: ColumnType) => void;
}

const MagicModeOverlay: React.FC<MagicModeOverlayProps> = ({ tasks, onMagicDrop }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [grabbedTaskId, setGrabbedTaskId] = useState<string | null>(null);
  const [handPos, setHandPos] = useState({ x: 0, y: 0 });
  const [targetColumn, setTargetColumn] = useState<ColumnType | null>(null);
  
  const [isPointerMode, setIsPointerMode] = useState(false);
  const [targetElementId, setTargetElementId] = useState<string | null>(null);
  
  const tasksRef = useRef(tasks);
  const onMagicDropRef = useRef(onMagicDrop);
  const grabbedTaskIdRef = useRef<string | null>(null);
  const targetColumnRef = useRef<ColumnType | null>(null);
  
  // Refs para el sistema de dwell (clic por inmovilidad)
  const dwellStartTimeRef = useRef<number | null>(null);
  const lastSteadyPosRef = useRef({ x: 0, y: 0 });
  const smoothPosRef = useRef({ x: 0, y: 0 });

  // Constantes de configuración
  const STILLNESS_THRESHOLD = 35; // Mayor tolerancia para un clic más natural
  const DWELL_DURATION = 500;     // Medio segundo como solicitó el usuario

  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  useEffect(() => { onMagicDropRef.current = onMagicDrop; }, [onMagicDrop]);
  useEffect(() => { grabbedTaskIdRef.current = grabbedTaskId; }, [grabbedTaskId]);
  useEffect(() => { targetColumnRef.current = targetColumn; }, [targetColumn]);

  useEffect(() => {
    if (!videoRef.current) return;

    let active = true;
    const hands = new (window as any).Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults((results: any) => {
      if (!active) return;
      
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        const base = landmarks[0];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];

        const getDist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        
        const dIndex = getDist(indexTip, base);
        const dMiddle = getDist(middleTip, base);
        const dRing = getDist(ringTip, base);

        // Detectar si está en modo puntero (dedo índice extendido)
        const pointerDetected = dIndex > 0.18 && dMiddle < 0.20 && dRing < 0.20;
        const isFist = dIndex < 0.15 && dMiddle < 0.15 && dRing < 0.15;
        
        setIsPointerMode(pointerDetected);

        const rawX = (1 - landmarks[pointerDetected ? 8 : 9].x) * window.innerWidth;
        const rawY = landmarks[pointerDetected ? 8 : 9].y * window.innerHeight;

        // Suavizado de posición para que el puntero se sienta "de seda"
        smoothPosRef.current.x += (rawX - smoothPosRef.current.x) * 0.4;
        smoothPosRef.current.y += (rawY - smoothPosRef.current.y) * 0.4;

        const x = smoothPosRef.current.x;
        const y = smoothPosRef.current.y;
        setHandPos({ x, y });

        if (pointerDetected) {
          setGrabbedTaskId(null);
          setHighlightedTaskId(null);

          // Lógica de Dwell invisible (0.5s de inmovilidad)
          const distFromLastSteady = Math.sqrt(
            Math.pow(x - lastSteadyPosRef.current.x, 2) + 
            Math.pow(y - lastSteadyPosRef.current.y, 2)
          );

          if (distFromLastSteady > STILLNESS_THRESHOLD) {
            dwellStartTimeRef.current = Date.now();
            lastSteadyPosRef.current = { x, y };
            setTargetElementId(null);
          } else {
            const elapsed = Date.now() - (dwellStartTimeRef.current || Date.now());

            const elementUnder = document.elementFromPoint(x, y);
            const interactiveEl = elementUnder?.closest('button, input, textarea, a, [role="button"]');
            setTargetElementId(interactiveEl?.id || null);

            if (elapsed >= DWELL_DURATION && dwellStartTimeRef.current !== null) {
              if (elementUnder) {
                (elementUnder as HTMLElement).click();
                if (elementUnder instanceof HTMLInputElement || elementUnder instanceof HTMLTextAreaElement) {
                  elementUnder.focus();
                }
              }

              // Feedback visual de clic (Ripple azul rápido)
              const ripple = document.createElement('div');
              ripple.className = `fixed rounded-full pointer-events-none animate-ping z-[10001] bg-[#0088ff]/80`;
              ripple.style.left = `${x - 50}px`;
              ripple.style.top = `${y - 50}px`;
              ripple.style.width = '100px';
              ripple.style.height = '100px';
              document.body.appendChild(ripple);
              setTimeout(() => ripple.remove(), 600);

              dwellStartTimeRef.current = Date.now();
            }
          }
        } else {
          setTargetElementId(null);
          dwellStartTimeRef.current = null;

          if (!isFist) {
            if (grabbedTaskIdRef.current) {
              if (targetColumnRef.current) {
                onMagicDropRef.current(grabbedTaskIdRef.current, targetColumnRef.current);
              }
              setGrabbedTaskId(null);
            }
            
            let nearestId: string | null = null;
            let minDist = Infinity;
            tasksRef.current.forEach(task => {
              const el = document.getElementById(`task-${task.id}`);
              if (el) {
                const rect = el.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const d = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                if (d < minDist && d < 300) {
                  minDist = d;
                  nearestId = task.id;
                }
              }
            });
            setHighlightedTaskId(nearestId);
          }

          if (isFist && !grabbedTaskIdRef.current) {
            setHighlightedTaskId(current => {
              if (current) setGrabbedTaskId(current);
              return current;
            });
          }

          const colElements = document.querySelectorAll('[data-column-id]');
          let currentCol: ColumnType | null = null;
          colElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right) {
              currentCol = el.getAttribute('data-column-id') as ColumnType;
            }
          });
          setTargetColumn(currentCol);
        }
      } else {
        setHighlightedTaskId(null);
        setTargetElementId(null);
        setIsPointerMode(false);
        dwellStartTimeRef.current = null;
      }
    });

    const camera = new (window as any).Camera(videoRef.current, {
      onFrame: async () => {
        if (active && videoRef.current) {
          try {
            await hands.send({ image: videoRef.current });
          } catch (e) {
            console.warn("MediaPipe camera error:", e);
          }
        }
      },
      width: 1280,
      height: 720
    });
    camera.start();

    return () => {
      active = false;
      camera.stop();
      try {
        hands.close();
      } catch (e) {
        console.error("Error closing hands:", e);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden select-none">
      <video 
        ref={videoRef} 
        className="absolute inset-0 w-full h-full object-cover opacity-[0.2] scale-x-[-1] blur-[1.5px]" 
        autoPlay 
        muted 
        playsInline 
      />

      <div 
        className="absolute flex items-center justify-center z-[10001] will-change-transform"
        style={{ 
          left: handPos.x, 
          top: handPos.y, 
          transform: `translate(-50%, -50%)`,
        }}
      >
        {isPointerMode ? (
          <div className="relative flex items-center justify-center">
            {/* Puntero Minimalista y Natural */}
            <div className={`absolute w-10 h-10 flex items-center justify-center transition-all duration-300 ${targetElementId ? 'scale-125' : 'scale-100'}`}>
              <div className="absolute w-full h-[1.5px] bg-[#0088ff] shadow-[0_0_15px_#0088ff]" />
              <div className="absolute h-full w-[1.5px] bg-[#0088ff] shadow-[0_0_15px_#0088ff]" />
            </div>
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_15px_white]" />
          </div>
        ) : (
          <div 
            className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${grabbedTaskId ? 'scale-75 bg-[#0088ff]/40 border-[#0088ff] shadow-[0_0_80px_#0088ff]' : 'border-[#0088ff]/60 shadow-[0_0_30px_rgba(0,136,255,0.3)]'}`}
          >
            <div className={`w-3 h-3 rounded-full ${grabbedTaskId ? 'bg-white scale-150 animate-pulse' : 'bg-[#0088ff] opacity-60'}`} />
          </div>
        )}
      </div>

      <style>{`
        ${highlightedTaskId ? `
          #task-${highlightedTaskId} {
            border-color: #0088ff !important;
            box-shadow: 0 0 80px rgba(0, 136, 255, 0.7) !important;
            transform: scale(1.08) translateY(-10px) !important;
            z-index: 100 !important;
          }
        ` : ''}
        ${grabbedTaskId ? `
          #task-${grabbedTaskId} {
            position: fixed !important;
            left: ${handPos.x}px !important;
            top: ${handPos.y}px !important;
            width: 380px !important;
            transform: translate(-50%, -50%) scale(0.85) rotate(-1deg) !important;
            z-index: 10000 !important;
            pointer-events: none !important;
            box-shadow: 0 80px 160px rgba(0,0,0,0.9), 0 0 100px rgba(0, 136, 255, 0.8) !important;
            opacity: 0.9 !important;
          }
        ` : ''}
        ${targetColumn && !isPointerMode ? `
          [data-column-id="${targetColumn}"] {
            background: rgba(0, 136, 255, 0.1) !important;
            border-color: #0088ff !important;
            box-shadow: inset 0 0 80px rgba(0, 136, 255, 0.05) !important;
          }
        ` : ''}
        ${targetElementId ? `
          #${targetElementId} {
            outline: 3px solid #0088ff !important;
            outline-offset: 4px !important;
            box-shadow: 0 0 40px rgba(0, 136, 255, 0.7) !important;
            z-index: 9999 !important;
            transform: scale(1.05) !important;
          }
        ` : ''}
      `}</style>
    </div>
  );
};

export default MagicModeOverlay;
