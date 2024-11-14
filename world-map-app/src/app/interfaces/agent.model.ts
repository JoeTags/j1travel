// models/agent.model.ts
export interface Agent {
    id: string;
    name: string;
    city: string;
    country: string;
    description: string;
    email: string;
    membership: string;
    visaUrl: string;
    photoUrl: string;
    location: {
      latitude: number;
      longitude: number;
    };
  }
  