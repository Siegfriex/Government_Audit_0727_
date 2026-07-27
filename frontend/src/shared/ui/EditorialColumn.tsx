import React from 'react';

interface EditorialColumnProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const EditorialColumn: React.FC<EditorialColumnProps> = ({ children, className = '', id }) => {
  return (
    <div id={id} className={`editorial-column ${className}`}>
      {children}
    </div>
  );
};
