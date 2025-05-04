import React from 'react';

interface CenterColumnProps {
  children?: React.ReactNode;
}

export function CenterColumn({ children }: CenterColumnProps) {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <div className="p-2 border-b border-border">
        <h2 className="text-sm font-mono tracking-tight px-2">VISUALIZACIÓN</h2>
      </div>
      <div className="flex-1 overflow-hidden flex items-center justify-center bg-black w-full h-full">
        {children}
      </div>
    </div>
  );
}
