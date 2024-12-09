import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  constructor(private firestore: Firestore) {}

  /**
   * Adds a new agent to the Firestore collection
   * @param agentData - The agent data to be added
   * @returns A Promise that resolves when the data is added
   */
  addAgent(agentData: any): Promise<any> {
    const agentCollection = collection(this.firestore, 'agents');
    console.log('submitting');
    return addDoc(agentCollection, agentData);
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
