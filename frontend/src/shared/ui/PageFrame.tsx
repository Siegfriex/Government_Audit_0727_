import React from 'react';

interface PageFrameProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const PageFrame: React.FC<PageFrameProps> = ({ children, className = '', id }) => {
  return (
    <div id={id} className={`page-frame ${className}`}>
      {children}
    </div>
  );
};
