'use client';

import React from 'react';
import { useVectorStore } from '@/lib/store';
import { VectorShape } from '@/components/vector/core/types';

export function VectorShapeControl() {
  // Obtener la forma actual y la función para actualizarla
  const vectorShape = useVectorStore((state) => state.settings.vectorShape);
  const setSettings = useVectorStore((state) => state.setSettings);

  // Opciones de formas disponibles
  const shapeOptions = [
    { value: 'line', label: 'Línea', icon: '—' },
    { value: 'arrow', label: 'Flecha', icon: '→' },
    { value: 'dot', label: 'Punto', icon: '•' },
    { value: 'triangle', label: 'Triángulo', icon: '△' },
    { value: 'semicircle', label: 'Semicírculo', icon: '◡' },
    { value: 'curve', label: 'Curva', icon: '⌒' }
  ];

  // Manejar cambio de forma
  const handleShapeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newShape = e.target.value as VectorShape;
    console.log('[VectorShapeControl] Cambiando forma a:', newShape);
    setSettings({ vectorShape: newShape });
  };

  return (
    <div className="flex items-center justify-between space-x-2 mt-3">
      <span className="text-xs text-gray-500">Forma:</span>
      <select
        value={vectorShape}
        onChange={handleShapeChange}
        className="bg-gray-700 text-white text-sm rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {shapeOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.icon} {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
