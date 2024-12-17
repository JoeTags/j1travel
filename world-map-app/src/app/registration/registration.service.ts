import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  constructor(private firestore: Firestore) {}

  private formDataSubject = new BehaviorSubject<any>(null);
  formData$ = this.formDataSubject.asObservable();

  setUserData(data: any): void {
    this.formDataSubject.next(data);
  }

  getUserData(): any {
    return this.formDataSubject.value;
  }
  clearUserData(): void {
    this.formDataSubject.next(null);
  }
}
