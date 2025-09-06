import React from 'react';

interface MedicalLogoProps {
  size?: number;
  className?: string;
}

const MedicalLogo: React.FC<MedicalLogoProps> = ({ size = 120, className = '' }) => {
  return (
    <div className={`medical-logo ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle with Gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary-cyan)" />
            <stop offset="100%" stopColor="var(--primary-purple)" />
          </linearGradient>
          <linearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f0f9ff" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main Circle Background */}
        <circle
          cx="60"
          cy="60"
          r="58"
          fill="url(#logoGradient)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          filter="url(#glow)"
        />
        
        {/* Inner Circle */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="rgba(255,255,255,0.1)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
        
        {/* Medical Cross */}
        <g transform="translate(60, 60)">
          {/* Vertical bar of cross */}
          <rect
            x="-4"
            y="-20"
            width="8"
            height="40"
            rx="4"
            fill="url(#crossGradient)"
            filter="url(#glow)"
          />
          {/* Horizontal bar of cross */}
          <rect
            x="-20"
            y="-4"
            width="40"
            height="8"
            rx="4"
            fill="url(#crossGradient)"
            filter="url(#glow)"
          />
        </g>
        
        {/* Stethoscope Elements */}
        {/* Stethoscope head (top right) */}
        <circle
          cx="85"
          cy="35"
          r="6"
          fill="none"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2"
        />
        <circle
          cx="85"
          cy="35"
          r="3"
          fill="rgba(255,255,255,0.6)"
        />
        
        {/* Stethoscope tube */}
        <path
          d="M 85 41 Q 88 50 85 60 Q 82 70 75 75"
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Heart symbol (bottom left) */}
        <path
          d="M 35 75 C 35 70, 25 70, 25 75 C 25 70, 15 70, 15 75 C 15 85, 35 95, 35 95 C 35 95, 55 85, 55 75 C 55 70, 45 70, 45 75 C 45 70, 35 70, 35 75 Z"
          fill="rgba(255,255,255,0.6)"
          transform="scale(0.3) translate(50, 180)"
        />
        
        {/* DNA Helix (subtle background pattern) */}
        <g opacity="0.2">
          <path
            d="M 20 20 Q 30 30 20 40 Q 10 50 20 60 Q 30 70 20 80"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
          />
          <path
            d="M 100 20 Q 90 30 100 40 Q 110 50 100 60 Q 90 70 100 80"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
          />
        </g>
        
        {/* Pulse line */}
        <path
          d="M 20 90 L 30 90 L 35 80 L 40 100 L 45 70 L 50 90 L 100 90"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    </div>
  );
};

export default MedicalLogo;