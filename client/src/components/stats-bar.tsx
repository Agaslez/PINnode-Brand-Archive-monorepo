import React from 'react';
import { Archive, Lock, Tags, Database } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatsBarProps {
  totalFiles: number;
  encryptedFiles: number;
  taggedFiles: number;
  totalSize: string;
}

export function StatsBar({ totalFiles, encryptedFiles, taggedFiles, totalSize }: StatsBarProps) {
  const stats = [
    {
      icon: Archive,
      label: 'Łącznie plików',
      value: totalFiles.toString(),
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      icon: Lock,
      label: 'Zaszyfrowane',
      value: encryptedFiles.toString(),
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      icon: Tags,
      label: 'Z tagami',
      value: taggedFiles.toString(),
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      icon: Database,
      label: 'Rozmiar',
      value: totalSize,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="glass-effect p-4 rounded-2xl border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center">
            <div className={`p-3 ${stat.bgColor} rounded-xl shadow-sm`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
