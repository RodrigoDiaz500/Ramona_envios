import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-update-shipment-status',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './update-shipment-status.html',
  styleUrl: './update-shipment-status.scss'
})
export class UpdateShipmentStatus {

  trackingCode = '';

  shipment = {

    code: 'RAM-100001',

    customer: 'Rodrigo Díaz',

    currentStatus: 'En tránsito'
  };

  newStatus = '';

  observation = '';

  updateStatus(): void {

    console.log('Estado actualizado');

  }

}