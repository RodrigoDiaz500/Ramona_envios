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
  Sucursal,
  SucursalRequest,
  SucursalService
} from './sucursal.service';

describe('SucursalService', () => {

  let service: SucursalService;
  let httpTestingController: HttpTestingController;

  const apiUrl =
    `${environment.apiUrl}/sucursales`;

  const sucursalMock: Sucursal = {
    id: 1,
    nombre: 'Sucursal San Antonio',
    direccion: 'Barros Luco 123',
    ciudad: 'San Antonio',
    telefono: '+56352223344',
    habilitada: true,
    fechaCreacion: '2026-07-01T10:00:00'
  };

  const segundaSucursalMock: Sucursal = {
    id: 2,
    nombre: 'Sucursal Santiago',
    direccion: 'Alameda 456',
    ciudad: 'Santiago',
    telefono: '+56222223333',
    habilitada: true,
    fechaCreacion: '2026-07-02T11:00:00'
  };

  const requestMock: SucursalRequest = {
    nombre: 'Sucursal Cartagena',
    direccion: 'Avenida Cartagena 100',
    ciudad: 'Cartagena',
    telefono: '+56352445566'
  };

  beforeEach(() => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        SucursalService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service =
      TestBed.inject(SucursalService);

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

    it('debe realizar una solicitud GET a /sucursales', () => {
      service.listar().subscribe();

      const request =
        httpTestingController.expectOne(apiUrl);

      expect(request.request.method)
        .toBe('GET');

      expect(request.request.body)
        .toBeNull();

      request.flush({
        success: true,
        message: 'Sucursales obtenidas correctamente',
        data: [],
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe retornar todas las sucursales', () => {
      const responseMock: ApiResponse<Sucursal[]> = {
        success: true,
        message: 'Sucursales obtenidas correctamente',
        data: [
          sucursalMock,
          segundaSucursalMock
        ],
        timestamp: '2026-07-12T12:00:00'
      };

      let resultado:
        ApiResponse<Sucursal[]> | undefined;

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
        .toBe('Sucursal San Antonio');

      expect(resultado?.data[1].ciudad)
        .toBe('Santiago');
    });

    it('debe retornar una lista vacía', () => {
      let sucursales:
        Sucursal[] | undefined;

      service.listar().subscribe({
        next: response => {
          sucursales = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush({
        success: true,
        message: 'Sucursales obtenidas correctamente',
        data: [],
        timestamp: '2026-07-12T12:00:00'
      });

      expect(sucursales)
        .toEqual([]);
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

  describe('crear', () => {

    it('debe realizar una solicitud POST', () => {
      service.crear(requestMock)
        .subscribe();

      const request =
        httpTestingController.expectOne(apiUrl);

      expect(request.request.method)
        .toBe('POST');

      request.flush({
        success: true,
        message: 'Sucursal creada correctamente',
        data: sucursalMock,
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe enviar correctamente el cuerpo de creación', () => {
      service.crear(requestMock)
        .subscribe();

      const request =
        httpTestingController.expectOne(apiUrl);

      expect(request.request.body)
        .toEqual(requestMock);

      expect(request.request.body.nombre)
        .toBe('Sucursal Cartagena');

      expect(request.request.body.ciudad)
        .toBe('Cartagena');

      expect(request.request.body.telefono)
        .toBe('+56352445566');

      request.flush({
        success: true,
        message: 'Sucursal creada correctamente',
        data: sucursalMock,
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe retornar la sucursal creada', () => {
      const sucursalCreada: Sucursal = {
        id: 3,
        ...requestMock,
        habilitada: true,
        fechaCreacion: '2026-07-12T12:00:00'
      };

      let resultado:
        Sucursal | undefined;

      service.crear(requestMock)
        .subscribe({
          next: response => {
            resultado = response.data;
          }
        });

      const request =
        httpTestingController.expectOne(apiUrl);

      request.flush({
        success: true,
        message: 'Sucursal creada correctamente',
        data: sucursalCreada,
        timestamp: '2026-07-12T12:00:00'
      });

      expect(resultado)
        .toEqual(sucursalCreada);

      expect(resultado?.id)
        .toBe(3);

      expect(resultado?.habilitada)
        .toBe(true);
    });

    it('debe propagar un error 400 al crear', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.crear(requestMock)
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
          message: 'Datos de sucursal inválidos'
        },
        {
          status: 400,
          statusText: 'Bad Request'
        }
      );

      expect(errorRecibido?.status)
        .toBe(400);

      expect(errorRecibido?.error.message)
        .toBe('Datos de sucursal inválidos');
    });

  });

  describe('actualizar', () => {

    it('debe realizar una solicitud PUT con el ID correcto', () => {
      service.actualizar(
        1,
        requestMock
      ).subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1`
        );

      expect(request.request.method)
        .toBe('PUT');

      request.flush({
        success: true,
        message: 'Sucursal actualizada correctamente',
        data: sucursalMock,
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe enviar el cuerpo de actualización completo', () => {
      service.actualizar(
        1,
        requestMock
      ).subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1`
        );

      expect(request.request.body)
        .toEqual(requestMock);

      expect(request.request.body.direccion)
        .toBe('Avenida Cartagena 100');

      request.flush({
        success: true,
        message: 'Sucursal actualizada correctamente',
        data: sucursalMock,
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe retornar la sucursal actualizada', () => {
      const sucursalActualizada: Sucursal = {
        ...sucursalMock,
        nombre: requestMock.nombre,
        direccion: requestMock.direccion,
        ciudad: requestMock.ciudad,
        telefono: requestMock.telefono
      };

      let resultado:
        Sucursal | undefined;

      service.actualizar(
        1,
        requestMock
      ).subscribe({
        next: response => {
          resultado = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1`
        );

      request.flush({
        success: true,
        message: 'Sucursal actualizada correctamente',
        data: sucursalActualizada,
        timestamp: '2026-07-12T12:00:00'
      });

      expect(resultado)
        .toEqual(sucursalActualizada);

      expect(resultado?.nombre)
        .toBe('Sucursal Cartagena');

      expect(resultado?.ciudad)
        .toBe('Cartagena');
    });

    it('debe propagar un error 404 al actualizar', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.actualizar(
        999,
        requestMock
      ).subscribe({
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

  });

  describe('cambiarEstado', () => {

    it('debe habilitar una sucursal mediante PATCH', () => {
      service.cambiarEstado(
        1,
        true
      ).subscribe();

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1/habilitada?habilitada=true`
        );

      expect(request.request.method)
        .toBe('PATCH');

      expect(request.request.body)
        .toEqual({});

      request.flush({
        success: true,
        message:
          'Estado de la sucursal actualizado correctamente',
        data: sucursalMock,
        timestamp: '2026-07-12T12:00:00'
      });
    });

    it('debe deshabilitar una sucursal mediante PATCH', () => {
      const sucursalDeshabilitada: Sucursal = {
        ...sucursalMock,
        habilitada: false
      };

      let resultado:
        Sucursal | undefined;

      service.cambiarEstado(
        1,
        false
      ).subscribe({
        next: response => {
          resultado = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1/habilitada?habilitada=false`
        );

      expect(request.request.method)
        .toBe('PATCH');

      expect(request.request.body)
        .toEqual({});

      request.flush({
        success: true,
        message:
          'Estado de la sucursal actualizado correctamente',
        data: sucursalDeshabilitada,
        timestamp: '2026-07-12T12:00:00'
      });

      expect(resultado?.habilitada)
        .toBe(false);
    });

    it('debe retornar la sucursal habilitada', () => {
      const sucursalHabilitada: Sucursal = {
        ...sucursalMock,
        habilitada: true
      };

      let resultado:
        Sucursal | undefined;

      service.cambiarEstado(
        1,
        true
      ).subscribe({
        next: response => {
          resultado = response.data;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1/habilitada?habilitada=true`
        );

      request.flush({
        success: true,
        message:
          'Estado de la sucursal actualizado correctamente',
        data: sucursalHabilitada,
        timestamp: '2026-07-12T12:00:00'
      });

      expect(resultado?.habilitada)
        .toBe(true);
    });

    it('debe propagar un error 404 al cambiar estado', () => {
      let status:
        number | undefined;

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
          `${apiUrl}/999/habilitada?habilitada=false`
        );

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

      expect(status)
        .toBe(404);
    });

    it('debe propagar un error 500 al cambiar estado', () => {
      let errorRecibido:
        HttpErrorResponse | undefined;

      service.cambiarEstado(
        1,
        false
      ).subscribe({
        error: error => {
          errorRecibido = error;
        }
      });

      const request =
        httpTestingController.expectOne(
          `${apiUrl}/1/habilitada?habilitada=false`
        );

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

});