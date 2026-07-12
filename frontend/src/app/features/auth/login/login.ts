import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {

  errorMessage = '';
  showDisabledModal = false;

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const loginError = localStorage.getItem('loginError');

    if (loginError === 'disabled') {
      localStorage.removeItem('loginError');
      this.showDisabledModal = true;
    }
  }

  loginMicrosoft(): void {
    this.authService.loginMicrosoft();
  }

  cerrarModal(): void {
    this.showDisabledModal = false;
  }
}