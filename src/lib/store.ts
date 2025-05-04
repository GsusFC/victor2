import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  PartialVectorSettings, 
  VectorSettings, 
  BaseVectorSettings, 
  AnimationVectorSettings, 
  AnimationType, 
  VectorShape,
  LineCap,
  AspectRatio
} from '@/components/vector/core/types';
import { ExtendedVectorItem } from '@/components/vector/core/vectorTypes';
import { produce } from 'immer'; // Necesario para merge inmutable

// Tipos de datos para el store
export interface VectorStore extends VectorStoreState {
  // Acciones
  setSettings: (newSettings: PartialVectorSettings & { currentAnimationType?: never } | { currentAnimationType: AnimationType; animationType: AnimationType }) => void;
  setSvgLines: (lines: ExtendedVectorItem[]) => void;
  updateVectorAngle: (id: string, angle: number) => void;
  setAnimationFrameId: (id: number | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setCalculatedValues: (gridCols: number, width: number, height: number) => void;
  resetSettings: () => void;
  resetStore: () => void;
  setPinwheelCenters: (centers: PinwheelCenter[]) => void;
  setLastPulseTime: (time: number) => void;
}

// Valores por defecto para animaciones
export const defaultAnimationSettings: Omit<AnimationVectorSettings, keyof BaseVectorSettings> = {
  animationType: 'smoothWaves' as AnimationType,
  currentAnimationType: 'smoothWaves' as AnimationType,
  seaWaveFrequency: 0.02,
  seaWaveAmplitude: 30,
  perlinNoiseScale: 0.02,
  perlinNoiseSpeed: 0.002,
  mouseAttractionRadius: 100,
  mouseAttractionStrength: 1,
  pulseDuration: 2000
};

// Valores por defecto para configuración básica
export const defaultBaseSettings: BaseVectorSettings = {
  vectorLength: 20,
  vectorWidth: 2, // Valor por defecto para el grosor de los vectores
  vectorSpacing: 30,
  gridRows: 10,
  vectorColor: '#ffffff',
  vectorShape: 'line' as VectorShape,
  strokeLinecap: 'round' as LineCap,
  animationSpeed: 1,
  backgroundColor: '#000000',
  mouseAttraction: false,
  aspectRatio: '16:9' as AspectRatio,
  animationSpeedFactor: 1,
  easingFactor: 0.1,
  useAdvancedControls: false,
  vectorLineCap: 'butt', // Valor por defecto para LineCap
  vectorStrokeWidth: 1,
  isStrokeVariabilityActive: false,
  pinwheelCount: 5,
  vortexInwardFactor: 0.01,
  jitterIntensity: 0.1,
  pulseInterval: 1000, // Valor por defecto para pulseInterval
};

// Configuración completa por defecto
export const defaultSettings: VectorSettings = {
  ...defaultBaseSettings,
  ...defaultAnimationSettings,
  isPaused: false, // Estado inicial de pausa
};

// Definición explícita del estado base sin las acciones
interface VectorStoreState {
  svgLines: ExtendedVectorItem[];
  vectorGridMap: Map<string, number>;
  animationFrameId: number | null;
  isLoading: boolean;
  error: string | null;
  calculatedGridCols: number;
  logicalWidth: number;
  logicalHeight: number;
  settings: VectorSettings;
  pinwheelCenters: PinwheelCenter[];
  lastPulseTime: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  calculatedValues: Record<string, any>;
}

type PinwheelCenter = { x: number; y: number; vx: number; vy: number };

// Estado inicial base
const initialState: VectorStoreState = {
  svgLines: [],
  vectorGridMap: new Map<string, number>(),
  animationFrameId: null,
  isLoading: false,
  error: null,
  calculatedGridCols: 0,
  logicalWidth: 0,
  logicalHeight: 0,
  settings: { ...defaultSettings },
  pinwheelCenters: [],
  lastPulseTime: 0,
  calculatedValues: {}
};

// Crear store
const createVectorStore = () => create<VectorStore>()(persist(
  (set) => ({
    ...initialState,
    settings: defaultSettings,
    svgLines: initialState.svgLines,
    vectorGridMap: initialState.vectorGridMap,
    animationFrameId: initialState.animationFrameId,
    pinwheelCenters: initialState.pinwheelCenters,
    lastPulseTime: initialState.lastPulseTime,
    calculatedValues: initialState.calculatedValues,
    isLoading: initialState.isLoading,
    error: initialState.error,

    setSettings: (newSettings: PartialVectorSettings & { currentAnimationType?: never } | { currentAnimationType: AnimationType; animationType: AnimationType }) =>
      set((state) => ({
        settings: {
          ...state.settings,
          ...newSettings
        }
      })),
    
    setSvgLines: (lines: ExtendedVectorItem[]) =>
      set(() => ({ svgLines: lines })),

    updateVectorAngle: (id: string, angle: number) =>
      set((state) => {
        const newSvgLines = state.svgLines.map(line => 
          line.id === id ? { ...line, currentAngle: angle } : line
        );
        const newVectorGridMap = new Map(state.vectorGridMap);
        const index = newSvgLines.findIndex(line => line.id === id);
        if (index !== -1) {
          newVectorGridMap.set(id, index); 
        }
        return {
          svgLines: newSvgLines,
          vectorGridMap: newVectorGridMap 
        }
      }),

    setAnimationFrameId: (id: number | null) =>
      set(() => ({ animationFrameId: id })),

    setIsLoading: (isLoading: boolean) =>
      set(() => ({ isLoading })),

    setError: (error: string | null) =>
      set(() => ({ error })),

    setCalculatedValues: (gridCols: number, width: number, height: number) =>
      set(() => ({
        calculatedGridCols: gridCols,
        logicalWidth: width,
        logicalHeight: height
      })),

    resetSettings: () =>
      set(() => ({ settings: defaultSettings })),

    resetStore: () =>
      set(() => ({
        ...initialState,
        settings: defaultSettings
      })),

    setPinwheelCenters: (centers: PinwheelCenter[]) =>
      set(() => ({ pinwheelCenters: centers })),

    setLastPulseTime: (time: number) =>
      set(() => ({ lastPulseTime: time })),
  }),
  {
    name: 'vector-store',
    storage: createJSONStorage(() => localStorage),
    merge: (persistedState, currentState) => {
      const mergedState = produce(currentState, draft => {
        const pState = persistedState as VectorStoreState; // Type assertion
        // Sobrescribir solo las partes del estado que deben persistir
        if (pState.settings) {
          // Validar vectorShape
          const validShapes: VectorShape[] = ['line', 'arrow', 'dot', 'triangle'];
          if (!validShapes.includes(pState.settings.vectorShape)) {
            console.warn(`Invalid persisted vectorShape '${pState.settings.vectorShape}', resetting to '${defaultSettings.vectorShape}'.`);
            draft.settings.vectorShape = defaultSettings.vectorShape;
          } else {
            draft.settings.vectorShape = pState.settings.vectorShape;
          }

          // Validar aspectRatio
          const validAspectRatios: AspectRatio[] = ['16:9', '1:1', '2:1'];
          if (!validAspectRatios.includes(pState.settings.aspectRatio)) {
            console.warn(`Invalid persisted aspectRatio '${pState.settings.aspectRatio}', resetting to '${defaultSettings.aspectRatio}'.`);
            draft.settings.aspectRatio = defaultSettings.aspectRatio;
          } else {
            draft.settings.aspectRatio = pState.settings.aspectRatio;
          }
          // Copiar otros settings persistidos si existen
          // (Asegúrate de copiar solo lo que quieres persistir)
          Object.assign(draft.settings, pState.settings);
          // Re-aplicar el valor validado/por defecto por si Object.assign lo sobrescribió mal
          draft.settings.vectorShape = validShapes.includes(pState.settings.vectorShape) ? pState.settings.vectorShape : defaultSettings.vectorShape;
        }
        // Podrías persistir/validar otros estados aquí si fuese necesario
        // draft.someOtherState = pState.someOtherState ?? currentState.someOtherState;
      });
      return mergedState;
    },
    partialize: (state) => (
      {
        settings: state.settings // Solo persistir settings
        // No persistir: svgLines, vectorGridMap, animationFrameId, etc.
      }
    )
  }
));

// Función para limpiar el localStorage para debugging
export const clearVectorStore = () => {
  // Solo ejecutar en el cliente, no en el servidor
  if (typeof window !== 'undefined') {
    localStorage.removeItem('vector-store');
    console.log('Vector store localStorage limpiado.');
  }
};

// Limpiar el localStorage al inicio (solo en cliente)
// COMENTAR ESTA LÍNEA CUANDO TODO FUNCIONE
if (typeof window !== 'undefined') {
  clearVectorStore();
}

// Exportar instancia del store
export const useVectorStore = createVectorStore();

// Selectores para optimización
export const selectSettings = (state: VectorStore) => state.settings;
export const selectSvgLines = (state: VectorStore) => state.svgLines;
export const selectAnimationState = (state: VectorStore) => ({
  animationFrameId: state.animationFrameId
});
export const selectApplicationState = (state: VectorStore) => ({
  isLoading: state.isLoading,
  error: state.error
});
