
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// This is a "soft" gate. It does not provide real security,
// but prevents casual access. The password is hardcoded here.
const ASSOCIATE_PASSWORD = "Staples1147";

export function AccessGate({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Check session storage to see if the user has already entered the password
    const unlocked = sessionStorage.getItem('associate-unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  const handleLogin = () => {
    setError('');
    if (password === ASSOCIATE_PASSWORD) {
      sessionStorage.setItem('associate-unlocked', 'true');
      setIsUnlocked(true);
      toast({
        title: "Access Granted",
        description: "Welcome to the Associate Dashboard.",
        className: "bg-accent text-accent-foreground",
      });
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
      toast({
        title: "Access Denied",
        description: "The password you entered is incorrect.",
        variant: "destructive",
      });
    }
  };
  
  if (isUnlocked) {
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
              Unlock
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
