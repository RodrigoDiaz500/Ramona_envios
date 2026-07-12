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
  ActualizarEstadoIncidenciaRequest,
  Incidencia,
  IncidenciaRequest,
  IncidenciaService
} from './incidencia.service';

describe('IncidenciaService', () => {

  let service: IncidenciaService;
  let httpTestingController: HttpTestingController;

  const apiUrl =
    `${environment.apiUrl}/incidencias`;

  const incidenciaMock: Incidencia = {
    id: 1,
    solicitudEnvioId: 100,
    codigoSeguimiento: 'RAM-20260712-0001',
    titulo: 'Paquete dañado',
    descripcion: 'La caja llegó con una esquina dañada',
    estado: 'ABIERTA',
    fechaCreacion: '2026-07-12T10:00:00',
    fechaActualizacion: '2026-07-12T10:00:00'
  };

  const segundaIncidenciaMock: Incidencia = {
    id: 2,
    solicitudEnvioId: 101,
    codigoSeguimiento: 'RAM-20260712-0002',
    titulo: 'Retraso en la entrega',
    descripcion: 'El envío aún no llega a destino',
    estado: 'EN_PROCESO',
    fechaCreacion: '2026-07-12T11:00:00',
    fechaActualizacion: '2026-07-12T12:00:00'
  };

  const crearRequestMock: IncidenciaRequest = {
    solicitudEnvioId: 100,
    titulo: 'Paquete dañado',
    descripcion: 'La caja llegó con una esquina dañada',
    creadaPorId: 10,
    asignadaAId: 20
  };

  const actualizarRequestMock:
    ActualizarEstadoIncidenciaRequest = {
      estado: 'EN_PROCESO',
      asignadaAId: 20
    };

  beforeEach(() => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        IncidenciaService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service =
      TestBed.inject(IncidenciaService);

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

    it('debe realizar una solicitud GET a /incidencias', () => {
      service.listar().subscribe();

      const request =
        httpTestingController.expectOne(apiUrl);

      expect(request.request.method)
        .toBe('GET');

      expect(request.request.body)
        .toBeNull();

      request.flush({
        success: true,
        message: 'Incidencias obtenidas correctamente',
        data: [],
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe retornar todas las incidencias', () => {
      const responseMock:
        ApiResponse<Incidencia[]> = {
          success: true,
          message:
            'Incidencias obtenidas correctamente',
          data: [
            incidenciaMock,
            segundaIncidenciaMock
          ],
          timestamp: '2026-07-12T12:00:00'
        };

      let resultado:
        ApiResponse<Incidencia[]> | undefined;

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

      expect(resultado?.data[0].estado)
        .toBe('ABIERTA');

      expect(resultado?.data[1].estado)
        .toBe('EN_PROCESO');
    });

    it('debe retornar una lista vacía', () => {
      let incidencias:
        Incidencia[] | undefined;

      service.listar().subscribe({
        next: response => {
          incidencias = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush({
        success: true,
        message: 'Incidencias obtenidas correctamente',
        data: [],
        timestamp: '2026-07-12T12:00:00'
      });

      expect(incidencias)
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

  describe('crear', () => {

    it('debe realizar una solicitud POST', () => {
      service.crear(crearRequestMock)
        .subscribe();

      const request =
        httpTestingController.expectOne(apiUrl);

      expect(request.request.method)
        .toBe('POST');

      request.flush({
        success: true,
        message: 'Incidencia creada correctamente',
        data: incidenciaMock,
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe enviar correctamente el cuerpo de creación', () => {
      service.crear(crearRequestMock)
        .subscribe();

      const request =
        httpTestingController.expectOne(apiUrl);

      expect(request.request.body)
        .toEqual(crearRequestMock);

      expect(request.request.body.solicitudEnvioId)
        .toBe(100);

      expect(request.request.body.titulo)
        .toBe('Paquete dañado');

      expect(request.request.body.creadaPorId)
        .toBe(10);

      expect(request.request.body.asignadaAId)
        .toBe(20);

      request.flush({
        success: true,
        message: 'Incidencia creada correctamente',
        data: incidenciaMock,
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe permitir crear sin usuario asignado', () => {
      const requestSinAsignado:
        IncidenciaRequest = {
          solicitudEnvioId: 100,
          titulo: 'Retraso',
          descripcion:
            'El envío aún no llega a destino',
          creadaPorId: 10,
          asignadaAId: null
        };

      service.crear(requestSinAsignado)
        .subscribe();

      const request =
        httpTestingController.expectOne(apiUrl);

      expect(request.request.body.asignadaAId)
        .toBeNull();

      request.flush({
        success: true,
        message: 'Incidencia creada correctamente',
        data: {
          ...incidenciaMock,
          titulo: 'Retraso'
        },
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe retornar la incidencia creada', () => {
      let resultado:
        Incidencia | undefined;

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
        message: 'Incidencia creada correctamente',
        data: incidenciaMock,
        timestamp: '2026-07-12T12:00:00'
      });

      expect(resultado)
        .toEqual(incidenciaMock);

      expect(resultado?.id)
        .toBe(1);

      expect(resultado?.codigoSeguimiento)
        .toBe('RAM-20260712-0001');

      expect(resultado?.estado)
        .toBe('ABIERTA');
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
          message: 'Datos de incidencia inválidos'
        },
        {
          status: 400,
          statusText: 'Bad Request'
        }
      );

      expect(errorRecibido?.status)
        .toBe(400);

      expect(errorRecibido?.error.message)
        .toBe('Datos de incidencia inválidos');
    });

    it('debe propagar un error 404 al crear', () => {
      let status:
        number | undefined;

      service.crear(crearRequestMock)
        .subscribe({
          error: error => {
            status = error.status;
          }
        });

      const request =
        httpTestingController.expectOne(apiUrl);

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

      expect(status).toBe(404);
    });

  });

  describe('actualizarEstado', () => {

    it('debe realizar una solicitud PATCH', () => {
      service.actualizarEstado(
        1,
        actualizarRequestMock
      ).subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1/estado`
        );

      expect(request.request.method)
        .toBe('PATCH');

      request.flush({
        success: true,
        message:
          'Estado de incidencia actualizado correctamente',
        data: {
          ...incidenciaMock,
          estado: 'EN_PROCESO'
        },
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe enviar el estado y responsable correctos', () => {
      service.actualizarEstado(
        1,
        actualizarRequestMock
      ).subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1/estado`
        );

      expect(request.request.body)
        .toEqual(actualizarRequestMock);

      expect(request.request.body.estado)
        .toBe('EN_PROCESO');

      expect(request.request.body.asignadaAId)
        .toBe(20);

      request.flush({
        success: true,
        message:
          'Estado de incidencia actualizado correctamente',
        data: {
          ...incidenciaMock,
          estado: 'EN_PROCESO'
        },
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe permitir actualizar sin cambiar responsable', () => {
      const requestSinAsignado:
        ActualizarEstadoIncidenciaRequest = {
          estado: 'RESUELTA',
          asignadaAId: null
        };

      service.actualizarEstado(
        1,
        requestSinAsignado
      ).subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1/estado`
        );

      expect(request.request.body.estado)
        .toBe('RESUELTA');

      expect(request.request.body.asignadaAId)
        .toBeNull();

      request.flush({
        success: true,
        message:
          'Estado de incidencia actualizado correctamente',
        data: {
          ...incidenciaMock,
          estado: 'RESUELTA'
        },
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe retornar la incidencia actualizada', () => {
      const incidenciaActualizada:
        Incidencia = {
          ...incidenciaMock,
          estado: 'EN_PROCESO',
          fechaActualizacion:
            '2026-07-12T13:00:00'
        };

      let resultado:
        Incidencia | undefined;

      service.actualizarEstado(
        1,
        actualizarRequestMock
      ).subscribe({
        next: response => {
          resultado = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1/estado`
        );

      request.flush({
        success: true,
        message:
          'Estado de incidencia actualizado correctamente',
        data: incidenciaActualizada,
        timestamp: '2026-07-12T13:00:00'
      });

      expect(resultado)
        .toEqual(incidenciaActualizada);

      expect(resultado?.estado)
        .toBe('EN_PROCESO');

      expect(resultado?.fechaActualizacion)
        .toBe('2026-07-12T13:00:00');
    });

    it('debe aceptar el estado RESUELTA', () => {
      const requestResuelta:
        ActualizarEstadoIncidenciaRequest = {
          estado: 'RESUELTA',
          asignadaAId: 20
        };

      service.actualizarEstado(
        1,
        requestResuelta
      ).subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1/estado`
        );

      expect(request.request.body.estado)
        .toBe('RESUELTA');

      request.flush({
        success: true,
        message:
          'Estado de incidencia actualizado correctamente',
        data: {
          ...incidenciaMock,
          estado: 'RESUELTA'
        },
        timestamp: '2026-07-12T13:00:00'
      });
    });

    it('debe aceptar el estado CERRADA', () => {
      const requestCerrada:
        ActualizarEstadoIncidenciaRequest = {
          estado: 'CERRADA',
          asignadaAId: 20
        };

      service.actualizarEstado(
        1,
        requestCerrada
      ).subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1/estado`
        );

      expect(request.request.body.estado)
        .toBe('CERRADA');

      request.flush({
        success: true,
        message:
          'Estado de incidencia actualizado correctamente',
        data: {
          ...incidenciaMock,
          estado: 'CERRADA'
        },
        timestamp: '2026-07-12T13:00:00'
      });
    });

    it('debe propagar un error 404 al actualizar', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.actualizarEstado(
        999,
        actualizarRequestMock
      ).subscribe({
        error: error => {
          errorRecibido = error;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/999/estado`
        );

      request.flush(
        {
          success: false,
          message: 'Incidencia no encontrada'
        },
        {
          status: 404,
          statusText: 'Not Found'
        }
      );

      expect(errorRecibido?.status)
        .toBe(404);

      expect(errorRecibido?.error.message)
        .toBe('Incidencia no encontrada');
    });

    it('debe propagar un error 400 por estado inválido', () => {
      let status:
        number | undefined;

      service.actualizarEstado(
        1,
        {
          estado: 'ESTADO_INVALIDO'
        }
      ).subscribe({
        error: error => {
          status = error.status;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1/estado`
        );

      request.flush(
        {
          success: false,
          message: 'Estado inválido'
        },
        {
          status: 400,
          statusText: 'Bad Request'
        }
      );

      expect(status).toBe(400);
    });

    it('debe propagar un error de red al actualizar', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.actualizarEstado(
        1,
        actualizarRequestMock
      ).subscribe({
        error: error => {
          errorRecibido = error;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1/estado`
        );

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