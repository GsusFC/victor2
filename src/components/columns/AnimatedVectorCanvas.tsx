import React, { useRef, useEffect, useCallback, memo } from 'react';
import Victor from 'victor';
import { useVectorStore, useVectorActions } from '@/lib/store';
import { useVectorAnimation } from '@/hooks/vector/useVectorAnimation';
import type { ExtendedVectorItem } from '@/components/vector/core/vectorTypes';

interface AnimatedVectorCanvasProps {
  svgWidth: number;
  svgHeight: number;
  gridCols: number;
}

const AnimatedVectorCanvas: React.FC<AnimatedVectorCanvasProps> = memo(({ svgWidth, svgHeight, gridCols }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const mousePositionRef = useRef<Victor | null>(null);
  
  const { 
    setSvgLines, 
    setCalculatedValues, 
    setAnimationFrameId, 
    setPinwheelCenters: setPinwheelCentersAction,
    setLastPulseTime 
  } = useVectorActions();
  const { calculateTargetAngle } = useVectorAnimation();
  
  const svgLines = useVectorStore((state) => state.svgLines);
  const animationFrameId = useVectorStore((state) => state.animationFrameId);
  const currentAnimationTypeFromStore = useVectorStore.getState().settings.currentAnimationType;
  const isPausedFromStore = useVectorStore.getState().settings.isPaused;

  useEffect(() => {
    setCalculatedValues(gridCols, svgWidth, svgHeight);
  }, [gridCols, svgWidth, svgHeight, setCalculatedValues]);

  const initializePinwheelCenters = useCallback(() => {
    const currentSettings = useVectorStore.getState().settings;
    const currentCalculatedValues = useVectorStore.getState().calculatedValues;

    if (currentSettings.currentAnimationType !== 'pinwheels' || !svgRef.current || currentCalculatedValues.cols === 0) return;

    const newPinwheelCenters = Array.from({ length: currentSettings.pinwheelCount }).map(() => ({
      x: Math.random() * currentCalculatedValues.svgWidth,
      y: Math.random() * currentCalculatedValues.svgHeight,
      vx: (Math.random() - 0.5) * 2, 
      vy: (Math.random() - 0.5) * 2,
      strength: currentSettings.mouseAttractionStrength || 0.5, 
      speed: currentSettings.animationSpeedFactor || 1,       
    }));
    setPinwheelCentersAction(newPinwheelCenters);
  }, [setPinwheelCentersAction]); 

  useEffect(() => {
    initializePinwheelCenters();
  }, [initializePinwheelCenters, currentAnimationTypeFromStore]); 

  const animateVectors = useCallback(() => {
    const currentSettings = useVectorStore.getState().settings;
    const currentCalculatedValues = useVectorStore.getState().calculatedValues;
    const currentLastPulseTimeConst = useVectorStore.getState().lastPulseTime;

    if (!svgRef.current || currentSettings.isPaused) {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        setAnimationFrameId(null);
      }
      return;
    }

    const timestamp = Date.now();
    let newLastPulseTime = currentLastPulseTimeConst;

    if (currentSettings.currentAnimationType === 'centerPulse' && timestamp - currentLastPulseTimeConst > currentSettings.pulseInterval) {
      newLastPulseTime = timestamp;
      setLastPulseTime(newLastPulseTime); 
    }

    const newSvgLines = svgLines.map((vec) => {
      const targetAngle = calculateTargetAngle(
        vec,
        mousePositionRef.current, 
        { width: currentCalculatedValues.svgWidth, height: currentCalculatedValues.svgHeight },
        timestamp
      );

      let newAngle = vec.angle;
      const angleDiff = (targetAngle - vec.angle + 360) % 360;
      const rotation = currentSettings.rotationSpeed * currentSettings.animationSpeedFactor;
      
      if (angleDiff < 180) {
        newAngle += Math.min(rotation, angleDiff);
      } else {
        newAngle -= Math.min(rotation, 360 - angleDiff);
      }
      newAngle = (newAngle + 360) % 360;

      const length = currentSettings.vectorLength * (vec.lengthFactor || 1);

      const updatedVec: ExtendedVectorItem = {
        ...vec,
        angle: newAngle,
        x2: vec.x1 + Math.cos(newAngle * Math.PI / 180) * length,
        y2: vec.y1 + Math.sin(newAngle * Math.PI / 180) * length,
      };
      return updatedVec;
    });

    setSvgLines(newSvgLines);

    const frameId = requestAnimationFrame(animateVectors);
    setAnimationFrameId(frameId);
  }, [
    svgLines, 
    calculateTargetAngle, 
    setSvgLines, 
    setAnimationFrameId, 
    animationFrameId, 
    setLastPulseTime 
  ]);

  useEffect(() => {
    if (!isPausedFromStore) { 
      animateVectors();
    }
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        setAnimationFrameId(null);
      }
    };
  }, [animateVectors, isPausedFromStore, animationFrameId, setAnimationFrameId]);
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        mousePositionRef.current = new Victor(event.clientX - rect.left, event.clientY - rect.top);
      }
    };
    const currentSvgRef = svgRef.current;
    currentSvgRef?.addEventListener('mousemove', handleMouseMove);
    return () => {
      currentSvgRef?.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      width={svgWidth}
      height={svgHeight}
      className='overflow-hidden bg-background'
      style={{ backgroundColor: useVectorStore.getState().settings.backgroundColor }}
    >
      {svgLines.map(line => (
        <line
          key={line.id}
          x1={line.x1}
          y1={line.y1} 
          x2={line.x2}
          y2={line.y2}
          stroke={line.color}
          strokeWidth={line.strokeWidth}
          strokeLinecap={line.strokeLinecap}
          style={{ transformOrigin: `${line.x1}px ${line.y1}px`, transform: `rotate(${line.angle}deg)` }}
        />
      ))}
    </svg>
  );
});

AnimatedVectorCanvas.displayName = 'AnimatedVectorCanvas';
export default AnimatedVectorCanvas;
