import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) { }

  login(credentials: { username: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      return Date.now() < decoded.exp * 1000;
    } catch {
      return false;
    }
  }

  logout() {
    localStorage.removeItem('token');
  }
}