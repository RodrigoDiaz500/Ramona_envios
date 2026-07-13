import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

import { loginRequest } from '../auth/msal.config';
import { environment } from '../../environments/environment';

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

  private readonly storageKey = 'ramona_user';

  constructor(
    private readonly msalService: MsalService
  ) {}

  login(
    id: number,
    email: string,
    role: UserRole
  ): void {
    const user: UserSession = { id, email, role };
    localStorage.setItem(this.storageKey, JSON.stringify(user));
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
    await this.msalService.loginRedirect(loginRequest);
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.storageKey);

    await this.msalService.instance.initialize();
    await this.msalService.logoutRedirect({
      postLogoutRedirectUri: environment.azure.postLogoutRedirectUri
    });
  }

  getUser(): UserSession | null {
    const storedUser = localStorage.getItem(this.storageKey);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as UserSession;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
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
