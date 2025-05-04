import { useRef } from 'react';
import Victor from 'victor';
import type { ExtendedVectorItem } from '@/components/vector/core/vectorTypes';
import type { VectorSettings } from '@/components/vector/core/types';

interface Dimensions {
  width: number;
  height: number;
}

/**
 * Hook para manejar la lógica de animación de vectores
 */
export const useVectorAnimation = (settings: VectorSettings) => {
  const lastPulseTimeRef = useRef<number>(0);

  /**
   * Calcula el ángulo objetivo para un vector basado en su posición y configuración
   */
  const calculateTargetAngle = (
    vector: ExtendedVectorItem,
    mousePosition: Victor | null,
    dimensions: Dimensions,
    timestamp: number
  ): number => {
    const { animationType } = settings;

    // Si hay interacción con el ratón y está activada la atracción
    if (mousePosition && settings.mouseAttraction) {
      const vectorPosition = new Victor(vector.baseX, vector.baseY);
      const direction = mousePosition.clone().subtract(vectorPosition);
      return direction.angle() * (180 / Math.PI);
    }

    // Calcular ángulo según tipo de animación
    switch (animationType) {
      case 'smoothWaves': {
        const waveFreq = settings.seaWaveFrequency || 0.005;
        const waveAmp = settings.seaWaveAmplitude || 45;
        return Math.sin(timestamp * waveFreq + vector.baseX * 0.01) * waveAmp;
      }

      case 'seaWaves': {
        const baseAngle = Math.sin(timestamp * 0.001 + vector.baseX * 0.01) * 45;
        const ripple = Math.sin(timestamp * 0.002 + vector.baseY * 0.01) * 15;
        return baseAngle + ripple;
      }

      case 'perlinFlow': {
        // Simulación simple de ruido Perlin
        const noiseX = Math.sin(timestamp * 0.001 + vector.baseX * 0.02);
        const noiseY = Math.cos(timestamp * 0.001 + vector.baseY * 0.02);
        return Math.atan2(noiseY, noiseX) * (180 / Math.PI);
      }

      case 'mouseInteraction': {
        if (mousePosition) {
          const vectorPos = new Victor(vector.baseX, vector.baseY);
          const direction = mousePosition.clone().subtract(vectorPos);
          return direction.angle() * (180 / Math.PI);
        }
        return vector.currentAngle;
      }

      case 'pinwheels': {
        const rotationSpeed = 0.1;
        return (timestamp * rotationSpeed + (vector.r + vector.c) * 45) % 360;
      }

      case 'oceanCurrents': {
        const flowSpeed = 0.05;
        const flowAngle = Math.sin(timestamp * flowSpeed + vector.baseY * 0.01) * 90;
        return flowAngle + (vector.c * 10);
      }

      case 'jitter': {
        const jitterAmount = 15;
        return vector.currentAngle + (Math.random() * 2 - 1) * jitterAmount;
      }

      case 'centerPulse': {
        const pulseInterval = settings.pulseInterval || 2000;
        const pulseDuration = settings.pulseDuration || 1000;
        const timeSinceLastPulse = timestamp - lastPulseTimeRef.current;

        if (timeSinceLastPulse >= pulseInterval) {
          lastPulseTimeRef.current = timestamp;
        }

        if (timeSinceLastPulse < pulseDuration) {
          const center = new Victor(dimensions.width / 2, dimensions.height / 2);
          const vectorPos = new Victor(vector.baseX, vector.baseY);
          const direction = vectorPos.clone().subtract(center);
          return direction.angle() * (180 / Math.PI);
        }

        return vector.currentAngle;
      }

      case 'rippleEffect': {
        const center = new Victor(dimensions.width / 2, dimensions.height / 2);
        const vectorPos = new Victor(vector.baseX, vector.baseY);
        const distance = vectorPos.distance(center);
        const waveSpeed = 0.002;
        return Math.sin(timestamp * waveSpeed - distance * 0.1) * 180;
      }

      case 'expandingWave': {
        const center = new Victor(dimensions.width / 2, dimensions.height / 2);
        const vectorPos = new Victor(vector.baseX, vector.baseY);
        const distance = vectorPos.distance(center);
        const waveSpeed = 0.001;
        const waveLength = 0.05;
        return Math.sin(timestamp * waveSpeed + distance * waveLength) * 180;
      }

      case 'cellularAutomata': {
        // Simulación simple de autómata celular
        const neighborSum = (vector.r + vector.c) % 4;
        const timeStep = Math.floor(timestamp / 1000);
        return (neighborSum * 90 + timeStep * 45) % 360;
      }

      case 'flocking': {
        // Comportamiento simple de bandada
        const flockAngle = (vector.flockId * 72 + timestamp * 0.1) % 360;
        const individualVariation = Math.sin(timestamp * 0.002 + vector.baseX * 0.01) * 30;
        return flockAngle + individualVariation;
      }

      case 'geometricPattern': {
        // Patrón geométrico basado en posiciones relativas
        const complexity = settings.geometricPatternComplexity || 3;
        const rotationSpeed = settings.geometricPatternRotationSpeed || 0.5;
        
        // Verificar que las dimensiones son válidas para evitar NaN
        if (!dimensions || !dimensions.width || !dimensions.height) {
          return vector.currentAngle || 0; // Retornar ángulo actual si no hay dimensiones válidas
        }
        
        // Calcular la posición relativa al centro (normalizando a [-1, 1])
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        const relX = (vector.baseX - centerX) / (dimensions.width / 2 || 1); // Evitar división por cero
        const relY = (vector.baseY - centerY) / (dimensions.height / 2 || 1); // Evitar división por cero
        
        // Convertir a coordenadas polares
        const radius = Math.sqrt(relX * relX + relY * relY) || 0; // Protección contra NaN
        const theta = Math.atan2(relY, relX) || 0; // Protección contra NaN
        
        // Aplicar transformaciones geométricas según complejidad
        // Para complejidad = 1, tendremos un patrón circular simple
        // Para complejidad > 1, añadimos armónicos
        let angle = (theta * (180 / Math.PI)) + (timestamp * rotationSpeed * 0.01);
        
        // Añadir patrones geométricos basados en la complejidad
        for (let i = 1; i <= complexity; i++) {
          angle += 20 * Math.sin(i * theta + timestamp * 0.001 * i) * (1 - radius);
        }
        
        // Asegurar que el valor es numérico
        return isNaN(angle) ? (vector.currentAngle || 0) : (angle % 360);
      }
      
      case 'vortex': {
        // Efecto remolino/vórtice
        const vortexStrength = settings.vortexStrength || 0.3;
        
        // Verificar que las dimensiones son válidas para evitar NaN
        if (!dimensions || !dimensions.width || !dimensions.height) {
          return vector.currentAngle || 0; // Retornar ángulo actual si no hay dimensiones válidas
        }
        
        // Obtener el centro del vórtice (por defecto el centro del canvas)
        const vortexCenterXPercent = (settings.vortexCenterX !== undefined && !isNaN(settings.vortexCenterX)) ? settings.vortexCenterX : 50;
        const vortexCenterYPercent = (settings.vortexCenterY !== undefined && !isNaN(settings.vortexCenterY)) ? settings.vortexCenterY : 50;
        
        // Convertir porcentajes a coordenadas reales
        const vortexCenterX = (vortexCenterXPercent / 100) * dimensions.width;
        const vortexCenterY = (vortexCenterYPercent / 100) * dimensions.height;
        
        // Calcular la distancia al centro del vórtice
        const dx = vector.baseX - vortexCenterX;
        const dy = vector.baseY - vortexCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy) || 0; // Protección contra NaN
        
        // Calcular el ángulo base (perpendicular al radio)
        const baseAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        
        // La velocidad del remolino disminuye con la distancia
        const maxDimension = Math.max(dimensions.width || 1, dimensions.height || 1); // Evitar divisiones por cero
        const speedFactor = Math.max(0.1, 1 - (distance / maxDimension));
        const rotationAmount = timestamp * 0.01 * vortexStrength * speedFactor;
        
        // Asegurar que el valor es numérico
        const finalAngle = (baseAngle + rotationAmount) % 360;
        return isNaN(finalAngle) ? (vector.currentAngle || 0) : finalAngle;
      }
      
      case 'followPath': {
        // Seguir un camino generado proceduralmente
        const pathSpeed = settings.followPathSpeed || 0.5;
        const pathComplexity = settings.followPathComplexity || 2;
        const pathVariation = settings.followPathVariation || 0.3;
        
        // Verificar que las dimensiones son válidas para evitar NaN
        if (!dimensions || !dimensions.width || !dimensions.height) {
          return vector.currentAngle || 0; // Retornar ángulo actual si no hay dimensiones válidas
        }
        
        // Usamos posiciones normalizadas para calcular el ángulo del camino
        const normalizedX = vector.baseX / (dimensions.width || 1); // Evitar división por cero
        const normalizedY = vector.baseY / (dimensions.height || 1); // Evitar división por cero
        
        // Generar caminos usando funciones trigonometricas combinadas
        let angle = 0;
        
        // Componente base que avanza con el tiempo
        const timeComponent = timestamp * 0.001 * pathSpeed;
        
        // Añadir diferentes armónicos basados en la posición del vector
        for (let i = 1; i <= pathComplexity; i++) {
          // Cada armónico tiene una frecuencia y fase diferentes
          const freq = i * 2;
          // Protecciones contra NaN en operaciones trigonométricas
          const sinValue = Math.sin(freq * normalizedX * Math.PI + timeComponent) || 0;
          const cosValue = Math.cos(freq * normalizedY * Math.PI + timeComponent * 0.7) || 0;
          
          angle += 40 * sinValue;
          angle += 40 * cosValue;
          
          // Añadir variaciones adicionales basadas en la posición
          if (pathVariation > 0) {
            const additionalSinValue = Math.sin(normalizedX * normalizedY * 10 + timeComponent * i) || 0;
            angle += 20 * pathVariation * additionalSinValue;
          }
        }
        
        // Asegurar que el valor es numérico
        return isNaN(angle) ? (vector.currentAngle || 0) : (angle % 360);
      }
      
      case 'lissajous': {
        // Figuras de Lissajous
        const paramA = settings.lissajousParamA || 3;
        const paramB = settings.lissajousParamB || 2;
        const frequency = settings.lissajousFrequency || 0.001;
        const delta = settings.lissajousDelta || Math.PI / 2; // 90 grados por defecto
        
        // Verificar que las dimensiones son válidas para evitar NaN
        if (!dimensions || !dimensions.width || !dimensions.height) {
          return vector.currentAngle || 0; // Retornar ángulo actual si no hay dimensiones válidas
        }
        
        // Normalizar las coordenadas del vector al rango [-1, 1]
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        const normalizedX = (vector.baseX - centerX) / (centerX || 1); // Evitar división por cero
        const normalizedY = (vector.baseY - centerY) / (centerY || 1); // Evitar división por cero
        
        // Calcular el parámetro t para este vector, basado en su posición
        // Usamos la posición angular del vector en el sistema de coordenadas normalizado
        const positionAngle = Math.atan2(normalizedY, normalizedX) || 0; // Protección contra NaN
        const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY) || 0; // Protección contra NaN
        
        // Parámetro de tiempo, avanza con timestamp pero varía por posición
        const t = timestamp * frequency + positionAngle + distance;
        
        // Ecuaciones paramétricas de las curvas de Lissajous
        // x = A * sin(a * t + δ), y = B * sin(b * t)
        const lissajousX = Math.sin(paramA * t + delta) || 0; // Protección contra NaN
        const lissajousY = Math.sin(paramB * t) || 0; // Protección contra NaN
        
        // Convertir a un ángulo
        const angle = Math.atan2(lissajousY, lissajousX) * (180 / Math.PI);
        
        // Asegurar que el valor es numérico
        return isNaN(angle) ? (vector.currentAngle || 0) : angle;
      }

      default:
        return vector.currentAngle;
    }
  };

  return {
    calculateTargetAngle,
    lastPulseTimeRef,
  };
};
