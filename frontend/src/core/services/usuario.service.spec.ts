import {
  HttpErrorResponse,
  provideHttpClient
} from '@angular/common/http';

import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { TestBed } from '@angular/core/testing';

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';

import { environment } from '../../environments/environment';

import {
  ApiResponse
} from './sucursal.service';

import {
  Usuario,
  UsuarioRequest,
  UsuarioService
} from './usuario.service';

describe('UsuarioService', () => {

  let service: UsuarioService;
  let httpTestingController: HttpTestingController;

  const apiUrl =
    `${environment.apiUrl}/usuarios`;

  const usuarioMock: Usuario = {
    id: 10,
    nombre: 'Rodrigo',
    apellido: 'Díaz',
    correo: 'rodrigo@ramona.cl',
    telefono: '+56911112222',
    direccion: 'San Antonio',
    activo: true,
    entraId: 'entra-id-rodrigo',
    rol: {
      id: 1,
      nombre: 'CLIENTE'
    },
    fechaCreacion: '2026-07-01T10:00:00',
    fechaActualizacion: '2026-07-12T10:30:00'
  };

  const segundoUsuarioMock: Usuario = {
    id: 20,
    nombre: 'Ana',
    apellido: 'Pérez',
    correo: 'ana@ramona.cl',
    telefono: '+56933334444',
    direccion: 'Santiago',
    activo: true,
    entraId: 'entra-id-ana',
    rol: {
      id: 2,
      nombre: 'OPERADOR'
    },
    fechaCreacion: '2026-07-02T09:00:00',
    fechaActualizacion: '2026-07-12T11:00:00'
  };

  const requestMock: UsuarioRequest = {
    nombre: 'Rodrigo Andrés',
    apellido: 'Díaz Vallejos',
    correo: 'rodrigo.actualizado@ramona.cl',
    telefono: '+56977778888',
    direccion: 'Cartagena',
    entraId: 'nuevo-entra-id',
    roleId: 2
  };

  beforeEach(() => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        UsuarioService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service =
      TestBed.inject(UsuarioService);

    httpTestingController =
      TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Creación del servicio', () => {

    it('debe crearse correctamente', () => {
      expect(service).toBeTruthy();
    });

  });

  describe('listar', () => {

    it('debe realizar una solicitud GET a /usuarios', () => {
      service.listar().subscribe();

      const request =
        httpTestingController.expectOne(apiUrl);

      expect(request.request.method)
        .toBe('GET');

      request.flush({
        success: true,
        message: 'Usuarios obtenidos correctamente',
        data: [],
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe retornar todos los usuarios', () => {
      const responseMock: ApiResponse<Usuario[]> = {
        success: true,
        message: 'Usuarios obtenidos correctamente',
        data: [
          usuarioMock,
          segundoUsuarioMock
        ],
        timestamp: '2026-07-12T12:00:00'
      };

      let resultado:
        ApiResponse<Usuario[]> | undefined;

      service.listar().subscribe({
        next: response => {
          resultado = response;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush(responseMock);

      expect(resultado)
        .toEqual(responseMock);

      expect(resultado?.data)
        .toHaveLength(2);

      expect(resultado?.data[0].nombre)
        .toBe('Rodrigo');

      expect(resultado?.data[1].rol.nombre)
        .toBe('OPERADOR');
    });

    it('debe retornar una lista vacía', () => {
      let usuarios: Usuario[] | undefined;

      service.listar().subscribe({
        next: response => {
          usuarios = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush({
        success: true,
        message: 'Usuarios obtenidos correctamente',
        data: [],
        timestamp: '2026-07-12T12:00:00'
      });

      expect(usuarios).toEqual([]);
    });

  });

  describe('obtenerPorId', () => {

    it('debe realizar GET con el ID correcto', () => {
      service.obtenerPorId(10).subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/10`
        );

      expect(request.request.method)
        .toBe('GET');

      expect(request.request.body)
        .toBeNull();

      request.flush({
        success: true,
        message: 'Usuario obtenido correctamente',
        data: usuarioMock,
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe retornar el usuario solicitado', () => {
      let usuario: Usuario | undefined;

      service.obtenerPorId(10).subscribe({
        next: response => {
          usuario = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/10`
        );

      request.flush({
        success: true,
        message: 'Usuario obtenido correctamente',
        data: usuarioMock,
        timestamp: '2026-07-12T12:00:00'
      });

      expect(usuario).toEqual(usuarioMock);
      expect(usuario?.id).toBe(10);
      expect(usuario?.correo)
        .toBe('rodrigo@ramona.cl');
    });

    it('debe propagar un error 404', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.obtenerPorId(999).subscribe({
        error: error => {
          errorRecibido = error;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/999`
        );

      request.flush(
        {
          success: false,
          message: 'Usuario no encontrado'
        },
        {
          status: 404,
          statusText: 'Not Found'
        }
      );

      expect(errorRecibido?.status)
        .toBe(404);

      expect(errorRecibido?.error.message)
        .toBe('Usuario no encontrado');
    });

  });

  describe('actualizar', () => {

    it('debe realizar una solicitud PUT', () => {
      service.actualizar(
        10,
        requestMock
      ).subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/10`
        );

      expect(request.request.method)
        .toBe('PUT');

      request.flush({
        success: true,
        message: 'Usuario actualizado correctamente',
        data: usuarioMock,
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe enviar el cuerpo completo de actualización', () => {
      service.actualizar(
        10,
        requestMock
      ).subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/10`
        );

      expect(request.request.body)
        .toEqual(requestMock);

      expect(request.request.body.nombre)
        .toBe('Rodrigo Andrés');

      expect(request.request.body.roleId)
        .toBe(2);

      request.flush({
        success: true,
        message: 'Usuario actualizado correctamente',
        data: usuarioMock,
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe retornar el usuario actualizado', () => {
      const usuarioActualizado: Usuario = {
        ...usuarioMock,
        nombre: requestMock.nombre,
        apellido: requestMock.apellido,
        correo: requestMock.correo,
        telefono: requestMock.telefono,
        direccion: requestMock.direccion,
        entraId: requestMock.entraId,
        rol: {
          id: 2,
          nombre: 'OPERADOR'
        }
      };

      let resultado: Usuario | undefined;

      service.actualizar(
        10,
        requestMock
      ).subscribe({
        next: response => {
          resultado = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/10`
        );

      request.flush({
        success: true,
        message: 'Usuario actualizado correctamente',
        data: usuarioActualizado,
        timestamp: '2026-07-12T12:00:00'
      });

      expect(resultado)
        .toEqual(usuarioActualizado);

      expect(resultado?.nombre)
        .toBe('Rodrigo Andrés');

      expect(resultado?.rol.nombre)
        .toBe('OPERADOR');
    });

    it('debe propagar un error 400 al actualizar', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.actualizar(
        10,
        requestMock
      ).subscribe({
        error: error => {
          errorRecibido = error;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/10`
        );

      request.flush(
        {
          success: false,
          message: 'Correo inválido'
        },
        {
          status: 400,
          statusText: 'Bad Request'
        }
      );

      expect(errorRecibido?.status)
        .toBe(400);

      expect(errorRecibido?.error.message)
        .toBe('Correo inválido');
    });

  });

  describe('cambiarEstado', () => {

    it('debe habilitar un usuario mediante PATCH', () => {
      service.cambiarEstado(
        10,
        true
      ).subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/10/activo?activo=true`
        );

      expect(request.request.method)
        .toBe('PATCH');

      expect(request.request.body)
        .toEqual({});

      request.flush({
        success: true,
        message:
          'Estado del usuario actualizado correctamente',
        data: usuarioMock,
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe deshabilitar un usuario mediante PATCH', () => {
      const usuarioDeshabilitado: Usuario = {
        ...usuarioMock,
        activo: false
      };

      let resultado: Usuario | undefined;

      service.cambiarEstado(
        10,
        false
      ).subscribe({
        next: response => {
          resultado = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/10/activo?activo=false`
        );

      expect(request.request.method)
        .toBe('PATCH');

      request.flush({
        success: true,
        message:
          'Estado del usuario actualizado correctamente',
        data: usuarioDeshabilitado,
        timestamp: '2026-07-12T12:00:00'
      });

      expect(resultado?.activo).toBe(false);
    });

    it('debe propagar un error al cambiar estado', () => {
      let status: number | undefined;

      service.cambiarEstado(
        999,
        false
      ).subscribe({
        error: error => {
          status = error.status;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/999/activo?activo=false`
        );

      request.flush(
        {
          success: false,
          message: 'Usuario no encontrado'
        },
        {
          status: 404,
          statusText: 'Not Found'
        }
      );

      expect(status).toBe(404);
    });

  });

  describe('cambiarRol', () => {

    it('debe realizar PATCH con el roleId correcto', () => {
      service.cambiarRol(
        10,
        3
      ).subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/10/rol?roleId=3`
        );

      expect(request.request.method)
        .toBe('PATCH');

      expect(request.request.body)
        .toEqual({});

      request.flush({
        success: true,
        message:
          'Rol del usuario actualizado correctamente',
        data: usuarioMock,
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe retornar el usuario con rol ADMIN', () => {
      const usuarioAdmin: Usuario = {
        ...usuarioMock,
        rol: {
          id: 3,
          nombre: 'ADMIN'
        }
      };

      let resultado: Usuario | undefined;

      service.cambiarRol(
        10,
        3
      ).subscribe({
        next: response => {
          resultado = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/10/rol?roleId=3`
        );

      request.flush({
        success: true,
        message:
          'Rol del usuario actualizado correctamente',
        data: usuarioAdmin,
        timestamp: '2026-07-12T12:00:00'
      });

      expect(resultado?.rol.id).toBe(3);
      expect(resultado?.rol.nombre)
        .toBe('ADMIN');
    });

    it('debe propagar un error por rol inexistente', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.cambiarRol(
        10,
        999
      ).subscribe({
        error: error => {
          errorRecibido = error;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/10/rol?roleId=999`
        );

      request.flush(
        {
          success: false,
          message: 'Rol no encontrado'
        },
        {
          status: 404,
          statusText: 'Not Found'
        }
      );

      expect(errorRecibido?.status)
        .toBe(404);

      expect(errorRecibido?.error.message)
        .toBe('Rol no encontrado');
    });

  });

  describe('Errores de red', () => {

    it('debe propagar un error de red al listar usuarios', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.listar().subscribe({
        error: error => {
          errorRecibido = error;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      const networkError =
        new ProgressEvent('Network error');

      request.error(networkError);

      expect(errorRecibido).toBeDefined();
      expect(errorRecibido?.status).toBe(0);
      expect(errorRecibido?.error)
        .toBe(networkError);
    });

  });

});