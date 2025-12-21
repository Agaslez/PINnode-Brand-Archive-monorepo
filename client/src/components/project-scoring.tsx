import React, { useState } from 'react';
import { Star, Download, Edit, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BrandProject } from '@shared/schema';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ProjectScoringProps {
  project: BrandProject;
  onUpdate?: () => void;
}

export function ProjectScoring({ project, onUpdate }: ProjectScoringProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateRatingMutation = useMutation({
    mutationFn: async (rating: number) => {
      const response = await fetch(`/api/projects/${project.id}/rating`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
      if (!response.ok) throw new Error('Failed to update rating');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Ocena zaktualizowana",
        description: `Projekt otrzymał ${project.rating} ${project.rating === 1 ? 'gwiazdkę' : 'gwiazdek'}`
      });
      onUpdate?.();
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować oceny",
        variant: "destructive"
      });
    }
  });

  const updateExportStatusMutation = useMutation({
    mutationFn: async (exported: boolean) => {
      const response = await fetch(`/api/projects/${project.id}/export-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exported })
      });
      if (!response.ok) throw new Error('Failed to update export status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Status eksportu zaktualizowany",
        description: project.exported ? "Projekt oznaczony jako wyeksportowany" : "Status eksportu usunięty"
      });
      onUpdate?.();
    }
  });

  const handleRatingClick = (rating: number) => {
    updateRatingMutation.mutate(rating);
  };

  const toggleExportStatus = () => {
    updateExportStatusMutation.mutate(!project.exported);
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 0) return 'Nie oceniono';
    if (rating === 1) return 'Słaby';
    if (rating === 2) return 'Przeciętny';
    if (rating === 3) return 'Dobry';
    if (rating === 4) return 'Bardzo dobry';
    if (rating === 5) return 'Doskonały';
    return 'Nie oceniono';
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Nieznana';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd.MM.yyyy HH:mm');
  };

  return (
    <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
      {/* Rating Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Ocena projektu:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(null)}
                disabled={updateRatingMutation.isPending}
                className="p-1 hover:scale-110 transition-transform disabled:opacity-50"
              >
                <Star
                  className={`w-5 h-5 transition-colors ${
                    star <= ((hoveredRating ?? project.rating) || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <Badge variant="secondary" className="text-xs">
            {getRatingLabel(project.rating || 0)}
          </Badge>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge 
          variant={project.exported ? "default" : "outline"}
          className={`cursor-pointer transition-colors ${
            project.exported 
              ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' 
              : 'hover:bg-gray-100'
          }`}
          onClick={toggleExportStatus}
        >
          <Download className="w-3 h-3 mr-1" />
          {project.exported ? 'Wyeksportowany' : 'Nie eksportowany'}
        </Badge>

        {project.edited && (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
            <Edit className="w-3 h-3 mr-1" />
            Edytowany
          </Badge>
        )}

        {(project.rating || 0) >= 4 && (
          <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-300">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Wysoka ocena
          </Badge>
        )}
      </div>

      {/* Dates Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          <span>Utworzony: {formatDate(project.createdAt)}</span>
        </div>
        {project.updatedAt && project.updatedAt !== project.createdAt && (
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Ostatnia zmiana: {formatDate(project.updatedAt)}</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-blue-200">
        <Button
          size="sm"
          variant="outline"
          onClick={toggleExportStatus}
          disabled={updateExportStatusMutation.isPending}
          className="text-xs"
        >
          <Download className="w-3 h-3 mr-1" />
          {project.exported ? 'Cofnij eksport' : 'Oznacz jako wyeksportowany'}
        </Button>
        
        {(project.rating || 0) === 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRatingClick(4)}
            disabled={updateRatingMutation.isPending}
            className="text-xs"
          >
            <Star className="w-3 h-3 mr-1" />
            Szybka ocena: 4⭐
          </Button>
        )}
      </div>

      {/* Analytics Insight */}
      {(project.rating || 0) >= 4 && project.exported && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
          🎯 Świetny projekt! Wysoka ocena + eksport = wzorzec sukcesu dla AI Analytics
        </div>
      )}
    </div>
  );
}