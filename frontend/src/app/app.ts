import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

import { AuthApiService } from '../core/services/auth-api.service';
import { AuthService, UserRole } from '../core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

  protected readonly title = signal('frontend');

  private sincronizando = false;

  constructor(
    private msalService: MsalService,
    private authApiService: AuthApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.msalService.instance.initialize();

    this.msalService.handleRedirectObservable().subscribe({
      next: (result) => {
        const account =
          result?.account ??
          this.msalService.instance.getActiveAccount() ??
          this.msalService.instance.getAllAccounts()[0];

        if (!account) {
          return;
        }

        this.msalService.instance.setActiveAccount(account);
        this.sincronizarUsuario();
      },
      error: (error) => {
        console.error('Error en redirect MSAL', error);
      }
    });

    const account =
      this.msalService.instance.getActiveAccount() ??
      this.msalService.instance.getAllAccounts()[0];

    if (account) {
      this.msalService.instance.setActiveAccount(account);
      this.sincronizarUsuario();
    }
  }

  sincronizarUsuario(): void {
    if (this.sincronizando) {
      return;
    }

    this.sincronizando = true;

    this.authApiService.me().subscribe({
      next: (response) => {
        this.sincronizando = false;

        const role = response.data.rol.nombre as UserRole;

        this.authService.saveSessionFromBackend(
          response.data.id,
          response.data.correo,
          role
        );

        if (location.pathname === '/' || location.pathname === '/login') {
          this.router.navigate([
            role === 'CLIENTE' ? '/tracking' : '/dashboard'
          ]);
        }
      },

      error: async (error) => {
        this.sincronizando = false;

        if (error.status === 403) {
          localStorage.removeItem('ramona_user');
          sessionStorage.clear();

          await this.msalService.instance.clearCache();

          localStorage.setItem('loginError', 'disabled');

          this.router.navigate(['/login']);

          return;
        }

        console.error('Error al sincronizar usuario', error);
      }
    });
  }
}