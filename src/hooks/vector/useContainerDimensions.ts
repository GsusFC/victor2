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
    const baseClasses = "relative transition-all duration-300 ease-in-out shadow-lg rounded-lg overflow-hidden";
    
    // Dimensiones diferentes según el tipo de relación de aspecto
    let dimensionClasses = "";
    
    switch (aspectRatio) {
      case '1:1':
        // Formato cuadrado
        dimensionClasses = "h-[600px] w-[600px] mx-auto";
        break;
      case '2:1':
        // Formato panorámico
        dimensionClasses = "h-[600px] w-[1200px] mx-auto";
        break;
      case '16:9':
        // Formato widescreen (16:9 significa que width = height * 16/9)
        dimensionClasses = "h-[600px] w-[1067px] mx-auto";
        break;
      case 'free':
        // Formato libre al 100%
        dimensionClasses = "h-full w-full max-w-full";
        break;
      default:
        // Por defecto usar 16:9
        dimensionClasses = "h-[600px] w-[1067px] mx-auto";
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
