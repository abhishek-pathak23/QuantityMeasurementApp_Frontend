import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  loading = false;
  role = 'User';
  successMsg = '';
  errorMsg = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSignup() {
    this.errorMsg = '';
    this.successMsg = '';
    if (!this.name || !this.email || !this.password) {
      this.errorMsg = 'Please fill in all fields.';
      return;
    }
    if (this.password.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters.';
      return;
    }
    this.loading = true;
    this.auth.signup({ name: this.name, email: this.email, password: this.password, role: this.role }).subscribe({
      next: () => {
        this.successMsg = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        console.error('❌ Signup error details:', {
          status: err?.status,
          statusText: err?.statusText,
          url: err?.url,
          message: err?.message,
          error: err?.error
        });

        // If status is 200-299, it's actually a success (parsing error on valid response)
        if (err?.status && err.status >= 200 && err.status < 300) {
          this.successMsg = 'User registered! Redirecting to login...';
          setTimeout(() => this.router.navigate(['/login']), 1500);
          return;
        }

        let msg = 'Signup failed. Try again.';
        
        if (err?.status === 404) {
          msg = '404: Signup endpoint not found. Check backend configuration.';
        } else if (err?.status === 0) {
          msg = 'Cannot connect to server. Is the backend running?';
        } else {
          const apiMessage = err?.error?.message || err?.error?.title || err?.message || '';
          const normalized = apiMessage.toString().toLowerCase();

          if (err?.status === 400) {
            if (normalized.includes('email') && (normalized.includes('exists') || normalized.includes('already') || normalized.includes('duplicate'))) {
              msg = 'Email already exists.';
            } else if (!apiMessage) {
              msg = 'Email already exists.';
            } else {
              msg = apiMessage;
            }
          } else if (err?.error?.errors) {
            const errors = err.error.errors;
            msg = Object.values(errors).flat().join(', ');
          } else if (err?.error?.title) {
            msg = err.error.title;
          } else if (err?.error?.message) {
            msg = err.error.message;
          } else if (err?.message) {
            msg = err.message;
          }
        }
        this.errorMsg = msg;
        this.loading = false;
      }
    });
  }

  goToLogin(event: Event) {
    event.preventDefault();
    this.router.navigate(['/login']);
  }

  continueAsGuest(event: Event) {
    event.preventDefault();
    this.auth.setGuestMode();
    this.router.navigate(['/dashboard']);
  }
}
