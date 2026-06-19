import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shipment-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
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

  showReviewModal = false;

  selectedShipment: any = null;

  rating = 0;

  comment = '';

  showNotification = false;

  notificationMessage = '';

  openReview(shipment: any): void {

    this.selectedShipment = shipment;

    this.rating = 0;

    this.comment = '';

    this.showReviewModal = true;
  }

  closeReview(): void {

    this.showReviewModal = false;
  }

  submitReview(): void {

    console.log({
      shipment: this.selectedShipment.code,
      rating: this.rating,
      comment: this.comment
    });

    this.showReviewModal = false;

    this.notificationMessage =
      'Reseña enviada correctamente';

    this.showNotification = true;

    setTimeout(() => {

      this.showNotification = false;

    }, 3000);
  }

}