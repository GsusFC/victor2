import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVectorStore } from '@/lib/store';
import { VectorShape, LineCap } from '@/lib/types';

interface ControlGroupProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

function ControlGroup({ label, children, className = '' }: ControlGroupProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Label className="text-xs text-gray-400 whitespace-nowrap">{label}</Label>
      {children}
    </div>
  );
}

export function BottomBar({ onExportClick }: { onExportClick: () => void }) {
  const { settings, setSettings } = useVectorStore((state) => ({
    settings: state.settings,
    setSettings: state.setSettings,
  }));
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof settings) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setSettings({ [key]: value });
    }
  };
  
  const handleVectorShapeChange = (value: string) => {
    setSettings({ vectorShape: value as VectorShape });
  };
  
  const handleLineCapChange = (value: string) => {
    setSettings({ vectorLineCap: value as LineCap });
  };
  
  const handleStrokeVariabilityChange = (value: string) => {
    setSettings({ isStrokeVariabilityActive: value === 'on' });
  };
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ vectorColor: e.target.value });
  };
  
  return (
    <div className="flex justify-between w-full flex-wrap gap-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Select 
          value={settings.vectorShape || 'curved'} 
          onValueChange={handleVectorShapeChange}
        >
          <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700">
            <SelectValue placeholder="Forma" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="curved">Curvo</SelectItem>
            <SelectItem value="straight">Recto</SelectItem>
            <SelectItem value="semicircle">Semicírculo</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={settings.vectorLineCap || 'butt'} 
          onValueChange={handleLineCapChange}
        >
          <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700">
            <SelectValue placeholder="Acabado" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="butt">Recto</SelectItem>
            <SelectItem value="round">Redondeado</SelectItem>
            <SelectItem value="square">Cuadrado</SelectItem>
          </SelectContent>
        </Select>
        
        <ControlGroup label="Longitud">
          <Input 
            type="number"
            min={2}
            value={settings.vectorLength}
            onChange={(e) => handleNumberChange(e, 'vectorLength')}
            className="w-20 bg-gray-800 border-gray-700 text-right"
          />
        </ControlGroup>
        
        <ControlGroup label="Grosor">
          <Input 
            type="number"
            min={0.5}
            max={10}
            step={0.1}
            value={settings.vectorStrokeWidth}
            onChange={(e) => handleNumberChange(e, 'vectorStrokeWidth')}
            className="w-20 bg-gray-800 border-gray-700 text-right"
          />
        </ControlGroup>
        
        <ControlGroup label="Color:">
          <Input 
            type="color"
            value={settings.vectorColor}
            onChange={handleColorChange}
            className="w-12 h-9 p-1 bg-gray-800 border-gray-700 cursor-pointer"
          />
        </ControlGroup>
        
        <Select 
          value={settings.isStrokeVariabilityActive ? 'on' : 'off'} 
          onValueChange={handleStrokeVariabilityChange}
        >
          <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="off">Grosor: Fijo</SelectItem>
            <SelectItem value="on">Grosor: Variable</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          onClick={onExportClick}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Exportar
        </Button>
      </div>
    </div>
  );
}
