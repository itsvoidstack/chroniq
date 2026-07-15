import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant }) => {
  return <span>{children}</span>;
};
