import { useState, useCallback } from 'react';

// Hook simple para gestionar el estado del diálogo de exportación
// Utilizamos un hook de React en lugar de Zustand ya que no necesitamos
// que este estado persista entre recargas de página
export function useExportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  
  const openDialog = useCallback(() => {
    setIsOpen(true);
  }, []);
  
  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);
  
  return {
    isOpen,
    openDialog,
    closeDialog,
    setIsOpen
  };
}

// Exportamos una instancia única para poder compartirla entre componentes
// sin necesidad de un contexto o props drilling
export const exportDialogState = {
  isOpen: false,
  setIsOpen: (value: boolean) => {
    exportDialogState.isOpen = value;
    
    // Disparar un evento personalizado para notificar a los componentes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('export-dialog-change', { detail: value }));
    }
  },
  openDialog: () => exportDialogState.setIsOpen(true),
  closeDialog: () => exportDialogState.setIsOpen(false),
};
