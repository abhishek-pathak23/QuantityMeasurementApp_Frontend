import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.errorMsg = '';
    if (!this.email || !this.password) {
      this.errorMsg = 'Please fill in all fields.';
      return;
    }
    this.loading = true;
    console.log('📤 Sending login request...');
    
    // Clear any old tokens before login
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    console.log('Cleared old tokens from localStorage');
    
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        console.log('✅ Login successful!');
        
        // Wait a moment and verify token is in localStorage
        setTimeout(() => {
          const token = localStorage.getItem('authToken');
          console.log('🔍 Checking token after login...');
          console.log('Token value:', token);
          console.log('Token exists:', !!token);
          console.log('Token length:', token?.length);
          
          if (token) {
            console.log('✅ Token verified in localStorage:', token.substring(0, 30) + '...');
            this.loading = false;
            this.router.navigate(['/dashboard']);
          } else {
            console.error('❌ Token was not stored after login!');
            this.errorMsg = 'Login failed: Token not generated. Check browser console.';
            this.loading = false;
          }
        }, 100);
      },
      error: (err) => {
        console.error('❌ Login error:', err);
        this.errorMsg = err?.error?.message || 'Invalid email or password.';
        this.loading = false;
      }
    });
  }

  goToSignup(event: Event) {
    event.preventDefault();
    this.router.navigate(['/signup']);
  }

  continueAsGuest(event: Event) {
    event.preventDefault();
    this.auth.setGuestMode();
    this.router.navigate(['/dashboard']);
  }
}
