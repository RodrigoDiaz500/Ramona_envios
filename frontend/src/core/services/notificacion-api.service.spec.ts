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
  Notificacion,
  NotificacionApiService
} from './notificacion-api.service';

describe('NotificacionApiService', () => {

  let service: NotificacionApiService;
  let httpTestingController: HttpTestingController;

  const apiUrl =
    `${environment.apiUrl}/notificaciones`;

  const notificacionMock: Notificacion = {
    id: 1,
    titulo: 'Estado actualizado',
    mensaje: 'Tu envío ya se encuentra en tránsito.',
    leida: false,
    fechaCreacion: '2026-07-12T10:00:00'
  };

  const segundaNotificacionMock: Notificacion = {
    id: 2,
    titulo: 'Envío entregado',
    mensaje: 'El envío fue entregado correctamente.',
    leida: true,
    fechaCreacion: '2026-07-12T12:00:00'
  };

  beforeEach(() => {

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        NotificacionApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service =
      TestBed.inject(NotificacionApiService);

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

  describe('listarPorUsuario', () => {

    it('debe realizar una solicitud GET', () => {

      service.listarPorUsuario(10)
        .subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/usuario/10`
        );

      expect(request.request.method)
        .toBe('GET');

      expect(request.request.body)
        .toBeNull();

      request.flush({
        success: true,
        message: 'Notificaciones obtenidas correctamente',
        data: [],
        timestamp: '2026-07-12T12:00:00'
      });

    });

    it('debe retornar todas las notificaciones', () => {

      const responseMock:
        ApiResponse<Notificacion[]> = {

        success: true,
        message: 'Notificaciones obtenidas correctamente',
        data: [
          notificacionMock,
          segundaNotificacionMock
        ],
        timestamp: '2026-07-12T12:00:00'

      };

      let resultado:
        ApiResponse<Notificacion[]> | undefined;

      service.listarPorUsuario(10)
        .subscribe(response => {

          resultado = response;

        });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/usuario/10`
        );

      request.flush(responseMock);

      expect(resultado)
        .toEqual(responseMock);

      expect(resultado?.data)
        .toHaveLength(2);

    });

    it('debe retornar lista vacía', () => {

      let notificaciones:
        Notificacion[] | undefined;

      service.listarPorUsuario(10)
        .subscribe(response => {

          notificaciones =
            response.data;

        });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/usuario/10`
        );

      request.flush({
        success: true,
        message: 'Sin notificaciones',
        data: [],
        timestamp: '2026-07-12T12:00:00'
      });

      expect(notificaciones)
        .toEqual([]);

    });

    it('debe conservar el estado leído', () => {

      let notificaciones:
        Notificacion[] | undefined;

      service.listarPorUsuario(10)
        .subscribe(response => {

          notificaciones =
            response.data;

        });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/usuario/10`
        );

      request.flush({
        success: true,
        message: 'OK',
        data: [
          notificacionMock,
          segundaNotificacionMock
        ],
        timestamp: '2026-07-12T12:00:00'
      });

      expect(notificaciones?.[0].leida)
        .toBe(false);

      expect(notificaciones?.[1].leida)
        .toBe(true);

    });

    it('debe propagar un error 404', () => {

      let status:
        number | undefined;

      service.listarPorUsuario(999)
        .subscribe({

          error: error => {

            status = error.status;

          }

        });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/usuario/999`
        );

      request.flush(
        {},
        {
          status: 404,
          statusText: 'Not Found'
        }
      );

      expect(status)
        .toBe(404);

    });

    it('debe propagar un error de red', () => {

      let error:
        HttpErrorResponse | undefined;

      service.listarPorUsuario(10)
        .subscribe({

          error: e => {

            error = e;

          }

        });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/usuario/10`
        );

      request.error(
        new ProgressEvent('Network Error')
      );

      expect(error?.status)
        .toBe(0);

    });

  });

  describe('marcarComoLeida', () => {

    it('debe realizar una solicitud PATCH', () => {

      service.marcarComoLeida(1)
        .subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1/leida`
        );

      expect(request.request.method)
        .toBe('PATCH');

      expect(request.request.body)
        .toEqual({});

      request.flush({
        success: true,
        message: 'Notificación actualizada',
        data: {
          ...notificacionMock,
          leida: true
        },
        timestamp: '2026-07-12T12:00:00'
      });

    });

    it('debe retornar la notificación marcada como leída', () => {

      let resultado:
        Notificacion | undefined;

      service.marcarComoLeida(1)
        .subscribe(response => {

          resultado =
            response.data;

        });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1/leida`
        );

      request.flush({
        success: true,
        message: 'Notificación actualizada',
        data: {
          ...notificacionMock,
          leida: true
        },
        timestamp: '2026-07-12T12:00:00'
      });

      expect(resultado?.leida)
        .toBe(true);

    });

    it('debe propagar un error 404', () => {

      let status:
        number | undefined;

      service.marcarComoLeida(999)
        .subscribe({

          error: error => {

            status =
              error.status;

          }

        });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/999/leida`
        );

      request.flush(
        {},
        {
          status: 404,
          statusText: 'Not Found'
        }
      );

      expect(status)
        .toBe(404);

    });

    it('debe propagar un error 500', () => {

      let status:
        number | undefined;

      service.marcarComoLeida(1)
        .subscribe({

          error: error => {

            status =
              error.status;

          }

        });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1/leida`
        );

      request.flush(
        {},
        {
          status: 500,
          statusText:
            'Internal Server Error'
        }
      );

      expect(status)
        .toBe(500);

    });

    it('debe propagar un error de red', () => {

      let error:
        HttpErrorResponse | undefined;

      service.marcarComoLeida(1)
        .subscribe({

          error: e => {

            error = e;

          }

        });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1/leida`
        );

      request.error(
        new ProgressEvent('Network Error')
      );

      expect(error?.status)
        .toBe(0);

    });

  });

});