import React from 'react';
import { useVectorStore, defaultSettings } from '@/lib/store';
import { LineCap } from '@/lib/types';
import { isValidAnimationType } from '../vector/core/types';
import { VectorSettings, isValidVectorShape } from '@/components/vector/core/types'; 
import { PresetButtons } from './PresetButtons'; // Importar el nuevo componente

interface SimpleControlPanelProps {
  onExportClick: () => void;
}

export function SimpleControlPanel({ onExportClick }: SimpleControlPanelProps) {
  // Tipos de animación disponibles
  const animationTypes = [
    { value: 'smoothWaves', label: 'Ondas Suaves' },
    { value: 'seaWaves', label: 'Olas Marinas' },
    { value: 'perlinFlow', label: 'Flujo Perlin' },
    { value: 'mouseInteraction', label: 'Seguir Ratón' },
    { value: 'pinwheels', label: 'Molinetes' },
    { value: 'oceanCurrents', label: 'Corrientes' },
    { value: 'jitter', label: 'Vibraciones' },
    { value: 'centerPulse', label: 'Pulso Central' },
    { value: 'rippleEffect', label: 'Ondulaciones' },
    { value: 'expandingWave', label: 'Onda Expansiva' },
    { value: 'cellularAutomata', label: 'Autómata Celular' },
    { value: 'flocking', label: 'Bandadas' },
  ];

  const {
    settings,
    setSettings
  } = useVectorStore();

  // Handler para cambio de tipo de animación
  const handleAnimationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (isValidAnimationType(value)) {
      setSettings({
        currentAnimationType: value,
        animationType: value
      });
    }
  };

  // Handler para cambio de forma del vector
  const handleVectorShapeChange = (value: string) => {
    if (isValidVectorShape(value)) { 
      setSettings({ vectorShape: value });
    } else {
      console.warn(`Invalid vector shape value received: ${value}`);
      setSettings({ vectorShape: 'line' }); 
    }
  };

  const handleVectorLineCapChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({ strokeLinecap: e.target.value as LineCap });
  };

  // Función auxiliar para manejar inputs numéricos
  const handleNumericInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    settingKey: keyof VectorSettings,
    config: {
      min: number;
      max: number;
      isInteger?: boolean;
    }
  ) => {
    const value = e.target.value;
    const { min, max, isInteger } = config;
    const defaultValue = defaultSettings[settingKey] as number;

    if (value === '') {
      setSettings({ [settingKey]: defaultValue } as Partial<VectorSettings> & { currentAnimationType?: undefined });
    } else {
      const numericValue = isInteger ? parseInt(value, 10) : parseFloat(value);

      if (!isNaN(numericValue) && isFinite(numericValue)) {
        const clampedValue = Math.max(min, Math.min(numericValue, max));
        setSettings({ [settingKey]: clampedValue } as Partial<VectorSettings> & { currentAnimationType?: undefined });
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Sección de Animación */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h3 className="text-white font-medium mb-4 text-sm">Tipo de Animación</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Animación
            </label>
            <select
              value={settings.currentAnimationType}
              onChange={handleAnimationTypeChange}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {animationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Velocidad
            </label>
            <input
              type="number"
              min="0.1"
              max="3"
              step="0.1"
              value={settings.animationSpeedFactor ?? ''}
              onChange={(e) => handleNumericInputChange(e, 'animationSpeedFactor', { min: 0.1, max: 3 })}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Suavizado
            </label>
            <input
              type="number"
              min="0.01"
              max="0.3"
              step="0.01"
              value={settings.easingFactor ?? ''}
              onChange={(e) => handleNumericInputChange(e, 'easingFactor', { min: 0.01, max: 0.3 })}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Sección de Vectores */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h3 className="text-white font-medium mb-4 text-sm">Propiedades de Vectores</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Longitud
            </label>
            <input
              type="number"
              min="5"
              max="50"
              step="1"
              value={settings.vectorLength ?? ''}
              onChange={(e) => handleNumericInputChange(e, 'vectorLength', { min: 5, max: 50, isInteger: true })}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Grosor
            </label>
            <input
              type="number"
              min="0.5"
              max="10"
              step="0.5"
              value={settings.vectorWidth ?? ''}
              onChange={(e) => handleNumericInputChange(e, 'vectorWidth', { min: 0.5, max: 10 })}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Espaciado
            </label>
            <input
              type="number"
              min="20"
              max="80"
              step="5"
              value={settings.vectorSpacing ?? ''}
              onChange={(e) => handleNumericInputChange(e, 'vectorSpacing', { min: 20, max: 80, isInteger: true })}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.vectorColor}
                onChange={(e) => setSettings({ vectorColor: e.target.value })}
                className="w-10 h-10 p-1 rounded"
              />
              <input
                type="text"
                value={settings.vectorColor}
                onChange={(e) => setSettings({ vectorColor: e.target.value })}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                }}
                onKeyPress={(e) => {
                  e.stopPropagation();
                }}
                onKeyUp={(e) => {
                  e.stopPropagation();
                }}
                className="flex-1 bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="off"
                tabIndex={1}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Forma
            </label>
            <select
              value={isValidVectorShape(settings.vectorShape) ? settings.vectorShape : 'line'}
              onChange={(e) => handleVectorShapeChange(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="line">Línea</option>
              <option value="arrow">Flecha</option>
              <option value="dot">Punto</option>
              <option value="triangle">Triángulo</option>
              <option value="semicircle">Semicircunferencia</option>
              <option value="curve">Curva</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Terminal
            </label>
            <select
              value={settings.strokeLinecap}
              onChange={handleVectorLineCapChange}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="butt">Plano</option>
              <option value="round">Redondeado</option>
              <option value="square">Cuadrado</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Sección de Acciones */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h3 className="text-white font-medium mb-4 text-sm">Acciones</h3>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={onExportClick}
            className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-medium transition-colors"
          >
            Exportar Código
          </button>
        </div>
      </div>
      
      {/* Integrar botones de preset */}
      <PresetButtons />
    </div>
  );
}
