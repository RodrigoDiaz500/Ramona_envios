import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-management.html',
  styleUrl: './review-management.scss'
})
export class ReviewManagement {

  reviews = [

    {
      shipmentCode: 'RAM-100001',
      user: 'Juan Pérez',
      rating: 5,
      comment: 'Excelente servicio, llegó antes de tiempo.',
      date: '15/06/2026'
    },

    {
      shipmentCode: 'RAM-100002',
      user: 'María González',
      rating: 4,
      comment: 'Todo bien, aunque la entrega tardó un poco.',
      date: '14/06/2026'
    },

    {
      shipmentCode: 'RAM-100003',
      user: 'Carlos Soto',
      rating: 2,
      comment: 'La caja llegó dañada.',
      date: '13/06/2026'
    }

  ];

}