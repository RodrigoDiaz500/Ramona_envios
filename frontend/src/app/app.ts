import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { firstValueFrom } from 'rxjs';

import { AuthApiService } from '../core/services/auth-api.service';
import { AuthService, UserRole } from '../core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

  protected readonly title = signal('frontend');
  private sincronizando = false;

  constructor(
    private readonly msalService: MsalService,
    private readonly authApiService: AuthApiService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.msalService.instance.initialize();

      const redirectResult = await firstValueFrom(
        this.msalService.handleRedirectObservable()
      );

      const account =
        redirectResult?.account ??
        this.msalService.instance.getActiveAccount() ??
        this.msalService.instance.getAllAccounts()[0];

      if (!account) {
        return;
      }

      this.msalService.instance.setActiveAccount(account);
      this.sincronizarUsuario();
    } catch (error) {
      console.error('Error procesando el redirect de MSAL', error);
    }
  }

  private sincronizarUsuario(): void {
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
          void this.router.navigate([
            role === 'CLIENTE' ? '/tracking' : '/dashboard'
          ]);
        }
      },

      error: async (error) => {
        this.sincronizando = false;

        if (error.status === 403) {
          localStorage.removeItem('ramona_user');
          await this.msalService.instance.clearCache();
          localStorage.setItem('loginError', 'disabled');
          await this.router.navigate(['/login']);
          return;
        }

        console.error('Error al sincronizar usuario con /api/auth/me', error);
      }
    });
  }
}
