import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVectorStore } from '@/lib/store';
import { Check, Download, Clipboard, Code2, FileCode } from 'lucide-react';
import type { ExtendedVectorItem } from '@/components/vector/core/vectorTypes';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'svg' | 'js' | 'framer'>('svg');

  // Acceder a los datos necesarios del store de forma optimizada
  const svgLines = useVectorStore((state) => state.svgLines);
  const settings = useVectorStore((state) => state.settings);
  
  // Obtener dimensiones calculadas del store
  const calculatedValues = useVectorStore((state) => state.calculatedValues);
  const logicalWidth = calculatedValues?.logicalWidth || 800;
  const logicalHeight = calculatedValues?.logicalHeight || 600;
  const gridCols = calculatedValues?.gridCols || 20;

  const handleCopy = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`Código ${type} copiado!`);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Error al copiar el texto: ', err);
      setCopySuccess('Error al copiar');
      setTimeout(() => setCopySuccess(null), 2000);
    }
  }, []);

  const handleDownload = useCallback((content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Generar código SVG con useMemo para rendimiento
  const svgCode = useMemo(() => {
    const svgWidth = 800;
    const svgHeight = svgWidth / (settings?.aspectRatio === '1:1' ? 1 : settings?.aspectRatio === '16:9' ? 16/9 : 2);
    
    if (!svgLines?.length || !settings) return '<!-- No hay datos suficientes para exportar -->';

    // Función centralizada para crear elementos SVG que captura la posición real
    const createSvgElement = (vector: ExtendedVectorItem): string => {
      // Extraer los datos del vector
      const { id, shape, baseX, baseY, currentAngle, lengthFactor = 1.0 } = vector;
      
      // Calcular la longitud actual del vector (considerando el factor dinámico si existe)
      const actualLength = settings.vectorLength * (lengthFactor || 1.0);
      
      // Propiedades de estilo comunes
      const stroke = `stroke="${settings.vectorColor}" stroke-width="${settings.vectorStrokeWidth}" stroke-linecap="${settings.strokeLinecap}"`;
      
      // Para la rotación, necesitamos el punto de origen correcto
      // Usar rotationOrigin si está disponible, de lo contrario usar 'center'
      const rotationOrigin = settings.rotationOrigin || 'center';
      
      // Calcular el offset de rotación basado en el punto de origen
      let rotationOffsetX = 0;
      switch (rotationOrigin) {
        case 'start':
          rotationOffsetX = 0;
          break;
        case 'center':
          rotationOffsetX = actualLength / 2;
          break;
        case 'end':
          rotationOffsetX = actualLength;
          break;
      }
      
      // Transformación que incluye la posición real y el ángulo actual
      const transform = `transform="translate(${baseX}, ${baseY}) rotate(${currentAngle}, ${rotationOffsetX}, 0)"`;
      
      // Manejar las diferentes formas de vectores
      switch(shape) {
        case 'line':
          // Línea simple
          return `<line id="${id}" x1="0" y1="0" x2="${actualLength}" y2="0" ${stroke} ${transform} />`;
        
        case 'arrow':
          // Flecha - línea con punta de flecha
          const arrowSize = actualLength * 0.25;
          return `<g id="${id}" ${transform}>
            <line x1="0" y1="0" x2="${actualLength}" y2="0" ${stroke} />
            <polygon points="${actualLength},0 ${actualLength-arrowSize},-${arrowSize/2} ${actualLength-arrowSize},${arrowSize/2}" fill="${settings.vectorColor}" />
          </g>`;
        
        case 'dot':
          // Punto - círculo pequeño
          const dotRadius = actualLength * 0.15;
          return `<circle id="${id}" cx="${actualLength/2}" cy="0" r="${dotRadius}" fill="${settings.vectorColor}" ${transform} />`;
        
        case 'triangle':
          // Triángulo
          const tipX = actualLength; // Solo en el eje X para que la rotación funcione 
          const angle1 = Math.PI * 0.8; // 144 grados
          const angle2 = -Math.PI * 0.8; // -144 grados
          const p1X = actualLength * 0.4 * Math.cos(angle1);
          const p1Y = actualLength * 0.4 * Math.sin(angle1);
          const p2X = actualLength * 0.4 * Math.cos(angle2);
          const p2Y = actualLength * 0.4 * Math.sin(angle2);
          
          return `<polygon id="${id}" points="${tipX},0 ${p1X},${p1Y} ${p2X},${p2Y}" fill="${settings.vectorColor}" ${transform} />`;
        
        case 'semicircle':
          // Implementación semicircunferencia
          const radius = actualLength / 2;
          const semicirclePath = `M 0 0 A ${radius} ${radius} 0 0 1 ${actualLength} 0`;
          
          return `<path id="${id}" d="${semicirclePath}" fill="none" stroke="${settings.vectorColor}" stroke-width="${settings.vectorStrokeWidth}" stroke-linecap="${settings.strokeLinecap}" ${transform} />`;
        
        case 'curve':
          // Implementar curva
          const curveHeight = actualLength * 0.3; // Altura de la curva = 30% de la longitud
          const curvePath = `M 0 0 Q ${actualLength/2} ${-curveHeight} ${actualLength} 0`;
          
          return `<path id="${id}" d="${curvePath}" fill="none" stroke="${settings.vectorColor}" stroke-width="${settings.vectorStrokeWidth}" stroke-linecap="${settings.strokeLinecap}" ${transform} />`;
        
        default:
          // Por defecto, devolver una línea simple
          return `<line id="${id}" x1="0" y1="0" x2="${actualLength}" y2="0" ${stroke} ${transform} />`;
      }
    };

    // Generar SVG con todos los vectores posicionados exactamente como están en la animación
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${logicalWidth} ${logicalHeight}" width="${svgWidth}" height="${svgHeight}" id="vectorSvg" style="background-color: ${settings.backgroundColor}">
  ${svgLines.map((vector) => createSvgElement(vector)).join('\n  ')}
</svg>`;
  }, [svgLines, settings, logicalWidth, logicalHeight]);

  // Generar código JavaScript con useMemo para rendimiento
  const jsCode = useMemo(() => {
    // Crear un objeto de configuración para serializar a JSON
    const settingsObj = settings ? {
      gridRows: settings.gridRows,
      vectorSpacing: settings.vectorSpacing,
      vectorLength: settings.vectorLength,
      vectorWidth: settings.vectorWidth,
      vectorColor: settings.vectorColor,
      vectorShape: settings.vectorShape,
      animationType: settings.animationType,
      backgroundColor: settings.backgroundColor,
      aspectRatio: settings.aspectRatio
    } : {};
    
    // Metadatos para el código
    const config = settings ? {
      rows: settings.gridRows,
      cols: gridCols,
      settings: settingsObj
    } : {};
    
    // Validación general
    if (!settings || !svgLines) return '// Error: configuración incompleta';

    // Generar un esqueleto de código JS para animación
    return `// Vector Animation - Exportado desde VectorNext
// ${new Date().toLocaleString()}
// Configuración: ${settings.animationType}, ${settings.gridRows}x${gridCols}

// Inicialización del canvas y los vectores
const canvas = document.getElementById('vectorCanvas');
const ctx = canvas.getContext('2d');

// Configuración de la animación
const config = ${JSON.stringify(config, null, 2)};

// Vectores
const vectors = ${JSON.stringify(svgLines.slice(0, 5), null, 2)};
// ... (${svgLines.length - 5} vectores adicionales)

// Funciones de animación
function setup() {
  // Configura el canvas
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.style.backgroundColor = config.settings.backgroundColor;
  
  // Inicializa los vectores
  initializeVectors();
  
  // Inicia la animación
  requestAnimationFrame(animate);
}

function animate() {
  // Limpia el canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Actualiza y dibuja los vectores
  vectors.forEach(vector => {
    // Lógica de animación basada en ${settings.animationType}
    updateVector(vector);
    drawVector(vector);
  });
  
  // Solicita el siguiente frame
  requestAnimationFrame(animate);
}

function updateVector(vector) {
  // Implementa la lógica de animación para '${settings.animationType}'
  // Esta es solo una implementación básica
  switch('${settings.animationType}') {
    case 'smoothWaves':
      vector.currentAngle = Math.sin(Date.now() * 0.001 + vector.baseX * 0.01) * 30;
      break;
    case 'perlinFlow':
      // Simulación simple de flujo Perlin
      vector.currentAngle += Math.sin(Date.now() * 0.0005 + vector.baseY * 0.02) * 0.5;
      break;
    default:
      // Rotación simple
      vector.currentAngle += 0.1;
  }
}

function drawVector(vector) {
  // Dibuja el vector según su tipo y ángulo actual
  const { baseX, baseY, currentAngle } = vector;
  const length = config.settings.vectorLength;
  
  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.rotate(currentAngle * Math.PI / 180);
  
  ctx.strokeStyle = config.settings.vectorColor;
  ctx.lineWidth = config.settings.vectorWidth;
  
  // Dibuja según la forma
  switch(config.settings.vectorShape) {
    case 'line':
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(length, 0);
      ctx.stroke();
      break;
    // Implementar otras formas
  }
  
  ctx.restore();
}

// Iniciar todo
document.addEventListener('DOMContentLoaded', setup);
`;
  }, [settings, gridCols, svgLines]);

  // Generar código Framer Motion con useMemo para rendimiento
  const framerComponentCode = useMemo(() => {
    return `// VectorFramer.tsx - Componente Framer Motion para animación de vectores
import React, { useRef } from 'react';
import { motion } from 'framer-motion';

interface VectorFramerProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  rows?: number;
  cols?: number;
  spacing?: number;
  shape?: string;
  vectorColor?: string;
  vectorStrokeWidth?: number;
  animationType?: string;
  // Parámetros para waterfall
  waterfallTurbulence?: number;
  waterfallTurbulenceSpeed?: number;
  waterfallOffsetFactor?: number;
  waterfallGravityCycle?: number;
  waterfallGravityStrength?: number;
  waterfallMaxStretch?: number;
  waterfallDriftStrength?: number;
}

// Utilidad para renderizar cada forma SVG según el tipo de vector
function renderShape(vector: any, settings: any) {
  const { id, shape, baseX, baseY, currentAngle, lengthFactor = 1.0 } = vector;
  const actualLength = settings.vectorLength * (lengthFactor || 1.0);
  const stroke = {
    stroke: settings.vectorColor,
    strokeWidth: settings.vectorStrokeWidth,
    strokeLinecap: settings.strokeLinecap,
    fill: "none",
  };
  const fillColor = settings.vectorColor;

  // Calcular el offset de rotación basado en el punto de origen
  const rotationOrigin = settings.rotationOrigin || 'center';
  let rotationOffsetX = 0;
  switch (rotationOrigin) {
    case 'start':
      rotationOffsetX = 0;
      break;
    case 'center':
      rotationOffsetX = actualLength / 2;
      break;
    case 'end':
      rotationOffsetX = actualLength;
      break;
  }
  // Transformación SVG: translate + rotate
  const transform = \`translate(\${baseX}, \${baseY}) rotate(\${currentAngle}, \${rotationOffsetX}, 0)\`;

  switch (shape) {
    case 'line':
      return (
        <line
          key={id}
          x1={0}
          y1={0}
          x2={actualLength}
          y2={0}
          {...stroke}
          transform={transform}
        />
      );
    case 'arrow': {
      const arrowSize = actualLength * 0.25;
      return (
        <g key={id} transform={transform}>
          <line
            x1={0}
            y1={0}
            x2={actualLength}
            y2={0}
            {...stroke}
          />
          <polygon
            points={\`\${actualLength},0 \${actualLength - arrowSize},\${-arrowSize / 2} \${actualLength - arrowSize},\${arrowSize / 2}\`}
            fill={fillColor}
          />
        </g>
      );
    }
    case 'dot': {
      const dotRadius = actualLength * 0.15;
      return (
        <circle
          key={id}
          cx={actualLength / 2}
          cy={0}
          r={dotRadius}
          fill={fillColor}
          transform={transform}
        />
      );
    }
    case 'triangle': {
      const tipX = actualLength;
      const angle1 = Math.PI * 0.8;
      const angle2 = -Math.PI * 0.8;
      const p1X = actualLength * 0.4 * Math.cos(angle1);
      const p1Y = actualLength * 0.4 * Math.sin(angle1);
      const p2X = actualLength * 0.4 * Math.cos(angle2);
      const p2Y = actualLength * 0.4 * Math.sin(angle2);
      const points = \`\${tipX},0 \${p1X},\${p1Y} \${p2X},\${p2Y}\`;
      return (
        <polygon
          key={id}
          points={points}
          fill={fillColor}
          transform={transform}
        />
      );
    }
    case 'semicircle': {
      const radius = actualLength / 2;
      const semicirclePath = \`M 0 0 A \${radius} \${radius} 0 0 1 \${actualLength} 0\`;
      return (
        <path
          key={id}
          d={semicirclePath}
          fill="none"
          stroke={settings.vectorColor}
          strokeWidth={settings.vectorStrokeWidth}
          strokeLinecap={settings.strokeLinecap}
          transform={transform}
        />
      );
    }
    case 'curve': {
      const curveHeight = actualLength * 0.3;
      const curvePath = \`M 0 0 Q \${actualLength / 2} \${-curveHeight} \${actualLength} 0\`;
      return (
        <path
          key={id}
          d={curvePath}
          fill="none"
          stroke={settings.vectorColor}
          strokeWidth={settings.vectorStrokeWidth}
          strokeLinecap={settings.strokeLinecap}
          transform={transform}
        />
      );
    }
    default:
      return (
        <line
          key={id}
          x1={0}
          y1={0}
          x2={actualLength}
          y2={0}
          {...stroke}
          transform={transform}
        />
      );
  }
}

export const VectorFramer: React.FC<VectorFramerProps> = ({
  width = 800,
  height = 450,
  backgroundColor = "#000000",
  rows,
  cols,
  spacing,
  shape,
  vectorColor,
  vectorStrokeWidth,
  animationType,
  // Parámetros para waterfall con valores por defecto
  waterfallTurbulence = 15,
  waterfallTurbulenceSpeed = 0.003,
  waterfallOffsetFactor = 0.2,
  waterfallGravityCycle = 2000,
  waterfallGravityStrength = 0.5,
  waterfallMaxStretch = 1.5,
  waterfallDriftStrength = 0.2
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const animationSettings = {
    type: animationType || "smoothWaves",
    color: vectorColor || "#FFFFFF",
    shape: shape || "line",
    rows: rows || 15,
    cols: cols || 27,
    spacing: spacing || 20,
    vectorLength: 40,
    vectorStrokeWidth: vectorStrokeWidth || 2,
    strokeLinecap: "round",
    rotationOrigin: "center",
    // Parámetros específicos para waterfall
    waterfallTurbulence,
    waterfallTurbulenceSpeed,
    waterfallOffsetFactor,
    waterfallGravityCycle,
    waterfallGravityStrength,
    waterfallMaxStretch,
    waterfallDriftStrength
  };

  // Si no se pasan los vectores desde fuera, los generamos dinámicamente
  const vectors = Array.from({ length: animationSettings.rows * animationSettings.cols }).map((_, i) => {
    const row = Math.floor(i / animationSettings.cols);
    const col = i % animationSettings.cols;
    return {
      id: "v" + i,
      shape: animationSettings.shape,
      baseX: col * animationSettings.spacing,
      baseY: row * animationSettings.spacing,
      currentAngle: 0,
      lengthFactor: 1
    };
  });

  // Calcular el viewBox real basado en cols y rows y spacing
  const svgViewBoxWidth = (cols || 27) * (spacing || 20);
  const svgViewBoxHeight = (rows || 15) * (spacing || 20);

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        backgroundColor,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px'
      }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${svgViewBoxWidth} ${svgViewBoxHeight}`}>
        {vectors.map((vector: any, index: number) => (
          <motion.g
            key={vector.id}
            initial={{ rotate: 0 }}
            animate={{
              rotate:
                (animationType || "smoothWaves") === "smoothWaves"
                  ? [0, 15, -15, 0]
                  : (animationType || "smoothWaves") === "perlinFlow"
                  ? [0, 5, -5, 0]
                  : (animationType || "smoothWaves") === "waterfall"
                  ? [
                      90,  // Posición inicial (caída vertical)
                      90 + waterfallTurbulence * 0.5,  // Desviación derecha
                      90 - waterfallTurbulence * 0.5,  // Desviación izquierda
                      90   // Volver a la posición vertical
                    ]
                  : [0, 90, 180, 270, 360]
            }}
            transition={{
              duration: (animationType || "smoothWaves") === "waterfall" 
                ? 3 * (1 / (waterfallTurbulenceSpeed * 1000)) // Duración basada en la velocidad de turbulencia
                : 5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              delay: (animationType || "smoothWaves") === "waterfall"
                ? (vector.baseY / svgViewBoxHeight) * waterfallOffsetFactor * 5 // Efecto cascada: más rápido abajo
                : index * 0.05
            }}
          >
            {renderShape(vector, animationSettings)}
          </motion.g>
        ))}
      </svg>
    </div>
  );
};

// Uso:
// <VectorFramer 
//   rows={20} 
//   cols={30} 
//   spacing={24} 
//   shape="arrow" 
//   vectorColor="#00FFFF"
//   vectorStrokeWidth={2}
//   animationType="waterfall" 
//   waterfallTurbulence={15}
//   waterfallTurbulenceSpeed={0.003}
//   waterfallOffsetFactor={0.2}
//   waterfallGravityCycle={2000}
//   waterfallGravityStrength={0.5}
//   waterfallMaxStretch={1.5}
//   waterfallDriftStrength={0.2}
// />
`;
  }, [/* No dependencias para evitar recálculos innecesarios */]);

  // Estadísticas del código generado
  const codeStats = useMemo(() => {
    return {
      svg: {
        lines: svgCode.split('\n').length,
        chars: svgCode.length,
        paths: svgLines.length
      },
      js: {
        lines: jsCode.split('\n').length,
        chars: jsCode.length,
        functions: jsCode.match(/function\s+\w+/g)?.length || 0
      },
      framer: {
        lines: framerComponentCode.split('\n').length,
        chars: framerComponentCode.length,
        components: 1
      }
    };
  }, [svgCode, jsCode, framerComponentCode, svgLines]);

  const previewLines = useMemo(() => {
    return (activeTab === 'svg' ? svgCode : activeTab === 'js' ? jsCode : framerComponentCode).split('\n').slice(0, 5).join('\n');
  }, [activeTab, svgCode, jsCode, framerComponentCode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden bg-muted p-0">
        <DialogHeader className="px-6 py-3 flex flex-row items-center justify-between border-b border-input">
          <DialogTitle className="text-sm font-mono uppercase text-foreground">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              Exportar Código
              {copySuccess && <span className="ml-2 text-xs font-normal text-green-500 font-sans animate-in fade-in slide-in-from-bottom-1">{copySuccess}</span>}
            </div>
          </DialogTitle>
          
          <Tabs
            defaultValue="svg"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'svg' | 'js' | 'framer')}
            className="w-auto"
          >
            <TabsList className="h-8 bg-background">
              <TabsTrigger
                value="svg"
                className="text-xs px-2 data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                <FileCode className="w-3 h-3" /> SVG
              </TabsTrigger>
              <TabsTrigger
                value="js"
                className="text-xs px-2 data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                <Code2 className="w-3 h-3" /> JavaScript
              </TabsTrigger>
              <TabsTrigger
                value="framer"
                className="text-xs px-2 data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                <Code2 className="w-3 h-3" /> Framer
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4 pt-2 bg-background">
          {/* Preview inicial */}
          <div className="bg-muted rounded-none border border-input mb-2 p-3 text-xs text-muted-foreground font-mono relative">
            <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-[10px] px-2 py-0.5 rounded-full uppercase font-mono">
              {activeTab === 'svg' ? 'svg' : activeTab === 'js' ? 'javascript' : 'framer'}
            </div>
            <pre className="overflow-hidden max-h-[100px] font-mono">
              {previewLines}
              {(activeTab === 'svg' ? svgCode : activeTab === 'js' ? jsCode : framerComponentCode).split('\n').length > 5 && (
                <div className="h-8 bg-gradient-to-b from-transparent to-muted absolute bottom-0 left-0 right-0"></div>
              )}
            </pre>
          </div>

          {/* Scrollable completo */}
          <div className="flex-1 overflow-hidden flex flex-col bg-background rounded-none border border-input">
            <div className="p-2 bg-muted flex items-center justify-between border-b border-input">
              <div className="flex space-x-1 items-center">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-muted-foreground font-mono ml-2">
                  {activeTab === 'svg' ? 'vector.svg' : activeTab === 'js' ? 'vector-animation.js' : 'VectorFramer.tsx'}
                </span>
              </div>

              <span className="text-xs text-muted-foreground font-mono">
                {activeTab === 'svg' 
                  ? `${codeStats.svg.lines} líneas, ${codeStats.svg.paths} elementos` 
                  : activeTab === 'js'
                    ? `${codeStats.js.lines} líneas, ${codeStats.js.functions || 0} funciones`
                    : `${codeStats.framer.lines} líneas`}
              </span>
            </div>
            <div className="flex-1 overflow-auto">
              <pre className="p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed bg-background">
                {activeTab === 'svg' ? svgCode : activeTab === 'js' ? jsCode : framerComponentCode}
              </pre>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 border-t border-input bg-muted">
          <div className="flex gap-2">
            <Button
              onClick={() => handleCopy(
                activeTab === 'svg' ? svgCode : activeTab === 'js' ? jsCode : framerComponentCode, 
                activeTab.toUpperCase()
              )}
              variant="secondary"
              className="font-mono text-xs gap-1"
              aria-label="Copiar código"
            >
              {copySuccess ? (
                <><Check className="h-3 w-3" /> Copiado</>
              ) : (
                <><Clipboard className="h-3 w-3" /> Copiar {activeTab.toUpperCase()}</>
              )}
            </Button>
            <Button
              onClick={() => handleDownload(
                activeTab === 'svg' ? svgCode : activeTab === 'js' ? jsCode : framerComponentCode, 
                activeTab === 'svg' ? 'vector.svg' : activeTab === 'js' ? 'vector-animation.js' : 'VectorFramer.tsx'
              )}
              variant="outline"
              className="font-mono text-xs gap-1"
              aria-label="Descargar código"
            >
              <Download className="h-3 w-3" /> Descargar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
