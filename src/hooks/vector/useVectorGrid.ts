import { useCallback } from 'react';
import type { ExtendedVectorItem } from '@/components/vector/core/vectorTypes';
import type { VectorSettings } from '@/components/vector/core/types';

interface UseVectorGridProps {
  dimensions: { width: number; height: number };
  settings: VectorSettings;
  setCalculatedValues: (gridCols: number, width: number, height: number) => void;
  setSvgLines: (vectors: ExtendedVectorItem[]) => void;
}

/**
 * Hook para manejar la inicialización y actualización del grid de vectores
 */
export const useVectorGrid = ({
  dimensions,
  settings,
  setCalculatedValues,
  setSvgLines,
}: UseVectorGridProps) => {
  
  /**
   * Inicializa el grid de vectores basado en las dimensiones  // Función para inicializar o actualizar el grid de vectores
   */
  const initializeVectorGrid = useCallback(() => {
    // Evitar inicialización si las dimensiones o los settings no están disponibles
    if (!dimensions || !dimensions.width || !dimensions.height || !settings) {
      console.warn("[useVectorGrid] Dimensiones o settings no disponibles para inicializar el grid");
      return;
    }
    
    console.log("[DEBUG] Inicializando vector grid con dimensiones:", dimensions);
    
    const { width, height } = dimensions;

    if (width === 0 || height === 0) {
      setSvgLines([]); // Asegurar que se establece vacío si las dimensiones son 0
      return [];
    }
    
    const { vectorShape } = settings;
    // Validación de valores como en el original
    const gridRows = settings.gridRows !== undefined && settings.gridRows >= 3 ? settings.gridRows : 10;
    
    // Usar directamente las dimensiones reales del canvas
    const canvasHeight = height;
    const canvasWidth = width;
    
    // Calcular el espaciado real para una distribución uniforme
    const actualSpacingY = canvasHeight / (gridRows);
    const gridCols = Math.floor(canvasWidth / actualSpacingY);
    const actualSpacingX = canvasWidth / (gridCols);
    
    // Usar los valores calculados para determinar el centro
    console.log(`Grid: ${gridRows}x${gridCols}, SpacingX: ${actualSpacingX}, SpacingY: ${actualSpacingY}`);
    
    // Calcular índices centrales para efectos de animación basados en el centro
    const centerColIndex = Math.floor((gridCols - 1) / 2);
    const centerRowIndex = Math.floor((gridRows - 1) / 2);

    
    // Actualizar valores calculados en el store con las dimensiones reales
    setCalculatedValues(gridCols, canvasWidth, canvasHeight);
    
    // Crear un array de vectores con posiciones iniciales
    const vectors: ExtendedVectorItem[] = [];
    
    // Nota: La longitud del vector se toma directamente de settings.vectorLength en el componente VectorRenderer
    for (let r = 0; r < gridRows; r++) {

      for (let c = 0; c < gridCols; c++) {
        // Posición base usando el espaciado real calculado
        const baseX = (c + 0.5) * actualSpacingX;
        const baseY = (r + 0.5) * actualSpacingY;
        
        // Calcular capa basada en la distancia al centro (para animations como ondas expandiéndose)
        const layer = Math.max(Math.abs(c - centerColIndex), Math.abs(r - centerRowIndex));
        
        // Tiempo de activación basado en la capa (para animaciones secuenciales)
        const activationTime = Date.now() + layer * 200; // 200ms de retraso entre capas
        
        // Ángulo inicial (puede ser aleatorio o fijo según se requiera)
        const initialAngle = Math.random() * 360;
        
        // El componente VectorRenderer usa settings.vectorLength para renderizar el vector

        // Crear objeto vector con estructura correcta según VectorItem
        vectors.push({
          id: `vector-${r}-${c}`,
          r, // Fila
          c, // Columna
          baseX, // Posición X base
          baseY, // Posición Y base
          currentAngle: initialAngle,
          targetAngle: initialAngle, // Para ExtendedVectorItem
          shape: vectorShape, // Forma del vector
          flockId: Math.floor(Math.random() * 5), // Asignar un ID de bandada aleatorio (0-4)
          layer: layer, // Capa basada en distancia al centro
          activationTime: activationTime // Tiempo de activación secuencial
        });
      }
    }
    
    // Actualizar estado global
    setSvgLines(vectors);
    return vectors;
  }, [dimensions, settings, setCalculatedValues, setSvgLines]);

  return {
    initializeVectorGrid,
  };
};
