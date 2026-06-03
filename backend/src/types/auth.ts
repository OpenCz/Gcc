export interface JwtPayload {
  userId: number;
  role: string;
  email: string;
}

export interface AuthUser {
  id: number;
  name: string | null;
  email: string;
  role: string;
}

export interface MicrosoftProfile {
  email: string;
  displayName: string;
}
