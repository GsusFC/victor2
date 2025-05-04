import type { VectorSettings } from '../core/types';

/**
 * Contexto necesario para calcular el ángulo de un vector en cualquier animación
 */
export interface AnimationContext {
  /** Coordenada X base del vector */
  baseX: number;
  /** Coordenada Y base del vector */
  baseY: number;
  /** Ancho lógico del canvas */
  logicalWidth: number;
  /** Alto lógico del canvas */
  logicalHeight: number;
  /** Factor de tiempo para la animación */
  timeFactor: number;
  /** Configuración global de vectores */
  settings: VectorSettings;
  /** Timestamp actual para animaciones basadas en tiempo absoluto */
  timestamp?: number;
  /** Última vez que se activó un pulso (para centerPulse) */
  lastPulseTime?: number;
}

/**
 * Función que calcula el ángulo para un vector dado su contexto
 */
export type AnimationFunction = (context: AnimationContext) => number;

/**
 * Mapa de tipos de animación a sus funciones correspondientes
 */
export interface AnimationMap {
  [key: string]: AnimationFunction;
}
