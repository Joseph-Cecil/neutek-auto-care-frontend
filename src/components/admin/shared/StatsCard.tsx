import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

interface StatsCardProps {
  title:     string;
  value:     string | number;
  subtitle?: string;
  icon?:     ReactNode;
  iconBg?:   string;
  trend?:    { value: number; label: string };
  className?: string;
}

export function StatsCard({
  title, value, subtitle, icon, iconBg = 'bg-primary/10',
  trend, className,
}: StatsCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex items-start justify-between p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              'mt-1 text-xs font-medium',
              trend.value >= 0 ? 'text-green-500' : 'text-red-500',
            )}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            iconBg,
          )}>
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
}