/**
 * Definición de tipos para el sistema de visualización de vectores
 */

// Tipos base
export type VectorShape = 'line' | 'arrow' | 'dot' | 'triangle' | 'semicircle' | 'curve';
export type LineCap = 'butt' | 'round' | 'square'; // Definición de LineCap
// Actualizar para incluir todos los ratios de lib/constants.ts y el control
export type AspectRatio = '1:1' | '16:9' | '4:3' | '3:2' | '9:16' | '2:1' | 'free';

// Tipo para un vector individual
export interface VectorItem {
  id: string;
  baseX: number;
  baseY: number;
  currentAngle: number;
  r: number;
  c: number;
  flockId?: number;
  shape: VectorShape;
  angle: number;      // Ángulo actual en grados
  x1: number;         // Coordenada x del punto de inicio
  y1: number;         // Coordenada y del punto de inicio
  x2: number;         // Coordenada x del punto final
  y2: number;         // Coordenada y del punto final
  color: string;      // Color del vector
  strokeWidth: number; // Grosor del trazo
  strokeLinecap: LineCap; // Estilo del final de la línea (e.g., 'round', 'butt')
}

// Tipos de animación
export const VALID_ANIMATION_TYPES = [
  'smoothWaves',
  'seaWaves',
  'perlinFlow',
  'mouseInteraction',
  'pinwheels',
  'oceanCurrents',
  'jitter',
  'centerPulse',
  'rippleEffect',
  'expandingWave',
  'cellularAutomata',
  'flocking',
  'geometricPattern',
  'tangenteClasica',
  'lissajous',
  'waterfall'
] as const;

export type ValidAnimationType = typeof VALID_ANIMATION_TYPES[number];
export type AnimationType = 
  | 'smoothWaves'
  | 'seaWaves'
  | 'perlinFlow'
  | 'mouseInteraction'
  | 'pinwheels'
  | 'oceanCurrents'
  | 'jitter'
  | 'centerPulse'
  | 'rippleEffect'
  | 'expandingWave'
  | 'cellularAutomata'
  | 'flocking'
  | 'geometricPattern'
  | 'tangenteClasica'
  | 'lissajous'
  | 'waterfall';

export function isValidAnimationType(value: string): value is AnimationType {
  return VALID_ANIMATION_TYPES.includes(value as ValidAnimationType);
}

/**
 * Estructura para almacenar un favorito de animación
 */
export interface AnimationFavorite {
  id: string;          // UUID para identificar cada favorito
  name: string;        // Nombre descriptivo asignado por el usuario
  timestamp: number;   // Fecha de creación/modificación
  settings: Partial<VectorSettings>; // Solo las propiedades relevantes para animación
}

// Helper para validar VectorShape
export const isValidVectorShape = (shape: unknown): shape is VectorShape => {
  return ['line', 'arrow', 'dot', 'triangle', 'semicircle', 'curve'].includes(shape as string);
};

// Tipo para el origen de la rotación del vector
export type RotationOrigin = 'start' | 'center' | 'end';

// Mapa para buscar vectores por coordenadas de rejilla
export type VectorGridMap = Map<string, number>;

// --- Interfaces Principales --- //
export interface PinwheelCenter {
  x: number; // Posición X del centro del pinwheel
  y: number; // Posición Y del centro del pinwheel
  vx?: number; // Velocidad en X (para movimiento del centro)
  vy?: number; // Velocidad en Y (para movimiento del centro)
  strength: number; // Fuerza de atracción/repulsión del pinwheel
  speed: number; // Velocidad de rotación del pinwheel
}

export interface OceanEddy {
  x: number;
  y: number;
  strength: number;
  radius: number;
}

// Tipo extendido para incluir propiedades adicionales usadas en el canvas
export interface ExtendedVectorItem extends VectorItem {
  targetAngle?: number;
  previousAngle?: number; // Almacena el ángulo anterior para calcular velocidad angular
  layer: number;
  activationTime: number;
  lengthFactor?: number; // Factor de longitud dinámico calculado en la animación
  widthFactor?: number; // Factor de grosor dinámico calculado en la animación
  // Otras propiedades que puedan ser necesarias para tipos de animación específicos
}

// Configuración base
export interface BaseVectorSettings {
  vectorLength: number;
  vectorWidth: number; // Añadido para control independiente del grosor
  vectorSpacing: number;
  gridRows: number;
  vectorColor: string;
  vectorShape: VectorShape;
  strokeLinecap: LineCap;
  animationSpeed: number;
  rotationSpeed: number; // Añadido para AnimatedVectorCanvas.tsx
  backgroundColor: string;
  mouseAttraction: boolean;
  aspectRatio: AspectRatio; // Corregido a tipo AspectRatio
  animationSpeedFactor: number;
  easingFactor: number;
  useAdvancedControls: boolean; // Indica si se usan controles avanzados
  vectorLineCap: LineCap;
  vectorStrokeWidth: number;
  isStrokeVariabilityActive: boolean;
  pinwheelCount: number;
  jitterIntensity: number;
  pulseInterval: number; // Añadido para animación 'centerPulse'
  rotationOrigin: RotationOrigin; // Añadido
  dynamicLengthEnabled: boolean; // ¿La longitud varía dinámicamente?
  dynamicLengthIntensity: number; // ¿Cuánto afecta la velocidad a la longitud?
  vortexInwardFactor?: number;
  vectorsPerFlock?: number; // Nueva propiedad añadida
}

// Configuración de animación
export interface AnimationVectorSettings extends BaseVectorSettings {
  animationType: AnimationType;
  currentAnimationType: AnimationType;
  seaWaveFrequency: number;
  seaWaveAmplitude: number;
  perlinNoiseScale: number;
  perlinNoiseSpeed: number;
  mouseAttractionRadius: number;
  mouseAttractionStrength: number;
  pulseDuration: number;
  vortexStrength?: number;
  vortexCenterX?: number;
  vortexCenterY?: number;
  
  // Parámetros para patrón geométrico
  geometricPatternSize?: number;
  geometricPatternComplexity?: number;
  geometricPatternRotationSpeed?: number;
  
  // Parámetros de Lissajous
  lissajousParamA?: number;
  lissajousParamB?: number;
  lissajousFrequency?: number;
  lissajousDelta?: number; // Diferencia de fase
  
  // Parámetros para waterfall (cascada)
  waterfallTurbulence?: number; // Amplitud de la oscilación
  waterfallTurbulenceSpeed?: number; // Velocidad de la turbulencia
  waterfallOffsetFactor?: number; // Factor de desfase para la cascada
  waterfallGravityCycle?: number; // Duración del ciclo de gravedad en ms
  waterfallGravityStrength?: number; // Intensidad del efecto de gravedad
  waterfallMaxStretch?: number; // Estiramiento máximo de los vectores
  waterfallDriftStrength?: number; // Intensidad de la deriva lateral
}

// Tipos de configuración
export interface VectorSettings extends BaseVectorSettings, AnimationVectorSettings {
  isPaused: boolean; // Añadido para controlar la pausa
}

export type PartialVectorSettings = Partial<VectorSettings>;

// Configuración de animación específica
export interface AnimationConfig {
  gridRows: number;
  gridCols: number;
  settings: VectorSettings;
}

// Valores calculados para el canvas SVG
export interface CalculatedValues {
  cols: number;
  svgWidth: number;
  svgHeight: number;
}

// Propiedades del componente SVG
export interface SVGCanvasProps {
  containerRef?: React.RefObject<HTMLDivElement>;
  width?: number;
  height?: number;
  className?: string;
}
