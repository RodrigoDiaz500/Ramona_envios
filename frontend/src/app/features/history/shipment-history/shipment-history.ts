import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shipment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipment-history.html',
  styleUrl: './shipment-history.scss'
})
export class ShipmentHistory {

  shipments = [

    {
      code: 'RAM-100001',
      status: 'En tránsito',
      origin: 'Santiago',
      destination: 'San Antonio',
      date: '15/06/2026'
    },

    {
      code: 'RAM-100002',
      status: 'Entregado',
      origin: 'Santiago',
      destination: 'Valparaíso',
      date: '13/06/2026'
    },

    {
      code: 'RAM-100003',
      status: 'Pendiente',
      origin: 'San Antonio',
      destination: 'La Serena',
      date: '12/06/2026'
    }

  ];

}