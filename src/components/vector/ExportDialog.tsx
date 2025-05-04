import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVectorStore } from '@/lib/store';
import { Check, Download, Clipboard, Code2, FileCode } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'svg' | 'js' | 'framer'>('svg');

  const {
    svgLines,
    settings,
    calculatedGridCols,
    logicalWidth,
    logicalHeight,
  } = useVectorStore();

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
    const svgHeight = svgWidth / (settings.aspectRatio === '1:1' ? 1 : settings.aspectRatio === '16:9' ? 16/9 : 2);
    
    if (!svgLines || svgLines.length === 0) return '<!-- No hay líneas SVG para exportar -->';

    // Función centralizada para crear elementos SVG
    const createSvgElement = (shape: string, id: string): string => {
      const halfLen = settings.vectorLength / 2;
      const stroke = `stroke="${settings.vectorColor}" stroke-width="${settings.vectorStrokeWidth}" stroke-linecap="${settings.strokeLinecap}"`;
      const transform = `transform="translate(0 0) rotate(90)"`;

      // Manejar las formas actuales (line, arrow, dot, triangle) en lugar de las anteriores
      switch(shape) {
        case 'line':
          // Línea simple
          return `<line id="${id}" x1="${-halfLen}" y1="0" x2="${halfLen}" y2="0" ${stroke} ${transform} />`;
        
        case 'arrow':
          // Flecha - línea con punta de flecha
          const arrowSize = settings.vectorLength * 0.25;
          return `<g id="${id}" ${transform}>
            <line x1="${-halfLen}" y1="0" x2="${halfLen}" y2="0" ${stroke} />
            <polygon points="${halfLen},0 ${halfLen-arrowSize},-${arrowSize/2} ${halfLen-arrowSize},${arrowSize/2}" fill="${settings.vectorColor}" />
          </g>`;
        
        case 'dot':
          // Punto - círculo pequeño
          const dotRadius = settings.vectorLength * 0.15;
          return `<circle id="${id}" cx="0" cy="0" r="${dotRadius}" fill="${settings.vectorColor}" ${transform} />`;
        
        case 'triangle':
          // Triángulo
          const h = settings.vectorLength * 0.4;
          return `<polygon id="${id}" points="0,-${h} ${h/2},${h/2} -${h/2},${h/2}" fill="none" ${stroke} ${transform} />`;
        
        default:
          // Por defecto, devolver una línea simple
          return `<line id="${id}" x1="${-halfLen}" y1="0" x2="${halfLen}" y2="0" ${stroke} ${transform} />`;
      }
    };

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${logicalWidth} ${logicalHeight}" width="${svgWidth}" height="${svgHeight}" id="vectorSvg">
  ${svgLines.map(({ shape, id }) => createSvgElement(shape, id)).join('\n  ')}
</svg>`;
  }, [svgLines, settings, logicalWidth, logicalHeight]);

  // Generar código JavaScript con useMemo para rendimiento
  const jsCode = useMemo(() => {
    // Crear un objeto de configuración para serializar a JSON
    const settingsObj = {
      gridRows: settings.gridRows,
      calculatedGridCols,
      vectorSpacing: settings.vectorSpacing,
      vectorLength: settings.vectorLength,
      vectorStrokeWidth: settings.vectorStrokeWidth,
      vectorShape: settings.vectorShape,
      strokeLinecap: settings.strokeLinecap,
      vectorColor: settings.vectorColor,
      animationSpeedFactor: settings.animationSpeedFactor,
      easingFactor: settings.easingFactor,
      currentAnimationType: settings.currentAnimationType,
    };

    // Configuración como un objeto JSON formateado
    const settingsJson = JSON.stringify(settingsObj, null, 2);

    return `const settings = ${settingsJson};

function getAngle(type, x, y, t, mx, my) {
  switch (type) {
    case 'smoothWaves':
      return Math.sin(x * 0.02 + t) * Math.cos(y * 0.02 + t) * 180;
    case 'mouseInteraction':
      if (mx == null || my == null) return 0;
      return Math.atan2(my - y, mx - x) * 180 / Math.PI;
    default:
      return 0;
  }
}

