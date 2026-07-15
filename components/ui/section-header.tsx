import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
  className,
}) => {
  const renderAction = () => {
    if (!actionText) return null;
    
    const ActionContent = (
      <span className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors group">
        {actionText}
        <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
      </span>
    );

    if (actionHref) {
      return <Link href={actionHref}>{ActionContent}</Link>;
    }

    if (onActionClick) {
      return <button onClick={onActionClick}>{ActionContent}</button>;
    }

    return null;
  };

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6", className)}>
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        )}
      </div>
      {renderAction()}
    </div>
  );
};
