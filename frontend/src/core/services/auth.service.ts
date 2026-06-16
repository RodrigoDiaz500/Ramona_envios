import { Injectable } from '@angular/core';

export type UserRole =
  | 'CLIENTE'
  | 'OPERADOR'
  | 'ADMIN';

export interface UserSession {

  email: string;

  role: UserRole;

}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private storageKey = 'ramona_user';

  login(
    email: string,
    role: UserRole
  ): void {

    const user: UserSession = {

      email,
      role

    };

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(user)
    );

  }

  logout(): void {

    localStorage.removeItem(
      this.storageKey
    );

  }

  getUser(): UserSession | null {

    const user =
      localStorage.getItem(
        this.storageKey
      );

    return user
      ? JSON.parse(user)
      : null;

  }

  getRole(): UserRole | null {

    return this.getUser()?.role ?? null;

  }

  isLoggedIn(): boolean {

    return this.getUser() !== null;

  }

}