import React, { useState } from 'react';
import { Download, Package, FileArchive, Image, FileText, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BrandProject, ArchivedEntry } from '@shared/schema';
import { PINnodeCrypto } from '@/lib/crypto';

interface ExportSystemProps {
  projects: BrandProject[];
  archivedEntries: ArchivedEntry[];
  masterKey: string;
}

export function ExportSystem({ projects, archivedEntries, masterKey }: ExportSystemProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'brandkit' | 'archive' | 'complete'>('brandkit');
  const { toast } = useToast();

  const generateBrandKitZip = async (project: BrandProject): Promise<Blob> => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Create brand kit folder structure
    const brandFolder = zip.folder(`${project.name}_BrandKit`);
    
    // Add logo as SVG
    if (project.logo) {
      brandFolder?.file(`${project.name}_Logo.svg`, project.logo);
    }

    // Generate style guide PDF content (as HTML for now)
    const styleGuideContent = `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name} - Brand Guide</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 50px; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 15px; }
        .section { margin-bottom: 30px; padding: 20px; border-left: 4px solid #667eea; background: #f8f9ff; }
        .logo-container { text-align: center; margin: 30px 0; padding: 30px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .colors { display: flex; gap: 20px; flex-wrap: wrap; }
        .color-swatch { width: 100px; height: 100px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
        h1 { margin: 0; font-size: 2.5em; }
        h2 { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .brand-description { font-size: 1.1em; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="header">
        <h1>${project.name}</h1>
        <p>Profesjonalny Brand Guide</p>
        <p>Wygenerowano przez PINnode Brander AI - ${new Date().toLocaleDateString('pl-PL')}</p>
    </div>

    <div class="section">
        <h2>Logo</h2>
        <div class="logo-container">
            ${project.logo || '<p>Brak logo</p>'}
        </div>
    </div>

    <div class="section">
        <h2>Opis Marki</h2>
        <div class="brand-description">
            ${project.description || 'Brak opisu marki.'}
        </div>
    </div>

    <div class="section">
        <h2>Informacje o Projekcie</h2>
        <p><strong>Nazwa:</strong> ${project.name}</p>
        <p><strong>Branża:</strong> ${project.industry || 'Nieokreślona'}</p>
        <p><strong>Data utworzenia:</strong> ${project.createdAt ? new Date(project.createdAt).toLocaleDateString('pl-PL') : 'Nieznana'}</p>
    </div>

    <div class="section">
        <h2>Paleta Kolorów</h2>
        <div class="colors">
            <div class="color-swatch" style="background: #667eea;">#667eea</div>
            <div class="color-swatch" style="background: #764ba2;">#764ba2</div>
            <div class="color-swatch" style="background: #4299e1;">#4299e1</div>
            <div class="color-swatch" style="background: #2d3748; color: white;">#2d3748</div>
        </div>
    </div>

    <div class="section">
        <h2>Wskazówki Użycia</h2>
        <p>• Logo należy używać na jednolitym tle dla najlepszej czytelności</p>
        <p>• Zachowaj odpowiednie proporcje przy skalowaniu logo</p>
        <p>• Używaj głównych kolorów marki dla spójności wizualnej</p>
        <p>• Zapewnij wystarczający kontrast między tekstem a tłem</p>
    </div>

    <footer style="text-align: center; margin-top: 50px; padding: 20px; border-top: 2px solid #eee; color: #666;">
        <p>Brand Guide wygenerowany przez PINnode Brander AI</p>
        <p>© ${new Date().getFullYear()} - Wszystkie prawa zastrzeżone</p>
    </footer>
</body>
</html>`;

    brandFolder?.file(`${project.name}_StyleGuide.html`, styleGuideContent);

    // Add project metadata
    const metadata = {
      projectName: project.name,
      industry: project.industry,
      createdAt: project.createdAt,
      description: project.description,
      exportedAt: new Date().toISOString(),
      exportedBy: 'PINnode System'
    };

    brandFolder?.file('metadata.json', JSON.stringify(metadata, null, 2));

    return await zip.generateAsync({ type: 'blob' });
  };

  const generateArchiveZip = async (): Promise<Blob> => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    const archiveFolder = zip.folder('PINnode_Archive');
    
    // Group entries by category
    const categorized = archivedEntries.reduce((acc, entry) => {
      const category = entry.category || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(entry);
      return acc;
    }, {} as Record<string, ArchivedEntry[]>);

    // Create category folders and add files
    for (const [category, entries] of Object.entries(categorized)) {
      const categoryFolder = archiveFolder?.folder(category);
      
      for (const entry of entries) {
        let content = entry.content;
        
        // Decrypt if encrypted and master key is available
        if (entry.encrypted && masterKey) {
          try {
            content = PINnodeCrypto.decrypt(entry.content, masterKey);
          } catch (error) {
            content = `[ENCRYPTED - Cannot decrypt without valid master key]\n\nOriginal filename: ${entry.filename}\nTags: ${entry.tags.join(', ')}\nCreated: ${new Date(entry.createdAt!).toLocaleString('pl-PL')}`;
          }
        }
        
        categoryFolder?.file(entry.filename, content);
      }
    }

    // Add archive metadata
    const archiveMetadata = {
      totalEntries: archivedEntries.length,
      categories: Object.keys(categorized),
      exportedAt: new Date().toISOString(),
      encryptedEntries: archivedEntries.filter(e => e.encrypted).length,
      exportedBy: 'PINnode System'
    };

    archiveFolder?.file('archive_metadata.json', JSON.stringify(archiveMetadata, null, 2));

    return await zip.generateAsync({ type: 'blob' });
  };

  const generateCompleteExport = async (): Promise<Blob> => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Add all brand kits
    if (projects.length > 0) {
      const brandKitsFolder = zip.folder('BrandKits');
      
      for (const project of projects) {
        const projectZip = await generateBrandKitZip(project);
        const projectArrayBuffer = await projectZip.arrayBuffer();
        brandKitsFolder?.file(`${project.name}_BrandKit.zip`, projectArrayBuffer);
      }
    }

    // Add archive
    if (archivedEntries.length > 0) {
      const archiveZip = await generateArchiveZip();
      const archiveArrayBuffer = await archiveZip.arrayBuffer();
      zip.file('Complete_Archive.zip', archiveArrayBuffer);
    }

    // Add system metadata
    const systemMetadata = {
      exportType: 'complete',
      totalProjects: projects.length,
      totalArchiveEntries: archivedEntries.length,
      exportedAt: new Date().toISOString(),
      systemVersion: '1.0.0',
      exportedBy: 'PINnode System'
    };

    zip.file('system_metadata.json', JSON.stringify(systemMetadata, null, 2));

    return await zip.generateAsync({ type: 'blob' });
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let zipBlob: Blob;
      let filename: string;

      switch (exportType) {
        case 'brandkit':
          if (projects.length === 0) {
            throw new Error('Brak projektów do eksportu');
          }
          if (projects.length === 1) {
            zipBlob = await generateBrandKitZip(projects[0]);
            filename = `${projects[0].name}_BrandKit.zip`;
          } else {
            // Multiple projects - create combined ZIP
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            
            for (const project of projects) {
              const projectZip = await generateBrandKitZip(project);
              const projectArrayBuffer = await projectZip.arrayBuffer();
              zip.file(`${project.name}_BrandKit.zip`, projectArrayBuffer);
            }
            
            zipBlob = await zip.generateAsync({ type: 'blob' });
            filename = 'All_BrandKits.zip';
          }
          break;

        case 'archive':
          if (archivedEntries.length === 0) {
            throw new Error('Brak plików w archiwum do eksportu');
          }
          zipBlob = await generateArchiveZip();
          filename = 'PINnode_Archive.zip';
          break;

        case 'complete':
          if (projects.length === 0 && archivedEntries.length === 0) {
            throw new Error('Brak danych do eksportu');
          }
          zipBlob = await generateCompleteExport();
          filename = 'PINnode_Complete_Export.zip';
          break;

        default:
          throw new Error('Nieznany typ eksportu');
      }

      // Download the ZIP file
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Sukces",
        description: `Eksport zakończony pomyślnie: ${filename}`
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Błąd eksportu",
        description: error instanceof Error ? error.message : "Nie udało się utworzyć eksportu",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    {
      id: 'brandkit',
      name: 'Brand Kits',
      description: 'Logo SVG + Style Guide HTML',
      icon: Palette,
      count: projects.length,
      color: 'text-purple-600'
    },
    {
      id: 'archive',
      name: 'Archiwum',
      description: 'Wszystkie pliki z kategorii',
      icon: FileArchive,
      count: archivedEntries.length,
      color: 'text-blue-600'
    },
    {
      id: 'complete',
      name: 'Pełny Eksport',
      description: 'Brand Kits + Archiwum',
      icon: Package,
      count: projects.length + archivedEntries.length,
      color: 'text-green-600'
    }
  ];

  return (
    <Card className="glass-effect rounded-2xl border border-blue-100 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Download className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-gray-900">System Eksportu</span>
          <Badge variant="secondary">ZIP</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-800">Wybierz typ eksportu:</h4>
          
          <div className="space-y-3">
            {exportOptions.map(option => {
              const OptionIcon = option.icon;
              return (
                <label
                  key={option.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    exportType === option.id
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportType"
                    value={option.id}
                    checked={exportType === option.id}
                    onChange={(e) => setExportType(e.target.value as any)}
                    className="sr-only"
                  />
                  
                  <OptionIcon className={`w-6 h-6 ${option.color}`} />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{option.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {option.count} {option.count === 1 ? 'element' : 'elementów'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Zawartość eksportu:
          </h4>
          <div className="text-xs text-blue-700 space-y-1">
            {exportType === 'brandkit' && (
              <>
                <div>• Pliki SVG z logami</div>
                <div>• Style Guide w formacie HTML</div>
                <div>• Metadata projektu (JSON)</div>
              </>
            )}
            {exportType === 'archive' && (
              <>
                <div>• Pliki pogrupowane według kategorii</div>
                <div>• Odszyfrowane treści (jeśli Master Key)</div>
                <div>• Metadata archiwum (JSON)</div>
              </>
            )}
            {exportType === 'complete' && (
              <>
                <div>• Wszystkie Brand Kits jako ZIP</div>
                <div>• Pełne archiwum z kategoriami</div>
                <div>• Metadata systemu (JSON)</div>
              </>
            )}
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting || (exportType === 'brandkit' && projects.length === 0) || (exportType === 'archive' && archivedEntries.length === 0)}
          className="w-full rounded-xl py-3 text-lg font-semibold"
        >
          <Package className="w-5 h-5 mr-2" />
          {isExporting ? 'Tworzenie ZIP...' : 'Eksportuj do ZIP'}
        </Button>
      </CardContent>
    </Card>
  );
}