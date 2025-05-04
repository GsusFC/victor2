import React from 'react';
import { LeftColumn } from './LeftColumn';
import { CenterColumn } from './CenterColumn';
import { RightColumn } from './RightColumn';

interface ThreeColumnLayoutProps {
  leftContent: React.ReactNode;
  centerContent: React.ReactNode;
  rightContent: React.ReactNode;
}

export function ThreeColumnLayout({ 
  leftContent, 
  centerContent, 
  rightContent 
}: ThreeColumnLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-background text-foreground">
      {/* Columna izquierda - Controles de animación */}
      <div className="w-full md:w-1/4 md:max-w-[350px] h-full md:h-screen overflow-hidden border-b md:border-b-0 md:border-r border-border">
        <LeftColumn>
          {leftContent}
        </LeftColumn>
      </div>
      
      {/* Columna central - Visualización del canvas */}
      <div className="w-full md:flex-1 h-full md:h-screen overflow-hidden">
        <CenterColumn>
          {centerContent}
        </CenterColumn>
      </div>
      
      {/* Columna derecha - Propiedades de vectores */}
      <div className="w-full md:w-1/4 md:max-w-[350px] h-full md:h-screen overflow-hidden border-t md:border-t-0 md:border-l border-border">
        <RightColumn>
          {rightContent}
        </RightColumn>
      </div>
    </div>
  );
}
