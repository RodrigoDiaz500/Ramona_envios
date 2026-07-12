import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

export type UserRole =
  | 'CLIENTE'
  | 'OPERADOR'
  | 'ADMIN';

export interface UserSession {
  id: number;
  email: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private storageKey = 'ramona_user';

  constructor(
    private msalService: MsalService
  ) {}

  login(
    id: number,
    email: string,
    role: UserRole
  ): void {
    const user: UserSession = {
      id,
      email,
      role
    };

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(user)
    );
  }

  saveSessionFromBackend(
    id: number,
    email: string,
    role: UserRole
  ): void {
    this.login(id, email, role);
  }

  async loginMicrosoft(): Promise<void> {
  await this.msalService.instance.initialize();

  await this.msalService.loginRedirect({
      scopes: [
        'api://b82da08a-15ea-4bd6-902e-236d2d2e523a/Acceso.Total'
      ],
      prompt: 'select_account'
    });
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.storageKey);

    await this.msalService.instance.initialize();

    await this.msalService.logoutRedirect({
      postLogoutRedirectUri: 'http://localhost:4200/login'
    });
  }

  getUser(): UserSession | null {
    const user = localStorage.getItem(this.storageKey);
    return user ? JSON.parse(user) : null;
  }

  getUserId(): number | null {
    return this.getUser()?.id ?? null;
  }

  getRole(): UserRole {
    return this.getUser()?.role ?? 'CLIENTE';
  }

  isLoggedIn(): boolean {
    return this.msalService.instance.getAllAccounts().length > 0;
  }
}