'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useVectorStore } from '@/lib/store';
import { isValidAnimationType, isValidVectorShape } from "../vector/core/types";
import { LineCap } from '@/lib/types';
import { exportDialogState } from '@/hooks/vector/useExportDialog';
import { RotationOriginControl } from '@/components/vector/ui/RotationOriginControl';
import "@/styles/animation-controls.css";
import "@/styles/vector-properties.css";

export function UnifiedControlPanel() {
  // Mantener exactamente los mismos hooks y handlers que ya existen
  const settings = useVectorStore((state) => state.settings);
  const { 
    setAnimationType, 
    updateSetting,
    setVectorShape,
    setLineCap,
    resetSettings
  } = useVectorStore((state) => state.actions);
  
  // Manejadores para animación
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

  // Manejadores para grid y dimensiones
  const handleGridRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 3 && value <= 50) {
      updateSetting('gridRows', value);
    }
  };
  
  const handleSpacingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 10 && value <= 100) {
      updateSetting('vectorSpacing', value);
    }
  };
  
  // Manejadores para propiedades de vectores
  const handleVectorShapeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (isValidVectorShape(value)) {
      setVectorShape(value);
    } else {
      console.warn(`Invalid vector shape value received: ${value}`);
      setVectorShape('line'); 
    }
  };
  
  const handleVectorLineCapChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLineCap(e.target.value as LineCap);
  };
  
  const handleVectorColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSetting('vectorColor', e.target.value);
  };
  
  const handleVectorLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      updateSetting('vectorLength', value);
    }
  };
  
  return (
    <div className="space-y-2 font-mono">
      <Card className="border-input">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-mono font-medium tracking-wide">CONTROLES UNIFICADOS</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Accordion type="multiple" defaultValue={["animation-type", "grid", "vector-props"]} className="font-mono">
            {/* Sección 1: Tipo de Animación */}
            <AccordionItem value="animation-type">
              <AccordionTrigger className="text-xs font-mono uppercase hover:bg-muted">
                Tipo de Animación
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
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
                      { value: 'vortex', label: 'Vórtice' },
                      { value: 'geometricPattern', label: 'Patrón Geométrico' },
                      { value: 'followPath', label: 'Seguir Camino' },
                      { value: 'lissajous', label: 'Lissajous' }
                    ].map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>

                  <div className="space-y-4">
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

                  {/* Parámetros específicos según tipo de animación */}
                  {settings.currentAnimationType === 'seaWaves' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">FRECUENCIA</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range" 
                            min="0.001" 
                            max="0.1" 
                            step="0.001" 
                            value={settings.seaWaveFrequency}
                            onChange={(e) => updateSetting('seaWaveFrequency', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                          />
                          <span className="text-xs w-8 text-right">{settings.seaWaveFrequency.toFixed(3)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">AMPLITUD</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range" 
                            min="1" 
                            max="90" 
                            step="1" 
                            value={settings.seaWaveAmplitude}
                            onChange={(e) => updateSetting('seaWaveAmplitude', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                          />
                          <span className="text-xs w-8 text-right">{settings.seaWaveAmplitude}°</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Parámetros para pulso */}
                  {settings.currentAnimationType === 'centerPulse' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">INTERVALO DE PULSO</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range" 
                            min="500" 
                            max="5000" 
                            step="100" 
                            value={settings.pulseInterval}
                            onChange={(e) => updateSetting('pulseInterval', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                          />
                          <span className="text-xs w-12 text-right">{settings.pulseInterval}ms</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">DURACIÓN DEL PULSO</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range" 
                            min="100" 
                            max="2000" 
                            step="50" 
                            value={settings.pulseDuration}
                            onChange={(e) => updateSetting('pulseDuration', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                          />
                          <span className="text-xs w-12 text-right">{settings.pulseDuration}ms</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Parámetros Lissajous */}
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
                            value={settings.lissajousFrequency}
                            onChange={(e) => updateSetting('lissajousFrequency', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                          />
                          <span className="text-xs w-14 text-right">{settings.lissajousFrequency.toFixed(4)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">DIFERENCIA DE FASE (GRADOS)</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            step="5" 
                            value={Math.round((settings.lissajousDelta * 180 / Math.PI))}
                            onChange={(e) => {
                              const degrees = parseInt(e.target.value);
                              const radians = degrees * Math.PI / 180;
                              updateSetting('lissajousDelta', radians);
                            }}
                            className="w-full h-1.5 bg-muted rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-input [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-input" 
                          />
                          <span className="text-xs w-8 text-right">{Math.round((settings.lissajousDelta * 180 / Math.PI))}°</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Parámetro ratón */}
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
              </AccordionContent>
            </AccordionItem>
            
            {/* Sección 2: Grid y Espaciado */}
            <AccordionItem value="grid">
              <AccordionTrigger className="text-xs font-mono uppercase hover:bg-muted">
                Grid y Espaciado
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-muted-foreground font-mono uppercase">Filas 
                        <span className="ml-1 text-xs opacity-60">(3-50)</span>
                      </label>
                      <span className="text-xs font-mono">
                        {settings.gridRows || 10}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <input 
                        type="number" 
                        min="3" 
                        max="50" 
                        value={settings.gridRows || 10}
                        onChange={handleGridRowsChange}
                        className="w-full bg-muted text-foreground text-xs p-1 pl-2 pr-1 border border-input focus:outline-none focus:ring-1 focus:ring-primary appearance-auto" 
                        title="Ajusta el número de filas en la cuadrícula de vectores (entre 3 y 50)"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-mono opacity-70">Filas en el canvas</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-muted-foreground font-mono uppercase">Espaciado
                        <span className="ml-1 text-xs opacity-60">(10-100px)</span>
                      </label>
                      <span className="text-xs font-mono">
                        {settings.vectorSpacing || 30}px
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <input 
                        type="number" 
                        min="10" 
                        max="100" 
                        value={settings.vectorSpacing || 30}
                        onChange={handleSpacingChange}
                        className="w-full bg-muted text-foreground text-xs p-1 pl-2 pr-1 border border-input focus:outline-none focus:ring-1 focus:ring-primary appearance-auto" 
                        title="Ajusta el espaciado entre vectores (entre 10 y 100 píxeles)"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-mono opacity-70">Separación entre vectores</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Sección 3: Propiedades de Vectores */}
            <AccordionItem value="vector-props">
              <AccordionTrigger className="text-xs font-mono uppercase hover:bg-muted">
                Propiedades de Vectores
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-mono uppercase">Forma</label>
                    <select 
                      value={settings.vectorShape}
                      onChange={handleVectorShapeChange}
                      className="w-full bg-muted text-foreground text-xs p-2 border border-input rounded-none focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                    >
                      <option value="line">Línea</option>
                      <option value="arrow">Flecha</option>
                      <option value="dot">Punto</option>
                      <option value="triangle">Triángulo</option>
                      <option value="semicircle">Semicírculo</option>
                      <option value="curve">Curva</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-mono uppercase">Tipo de Trazo</label>
                    <select 
                      value={settings.strokeLinecap}
                      onChange={handleVectorLineCapChange}
                      className="w-full bg-muted text-foreground text-xs p-2 border border-input rounded-none focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                    >
                      <option value="round">Redondeado</option>
                      <option value="square">Cuadrado</option>
                      <option value="butt">Recto</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-mono uppercase">Color</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={settings.vectorColor}
                        onChange={handleVectorColorChange}
                        className="w-10 h-10 bg-muted p-1 border border-input rounded-none"
                        title="Selecciona un color para los vectores"
                      />
                      <input 
                        type="text" 
                        value={settings.vectorColor}
                        onChange={handleVectorColorChange}
                        className="w-full bg-muted text-foreground text-xs p-2 border border-input rounded-none focus:outline-none focus:ring-1 focus:ring-muted-foreground font-mono"
                        placeholder="#FFFFFF" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-mono uppercase">Longitud</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range" 
                        min="1" 
                        max="200" 
                        value={settings.vectorLength || 20}
                        onChange={handleVectorLengthChange}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        title="Ajusta la longitud de cada vector"
                      />
                      <input 
                        type="number" 
                        min="1" 
                        value={settings.vectorLength || 20}
                        onChange={handleVectorLengthChange}
                        className="w-16 bg-muted text-foreground text-xs p-1 pl-2 pr-1 border border-input focus:outline-none font-mono appearance-auto"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-mono opacity-70">Longitud de cada vector</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-muted-foreground font-mono uppercase">Grosor</label>
                      <span className="text-xs font-mono">
                        {settings.vectorStrokeWidth || 1}px
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <input 
                        type="range"
                        min="0.1" 
                        max="30" 
                        step="0.5"
                        value={settings.vectorStrokeWidth || 1}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          updateSetting('vectorStrokeWidth', value);
                          updateSetting('vectorWidth', value);
                        }}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        title="Ajusta el grosor del trazo de cada vector"
                      />
                      <input 
                        type="number" 
                        min="0.1" 
                        step="0.5"
                        value={settings.vectorStrokeWidth || 1}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 1;
                          updateSetting('vectorStrokeWidth', value);
                          updateSetting('vectorWidth', value);
                        }}
                        className="w-16 bg-muted text-foreground text-xs p-1 pl-2 pr-1 border border-input focus:outline-none font-mono appearance-auto"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-mono opacity-70">Grosor del trazo de cada vector</p>
                  </div>
                  
                  <RotationOriginControl />
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Sección 4: Acciones */}
            <AccordionItem value="actions">
              <AccordionTrigger className="text-xs font-mono uppercase hover:bg-muted">
                Acciones
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <button 
                    onClick={() => exportDialogState.openDialog()}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs py-2 px-3 font-mono uppercase flex items-center justify-center"
                  >
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Exportar Código
                  </button>
                  
                  <button 
                    onClick={() => resetSettings()}
                    className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs py-2 px-3 font-mono uppercase flex items-center justify-center"
                  >
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reiniciar
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
