import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'online' | 'away' | 'busy' | 'offline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIndicator({ status, size = 'md', className }: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusClasses = {
    online: 'status-online',
    away: 'status-away',
    busy: 'status-busy',
    offline: 'status-offline',
  };

  return (
    <span
      className={cn(
        'status-indicator',
        sizeClasses[size],
        statusClasses[status],
        className
      )}
      title={status.charAt(0).toUpperCase() + status.slice(1)}
    />
  );
}
