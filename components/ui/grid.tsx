import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { default: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 'md',
  className,
  ...props
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  return (
    <div
      className={cn(
        "grid",
        gapClasses[gap],
        // Default
        columns.default === 1 && "grid-cols-1",
        columns.default === 2 && "grid-cols-2",
        columns.default === 3 && "grid-cols-3",
        columns.default === 4 && "grid-cols-4",
        columns.default === 5 && "grid-cols-5",
        columns.default === 6 && "grid-cols-6",
        
        // SM
        columns.sm === 1 && "sm:grid-cols-1",
        columns.sm === 2 && "sm:grid-cols-2",
        columns.sm === 3 && "sm:grid-cols-3",
        columns.sm === 4 && "sm:grid-cols-4",
        columns.sm === 5 && "sm:grid-cols-5",
        columns.sm === 6 && "sm:grid-cols-6",
        
        // MD
        columns.md === 1 && "md:grid-cols-1",
        columns.md === 2 && "md:grid-cols-2",
        columns.md === 3 && "md:grid-cols-3",
        columns.md === 4 && "md:grid-cols-4",
        columns.md === 5 && "md:grid-cols-5",
        columns.md === 6 && "md:grid-cols-6",
        
        // LG
        columns.lg === 1 && "lg:grid-cols-1",
        columns.lg === 2 && "lg:grid-cols-2",
        columns.lg === 3 && "lg:grid-cols-3",
        columns.lg === 4 && "lg:grid-cols-4",
        columns.lg === 5 && "lg:grid-cols-5",
        columns.lg === 6 && "lg:grid-cols-6",
        
        // XL
        columns.xl === 1 && "xl:grid-cols-1",
        columns.xl === 2 && "xl:grid-cols-2",
        columns.xl === 3 && "xl:grid-cols-3",
        columns.xl === 4 && "xl:grid-cols-4",
        columns.xl === 5 && "xl:grid-cols-5",
        columns.xl === 6 && "xl:grid-cols-6",

        // 2XL
        columns['2xl'] === 1 && "2xl:grid-cols-1",
        columns['2xl'] === 2 && "2xl:grid-cols-2",
        columns['2xl'] === 3 && "2xl:grid-cols-3",
        columns['2xl'] === 4 && "2xl:grid-cols-4",
        columns['2xl'] === 5 && "2xl:grid-cols-5",
        columns['2xl'] === 6 && "2xl:grid-cols-6",
        
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
