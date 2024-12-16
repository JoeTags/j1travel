// models/agent.model.ts
export interface Agent {
    id: string;
    name: string;
    city: string;
    country: string;
    description: string;
    email: string;
    membership: string;
    visaCopy: string;
    photo: string;
    location: {
      latitude: number;
      longitude: number;
    };
  }
