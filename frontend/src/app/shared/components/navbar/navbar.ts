import { Component } from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { CommonModule } from '@angular/common';

import {
  AuthService
}
from '../../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  get role() {

    return this.authService.getRole();

  }

  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);

  }

}