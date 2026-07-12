import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NotificationService } from '../../../../core/services/notification.service';
import { Sucursal, SucursalService } from '../../../../core/services/sucursal.service';
import { SolicitudService } from '../../../../core/services/solicitud.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UsuarioService } from '../../../../core/services/usuario.service';

@Component({
  selector: 'app-create-shipment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-shipment.html',
  styleUrl: './create-shipment.scss',
})
export class CreateShipment implements OnInit {

  senderName = '';
  receiverName = '';
  receiverRutDni = '';
  receiverPhone = '';

  originBranch = '';
  destinationBranch = '';

  weight = 0;
  declaredValue = 0;
  observations = '';

  branches: Sucursal[] = [];
  loading = false;

  constructor(
    private notificationService: NotificationService,
    private sucursalService: SucursalService,
    private solicitudService: SolicitudService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarSucursales();

    if (this.esCliente) {
      this.cargarRemitenteCliente();
    }
  }

  get usuarioId(): number | null {
    return this.authService.getUserId();
  }

  get esCliente(): boolean {
    return this.authService.getRole() === 'CLIENTE';
  }

  cargarRemitenteCliente(): void {
    const id = this.usuarioId;

    if (!id) {
      return;
    }

    this.usuarioService.obtenerPorId(id).subscribe({
      next: (response) => {
        this.senderName = `${response.data.nombre} ${response.data.apellido}`.trim();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar remitente', error);
      }
    });
  }

  cargarSucursales(): void {
    this.sucursalService.listar().subscribe({
      next: (response) => {
        this.branches = (response.data ?? []).filter(branch => branch.habilitada);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar sucursales', error);
        this.branches = [];
        this.cdr.detectChanges();
      }
    });
  }

  soloLetras(valor: string): string {
    return valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  }

  formatearRut(valor: string): string {
    let limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase();

    if (limpio.length <= 1) {
      return limpio;
    }

    limpio = limpio.slice(0, 9);

    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);

    return `${cuerpo}-${dv}`;
  }

  formatearTelefono(valor: string): string {
    let numeros = valor.replace(/\D/g, '');

    if (numeros.startsWith('56')) {
      numeros = numeros.slice(2);
    }

    if (numeros.startsWith('9')) {
      numeros = numeros.slice(1);
    }

    numeros = numeros.slice(0, 8);

    const parte1 = numeros.slice(0, 4);
    const parte2 = numeros.slice(4, 8);

    if (numeros.length <= 4) {
      return `+569 ${parte1}`;
    }

    return `+569 ${parte1} ${parte2}`;
  }

  createShipment(): void {
    const id = this.usuarioId;

    if (!id) {
      this.notificationService.show(
        'Usuario no identificado',
        'No se pudo identificar al usuario autenticado.',
        'error'
      );
      return;
    }

    if (
      !this.senderName.trim() ||
      !this.receiverName.trim() ||
      !this.receiverRutDni.trim() ||
      !this.receiverPhone.trim() ||
      !this.originBranch ||
      !this.destinationBranch ||
      this.weight <= 0 ||
      this.declaredValue <= 0
    ) {
      this.notificationService.show(
        'Campos obligatorios',
        'Se deben completar todos los campos marcados con (*) para crear el envío.',
        'warning'
      );
      return;
    }

    if (!/^\d{7,8}-[\dK]$/.test(this.receiverRutDni)) {
      this.notificationService.show(
        'RUT inválido',
        'El RUT debe tener un formato válido, por ejemplo: 12345678-9.',
        'warning'
      );
      return;
    }

    if (!/^\+569 \d{4} \d{4}$/.test(this.receiverPhone)) {
      this.notificationService.show(
        'Teléfono inválido',
        'El teléfono debe tener el formato +569 0000 0000.',
        'warning'
      );
      return;
    }

    if (this.originBranch === this.destinationBranch) {
      this.notificationService.show(
        'Sucursal inválida',
        'La sucursal de origen y destino no pueden ser la misma.',
        'warning'
      );
      return;
    }

    const request = {
      usuarioId: id,
      sucursalOrigenId: Number(this.originBranch),
      sucursalDestinoId: Number(this.destinationBranch),
      descripcion: this.observations,
      peso: Number(this.weight),
      valorDeclarado: Number(this.declaredValue),
      destinatarioNombre: this.receiverName.trim(),
      destinatarioRutDni: this.receiverRutDni.trim(),
      destinatarioTelefono: this.receiverPhone.trim()
    };

    this.loading = true;

    this.solicitudService.crear(request).subscribe({
      next: (response) => {
        this.loading = false;

        this.notificationService.show(
          'Envío Creado',
          `El envío ${response.data.codigoSeguimiento} fue registrado correctamente.`
        );

        this.limpiarFormulario();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;

        this.notificationService.show(
          'Error',
          error.error?.message ?? 'No se pudo crear el envío.',
          'error'
        );

        this.cdr.detectChanges();
      }
    });
  }

  limpiarFormulario(): void {
    if (!this.esCliente) {
      this.senderName = '';
    } else {
      this.cargarRemitenteCliente();
    }

    this.receiverName = '';
    this.receiverRutDni = '';
    this.receiverPhone = '';
    this.originBranch = '';
    this.destinationBranch = '';
    this.weight = 0;
    this.declaredValue = 0;
    this.observations = '';
  }
}