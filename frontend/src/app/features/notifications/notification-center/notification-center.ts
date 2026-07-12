import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  Notificacion,
  NotificacionApiService
} from '../../../../core/services/notificacion-api.service';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-center.html',
  styleUrl: './notification-center.scss'
})
export class NotificationCenter implements OnInit {

  notifications: Notificacion[] = [];
  loading = false;

  constructor(
    private notificacionService: NotificacionApiService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarNotificaciones();
  }

  get usuarioId(): number | null {
    return this.authService.getUserId();
  }

  cargarNotificaciones(): void {
    const id = this.usuarioId;

    if (!id) {
      this.notifications = [];
      return;
    }

    this.loading = true;

    this.notificacionService.listarPorUsuario(id).subscribe({
      next: (response) => {
        this.notifications = response.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar notificaciones', error);
        this.notifications = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  marcarComoLeida(notification: Notificacion): void {
    if (notification.leida) {
      return;
    }

    this.notificacionService.marcarComoLeida(notification.id).subscribe({
      next: () => {
        notification.leida = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al marcar como leída', error);
      }
    });
  }
}