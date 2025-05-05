import React from 'react';
import NewVectorCanvas from './NewVectorCanvas';

/**
 * Componente proxy que utiliza el nuevo componente optimizado NewVectorCanvas
 * para resolver el problema de bucle infinito en la animación.
 */
const VectorCanvasSVG: React.FC = () => {
  // Simplemente renderizamos el nuevo componente
  return <NewVectorCanvas />;
};

// Exportamos con React.memo para evitar renderizados innecesarios
export default React.memo(VectorCanvasSVG);