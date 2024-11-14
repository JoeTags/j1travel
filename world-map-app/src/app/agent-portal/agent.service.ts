import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Agent } from '../interfaces/agent.model';


@Injectable({
  providedIn: 'root',
})
export class AgentService {
  constructor(private firestore: AngularFirestore) {}

  addAgent(agent: Agent) {
    return this.firestore.collection('agents').add(agent);
  }

  getAgents() {
    return this.firestore.collection<Agent>('agents').valueChanges();
  }
}
