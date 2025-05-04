"use client";

import React, { useState, useEffect } from 'react';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { AnimationControls } from '@/components/columns/AnimationControls';
import { VectorProperties } from '@/components/columns/VectorProperties';
import { ExportDialog } from '@/components/vector/ExportDialog';
import VectorCanvasSVG from '@/components/vector/VectorCanvasSVG';
import { exportDialogState } from '@/hooks/vector/useExportDialog';


export default function Home() {
  // Estado local para reflejar el estado global del diálogo
  const [exportDialogOpen, setExportDialogOpen] = useState(exportDialogState.isOpen);
  
  // Sincronizar con el estado global del diálogo
  useEffect(() => {
    const handleExportDialogChange = (e: CustomEvent) => {
      setExportDialogOpen(e.detail);
    };
    
    // Suscribirse al evento personalizado
    window.addEventListener('export-dialog-change', handleExportDialogChange as EventListener);
    
    return () => {
      window.removeEventListener('export-dialog-change', handleExportDialogChange as EventListener);
    };
  }, []);
  
  // Desactivar completamente TODOS los eventos de teclado globales cuando se está en un input
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // Verifica si el evento proviene de un input o textarea
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Prevenir que cualquier otro detector de eventos lo maneje
        e.stopPropagation();
      }
    };
    
    // Capturar eventos en la fase de captura, para actuar antes que otros handlers
    document.addEventListener('keydown', handleGlobalKeyDown, true);
    document.addEventListener('keyup', handleGlobalKeyDown, true);
    document.addEventListener('keypress', handleGlobalKeyDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, true);
      document.removeEventListener('keyup', handleGlobalKeyDown, true);
      document.removeEventListener('keypress', handleGlobalKeyDown, true);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">

      {/* Layout de tres columnas */}
      <ThreeColumnLayout
        leftContent={<AnimationControls />}
        centerContent={
          <div className="w-full overflow-auto flex justify-center p-4">
            {/* Contenedor con scroll horizontal para permitir que el canvas se muestre completo */}
            <VectorCanvasSVG />
          </div>
        }
        rightContent={<VectorProperties />}
      />
      
      {/* Modal de exportación */}
      <ExportDialog 
        open={exportDialogOpen} 
        onOpenChange={(open) => {
          setExportDialogOpen(open);
          exportDialogState.setIsOpen(open);
        }} 
      />
      
      {/* Información sobre la versión SVG */}
      <div className="fixed bottom-4 right-4 bg-black/50 text-white text-xs p-2 rounded-md">
        <p>Usando visualización nativa SVG con Victor.js</p>
      </div>
    </div>
  );
}
