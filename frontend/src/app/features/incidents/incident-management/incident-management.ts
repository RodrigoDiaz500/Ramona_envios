import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-incident-management',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './incident-management.html',
  styleUrl: './incident-management.scss'
})
export class IncidentManagement {

  incidents = [

    {
      code: 'RAM-100001',
      type: 'Paquete dañado',
      status: 'Pendiente'
    },

    {
      code: 'RAM-100002',
      type: 'Retraso en entrega',
      status: 'En revisión'
    },

    {
      code: 'RAM-100003',
      type: 'Dirección incorrecta',
      status: 'Resuelto'
    }

  ];

}