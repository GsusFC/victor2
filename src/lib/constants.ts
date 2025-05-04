import type { AspectRatio } from '@/components/vector/core/types';

// Constante para el padding del canvas (marco de respeto)
export const CANVAS_PADDING = 50; // 50px de padding en todos los lados

// Tipos para las opciones de Aspect Ratio
export interface AspectRatioOption {
  value: AspectRatio;
  label: string;
}

// Opciones de Aspect Ratio predefinidas
export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  { value: '1:1', label: 'Cuadrado (1:1)' },
  { value: '16:9', label: 'Estándar (16:9)' },
  { value: '4:3', label: 'Clásico (4:3)' },
  { value: '3:2', label: 'Fotografía (3:2)' },
  { value: '9:16', label: 'Vertical (9:16)' },
  { value: 'free', label: 'Libre' }, // Opción para ratio libre
];
