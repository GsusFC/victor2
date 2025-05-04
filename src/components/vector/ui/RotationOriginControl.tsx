'use client';

import React from 'react';
import { useVectorStore } from '@/lib/store';
import { RotationOrigin } from '@/components/vector/core/types';

export function RotationOriginControl() {
  // Obtener el origen actual y la función para actualizarlo
  const rotationOrigin = useVectorStore((state) => state.settings.rotationOrigin);
  const updateSetting = useVectorStore((state) => state.actions.updateSetting);

  // Opciones de origen de rotación
  const originOptions: { value: RotationOrigin; label: string }[] = [
    { value: 'start', label: 'Inicio' },
    { value: 'center', label: 'Centro' },
    { value: 'end', label: 'Fin' },
  ];
  
  // Obtener la etiqueta legible del origen actual
  const currentOriginLabel = originOptions.find(opt => opt.value === rotationOrigin)?.label || rotationOrigin;

  // Manejar cambio de origen
  const handleRotationOriginChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOrigin = e.target.value as RotationOrigin;
    console.log('[RotationOriginControl] Cambiando origen de rotación a:', newOrigin);
    updateSetting('rotationOrigin', newOrigin);
  };

  return (
    // Adoptar la estructura y estilos de VectorProperties
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs text-muted-foreground font-mono uppercase">Origen Rotación</label>
        <span className="text-xs font-mono capitalize">
          {currentOriginLabel}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <select
          value={rotationOrigin}
          onChange={handleRotationOriginChange}
          // Aplicar clases de estilo consistentes
          className="w-full bg-muted text-foreground text-xs p-1 pl-2 pr-1 border border-input focus:outline-none focus:ring-1 focus:ring-primary appearance-auto"
          aria-label="Seleccionar origen de rotación"
        >
          {originOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-muted-foreground mt-1 font-mono opacity-70">
Punto sobre el que rota el vector.
      </p>
    </div>
  );
}
