import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVectorStore } from '@/lib/store';
import { LineCap } from '@/lib/types';
import { isValidVectorShape } from '@/components/vector/core/types';
import { exportDialogState } from '@/hooks/vector/useExportDialog';
import { RotationOriginControl } from '@/components/vector/ui/RotationOriginControl';
import '@/styles/vector-properties.css';

export function VectorProperties() {  
  const settings = useVectorStore((state) => state.settings);
  const {
    updateSetting,
    setVectorShape,
    setLineCap
  } = useVectorStore((state) => state.actions);
  
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
    <div className="space-y-4 vector-properties">
      <Card className="border-input">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-mono uppercase">Grid de Vectores</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
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
                  value={settings.gridRows || 10} /* Valor por defecto si es undefined */
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
                  type="range"
                  min="10" 
                  max="100" 
                  step="5"
                  value={settings.vectorSpacing || 30}
                  onChange={handleSpacingChange}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  title="Ajusta la distancia entre los vectores"
                />
                <input 
                  type="number"
                  min="10" 
                  max="100"
                  step="5"
                  value={settings.vectorSpacing || 30}
                  onChange={handleSpacingChange}
                  className="w-16 bg-muted text-foreground text-xs p-1 pl-2 pr-1 border border-input focus:outline-none font-mono appearance-auto"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-mono opacity-70">Distancia entre vectores</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-input">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-mono uppercase">Estilo del Vector</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-muted-foreground font-mono uppercase">Forma</label>
                  <span className="text-xs font-mono">
                    {settings.vectorShape || 'line'}
                  </span>
                </div>
                <select 
                  value={isValidVectorShape(settings.vectorShape) ? settings.vectorShape : 'line'}
                  onChange={handleVectorShapeChange}
                  className="w-full bg-muted text-foreground text-xs p-2 border border-input focus:outline-none"
                >
                  <option value="line">Línea</option>
                  <option value="arrow">Flecha</option>
                  <option value="dot">Punto</option>
                  <option value="triangle">Triángulo</option>
                  <option value="semicircle">Semicircunferencia</option>
                  <option value="curve">Curva</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1 font-mono opacity-70">Tipo de vector</p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-muted-foreground font-mono uppercase">Acabado</label>
                  <span className="text-xs font-mono">
                    {settings.strokeLinecap || 'round'}
                  </span>
                </div>
                <select 
                  value={settings.strokeLinecap || 'round'}
                  onChange={handleVectorLineCapChange}
                  className="w-full bg-muted text-foreground text-xs p-2 border border-input focus:outline-none"
                >
                  <option value="butt">Plano</option>
                  <option value="round">Redondeado</option>
                  <option value="square">Cuadrado</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1 font-mono opacity-70">Extremos de línea</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-muted-foreground font-mono uppercase">Color</label>
                <div 
                  className="w-5 h-5 rounded-sm border border-input" 
                  style={{ backgroundColor: settings.vectorColor || '#ffffff' }} 
                />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="color" 
                  value={settings.vectorColor || '#000000'}
                  onChange={handleVectorColorChange}
                  className="w-8 h-8 p-0 bg-transparent border-0 cursor-pointer" 
                />
                <input 
                  type="text" 
                  value={settings.vectorColor || '#000000'}
                  onChange={handleVectorColorChange}
                  className="flex-1 bg-muted text-foreground text-xs p-2 border border-input focus:outline-none font-mono uppercase"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-mono opacity-70">HEX o selector</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-input">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-mono uppercase">Dimensiones</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-muted-foreground font-mono uppercase">Longitud</label>
                <span className="text-xs font-mono">
                  {settings.vectorLength || 20}px
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
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
                    console.log('Grosor actualizado a:', value);
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
                    console.log('Grosor actualizado a:', value);
                  }}
                  className="w-16 bg-muted text-foreground text-xs p-1 pl-2 pr-1 border border-input focus:outline-none font-mono appearance-auto"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-mono opacity-70">Grosor del trazo de cada vector</p>
            </div>
            
            <RotationOriginControl />

            {/* Eliminado selector isStrokeVariabilityActive que no existe en VectorSettings */}
          </div>
        </CardContent>
      </Card>

      <Card className="border-input">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-mono uppercase">Acciones</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => exportDialogState.openDialog()}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs py-2 px-3 font-mono uppercase flex items-center justify-center"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar Código
            </button>
            <p className="text-xs text-muted-foreground text-center mt-1 font-mono opacity-70">Código SVG</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
