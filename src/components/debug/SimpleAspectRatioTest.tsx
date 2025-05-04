import React, { useState } from 'react';
import { AspectRatio } from '@/components/vector/core/types';

/**
 * Componente simplificado para probar la funcionalidad de relación de aspecto
 * sin dependencias de Zustand o lógica de animación compleja
 */
export function SimpleAspectRatioTest() {
  // Estado local en lugar de Zustand
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

  // Función simple para cambiar la relación de aspecto
  const handleAspectRatioChange = (newRatio: AspectRatio) => {
    console.log(`[SimpleTest] Cambiando a ${newRatio}`);
    setAspectRatio(newRatio);
  };

  // Función para obtener la clase CSS según la relación de aspecto
  const getContainerClass = () => {
    console.log(`[SimpleTest] Renderizando con aspectRatio=${aspectRatio}`);
    switch (aspectRatio) {
      case '16:9':
        return 'aspect-video'; // 16:9
      case '1:1':
        return 'aspect-square'; // 1:1
      case '2:1':
        return 'aspect-[2/1]'; // 2:1
      default:
        return 'aspect-video'; // Por defecto 16:9
    }
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg max-w-4xl mx-auto">
      <h2 className="text-white text-xl mb-4">Test Simple de Relación de Aspecto</h2>
      
      {/* Controles sencillos */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleAspectRatioChange('16:9')}
          className={`px-3 py-1 rounded ${
            aspectRatio === '16:9' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          16:9
        </button>
        <button
          onClick={() => handleAspectRatioChange('1:1')}
          className={`px-3 py-1 rounded ${
            aspectRatio === '1:1' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          1:1
        </button>
        <button
          onClick={() => handleAspectRatioChange('2:1')}
          className={`px-3 py-1 rounded ${
            aspectRatio === '2:1' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          2:1
        </button>
      </div>
      
      {/* Contenedor con relación de aspecto dinámica */}
      <div className={`${getContainerClass()} relative bg-blue-900 transition-all duration-300`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">{aspectRatio}</span>
        </div>
      </div>
      
      {/* Información adicional */}
      <div className="mt-4 text-gray-400">
        <p>Estado actual: <span className="text-white">{aspectRatio}</span></p>
        <p>Clase CSS: <span className="text-white">{getContainerClass()}</span></p>
      </div>
    </div>
  );
}
