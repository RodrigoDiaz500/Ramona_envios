import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SolicitudEnvio, SolicitudService } from '../../../../core/services/solicitud.service';
import { Seguimiento, SeguimientoService } from '../../../../core/services/seguimiento.service';

@Component({
  selector: 'app-tracking-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking-page.html',
  styleUrl: './tracking-page.scss'
})
export class TrackingPage {

  trackingCode = '';
  showResult = false;
  loading = false;
  errorMessage = '';

  shipment?: SolicitudEnvio;
  seguimientos: Seguimiento[] = [];

  constructor(
    private solicitudService: SolicitudService,
    private seguimientoService: SeguimientoService,
    private cdr: ChangeDetectorRef
  ) {}

  searchTracking(): void {
    if (!this.trackingCode.trim()) {
      this.errorMessage = 'Ingresa un código de seguimiento.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.showResult = false;

    this.solicitudService.buscarPorCodigo(this.trackingCode.trim()).subscribe({
      next: (response) => {
        this.shipment = response.data;
        this.showResult = true;

        this.seguimientoService.listarPorSolicitud(response.data.id).subscribe({
          next: (seguimientoResponse) => {
            this.seguimientos = seguimientoResponse.data ?? [];
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.seguimientos = [];
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.errorMessage = 'No se encontró un envío con ese código.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}