'use client';

import React from 'react';
import { useVectorStore } from '@/lib/store';
import { type VectorSettings } from '@/components/vector/core/types';

// Definir un tipo para el preset, Partial es adecuado para empezar
type VectorSettingsPreset = Partial<VectorSettings>;

const PRESET_STORAGE_KEY = 'vectorPreset';

export const PresetButtons: React.FC = () => {
  const settings = useVectorStore((state) => state.settings);
  const { setInitialSettings } = useVectorStore((state) => state.actions);

  const handleSavePreset = () => {
    try {
      // Excluir propiedades que no deberían guardarse o son volátiles (si las hubiera)
      // Por ahora, guardamos todo 'settings'
      const presetToSave: VectorSettingsPreset = { ...settings };
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presetToSave));
      console.log('Preset guardado en localStorage.');
      // TODO: Añadir feedback visual al usuario (ej. toast)
    } catch (error) {
      console.error('Error al guardar el preset:', error);
      // TODO: Mostrar error al usuario
    }
  };

  const handleLoadPreset = () => {
    try {
      const savedPreset = localStorage.getItem(PRESET_STORAGE_KEY);
      if (savedPreset) {
        const parsedPreset: VectorSettingsPreset = JSON.parse(savedPreset);

        if (parsedPreset.animationType) {
          // Caso 1: animationType existe en el preset.
          // Pasar un objeto que cumple la firma { animationType, currentAnimationType, ...rest }
          setInitialSettings({
            ...parsedPreset,
            animationType: parsedPreset.animationType,
            currentAnimationType: parsedPreset.animationType, // Asegurar sincronización
          });
        } else {
          // Caso 2: animationType NO existe en el preset.
          // Construir el objeto para setSettings omitiendo currentAnimationType
          // usando desestructuración para que TS sepa que no está presente.
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { currentAnimationType, ...restOfPreset } = parsedPreset; // Ignorar var no usada
          setInitialSettings(restOfPreset);
        }

        console.log('Preset cargado desde localStorage.');
        // TODO: Añadir feedback visual al usuario
      } else {
        console.log('No se encontró ningún preset guardado.');
        // TODO: Informar al usuario
      }
    } catch (error) {
      console.error('Error al cargar o parsear el preset:', error);
      // TODO: Mostrar error al usuario (posible formato inválido en localStorage)
    }
  };

  return (
    <div className="flex space-x-2 mt-4 justify-center">
      <button
        onClick={handleSavePreset}
        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md text-white text-xs transition-colors"
        title="Guardar la configuración actual como favorita"
      >
        Guardar Preset
      </button>
      <button
        onClick={handleLoadPreset}
        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded-md text-white text-xs transition-colors"
        title="Cargar la configuración favorita guardada"
      >
        Cargar Preset
      </button>
    </div>
  );
};
