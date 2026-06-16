import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage {

  role: 'CLIENTE' | 'OPERADOR' | 'ADMIN' = 'ADMIN';

  stats = [

    {
      title: 'Envíos del Mes',
      value: 324
    },

    {
      title: 'Pendientes',
      value: 27
    },

    {
      title: 'En Tránsito',
      value: 98
    },

    {
      title: 'Entregados',
      value: 199
    }

  ];

  recentShipments = [

    {
      code: 'RAM-100001',
      status: 'En tránsito'
    },

    {
      code: 'RAM-100002',
      status: 'Entregado'
    },

    {
      code: 'RAM-100003',
      status: 'Pendiente'
    }

  ];

}