import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  email = '';
  password = '';

  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  login(): void {

  if (
    this.email === 'admin@ramona.cl' &&
    this.password === 'admin'
  ) {

    this.authService.login(
      this.email,
      'ADMIN'
    );

    this.router.navigate([
      '/dashboard'
    ]);

    return;

  }

  if (
    this.email === 'operador@ramona.cl' &&
    this.password === 'operador'
  ) {

    this.authService.login(
      this.email,
      'OPERADOR'
    );

    this.router.navigate([
      '/shipment'
    ]);

    return;

  }

  if (
    this.email === 'cliente@ramona.cl' &&
    this.password === 'cliente'
  ) {

    this.authService.login(
      this.email,
      'CLIENTE'
    );

    this.router.navigate([
      '/tracking'
    ]);

    return;

  }

  this.errorMessage =
    'Correo o contraseña incorrectos';

}

}