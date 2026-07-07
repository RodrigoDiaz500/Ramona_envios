import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SolicitudEnvio, SolicitudService } from '../../../../core/services/solicitud.service';
import { Seguimiento, SeguimientoService } from '../../../../core/services/seguimiento.service';

@Component({
  selector: 'app-update-shipment-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-shipment-status.html',
  styleUrl: './update-shipment-status.scss'
})
export class UpdateShipmentStatus implements OnInit {

  shipments: SolicitudEnvio[] = [];
  filteredShipments: SolicitudEnvio[] = [];

  selectedShipment: SolicitudEnvio | null = null;
  seguimientos: Seguimiento[] = [];

  search = '';
  loading = false;
  loadingTimeline = false;
  showDetailModal = false;

  operadorId = 1;

  estados = [
    'PENDIENTE_APROBACION',
    'APROBADO',
    'EN_PREPARACION',
    'EN_TRANSITO',
    'ENTREGADO',
    'RECHAZADO'
  ];

  constructor(
    private solicitudService: SolicitudService,
    private seguimientoService: SeguimientoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.loading = true;

    this.solicitudService.listar().subscribe({
      next: (response) => {
        this.shipments = response.data ?? [];
        this.filteredShipments = this.shipments;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar solicitudes', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrar(): void {
    const value = this.search.toLowerCase().trim();

    this.filteredShipments = this.shipments.filter(item =>
      item.codigoSeguimiento.toLowerCase().includes(value) ||
      item.estado.toLowerCase().includes(value) ||
      item.destinatarioNombre.toLowerCase().includes(value)
    );
  }

  porEstado(estado: string): SolicitudEnvio[] {
    return this.filteredShipments.filter(item => item.estado === estado);
  }

  abrirDetalle(shipment: SolicitudEnvio): void {
    this.selectedShipment = shipment;
    this.showDetailModal = true;
    this.loadingTimeline = true;

    this.seguimientoService.listarPorSolicitud(shipment.id).subscribe({
      next: (response) => {
        this.seguimientos = response.data ?? [];
        this.loadingTimeline = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar timeline', error);
        this.seguimientos = [];
        this.loadingTimeline = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarDetalle(): void {
    this.showDetailModal = false;
    this.selectedShipment = null;
    this.seguimientos = [];
  }

  cambiarEstado(shipment: SolicitudEnvio, estado: string): void {
    this.solicitudService.cambiarEstado(shipment.id, {
      estado,
      aprobadoPorId: this.operadorId
    }).subscribe({
      next: (response) => {
        this.cargarSolicitudes();

        if (this.showDetailModal) {
          this.abrirDetalle(response.data);
        }
      },
      error: (error) => {
        console.error('Error al cambiar estado', error);
        alert(error.error?.message ?? 'No se pudo actualizar el estado');
      }
    });
  }

  siguienteEstado(estado: string): string | null {
    switch (estado) {
      case 'PENDIENTE_APROBACION':
        return 'APROBADO';
      case 'APROBADO':
        return 'EN_PREPARACION';
      case 'EN_PREPARACION':
        return 'EN_TRANSITO';
      case 'EN_TRANSITO':
        return 'ENTREGADO';
      default:
        return null;
    }
  }

  formatearEstado(estado: string): string {
    return estado.replaceAll('_', ' ');
  }
}