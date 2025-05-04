import React from 'react';
import type { ExtendedVectorItem } from '../core/vectorTypes';
import type { VectorSettings } from '../core/types';

interface VectorRendererProps {
  vector: ExtendedVectorItem;
  settings: VectorSettings;
}

/**
 * Componente para renderizar un vector individual
 * Implementa la misma lógica de renderizado que el HTML original
 */
export const VectorRenderer: React.FC<VectorRendererProps> = ({ vector, settings }) => {
  const { baseX, baseY, currentAngle } = vector;
  const { vectorLength, vectorWidth, vectorColor, strokeLinecap, vectorShape } = settings;

  // Propiedades base para todos los tipos de vectores
  const baseProps = {
    stroke: vectorColor,
    strokeWidth: vectorWidth || Math.max(1, vectorLength / 15), // Usar vectorWidth si está definido, o calcular automáticamente
    strokeLinecap: strokeLinecap,
    transform: `translate(${baseX}, ${baseY}) rotate(${currentAngle})`,
  };

  // Renderizar según la forma, siguiendo exactamente el enfoque del HTML original
  switch (vectorShape) {
    case 'curved': {
      const halfLen = vectorLength / 2;
      const curveHeight = vectorLength * 0.3;
      // Path para curva cuadrática (exactamente como en el HTML original)
      const pathData = `M ${-halfLen},0 Q 0,${-curveHeight} ${halfLen},0`;
      
      return <path {...baseProps} d={pathData} fill="none" />;
    }
    
    case 'semicircle': {
      const radius = vectorLength / 2;
      // Path para semicírculo (exactamente como en el HTML original)
      const pathData = `M ${-radius},0 A ${radius} ${radius} 0 0 1 ${radius},0`;
      
      return <path {...baseProps} d={pathData} fill="none" />;
    }
    
    case 'straight':
    default:
      // Línea recta (exactamente como en el HTML original)
      return <line 
        {...baseProps} 
        x1={-vectorLength/2} 
        y1={0} 
        x2={vectorLength/2} 
        y2={0} 
      />;
  }
};
