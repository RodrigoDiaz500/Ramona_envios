import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { MsalService } from '@azure/msal-angular';

import {
  AuthService
} from '../../../../core/services/auth.service';

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
    public readonly authService: AuthService,
    private readonly router: Router,
    private readonly msalService: MsalService
  ) {}

  get role(): string | null {
    return this.authService.getRole();
  }

  /**
   * Cierra solamente la sesión de Ramona Express.
   * No abre la pantalla de cierre de Microsoft.
   */
  async logout(): Promise<void> {

    const account =
      this.msalService.instance.getActiveAccount()
      ?? this.msalService.instance.getAllAccounts()[0]
      ?? null;

    try {

      /*
       * Elimina las cuentas y tokens guardados por MSAL,
       * pero no realiza una redirección externa.
       */
      if (account) {
        await this.msalService.instance.clearCache({
          account
        });
      } else {
        await this.msalService.instance.clearCache();
      }

      this.msalService.instance.setActiveAccount(null);

    } catch (error) {

      console.error(
        'Error al limpiar la caché de MSAL:',
        error
      );

    } finally {

      this.limpiarSesionLocal();

      await this.router.navigateByUrl(
        '/login',
        {
          replaceUrl: true
        }
      );
    }
  }

  /**
   * Se mantiene como alias por si el HTML todavía utiliza
   * (click)="cerrarSesion()".
   */
  async cerrarSesion(): Promise<void> {
    await this.logout();
  }

  private limpiarSesionLocal(): void {

    const claves = [
      'usuario',
      'role',
      'userRole',
      'token',
      'accessToken'
    ];

    claves.forEach((clave) => {
      localStorage.removeItem(clave);
      sessionStorage.removeItem(clave);
    });
  }
}