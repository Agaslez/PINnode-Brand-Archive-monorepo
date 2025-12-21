import React, { useState } from 'react';
import { Search, Download, Eye, Trash2, Tag, Calendar, Shield, Unlock, FileText, Code2, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArchivedEntry } from '@shared/schema';
import { PINnodeCrypto } from '@/lib/crypto';

interface ArchiveViewerProps {
  entries: ArchivedEntry[];
  masterKey: string;
  onRefresh: () => void;
}

export function ArchiveViewer({ entries, masterKey, onRefresh }: ArchiveViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<{ [key: number]: string }>({});
  const { toast } = useToast();

  const categories = [...new Set(entries.map(e => e.category).filter(Boolean))];
  
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.category && entry.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || entry.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDecrypt = async (entry: ArchivedEntry) => {
    if (!masterKey.trim()) {
      toast({
        title: "Błąd",
        description: "Wprowadź Master Key aby odszyfrować plik",
        variant: "destructive"
      });
      return;
    }

    try {
      const decrypted = PINnodeCrypto.decrypt(entry.content, masterKey);
      setDecryptedContent(prev => ({ ...prev, [entry.id!]: decrypted }));
      setExpandedEntry(entry.id!);
      
      toast({
        title: "Sukces",
        description: "Plik został odszyfrowany"
      });
    } catch (error) {
      toast({
        title: "Błąd odszyfrowywania",
        description: "Nieprawidłowy Master Key lub uszkodzone dane",
        variant: "destructive"
      });
    }
  };

  const handleDownload = (entry: ArchivedEntry) => {
    const content = decryptedContent[entry.id!] || entry.content;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = entry.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Sukces",
      description: "Plik został pobrany"
    });
  };

  const handleDelete = async (entry: ArchivedEntry) => {
    if (!confirm(`Czy na pewno chcesz usunąć "${entry.filename}"?`)) return;

    try {
      const response = await fetch(`/api/archive/${entry.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete entry');

      toast({
        title: "Sukces",
        description: "Plik został usunięty z archiwum"
      });

      onRefresh();
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć pliku",
        variant: "destructive"
      });
    }
  };

  const detectCodeLanguage = (filename: string, content: string): string | null => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const codeExts = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'css', 'html', 'json', 'xml', 'sql'];
    
    if (ext && codeExts.includes(ext)) return ext;
    if (content.includes('function') || content.includes('const ') || content.includes('import ')) return 'js';
    if (content.includes('def ') || content.includes('import ') && content.includes('from ')) return 'py';
    
    return null;
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200">{part}</mark> : part
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card className="glass-effect rounded-2xl border border-blue-100 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Szukaj w nazwach plików, tagach, kategoriach..."
                className="pl-10 rounded-xl border-blue-200"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-blue-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white"
            >
              <option value="">Wszystkie kategorie</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredEntries.length === 0 
                ? 'Brak plików' 
                : `Znaleziono ${filteredEntries.length} plików`
              }
            </span>
            
            {masterKey ? (
              <div className="flex items-center gap-2 text-green-600">
                <Shield className="w-4 h-4" />
                Master Key aktywny
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-500">
                <Lock className="w-4 h-4" />
                Wprowadź Master Key
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card className="glass-effect rounded-2xl border border-blue-100 shadow-xl text-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchQuery ? 'Brak wyników' : 'Puste archiwum'}
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              {searchQuery 
                ? 'Nie znaleziono plików pasujących do wyszukiwanej frazy.'
                : 'Prześlij pliki aby rozpocząć korzystanie z bezpiecznego archiwum.'
              }
            </p>
          </Card>
        ) : (
          filteredEntries.map((entry) => {
            const isExpanded = expandedEntry === entry.id;
            const content = decryptedContent[entry.id!];
            const codeLanguage = content ? detectCodeLanguage(entry.filename, content) : null;
            
            return (
              <Card key={entry.id} className="glass-effect rounded-2xl border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          {highlightSearchTerm(entry.filename, searchQuery)}
                        </h3>
                        
                        {entry.category && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {entry.category}
                          </Badge>
                        )}
                        
                        {entry.encrypted && (
                          <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-200">
                            <Shield className="w-3 h-3" />
                            Zaszyfrowane
                          </Badge>
                        )}
                        
                        {codeLanguage && (
                          <Badge variant="outline" className="flex items-center gap-1 text-blue-600 border-blue-200">
                            <Code2 className="w-3 h-3" />
                            {codeLanguage.toUpperCase()}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {entry.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {highlightSearchTerm(tag, searchQuery)}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(entry.createdAt)}
                        </div>
                        
                        {entry.fileSize && (
                          <span>{formatFileSize(entry.fileSize)}</span>
                        )}
                        
                        {entry.source && (
                          <span>Źródło: {entry.source}</span>
                        )}
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && content && (
                        <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Odszyfrowana zawartość:
                          </h4>
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto bg-white rounded-lg p-3 border">
                            {content}
                          </pre>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {entry.encrypted && !content ? (
                        <Button
                          onClick={() => handleDecrypt(entry)}
                          disabled={!masterKey}
                          variant="secondary"
                          size="sm"
                          className="flex items-center gap-2 rounded-xl"
                        >
                          <Unlock className="w-4 h-4" />
                          Odszyfruj
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setExpandedEntry(isExpanded ? null : entry.id!)}
                          variant="secondary"
                          size="sm"
                          className="flex items-center gap-2 rounded-xl"
                        >
                          <Eye className="w-4 h-4" />
                          {isExpanded ? 'Ukryj' : 'Podgląd'}
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => handleDownload(entry)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 rounded-xl"
                      >
                        <Download className="w-4 h-4" />
                        Pobierz
                      </Button>
                      
                      <Button
                        onClick={() => handleDelete(entry)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}