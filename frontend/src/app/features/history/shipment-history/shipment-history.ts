import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SolicitudEnvio, SolicitudService } from '../../../../core/services/solicitud.service';
import { ResenaService } from '../../../../core/services/resena.service';

@Component({
  selector: 'app-shipment-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shipment-history.html',
  styleUrl: './shipment-history.scss'
})
export class ShipmentHistory implements OnInit {

  shipments: SolicitudEnvio[] = [];
  usuarioId = 1;

  showReviewModal = false;
  selectedShipment: SolicitudEnvio | null = null;

  rating = 0;
  comment = '';

  showNotification = false;
  notificationMessage = '';
  loading = false;

  constructor(
    private solicitudService: SolicitudService,
    private resenaService: ResenaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.loading = true;

    this.solicitudService.listarPorUsuario(this.usuarioId).subscribe({
      next: (response) => {
        this.shipments = response.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar historial', error);
        this.shipments = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openReview(shipment: SolicitudEnvio): void {
    this.selectedShipment = shipment;
    this.rating = 0;
    this.comment = '';
    this.showReviewModal = true;
  }

  closeReview(): void {
    this.showReviewModal = false;
  }

  submitReview(): void {
    if (!this.selectedShipment || this.rating === 0) {
      this.mostrarNotificacion('Debes seleccionar una calificación.');
      return;
    }

    this.resenaService.crear({
      solicitudEnvioId: this.selectedShipment.id,
      usuarioId: this.usuarioId,
      calificacion: this.rating,
      comentario: this.comment
    }).subscribe({
      next: () => {
        this.showReviewModal = false;
        this.mostrarNotificacion('Reseña enviada correctamente');
      },
      error: (error) => {
        this.mostrarNotificacion(error.error?.message ?? 'No se pudo enviar la reseña');
      }
    });
  }

  puedeResenar(shipment: SolicitudEnvio): boolean {
    return shipment.estado === 'ENTREGADO';
  }

  mostrarNotificacion(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.showNotification = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  formatearEstado(estado: string): string {
  return estado.replaceAll('_', ' ');
  }

  estadoClase(estado: string): string {
    switch (estado) {
      case 'ENTREGADO':
        return 'badge-success';
      case 'EN_TRANSITO':
      case 'EN_PREPARACION':
        return 'badge-warning';
      case 'RECHAZADO':
        return 'badge-danger';
      default:
        return 'badge-pending';
    }
  }

  progreso(estado: string): number {
    switch (estado) {
      case 'PENDIENTE_APROBACION':
        return 1;
      case 'APROBADO':
      case 'EN_PREPARACION':
        return 2;
      case 'EN_TRANSITO':
        return 3;
      case 'ENTREGADO':
        return 4;
      default:
        return 1;
    }
  }
}