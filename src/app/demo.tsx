'use client';

import React from 'react';
import NewVectorCanvas from '@/components/vector/NewVectorCanvas';

/**
 * Página de demostración para el canvas modular
 */
export default function Demo() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-white text-2xl font-bold mb-8">
        Visualización de Vectores - Versión SVG
      </h1>
      <div className="max-w-6xl w-full">
        <NewVectorCanvas />
      </div>
      <div className="mt-8 text-white text-sm">
        <p>Este componente utiliza una arquitectura mejorada con:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Renderizado nativo SVG para mejor integración con React</li>
          <li>Biblioteca Victor.js para cálculos matemáticos vectoriales</li>
          <li>Eliminación de P5.js para evitar problemas de ciclo de vida</li>
          <li>Mayor rendimiento y estabilidad</li>
        </ul>
      </div>
    </div>
  );
}
