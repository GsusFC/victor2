import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useVectorStore } from '@/lib/store';
import { AnimationType, AspectRatio } from '@/lib/types';

interface ControlGroupProps {
  label: string;
  children: React.ReactNode;
  hidden?: boolean;
  className?: string;
}

function ControlGroup({ label, children, hidden = false, className = '' }: ControlGroupProps) {
  if (hidden) return null;
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Label className="text-xs text-gray-400 whitespace-nowrap">{label}</Label>
      {children}
    </div>
  );
}

function AspectRatioButtons() {
  const { settings, setSettings } = useVectorStore();
  
  const handleAspectChange = (ratio: AspectRatio) => {
    setSettings({ aspectRatio: ratio });
  };
  
  return (
    <div className="flex rounded-md overflow-hidden">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={settings.aspectRatio === '1:1' ? 'default' : 'outline'}
              className="rounded-r-none"
              onClick={() => handleAspectChange('1:1')}
            >
              1:1
            </Button>
          </TooltipTrigger>
          <TooltipContent>Relación de Aspecto 1:1</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={settings.aspectRatio === '16:9' ? 'default' : 'outline'}
              className="rounded-none"
              onClick={() => handleAspectChange('16:9')}
            >
              16:9
            </Button>
          </TooltipTrigger>
          <TooltipContent>Relación de Aspecto 16:9</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={settings.aspectRatio === '2:1' ? 'default' : 'outline'}
              className="rounded-l-none"
              onClick={() => handleAspectChange('2:1')}
            >
              2:1
            </Button>
          </TooltipTrigger>
          <TooltipContent>Relación de Aspecto 2:1 (Semicírculo)</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function TopBar() {
  const { settings, setSettings } = useVectorStore();
  
  const handleAnimationTypeChange = (value: string) => {
    setSettings({ currentAnimationType: value as AnimationType });
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof settings) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setSettings({ [key]: value });
    }
  };
  
  return (
    <div className="flex justify-between w-full flex-wrap gap-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={settings.currentAnimationType} onValueChange={handleAnimationTypeChange}>
          <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
            <SelectValue placeholder="Tipo de Animación" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="smoothWaves">Ondas Suaves</SelectItem>
            <SelectItem value="seaWaves">Olas de Mar</SelectItem>
            <SelectItem value="pinwheels">Molinos</SelectItem>
            <SelectItem value="centerPulse">Pulsación Central</SelectItem>
            <SelectItem value="geometricPattern">Patrón Geométrico</SelectItem>
            <SelectItem value="vortex">Vórtice / Remolino</SelectItem>
            <SelectItem value="jitter">Vibración Aleatoria</SelectItem>
            <SelectItem value="followPath">Seguir Camino</SelectItem>
            <SelectItem value="oceanCurrents">Corrientes Marinas</SelectItem>
            <SelectItem value="rippleEffect">Onda Continua</SelectItem>
            <SelectItem value="expandingWave">Onda Expansiva (Capas)</SelectItem>
            <SelectItem value="mouseInteraction">Interacción Ratón</SelectItem>
            <SelectItem value="cellularAutomata">Autómata Celular</SelectItem>
            <SelectItem value="lissajous">Lissajous</SelectItem>
            <SelectItem value="perlinFlow">Ruido Perlin</SelectItem>
            <SelectItem value="flocking">Comportamiento de Bandada</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Controles específicos por tipo de animación */}
        <ControlGroup 
          label="Radio Ratón (%):" 
          hidden={settings.currentAnimationType !== 'mouseInteraction'}
        >
          <Input 
            type="number"
            min={5}
            max={50}
            value={settings.mouseInteractionRadiusPercent}
            onChange={(e) => handleNumberChange(e, 'mouseInteractionRadiusPercent')}
            className="w-20 bg-gray-800 border-gray-700 text-right"
          />
        </ControlGroup>
        
        <ControlGroup 
          label="Nº Molinos:" 
          hidden={settings.currentAnimationType !== 'pinwheels'}
        >
          <Input 
            type="number"
            min={1}
            max={9}
            value={settings.pinwheelCount}
            onChange={(e) => handleNumberChange(e, 'pinwheelCount')}
            className="w-20 bg-gray-800 border-gray-700 text-right"
          />
        </ControlGroup>
        
        <ControlGroup 
          label="Int. Vórtice:" 
          hidden={settings.currentAnimationType !== 'vortex'}
        >
          <Input 
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={settings.vortexInwardFactor}
            onChange={(e) => handleNumberChange(e, 'vortexInwardFactor')}
            className="w-20 bg-gray-800 border-gray-700 text-right"
          />
        </ControlGroup>
        
        <ControlGroup 
          label="Int. Pulso (s):" 
          hidden={settings.currentAnimationType !== 'centerPulse'}
        >
          <Input 
            type="number"
            min={0.5}
            max={10}
            step={0.1}
            value={settings.pulseInterval}
            onChange={(e) => handleNumberChange(e, 'pulseInterval')}
            className="w-20 bg-gray-800 border-gray-700 text-right"
          />
        </ControlGroup>
        
        <ControlGroup 
          label="Int. Vibración (°):" 
          hidden={settings.currentAnimationType !== 'jitter'}
        >
          <Input 
            type="number"
            min={0}
            max={90}
            step={1}
            value={settings.jitterIntensity}
            onChange={(e) => handleNumberChange(e, 'jitterIntensity')}
            className="w-20 bg-gray-800 border-gray-700 text-right"
          />
        </ControlGroup>
        
        <ControlGroup 
          label="Vel. Onda Cont.:" 
          hidden={settings.currentAnimationType !== 'rippleEffect'}
        >
          <Input 
            type="number"
            min={0.1}
            max={5.0}
            step={0.1}
            value={settings.rippleWaveSpeed}
            onChange={(e) => handleNumberChange(e, 'rippleWaveSpeed')}
            className="w-20 bg-gray-800 border-gray-700 text-right"
          />
        </ControlGroup>
        
        <ControlGroup 
          label="Retardo Capas (ms):" 
          hidden={settings.currentAnimationType !== 'expandingWave'}
        >
          <Input 
            type="number"
            min={10}
            max={500}
            step={10}
            value={settings.expandingWaveDelay}
            onChange={(e) => handleNumberChange(e, 'expandingWaveDelay')}
            className="w-20 bg-gray-800 border-gray-700 text-right"
          />
        </ControlGroup>
        
        {/* Controles de Perlin */}
        <div 
          className={`flex items-center gap-2 ${settings.currentAnimationType !== 'perlinFlow' ? 'hidden' : ''}`}
        >
          <Label className="text-xs text-gray-400">Escala Ruido:</Label>
          <Slider 
            min={0.001}
            max={0.05}
            step={0.001}
            value={[settings.perlinNoiseScale]}
            onValueChange={(value) => setSettings({ perlinNoiseScale: value[0] })}
            className="w-24 h-2"
          />
          <span className="text-xs text-gray-400 min-w-10 text-right">
            {settings.perlinNoiseScale.toFixed(3)}
          </span>
          
          <Label className="text-xs text-gray-400 ml-2">Vel. Ruido:</Label>
          <Slider 
            min={0.1}
            max={2.0}
            step={0.1}
            value={[settings.perlinTimeSpeed]}
            onValueChange={(value) => setSettings({ perlinTimeSpeed: value[0] })}
            className="w-24 h-2"
          />
          <span className="text-xs text-gray-400 min-w-10 text-right">
            {settings.perlinTimeSpeed.toFixed(1)}
          </span>
        </div>
        
        {/* Controles de Olas de Mar */}
        <div 
          className={`flex items-center gap-2 ${settings.currentAnimationType !== 'seaWaves' ? 'hidden' : ''}`}
        >
          <Label className="text-xs text-gray-400">Frec. Onda:</Label>
          <Slider 
            min={5}
            max={30}
            step={1}
            value={[settings.seaWaveFrequency]}
            onValueChange={(value) => setSettings({ seaWaveFrequency: value[0] })}
            className="w-24 h-2"
          />
          <span className="text-xs text-gray-400 min-w-10 text-right">
            {settings.seaWaveFrequency}
          </span>
          
          <Label className="text-xs text-gray-400 ml-2">Amp. Onda (°):</Label>
          <Slider 
            min={10}
            max={90}
            step={1}
            value={[settings.seaWaveAmplitude]}
            onValueChange={(value) => setSettings({ seaWaveAmplitude: value[0] })}
            className="w-24 h-2"
          />
          <span className="text-xs text-gray-400 min-w-10 text-right">
            {settings.seaWaveAmplitude}
          </span>
        </div>
        
        {/* Controles de Bandada */}
        <div 
          className={`flex flex-wrap items-center gap-2 ${settings.currentAnimationType !== 'flocking' ? 'hidden' : ''}`}
        >
          <ControlGroup label="Nº Bandadas:">
            <Input 
              type="number"
              min={1}
              max={5}
              value={settings.flockNumFlocks}
              onChange={(e) => handleNumberChange(e, 'flockNumFlocks')}
              className="w-16 bg-gray-800 border-gray-700 text-right"
            />
          </ControlGroup>
          
          <ControlGroup label="Radio Vecindad:">
            <Input 
              type="number"
              min={50}
              max={500}
              step={10}
              value={settings.flockNeighborhoodRadius}
              onChange={(e) => handleNumberChange(e, 'flockNeighborhoodRadius')}
              className="w-20 bg-gray-800 border-gray-700 text-right"
            />
          </ControlGroup>
          
          <Label className="text-xs text-gray-400">Alineación:</Label>
          <Slider 
            min={0}
            max={1}
            step={0.1}
            value={[settings.flockAlignmentStrength]}
            onValueChange={(value) => setSettings({ flockAlignmentStrength: value[0] })}
            className="w-24 h-2"
          />
          <span className="text-xs text-gray-400 min-w-8 text-right">
            {settings.flockAlignmentStrength.toFixed(1)}
          </span>
          
          <Label className="text-xs text-gray-400">Cohesión:</Label>
          <Slider 
            min={0}
            max={1}
            step={0.1}
            value={[settings.flockCohesionStrength]}
            onValueChange={(value) => setSettings({ flockCohesionStrength: value[0] })}
            className="w-24 h-2"
          />
          <span className="text-xs text-gray-400 min-w-8 text-right">
            {settings.flockCohesionStrength.toFixed(1)}
          </span>
          
          <Label className="text-xs text-gray-400">Separación:</Label>
          <Slider 
            min={0}
            max={1}
            step={0.1}
            value={[settings.flockSeparationStrength]}
            onValueChange={(value) => setSettings({ flockSeparationStrength: value[0] })}
            className="w-24 h-2"
          />
          <span className="text-xs text-gray-400 min-w-8 text-right">
            {settings.flockSeparationStrength.toFixed(1)}
          </span>
          
          <Label className="text-xs text-gray-400">Atracción Ratón:</Label>
          <Select 
            value={settings.flockMouseAttraction ? 'on' : 'off'} 
            onValueChange={(value) => setSettings({ flockMouseAttraction: value === 'on' })}
          >
            <SelectTrigger className="w-[100px] bg-gray-800 border-gray-700 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="off">Desactivada</SelectItem>
              <SelectItem value="on">Activada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Controles Generales */}
        <ControlGroup label="Elasticidad:">
          <Input 
            type="number"
            min={0.01}
            max={1.0}
            step={0.01}
            value={settings.easingFactor}
            onChange={(e) => handleNumberChange(e, 'easingFactor')}
            className="w-20 bg-gray-800 border-gray-700 text-right"
          />
        </ControlGroup>
        
        <ControlGroup label="Velocidad:">
          <Input 
            type="number"
            min={0.1}
            max={2}
            step={0.1}
            value={settings.animationSpeedFactor}
            onChange={(e) => handleNumberChange(e, 'animationSpeedFactor')}
            className="w-20 bg-gray-800 border-gray-700 text-right"
          />
        </ControlGroup>
      </div>
      
      <div className="flex items-center gap-3">
        <AspectRatioButtons />
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center h-9 px-3 rounded-md bg-gray-800 border border-gray-700 gap-2">
                <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                <Input 
                  type="number"
                  min={3}
                  value={settings.gridRows}
                  onChange={(e) => handleNumberChange(e, 'gridRows')}
                  className="w-14 bg-transparent border-none p-0 text-right"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>Número de Filas</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center h-9 px-3 rounded-md bg-gray-800 border border-gray-700 gap-2">
                <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 12h16m-4-4 4 4m0 0-4 4m-12-4 4 4m-4-4 4-4" />
                </svg>
                <Input 
                  type="number"
                  min={10}
                  step={1}
                  value={settings.vectorSpacing}
                  onChange={(e) => handleNumberChange(e, 'vectorSpacing')}
                  className="w-14 bg-transparent border-none p-0 text-right"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>Espaciado entre Vectores</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
