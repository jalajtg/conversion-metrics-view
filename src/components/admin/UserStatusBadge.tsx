
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface UserStatusBadgeProps {
  status: 'active' | 'inactive';
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  return (
    <Badge className={status === 'active' 
      ? 'bg-green-500/10 text-green-400 border-green-500/20'
      : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }>
      {status.toUpperCase()}
    </Badge>
  );
}
