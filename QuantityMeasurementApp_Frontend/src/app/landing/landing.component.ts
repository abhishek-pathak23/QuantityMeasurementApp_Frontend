import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  constructor(private router: Router, private auth: AuthService) {}

  goLogin() { this.router.navigate(['/login']); }
  goSignup() { this.router.navigate(['/signup']); }
  continueAsGuest() { this.auth.continueAsGuest(); }
}
