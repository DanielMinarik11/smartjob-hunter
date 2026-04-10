import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { Auth, createUserWithEmailAndPassword, getAuth, sendEmailVerification, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, UserCredential } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyC6AUl-M9h63CR0M_IczSpN_Hc5RRVx9MY',
  authDomain: 'smart-jobhunter.firebaseapp.com',
  projectId: 'smart-jobhunter',
  storageBucket: 'smart-jobhunter.firebasestorage.app',
  messagingSenderId: '295303207096',
  appId: '1:295303207096:web:d31e2c662fb78df897bc4d',
};

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  private app: FirebaseApp;
  private auth: Auth;

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
  }

  register(email: string, password: string): Promise<UserCredential> {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
      return Promise.reject(
        new Error(
          'Firebase configuration is not set. Replace placeholders in src/app/firebase-auth.service.ts with your Firebase project values.'
        )
      );
    }

    return createUserWithEmailAndPassword(this.auth, email, password).then(async (userCredential) => {
      await sendEmailVerification(userCredential.user);
      return userCredential;
    });
  }

  login(email: string, password: string): Promise<UserCredential> {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
      return Promise.reject(
        new Error(
          'Firebase configuration is not set. Replace placeholders in src/app/firebase-auth.service.ts with your Firebase project values.'
        )
      );
    }

    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  onAuthStateChanged(callback: (user: User | null) => void): void {
    onAuthStateChanged(this.auth, callback);
  }
}
