import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({ message = "Loading...", fullScreen = false }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : 'min-h-[300px]'} p-8 text-center`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      {message && <p className="text-muted-foreground">{message}</p>}
    </div>
  );
}
