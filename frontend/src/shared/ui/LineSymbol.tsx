import React from 'react';
import { LineStyle } from '../types/story';

interface LineSymbolProps {
  style: LineStyle;
  length?: number;
  color?: string;
  className?: string;
  label?: string;
}

export const LineSymbol: React.FC<LineSymbolProps> = ({
  style,
  length = 60,
  color = 'var(--color-ink)',
  className = '',
  label,
}) => {
  let strokeDasharray = 'none';
  if (style === 'dashed') strokeDasharray = '6 4';
  if (style === 'dotted') strokeDasharray = '2 4';
  if (style === 'break') strokeDasharray = '14 6 2 6';

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg width={length} height="12" viewBox={`0 0 ${length} 12`} className="overflow-visible">
        {style === 'branch' ? (
          <g stroke={color} strokeWidth="2" fill="none">
            <path d={`M 0 6 L ${length / 2} 6 L ${length} 2`} />
            <path d={`M ${length / 2} 6 L ${length} 10`} strokeDasharray="3 3" />
          </g>
        ) : style === 'loop' ? (
          <g stroke={color} strokeWidth="2" fill="none">
            <path d={`M 0 6 C ${length / 3} -2, ${(length * 2) / 3} 14, ${length} 6`} />
            <circle cx={length / 2} cy={6} r="2" fill={color} />
          </g>
        ) : (
          <line
            x1="0"
            y1="6"
            x2={length}
            y2="6"
            stroke={color}
            strokeWidth="2"
            strokeDasharray={strokeDasharray}
          />
        )}
      </svg>
      {label && <span className="type-caption font-mono text-xs">{label}</span>}
    </div>
  );
};
