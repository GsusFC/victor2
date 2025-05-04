import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVectorStore } from '@/lib/store';
import { isValidAnimationType } from "../vector/core/types";

export function AnimationControls() {
  const settings = useVectorStore((state) => state.settings);
  const setSettings = useVectorStore((state) => state.setSettings);
  
  // Manejadores de eventos
  const handleAnimationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (isValidAnimationType(value)) {
      setSettings({
        currentAnimationType: value,
        animationType: value
      });
    }
  };
  
  const handleAnimationSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSettings({ animationSpeedFactor: value });
  };
  
  const handleEasingFactorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSettings({ easingFactor: value });
  };
  return (
    <div className="space-y-4">
      <Card className="border-input">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs">TIPO DE ANIMACIÓN</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <select 
            value={settings.currentAnimationType}
            onChange={handleAnimationTypeChange}
            className="w-full bg-muted text-foreground text-xs p-2 border border-input focus:outline-none"
          >
            {[
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
              { value: 'flocking', label: 'Bandadas' }
            ].map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">VELOCIDAD</label>
              <div className="flex items-center gap-2">
                <input 
                  type="range" 
                  min="0.1" 
                  max="3" 
                  step="0.1" 
                  value={settings.animationSpeedFactor}
                  onChange={handleAnimationSpeedChange}
                  className="w-full h-1.5 bg-muted rounded-sm appearance-none cursor-pointer" 
                />
                <span className="text-xs w-8 text-right">{settings.animationSpeedFactor.toFixed(1)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">ELASTICIDAD</label>
              <div className="flex items-center gap-2">
                <input 
                  type="range" 
                  min="0.01" 
                  max="1" 
                  step="0.01" 
                  value={settings.easingFactor}
                  onChange={handleEasingFactorChange}
                  className="w-full h-1.5 bg-muted rounded-sm appearance-none cursor-pointer" 
                />
                <span className="text-xs w-8 text-right">{settings.easingFactor.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-input">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs">PARÁMETROS ESPECÍFICOS</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">RADIO DE INFLUENCIA</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="5" 
                  max="50" 
                  defaultValue="20"
                  className="w-full bg-muted text-foreground text-xs p-2 border border-input focus:outline-none" 
                />
                <span className="text-xs">%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
