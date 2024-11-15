import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  constructor(private firestore: AngularFirestore) {}

  addAgent(agentData: any) {
    return this.firestore.collection('agents').add(agentData);
  }

  getAgents() {
    return this.firestore.collection('agents').snapshotChanges();
  }
}
