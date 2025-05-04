import React from 'react';

interface LeftColumnProps {
  children?: React.ReactNode;
}

export function LeftColumn({ children }: LeftColumnProps) {
  return (
    <div className="h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground p-4 overflow-y-auto">
      <div className="space-y-4">
        <h2 className="text-sm font-mono tracking-tight">CONTROLES DE ANIMACIÓN</h2>
        {children}
      </div>
    </div>
  );
}
