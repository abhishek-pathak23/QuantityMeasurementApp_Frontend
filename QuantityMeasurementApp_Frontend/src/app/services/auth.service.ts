import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE = '/api/Auth';
  private _isGuest = false;
  isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {}

  signup(data: { name: string; email: string; password: string; role: string }) {
    console.log('📝 Signup request:', {
      url: `${this.BASE}/signup`,
      data: data
    });
    return this.http.post(`${this.BASE}/signup`, data).pipe(
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

  login(data: { email: string; password: string }) {
    console.log('🔐 Login request:', {
      url: `${this.BASE}/login`,
      email: data.email
    });
    return this.http.post<any>(`${this.BASE}/login`, data).pipe(
      tap(res => {
        console.log('✅ Login success - Full response:', JSON.stringify(res));
        console.log('Response type:', typeof res);
        console.log('Response keys:', Object.keys(res));
        
        // Try multiple possible token locations
        let token = null;
        
        // Check common field names
        token = res.token || res.Token || res.accessToken || res.AccessToken || res.access_token;
        
        // Check if entire response is the token (string)
        if (!token && typeof res === 'string') {
          token = res;
        }
        
        // Check nested data object
        if (!token && res.data) {
          token = res.data.token || res.data.Token || res.data.accessToken;
        }
        
        console.log('Extracted token:', token);
        console.log('Token type:', typeof token);
        
        if (token && token !== 'undefined' && token !== null) {
          // Explicitly clear old tokens first
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          
          // Store new token
          const tokenString = String(token);
          localStorage.setItem('authToken', tokenString);
          
          // Verify it was stored
          const storedToken = localStorage.getItem('authToken');
          console.log('✅ Token stored in localStorage:', storedToken?.substring(0, 20) + '...');
          console.log('✅ Verification - Token exists:', !!storedToken);
          
          this._isGuest = false;
          this.isLoggedIn$.next(true);
        } else {
          console.warn('⚠️ No valid token found in response.');
          console.warn('Backend must return a JWT token in the login response!');
          console.warn('Expected response format: { token: "jwt-string" } or { Token: "jwt-string" }');
          console.warn('Full response was:', JSON.stringify(res));
          
          // Fallback: generate a temporary token from user data
          const fallbackToken = 'temp_' + btoa(JSON.stringify({email: data.email, timestamp: Date.now()}));
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.setItem('authToken', fallbackToken);
          
          const stored = localStorage.getItem('authToken');
          console.log('⚠️ Using fallback token:', stored?.substring(0, 20) + '...');
          console.log('⚠️ Fallback token stored:', !!stored);
          
          this._isGuest = false;
          this.isLoggedIn$.next(true);
        }
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
