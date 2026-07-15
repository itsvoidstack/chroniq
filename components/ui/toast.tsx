import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  onClose?: () => void;
  className?: string;
}

const variantStyles: Record<ToastVariant, { bg: string; border: string; icon: React.FC<any>; iconColor: string }> = {
  default: { bg: 'bg-card', border: 'border-border', icon: Info, iconColor: 'text-foreground' },
  success: { bg: 'bg-green-950/30', border: 'border-green-500/20', icon: CheckCircle, iconColor: 'text-green-500' },
  error: { bg: 'bg-red-950/30', border: 'border-red-500/20', icon: AlertCircle, iconColor: 'text-red-500' },
  warning: { bg: 'bg-yellow-950/30', border: 'border-yellow-500/20', icon: AlertTriangle, iconColor: 'text-yellow-500' },
  info: { bg: 'bg-blue-950/30', border: 'border-blue-500/20', icon: Info, iconColor: 'text-blue-500' },
};

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = 'default',
  onClose,
  className,
}) => {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div className={cn(
      "relative flex w-full max-w-sm items-start gap-4 rounded-xl border p-4 shadow-lg backdrop-blur-md transition-all",
      styles.bg,
      styles.border,
      className
    )}>
      <Icon className={cn("mt-0.5 w-5 h-5 shrink-0", styles.iconColor)} />
      
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 rounded-md p-1 text-muted-foreground opacity-70 hover:opacity-100 hover:bg-muted/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
