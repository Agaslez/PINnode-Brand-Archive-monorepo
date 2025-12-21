import React, { useState, useRef } from 'react';
import { Upload, File, Shield, Lock, Tag, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PINnodeCrypto } from '@/lib/crypto';

interface FileUploadProps {
  masterKey: string;
  onUploadComplete: () => void;
}

export function FileUpload({ masterKey, onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [source, setSource] = useState('Manual upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const categories = [
    'PINpall', 'Talism.ai', 'Avatar', 'DevOps', 'AI Chats', 
    'Branding', 'Code Snippets', 'Documentation', 'Ideas', 'Other'
  ];

  const sources = [
    'Manual upload', 'ChatGPT', 'DeepSeek', 'Claude', 'GitHub', 'Email', 'Web Download'
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!masterKey.trim()) {
      toast({
        title: "Błąd",
        description: "Wprowadź Master Key przed przesłaniem plików",
        variant: "destructive"
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "Błąd",
        description: "Wybierz pliki do przesłania",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);

      // Process each file
      for (const file of selectedFiles) {
        const content = await file.text();
        
        // Encrypt content with master key
        const encryptedContent = PINnodeCrypto.encrypt(content, masterKey);
        
        // Prepare entry data
        const entryData = {
          filename: file.name,
          content: encryptedContent,
          encrypted: true,
          tags: tagArray,
          category: category || undefined,
          fileSize: file.size,
          source: source
        };

        // Upload to server
        const response = await fetch('/api/archive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryData)
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      toast({
        title: "Sukces",
        description: `Przesłano i zaszyfrowano ${selectedFiles.length} plików`
      });

      // Reset form
      setSelectedFiles([]);
      setCategory('');
      setTags('');
      setSource('Manual upload');
      
      onUploadComplete();
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się przesłać plików",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Card className="glass-effect rounded-2xl border border-blue-100 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-gray-900">Bezpieczny Upload</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            AES-256
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Master Key Status */}
        {masterKey ? (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <Shield className="w-4 h-4" />
            Master Key aktywny - pliki będą zaszyfrowane
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <Lock className="w-4 h-4" />
            Wprowadź Master Key aby włączyć szyfrowanie
          </div>
        )}

        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragging 
              ? 'border-primary bg-blue-50 scale-[1.02]' 
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-semibold text-gray-700 mb-2">
            Przeciągnij pliki tutaj lub kliknij aby wybrać
          </p>
          <p className="text-sm text-gray-500">
            Obsługuje: .txt, .md, .json, .zip, .pdf, obrazy i więcej
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept=".txt,.md,.json,.zip,.pdf,.png,.jpg,.jpeg,.gif,.webp,.svg,.doc,.docx,.csv,.xlsx"
          />
        </div>

        {/* File List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800">Wybrane pliki ({selectedFiles.length}):</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                    <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              <Tag className="inline w-4 h-4 text-primary mr-2" />
              Kategoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-blue-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
            >
              <option value="">Wybierz kategorię...</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">Źródło</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 border border-blue-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
            >
              {sources.map(src => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Tagi (oddzielone przecinkami)
          </label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="np. kod, pomysł, funkcja, api"
            className="rounded-xl border-blue-200"
          />
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={isUploading || selectedFiles.length === 0 || !masterKey}
          className="w-full rounded-xl py-3 text-lg font-semibold"
        >
          <Upload className="w-5 h-5 mr-2" />
          {isUploading ? 'Szyfrowanie i przesyłanie...' : `Prześlij ${selectedFiles.length} plików`}
        </Button>
      </CardContent>
    </Card>
  );
}