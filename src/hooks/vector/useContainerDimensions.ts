import { useState, useCallback, useEffect } from 'react';
import type { AspectRatio } from '@/components/vector/core/types';

interface UseContainerDimensionsProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  aspectRatio: AspectRatio;
}

/**
 * Hook para manejar las dimensiones del contenedor y clases CSS
 */
export const useContainerDimensions = ({ containerRef, aspectRatio }: UseContainerDimensionsProps) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  /**
   * Actualiza las dimensiones basándose en el tamaño del contenedor
   */
  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;
    
    const { clientWidth, clientHeight } = containerRef.current;
    setDimensions({ width: clientWidth, height: clientHeight });
  }, [containerRef]);

  /**
   * Obtiene las clases CSS para el contenedor según la relación de aspecto
   * Usamos clases nativas de Tailwind para el aspect-ratio, como en el componente de prueba
   */
  const getContainerClasses = useCallback(() => {
    // Clases base que se aplican siempre 
    const baseClasses = "relative mx-auto transition-all duration-300 ease-in-out shadow-lg rounded-lg overflow-hidden";
    
    // Altura fija de 600px para todas las relaciones de aspecto
    // El ancho se calcula en función de la relación de aspecto
    let dimensionClasses = "";
    
    switch (aspectRatio) {
      case '1:1':
        // Para 1:1 (cuadrado), el ancho también es 600px
        dimensionClasses = "h-[600px] w-[600px]";
        break;
      case '2:1':
        // Para 2:1, el ancho es el doble de la altura: 1200px
        dimensionClasses = "h-[600px] w-[1200px]";
        break;
      case '16:9':
        // Para 16:9, el ancho es aproximadamente 1067px (600 * 16/9)
        dimensionClasses = "h-[600px] w-[1067px]";
        break;
      case 'free':
        // Para tamaño libre, mantenemos solo la altura
        dimensionClasses = "h-[600px] w-full max-w-full";
        break;
      default:
        // Por defecto usar 16:9
        dimensionClasses = "h-[600px] w-[1067px]";
        break;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[useContainerDimensions] Aplicando aspectRatio=${aspectRatio}, dimensiones=${dimensionClasses}`);
    }
    return `${baseClasses} ${dimensionClasses}`;
  }, [aspectRatio]);

  // Configurar observer de redimensionamiento
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [containerRef, updateDimensions]);

  // Actualizar dimensiones iniciales
  useEffect(() => {
    updateDimensions();
  }, [updateDimensions]);

  return {
    dimensions,
    getContainerClasses,
    updateDimensions,
  };
};
