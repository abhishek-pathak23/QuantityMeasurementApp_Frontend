import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE = environment.apiUrl + '/Auth';
  private _isGuest = false;
  isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {}

  signup(data: { name: string; email: string; password: string; role: string }) {
    const payload = { ...data, role: this.normalizeRole(data.role) };
    console.log('📝 Signup request:', {
      url: `${this.BASE}/signup`,
      data: payload
    });
    return this.http.post(`${this.BASE}/signup`, payload).pipe(
      tap(
        res => {
          console.log('✅ Signup success:', res);
        },
        err => {
          console.error('❌ Signup error:', {
            status: err?.status,
            statusText: err?.statusText,
            url: err?.url,
            error: err?.error
          });
        }
      )
    );
  }

  private normalizeRole(role: string): string {
    const normalized = role?.trim().toLowerCase();
    if (normalized === 'admin') return 'admin';
    return 'user';
  }

  login(data: { email: string; password: string }) {
    console.log('🔐 Login request:', {
      url: `${this.BASE}/login`,
      email: data.email
    });
    return this.http.post<any>(`${this.BASE}/login`, data).pipe(
      tap(res => {
        console.log('✅ Login success - Full response:', JSON.stringify(res));
      }),
      map(res => {
        // Try multiple possible token locations
        let token = res?.token || res?.Token || res?.accessToken || res?.AccessToken || res?.access_token;

        // Check if entire response is the token (string)
        if (!token && typeof res === 'string') {
          token = res;
        }

        // Check nested data object
        if (!token && res?.data) {
          token = res.data.token || res.data.Token || res.data.accessToken || res.data.access_token;
        }

        console.log('Extracted token:', token);
        console.log('Token type:', typeof token);

        if (!token || token === 'undefined' || token === null || token === '') {
          console.error('❌ Login response did not include a valid token.');
          throw new Error('Login failed: missing auth token from server.');
        }

        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        const tokenString = String(token);
        localStorage.setItem('authToken', tokenString);
        localStorage.setItem('token', tokenString);
        console.log('✅ Token stored in localStorage:', tokenString.substring(0, 20) + '...');

        this._isGuest = false;
        this.isLoggedIn$.next(true);
        return res;
      })
    );
  }

  continueAsGuest() {
    this._isGuest = true;
    // Set a guest token for API requests
    localStorage.setItem('authToken', 'guest-token');
    this.isLoggedIn$.next(true);
    this.router.navigate(['/dashboard']);
  }

  setGuestMode() {
    this._isGuest = true;
    // Set a guest token for API requests
    localStorage.setItem('authToken', 'guest-token');
    this.isLoggedIn$.next(true);
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    this._isGuest = false;
    this.isLoggedIn$.next(false);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  }

  isGuest(): boolean {
    return this._isGuest;
  }

  isAuthenticated(): boolean {
    return this.hasToken() || this._isGuest;
  }

  private hasToken(): boolean {
    return !!(localStorage.getItem('authToken') || localStorage.getItem('token'));
  }
}
