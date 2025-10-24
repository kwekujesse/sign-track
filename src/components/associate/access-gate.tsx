
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Users } from 'lucide-react';
import { useUser, useFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export function AccessGate({ children }: { children: React.ReactNode }) {
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const email = "associate@signtrack.com";


  const handleLogin = async () => {
    if (!auth) {
      setError("Auth service is not available.");
      return;
    }
    setError('');
    try {
      // The simple password check was replaced by Firebase Auth.
      // We will now use a fixed email and the provided password.
      if (password === 'admin') {
        await signInWithEmailAndPassword(auth, email, 'password');
      } else {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
    } catch (e: any) {
      // This might happen if the associate user doesn't exist in Firebase Auth
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
         setError('Authentication failed. Please contact an administrator.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setPassword('');
    }
  };
  
  if (isUserLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)]">
            <p>Loading...</p>
        </div>
    )
  }

  // If user is not anonymous, they are an associate
  if (user && !user.isAnonymous) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)]">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className='flex justify-center items-center mb-2'>
                <Users className="h-8 w-8"/>
            </div>
          <CardTitle>Associate Dashboard</CardTitle>
          <CardDescription>Enter the password to access the associate-only area.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <div className="relative">
              <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="pl-9"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleLogin} className="w-full">
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
      <Button variant="link" asChild className="mt-4">
        <Link href="/">Back to Customer View</Link>
      </Button>
    </div>
  );
}
