import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
//import { AngularFireAuth } from '@angular/fire/compat/auth';
import { doc, setDoc } from 'firebase/firestore';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    // private afAuth: AngularFireAuth,
    private auth: Auth,
    private firestore: Firestore
  ) {}

  // todo: maybe route register to auth service
  /**
   * Registers a new user with email and password.
   * @param email User's email
   * @param password User's password
   * @param userData Additional user information to save in Firestore
   */
  register(email: string, password: string, userData: any): Observable<void> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password).then(
        (userCredential: UserCredential) => {
          const userId = userCredential.user.uid;
          const userRef = doc(this.firestore, 'users', userId);
          return setDoc(userRef, userData);
        }
      )
    );
  }

  /**
   * Signs in an existing user with email and password.
   * @param email User's email
   * @param password User's password
   */
  signIn(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  /**
   * Logs out the currently signed-in user.
   */
  signOut(): Observable<void> {
    return from(this.auth.signOut());
  }

  // Add other authentication methods as needed
}
