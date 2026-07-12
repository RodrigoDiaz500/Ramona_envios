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
  DashboardResponse,
  DashboardService
} from './dashboard.service';

describe('DashboardService', () => {

  let service: DashboardService;
  let httpTestingController: HttpTestingController;

  const apiUrl =
    `${environment.apiUrl}/dashboard`;

  const dashboardMock: DashboardResponse = {
    totalSolicitudes: 120,
    pendientes: 15,
    aprobadas: 20,
    enPreparacion: 18,
    enTransito: 25,
    entregadas: 35,
    rechazadas: 7,
    totalUsuarios: 48,
    totalSucursales: 6,
    incidenciasAbiertas: 4,
    promedioResenas: 4.6,
    ultimasSolicitudes: [
      {
        id: 1001,
        codigoSeguimiento: 'RAM-20260712-0001',
        estado: 'EN_TRANSITO',
        origen: 'San Antonio',
        destino: 'Santiago',
        destinatario: 'María González'
      },
      {
        id: 1002,
        codigoSeguimiento: 'RAM-20260712-0002',
        estado: 'PENDIENTE_APROBACION',
        origen: 'Cartagena',
        destino: 'Valparaíso',
        destinatario: 'Pedro Soto'
      }
    ]
  };

  beforeEach(() => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service =
      TestBed.inject(DashboardService);

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

  describe('obtenerResumen', () => {

    it('debe realizar una solicitud GET a /dashboard', () => {
      service.obtenerResumen().subscribe();

      const request =
        httpTestingController.expectOne(apiUrl);

      expect(request.request.method)
        .toBe('GET');

      expect(request.request.body)
        .toBeNull();

      request.flush({
        success: true,
        message:
          'Resumen del dashboard obtenido correctamente',
        data: dashboardMock,
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe utilizar la URL correcta', () => {
      service.obtenerResumen().subscribe();

      const request =
        httpTestingController.expectOne(
          `${environment.apiUrl}/dashboard`
        );

      expect(request.request.url)
        .toBe(`${environment.apiUrl}/dashboard`);

      request.flush({
        success: true,
        message:
          'Resumen del dashboard obtenido correctamente',
        data: dashboardMock,
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe retornar la respuesta completa del backend', () => {
      const responseMock:
        ApiResponse<DashboardResponse> = {
          success: true,
          message:
            'Resumen del dashboard obtenido correctamente',
          data: dashboardMock,
          timestamp: '2026-07-12T12:00:00'
        };

      let resultado:
        ApiResponse<DashboardResponse> | undefined;

      service.obtenerResumen().subscribe({
        next: response => {
          resultado = response;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush(responseMock);

      expect(resultado)
        .toEqual(responseMock);

      expect(resultado?.success)
        .toBe(true);

      expect(resultado?.message)
        .toBe(
          'Resumen del dashboard obtenido correctamente'
        );
    });

    it('debe retornar las métricas principales', () => {
      let resultado:
        DashboardResponse | undefined;

      service.obtenerResumen().subscribe({
        next: response => {
          resultado = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush({
        success: true,
        message:
          'Resumen del dashboard obtenido correctamente',
        data: dashboardMock,
        timestamp: '2026-07-12T12:00:00'
      });

      expect(resultado?.totalSolicitudes)
        .toBe(120);

      expect(resultado?.pendientes)
        .toBe(15);

      expect(resultado?.aprobadas)
        .toBe(20);

      expect(resultado?.enPreparacion)
        .toBe(18);

      expect(resultado?.enTransito)
        .toBe(25);

      expect(resultado?.entregadas)
        .toBe(35);

      expect(resultado?.rechazadas)
        .toBe(7);
    });

    it('debe retornar los totales de usuarios y sucursales', () => {
      let resultado:
        DashboardResponse | undefined;

      service.obtenerResumen().subscribe({
        next: response => {
          resultado = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush({
        success: true,
        message:
          'Resumen del dashboard obtenido correctamente',
        data: dashboardMock,
        timestamp: '2026-07-12T12:00:00'
      });

      expect(resultado?.totalUsuarios)
        .toBe(48);

      expect(resultado?.totalSucursales)
        .toBe(6);
    });

    it('debe retornar las incidencias y promedio de reseñas', () => {
      let resultado:
        DashboardResponse | undefined;

      service.obtenerResumen().subscribe({
        next: response => {
          resultado = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush({
        success: true,
        message:
          'Resumen del dashboard obtenido correctamente',
        data: dashboardMock,
        timestamp: '2026-07-12T12:00:00'
      });

      expect(resultado?.incidenciasAbiertas)
        .toBe(4);

      expect(resultado?.promedioResenas)
        .toBe(4.6);
    });

    it('debe retornar las últimas solicitudes', () => {
      let solicitudes:
        DashboardResponse['ultimasSolicitudes']
        | undefined;

      service.obtenerResumen().subscribe({
        next: response => {
          solicitudes =
            response.data.ultimasSolicitudes;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush({
        success: true,
        message:
          'Resumen del dashboard obtenido correctamente',
        data: dashboardMock,
        timestamp: '2026-07-12T12:00:00'
      });

      expect(solicitudes)
        .toHaveLength(2);

      expect(solicitudes?.[0].codigoSeguimiento)
        .toBe('RAM-20260712-0001');

      expect(solicitudes?.[0].estado)
        .toBe('EN_TRANSITO');

      expect(solicitudes?.[1].destino)
        .toBe('Valparaíso');
    });

    it('debe permitir una lista vacía de últimas solicitudes', () => {
      const dashboardSinSolicitudes:
        DashboardResponse = {
          ...dashboardMock,
          ultimasSolicitudes: []
        };

      let solicitudes:
        DashboardResponse['ultimasSolicitudes']
        | undefined;

      service.obtenerResumen().subscribe({
        next: response => {
          solicitudes =
            response.data.ultimasSolicitudes;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush({
        success: true,
        message:
          'Resumen del dashboard obtenido correctamente',
        data: dashboardSinSolicitudes,
        timestamp: '2026-07-12T12:00:00'
      });

      expect(solicitudes)
        .toEqual([]);
    });

    it('debe permitir métricas con valor cero', () => {
      const dashboardVacio:
        DashboardResponse = {
          totalSolicitudes: 0,
          pendientes: 0,
          aprobadas: 0,
          enPreparacion: 0,
          enTransito: 0,
          entregadas: 0,
          rechazadas: 0,
          totalUsuarios: 0,
          totalSucursales: 0,
          incidenciasAbiertas: 0,
          promedioResenas: 0,
          ultimasSolicitudes: []
        };

      let resultado:
        DashboardResponse | undefined;

      service.obtenerResumen().subscribe({
        next: response => {
          resultado = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush({
        success: true,
        message:
          'Resumen del dashboard obtenido correctamente',
        data: dashboardVacio,
        timestamp: '2026-07-12T12:00:00'
      });

      expect(resultado?.totalSolicitudes)
        .toBe(0);

      expect(resultado?.incidenciasAbiertas)
        .toBe(0);

      expect(resultado?.promedioResenas)
        .toBe(0);

      expect(resultado?.ultimasSolicitudes)
        .toEqual([]);
    });

    it('debe propagar un error 401', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.obtenerResumen().subscribe({
        error: error => {
          errorRecibido = error;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush(
        {
          success: false,
          message: 'Usuario no autenticado'
        },
        {
          status: 401,
          statusText: 'Unauthorized'
        }
      );

      expect(errorRecibido?.status)
        .toBe(401);

      expect(errorRecibido?.error.message)
        .toBe('Usuario no autenticado');
    });

    it('debe propagar un error 403', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.obtenerResumen().subscribe({
        error: error => {
          errorRecibido = error;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush(
        {
          success: false,
          message: 'Acceso denegado'
        },
        {
          status: 403,
          statusText: 'Forbidden'
        }
      );

      expect(errorRecibido?.status)
        .toBe(403);

      expect(errorRecibido?.error.message)
        .toBe('Acceso denegado');
    });

    it('debe propagar un error 500', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.obtenerResumen().subscribe({
        error: error => {
          errorRecibido = error;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

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

      expect(errorRecibido?.error.message)
        .toBe(
          'Error interno del servidor'
        );
    });

    it('debe propagar un error de red', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.obtenerResumen().subscribe({
        error: error => {
          errorRecibido = error;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      const networkError =
        new ProgressEvent('Network Error');

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