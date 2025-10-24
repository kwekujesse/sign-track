
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Users, Mail } from 'lucide-react';
import { useUser, useFirebase } from '@/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export function AccessGate({ children }: { children: React.ReactNode }) {
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [email, setEmail] = useState('print.marketing1147@gmail.com');
  const [password, setPassword] = useState('Staples1147');
  const [error, setError] = useState('');
  const { toast } = useToast();


  const handleLogin = async () => {
    if (!auth) {
      setError("Auth service is not available.");
      return;
    }
    setError('');
    try {
      // If there's a user and they are anonymous, sign them out first.
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        await signOut(auth);
      }
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      console.error(e);
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
         setError('Authentication failed. Please check your credentials and try again.');
         toast({
            title: "Login Failed",
            description: "Invalid email or password provided.",
            variant: "destructive",
         })
      } else {
        setError('An unexpected error occurred during login. Please try again.');
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
          <CardDescription>Enter your credentials to access the associate-only area.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
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
