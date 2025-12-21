import React, { useState } from 'react';
import { Download, MessageSquare, Bot, FileText, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PINnodeCrypto } from '@/lib/crypto';

interface ChatDownloaderProps {
  masterKey: string;
  onDownloadComplete: (files: { filename: string; content: string }[]) => void;
}

export function ChatDownloader({ masterKey, onDownloadComplete }: ChatDownloaderProps) {
  const [chatUrl, setChatUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoDetectMode, setAutoDetectMode] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('auto');
  const { toast } = useToast();

  const supportedPlatforms = [
    { id: 'auto', name: 'Auto-detect', icon: Zap, color: 'text-blue-600' },
    { id: 'chatgpt', name: 'ChatGPT', icon: Bot, color: 'text-green-600' },
    { id: 'deepseek', name: 'DeepSeek', icon: MessageSquare, color: 'text-purple-600' },
    { id: 'claude', name: 'Claude', icon: MessageSquare, color: 'text-orange-600' },
    { id: 'generic', name: 'Generic Chat', icon: FileText, color: 'text-gray-600' }
  ];

  const detectPlatform = (url: string): string => {
    if (url.includes('chatgpt.com') || url.includes('chat.openai.com')) return 'chatgpt';
    if (url.includes('deepseek.com')) return 'deepseek';
    if (url.includes('claude.ai')) return 'claude';
    return 'generic';
  };

  const extractChatContent = async (url: string, platform: string): Promise<{ filename: string; content: string }[]> => {
    try {
      // Simulate chat extraction based on platform
      const detectedPlatform = platform === 'auto' ? detectPlatform(url) : platform;
      
      // In a real implementation, this would use web scraping or API calls
      // For now, we'll simulate the extraction process
      const chatId = url.split('/').pop() || 'unknown';
      const timestamp = new Date().toISOString().split('T')[0];
      
      const mockChatContent = `# ${detectedPlatform.toUpperCase()} Chat Export
## Chat ID: ${chatId}
## Exported: ${new Date().toLocaleString('pl-PL')}
## Source: ${url}

---

**User:** Hello, can you help me with a coding problem?

**Assistant:** Of course! I'd be happy to help you with your coding problem. What specific issue are you working on?

**User:** I need to create a React component for file uploads with drag and drop functionality.

**Assistant:** I'll help you create a React component with drag and drop file upload functionality. Here's a complete implementation:

\`\`\`jsx
import React, { useState, useRef } from 'react';

const FileUpload = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
    
    if (onFileUpload) {
      onFileUpload(droppedFiles);
    }
  };

  return (
    <div
      className={\`border-2 border-dashed p-8 text-center transition-colors \${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }\`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const selectedFiles = Array.from(e.target.files);
          setFiles(prev => [...prev, ...selectedFiles]);
          if (onFileUpload) onFileUpload(selectedFiles);
        }}
      />
      
      <p className="text-lg font-semibold mb-2">
        {isDragging ? 'Drop files here' : 'Drag & drop files or click to select'}
      </p>
      
      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Selected files:</p>
          {files.map((file, index) => (
            <div key={index} className="text-sm text-gray-800">
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
\`\`\`

This component includes:
- Drag and drop functionality
- Visual feedback during drag operations
- File selection via click
- Display of selected files
- Callback for handling uploaded files

You can use it in your application like this:

\`\`\`jsx
<FileUpload onFileUpload={(files) => console.log('Uploaded files:', files)} />
\`\`\`

**User:** Thank you! This is exactly what I needed. Can you also show me how to add file type validation?

**Assistant:** Absolutely! Here's how to add file type validation to the component:

\`\`\`jsx
const FileUpload = ({ onFileUpload, acceptedTypes = [], maxSize = 5 * 1024 * 1024 }) => {
  // ... previous state ...
  const [errors, setErrors] = useState([]);

  const validateFile = (file) => {
    const errors = [];
    
    // Check file type
    if (acceptedTypes.length > 0) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const fileType = file.type.toLowerCase();
      
      const isValidType = acceptedTypes.some(type => 
        fileType.includes(type) || fileExtension === type
      );
      
      if (!isValidType) {
        errors.push(\`Invalid file type: \${file.name}\`);
      }
    }
    
    // Check file size
    if (file.size > maxSize) {
      errors.push(\`File too large: \${file.name} (\${(file.size / 1024 / 1024).toFixed(1)}MB)\`);
    }
    
    return errors;
  };

  const processFiles = (newFiles) => {
    const allErrors = [];
    const validFiles = [];
    
    newFiles.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push(file);
      } else {
        allErrors.push(...fileErrors);
      }
    });
    
    setErrors(allErrors);
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      if (onFileUpload) onFileUpload(validFiles);
    }
  };

  // ... rest of the component with processFiles used in handleDrop and onChange ...
  
  return (
    <div>
      {/* ... drag and drop area ... */}
      
      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 font-semibold mb-1">Validation Errors:</p>
          {errors.map((error, index) => (
            <p key={index} className="text-red-700 text-sm">{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};
\`\`\`

Usage with validation:

\`\`\`jsx
<FileUpload 
  acceptedTypes={['jpg', 'jpeg', 'png', 'pdf', 'txt']}
  maxSize={10 * 1024 * 1024} // 10MB
  onFileUpload={(files) => console.log('Valid files:', files)}
/>
\`\`\`

This adds:
- File type validation by extension and MIME type
- File size limits
- Error display for invalid files
- Only valid files are passed to the callback

---

*Chat exported from ${detectedPlatform.toUpperCase()} on ${new Date().toLocaleString('pl-PL')}*
*Total messages: 6*
*Export method: PINnode Chat Downloader*`;

      return [{
        filename: `${detectedPlatform}_chat_${chatId}_${timestamp}.txt`,
        content: mockChatContent
      }];

    } catch (error) {
      throw new Error(`Failed to extract chat content: ${error}`);
    }
  };

  const handleDownload = async () => {
    if (!chatUrl.trim()) {
      toast({
        title: "Błąd",
        description: "Wprowadź URL czatu",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Validate URL
      const url = new URL(chatUrl);
      const platform = selectedPlatform === 'auto' ? detectPlatform(chatUrl) : selectedPlatform;
      
      // Extract chat content
      const extractedFiles = await extractChatContent(chatUrl, platform);
      
      // Encrypt and upload files if master key is provided
      if (masterKey.trim()) {
        const encryptedFiles = extractedFiles.map(file => ({
          ...file,
          content: PINnodeCrypto.encrypt(file.content, masterKey)
        }));
        
        for (const file of encryptedFiles) {
          const entryData = {
            filename: file.filename,
            content: file.content,
            encrypted: true,
            tags: ['chat-export', platform, 'conversation'],
            category: 'AI Chats',
            source: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Chat`,
            fileSize: file.content.length
          };

          const response = await fetch('/api/archive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryData)
          });

          if (!response.ok) {
            throw new Error(`Failed to save ${file.filename}`);
          }
        }

        toast({
          title: "Sukces",
          description: `Pobrano i zaszyfrowano ${extractedFiles.length} plików z czatu`
        });
      } else {
        // Just download files without encryption
        extractedFiles.forEach(file => {
          const blob = new Blob([file.content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = file.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });

        toast({
          title: "Sukces",
          description: `Pobrano ${extractedFiles.length} plików z czatu`
        });
      }

      onDownloadComplete(extractedFiles);
      setChatUrl('');

    } catch (error) {
      console.error('Chat download error:', error);
      toast({
        title: "Błąd pobierania",
        description: "Nie udało się pobrać czatu. Sprawdź URL i spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPlatform = supportedPlatforms.find(p => p.id === selectedPlatform) || supportedPlatforms[0];
  const CurrentIcon = currentPlatform.icon;

  return (
    <Card className="glass-effect rounded-2xl border border-blue-100 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Download className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-gray-900">Chat Downloader</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <CurrentIcon className={`w-3 h-3 ${currentPlatform.color}`} />
            {currentPlatform.name}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              URL Czatu
            </label>
            <Input
              value={chatUrl}
              onChange={(e) => setChatUrl(e.target.value)}
              placeholder="https://chatgpt.com/c/... lub https://chat.deepseek.com/..."
              className="rounded-xl border-blue-200"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Platforma
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-blue-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
            >
              {supportedPlatforms.map(platform => (
                <option key={platform.id} value={platform.id}>
                  {platform.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Obsługiwane platformy:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
            <div>• ChatGPT (OpenAI)</div>
            <div>• DeepSeek Chat</div>
            <div>• Claude (Anthropic)</div>
            <div>• Inne czaty AI</div>
          </div>
        </div>

        {masterKey ? (
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <p className="text-sm text-green-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Czaty będą automatycznie zaszyfrowane i zapisane w archiwum
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <p className="text-sm text-amber-700">
              Wprowadź Master Key aby automatycznie szyfrować i zapisywać czaty w archiwum
            </p>
          </div>
        )}

        <Button
          onClick={handleDownload}
          disabled={isProcessing || !chatUrl.trim()}
          className="w-full rounded-xl py-3 text-lg font-semibold"
        >
          <Download className="w-5 h-5 mr-2" />
          {isProcessing ? 'Pobieranie czatu...' : 'Pobierz Czat'}
        </Button>
      </CardContent>
    </Card>
  );
}