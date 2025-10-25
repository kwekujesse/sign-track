'use client';

import React, { useMemo, type ReactNode, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { useAuth } from '@/firebase';
import { initializeFirebase } from '@/firebase';
import { initiateAnonymousSignIn } from './non-blocking-login';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// A wrapper component to initiate anonymous sign-in
function AnonymousAuthWrapper({ children }: { children: ReactNode }) {
  const auth = useAuth();
  useEffect(() => {
    // We only want to auto-sign-in if there is no user yet.
    if (auth && !auth.currentUser) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth]);
  return <>{children}</>;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <AnonymousAuthWrapper>
        {children}
      </AnonymousAuthWrapper>
    </FirebaseProvider>
  );
}
