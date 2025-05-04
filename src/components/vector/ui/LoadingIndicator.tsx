'use client';

import React from 'react';

/**
 * Componente que muestra un indicador de carga mientras el canvas se inicializa
 */
export function LoadingIndicator() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400 mb-2"></div>
        <p className="text-white text-sm">Inicializando canvas...</p>
      </div>
    </div>
  );
}
