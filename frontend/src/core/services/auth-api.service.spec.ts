import {
  provideHttpClient,
  HttpErrorResponse
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
  Usuario
} from './usuario.service';

import {
  AuthApiService
} from './auth-api.service';

describe('AuthApiService', () => {

  let service: AuthApiService;
  let httpTestingController: HttpTestingController;

  const apiUrl =
    `${environment.apiUrl}/auth`;

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
    fechaCreacion:
      '2026-07-01T10:00:00',
    fechaActualizacion:
      '2026-07-12T10:30:00'
  };

  const respuestaMock:
    ApiResponse<Usuario> = {
      success: true,
      message:
        'Usuario autenticado correctamente',
      data: usuarioMock,
      timestamp:
        '2026-07-12T10:30:00'
    };

  beforeEach(() => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        AuthApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service =
      TestBed.inject(AuthApiService);

    httpTestingController =
      TestBed.inject(
        HttpTestingController
      );
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Creación del servicio', () => {

    it('debe crearse correctamente', () => {
      expect(service).toBeTruthy();
    });

  });

  describe('me', () => {

    it('debe realizar una solicitud GET a /auth/me', () => {
      service.me().subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/me`
        );

      expect(request.request.method)
        .toBe('GET');

      request.flush(respuestaMock);
    });

    it('debe llamar a la URL correcta', () => {
      service.me().subscribe();

      const request =
        httpTestingController.expectOne(
          `${environment.apiUrl}/auth/me`
        );

      expect(request.request.url)
        .toBe(
          `${environment.apiUrl}/auth/me`
        );

      request.flush(respuestaMock);
    });

    it('no debe enviar cuerpo en la solicitud GET', () => {
      service.me().subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/me`
        );

      expect(request.request.body)
        .toBeNull();

      request.flush(respuestaMock);
    });

    it('debe retornar la respuesta completa del backend', () => {
      let resultado:
        ApiResponse<Usuario> | undefined;

      service.me().subscribe({
        next: response => {
          resultado = response;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/me`
        );

      request.flush(respuestaMock);

      expect(resultado)
        .toEqual(respuestaMock);
    });

    it('debe retornar success true', () => {
      let success: boolean | undefined;

      service.me().subscribe({
        next: response => {
          success = response.success;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/me`
        );

      request.flush(respuestaMock);

      expect(success).toBe(true);
    });

    it('debe retornar el mensaje del backend', () => {
      let message: string | undefined;

      service.me().subscribe({
        next: response => {
          message = response.message;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/me`
        );

      request.flush(respuestaMock);

      expect(message).toBe(
        'Usuario autenticado correctamente'
      );
    });

    it('debe retornar los datos del usuario autenticado', () => {
      let usuario: Usuario | undefined;

      service.me().subscribe({
        next: response => {
          usuario = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/me`
        );

      request.flush(respuestaMock);

      expect(usuario).toEqual(usuarioMock);
    });

    it('debe retornar el ID correcto del usuario', () => {
      let usuarioId: number | undefined;

      service.me().subscribe({
        next: response => {
          usuarioId = response.data.id;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/me`
        );

      request.flush(respuestaMock);

      expect(usuarioId).toBe(10);
    });

    it('debe retornar el correo correcto', () => {
      let correo: string | undefined;

      service.me().subscribe({
        next: response => {
          correo = response.data.correo;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/me`
        );

      request.flush(respuestaMock);

      expect(correo)
        .toBe('rodrigo@ramona.cl');
    });

    it('debe retornar el rol del usuario', () => {
      let rol: string | undefined;

      service.me().subscribe({
        next: response => {
          rol = response.data.rol.nombre;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/me`
        );

      request.flush(respuestaMock);

      expect(rol).toBe('CLIENTE');
    });

    it('debe retornar el estado activo del usuario', () => {
      let activo: boolean | undefined;

      service.me().subscribe({
        next: response => {
          activo = response.data.activo;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/me`
        );

      request.flush(respuestaMock);

      expect(activo).toBe(true);
    });

    it('debe retornar el timestamp de la respuesta', () => {
      let timestamp: string | undefined;

      service.me().subscribe({
        next: response => {
          timestamp = response.timestamp;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/me`
        );

      request.flush(respuestaMock);

      expect(timestamp)
        .toBe('2026-07-12T10:30:00');
    });

  });

  describe('Errores HTTP', () => {

    it('debe propagar un error 401', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.me().subscribe({
        next: () => {
          throw new Error(
            'La solicitud no debía ser exitosa'
          );
        },
        error: error => {
          errorRecibido = error;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/me`
        );

      request.flush(
        {
          success: false,
          message:
            'Usuario no autenticado',
          data: null,
          timestamp:
            '2026-07-12T10:30:00'
        },
        {
          status: 401,
          statusText: 'Unauthorized'
        }
      );

      expect(errorRecibido)
        .toBeDefined();

      expect(errorRecibido?.status)
        .toBe(401);

      expect(
        errorRecibido?.error.message
      ).toBe('Usuario no autenticado');
    });

    it('debe propagar un error 403 para usuario deshabilitado', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.me().subscribe({
        error: error => {
          errorRecibido = error;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/me`
        );

      request.flush(
        {
          success: false,
          message:
            'Tu usuario se encuentra deshabilitado',
          data: null,
          timestamp:
            '2026-07-12T10:30:00'
        },
        {
          status: 403,
          statusText: 'Forbidden'
        }
      );

      expect(errorRecibido?.status)
        .toBe(403);

      expect(
        errorRecibido?.error.message
      ).toBe(
        'Tu usuario se encuentra deshabilitado'
      );
    });

    it('debe propagar un error 404', () => {
      let status: number | undefined;

      service.me().subscribe({
        error: error => {
          status = error.status;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/me`
        );

      request.flush(
        {
          success: false,
          message:
            'Usuario no encontrado'
        },
        {
          status: 404,
          statusText: 'Not Found'
        }
      );

      expect(status).toBe(404);
    });

    it('debe propagar un error 500', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.me().subscribe({
        error: error => {
          errorRecibido = error;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/me`
        );

      request.flush(
        {
          success: false,
          message:
            'Error interno del servidor'
        },
        {
          status: 500,
          statusText:
            'Internal Server Error'
        }
      );

      expect(errorRecibido?.status)
        .toBe(500);

      expect(
        errorRecibido?.error.message
      ).toBe(
        'Error interno del servidor'
      );
    });

    it('debe propagar un error de red', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.me().subscribe({
        error: error => {
          errorRecibido = error;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/me`
        );

      const networkError =
        new ProgressEvent(
          'Network error'
        );

      request.error(networkError);

      expect(errorRecibido)
        .toBeDefined();

      expect(errorRecibido?.status)
        .toBe(0);

      expect(errorRecibido?.error)
        .toBe(networkError);
    });

  });

});