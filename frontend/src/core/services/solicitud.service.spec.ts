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
  ApiResponse,
  Sucursal
} from './sucursal.service';

import {
  CrearSolicitudRequest,
  SolicitudEnvio,
  SolicitudService
} from './solicitud.service';

describe('SolicitudService', () => {

  let service: SolicitudService;
  let httpTestingController: HttpTestingController;

  const apiUrl =
    `${environment.apiUrl}/solicitudes`;

  const sucursalOrigenMock: Sucursal = {
    id: 1,
    nombre: 'Sucursal San Antonio',
    direccion: 'Barros Luco 123',
    ciudad: 'San Antonio',
    telefono: '+56352223344',
    habilitada: true,
    fechaCreacion: '2026-07-01T10:00:00'
  };

  const sucursalDestinoMock: Sucursal = {
    id: 2,
    nombre: 'Sucursal Santiago',
    direccion: 'Alameda 456',
    ciudad: 'Santiago',
    telefono: '+56222223333',
    habilitada: true,
    fechaCreacion: '2026-07-02T11:00:00'
  };

  const solicitudMock: SolicitudEnvio = {
    id: 100,
    codigoSeguimiento: 'RAM-20260712-0001',
    estado: 'PENDIENTE_APROBACION',
    descripcion: 'Caja con productos tecnológicos',
    peso: 2.5,
    valorDeclarado: 45000,
    sucursalOrigen: sucursalOrigenMock,
    sucursalDestino: sucursalDestinoMock,
    destinatarioNombre: 'María González',
    destinatarioRutDni: '12345678-9',
    destinatarioTelefono: '+56955556666',
    fechaCreacion: '2026-07-12T10:00:00'
  };

  const segundaSolicitudMock: SolicitudEnvio = {
    id: 101,
    codigoSeguimiento: 'RAM-20260712-0002',
    estado: 'EN_TRANSITO',
    descripcion: 'Documentos',
    peso: 0.8,
    valorDeclarado: 10000,
    sucursalOrigen: sucursalOrigenMock,
    sucursalDestino: sucursalDestinoMock,
    destinatarioNombre: 'Pedro Soto',
    destinatarioRutDni: '98765432-1',
    destinatarioTelefono: '+56977778888',
    fechaCreacion: '2026-07-12T11:00:00'
  };

  const crearRequestMock: CrearSolicitudRequest = {
    usuarioId: 10,
    sucursalOrigenId: 1,
    sucursalDestinoId: 2,
    descripcion: 'Caja con productos tecnológicos',
    peso: 2.5,
    valorDeclarado: 45000,
    destinatarioNombre: 'María González',
    destinatarioRutDni: '12345678-9',
    destinatarioTelefono: '+56955556666'
  };

  beforeEach(() => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        SolicitudService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service =
      TestBed.inject(SolicitudService);

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

  describe('crear', () => {

    it('debe realizar una solicitud POST a /solicitudes', () => {
      service.crear(crearRequestMock)
        .subscribe();

      const request =
        httpTestingController.expectOne(apiUrl);

      expect(request.request.method)
        .toBe('POST');

      request.flush({
        success: true,
        message: 'Solicitud creada correctamente',
        data: solicitudMock,
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe enviar correctamente el cuerpo de la solicitud', () => {
      service.crear(crearRequestMock)
        .subscribe();

      const request =
        httpTestingController.expectOne(apiUrl);

      expect(request.request.body)
        .toEqual(crearRequestMock);

      expect(request.request.body.usuarioId)
        .toBe(10);

      expect(request.request.body.sucursalOrigenId)
        .toBe(1);

      expect(request.request.body.sucursalDestinoId)
        .toBe(2);

      expect(request.request.body.descripcion)
        .toBe('Caja con productos tecnológicos');

      expect(request.request.body.peso)
        .toBe(2.5);

      expect(request.request.body.valorDeclarado)
        .toBe(45000);

      request.flush({
        success: true,
        message: 'Solicitud creada correctamente',
        data: solicitudMock,
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe enviar los datos completos del destinatario', () => {
      service.crear(crearRequestMock)
        .subscribe();

      const request =
        httpTestingController.expectOne(apiUrl);

      expect(request.request.body.destinatarioNombre)
        .toBe('María González');

      expect(request.request.body.destinatarioRutDni)
        .toBe('12345678-9');

      expect(request.request.body.destinatarioTelefono)
        .toBe('+56955556666');

      request.flush({
        success: true,
        message: 'Solicitud creada correctamente',
        data: solicitudMock,
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe retornar la solicitud creada', () => {
      let resultado:
        SolicitudEnvio | undefined;

      service.crear(crearRequestMock)
        .subscribe({
          next: response => {
            resultado = response.data;
          }
        });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush({
        success: true,
        message: 'Solicitud creada correctamente',
        data: solicitudMock,
        timestamp: '2026-07-12T12:00:00'
      });

      expect(resultado)
        .toEqual(solicitudMock);

      expect(resultado?.id)
        .toBe(100);

      expect(resultado?.codigoSeguimiento)
        .toBe('RAM-20260712-0001');

      expect(resultado?.estado)
        .toBe('PENDIENTE_APROBACION');
    });

    it('debe retornar las sucursales de origen y destino', () => {
      let resultado:
        SolicitudEnvio | undefined;

      service.crear(crearRequestMock)
        .subscribe({
          next: response => {
            resultado = response.data;
          }
        });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush({
        success: true,
        message: 'Solicitud creada correctamente',
        data: solicitudMock,
        timestamp: '2026-07-12T12:00:00'
      });

      expect(resultado?.sucursalOrigen)
        .toEqual(sucursalOrigenMock);

      expect(resultado?.sucursalDestino)
        .toEqual(sucursalDestinoMock);

      expect(resultado?.sucursalOrigen.ciudad)
        .toBe('San Antonio');

      expect(resultado?.sucursalDestino.ciudad)
        .toBe('Santiago');
    });

    it('debe propagar un error 400 al crear', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.crear(crearRequestMock)
        .subscribe({
          error: error => {
            errorRecibido = error;
          }
        });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush(
        {
          success: false,
          message: 'Datos de solicitud inválidos'
        },
        {
          status: 400,
          statusText: 'Bad Request'
        }
      );

      expect(errorRecibido)
        .toBeDefined();

      expect(errorRecibido?.status)
        .toBe(400);

      expect(errorRecibido?.error.message)
        .toBe('Datos de solicitud inválidos');
    });

    it('debe propagar un error 404 al crear', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.crear(crearRequestMock)
        .subscribe({
          error: error => {
            errorRecibido = error;
          }
        });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush(
        {
          success: false,
          message: 'Sucursal no encontrada'
        },
        {
          status: 404,
          statusText: 'Not Found'
        }
      );

      expect(errorRecibido?.status)
        .toBe(404);

      expect(errorRecibido?.error.message)
        .toBe('Sucursal no encontrada');
    });

    it('debe propagar un error 500 al crear', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.crear(crearRequestMock)
        .subscribe({
          error: error => {
            errorRecibido = error;
          }
        });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush(
        {
          success: false,
          message: 'Error interno del servidor'
        },
        {
          status: 500,
          statusText: 'Internal Server Error'
        }
      );

      expect(errorRecibido?.status)
        .toBe(500);

      expect(errorRecibido?.error.message)
        .toBe('Error interno del servidor');
    });

  });

  describe('listar', () => {

    it('debe realizar una solicitud GET a /solicitudes', () => {
      service.listar().subscribe();

      const request =
        httpTestingController.expectOne(apiUrl);

      expect(request.request.method)
        .toBe('GET');

      expect(request.request.body)
        .toBeNull();

      request.flush({
        success: true,
        message: 'Solicitudes obtenidas correctamente',
        data: [],
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe retornar todas las solicitudes', () => {
      const responseMock:
        ApiResponse<SolicitudEnvio[]> = {
          success: true,
          message: 'Solicitudes obtenidas correctamente',
          data: [
            solicitudMock,
            segundaSolicitudMock
          ],
          timestamp: '2026-07-12T12:00:00'
        };

      let resultado:
        ApiResponse<SolicitudEnvio[]> | undefined;

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

      expect(resultado?.data[0].id)
        .toBe(100);

      expect(resultado?.data[1].id)
        .toBe(101);
    });

    it('debe conservar el orden recibido desde el backend', () => {
      let solicitudes:
        SolicitudEnvio[] | undefined;

      service.listar().subscribe({
        next: response => {
          solicitudes = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush({
        success: true,
        message: 'Solicitudes obtenidas correctamente',
        data: [
          solicitudMock,
          segundaSolicitudMock
        ],
        timestamp: '2026-07-12T12:00:00'
      });

      expect(solicitudes?.[0].codigoSeguimiento)
        .toBe('RAM-20260712-0001');

      expect(solicitudes?.[1].codigoSeguimiento)
        .toBe('RAM-20260712-0002');
    });

    it('debe retornar solicitudes con distintos estados', () => {
      let solicitudes:
        SolicitudEnvio[] | undefined;

      service.listar().subscribe({
        next: response => {
          solicitudes = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush({
        success: true,
        message: 'Solicitudes obtenidas correctamente',
        data: [
          solicitudMock,
          segundaSolicitudMock
        ],
        timestamp: '2026-07-12T12:00:00'
      });

      expect(solicitudes?.[0].estado)
        .toBe('PENDIENTE_APROBACION');

      expect(solicitudes?.[1].estado)
        .toBe('EN_TRANSITO');
    });

    it('debe retornar una lista vacía', () => {
      let solicitudes:
        SolicitudEnvio[] | undefined;

      service.listar().subscribe({
        next: response => {
          solicitudes = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush({
        success: true,
        message: 'Solicitudes obtenidas correctamente',
        data: [],
        timestamp: '2026-07-12T12:00:00'
      });

      expect(solicitudes)
        .toEqual([]);
    });

    it('debe propagar un error 500 al listar', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.listar().subscribe({
        error: error => {
          errorRecibido = error;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush(
        {
          success: false,
          message: 'Error interno del servidor'
        },
        {
          status: 500,
          statusText: 'Internal Server Error'
        }
      );

      expect(errorRecibido?.status)
        .toBe(500);

      expect(errorRecibido?.error.message)
        .toBe('Error interno del servidor');
    });

    it('debe propagar un error de red al listar', () => {
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

      expect(errorRecibido)
        .toBeDefined();

      expect(errorRecibido?.status)
        .toBe(0);

      expect(errorRecibido?.error)
        .toBe(networkError);
    });

  });

});