import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVectorStore } from '@/lib/store';
import { isValidAnimationType } from "../vector/core/types";
import "@/styles/animation-controls.css";

export function AnimationControls() {
  const settings = useVectorStore((state) => state.settings);
  const { 
    setAnimationType, 
    updateSetting 
  } = useVectorStore((state) => state.actions);
  
  // Manejadores de eventos
  const handleAnimationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (isValidAnimationType(value)) {
      setAnimationType(value);
    }
  };
  
  const handleAnimationSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    updateSetting('animationSpeedFactor', value);
  };
  
  const handleEasingFactorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    updateSetting('easingFactor', value);
  };
  return (
    <div className="space-y-2 font-mono animation-controls">
      <Card className="border-input">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-mono font-medium tracking-wide">TIPO DE ANIMACIÓN</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <select 
            value={settings.currentAnimationType}
            onChange={handleAnimationTypeChange}
            className="w-full bg-muted text-foreground text-xs p-2 border border-input rounded-none focus:outline-none focus:ring-1 focus:ring-ring font-mono"
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
              { value: 'flocking', label: 'Bandadas' },
              { value: 'geometricPattern', label: 'Patrón Geométrico' },
              { value: 'lissajous', label: 'Lissajous' },
              { value: 'waterfall', label: 'Cascada' }
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
                  className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
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
                  className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                />
                <span className="text-xs w-8 text-right">{settings.easingFactor.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {['geometricPattern', 'lissajous', 'waterfall', 'mouseInteraction'].includes(settings.currentAnimationType) && (
        <Card className="border-input">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs">PARÁMETROS ESPECÍFICOS</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-4">
              {/* Controles para Patrón Geométrico */}
              {settings.currentAnimationType === 'geometricPattern' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">TAMAÑO DEL PATRÓN</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="5" 
                      max="50" 
                      step="1" 
                      value={settings.geometricPatternSize}
                      onChange={(e) => updateSetting('geometricPatternSize', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                    />
                    <span className="text-xs w-8 text-right">{settings.geometricPatternSize}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">COMPLEJIDAD</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      step="1" 
                      value={settings.geometricPatternComplexity}
                      onChange={(e) => updateSetting('geometricPatternComplexity', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                    />
                    <span className="text-xs w-8 text-right">{settings.geometricPatternComplexity}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">VELOCIDAD DE ROTACIÓN</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="0.1" 
                      max="2" 
                      step="0.1" 
                      value={settings.geometricPatternRotationSpeed ?? 0.01} 
                      onChange={(e) => updateSetting('geometricPatternRotationSpeed', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                    />
                    <span className="text-xs w-8 text-right">{(settings.geometricPatternRotationSpeed ?? 0.01).toFixed(3)}</span>
                  </div>
                </div>
              </>
            )}

            {/* Controles para Lissajous */}
            {settings.currentAnimationType === 'lissajous' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">PARÁMETRO A</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      step="1" 
                      value={settings.lissajousParamA}
                      onChange={(e) => updateSetting('lissajousParamA', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                    />
                    <span className="text-xs w-8 text-right">{settings.lissajousParamA}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">PARÁMETRO B</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      step="1" 
                      value={settings.lissajousParamB}
                      onChange={(e) => updateSetting('lissajousParamB', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                    />
                    <span className="text-xs w-8 text-right">{settings.lissajousParamB}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">FRECUENCIA</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="0.0001" 
                      max="0.005" 
                      step="0.0001" 
                      value={settings.lissajousFrequency ?? 0.01}
                      onChange={(e) => updateSetting('lissajousFrequency', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                    />
                    <span className="text-xs w-8 text-right">{(settings.lissajousFrequency ?? 0.01).toFixed(3)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">DELTA (FASE)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="0" 
                      max="6.28318" // 2 * PI
                      step="0.01" 
                      value={settings.lissajousDelta ?? Math.PI / 2}
                      onChange={(e) => updateSetting('lissajousDelta', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                    />
                    <span className="text-xs w-8 text-right">{(settings.lissajousDelta ?? Math.PI / 2).toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}

            {/* Controles para Cascada */}
            {settings.currentAnimationType === 'waterfall' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">TURBULENCIA</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="0" 
                      max="50" 
                      step="1" 
                      value={settings.waterfallTurbulence}
                      onChange={(e) => updateSetting('waterfallTurbulence', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                    />
                    <span className="text-xs w-8 text-right">{settings.waterfallTurbulence}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">VELOCIDAD DE TURBULENCIA</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="0.0001" 
                      max="0.01" 
                      step="0.0001" 
                      value={settings.waterfallTurbulenceSpeed ?? 0.003}
                      onChange={(e) => updateSetting('waterfallTurbulenceSpeed', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                    />
                    <span className="text-xs w-8 text-right">{(settings.waterfallTurbulenceSpeed ?? 0.003).toFixed(3)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">FACTOR DE DESFASE</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05" 
                      value={settings.waterfallOffsetFactor ?? 0.2}
                      onChange={(e) => updateSetting('waterfallOffsetFactor', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                    />
                    <span className="text-xs w-8 text-right">{(settings.waterfallOffsetFactor ?? 0.2).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">CICLO DE GRAVEDAD (MS)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="500" 
                      max="5000" 
                      step="100" 
                      value={settings.waterfallGravityCycle}
                      onChange={(e) => updateSetting('waterfallGravityCycle', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                    />
                    <span className="text-xs w-8 text-right">{settings.waterfallGravityCycle}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">INTENSIDAD DE GRAVEDAD</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={settings.waterfallGravityStrength ?? 0.5}
                      onChange={(e) => updateSetting('waterfallGravityStrength', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                    />
                    <span className="text-xs w-8 text-right">{(settings.waterfallGravityStrength ?? 0.5).toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">ESTIRAMIENTO MÁXIMO</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="0.5" 
                      max="5" 
                      step="0.1" 
                      value={settings.waterfallMaxStretch ?? 1.5}
                      onChange={(e) => updateSetting('waterfallMaxStretch', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                    />
                    <span className="text-xs w-8 text-right">{(settings.waterfallMaxStretch ?? 1.5).toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">INTENSIDAD DE DERIVA</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05" 
                      value={settings.waterfallDriftStrength ?? 0.2}
                      onChange={(e) => updateSetting('waterfallDriftStrength', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                    />
                    <span className="text-xs w-8 text-right">{(settings.waterfallDriftStrength ?? 0.2).toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
            
            {settings.currentAnimationType === 'mouseInteraction' && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">RADIO DE INFLUENCIA</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="5" 
                    max="50" 
                    value={settings.mouseAttractionRadius}
                    onChange={(e) => updateSetting('mouseAttractionRadius', parseInt(e.target.value))}
                    className="w-full bg-muted text-foreground text-xs p-2 border border-input rounded-none focus:outline-none focus:ring-1 focus:ring-muted-foreground font-mono" 
                  />
                  <span className="text-xs">%</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
