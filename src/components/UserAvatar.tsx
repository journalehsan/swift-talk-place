import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusIndicator } from './StatusIndicator';
import { User } from '@/types';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: User;
  showStatus?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function UserAvatar({ user, showStatus = true, size = 'md', className }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const statusPositions = {
    sm: '-bottom-0.5 -right-0.5',
    md: '-bottom-0.5 -right-0.5',
    lg: '-bottom-1 -right-1',
    xl: '-bottom-1 -right-1',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={cn(sizeClasses[size], 'border-2 border-background')}>
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="bg-primary text-primary-foreground font-medium">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <StatusIndicator
          status={user.status}
          size={size === 'sm' ? 'sm' : 'md'}
          className={cn('absolute', statusPositions[size])}
        />
      )}
    </div>
  );
}
