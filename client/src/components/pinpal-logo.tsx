import React from 'react';

interface PinpalLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PinpalLogo({ size = 'md', className = '' }: PinpalLogoProps) {
  const dimensions = {
    sm: { width: 32, height: 32, fontSize: '12px' },
    md: { width: 48, height: 48, fontSize: '14px' },
    lg: { width: 64, height: 64, fontSize: '16px' }
  };

  const dim = dimensions[size];

  return (
    <div className={`inline-block ${className}`}>
      <svg 
        width={dim.width} 
        height={dim.height} 
        viewBox="0 0 64 64" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="pinpalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#1d4ed8', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#1e40af', stopOpacity: 1 }} />
          </linearGradient>
          
          <linearGradient id="pinpalAccent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#93c5fd', stopOpacity: 1 }} />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main circle with gradient */}
        <circle 
          cx="32" 
          cy="32" 
          r="30" 
          fill="url(#pinpalGradient)" 
          stroke="url(#pinpalAccent)" 
          strokeWidth="2"
          filter="url(#glow)"
        />
        
        {/* PIN icon - representing connection/networking */}
        <g transform="translate(16, 16)">
          {/* Pin head */}
          <circle cx="16" cy="12" r="8" fill="white" opacity="0.9" />
          <circle cx="16" cy="12" r="4" fill="url(#pinpalAccent)" />
          
          {/* Pin body */}
          <rect x="15" y="20" width="2" height="8" fill="white" opacity="0.8" rx="1" />
          
          {/* Connection lines */}
          <path 
            d="M8 12 L24 12 M12 8 L20 16 M12 16 L20 8" 
            stroke="white" 
            strokeWidth="1.5" 
            opacity="0.6"
            strokeLinecap="round"
          />
        </g>
        
        {/* Subtle highlight */}
        <circle 
          cx="24" 
          cy="20" 
          r="4" 
          fill="white" 
          opacity="0.2" 
        />
      </svg>
    </div>
  );
}