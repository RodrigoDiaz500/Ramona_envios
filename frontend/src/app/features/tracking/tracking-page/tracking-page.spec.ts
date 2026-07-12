import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  of,
  Subject,
  throwError
} from 'rxjs';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  ApiResponse,
  Sucursal
} from '../../../../core/services/sucursal.service';

import {
  SolicitudEnvio,
  SolicitudService
} from '../../../../core/services/solicitud.service';

import {
  Seguimiento,
  SeguimientoService
} from '../../../../core/services/seguimiento.service';

import {
  TrackingPage
} from './tracking-page';

describe('TrackingPage', () => {

  let component: TrackingPage;
  let fixture: ComponentFixture<TrackingPage>;

  let solicitudServiceMock: {
    buscarPorCodigo: ReturnType<typeof vi.fn>;
  };

  let seguimientoServiceMock: {
    listarPorSolicitud: ReturnType<typeof vi.fn>;
  };

  const sucursalOrigen: Sucursal = {
    id: 1,
    nombre: 'Sucursal San Antonio',
    direccion: 'Barros Luco 123',
    ciudad: 'San Antonio',
    telefono: '+56352223344',
    habilitada: true,
    fechaCreacion: '2026-07-01T10:00:00'
  };

  const sucursalDestino: Sucursal = {
    id: 2,
    nombre: 'Sucursal Santiago',
    direccion: 'Alameda 456',
    ciudad: 'Santiago',
    telefono: '+56222223333',
    habilitada: true,
    fechaCreacion: '2026-07-02T10:00:00'
  };

  const solicitudMock: SolicitudEnvio = {
    id: 100,
    codigoSeguimiento: 'RAM-20260712-0001',
    estado: 'EN_TRANSITO',
    descripcion: 'Paquete tecnológico',
    peso: 2.5,
    valorDeclarado: 50000,
    sucursalOrigen,
    sucursalDestino,
    destinatarioNombre: 'María González',
    destinatarioRutDni: '12345678-9',
    destinatarioTelefono: '+569 1234 5678',
    fechaCreacion: '2026-07-12T09:00:00'
  };

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
    descripcion: 'El envío salió de la sucursal de origen',
    fechaEvento: '2026-07-12T12:00:00'
  };

  const respuestaSolicitud:
    ApiResponse<SolicitudEnvio> = {
      success: true,
      message: 'Solicitud encontrada',
      data: solicitudMock,
      timestamp: '2026-07-12T12:00:00'
    };

  const respuestaSeguimientos:
    ApiResponse<Seguimiento[]> = {
      success: true,
      message: 'Seguimientos obtenidos correctamente',
      data: [
        seguimientoCreado,
        seguimientoTransito
      ],
      timestamp: '2026-07-12T12:00:00'
    };

  beforeEach(async () => {
    solicitudServiceMock = {
      buscarPorCodigo: vi.fn().mockReturnValue(
        of(respuestaSolicitud)
      )
    };

    seguimientoServiceMock = {
      listarPorSolicitud: vi.fn().mockReturnValue(
        of(respuestaSeguimientos)
      )
    };

    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [
        TrackingPage
      ],
      providers: [
        {
          provide: SolicitudService,
          useValue: solicitudServiceMock
        },
        {
          provide: SeguimientoService,
          useValue: seguimientoServiceMock
        }
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(TrackingPage);

    component =
      fixture.componentInstance;
  });

  describe('Creación del componente', () => {

    it('debe crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe iniciar con el código vacío', () => {
      expect(component.trackingCode)
        .toBe('');
    });

    it('debe iniciar sin mostrar resultados', () => {
      expect(component.showResult)
        .toBe(false);
    });

    it('debe iniciar con loading en false', () => {
      expect(component.loading)
        .toBe(false);
    });

    it('debe iniciar sin mensaje de error', () => {
      expect(component.errorMessage)
        .toBe('');
    });

    it('debe iniciar sin envío cargado', () => {
      expect(component.shipment)
        .toBeUndefined();
    });

    it('debe iniciar sin seguimientos', () => {
      expect(component.seguimientos)
        .toEqual([]);
    });

  });

  describe('searchTracking: validación inicial', () => {

    it('debe mostrar error cuando el código está vacío', () => {
      component.trackingCode = '';

      component.searchTracking();

      expect(component.errorMessage)
        .toBe(
          'Ingresa un código de seguimiento.'
        );
    });

    it('debe mostrar error cuando el código contiene solo espacios', () => {
      component.trackingCode = '   ';

      component.searchTracking();

      expect(component.errorMessage)
        .toBe(
          'Ingresa un código de seguimiento.'
        );
    });

    it('no debe llamar al servicio cuando el código está vacío', () => {
      component.trackingCode = '';

      component.searchTracking();

      expect(
        solicitudServiceMock.buscarPorCodigo
      ).not.toHaveBeenCalled();
    });

    it('no debe activar loading cuando el código está vacío', () => {
      component.trackingCode = '';

      component.searchTracking();

      expect(component.loading)
        .toBe(false);
    });

    it('no debe mostrar resultados cuando el código está vacío', () => {
      component.trackingCode = '';

      component.searchTracking();

      expect(component.showResult)
        .toBe(false);
    });

  });

  describe('searchTracking: preparación de búsqueda', () => {

    it('debe llamar al servicio con el código correcto', () => {
      component.trackingCode =
        'RAM-20260712-0001';

      component.searchTracking();

      expect(
        solicitudServiceMock.buscarPorCodigo
      ).toHaveBeenCalledOnce();

      expect(
        solicitudServiceMock.buscarPorCodigo
      ).toHaveBeenCalledWith(
        'RAM-20260712-0001'
      );
    });

    it('debe eliminar espacios del código antes de buscar', () => {
      component.trackingCode =
        '  RAM-20260712-0001  ';

      component.searchTracking();

      expect(
        solicitudServiceMock.buscarPorCodigo
      ).toHaveBeenCalledWith(
        'RAM-20260712-0001'
      );
    });

    it('debe activar loading mientras espera la respuesta', () => {
      const responseSubject =
        new Subject<
          ApiResponse<SolicitudEnvio>
        >();

      solicitudServiceMock.buscarPorCodigo
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.trackingCode =
        'RAM-20260712-0001';

      component.searchTracking();

      expect(component.loading)
        .toBe(true);

      responseSubject.next(
        respuestaSolicitud
      );
    });

    it('debe limpiar el mensaje de error antes de buscar', () => {
      component.errorMessage =
        'Error anterior';

      component.trackingCode =
        'RAM-20260712-0001';

      component.searchTracking();

      expect(component.errorMessage)
        .toBe('');
    });

    it('debe ocultar el resultado anterior antes de buscar', () => {
      const responseSubject =
        new Subject<
          ApiResponse<SolicitudEnvio>
        >();

      solicitudServiceMock.buscarPorCodigo
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.showResult = true;
      component.trackingCode =
        'RAM-20260712-0001';

      component.searchTracking();

      expect(component.showResult)
        .toBe(false);
    });

  });

  describe('searchTracking: búsqueda exitosa', () => {

    beforeEach(() => {
      component.trackingCode =
        'RAM-20260712-0001';
    });

    it('debe almacenar el envío encontrado', () => {
      component.searchTracking();

      expect(component.shipment)
        .toEqual(solicitudMock);
    });

    it('debe mostrar el resultado encontrado', () => {
      component.searchTracking();

      expect(component.showResult)
        .toBe(true);
    });

    it('debe conservar el código de seguimiento', () => {
      component.searchTracking();

      expect(
        component.shipment?.codigoSeguimiento
      ).toBe('RAM-20260712-0001');
    });

    it('debe conservar el estado del envío', () => {
      component.searchTracking();

      expect(component.shipment?.estado)
        .toBe('EN_TRANSITO');
    });

    it('debe conservar la sucursal de origen', () => {
      component.searchTracking();

      expect(
        component.shipment
          ?.sucursalOrigen.ciudad
      ).toBe('San Antonio');
    });

    it('debe conservar la sucursal de destino', () => {
      component.searchTracking();

      expect(
        component.shipment
          ?.sucursalDestino.ciudad
      ).toBe('Santiago');
    });

    it('debe solicitar los seguimientos usando el ID del envío', () => {
      component.searchTracking();

      expect(
        seguimientoServiceMock
          .listarPorSolicitud
      ).toHaveBeenCalledOnce();

      expect(
        seguimientoServiceMock
          .listarPorSolicitud
      ).toHaveBeenCalledWith(100);
    });

    it('debe almacenar el historial de seguimiento', () => {
      component.searchTracking();

      expect(component.seguimientos)
        .toEqual([
          seguimientoCreado,
          seguimientoTransito
        ]);

      expect(component.seguimientos)
        .toHaveLength(2);
    });

    it('debe finalizar loading cuando termina el historial', () => {
      component.searchTracking();

      expect(component.loading)
        .toBe(false);
    });

    it('debe permitir una lista vacía de seguimientos', () => {
      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin seguimientos',
            data: [],
            timestamp: '2026-07-12T12:00:00'
          })
        );

      component.searchTracking();

      expect(component.seguimientos)
        .toEqual([]);

      expect(component.showResult)
        .toBe(true);

      expect(component.loading)
        .toBe(false);
    });

    it('debe manejar data nula como una lista vacía', () => {
      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin seguimientos',
            data: null,
            timestamp: '2026-07-12T12:00:00'
          })
        );

      component.searchTracking();

      expect(component.seguimientos)
        .toEqual([]);
    });

  });

  describe('searchTracking: error al buscar el envío', () => {

    beforeEach(() => {
      component.trackingCode =
        'RAM-NO-EXISTE';
    });

    it('debe mostrar el mensaje de envío no encontrado', () => {
      solicitudServiceMock.buscarPorCodigo
        .mockReturnValue(
          throwError(() => ({
            status: 404
          }))
        );

      component.searchTracking();

      expect(component.errorMessage)
        .toBe(
          'No se encontró un envío con ese código.'
        );
    });

    it('debe finalizar loading cuando falla la búsqueda', () => {
      solicitudServiceMock.buscarPorCodigo
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.searchTracking();

      expect(component.loading)
        .toBe(false);
    });

    it('no debe mostrar resultados cuando falla la búsqueda', () => {
      solicitudServiceMock.buscarPorCodigo
        .mockReturnValue(
          throwError(() => ({
            status: 404
          }))
        );

      component.searchTracking();

      expect(component.showResult)
        .toBe(false);
    });

    it('no debe consultar seguimientos cuando falla la búsqueda principal', () => {
      solicitudServiceMock.buscarPorCodigo
        .mockReturnValue(
          throwError(() => ({
            status: 404
          }))
        );

      component.searchTracking();

      expect(
        seguimientoServiceMock
          .listarPorSolicitud
      ).not.toHaveBeenCalled();
    });

  });

  describe('searchTracking: error al cargar seguimientos', () => {

    beforeEach(() => {
      component.trackingCode =
        'RAM-20260712-0001';

      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );
    });

    it('debe conservar el envío encontrado', () => {
      component.searchTracking();

      expect(component.shipment)
        .toEqual(solicitudMock);
    });

    it('debe mantener visible el resultado', () => {
      component.searchTracking();

      expect(component.showResult)
        .toBe(true);
    });

    it('debe limpiar la lista de seguimientos', () => {
      component.seguimientos = [
        seguimientoCreado
      ];

      component.searchTracking();

      expect(component.seguimientos)
        .toEqual([]);
    });

    it('debe finalizar loading', () => {
      component.searchTracking();

      expect(component.loading)
        .toBe(false);
    });

    it('no debe mostrar error de envío no encontrado', () => {
      component.searchTracking();

      expect(component.errorMessage)
        .toBe('');
    });

  });

  describe('Plantilla inicial', () => {

    it('debe mostrar el título Seguimiento de Envíos', () => {
      fixture.detectChanges();

      const titulo =
        fixture.nativeElement
          .querySelector('h1') as HTMLHeadingElement | null;

      if (!titulo) {
        throw new Error('Título no encontrado');
      }

      expect(
        titulo.textContent?.trim()
      ).toBe(
        'Seguimiento de Envíos'
      );
    });

    it('debe mostrar el texto descriptivo', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Consulta el estado de tu envío en tiempo real.'
      );
    });

    it('debe mostrar el campo de código de seguimiento', () => {
      fixture.detectChanges();

      const input =
        fixture.nativeElement
          .querySelector(
            'input[type="text"]'
          ) as HTMLInputElement | null;

      if (!input) {
        throw new Error('Campo de seguimiento no encontrado');
      }

      expect(input)
        .not.toBeNull();
    });

    it('debe mostrar el botón Buscar', () => {
      fixture.detectChanges();

      const boton =
        fixture.nativeElement
          .querySelector('button') as HTMLButtonElement | null;

      if (!boton) {
        throw new Error('Botón Buscar no encontrado');
      }

      expect(
        boton.textContent?.trim()
      ).toBe('Buscar');
    });

    it('no debe mostrar la tarjeta de resultado inicialmente', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement
          .querySelector('.result-card')
      ).toBeNull();
    });

    it('debe ejecutar searchTracking al presionar Buscar', () => {
      const searchSpy =
        vi.spyOn(
          component,
          'searchTracking'
        ).mockImplementation(
          () => undefined
        );

      fixture.detectChanges();

      const boton =
        fixture.nativeElement
          .querySelector('button') as HTMLButtonElement | null;

      if (!boton) {
        throw new Error('Botón Buscar no encontrado');
      }

      boton.click();

      expect(searchSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe vincular el input con trackingCode', async () => {
      fixture.detectChanges();

      const input =
        fixture.nativeElement
          .querySelector(
            'input[type="text"]'
          ) as HTMLInputElement | null;

      if (!input) {
        throw new Error('Campo de seguimiento no encontrado');
      }

      input.value =
        'RAM-20260712-0001';

      input.dispatchEvent(
        new Event('input')
      );

      await fixture.whenStable();

      expect(component.trackingCode)
        .toBe('RAM-20260712-0001');
    });

  });

  describe('Plantilla con resultado', () => {

    beforeEach(() => {
      component.trackingCode =
        'RAM-20260712-0001';

      component.searchTracking();

      fixture.detectChanges();
    });

    it('debe mostrar la tarjeta de resultado', () => {
      expect(
        fixture.nativeElement
          .querySelector('.result-card')
      ).not.toBeNull();
    });

    it('debe mostrar el código de seguimiento', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'RAM-20260712-0001'
      );
    });

    it('debe mostrar el estado del envío', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'EN_TRANSITO'
      );
    });

    it('debe mostrar la ciudad de origen', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'San Antonio'
      );
    });

    it('debe mostrar la ciudad de destino', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Santiago'
      );
    });

    it('debe mostrar la timeline cuando existen seguimientos', () => {
      expect(
        fixture.nativeElement
          .querySelector('.timeline-list')
      ).not.toBeNull();
    });

    it('debe mostrar dos elementos en la timeline', () => {
      const items =
        fixture.nativeElement
          .querySelectorAll(
            '.timeline-item'
          );

      expect(items.length)
        .toBe(2);
    });

  });
    describe('Última actualización', () => {

    it('debe mostrar la información del último seguimiento', () => {
      component.trackingCode =
        'RAM-20260712-0001';

      component.searchTracking();

      fixture.detectChanges();

      expect(component.seguimientos)
        .toHaveLength(2);

      const ultimoSeguimiento =
        component.seguimientos[
          component.seguimientos.length - 1
        ];

      expect(ultimoSeguimiento)
        .toEqual(seguimientoTransito);

      expect(ultimoSeguimiento.fechaEvento)
        .toBe('2026-07-12T12:00:00');

      const timelineItems =
        fixture.nativeElement.querySelectorAll(
          '.timeline-item'
        );

      expect(timelineItems.length)
        .toBe(2);

      expect(
        timelineItems[1].textContent
      ).toContain('EN_TRANSITO');

      expect(
        timelineItems[1].textContent
      ).toContain(
        'El envío salió de la sucursal de origen'
      );
    });

    it('debe usar fechaCreacion cuando no existen seguimientos', () => {
      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin seguimientos',
            data: [],
            timestamp:
              '2026-07-12T12:00:00'
          })
        );

      component.trackingCode =
        'RAM-20260712-0001';

      component.searchTracking();

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        solicitudMock.fechaCreacion
      );
    });

    it('debe usar el último elemento del arreglo de seguimientos', () => {
      component.trackingCode =
        'RAM-20260712-0001';

      component.searchTracking();

      const ultimo =
        component.seguimientos[
          component.seguimientos.length - 1
        ];

      expect(ultimo)
        .toEqual(seguimientoTransito);

      expect(ultimo.fechaEvento)
        .toBe('2026-07-12T12:00:00');
    });

  });

  describe('Contenido del timeline', () => {

    beforeEach(() => {
      component.trackingCode =
        'RAM-20260712-0001';

      component.searchTracking();

      fixture.detectChanges();
    });

    it('debe mostrar el estado CREADO', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('CREADO');
    });

    it('debe mostrar el estado EN_TRANSITO', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('EN_TRANSITO');
    });

    it('debe mostrar la descripción del primer seguimiento', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Solicitud registrada correctamente'
      );
    });

    it('debe mostrar la descripción del segundo seguimiento', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'El envío salió de la sucursal de origen'
      );
    });

    it('debe mostrar un punto por cada elemento del timeline', () => {
      const puntos =
        fixture.nativeElement
          .querySelectorAll(
            '.timeline-dot'
          );

      expect(puntos.length)
        .toBe(2);
    });

    it('debe conservar el orden recibido desde el backend', () => {
      const items =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.timeline-item'
            )
        ) as HTMLElement[];

      expect(items[0].textContent)
        .toContain('CREADO');

      expect(items[1].textContent)
        .toContain('EN_TRANSITO');
    });

  });

  describe('Resultado sin seguimientos', () => {

    beforeEach(() => {
      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin seguimientos',
            data: [],
            timestamp:
              '2026-07-12T12:00:00'
          })
        );

      component.trackingCode =
        'RAM-20260712-0001';

      component.searchTracking();

      fixture.detectChanges();
    });

    it('debe mantener visible la tarjeta de resultado', () => {
      expect(
        fixture.nativeElement
          .querySelector(
            '.result-card'
          )
      ).not.toBeNull();
    });

    it('no debe mostrar la lista del timeline', () => {
      expect(
        fixture.nativeElement
          .querySelector(
            '.timeline-list'
          )
      ).toBeNull();
    });

    it('debe seguir mostrando el código de seguimiento', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'RAM-20260712-0001'
      );
    });

    it('debe seguir mostrando origen y destino', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('San Antonio');

      expect(
        fixture.nativeElement.textContent
      ).toContain('Santiago');
    });

  });

  describe('Búsquedas consecutivas', () => {

    it('debe permitir ejecutar dos búsquedas seguidas', () => {
      component.trackingCode =
        'RAM-20260712-0001';

      component.searchTracking();
      component.searchTracking();

      expect(
        solicitudServiceMock.buscarPorCodigo
      ).toHaveBeenCalledTimes(2);

      expect(
        seguimientoServiceMock.listarPorSolicitud
      ).toHaveBeenCalledTimes(2);
    });

    it('debe reemplazar el envío anterior con el nuevo resultado', () => {
      const segundaSolicitud:
        SolicitudEnvio = {
          ...solicitudMock,
          id: 200,
          codigoSeguimiento:
            'RAM-20260712-0002',
          estado: 'ENTREGADO',
          destinatarioNombre:
            'Pedro Soto'
        };

      const segundaRespuesta:
        ApiResponse<SolicitudEnvio> = {
          success: true,
          message:
            'Solicitud encontrada',
          data: segundaSolicitud,
          timestamp:
            '2026-07-12T13:00:00'
        };

      component.trackingCode =
        'RAM-20260712-0001';

      component.searchTracking();

      solicitudServiceMock.buscarPorCodigo
        .mockReturnValue(
          of(segundaRespuesta)
        );

      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          of({
            success: true,
            message:
              'Seguimientos obtenidos',
            data: [],
            timestamp:
              '2026-07-12T13:00:00'
          })
        );

      component.trackingCode =
        'RAM-20260712-0002';

      component.searchTracking();

      expect(
        component.shipment
          ?.codigoSeguimiento
      ).toBe(
        'RAM-20260712-0002'
      );

      expect(component.shipment?.estado)
        .toBe('ENTREGADO');
    });

    it('debe ocultar el resultado anterior mientras la nueva búsqueda está pendiente', () => {
      component.trackingCode =
        'RAM-20260712-0001';

      component.searchTracking();

      const responseSubject =
        new Subject<
          ApiResponse<SolicitudEnvio>
        >();

      solicitudServiceMock.buscarPorCodigo
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.trackingCode =
        'RAM-20260712-0002';

      component.searchTracking();

      expect(component.showResult)
        .toBe(false);

      expect(component.loading)
        .toBe(true);
    });

    it('debe limpiar el error anterior al realizar una nueva búsqueda válida', () => {
      solicitudServiceMock.buscarPorCodigo
        .mockReturnValueOnce(
          throwError(() => ({
            status: 404
          }))
        );

      component.trackingCode =
        'NO-EXISTE';

      component.searchTracking();

      expect(component.errorMessage)
        .toBe(
          'No se encontró un envío con ese código.'
        );

      solicitudServiceMock.buscarPorCodigo
        .mockReturnValue(
          of(respuestaSolicitud)
        );

      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          of(respuestaSeguimientos)
        );

      component.trackingCode =
        'RAM-20260712-0001';

      component.searchTracking();

      expect(component.errorMessage)
        .toBe('');
    });

  });

  describe('Casos límite', () => {

    it('debe aceptar códigos en minúsculas sin modificarlos', () => {
      component.trackingCode =
        'ram-20260712-0001';

      component.searchTracking();

      expect(
        solicitudServiceMock.buscarPorCodigo
      ).toHaveBeenCalledWith(
        'ram-20260712-0001'
      );
    });

    it('debe aceptar códigos con guiones', () => {
      component.trackingCode =
        'ABC-123-XYZ';

      component.searchTracking();

      expect(
        solicitudServiceMock.buscarPorCodigo
      ).toHaveBeenCalledWith(
        'ABC-123-XYZ'
      );
    });

    it('debe conservar el código escrito en el input después de buscar', () => {
      component.trackingCode =
        '  RAM-20260712-0001  ';

      component.searchTracking();

      expect(component.trackingCode)
        .toBe(
          '  RAM-20260712-0001  '
        );
    });

    it('debe mostrar resultado aunque el seguimiento falle', () => {
      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.trackingCode =
        'RAM-20260712-0001';

      component.searchTracking();

      expect(component.showResult)
        .toBe(true);

      expect(component.shipment)
        .toEqual(solicitudMock);
    });

    it('debe dejar seguimientos vacíos si falla su carga', () => {
      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.trackingCode =
        'RAM-20260712-0001';

      component.searchTracking();

      expect(component.seguimientos)
        .toEqual([]);
    });

  });

  describe('Interacción con el input', () => {

    it('debe actualizar trackingCode al escribir', async () => {
      fixture.detectChanges();

      const input =
        fixture.nativeElement
          .querySelector(
            'input[type="text"]'
          ) as HTMLInputElement | null;

      if (!input) {
        throw new Error(
          'Campo de seguimiento no encontrado'
        );
      }

      input.value =
        'RAM-PRUEBA-001';

      input.dispatchEvent(
        new Event('input')
      );

      await fixture.whenStable();

      expect(component.trackingCode)
        .toBe('RAM-PRUEBA-001');
    });

    it('debe buscar usando el valor escrito en el input', async () => {
      const searchSpy =
        vi.spyOn(
          component,
          'searchTracking'
        ).mockImplementation(
          () => undefined
        );

      fixture.detectChanges();

      const input =
        fixture.nativeElement
          .querySelector(
            'input[type="text"]'
          ) as HTMLInputElement | null;

      const boton =
        fixture.nativeElement
          .querySelector(
            'button'
          ) as HTMLButtonElement | null;

      if (!input || !boton) {
        throw new Error(
          'Elementos de búsqueda no encontrados'
        );
      }

      input.value =
        'RAM-PRUEBA-002';

      input.dispatchEvent(
        new Event('input')
      );

      await fixture.whenStable();

      boton.click();

      expect(component.trackingCode)
        .toBe('RAM-PRUEBA-002');

      expect(searchSpy)
        .toHaveBeenCalledOnce();
    });

  });

});