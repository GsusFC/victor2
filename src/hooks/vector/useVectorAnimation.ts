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

      default:
        return vector.currentAngle;
    }
  };

  return {
    calculateTargetAngle,
    lastPulseTimeRef,
  };
};
