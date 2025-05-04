'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useVectorStore } from '@/lib/store';
import Victor from 'victor';
import type { VectorSettings } from '@/components/vector/core/types';
import type { ExtendedVectorItem } from '@/components/vector/core/vectorTypes';
import { AspectRatioControl } from './ui/AspectRatioControl';
import { useContainerDimensions } from '@/hooks/vector/useContainerDimensions';

/**
 * Componente de canvas de vectores optimizado que evita problemas de renderizado infinito.
 * Usa un enfoque con un estado local independiente de Zustand para la animación.
 */
const NewVectorCanvas: React.FC = () => {
  // Referencias para dimensiones y canvas
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number, y: number } | null>(null);
  const lastPulseTimeRef = useRef<number>(0);
  
  // Leer settings del store
  const settings = useVectorStore((state) => state.settings);
  const settingsRef = useRef<VectorSettings>(settings);
  
  // Acciones que usaremos ocasionalmente (no en cada frame)
  const { setSvgLines, setCalculatedValues, setLastPulseTime } = useVectorStore(
    (state) => state.actions
  );
  
  // Estado local (independiente de Zustand)
  const [vectorItems, setVectorItems] = useState<ExtendedVectorItem[]>([]);
  
  // Usar hook de dimensiones para gestionar relaciones de aspecto
  const { dimensions, getContainerClasses } = useContainerDimensions({
    containerRef,
    aspectRatio: settings.aspectRatio
  });
  
  // Actualizar referencia de settings cuando cambien
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  
  // Guardamos los valores previos para evitar recalcular cuando no sea necesario
  const prevConfigRef = useRef({
    width: dimensions.width,
    height: dimensions.height,
    vectorSpacing: settings.vectorSpacing,
    gridRows: settings.gridRows,
    aspectRatio: settings.aspectRatio
  });

  // Efecto para inicializar vectores - usando la técnica de un solo effect con referencias
  useEffect(() => {
    // Verificar si alguna dependencia importante ha cambiado
    const hasDimensionsChanged = dimensions.width !== prevConfigRef.current.width ||
                                 dimensions.height !== prevConfigRef.current.height;
    
    const hasConfigChanged = settings.vectorSpacing !== prevConfigRef.current.vectorSpacing ||
                             settings.gridRows !== prevConfigRef.current.gridRows ||
                             settings.aspectRatio !== prevConfigRef.current.aspectRatio;
    
    // Solo reinicializar si cambió algo importante
    if (!hasDimensionsChanged && !hasConfigChanged) {
      return;
    }
    
    // Actualizar la referencia
    prevConfigRef.current = {
      width: dimensions.width,
      height: dimensions.height,
      vectorSpacing: settings.vectorSpacing,
      gridRows: settings.gridRows,
      aspectRatio: settings.aspectRatio
    };
    
    // Inicializar vectores
    const initializeVectors = () => {
      // Solo inicializar si tenemos dimensiones válidas
      if (dimensions.width <= 0 || dimensions.height <= 0) return;
      
      // Constantes para la configuración (leemos directo de settings)
      const configSpacing = settings.vectorSpacing;
      const gridRows = settings.gridRows;
      const aspectRatio = settings.aspectRatio;
      
      // Resultado: número de filas y columnas y espaciado ajustado
      const rows = gridRows;
      let cols;
      
      // Calcular número de columnas y espaciado ajustado según la relación de aspecto
      let adjustedSpacing;
      
      // Añadir un margen de protección para evitar que los vectores se corten
      const securityMargin = configSpacing;
      
      switch (aspectRatio) {
        case '1:1': { // Formato cuadrado
          // Para mantener proporción cuadrada, usar mismo número de columnas que filas
          cols = rows;
          
          // Recalcular espacio disponible considerando margen de seguridad a ambos lados
          const availableSpace = Math.min(dimensions.width, dimensions.height) - (securityMargin * 2);
          
          // Calcular factor para mantener densidad visual adecuada y evitar cortes
          const spacingFactor = availableSpace / (configSpacing * rows);
          adjustedSpacing = configSpacing * spacingFactor;
          break;
        }
        case '2:1': { // Formato panorámico
          // Para mantener 2:1 necesitamos el doble de columnas que filas
          cols = rows * 2;
          
          // Recalcular espacio disponible considerando margen de seguridad
          const availableWidth = dimensions.width - (securityMargin * 2);
          
          // Calcular factor para mantener densidad visual adecuada y evitar cortes
          const spacingFactor = availableWidth / (configSpacing * cols);
          adjustedSpacing = configSpacing * spacingFactor;
          break;
        }
        case '16:9': { // Formato widescreen
          // Calcular proporción exacta 16:9
          cols = Math.round((rows * 16) / 9);
          
          // Recalcular espacio disponible considerando margen de seguridad
          const availableWidth = dimensions.width - (securityMargin * 2);
          
          // Calcular factor para mantener densidad visual adecuada y evitar cortes
          const spacingFactor = availableWidth / (configSpacing * cols);
          adjustedSpacing = configSpacing * spacingFactor;
          break;
        }
        default: { // Formato libre
          // Restar margen de seguridad al ancho disponible
          const availableWidth = dimensions.width - (securityMargin * 2);
          
          // En formato libre, determinamos por el ancho disponible
          cols = Math.floor(availableWidth / configSpacing);
          adjustedSpacing = configSpacing;
          break;
        }
      }
      
      const newVectors: ExtendedVectorItem[] = [];
      
      // Usar el espaciado ajustado para los cálculos de posición
      const baseSpacing = adjustedSpacing;
      
      // Calcular los offsets para centrar la cuadrícula
      const totalWidthNeeded = cols * baseSpacing;
      const totalHeightNeeded = rows * baseSpacing;
      const offsetX = (dimensions.width - totalWidthNeeded) / 2;
      const offsetY = (dimensions.height - totalHeightNeeded) / 2;
      
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Calcular posición usando el espaciado base y los offsets para centrado
          const baseX = offsetX + x * baseSpacing;
          const baseY = offsetY + y * baseSpacing;
          
          newVectors.push({
            id: `vector-${x}-${y}`,
            baseX: baseX + baseSpacing / 2, // Centrar vector en su celda
            baseY: baseY + baseSpacing / 2,
            currentAngle: 0,
            previousAngle: 0,
            lengthFactor: 1.0,
            layer: 0,
            activationTime: 0,
            r: y,                // Fila
            c: x,                // Columna
            flockId: 0,          // ID de grupo para animaciones de bandada
            shape: settingsRef.current.vectorShape  // Forma visual del vector
          });
        }
      }
      
      // Actualizar estado local
      setVectorItems(newVectors);
      
      // Actualizar valores calculados
      setCalculatedValues(cols, adjustedSpacing * cols, adjustedSpacing * rows);
      
      // Sincronizar con store
      setSvgLines(newVectors);
    };
    
    // Ejecutar la inicialización
    initializeVectors();
    
    // Configurar event listener para resize
    const handleResize = () => {
      // Verificamos si las dimensiones han cambiado significativamente
      if (Math.abs(dimensions.width - prevConfigRef.current.width) > 5 ||
          Math.abs(dimensions.height - prevConfigRef.current.height) > 5) {
        // Actualizamos referencia y reinicializamos
        prevConfigRef.current.width = dimensions.width;
        prevConfigRef.current.height = dimensions.height;
        initializeVectors();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    
  // Este array de dependencias es estable y no cambiará su tamaño
  }, [dimensions, settings, setVectorItems, setCalculatedValues, setSvgLines]);
  
  // Listener para eventos del ratón
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      mouseRef.current = { x: mouseX, y: mouseY };
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Efecto para gestionar la animación
  useEffect(() => {
    // Función de animación
    const animate = () => {
      if (vectorItems.length === 0) return;
      
      // Capturar el timestamp actual para animaciones basadas en tiempo
      const timestamp = Date.now();
      
      // Usar settingsRef para acceder a settings sin causar re-renders
      const { 
        animationType, easingFactor, isPaused, 
        dynamicLengthEnabled, dynamicLengthIntensity,
        seaWaveFrequency, seaWaveAmplitude, pulseInterval, pulseDuration,
        geometricPatternComplexity, geometricPatternRotationSpeed
      } = settingsRef.current;
      
      // Creamos una nueva matriz de elementos en lugar de mutar los existentes
      const updatedItems = vectorItems.map(item => ({ ...item })); // Clonamos cada objeto
      
      // Actualizar ángulos de los vectores - ahora cada item es un nuevo objeto
      updatedItems.forEach(item => {
        // Calcular ángulo objetivo basado en el tipo de animación
        let targetAngle = item.currentAngle; // Por defecto mantener el ángulo actual
        
        // Convertir posición del mouse a Victor si está disponible
        let mousePosition: Victor | null = null;
        if (mouseRef.current) {
          mousePosition = new Victor(mouseRef.current.x, mouseRef.current.y);
        }
        
        // Calcular ángulo según tipo de animación
        switch (animationType) {
          case 'smoothWaves': {
            const waveFreq = seaWaveFrequency || 0.005;
            const waveAmp = seaWaveAmplitude || 45;
            targetAngle = Math.sin(timestamp * waveFreq + item.baseX * 0.01) * waveAmp;
            break;
          }
          
          case 'seaWaves': {
            const baseAngle = Math.sin(timestamp * 0.001 + item.baseX * 0.01) * 45;
            const ripple = Math.sin(timestamp * 0.002 + item.baseY * 0.01) * 15;
            targetAngle = baseAngle + ripple;
            break;
          }
          
          case 'perlinFlow': {
            // Simulación simple de ruido Perlin
            const noiseX = Math.sin(timestamp * 0.001 + item.baseX * 0.02);
            const noiseY = Math.cos(timestamp * 0.001 + item.baseY * 0.02);
            targetAngle = Math.atan2(noiseY, noiseX) * (180 / Math.PI);
            break;
          }
          
          case 'mouseInteraction': {
            if (mousePosition) {
              const vectorPos = new Victor(item.baseX, item.baseY);
              const direction = mousePosition.clone().subtract(vectorPos);
              targetAngle = direction.angle() * (180 / Math.PI);
            }
            break;
          }
          
          case 'pinwheels': {
            const rotationSpeed = 0.1;
            targetAngle = (timestamp * rotationSpeed + (item.r + item.c) * 45) % 360;
            break;
          }
          
          case 'oceanCurrents': {
            const flowSpeed = 0.05;
            const flowAngle = Math.sin(timestamp * flowSpeed + item.baseY * 0.01) * 90;
            targetAngle = flowAngle + (item.c * 10);
            break;
          }
          
          case 'jitter': {
            const jitterAmount = 15;
            targetAngle = item.currentAngle + (Math.random() * 2 - 1) * jitterAmount;
            break;
          }
          
          case 'centerPulse': {
            const pulseIntervalValue = pulseInterval || 2000;
            const pulseDurationValue = pulseDuration || 1000;
            const timeSinceLastPulse = timestamp - lastPulseTimeRef.current;
            
            if (timeSinceLastPulse >= pulseIntervalValue) {
              lastPulseTimeRef.current = timestamp;
              setLastPulseTime(timestamp);
            }
            
            if (timeSinceLastPulse < pulseDurationValue) {
              const center = new Victor(dimensions.width / 2, dimensions.height / 2);
              const vectorPos = new Victor(item.baseX, item.baseY);
              const direction = vectorPos.clone().subtract(center);
              targetAngle = direction.angle() * (180 / Math.PI);
            }
            break;
          }
          
          case 'rippleEffect': {
            const center = new Victor(dimensions.width / 2, dimensions.height / 2);
            const vectorPos = new Victor(item.baseX, item.baseY);
            const distance = vectorPos.distance(center);
            const waveSpeed = 0.002;
            targetAngle = Math.sin(timestamp * waveSpeed - distance * 0.1) * 180;
            break;
          }
          
          case 'expandingWave': {
            const center = new Victor(dimensions.width / 2, dimensions.height / 2);
            const vectorPos = new Victor(item.baseX, item.baseY);
            const distance = vectorPos.distance(center);
            const waveSpeed = 0.001;
            const waveLength = 0.05;
            targetAngle = Math.sin(timestamp * waveSpeed + distance * waveLength) * 180;
            break;
          }
          
          case 'cellularAutomata': {
            // Simulación simple de autómata celular
            const neighborSum = (item.r + item.c) % 4;
            const timeStep = Math.floor(timestamp / 1000);
            targetAngle = (neighborSum * 90 + timeStep * 45) % 360;
            break;
          }
          
          case 'flocking': {
            // Comportamiento simple de bandada
            const flockAngle = (item.flockId * 72 + timestamp * 0.1) % 360;
            const individualVariation = Math.sin(timestamp * 0.002 + item.baseX * 0.01) * 30;
            targetAngle = flockAngle + individualVariation;
            break;
          }
          
          case 'geometricPattern': {
            // Patrón geométrico basado en posiciones relativas
            const complexity = geometricPatternComplexity || 3;
            const rotationSpeed = geometricPatternRotationSpeed || 0.5;
            
            // Calcular la posición relativa al centro (normalizando a [-1, 1])
            const centerX = dimensions.width / 2;
            const centerY = dimensions.height / 2;
            const relX = (item.baseX - centerX) / (dimensions.width / 2 || 1); // Evitar división por cero
            const relY = (item.baseY - centerY) / (dimensions.height / 2 || 1); // Evitar división por cero
            
            // Convertir a coordenadas polares
            const radius = Math.sqrt(relX * relX + relY * relY);
            const theta = Math.atan2(relY, relX);
            
            // Patrón basado en ondas polares
            targetAngle = (theta * (180 / Math.PI)) + 
                         (Math.cos(complexity * theta + timestamp * 0.001 * rotationSpeed) * 90 * radius);
            break;
          }
          
          // Otras animaciones se pueden añadir aquí
          default:
            // Si no se especifica un tipo de animación, usar mouseInteraction
            if (mousePosition) {
              const vectorPos = new Victor(item.baseX, item.baseY);
              const direction = mousePosition.clone().subtract(vectorPos);
              targetAngle = direction.angle() * (180 / Math.PI);
            }
            break;
        }
        
        // Calcular diferencia de ángulo
        let angleDiff = targetAngle - item.currentAngle;
        // Normalizar diferencia para la ruta más corta (-180 a 180)
        while (angleDiff <= -180) angleDiff += 360;
        while (angleDiff > 180) angleDiff -= 360;
        
        // Guardar ángulo anterior - ahora es seguro ya que trabajamos con copias
        item.previousAngle = item.currentAngle;
        
        // Aplicar easing
        item.currentAngle = (item.currentAngle + angleDiff * easingFactor) % 360;
        
        // Calcular longitud dinámica basada en velocidad angular
        if (dynamicLengthEnabled && item.previousAngle !== undefined) {
          const angularVelocity = Math.abs(item.currentAngle - item.previousAngle);
          item.lengthFactor = 1.0 + (angularVelocity * dynamicLengthIntensity / 10);
        } else {
          item.lengthFactor = 1.0;
        }
      });
      
      // Actualizar estado local SOLO cuando todos los cálculos estén hechos
      setVectorItems(updatedItems);
      
      // Solo sincronizamos con el store cada 30 frames aproximadamente
      // para evitar actualizaciones excesivas
      if (Math.random() < 0.03) {
        setSvgLines([...updatedItems]);
      }
      
      // Continuar animación si no está pausada
      if (!isPaused) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Iniciar animación
    if (!settingsRef.current.isPaused) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    // Limpieza
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [vectorItems, setSvgLines, dimensions.width, dimensions.height, setLastPulseTime]);
  
  // Renderizado
  return (
    <div className={getContainerClasses()} ref={containerRef}>
      <svg 
        ref={svgRef}
        viewBox={`0 0 ${dimensions.width || 1067} ${dimensions.height || 600}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full bg-background"
      >
        <defs>
          <style>
            {`.dark svg line, .dark svg path, .dark svg polygon, .dark svg circle { stroke: #FFFFFF !important; fill: #FFFFFF !important; }`}
          </style>
        </defs>
        <g>
          {vectorItems.map(item => {
            const { currentAngle, baseX, baseY, lengthFactor = 1.0 } = item;
            
            // Calcular extremos del vector basados en el ángulo
            const angleRad = currentAngle * (Math.PI / 180);
            const actualLength = settingsRef.current.vectorLength * lengthFactor;
            
            const endX = baseX + actualLength * Math.cos(angleRad);
            const endY = baseY + actualLength * Math.sin(angleRad);
            
            // Calcular punto de rotación según la configuración rotationOrigin
            let rotationX, rotationY;
            switch (settingsRef.current.rotationOrigin) {
              case 'center':
                // Punto medio
                rotationX = baseX + (actualLength / 2) * Math.cos(angleRad);
                rotationY = baseY + (actualLength / 2) * Math.sin(angleRad);
                break;
              case 'end':
                // Punto final
                rotationX = endX;
                rotationY = endY;
                break;
              case 'start':
              default:
                // Punto inicial (predeterminado)
                rotationX = baseX;
                rotationY = baseY;
                break;
            }
            
            // Renderizar según la forma seleccionada
            switch (settingsRef.current.vectorShape) {
              case 'arrow':
                // Implementación flecha
                return (
                  <g key={item.id} transform={`rotate(${currentAngle}, ${rotationX}, ${rotationY})`}>
                    <line 
                      x1={baseX} 
                      y1={baseY} 
                      x2={baseX + actualLength - 5} 
                      y2={baseY} 
                      stroke={settingsRef.current.vectorColor}
                      strokeWidth={settingsRef.current.vectorWidth}
                      strokeLinecap={settingsRef.current.vectorLineCap}
                    />
                    <polygon 
                      points={`${baseX + actualLength},${baseY} ${baseX + actualLength - 5},${baseY - 2.5} ${baseX + actualLength - 5},${baseY + 2.5}`}
                      fill={settingsRef.current.vectorColor}
                    />
                  </g>
                );
                
              case 'dot':
                // Implementación punto - usar transformación para aplicar rotación
                const dotCenterX = baseX + (actualLength/2) * Math.cos(angleRad);
                const dotCenterY = baseY + (actualLength/2) * Math.sin(angleRad);
                
                return (
                  <g key={item.id} transform={`rotate(${currentAngle}, ${rotationX}, ${rotationY})`}>
                    <circle
                      cx={dotCenterX}
                      cy={dotCenterY}
                      r={settingsRef.current.vectorWidth * 2}
                      fill={settingsRef.current.vectorColor}
                    />
                  </g>
                );
              
              case 'triangle':
                // Punto en reposo (sin rotación)
                const tipX = actualLength; // Solo en el eje X para que la rotación funcione 
                const angle1 = Math.PI * 0.8; // 144 grados
                const angle2 = -Math.PI * 0.8; // -144 grados
                const p1X = actualLength * 0.4 * Math.cos(angle1);
                const p1Y = actualLength * 0.4 * Math.sin(angle1);
                const p2X = actualLength * 0.4 * Math.cos(angle2);
                const p2Y = actualLength * 0.4 * Math.sin(angle2);
                
                // Construir polígono en posición horizontal y luego rotar
                return (
                  <g key={item.id} transform={`translate(${baseX}, ${baseY}) rotate(${currentAngle}, ${rotationX - baseX}, ${rotationY - baseY})`}>
                    <polygon
                      points={`${tipX},0 ${p1X},${p1Y} ${p2X},${p2Y}`}
                      fill={settingsRef.current.vectorColor}
                    />
                  </g>
                );
                
              case 'semicircle':
                // Implementación semicircunferencia
                const radius = actualLength / 2;
                // Control points for the arc
                const pathData = `
                  M ${baseX} ${baseY}
                  A ${radius} ${radius} 0 0 1 ${baseX + actualLength} ${baseY}
                `;
                return (
                  <path
                    key={item.id}
                    d={pathData}
                    fill="none"
                    stroke={settingsRef.current.vectorColor}
                    strokeWidth={settingsRef.current.vectorWidth}
                    strokeLinecap={settingsRef.current.vectorLineCap}
                    transform={`rotate(${currentAngle}, ${rotationX}, ${rotationY})`}
                  />
                );
                
              case 'curve':
                // Implementar curva con transformación para rotación
                // Definir curva en posición horizontal (0 grados) y luego rotar
                const curveHeight = actualLength * 0.3; // Altura de la curva = 30% de la longitud
                
                // Definir la curva relative a (0,0) y luego trasladar
                const curvePath = `
                  M 0 0
                  Q ${actualLength/2} ${-curveHeight} ${actualLength} 0
                `;
                
                return (
                  <g key={item.id} transform={`translate(${baseX}, ${baseY}) rotate(${currentAngle}, ${rotationX - baseX}, ${rotationY - baseY})`}>
                    <path
                      d={curvePath}
                      fill="none"
                      stroke={settingsRef.current.vectorColor}
                      strokeWidth={settingsRef.current.vectorWidth}
                      strokeLinecap={settingsRef.current.vectorLineCap}
                    />
                  </g>
                );
                
              default:
                // Línea por defecto
                return (
                  <g key={item.id} transform={`rotate(${currentAngle}, ${rotationX}, ${rotationY})`}>
                    <line
                      x1={baseX}
                      y1={baseY}
                      x2={baseX + actualLength} // Siempre horizontal, la rotación lo gira
                      y2={baseY}
                      stroke={settingsRef.current.vectorColor}
                      strokeWidth={settingsRef.current.vectorWidth}
                      strokeLinecap={settingsRef.current.vectorLineCap}
                    />
                  </g>
                );
            }
          })}
        </g>
      </svg>
      <AspectRatioControl />
    </div>
  );
};

export default NewVectorCanvas;