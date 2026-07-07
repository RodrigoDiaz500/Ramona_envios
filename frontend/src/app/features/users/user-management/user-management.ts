import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Usuario, UsuarioRequest, UsuarioService } from '../../../../core/services/usuario.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationDialog } from '../../../shared/components/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmationDialog
  ],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss'
})
export class UserManagement implements OnInit {

  searchText = '';
  users: Usuario[] = [];
  loading = false;

  showEditModal = false;
  selectedUser: Usuario | null = null;

  showConfirmDialog = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmText = 'Confirmar';
  confirmType: 'warning' | 'danger' | 'success' = 'warning';

  pendingAction: (() => void) | null = null;

  editForm: UsuarioRequest = {
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    direccion: '',
    entraId: null,
    roleId: 1
  };

  roles = [
    { id: 1, nombre: 'CLIENTE' },
    { id: 2, nombre: 'OPERADOR' },
    { id: 3, nombre: 'ADMIN' }
  ];

  constructor(
    private usuarioService: UsuarioService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  get role(): string {
    return this.authService.getRole() ?? '';
  }

  get esAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  cargarUsuarios(): void {
    this.loading = true;

    this.usuarioService.listar().subscribe({
      next: (response) => {
        this.users = response.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar usuarios', error);
        this.users = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  usuariosFiltrados(): Usuario[] {
    const value = this.searchText.toLowerCase().trim();

    return this.users.filter(user =>
      `${user.nombre} ${user.apellido}`.toLowerCase().includes(value) ||
      user.correo.toLowerCase().includes(value) ||
      user.rol.nombre.toLowerCase().includes(value)
    );
  }

  abrirEditar(user: Usuario): void {
    this.selectedUser = user;

    this.editForm = {
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      telefono: user.telefono,
      direccion: user.direccion,
      entraId: user.entraId,
      roleId: user.rol.id
    };

    this.showEditModal = true;
  }

  cerrarEditar(): void {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  guardarCambios(): void {
    if (!this.selectedUser) return;

    const cambioRol =
      this.esAdmin &&
      this.editForm.roleId !== this.selectedUser.rol.id;

    if (cambioRol) {
      const nuevoRol = this.roles.find(r => r.id === Number(this.editForm.roleId))?.nombre ?? 'NUEVO ROL';

      this.abrirConfirmacion({
        title: 'Cambiar rol del usuario',
        message: `${this.selectedUser.nombre} ${this.selectedUser.apellido} pasará de ${this.selectedUser.rol.nombre} a ${nuevoRol}. Este cambio modificará sus permisos de acceso.`,
        confirmText: 'Confirmar cambio',
        type: 'warning',
        action: () => this.actualizarUsuario()
      });

      return;
    }

    this.actualizarUsuario();
  }

  actualizarUsuario(): void {
    if (!this.selectedUser) return;

    this.usuarioService.actualizar(this.selectedUser.id, this.editForm).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.cerrarEditar();
      },
      error: (error) => {
        console.error('Error al actualizar usuario', error);
        alert(error.error?.message ?? 'No se pudo actualizar el usuario');
      }
    });
  }

  solicitarCambioEstado(user: Usuario): void {
    if (user.activo) {
      this.abrirConfirmacion({
        title: 'Deshabilitar usuario',
        message: `${user.nombre} ${user.apellido} dejará de poder acceder al sistema. Su historial se conservará.`,
        confirmText: 'Deshabilitar',
        type: 'danger',
        action: () => this.cambiarEstado(user)
      });
    } else {
      this.abrirConfirmacion({
        title: 'Reactivar usuario',
        message: `${user.nombre} ${user.apellido} podrá volver a utilizar el sistema.`,
        confirmText: 'Reactivar',
        type: 'success',
        action: () => this.cambiarEstado(user)
      });
    }
  }

  cambiarEstado(user: Usuario): void {
    this.usuarioService.cambiarEstado(user.id, !user.activo).subscribe({
      next: () => this.cargarUsuarios(),
      error: (error) => console.error('Error al cambiar estado', error)
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