import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-center.html',
  styleUrl: './notification-center.scss'
})
export class NotificationCenter {

  notifications = [

    {
      title: 'Envío Creado',
      message: 'El envío RAM-100001 fue registrado correctamente.',
      date: '15/06/2026'
    },

    {
      title: 'Estado Actualizado',
      message: 'RAM-100002 cambió a En Tránsito.',
      date: '15/06/2026'
    },

    {
      title: 'Incidencia Resuelta',
      message: 'La incidencia del envío RAM-100003 fue resuelta.',
      date: '14/06/2026'
    }

  ];

}