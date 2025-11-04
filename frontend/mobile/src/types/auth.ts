// src/types/auth.ts
export interface User {
  id: number;
  email: string;
  es_admin: boolean;
  api_key: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}