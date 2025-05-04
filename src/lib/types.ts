export type VectorShape = 'curved' | 'straight' | 'semicircle';
export type LineCap = 'butt' | 'round' | 'square';
export type AspectRatio = '1:1' | '16:9' | '2:1';
export type AnimationType = 
  | 'smoothWaves' 
  | 'vortex';
  
// En un futuro se pueden añadir más tipos de animaciones cuando sea necesario

export interface VectorItem {
  id: string;
  element?: SVGElement;
  baseX: number;
  baseY: number;
  currentAngle: number;
  layer: number;
  activationTime: number;
  shape: VectorShape;
  r: number;
  c: number;
  flockId: number;
}

// Interfaces auxiliares para representaciones vectoriales
// Pueden expandirse según sea necesario para futuros patrones de animación

export interface AnimationSettings {
  // Valores generales
  gridRows: number;
  vectorSpacing: number;
  vectorLength: number;
  vectorShape: VectorShape;
  vectorLineCap: LineCap;
  vectorStrokeWidth: number;
  vectorColor: string;
  animationSpeedFactor: number;
  currentAnimationType: AnimationType;
  easingFactor: number;
  aspectRatio: AspectRatio;
  isStrokeVariabilityActive: boolean;
  
  // Valores específicos para las animaciones actuales
  vortexInwardFactor: number;
  seaWaveFrequency: number;
  seaWaveAmplitude: number;
}

export interface ExportData {
  svg: string;
  js: string;
}
