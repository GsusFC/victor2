import React, { useState } from 'react';
import { useVectorStore } from '@/lib/store';
import { AnimationFavorite } from '@/components/vector/core/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Diálogo para guardar o renombrar un favorito
 */
interface FavoriteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  onConfirm: (name: string) => void;
  title: string;
  confirmLabel: string;
}

const FavoriteDialog: React.FC<FavoriteDialogProps> = ({ 
  open, 
  onOpenChange, 
  initialName = '', 
  onConfirm,
  title,
  confirmLabel
}) => {
  const [name, setName] = useState(initialName);

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleConfirm} disabled={!name.trim()}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Panel de gestión de favoritos de animación
 */
const AnimationFavoritesPanel: React.FC = () => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<AnimationFavorite | null>(null);

  const actions = useVectorStore(state => state.actions);
  const animationFavorites = useVectorStore(state => state.animationFavorites);

  const handleSave = (name: string) => {
    actions.saveAnimationFavorite(name);
  };

  const handleRename = (newName: string) => {
    if (selectedFavorite) {
      actions.renameAnimationFavorite(selectedFavorite.id, newName);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este favorito?')) {
      actions.deleteAnimationFavorite(id);
    }
  };

  const handleLoad = (id: string) => {
    actions.loadAnimationFavorite(id);
  };

  const openRenameDialog = (favorite: AnimationFavorite) => {
    setSelectedFavorite(favorite);
    setRenameDialogOpen(true);
  };

  // Ordenar favoritos por timestamp (más recientes primero)
  const sortedFavorites = [...animationFavorites].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="animation-favorites-panel">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Animaciones Favoritas</h3>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setSaveDialogOpen(true)}
          title="Guardar configuración actual"
        >
          <span className="text-xl font-bold">+</span>
        </Button>
      </div>

      {sortedFavorites.length === 0 ? (
        <div className="text-center py-3 text-muted-foreground">
          No hay favoritos guardados.
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSaveDialogOpen(true)}
            >
              Guardar estado actual
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-h-[280px] pr-4 overflow-y-auto">
          <div className="space-y-2">
            {sortedFavorites.map((favorite) => (
              <div 
                key={favorite.id} 
                className="flex items-center justify-between bg-card p-2 rounded-md border"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{favorite.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(favorite.timestamp).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleLoad(favorite.id)}
                    title="Cargar esta configuración"
                  >
                    <span className="text-sm">★</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => openRenameDialog(favorite)}
                    title="Renombrar favorito"
                  >
                    <span className="text-sm">✎</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive"
                    onClick={() => handleDelete(favorite.id)}
                    title="Eliminar favorito"
                  >
                    <span className="text-sm">✕</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diálogo para guardar nuevo favorito */}
      <FavoriteDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onConfirm={handleSave}
        title="Guardar configuración actual"
        confirmLabel="Guardar"
      />

      {/* Diálogo para renombrar favorito */}
      <FavoriteDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        initialName={selectedFavorite?.name}
        onConfirm={handleRename}
        title="Renombrar favorito"
        confirmLabel="Renombrar"
      />
    </div>
  );
};

export default AnimationFavoritesPanel;
