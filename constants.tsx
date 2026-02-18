
import React from 'react';

export const COLORS = {
  bg: '#000000',
  bgAlt: '#050505',
  accent: '#a855f7',
  cyan: '#0088ff', // Azul real
  gold: '#ffaa00',
  yellow: '#facc15',
  red: '#ff3366',
  green: '#00ff88',
};

export const COLUMNS = [
  { id: 'pending', label: 'PENDIENTE', color: COLORS.red },
  { id: 'progress', label: 'EN PROGRESO', color: COLORS.yellow },
  { id: 'done', label: 'COMPLETADO', color: COLORS.green },
] as const;

export const PRIORITY_LABELS: Record<string, { label: string, color: string }> = {
  low: { label: 'BAJA', color: COLORS.green },
  medium: { label: 'MEDIA', color: COLORS.gold },
  high: { label: 'ALTA', color: COLORS.red },
};
