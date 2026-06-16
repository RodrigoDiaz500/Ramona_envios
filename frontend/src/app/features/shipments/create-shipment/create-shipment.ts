import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-create-shipment',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './create-shipment.html',
  styleUrl: './create-shipment.scss',
})
export class CreateShipment {

  senderName = '';
  receiverName = '';
  receiverPhone = '';
  originBranch = '';
  destinationBranch = '';
  weight = 0;
  observations = '';

  constructor(
    private notificationService: NotificationService
  ) {}

  createShipment(): void {

    const trackingCode =
      'RAM-' + Math.floor(100000 + Math.random() * 900000);

    console.log('Envío creado:', {

      trackingCode: trackingCode,

      senderName: this.senderName,

      receiverName: this.receiverName,

      receiverPhone: this.receiverPhone,

      originBranch: this.originBranch,

      destinationBranch: this.destinationBranch,

      weight: this.weight,

      observations: this.observations

    });

    this.notificationService.show(

      'Envío Creado',

      `El envío ${trackingCode} fue registrado correctamente.`

    );

  }

}