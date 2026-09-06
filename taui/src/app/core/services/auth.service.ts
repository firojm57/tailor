import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, AuthResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = typeof window !== 'undefined' && window.location.port === '4200'
    ? 'http://localhost:8080/api/auth'
    : '/api/auth';

  private readonly tokenSignal = signal<string | null>(localStorage.getItem('tailor_auth_token'));
  private readonly currentUserSignal = signal<User | null>(this.loadUserFromStorage());

  readonly token = this.tokenSignal.asReadonly();
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  private loadUserFromStorage(): User | null {
    const data = localStorage.getItem('tailor_user');
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  signup(payload: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, payload).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  login(payload: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({ error: () => {} });
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    localStorage.removeItem('tailor_auth_token');
    localStorage.removeItem('tailor_user');
  }

  private handleAuthSuccess(res: AuthResponse): void {
    if (res && res.token) {
      this.tokenSignal.set(res.token);
      const user: User = { id: res.id, fullName: res.fullName, email: res.email, role: res.role };
      this.currentUserSignal.set(user);
      localStorage.setItem('tailor_auth_token', res.token);
      localStorage.setItem('tailor_user', JSON.stringify(user));
    }
  }
}
