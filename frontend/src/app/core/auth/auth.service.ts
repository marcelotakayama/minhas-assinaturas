import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { environment } from 'src/environments/environment';
import { environment } from '../../../../src/environments/environment';
import { TokenStorage } from './token-storage';
import { Observable, tap } from 'rxjs';

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { email: string; password: string; name?: string };

// ajuste conforme seu backend devolver
export type AuthResponse = { token: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorage
  ) {}

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap(res => this.tokenStorage.setToken(res.token))
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload).pipe(
      tap(res => this.tokenStorage.setToken(res.token))
    );
  }

  logout(): void {
    this.tokenStorage.clear();
  }

  isAuthenticated(): boolean {
    return !!this.tokenStorage.getToken();
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }
}
