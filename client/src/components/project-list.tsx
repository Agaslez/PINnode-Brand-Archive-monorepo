import React from 'react';
import { Calendar, Building2, Trash2, Download, Palette, Star, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BrandProject } from '@shared/schema';
import { ProjectScoring } from './project-scoring';

interface ProjectListProps {
  projects: BrandProject[];
  onProjectDeleted: () => void;
  onProjectUpdated: () => void;
}

export function ProjectList({ projects, onProjectDeleted, onProjectUpdated }: ProjectListProps) {
  const { toast } = useToast();

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć projekt "${name}"?`)) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete project');

      toast({
        title: "Sukces",
        description: "Projekt został usunięty"
      });

      onProjectDeleted();
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć projektu",
        variant: "destructive"
      });
    }
  };

  const handleExportBrandKit = async (project: BrandProject) => {
    const brandKit = {
      projectName: project.name,
      industry: project.industry,
      description: project.description,
      logo: project.logo,
      colorPalette: project.colorPalette ? JSON.parse(project.colorPalette) : null,
      fonts: project.fonts ? JSON.parse(project.fonts) : null,
      createdAt: project.createdAt
    };

    const blob = new Blob([JSON.stringify(brandKit, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}-brandkit.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Mark as exported
    if (project.id) {
      try {
        const response = await fetch(`/api/projects/${project.id}/export-status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exported: true })
        });

        if (response.ok) {
          onProjectUpdated();
        }
      } catch (error) {
        console.error('Failed to update export status:', error);
      }
    }

    toast({
      title: "Sukces",
      description: "BrandKit został wyeksportowany"
    });
  };

  const handleRatingChange = async (projectId: number, newRating: number) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/rating`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating })
      });

      if (!response.ok) throw new Error('Failed to update rating');

      toast({
        title: "Rating updated",
        description: `Project rated ${newRating} stars`
      });

      onProjectUpdated();
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update rating",
        variant: "destructive"
      });
    }
  };

  const handleExportStatusChange = async (projectId: number, exported: boolean) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/export-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exported })
      });

      if (!response.ok) throw new Error('Failed to update export status');

      toast({
        title: "Export status updated",
        description: `Project marked as ${exported ? 'exported' : 'not exported'}`
      });

      onProjectUpdated();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update export status", 
        variant: "destructive"
      });
    }
  };

  if (projects.length === 0) {
    return (
      <div className="glass-effect rounded-2xl border border-blue-100 shadow-xl text-center py-16">
        <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Brak projektów</h3>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          Utwórz swój pierwszy projekt brandingowy, aby rozpocząć pracę z AI
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {projects.map((project) => (
        <Card key={project.id} className="glass-effect rounded-2xl border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Info Section */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                  {project.industry && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {project.industry}
                    </Badge>
                  )}
                  
                  {/* Quick Status Badges */}
                  <div className="flex gap-2 ml-auto">
                    {project.exported && (
                      <Badge variant="default" className="text-xs">
                        <Download className="w-3 h-3 mr-1" />
                        Exported
                      </Badge>
                    )}
                    {project.edited && (
                      <Badge variant="outline" className="text-xs">
                        <Edit className="w-3 h-3 mr-1" />
                        Edited
                      </Badge>
                    )}
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
                      <span className="text-sm font-semibold">{(project.rating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                )}

                {project.logo && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Logo:</h4>
                    <div 
                      className="bg-gray-50 rounded-xl p-4 border border-blue-100 max-w-md"
                      dangerouslySetInnerHTML={{ __html: project.logo }}
                    />
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-500 mt-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  Utworzono: {formatDate(project.createdAt)}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => handleExportBrandKit(project)}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2 rounded-xl"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  
                  <Button
                    onClick={() => handleDelete(project.id!, project.name)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Scoring System Section */}
              <div>
                <ProjectScoring
                  project={project}
                  onRatingChange={handleRatingChange}
                  onExportStatusChange={handleExportStatusChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}