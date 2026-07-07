import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

import {
  Incidencia,
  IncidenciaRequest,
  IncidenciaService
} from '../../../../core/services/incidencia.service';

import {
  SolicitudEnvio,
  SolicitudService
} from '../../../../core/services/solicitud.service';

@Component({
  selector: 'app-incident-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './incident-management.html',
  styleUrl: './incident-management.scss'
})
export class IncidentManagement implements OnInit {

  incidents: Incidencia[] = [];
  solicitudes: SolicitudEnvio[] = [];

  loading = false;
  showCreateModal = false;

  operadorId = 1;

  form: IncidenciaRequest = {
    solicitudEnvioId: 0,
    titulo: '',
    descripcion: '',
    creadaPorId: 1,
    asignadaAId: null
    
  };

  constructor(
    private incidenciaService: IncidenciaService,
    private solicitudService: SolicitudService,
    private cdr: ChangeDetectorRef,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarIncidencias();
    this.cargarSolicitudes();
  }

  cargarIncidencias(): void {
    this.loading = true;

    this.incidenciaService.listar().subscribe({
      next: (response) => {
        this.incidents = response.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar incidencias', error);
        this.incidents = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarSolicitudes(): void {
    this.solicitudService.listar().subscribe({
      next: (response) => {
        this.solicitudes = response.data ?? [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar solicitudes', error);
        this.solicitudes = [];
        this.cdr.detectChanges();
      }
    });
  }

  abrirCrear(): void {
    this.form = {
      solicitudEnvioId: 0,
      titulo: '',
      descripcion: '',
      creadaPorId: this.operadorId,
      asignadaAId: null
    };

    this.showCreateModal = true;
  }

  cerrarCrear(): void {
    this.showCreateModal = false;
  }

  crearIncidencia(): void {
    if (
      this.form.solicitudEnvioId <= 0 ||
      !this.form.titulo.trim() ||
      !this.form.descripcion.trim()
    ) {
      alert('Debes seleccionar una solicitud e ingresar título y descripción.');
      return;
    }

    this.incidenciaService.crear(this.form).subscribe({
      next: () => {
        this.cargarIncidencias();
        this.cerrarCrear();
      },
      error: (error) => {
        console.error('Error al crear incidencia', error);
        alert(error.error?.message ?? 'No se pudo crear la incidencia');
      }
    });
  }

  cambiarEstado(incident: Incidencia, estado: string): void {
    this.incidenciaService.actualizarEstado(incident.id, {
      estado,
      asignadaAId: this.operadorId
    }).subscribe({
      next: () => this.cargarIncidencias(),
      error: (error) => console.error('Error al actualizar incidencia', error)
    });
  }

  formatearEstado(estado: string): string {
    return estado.replaceAll('_', ' ');
  }

  get esAdmin(): boolean {
  return this.authService.getRole() === 'ADMIN';
  }
}