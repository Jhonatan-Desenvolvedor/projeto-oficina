export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface LoginResponse {
  token: string;
  user: User;
}