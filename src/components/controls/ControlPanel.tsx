import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useVectorStore } from '@/lib/store';
import { Input } from "@/components/ui/input";
import { AnimationType, VectorShape, LineCap, AspectRatio } from '@/lib/types';

interface ControlPanelProps {
  onExportClick: () => void;
}

export function ControlPanel({ onExportClick }: ControlPanelProps) {
  const { settings, setSettings } = useVectorStore((state) => ({
    settings: state.settings,
    setSettings: state.setSettings,
  }));

  // Handler para cambio de tipo de animación
  const handleAnimationTypeChange = (value: string) => {
    setSettings({ currentAnimationType: value as AnimationType });
  };

  // Handler para vectores
  const handleVectorShapeChange = (value: string) => {
    setSettings({ vectorShape: value as VectorShape });
  };

  const handleVectorLineCapChange = (value: string) => {
    setSettings({ vectorLineCap: value as LineCap });
  };

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
    { value: 'flocking', label: 'Bandadas' }
  ];

  return (
    <Tabs defaultValue="animation" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="animation">Animación</TabsTrigger>
        <TabsTrigger value="vectors">Vectores</TabsTrigger>
        <TabsTrigger value="actions">Acciones</TabsTrigger>
      </TabsList>
      
      <TabsContent value="animation" className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tipo de Animación</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={settings.currentAnimationType}
              onValueChange={handleAnimationTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {animationTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Velocidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="speed" className="text-xs">Velocidad</Label>
                <Slider
                  id="speed"
                  className="col-span-2"
                  min={0.1}
                  max={3}
                  step={0.1}
                  value={[settings.animationSpeedFactor]}
                  onValueChange={([value]) => setSettings({ animationSpeedFactor: value })}
                />
              </div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="easing" className="text-xs">Suavizado</Label>
                <Slider
                  id="easing"
                  className="col-span-2"
                  min={0.01}
                  max={0.3}
                  step={0.01}
                  value={[settings.easingFactor]}
                  onValueChange={([value]) => setSettings({ easingFactor: value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Parámetros específicos basados en el tipo de animación */}
        {settings.currentAnimationType === 'pinwheels' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Parámetros de Molinetes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="pinwheelCount" className="text-xs">Cantidad</Label>
                  <Slider
                    id="pinwheelCount"
                    className="col-span-2"
                    min={1}
                    max={10}
                    step={1}
                    value={[settings.pinwheelCount]}
                    onValueChange={([value]) => setSettings({ pinwheelCount: value })}
                  />
                </div>
                
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="vortexFactor" className="text-xs">Intensidad</Label>
                  <Slider
                    id="vortexFactor"
                    className="col-span-2"
                    min={0.1}
                    max={1}
                    step={0.1}
                    value={[settings.vortexInwardFactor]}
                    onValueChange={([value]) => setSettings({ vortexInwardFactor: value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {settings.currentAnimationType === 'jitter' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Parámetros de Vibraciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="jitterIntensity" className="text-xs">Intensidad</Label>
                  <Slider
                    id="jitterIntensity"
                    className="col-span-2"
                    min={1}
                    max={50}
                    step={1}
                    value={[settings.jitterIntensity]}
                    onValueChange={([value]) => setSettings({ jitterIntensity: value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
      
      <TabsContent value="vectors" className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Propiedades de Vectores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="vectorLength" className="text-xs">Longitud</Label>
                <Slider
                  id="vectorLength"
                  className="col-span-2"
                  min={5}
                  max={30}
                  step={1}
                  value={[settings.vectorLength]}
                  onValueChange={([value]) => setSettings({ vectorLength: value })}
                />
              </div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="vectorSpacing" className="text-xs">Espaciado</Label>
                <Slider
                  id="vectorSpacing"
                  className="col-span-2"
                  min={20}
                  max={80}
                  step={5}
                  value={[settings.vectorSpacing]}
                  onValueChange={([value]) => setSettings({ vectorSpacing: value })}
                />
              </div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="strokeWidth" className="text-xs">Grosor</Label>
                <Slider
                  id="strokeWidth"
                  className="col-span-2"
                  min={0.5}
                  max={3}
                  step={0.1}
                  value={[settings.vectorStrokeWidth]}
                  onValueChange={([value]) => setSettings({ vectorStrokeWidth: value })}
                />
              </div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="vectorColor" className="text-xs">Color</Label>
                <div className="flex items-center gap-2 col-span-2">
                  <Input
                    id="vectorColor"
                    type="color"
                    className="w-10 h-10 p-1"
                    value={settings.vectorColor}
                    onChange={(e) => setSettings({ vectorColor: e.target.value })}
                  />
                  <Input
                    type="text"
                    className="flex-1"
                    value={settings.vectorColor}
                    onChange={(e) => setSettings({ vectorColor: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="vectorShape" className="text-xs">Forma</Label>
                <Select
                  value={settings.vectorShape}
                  onValueChange={handleVectorShapeChange}
                >
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Seleccionar forma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Línea</SelectItem>
                    <SelectItem value="curved">Curva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="vectorLineCap" className="text-xs">Terminal</Label>
                <Select
                  value={settings.vectorLineCap}
                  onValueChange={handleVectorLineCapChange}
                >
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Seleccionar terminal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="butt">Plano</SelectItem>
                    <SelectItem value="round">Redondeado</SelectItem>
                    <SelectItem value="square">Cuadrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="actions" className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Controles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                onClick={onExportClick}
                className="w-full"
              >
                Exportar Código
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Densidad de Vectores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="gridRows" className="text-xs">Número filas</Label>
                <Slider
                  id="gridRows"
                  className="col-span-2"
                  min={10}
                  max={50}
                  step={5}
                  value={[settings.gridRows]}
                  onValueChange={([value]) => setSettings({ gridRows: value })}
                />
              </div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="aspectRatio" className="text-xs">Ratio Aspecto</Label>
                <Select
                  value={settings.aspectRatio}
                  onValueChange={(value) => setSettings({ aspectRatio: value as AspectRatio })}
                >
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Seleccionar ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Pantalla)</SelectItem>
                    <SelectItem value="4:3">4:3 (Clásico)</SelectItem>
                    <SelectItem value="1:1">1:1 (Cuadrado)</SelectItem>
                    <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
