import React from 'react';

interface RightColumnProps {
  children?: React.ReactNode;
}

export function RightColumn({ children }: RightColumnProps) {
  return (
    <div className="h-screen border-l border-sidebar-border bg-sidebar text-sidebar-foreground p-4 overflow-y-auto">
      <div className="space-y-4">
        <h2 className="text-sm font-mono tracking-tight">PROPIEDADES DE VECTORES</h2>
        {children}
      </div>
    </div>
  );
}
