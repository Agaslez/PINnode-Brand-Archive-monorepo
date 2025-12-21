import React, { useState } from 'react';
import { Tag, X, Plus } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileEntry } from '@shared/schema';
import { database } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileEntry | null;
  onUpdate: () => void;
}

export function TagModal({ isOpen, onClose, file, onUpdate }: TagModalProps) {
  const [newTag, setNewTag] = useState('');
  const { toast } = useToast();

  const popularTags = ['PINpall', 'Talism.ai', 'Vault', 'Projekt', 'AI', 'Chat', 'Dokumenty'];

  const handleAddTag = async () => {
    if (!file || !newTag.trim()) return;

    const tag = newTag.trim();
    
    if (file.tags.includes(tag)) {
      toast({
        title: "Błąd",
        description: "Ten tag już istnieje dla tego pliku",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedFile = {
        ...file,
        tags: [...file.tags, tag]
      };

      await database.updateEntry(updatedFile);
      
      toast({
        title: "Sukces",
        description: `Dodano tag "${tag}"`
      });
      
      setNewTag('');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Add tag error:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się dodać tagu",
        variant: "destructive"
      });
    }
  };

  const handleSelectTag = (tag: string) => {
    setNewTag(tag);
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!file) return;

    try {
      const updatedFile = {
        ...file,
        tags: file.tags.filter(tag => tag !== tagToRemove)
      };

      await database.updateEntry(updatedFile);
      
      toast({
        title: "Sukces",
        description: `Usunięto tag "${tagToRemove}"`
      });
      
      onUpdate();
    } catch (error) {
      console.error('Remove tag error:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć tagu",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Zarządzanie tagami
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current tags */}
          {file && file.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Obecne tagi
              </label>
              <div className="flex flex-wrap gap-2">
                {file.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-red-100"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add new tag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dodaj nowy tag
            </label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="np. PINpall, Talism.ai..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button onClick={handleAddTag} disabled={!newTag.trim()}>
                <Plus className="w-4 h-4 mr-1" />
                Dodaj
              </Button>
            </div>
          </div>

          {/* Popular tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Popularne tagi
            </label>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectTag(tag)}
                  className="text-xs"
                  disabled={file?.tags.includes(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Zamknij
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
