import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Sucursal,
  SucursalRequest,
  SucursalService
} from '../../../../core/services/sucursal.service';

import { ConfirmationDialog } from '../../../shared/components/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-branch-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmationDialog
  ],
  templateUrl: './branch-management.html',
  styleUrl: './branch-management.scss'
})
export class BranchManagement implements OnInit {

  branches: Sucursal[] = [];
  loading = false;

  showModal = false;
  selectedBranch: Sucursal | null = null;

  showConfirmDialog = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmText = 'Confirmar';
  confirmType: 'warning' | 'danger' | 'success' = 'warning';
  pendingAction: (() => void) | null = null;

  form: SucursalRequest = {
    nombre: '',
    direccion: '',
    ciudad: '',
    telefono: ''
  };

  constructor(
    private sucursalService: SucursalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarSucursales();
  }

  cargarSucursales(): void {
    this.loading = true;

    this.sucursalService.listar().subscribe({
      next: (response) => {
        this.branches = response.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar sucursales', error);
        this.branches = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirNuevaSucursal(): void {
    this.selectedBranch = null;
    this.form = {
      nombre: '',
      direccion: '',
      ciudad: '',
      telefono: ''
    };
    this.showModal = true;
  }

  abrirEditar(branch: Sucursal): void {
    this.selectedBranch = branch;

    this.form = {
      nombre: branch.nombre,
      direccion: branch.direccion,
      ciudad: branch.ciudad,
      telefono: branch.telefono
    };

    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.selectedBranch = null;
  }

  guardarSucursal(): void {
    if (this.selectedBranch) {
      this.sucursalService.actualizar(this.selectedBranch.id, this.form).subscribe({
        next: () => {
          this.cargarSucursales();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar sucursal', error);
          alert(error.error?.message ?? 'No se pudo actualizar la sucursal');
        }
      });

      return;
    }

    this.sucursalService.crear(this.form).subscribe({
      next: () => {
        this.cargarSucursales();
        this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al crear sucursal', error);
        alert(error.error?.message ?? 'No se pudo crear la sucursal');
      }
    });
  }

  solicitarCambioEstado(branch: Sucursal): void {
    if (branch.habilitada) {
      this.abrirConfirmacion({
        title: 'Deshabilitar sucursal',
        message: `${branch.nombre} dejará de estar disponible para nuevos envíos.`,
        confirmText: 'Deshabilitar',
        type: 'danger',
        action: () => this.cambiarEstado(branch)
      });
    } else {
      this.abrirConfirmacion({
        title: 'Reactivar sucursal',
        message: `${branch.nombre} volverá a estar disponible para nuevos envíos.`,
        confirmText: 'Reactivar',
        type: 'success',
        action: () => this.cambiarEstado(branch)
      });
    }
  }

  cambiarEstado(branch: Sucursal): void {
    this.sucursalService.cambiarEstado(branch.id, !branch.habilitada).subscribe({
      next: () => this.cargarSucursales(),
      error: (error) => console.error('Error al cambiar estado de sucursal', error)
    });
  }

  abrirConfirmacion(config: {
    title: string;
    message: string;
    confirmText: string;
    type: 'warning' | 'danger' | 'success';
    action: () => void;
  }): void {
    this.confirmTitle = config.title;
    this.confirmMessage = config.message;
    this.confirmText = config.confirmText;
    this.confirmType = config.type;
    this.pendingAction = config.action;
    this.showConfirmDialog = true;
  }

  confirmarAccion(): void {
    if (this.pendingAction) {
      this.pendingAction();
    }

    this.cerrarConfirmacion();
  }

  cerrarConfirmacion(): void {
    this.showConfirmDialog = false;
    this.pendingAction = null;
  }
}