import type { VectorItem } from './types';

/**
 * Tipo extendido para vectores que incluye propiedades de animación
 */
export interface ExtendedVectorItem extends VectorItem {
  targetAngle?: number;
  layer: number;
  activationTime: number;
}