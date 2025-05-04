'use client';

import React from 'react';
import { useVectorStore } from '@/lib/store';
import { type AspectRatio } from '@/components/vector/core/types';

// Componente para controlar la relación de aspecto del canvas
export function AspectRatioControl() {
  // Seleccionar cada parte del estado por separado para optimización
  const aspectRatio = useVectorStore((state) => state.settings.aspectRatio);
  const setSettings = useVectorStore((state) => state.setSettings); // Corregido: updateSettings -> setSettings

  // Opciones de relación de aspecto
  // Usar 'as const' para inferir los tipos literales correctos
  const aspectRatioOptions = [
    { value: '1:1', label: '1:1', title: 'Cuadrado', icon: (
      <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <rect x="4" y="4" width="12" height="12" />
      </svg>
    ) },
    { value: '16:9', label: '16:9', title: 'Pantalla ancha', icon: (
      <svg className="w-4 h-3 mr-1" viewBox="0 0 20 12" fill="currentColor" aria-hidden="true">
        <rect x="1" y="1" width="18" height="10" rx="1" ry="1" />
      </svg>
    ) },
    { value: '2:1', label: '2:1', title: 'Panorámica', icon: (
      <svg className="w-5 h-3 mr-1" viewBox="0 0 20 10" fill="currentColor" aria-hidden="true">
        <rect x="1" y="2" width="18" height="6" rx="1" ry="1" />
      </svg>
    ) },
    { value: 'free', label: 'Libre', title: 'Tamaño libre', icon: (
      <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4 L16 16 M16 4 L4 16" />
      </svg>
    ) }
  ] as const; // <-- Aserción 'as const'

  // Manejar cambio de relación de aspecto
  // El tipo del parámetro ahora es inferido correctamente desde las opciones tipadas
  const handleAspectRatioChange = (newAspectRatio: AspectRatio) => {
    console.log('[AspectRatioControl] handleAspectRatioChange - Nuevo ratio:', newAspectRatio);
    setSettings({ aspectRatio: newAspectRatio }); // Corregido: updateSettings -> setSettings
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-3">
      <span className="text-xs text-gray-500">Relación de aspecto:</span>
      <div className="flex space-x-1">
        {aspectRatioOptions.map(option => (
          <button
            key={option.value}
            onClick={() => {
              console.log(`[AspectRatioControl] Botón ${option.value} clickeado!`); // Log directo
              handleAspectRatioChange(option.value);
            }}
            className={`pointer-events-auto px-2 py-1 text-xs rounded transition-colors flex items-center ${
              aspectRatio === option.value // Usar la variable seleccionada
                ? 'bg-gray-800 text-white border border-gray-600'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={option.title}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
