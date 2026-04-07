import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { tap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  const isGuest = auth.isGuest();
  
  console.log('🔍 Interceptor called for:', req.url);
  console.log('🔑 Token present:', !!token);
  console.log('👤 Is guest:', isGuest);
  console.log('📋 Token value:', token ? token.substring(0, 30) + '...' : 'null');
  console.log('🔍 localStorage.authToken:', localStorage.getItem('authToken'));
  console.log('🔍 localStorage.token:', localStorage.getItem('token'));
  
  // For guest users, don't send auth token - send X-Guest-User header instead
  if (isGuest) {
    console.log('👤 Guest user detected - adding X-Guest-User header');
    req = req.clone({ setHeaders: { 'X-Guest-User': 'true' } });
  } else if (token && token.trim() !== '' && !token.startsWith('guest-token')) {
    const tokenPreview = token.substring(0, 30) + '...';
    console.log('🔐 Token preview:', tokenPreview);
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    console.log('✅ Added Authorization header with Bearer token');
  } else if (token === 'guest-token') {
    console.log('👤 Guest token detected - adding X-Guest-User header instead');
    req = req.clone({ setHeaders: { 'X-Guest-User': 'true' } });
  } else {
    console.warn('⚠️ No valid token found - request will fail with 403 on protected endpoints');
    console.warn('⚠️ Token is:', token);
    console.warn('⚠️ Token is empty:', !token || token.trim() === '');
  }
  
  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === 4) { // HttpResponse
          console.log('✅ Request successful:', req.url);
        }
      },
      error: (error) => {
        console.error('❌ Request failed:', req.url, 'Status:', error.status, 'Error:', error);
      }
    })
  );
};
