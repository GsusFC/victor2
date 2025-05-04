import React, { useRef, useCallback, useEffect } from 'react'; // useState ya no se usa
import Victor from 'victor'; // Importar Victor, ahora sí es necesario
import { useVectorStore } from '@/lib/store';
// Tipos necesarios, incluyendo ExtendedVectorItem
import { type ExtendedVectorItem } from '@/components/vector/core/vectorTypes';
// Corregir rutas de importación de Hooks
import { useContainerDimensions } from '@/hooks/vector/useContainerDimensions';
import { useVectorGrid } from '@/hooks/vector/useVectorGrid';
import { useVectorAnimation } from '@/hooks/vector/useVectorAnimation';
import { AspectRatioControl } from './ui/AspectRatioControl'; 
 
const VectorCanvasSVG: React.FC = () => {
  const settings = useVectorStore((state) => state.settings);
  // Seleccionar estado y acciones necesarias del store
  const svgLines = useVectorStore((state) => state.svgLines); // Tipo inferido: ExtendedVectorItem[]
  const setCalculatedValues = useVectorStore((state) => state.setCalculatedValues);
  const setSvgLines = useVectorStore((state) => state.setSvgLines);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null); // Ref para el SVG
  // Usar getContainerClasses()
  const { dimensions, getContainerClasses } = useContainerDimensions({
    containerRef,
    aspectRatio: settings.aspectRatio,
  });
  // Reemplazar useState con useRef para mousePosition
  const mouseRef = useRef<Victor | null>(null);
  const lastMouseMoveTimeRef = useRef<number>(0); // Para limitar la frecuencia
  const animationFrameRef = useRef<number | null>(null);

  // Pasar props correctas a useVectorGrid
  const { initializeVectorGrid } = useVectorGrid({ 
    dimensions,
    settings,
    setSvgLines,
    setCalculatedValues,
  });
  const { calculateTargetAngle } = useVectorAnimation(settings);

  // --- Helper para limpiar el requestAnimationFrame ---
  const clearAnimationFrameHelper = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Inicializar o reinicializar la cuadrícula y limpiar animación
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      initializeVectorGrid();
    }
    // Añadir dependencia faltante y limpiar
    return clearAnimationFrameHelper;
  }, [dimensions.width, dimensions.height, initializeVectorGrid, clearAnimationFrameHelper]); 

  // --- Animación principal: Actualiza el estado de los vectores (ángulos) ---
  const runAnimationLoop = useCallback(() => {
    clearAnimationFrameHelper(); 

    // Añadir timestamp
    const animate = (timestamp: number) => {
      // Usar forma funcional para evitar dependencia de svgLines
      useVectorStore.setState((state) => ({
        svgLines: state.svgLines.map((item: ExtendedVectorItem) => {
          // Usar mouseRef.current directamente
          const targetAngle = calculateTargetAngle(item, mouseRef.current, dimensions, timestamp);
          
          // Interpolación del ángulo
          let angleDiff = targetAngle - item.currentAngle;
          // Normalizar diferencia para la ruta más corta (-180 a 180)
          while (angleDiff <= -180) angleDiff += 360;
          while (angleDiff > 180) angleDiff -= 360;

          const easedAngle = item.currentAngle + angleDiff * settings.easingFactor;

          // Devolver el item actualizado con el nuevo ángulo
          return {
            ...item,
            currentAngle: easedAngle % 360, // Mantener ángulo en 0-360
          } as ExtendedVectorItem; // <-- Aserción aquí
        })
      }));

      // Solicitar el siguiente frame
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Iniciar bucle
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [
    settings.easingFactor,
    calculateTargetAngle, 
    dimensions, // Añadir dimensions como dependencia si se usa en calculateTargetAngle
    clearAnimationFrameHelper
  ]);

  // Efecto para iniciar la animación
  useEffect(() => {
    if (svgLines.length > 0) { // Solo iniciar si hay líneas
      runAnimationLoop();
    }
    // Limpiar al desmontar o si las dependencias cambian
    return clearAnimationFrameHelper;
  }, [svgLines.length, runAnimationLoop, clearAnimationFrameHelper]); // Depende de si hay líneas y del loop

  // --- Manejadores de Eventos ---
  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    // Usar svgRef y limitar frecuencia
    if (!svgRef.current) return;

    const now = performance.now();
    // Limitar a ~60fps (16.67ms) - ajustar según sea necesario
    if (now - lastMouseMoveTimeRef.current < 16.67) return; 
    lastMouseMoveTimeRef.current = now;

    const svgRect = svgRef.current.getBoundingClientRect();
    const svgX = event.clientX - svgRect.left;
    const svgY = event.clientY - svgRect.top;
    const clientWidth = svgRect.width;
    const clientHeight = svgRect.height;

    // Calcular coordenadas lógicas dentro del viewBox del SVG
    const mouseX = (svgX / clientWidth) * dimensions.width;
    const mouseY = (svgY / clientHeight) * dimensions.height;
    // Actualizar el ref en lugar del estado
    mouseRef.current = new Victor(mouseX, mouseY);
  }, [dimensions.width, dimensions.height]); // Depende de dimensions para el cálculo

  const handleMouseLeave = useCallback(() => {
    // Actualizar el ref
    mouseRef.current = null;
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div
        ref={containerRef}
        className={`${getContainerClasses()} bg-background`} // Llamar a la función
        style={{ backgroundColor: settings.backgroundColor }}
      >
        <svg
          ref={svgRef} // Asignar ref al SVG
          className="absolute top-0 left-0 w-full h-full block align-middle overflow-hidden" // Añadir overflow-hidden aquí?
          preserveAspectRatio="xMidYMid meet"
          viewBox={`0 0 ${dimensions.width || 100} ${dimensions.height || 100}`}
          xmlns="http://www.w3.org/2000/svg"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs />
          <g>
            {/* Renderizado: Calcular puntos x1,y1,x2,y2 en base al estado del vector */}
            {svgLines.map((item) => {
              const angleRad = item.currentAngle * (Math.PI / 180);
              const x1 = item.baseX;
              const y1 = item.baseY;
              const x2 = item.baseX + Math.cos(angleRad) * settings.vectorLength;
              const y2 = item.baseY + Math.sin(angleRad) * settings.vectorLength;
              return (
                <line
                  key={item.id} // Usar ID único del item
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={settings.vectorColor}
                  strokeWidth={settings.vectorWidth}
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        </svg>
      </div>
      {/* El componente AspectRatioControl maneja su estado internamente */}
      <AspectRatioControl /> 
    </div>
  );
};

export default VectorCanvasSVG;