function animate(elements, timestamp, prevTime, mx, my) {
  const delta = (timestamp - prevTime) / 1000;
  const time = timestamp * 0.001 * settings.animationSpeedFactor;

  elements.forEach((el, i) => {
    const [_, row, col] = el.id.split('-');
    const x = col * settings.vectorSpacing + settings.vectorSpacing / 2;
    const y = row * settings.vectorSpacing + settings.vectorSpacing / 2;

    const angle = getAngle(settings.currentAnimationType, x, y, time, mx, my);

    const transform = el.getAttribute('transform') || '';
    const current = parseFloat((transform.match(/rotate\\(([^)]+)\\)/) || [])[1]) || 0;
    const diff = ((((angle - current) % 360) + 540) % 360) - 180;
    const eased = current + diff * settings.easingFactor;

    el.setAttribute('transform', \`translate(\${x} \${y}) rotate(\${eased})\`);
  });

  requestAnimationFrame((t) => animate(elements, t, timestamp, mx, my));
}

function setup() {
  const svg = document.getElementById('vectorSvg');
  const elements = Array.from(svg.querySelectorAll('line, path'));
  let mouseX = null;
  let mouseY = null;

  svg.addEventListener('mousemove', (e) => {
    const rect = svg.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width * svg.viewBox.baseVal.width;
    mouseY = (e.clientY - rect.top) / rect.height * svg.viewBox.baseVal.height;
  });

  svg.addEventListener('mouseleave', () => {
    mouseX = null;
    mouseY = null;
  });

  requestAnimationFrame((t) => animate(elements, t, performance.now(), mouseX, mouseY));
}

setup();`;
  }, [settings, calculatedGridCols]);

  const framerComponentCode = useMemo(() => {
    // Crear un objeto de configuración para serializar a JSON
    const settingsObj = {
      gridRows: settings.gridRows,
      calculatedGridCols,
      vectorSpacing: settings.vectorSpacing,
      vectorLength: settings.vectorLength,
      vectorStrokeWidth: settings.vectorStrokeWidth,
      vectorShape: settings.vectorShape,
      strokeLinecap: settings.strokeLinecap,
      vectorColor: settings.vectorColor,
      animationSpeedFactor: settings.animationSpeedFactor,
      easingFactor: settings.easingFactor,
      currentAnimationType: settings.currentAnimationType,
    };

    const settingsJson = JSON.stringify(settingsObj, null, 2);

    // Generar JSX para todos los vectores sin transform, transform se aplicará en animación
    // Esta sección es solo para información, no se utiliza directamente
    /* Lógica de generación de vectores en JSX, deshabilitada por no usarse
    svgLines.map(({ shape, id }) => {
      const halfLen = settings.vectorLength / 2;
      const strokeWidth = settings.vectorStrokeWidth;
      const strokeLinecap = settings.strokeLinecap;
      const stroke = settings.vectorColor;
      if (shape === 'straight') {
        return `<line id="${id}" x1={${-halfLen}} y1={0} x2={${halfLen}} y2={0} stroke="${stroke}" strokeWidth={${strokeWidth}} strokeLinecap="${strokeLinecap}" />`;
      } else if (shape === 'curved') {
        const curveHeight = settings.vectorLength * 0.3;
        return `<path id="${id}" d="M ${-halfLen},0 Q 0,${-curveHeight} ${halfLen},0" fill="none" stroke="${stroke}" strokeWidth={${strokeWidth}} strokeLinecap="${strokeLinecap}" />`;
      } else {
        const radius = settings.vectorLength / 2;
        return `<path id="${id}" d="M ${-radius},0 A ${radius},${radius} 0 0 1 ${radius},0" fill="none" stroke="${stroke}" strokeWidth={${strokeWidth}} strokeLinecap="${strokeLinecap}" />`;
      }
    }).join('\n        ');
    */

    return `import React, { useRef, useEffect } from 'react';

const settings = ${settingsJson};

function getAngle(type, x, y, t, mx, my) {
  switch (type) {
    case 'smoothWaves':
      return Math.sin(x * 0.02 + t) * Math.cos(y * 0.02 + t) * 180;
    case 'mouseInteraction':
      if (mx == null || my == null) return 0;
      return Math.atan2(my - y, mx - x) * 180 / Math.PI;
    default:
      return 0;
  }
}

export function VectorFramer() {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const elements = Array.from(svg.querySelectorAll('line, path'));
    let mouseX = null;
    let mouseY = null;

    function onMouseMove(e) {
      const rect = svg.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width * svg.viewBox.baseVal.width;
      mouseY = (e.clientY - rect.top) / rect.height * svg.viewBox.baseVal.height;
    }

    function onMouseLeave() {
      mouseX = null;
      mouseY = null;
    }

    svg.addEventListener('mousemove', onMouseMove);
    svg.addEventListener('mouseleave', onMouseLeave);

    let prevTime = performance.now();

    function animate(timestamp) {
      const delta = (timestamp - prevTime) / 1000;
      prevTime = timestamp;
      const time = timestamp * 0.001 * settings.animationSpeedFactor;

      elements.forEach((el) => {
        const [_, row, col] = el.id.split('-');
        const x = col * settings.vectorSpacing + settings.vectorSpacing / 2;
        const y = row * settings.vectorSpacing + settings.vectorSpacing / 2;

        const angle = getAngle(settings.currentAnimationType, x, y, time, mouseX, mouseY);

        const transform = el.getAttribute('transform') || '';
        const current = parseFloat((transform.match(/rotate\\(([^)]+)\\)/) || [])[1]) || 0;
        const diff = ((((angle - current) % 360) + 540) % 360) - 180;
        const eased = current + diff * settings.easingFactor;

        el.setAttribute('transform', \`translate(\${x} \${y}) rotate(\${eased})\`);
      });

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    return () => {
      svg.removeEventListener('mousemove', onMouseMove);
      svg.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={\`0 0 ${logicalWidth} ${logicalHeight}\`}
      width={800}
      height={800 / (settings.aspectRatio === '1:1' ? 1 : settings.aspectRatio === '16:9' ? 16/9 : 2)}
      id="vectorSvg"
    >
      {/* Aquí irían los vectores renderizados */}
    </svg>
  );
}
`;
  }, [svgLines, settings, logicalWidth, logicalHeight]);

  // Obtener estadísticas del código
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
        chars: framerComponentCode.length
      }
    };
  }, [svgCode, jsCode, framerComponentCode, svgLines.length]);

  // Preview de las primeras líneas
  const previewLines = useMemo(() => {
    return (activeTab === 'svg' ? svgCode : activeTab === 'js' ? jsCode : framerComponentCode).split('\n').slice(0, 5).join('\n');
  }, [activeTab, svgCode, jsCode, framerComponentCode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col w-full max-w-[90vw] md:min-w-[960px] md:max-w-[1600px] h-[90vh] bg-background text-foreground border border-input p-0 font-mono">
        <div className="flex items-center justify-between px-4 py-2 border-b border-input bg-card">
          <DialogHeader className="p-0 m-0">
            <DialogTitle className="font-semibold text-xs font-mono uppercase">Exportar Vector</DialogTitle>
          </DialogHeader>
          {/* El botón de cerrar está en el DialogContent por defecto */}
        </div>

        <div className="border-b border-input p-3 flex items-center justify-between bg-card">
          <div className="text-xs text-muted-foreground font-mono uppercase">Código</div>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'svg' | 'js' | 'framer')}>
            <TabsList className="rounded-none bg-muted border border-input">
              <TabsTrigger 
                value="svg" 
                className="text-xs font-mono rounded-none data-[state=active]:bg-card data-[state=active]:text-card-foreground flex items-center justify-center gap-1"
              >
                <FileCode className="w-3 h-3" /> SVG
              </TabsTrigger>
              <TabsTrigger 
                value="js" 
                className="text-xs font-mono rounded-none data-[state=active]:bg-card data-[state=active]:text-card-foreground flex items-center justify-center gap-1"
              >
                <Code2 className="w-3 h-3" /> JavaScript
              </TabsTrigger>
              <TabsTrigger 
                value="framer" 
                className="text-xs font-mono rounded-none data-[state=active]:bg-card data-[state=active]:text-card-foreground flex items-center justify-center gap-1"
              >
                <Code2 className="w-3 h-3" /> Framer
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

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
