import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  Notificacion,
  NotificacionApiService
} from '../../../../core/services/notificacion-api.service';

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

  // Más adelante obtendremos este valor desde el login.
  usuarioId = 1;

  constructor(
    private notificacionService: NotificacionApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarNotificaciones();
  }

  cargarNotificaciones(): void {

    this.loading = true;

    this.notificacionService.listarPorUsuario(this.usuarioId).subscribe({

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