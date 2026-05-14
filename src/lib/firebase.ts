import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// @ts-ignore
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();
// Authentication Providers
export const googleProvider = new GoogleAuthProvider();

// Anonymous authentication to support security rules for non-Google users
auth.onAuthStateChanged((user) => {
  if (user) console.log('Firebase Auth Session Ready:', user.uid);
});

signInAnonymously(auth).catch((err) => {
  if (err.code === 'auth/admin-restricted-operation') {
    console.warn('Firebase: Anonymous Auth is disabled. GO TO FIREBASE CONSOLE -> AUTHENTICATION -> SIGN-IN METHOD -> ENABLE ANONYMOUS.');
  } else {
    console.error('Anonymous Auth Error:', err);
  }
});

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Auth Error:', error);
    throw error;
  }
};
