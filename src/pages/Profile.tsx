
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Profile() {
  const { profile, user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
            <p className="text-lg">{profile?.name || 'Not set'}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
            <p className="text-lg">{user?.email}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">User ID</h3>
            <p className="text-xs font-mono bg-muted p-2 rounded">{user?.id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
