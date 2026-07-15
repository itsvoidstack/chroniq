import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  className
}) => {
  return (
    <Card className={cn("overflow-hidden backdrop-blur-sm bg-card/80", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium tracking-tight text-muted-foreground">
            {title}
          </p>
          {icon && (
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
          
          {(description || trend) && (
            <div className="flex items-center gap-2 mt-1">
              {trend && (
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  trend.positive 
                    ? "bg-green-500/10 text-green-500" 
                    : trend.positive === false 
                      ? "bg-red-500/10 text-red-500" 
                      : "bg-muted text-muted-foreground"
                )}>
                  {trend.positive ? '+' : ''}{trend.value}%
                </span>
              )}
              {description && (
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
