import React from 'react';

interface ContentGridProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const ContentGrid: React.FC<ContentGridProps> = ({ children, className = '', id }) => {
  return (
    <div id={id} className={`content-grid ${className}`}>
      {children}
    </div>
  );
};
