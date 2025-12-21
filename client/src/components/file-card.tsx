import React, { useState } from 'react';
import { FileText, Lock, Unlock, Tag, Download, Trash2, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileEntry } from '@shared/schema';
import { CryptoManager } from '@/lib/crypto';
import { database } from '@/lib/database';

interface FileCardProps {
  file: FileEntry;
  searchQuery: string;
  masterKey: string;
  onUpdate: () => void;
  onAddTag: (file: FileEntry) => void;
}

export function FileCard({ file, searchQuery, masterKey, onUpdate, onAddTag }: FileCardProps) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const { toast } = useToast();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const handleDecrypt = async () => {
    if (!masterKey.trim()) {
      toast({
        title: "Błąd",
        description: "Wprowadź klucz główny przed odszyfrowaniem",
        variant: "destructive"
      });
      return;
    }

    setIsDecrypting(true);
    try {
      const decryptedText = CryptoManager.decryptText(file.text, masterKey);
      
      const updatedFile = {
        ...file,
        text: decryptedText,
        encrypted: false,
        filename: file.filename.replace('.enc', '')
      };

      await database.updateEntry(updatedFile);
      
      toast({
        title: "Sukces",
        description: "Plik został odszyfrowany"
      });
      
      onUpdate();
    } catch (error) {
      console.error('Decryption error:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się odszyfrować pliku. Sprawdź klucz główny.",
        variant: "destructive"
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleEncrypt = async () => {
    if (!masterKey.trim()) {
      toast({
        title: "Błąd",
        description: "Wprowadź klucz główny przed zaszyfrowaniem",
        variant: "destructive"
      });
      return;
    }

    try {
      const encryptedText = CryptoManager.encryptText(file.text, masterKey);
      
      const updatedFile = {
        ...file,
        text: encryptedText,
        encrypted: true,
        filename: file.filename.includes('.enc') ? file.filename : file.filename + '.enc'
      };

      await database.updateEntry(updatedFile);
      
      toast({
        title: "Sukces",
        description: "Plik został zaszyfrowany"
      });
      
      onUpdate();
    } catch (error) {
      console.error('Encryption error:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaszyfrować pliku",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    let content = file.text;
    let filename = file.filename;

    if (file.encrypted) {
      toast({
        title: "Błąd",
        description: "Nie można eksportować zaszyfrowanego pliku. Najpierw go odszyfruj.",
        variant: "destructive"
      });
      return;
    }

    // Create markdown content
    const markdownContent = `# ${filename}\n\n${content}`;
    
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/\.(txt|enc)$/, '') + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Sukces",
      description: "Plik został wyeksportowany"
    });
  };

  const handleDelete = async () => {
    if (confirm('Czy na pewno chcesz usunąć ten plik?')) {
      try {
        await database.deleteEntry(file.id!);
        toast({
          title: "Sukces",
          description: "Plik został usunięty"
        });
        onUpdate();
      } catch (error) {
        console.error('Delete error:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć pliku",
          variant: "destructive"
        });
      }
    }
  };

  const getFileIcon = () => {
    if (file.encrypted) {
      return <Lock className="w-5 h-5 text-orange-600" />;
    }
    return <FileText className="w-5 h-5 text-green-600" />;
  };

  const getFileIconBg = () => {
    if (file.encrypted) {
      return "bg-orange-100";
    }
    return "bg-green-100";
  };

  const renderContent = () => {
    if (file.encrypted) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <Shield className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800 font-medium">Plik zaszyfrowany</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Aby wyświetlić zawartość, wprowadź klucz główny i kliknij "Odszyfruj"
          </p>
        </div>
      );
    }

    const preview = file.text.length > 500 ? file.text.substring(0, 500) + '...' : file.text;
    
    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <pre className="text-sm text-gray-700 font-mono leading-relaxed whitespace-pre-wrap">
          {highlightText(preview, searchQuery)}
        </pre>
      </div>
    );
  };

  return (
    <Card className="glass-effect p-6 hover:shadow-xl transition-all duration-300 animate-slide-up border border-blue-100 rounded-2xl">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`w-10 h-10 ${getFileIconBg()} rounded-lg flex items-center justify-center`}>
              {getFileIcon()}
            </div>
            <div>
              <h3 className="font-mono text-sm font-medium text-gray-900">
                {highlightText(file.filename, searchQuery)}
              </h3>
              <p className="text-xs text-gray-500">{formatDate(file.date)}</p>
            </div>
          </div>

          {renderContent()}

          {/* Tags */}
          {file.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {file.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {highlightText(tag, searchQuery)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
        {file.encrypted ? (
          <Button 
            onClick={handleDecrypt}
            disabled={isDecrypting}
            className="bg-primary hover:bg-primary/90"
          >
            <Unlock className="w-4 h-4 mr-2" />
            {isDecrypting ? 'Odszyfrowywanie...' : 'Odszyfruj'}
          </Button>
        ) : (
          <Button 
            onClick={handleEncrypt}
            variant="secondary"
            className="bg-primary/10 text-primary hover:bg-primary/20"
          >
            <Lock className="w-4 h-4 mr-2" />
            Zaszyfruj
          </Button>
        )}
        
        <Button variant="secondary" onClick={() => onAddTag(file)}>
          <Tag className="w-4 h-4 mr-2" />
          Dodaj tag
        </Button>
        
        <Button variant="secondary" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export MD
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleDelete}
          className="ml-auto text-gray-400 hover:text-red-500 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
