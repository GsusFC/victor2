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

  const jsCode = useMemo(() => {
    const animationType = settings.currentAnimationType;
    
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

const logicalWidth = ${logicalWidth};
const logicalHeight = ${logicalHeight};
`;

    let animationSpecificSettings = '';
    
    if (animationType && animationType.toString() === 'pinwheel') {
      animationSpecificSettings = `
// Configuración específica de Pinwheel
const pinwheelCenters = ${JSON.stringify(pinwheelCenters)};
`;
    }

    const animationFunctionPlaceholder = `
// Funciones de animación (implementadas por el sistema)
function createSvgElements() {
  console.log("Creando elementos SVG...");
}

function setup() {
  createSvgElements();
  console.log("Animación inicializada");
  
  animate();
  
  document.getElementById('vectorSvg').addEventListener('click', togglePause);
}

function animate() {
  console.log("Animando vectores...");
  
  requestAnimationFrame(animate);
}

function togglePause() {
  console.log("Pausando/reanudando animación");
}`;

    return `${jsSettings}
${animationSpecificSettings}
${animationFunctionPlaceholder}`;
  }, [settings, calculatedGridCols, logicalWidth, logicalHeight, pinwheelCenters]);

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

  const previewLines = useMemo(() => {
    return (activeTab === 'svg' ? svgCode : jsCode).split('\n').slice(0, 5).join('\n');
  }, [activeTab, svgCode, jsCode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 border-border bg-background rounded-none">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="font-mono text-foreground">Exportar Código</DialogTitle>
        </DialogHeader>

        <div className="p-4 border-b border-border">
          <Tabs 
            defaultValue="svg" 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'svg' | 'js')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-8 rounded-none p-0 border bg-muted border-border">
              <TabsTrigger 
                value="svg" 
                className="text-xs font-mono rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1"
              >
                <FileCode className="w-3 h-3" /> SVG
              </TabsTrigger>
              <TabsTrigger 
                value="js" 
                className="text-xs font-mono rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-1"
              >
                <Code2 className="w-3 h-3" /> JS
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4 pt-2">
          <div className="bg-muted rounded-none border border-border mb-2 p-3 text-xs text-muted-foreground font-mono relative">
            <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-[10px] px-2 py-0.5 rounded-full uppercase font-mono">
              {activeTab === 'svg' ? 'svg' : 'javascript'}
            </div>
            <pre className="overflow-hidden max-h-[100px] font-mono">
              {previewLines}
              {(activeTab === 'svg' ? svgCode : jsCode).split('\n').length > 5 && (
                <div className="h-8 bg-gradient-to-b from-transparent to-muted absolute bottom-0 left-0 right-0"></div>
              )}
            </pre>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col bg-background rounded-none border border-border">
            <div className="p-2 bg-muted flex items-center justify-between border-b border-border">
              <div className="flex space-x-1 items-center">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-muted-foreground font-mono ml-2">
                  {activeTab === 'svg' ? 'vector.svg' : 'vector-animation.js'}
                </span>
              </div>

              <span className="text-xs text-muted-foreground font-mono">
                {activeTab === 'svg' 
                  ? `${codeStats.svg.lines} líneas, ${codeStats.svg.paths} elementos` 
                  : `${codeStats.js.lines} líneas, ${codeStats.js.functions || 0} funciones`}
              </span>
            </div>
            <div className="flex-1 overflow-auto">
              <pre className="p-4 text-sm font-mono text-foreground whitespace-pre-wrap leading-relaxed">
                {activeTab === 'svg' ? svgCode : jsCode}
              </pre>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 border-t border-border bg-background">
          <div className="flex gap-2">
            <Button
              onClick={() => handleCopy(
                activeTab === 'svg' ? svgCode : jsCode, 
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
                activeTab === 'svg' ? svgCode : jsCode, 
                activeTab === 'svg' ? 'vector.svg' : 'vector-animation.js'
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
