import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useVectorStore } from '@/lib/store';
import { Check, Download, Clipboard, Code2, FileCode } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'svg' | 'js'>('svg');

  const {
    svgLines,
    settings,
    calculatedGridCols,
    logicalWidth,
    logicalHeight,
    pinwheelCenters,
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

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${logicalWidth} ${logicalHeight}" width="${svgWidth}" height="${svgHeight}" id="vectorSvg">
  ${svgLines.map(line => {
    const { baseX, baseY, shape, id } = line;
    const halfLen = settings.vectorLength / 2;
    const stroke = `stroke="${settings.vectorColor}" stroke-width="${settings.vectorStrokeWidth}" stroke-linecap="${settings.strokeLinecap}"`;
    const transform = `transform="translate(${baseX} ${baseY}) rotate(90)"`;
    
    if (shape === 'straight') {
      return `<line id="${id}" x1="${-halfLen}" y1="0" x2="${halfLen}" y2="0" ${stroke} ${transform} />`;
    } else if (shape === 'curved') {
      const curveHeight = settings.vectorLength * 0.3;
      return `<path id="${id}" d="M ${-halfLen},0 Q 0,${-curveHeight} ${halfLen},0" fill="none" ${stroke} ${transform} />`;
    } else { // semicircle
      const radius = settings.vectorLength / 2;
      return `<path id="${id}" d="M ${-radius},0 A ${radius},${radius} 0 0 1 ${radius},0" fill="none" ${stroke} ${transform} />`;
    }
  }).join('\n  ')}
</svg>`;
  }, [svgLines, settings, logicalWidth, logicalHeight]);

  // Generar código JavaScript con useMemo para rendimiento
  const jsCode = useMemo(() => {
    const animationType = settings.currentAnimationType;
    
    // Configuración básica
    const jsSettings = `// Configuración básica
const animationSettings = {
  gridRows: ${settings.gridRows},
  calculatedGridCols: ${calculatedGridCols},
  vectorSpacing: ${settings.vectorSpacing},
  vectorLength: ${settings.vectorLength},
  vectorStrokeWidth: ${settings.vectorStrokeWidth},
  vectorShape: "${settings.vectorShape}",
  vectorLineCap: "${settings.strokeLinecap}",
  vectorColor: "${settings.vectorColor}",
  animationSpeedFactor: ${settings.animationSpeedFactor},
  easingFactor: ${settings.easingFactor},
  isStrokeVariabilityActive: ${settings.isStrokeVariabilityActive},
  currentAnimationType: "${animationType}"
};

// Constantes de dimensiones
const logicalWidth = ${logicalWidth};
const logicalHeight = ${logicalHeight};
`;

    // Configuración específica para cada tipo de animación
    let animationSpecificSettings = '';
    
    // Comparamos como string para evitar problemas de tipo
    if (animationType && animationType.toString() === 'pinwheel') {
      animationSpecificSettings = `
// Configuración específica de Pinwheel
const pinwheelCenters = ${JSON.stringify(pinwheelCenters)};
`;
    }

    // Placeholder para funciones de animación
    const animationFunctionPlaceholder = `
// Funciones de animación (implementadas por el sistema)
function createSvgElements() {
  // Esta función crea los elementos SVG en el DOM basado en la configuración
  console.log("Creando elementos SVG...");
}

function setup() {
  // Inicializa la animación y configura los eventos de interacción
  createSvgElements();
  console.log("Animación inicializada");
  
  // Inicia el bucle de animación
  animate();
  
  // Agrega listeners para interacción (opcional)
  document.getElementById('vectorSvg').addEventListener('click', togglePause);
}

function animate() {
  // Implementa la lógica de animación específica
  // Este es un placeholder - la animación real depende del tipo seleccionado
  console.log("Animando vectores...");
  
  // Solicita el siguiente frame
  requestAnimationFrame(animate);
}

function togglePause() {
  // Controla la pausa/reanudación de la animación
  console.log("Pausando/reanudando animación");
}`;

    return `${jsSettings}
${animationSpecificSettings}
${animationFunctionPlaceholder}`;
  }, [settings, calculatedGridCols, logicalWidth, logicalHeight, pinwheelCenters]);

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
      }
    };
  }, [svgCode, jsCode, svgLines]);

  // Preview de las primeras líneas
  const previewLines = useMemo(() => {
    return (activeTab === 'svg' ? svgCode : jsCode).split('\n').slice(0, 5).join('\n');
  }, [activeTab, svgCode, jsCode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col w-full max-w-[90vw] md:min-w-[960px] md:max-w-[1600px] h-[90vh] bg-black text-gray-300 border border-gray-800 p-0">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
          <DialogHeader className="p-0 m-0">
            <DialogTitle className="text-sm font-mono uppercase text-gray-300">Exportar Código</DialogTitle>
          </DialogHeader>
          {/* El botón de cerrar está en el DialogContent por defecto */}
        </div>

        <div className="flex justify-center my-3 gap-2">
          <button
            className={`px-4 py-1 text-xs rounded-full font-mono border transition-colors ${
              activeTab === 'svg' 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('svg')}
            aria-label="Ver código SVG"
          >
            <FileCode className="w-4 h-4 inline-block mr-1" /> SVG
          </button>
          <button
            className={`px-4 py-1 text-xs rounded-full font-mono border transition-colors ${
              activeTab === 'js' 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('js')}
            aria-label="Ver código JavaScript"
          >
            <Code2 className="w-4 h-4 inline-block mr-1" /> JS
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden px-6 pb-6 pt-2">
          {/* Preview inicial */}
          <div className="bg-gray-900 rounded border border-gray-800 mb-2 p-3 text-xs text-gray-400 font-mono relative">
            <div className="absolute top-2 right-2 bg-gray-800 text-[10px] px-2 py-0.5 rounded-full text-gray-400 uppercase">
              {activeTab === 'svg' ? 'svg' : 'javascript'}
            </div>
            <pre className="overflow-hidden max-h-[100px]">
              {previewLines}
              {(activeTab === 'svg' ? svgCode : jsCode).split('\n').length > 5 && (
                <div className="h-8 bg-gradient-to-b from-transparent to-gray-900 absolute bottom-0 left-0 right-0"></div>
              )}
            </pre>
          </div>

          {/* Scrollable completo */}
          <div className="flex-1 overflow-hidden flex flex-col bg-gray-950 rounded-lg border border-gray-800">
            <div className="p-2 bg-gray-900 flex items-center justify-between border-b border-gray-800">
              <div className="flex space-x-1 items-center">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-400 font-mono ml-2">
                  {activeTab === 'svg' ? 'vector.svg' : 'vector-animation.js'}
                </span>
              </div>

              <span className="text-xs text-gray-500 font-mono">
                {activeTab === 'svg' 
                  ? `${codeStats.svg.lines} líneas, ${codeStats.svg.paths} elementos` 
                  : `${codeStats.js.lines} líneas, ${codeStats.js.functions || 0} funciones`}
              </span>
            </div>
            <div className="flex-1 overflow-auto">
              <pre className="p-4 text-sm font-mono text-gray-200 whitespace-pre-wrap leading-relaxed">
                {activeTab === 'svg' ? svgCode : jsCode}
              </pre>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 border-t border-gray-800 bg-gray-950">
          <div className="flex gap-2">
            <Button
              onClick={() => handleCopy(
                activeTab === 'svg' ? svgCode : jsCode, 
                activeTab.toUpperCase()
              )}
              className="font-mono text-xs gap-1 bg-gray-800 hover:bg-gray-700"
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
                activeTab === 'svg' ? svgCode : jsCode, 
                activeTab === 'svg' ? 'vector.svg' : 'vector-animation.js'
              )}
              className="font-mono text-xs gap-1 bg-gray-900 hover:bg-gray-800 border border-gray-700"
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
