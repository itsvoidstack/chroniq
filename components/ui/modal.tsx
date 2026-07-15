import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      
      <div className={cn(
        "relative z-50 w-full max-w-lg overflow-hidden bg-card border border-border shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200",
        className
      )}>
        {(title || description) && (
          <div className="flex flex-col gap-1 p-6 border-b border-border/50">
            <div className="flex items-center justify-between">
              {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
        
        {!title && !description && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 bg-muted/30 border-t border-border/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
