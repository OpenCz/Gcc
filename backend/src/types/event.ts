export interface EventCreateData {
  name: string;
  description?: string;
  lieu: string;
  date: Date;
  capacity: number;
}

export interface EventWithRegistration {
  id: number;
  name: string;
  description: string | null;
  lieu: string;
  date: Date;
  capacity: number;
  registeredCount: number;
  isRegistered: boolean;
}
