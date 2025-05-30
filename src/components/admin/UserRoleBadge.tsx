
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface UserRoleBadgeProps {
  role: 'user' | 'admin' | 'super_admin';
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const variants = {
    'super_admin': 'bg-red-500/10 text-red-400 border-red-500/20',
    'admin': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'user': 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  };
  
  return (
    <Badge className={variants[role] || variants.user}>
      {role.replace('_', ' ').toUpperCase()}
    </Badge>
  );
}
