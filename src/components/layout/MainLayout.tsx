import React from 'react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  topBar?: React.ReactNode;
  bottomBar?: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, topBar, bottomBar, className }: MainLayoutProps) {
  return (
    <div className={cn("flex flex-col min-h-screen bg-black text-gray-200", className)}>
      {topBar && (
        <div className="bg-gray-900 border-b border-gray-700 p-3 lg:px-6 flex-shrink-0">
          {topBar}
        </div>
      )}
      
      <main className="flex-grow flex items-center justify-center p-6 overflow-hidden">
        {children}
      </main>
      
      {bottomBar && (
        <div className="bg-gray-900 border-t border-gray-700 p-3 lg:px-6 flex-shrink-0">
          {bottomBar}
        </div>
      )}
    </div>
  );
}
