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
  Seguimiento,
  SeguimientoService
} from './seguimiento.service';

describe('SeguimientoService', () => {

  let service: SeguimientoService;
  let httpTestingController: HttpTestingController;

  const apiUrl =
    `${environment.apiUrl}/seguimientos`;

  const seguimientoCreado: Seguimiento = {
    id: 1,
    solicitudEnvioId: 100,
    codigoSeguimiento: 'RAM-20260712-0001',
    estado: 'CREADO',
    descripcion: 'Solicitud registrada correctamente',
    fechaEvento: '2026-07-12T09:00:00'
  };

  const seguimientoTransito: Seguimiento = {
    id: 2,
    solicitudEnvioId: 100,
    codigoSeguimiento: 'RAM-20260712-0001',
    estado: 'EN_TRANSITO',
    descripcion: 'El envío salió de la sucursal',
    fechaEvento: '2026-07-12T11:00:00'
  };

  beforeEach(() => {

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        SeguimientoService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service =
      TestBed.inject(SeguimientoService);

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

  describe('listarPorSolicitud', () => {

    it('debe realizar una solicitud GET', () => {

      service.listarPorSolicitud(100)
        .subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/solicitud/100`
        );

      expect(request.request.method)
        .toBe('GET');

      expect(request.request.body)
        .toBeNull();

      request.flush({
        success: true,
        message: 'Seguimientos obtenidos correctamente',
        data: [],
        timestamp: '2026-07-12T12:00:00'
      });

    });

    it('debe llamar a la URL correcta', () => {

      service.listarPorSolicitud(100)
        .subscribe();

      const request =
        httpTestingController.expectOne(
          `${environment.apiUrl}/seguimientos/solicitud/100`
        );

      expect(request.request.url)
        .toBe(
          `${environment.apiUrl}/seguimientos/solicitud/100`
        );

      request.flush({
        success: true,
        message: 'Seguimientos obtenidos correctamente',
        data: [],
        timestamp: '2026-07-12T12:00:00'
      });

    });

    it('debe retornar el historial completo', () => {

      let resultado:
        ApiResponse<Seguimiento[]> | undefined;

      service.listarPorSolicitud(100)
        .subscribe(response => {

          resultado = response;

        });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/solicitud/100`
        );

      request.flush({
        success: true,
        message: 'Seguimientos obtenidos correctamente',
        data: [
          seguimientoCreado,
          seguimientoTransito
        ],
        timestamp: '2026-07-12T12:00:00'
      });

      expect(resultado)
        .toBeDefined();

      expect(resultado?.data)
        .toHaveLength(2);

    });

    it('debe conservar el orden cronológico', () => {

      let eventos:
        Seguimiento[] | undefined;

      service.listarPorSolicitud(100)
        .subscribe(response => {

          eventos = response.data;

        });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/solicitud/100`
        );

      request.flush({
        success: true,
        message: 'Seguimientos obtenidos correctamente',
        data: [
          seguimientoCreado,
          seguimientoTransito
        ],
        timestamp: '2026-07-12T12:00:00'
      });

      expect(eventos?.[0].estado)
        .toBe('CREADO');

      expect(eventos?.[1].estado)
        .toBe('EN_TRANSITO');

    });

    it('debe retornar lista vacía', () => {

      let eventos:
        Seguimiento[] | undefined;

      service.listarPorSolicitud(100)
        .subscribe(response => {

          eventos = response.data;

        });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/solicitud/100`
        );

      request.flush({
        success: true,
        message: 'Sin eventos',
        data: [],
        timestamp: '2026-07-12T12:00:00'
      });

      expect(eventos)
        .toEqual([]);

    });

    it('debe retornar el código de seguimiento correcto', () => {

      let codigo:
        string | undefined;

      service.listarPorSolicitud(100)
        .subscribe(response => {

          codigo =
            response.data[0].codigoSeguimiento;

        });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/solicitud/100`
        );

      request.flush({
        success: true,
        message: 'Seguimientos obtenidos correctamente',
        data: [
          seguimientoCreado
        ],
        timestamp: '2026-07-12T12:00:00'
      });

      expect(codigo)
        .toBe('RAM-20260712-0001');

    });

    it('debe propagar un error 404', () => {

      let status:
        number | undefined;

      service.listarPorSolicitud(999)
        .subscribe({

          error: error => {

            status = error.status;

          }

        });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/solicitud/999`
        );

      request.flush(
        {
          success: false,
          message: 'Solicitud no encontrada'
        },
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

      service.listarPorSolicitud(100)
        .subscribe({

          error: error => {

            status = error.status;

          }

        });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/solicitud/100`
        );

      request.flush(
        {
          success: false,
          message: 'Error interno'
        },
        {
          status: 500,
          statusText: 'Internal Server Error'
        }
      );

      expect(status)
        .toBe(500);

    });

    it('debe propagar un error de red', () => {

      let error:
        HttpErrorResponse | undefined;

      service.listarPorSolicitud(100)
        .subscribe({

          error: e => {

            error = e;

          }

        });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/solicitud/100`
        );

      request.error(
        new ProgressEvent('Network Error')
      );

      expect(error)
        .toBeDefined();

      expect(error?.status)
        .toBe(0);

    });

  });

});