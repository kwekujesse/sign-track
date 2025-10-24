
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export function initializeFirebase() {
  if (getApps().length === 0) {
    const app = initializeApp(firebaseConfig);
    return getSdks(app);
  } else {
    return getSdks(getApp());
  }
}
