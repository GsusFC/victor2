import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useVectorStore } from '@/lib/store';
import { AspectRatioControl } from '@/components/vector/ui/AspectRatioControl';
import { 
  calculateAngle_SmoothWaves,
  calculateAngle_SeaWaves,
  calculateAngle_Pinwheels,
  calculateAngle_CenterPulse
} from '@/lib/animation-utils';

export function AnimatedVectorCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Estado de Zustand
  const {
    settings,
    setSettings, // Volver a añadir para el botón de pausa
    pinwheelCenters,
    setPinwheelCenters,
    lastPulseTime,
    setLastPulseTime,
    setCalculatedValues,
    setSvgLines, // Añadir para guardar los vectores para exportación
    logicalWidth,
    logicalHeight
  } = useVectorStore((state) => ({ // Seleccionar explícitamente
    settings: state.settings,
    setSettings: state.setSettings, // Volver a añadir
    pinwheelCenters: state.pinwheelCenters,
    setPinwheelCenters: state.setPinwheelCenters,
    lastPulseTime: state.lastPulseTime,
    setLastPulseTime: state.setLastPulseTime,
    setCalculatedValues: state.setCalculatedValues,
    setSvgLines: state.setSvgLines,
    logicalWidth: state.logicalWidth,
    logicalHeight: state.logicalHeight
  }));
  
  // Inicializar centros de molinetes si se necesitan
  const initializePinwheelCenters = useCallback((width: number, height: number) => {
    // Accedemos a las propiedades de settings dentro de la función para evitar dependencias innecesarias
    const currentSettings = useVectorStore.getState().settings; // Obtener estado actual

    if (currentSettings.currentAnimationType === 'pinwheels' && currentSettings.pinwheelCount > 0) {
      const newCenters = [];
      const count = currentSettings.pinwheelCount || 2;
      
      for (let i = 0; i < count; i++) {
        newCenters.push({
          x: Math.random() * width * 0.8 + width * 0.1,
          y: Math.random() * height * 0.8 + height * 0.1,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2
        });
      }
      
      setPinwheelCenters(newCenters);
    }
  }, [setPinwheelCenters]); // Dejar solo setPinwheelCenters ya que lee state con getState()
 
  // Función para generar el SVG inicial
  const setupSVG = useCallback(() => {
    if (!svgRef.current) {
      console.log('[setupSVG] svgRef.current no está listo.');
      return;
    }
    
    console.log('[setupSVG] Ejecutando con aspectRatio:', settings.aspectRatio);
    
    try {
      // Limpiar SVG existente
      while (svgRef.current.firstChild) {
        svgRef.current.removeChild(svgRef.current.firstChild);
      }
      
      // Calcular dimensiones basadas en la relación de aspecto
      const width = 800;
      let height: number;
      
      if (settings.aspectRatio === '16:9') {
        height = 450;
      } else if (settings.aspectRatio === '1:1') {
        height = 800;
      } else if (settings.aspectRatio === '2:1') {
        height = 400;
      } else {
        height = 450; // Default 16:9
      }
      
      // TODO: El ancho base (width) es fijo (800). Hacerlo dinámico basado en el tamaño del contenedor padre
      // requeriría medir el elemento (ej. con ResizeObserver) para una mejor adaptación.
      
      // Configurar viewBox
      svgRef.current.setAttribute('viewBox', `0 0 ${width} ${height}`);
      
      // Calcular columnas basado en las filas y la relación de aspecto
      const rows = settings.gridRows;
      const aspectMultiplier = width / height;
      const cols = Math.floor(rows * aspectMultiplier);
      const spacing = settings.vectorSpacing;
      
      // Guardar valores calculados en el store
      setCalculatedValues(cols, width, height);
      
      // Inicializar centros de molinetes si es necesario
      initializePinwheelCenters(width, height);
      
      // Crear líneas para los vectores
      const vectorElements = [];
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing;
          const y = r * spacing;
          
          // Crear un vector según la forma seleccionada en las propiedades
          const id = `vector-${r}-${c}`;
          const vectorShape = settings.vectorShape || 'line';
          let vectorElement;
          
          // Crear el elemento SVG según el tipo de forma
          switch(vectorShape) {
            case 'line':
              // Línea simple
              vectorElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
              vectorElement.setAttribute('x1', `${x}`);
              vectorElement.setAttribute('y1', `${y}`);
              vectorElement.setAttribute('x2', `${x + settings.vectorLength}`);
              vectorElement.setAttribute('y2', `${y}`);
              break;
              
            case 'arrow':
              // Flecha (grupo con línea y triángulo)
              vectorElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
              
              // Crear la línea base
              const arrowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
              arrowLine.setAttribute('x1', `${x}`);
              arrowLine.setAttribute('y1', `${y}`);
              arrowLine.setAttribute('x2', `${x + settings.vectorLength - 5}`);
              arrowLine.setAttribute('y2', `${y}`);
              
              // Crear punta de flecha (triángulo)
              const arrowTip = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
              const arrowSize = 5;
              arrowTip.setAttribute('points', `${x + settings.vectorLength},${y} ${x + settings.vectorLength - arrowSize},${y - arrowSize/2} ${x + settings.vectorLength - arrowSize},${y + arrowSize/2}`);
              arrowTip.setAttribute('fill', settings.vectorColor);
              
              // Añadir elementos al grupo
              vectorElement.appendChild(arrowLine);
              vectorElement.appendChild(arrowTip);
              break;
              
            case 'dot':
              // Punto (círculo)
              vectorElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
              vectorElement.setAttribute('cx', `${x + settings.vectorLength/2}`);
              vectorElement.setAttribute('cy', `${y}`);
              vectorElement.setAttribute('r', `${settings.vectorLength * 0.15}`);
              vectorElement.setAttribute('fill', settings.vectorColor);
              break;
              
            case 'triangle':
              // Triángulo
              vectorElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
              const h = settings.vectorLength * 0.4;
              vectorElement.setAttribute('points', `${x + settings.vectorLength/2},${y - h} ${x + settings.vectorLength/2 + h/2},${y + h/2} ${x + settings.vectorLength/2 - h/2},${y + h/2}`);
              vectorElement.setAttribute('fill', 'none');
              vectorElement.setAttribute('stroke', settings.vectorColor);
              vectorElement.setAttribute('stroke-width', `${settings.vectorStrokeWidth}`);
              vectorElement.setAttribute('stroke-linecap', settings.vectorLineCap);
              break;
              
            default:
              // Por defecto, una línea
              vectorElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
              vectorElement.setAttribute('x1', `${x}`);
              vectorElement.setAttribute('y1', `${y}`);
              vectorElement.setAttribute('x2', `${x + settings.vectorLength}`);
              vectorElement.setAttribute('y2', `${y}`);
          }
          
          // Atributos comunes a todos los elementos (excepto algunos específicos)
          vectorElement.setAttribute('id', id);
          
          // Aplicar atributos de trazo solo a los elementos que lo requieren
          if (vectorShape !== 'dot') {
            if (vectorElement.tagName !== 'g') { // Solo a elementos que no sean grupos
              vectorElement.setAttribute('stroke', settings.vectorColor);
              vectorElement.setAttribute('stroke-width', `${settings.vectorStrokeWidth}`);
              vectorElement.setAttribute('stroke-linecap', settings.vectorLineCap);
            } else {
              // Para grupos, aplicar atributos a los hijos que lo necesitan
              Array.from(vectorElement.children).forEach(child => {
                if (child.tagName === 'line' || child.tagName === 'path') {
                  child.setAttribute('stroke', settings.vectorColor);
                  child.setAttribute('stroke-width', `${settings.vectorStrokeWidth}`);
                  child.setAttribute('stroke-linecap', settings.vectorLineCap);
                }
              });
            }
          }
          
          svgRef.current.appendChild(vectorElement);
          // Guardar el vector con la estructura completa requerida por VectorItem
          vectorElements.push({ 
            id, 
            baseX: x, 
            baseY: y, 
            currentAngle: 0, // Ángulo inicial
            r: r, // Fila
            c: c, // Columna
            flockId: 0, // Grupo inicial (puede ser usado para animaciones grupales)
            shape: vectorShape // Guardar la forma seleccionada
          });
        }
      }
      
      // Añadir texto informativo
      const infoText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      infoText.setAttribute('id', 'info-text');
      infoText.setAttribute('x', `${width / 2}`);
      infoText.setAttribute('y', `${height - 20}`);
      infoText.setAttribute('text-anchor', 'middle');
      infoText.setAttribute('fill', '#666666');
      infoText.setAttribute('font-size', '12');
      infoText.setAttribute('font-family', 'Geist Mono, monospace');
      infoText.textContent = settings.currentAnimationType.toUpperCase();
      
      svgRef.current.appendChild(infoText);
      
      // Guardar vectores en el store para que el diálogo de exportación los use
      setSvgLines(vectorElements);
      
      // Marcar como inicializado
      setIsInitialized(true);
      console.log(`[setupSVG] viewBox establecido a: 0 0 ${width} ${height}`);
      console.log(`[setupSVG] Valores calculados (store): logicalWidth=${width}, logicalHeight=${height}`);
    } catch (error) {
      console.error('Error al configurar el SVG:', error);
      
      if (svgRef.current) {
        const errorText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        errorText.setAttribute('x', '400');
        errorText.setAttribute('y', '225');
        errorText.setAttribute('fill', '#ff5555');
        errorText.setAttribute('font-size', '16');
        errorText.setAttribute('text-anchor', 'middle');
        errorText.textContent = 'ERROR AL RENDERIZAR VECTORES';
        svgRef.current.appendChild(errorText);
      }
    }
  }, [
    settings.aspectRatio, 
    settings.gridRows, 
    settings.vectorSpacing, 
    settings.vectorLength, 
    settings.vectorColor, 
    settings.vectorStrokeWidth,
    settings.vectorLineCap,
    settings.vectorShape, // Añadida dependencia faltante para el tipo de forma
    settings.currentAnimationType,
    initializePinwheelCenters,
    setCalculatedValues
  ]);

  // Función para actualizar la posición y velocidad de los centros de los molinetes
  const updatePinwheelCenters = useCallback(() => {
    // Acceder directamente al estado suscrito en lugar de getState() aquí
    if (settings.currentAnimationType !== 'pinwheels' || !pinwheelCenters || pinwheelCenters.length === 0) {
      return; // No hacer nada si no es la animación correcta o no hay centros
    }

    const newCenters = pinwheelCenters.map(center => {
      let { x, y, vx, vy } = center;

      // Usar animationSpeedFactor en lugar de pinwheelSpeed
      const speedFactor = settings.animationSpeedFactor;

      // Mover centro
      x += vx * speedFactor;
      y += vy * speedFactor;

      // Lógica de rebote en los bordes del canvas
      if (x < 0 || x > logicalWidth) {
        vx *= -1; // Invertir velocidad horizontal
        x = Math.max(0, Math.min(logicalWidth, x)); // Corregir posición
      }
      if (y < 0 || y > logicalHeight) {
        vy *= -1; // Invertir velocidad vertical
        y = Math.max(0, Math.min(logicalHeight, y)); // Corregir posición
      }

      return { x, y, vx, vy };
    });

    setPinwheelCenters(newCenters);
  }, [settings, pinwheelCenters, logicalWidth, logicalHeight, setPinwheelCenters]); // Añadir dependencias

  // Función de animación (loop principal)
  const animateVectors = useCallback((timestamp: number) => {
    // 1. Añadir control de pausa
    if (settings.isPaused) {
      console.log('[animateVectors] Animación pausada.');
      // Cancelar el frame pendiente si existe para evitar bucles al reanudar rápido
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = 0;
      }
      return;
    }
    
    // Asegurarse de que el SVG esté listo y la inicialización completada
    if (!svgRef.current || !isInitialized) return;
    
    previousTimeRef.current = timestamp;
    
    // Factor de tiempo para animaciones
    const timeFactor = timestamp / 1000; // Tiempo en segundos
    
    // Si es una animación de pulso central, verificar si es momento de lanzar un nuevo pulso
    if (settings.currentAnimationType === 'centerPulse') {
      const pulseIntervalMs = settings.pulseInterval * 1000;
      if (timestamp - lastPulseTime > pulseIntervalMs) {
        setLastPulseTime(timestamp);
      }
    }
    
    // Actualizar centros de molinetes si es necesario
    if (settings.currentAnimationType === 'pinwheels' && pinwheelCenters && pinwheelCenters.length > 0) {
      updatePinwheelCenters();
    }
    
    // Actualizar ángulos de todos los vectores
    const rows = settings.gridRows;
    const aspectMultiplier = logicalWidth / logicalHeight;
    const cols = Math.floor(rows * aspectMultiplier);
    const spacing = settings.vectorSpacing;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const vectorId = `vector-${r}-${c}`;
        const vectorElement = svgRef.current.getElementById(vectorId) as SVGLineElement;
        
        if (!vectorElement) continue;
        
        const x = c * spacing;
        const y = r * spacing;
        
        // Calcular ángulo según el tipo de animación
        let angle: number = 0;
        
        switch (settings.currentAnimationType) {
          case 'smoothWaves':
            angle = calculateAngle_SmoothWaves(x, y, timeFactor, logicalWidth, logicalHeight);
            break;
          case 'seaWaves':
            // Corregir llamada con todos los argumentos
            angle = calculateAngle_SeaWaves(
              x, y, timeFactor, logicalWidth, logicalHeight, 
              settings.seaWaveFrequency, settings.seaWaveAmplitude
            );
            break;
          case 'pinwheels':
            // Llamar con los argumentos correctos
            angle = calculateAngle_Pinwheels(
              x, y, timeFactor, logicalWidth, logicalHeight, pinwheelCenters || []
            );
            break;
          case 'centerPulse':
            angle = calculateAngle_CenterPulse(
              x, y, timeFactor, timestamp, lastPulseTime, 
              logicalWidth, logicalHeight
            );
            break;
          default:
            // Fallback a ondas suaves
            angle = calculateAngle_SmoothWaves(x, y, timeFactor, logicalWidth, logicalHeight);
        }
        
        // Aplicar el ángulo al vector con easing
        const currentAngle = parseFloat(vectorElement.getAttribute('data-angle') || '0');
        const targetAngle = angle;
        const easedAngle = currentAngle + (targetAngle - currentAngle) * settings.easingFactor;
        
        vectorElement.setAttribute('data-angle', easedAngle.toString());
        vectorElement.setAttribute('transform', `rotate(${easedAngle}, ${x}, ${y})`);
        
        // Aplicar variabilidad de grosor si está activada
        if (settings.isStrokeVariabilityActive) {
          const variationFactor = 0.5 + Math.abs(Math.sin(timeFactor * 0.2 + (r + c) * 0.1)) * 0.5;
          const variedStrokeWidth = settings.vectorStrokeWidth * variationFactor;
          vectorElement.setAttribute('stroke-width', variedStrokeWidth.toString());
        }
      }
    }
    
    // Actualizar texto informativo
    const infoText = svgRef.current.getElementById('info-text');
    if (infoText) {
      infoText.textContent = settings.currentAnimationType.toUpperCase();
    }
    
    // Continuar el ciclo de animación
    requestRef.current = requestAnimationFrame(animateVectors);
  }, [
    settings,
    lastPulseTime,
    pinwheelCenters,
    setLastPulseTime,
    updatePinwheelCenters,
    isInitialized,
    logicalWidth, // Añadir dependencia
    logicalHeight, // Añadir dependencia
  ]);

  // Efecto para configurar el SVG inicial y manejar cambios
  useEffect(() => {
    console.log('[useEffect setupSVG] Disparado. AspectRatio actual:', settings.aspectRatio);
    setupSVG();
    // Marcar como inicializado después del primer setup
    if (!isInitialized) setIsInitialized(true);
  }, [settings.aspectRatio, setupSVG, isInitialized]);

  // Efecto para iniciar/detener el ciclo de animación
  useEffect(() => {
    // No iniciar la animación si no está inicializado o está pausado
    if (!isInitialized || settings.isPaused) {
      // Si está pausado pero había un frame pendiente, cancelarlo
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = 0;
        console.log('[useEffect anim] Animación pausada, frame cancelado.');
      }
      return;
    }
    
    previousTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animateVectors);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = 0;
      }
    };
  }, [isInitialized, settings.isPaused, animateVectors]); // Añadir isPaused a las dependencias

  // Escuchar eventos de teclado para cambiar la relación de aspecto
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Usar teclas numéricas 1, 2, 3 para cambiar la relación de aspecto
      switch (e.key) {
        case '1':
          console.log('[KeyShortcut] Cambiando a 16:9');
          setSettings({ aspectRatio: '16:9' });
          break;
        case '2':
          console.log('[KeyShortcut] Cambiando a 1:1');
          setSettings({ aspectRatio: '1:1' });
          break;
        case '3':
          console.log('[KeyShortcut] Cambiando a 2:1');
          setSettings({ aspectRatio: '2:1' });
          break;
        case 'p':
          console.log('[KeyShortcut] Alternando pausa');
          setSettings({ isPaused: !settings.isPaused });
          break;
      }
    };

    // Agregar event listener global
    window.addEventListener('keydown', handleKeyDown);
    console.log('[KeyboardEffect] Event listener instalado. Presiona 1 para 16:9, 2 para 1:1, 3 para 2:1');
    
    // Limpiar cuando el componente se desmonte
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setSettings, settings.isPaused]); // Dependencia settings.isPaused para alternar

  // Determinar las dimensiones basadas en la relación de aspecto actual
  const getContainerStyle = () => {
    console.log('[getContainerStyle] Calculando para aspectRatio:', settings.aspectRatio);
    let style = '';
    switch (settings.aspectRatio) {
      case '16:9':
        style = 'aspect-video'; // Tailwind para 16:9
        break;
      case '2:1':
        style = 'aspect-[2/1]'; // Tailwind para 2:1
        break;
      case '1:1':
        style = 'aspect-square'; // Por defecto 1:1
        break;
    }
    console.log('[getContainerStyle] Estilo devuelto:', style);
    return style;
  };
  
  // Obtener estilo de fondo según el tipo de animación
  const getCanvasBackground = () => {
    switch (settings.currentAnimationType) {
      case 'seaWaves':
        return 'bg-gradient-to-b from-black to-gray-900';
      case 'pinwheels':
        return 'bg-gradient-to-br from-black to-gray-900';
      case 'centerPulse':
        return 'bg-black';
      case 'smoothWaves':
      default:
        return 'bg-black';
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-black">
      {/* Barra superior con controles siempre visible */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-700 relative z-10 shadow-md">
        {/* Indicador de estado izquierdo - botón siempre visible */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSettings({ isPaused: !settings.isPaused })}
            className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium font-mono uppercase opacity-100 visible ${settings.isPaused
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
              }`}
          >
            {/* Icono de pausa/reanudar */}
            {settings.isPaused ? (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {settings.isPaused ? 'Reanudar' : 'Pausar'}
          </button>
        </div>
        
        {/* Controles de la derecha con z-index aumentado */}
        <div className="flex items-center space-x-1 relative z-20">
          <span className="text-gray-400 text-xs">FORMATO:</span>
          <AspectRatioControl /> {/* Componente reutilizable */}
        </div>
      </div>

      {/* Contenedor del canvas */}
      <div className="w-full flex-1 flex items-center justify-center overflow-hidden p-2">
        <div 
          className={`relative ${getContainerStyle()} ${getCanvasBackground()} transition-all duration-300 ease-in-out shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
        >
          <svg
            ref={svgRef}
            className="w-full h-full transition-all duration-300 pointer-events-none" // Añadido pointer-events-none
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            preserveAspectRatio="none" // Cambiado a none
          />
        </div>
      </div>
    </div>
  );
}
