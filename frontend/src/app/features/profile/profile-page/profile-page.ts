import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Usuario, UsuarioRequest, UsuarioService } from '../../../../core/services/usuario.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss'
})
export class ProfilePage implements OnInit {

  usuarioId = 1;
  loading = false;

  usuarioActual: Usuario | null = null;

  user = {
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    direccion: '',
    entraId: null as string | null,
    roleId: 1
  };

  constructor(
    private usuarioService: UsuarioService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.loading = true;

    this.usuarioService.obtenerPorId(this.usuarioId).subscribe({
      next: (response) => {
        this.usuarioActual = response.data;

        this.user = {
          nombre: response.data.nombre,
          apellido: response.data.apellido,
          correo: response.data.correo,
          telefono: this.formatearTelefono(response.data.telefono ?? ''),
          direccion: response.data.direccion,
          entraId: response.data.entraId,
          roleId: response.data.rol.id
        };

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar perfil', error);
        this.loading = false;
        this.notificationService.show('Error', 'No se pudo cargar el perfil.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  soloLetras(valor: string): string {
    return valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  }

  formatearTelefono(valor: string): string {
    let numeros = valor.replace(/\D/g, '');

    if (numeros.startsWith('56')) {
      numeros = numeros.substring(2);
    }

    if (numeros.startsWith('9')) {
      numeros = numeros.substring(1);
    }

    numeros = numeros.substring(0, 8);

    const parte1 = numeros.substring(0, 4);
    const parte2 = numeros.substring(4);

    if (numeros.length <= 4) {
      return `+569 ${parte1}`;
    }

    return `+569 ${parte1} ${parte2}`;
  }

  saveProfile(): void {
    if (!this.usuarioActual) return;

    if (
      !this.user.nombre.trim() ||
      !this.user.apellido.trim() ||
      !this.user.correo.trim() ||
      !this.user.telefono.trim() ||
      !this.user.direccion.trim()
    ) {
      this.notificationService.show(
        'Campos obligatorios',
        'Debes completar todos los campos del perfil.',
        'warning'
      );
      return;
    }

    if (!/^\+569 \d{4} \d{4}$/.test(this.user.telefono)) {
      this.notificationService.show(
        'Teléfono inválido',
        'El teléfono debe tener el formato +569 0000 0000.',
        'warning'
      );
      return;
    }

    const request: UsuarioRequest = {
      nombre: this.user.nombre.trim(),
      apellido: this.user.apellido.trim(),
      correo: this.user.correo.trim(),
      telefono: this.user.telefono.trim(),
      direccion: this.user.direccion.trim(),
      entraId: this.user.entraId,
      roleId: this.user.roleId
    };

    this.loading = true;

    this.usuarioService.actualizar(this.usuarioId, request).subscribe({
      next: () => {
        this.loading = false;
        this.notificationService.show('Perfil actualizado', 'Tus datos fueron guardados correctamente.');
        this.cargarPerfil();
      },
      error: (error) => {
        console.error('Error al actualizar perfil', error);
        this.loading = false;
        this.notificationService.show(
          'Error',
          error.error?.message ?? 'No se pudo actualizar el perfil.',
          'error'
        );
        this.cdr.detectChanges();
      }
    });
  }
}