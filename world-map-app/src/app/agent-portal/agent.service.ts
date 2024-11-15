import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  Firestore,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  constructor(private firestore: Firestore) {}

  addAgent(agentData: any) {
    const agentsRef = collection(this.firestore, 'agents');
    return addDoc(agentsRef, agentData);
  }
  // addAgent(agent: Agent): Observable<any[]> {
  //   const agentsCollection = collection(this.firestore, 'agents');
  //   // agentsCollection.addDoc(agent.id);
  //   // return from(agentRef.set(agent));
  //   return agentsCollection;
  // }

  getAgents(): Observable<any[]> {
    const agentsCollection = collection(this.firestore, 'agents');
    return collectionData(agentsCollection, { idField: 'id' });
  }
}
