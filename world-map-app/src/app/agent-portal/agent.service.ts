import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  Firestore,
} from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  constructor(private firestore: Firestore) {}

  private formDataSubject = new BehaviorSubject<any>(null);
  formData$ = this.formDataSubject.asObservable();

  setFormData(data: any): void {
    this.formDataSubject.next(data);
  }

  getFormData(): any {
    return this.formDataSubject.value;
  }

  /**
   * Adds a new agent to the Firestore collection
   * @param agentData - The agent data to be added
   * @returns A Promise that resolves when the data is added
   */
  addAgent(agentData: any): Observable<any> {
    const agentCollection = collection(this.firestore, 'agents');
    console.log('submitting');
    return from(addDoc(agentCollection, agentData));
  }

  /**
   * Retrieves all agents from the Firestore collection
   * @returns An Observable of agent data
   */
  getAgents(): Observable<any[]> {
    const agentCollection = collection(this.firestore, 'agents');
    console.log('agentCollection:', agentCollection);
    return collectionData(agentCollection, { idField: 'id' }); // `idField` includes the Firestore document ID
  }
}
