import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tracking-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './tracking-page.html',
  styleUrl: './tracking-page.scss'
})
export class TrackingPage {

  trackingCode = '';

  showResult = false;

  shipment = {

    code: 'RAM-123456',

    status: 'EN TRANSITO',

    origin: 'Santiago',

    destination: 'San Antonio',

    lastUpdate: '15/06/2026 10:45'
  };

  searchTracking() {

    this.showResult = true;

  }

}