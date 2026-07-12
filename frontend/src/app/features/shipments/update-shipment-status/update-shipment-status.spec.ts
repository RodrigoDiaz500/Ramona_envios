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
  UpdateShipmentStatus
} from './update-shipment-status';

describe('UpdateShipmentStatus', () => {

  let component: UpdateShipmentStatus;
  let fixture: ComponentFixture<UpdateShipmentStatus>;

  let solicitudServiceMock: {
    listar: ReturnType<typeof vi.fn>;
    cambiarEstado: ReturnType<typeof vi.fn>;
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

  const solicitudPendiente: SolicitudEnvio = {
    id: 100,
    codigoSeguimiento: 'RAM-20260712-0001',
    estado: 'PENDIENTE_APROBACION',
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

  const solicitudAprobada: SolicitudEnvio = {
    ...solicitudPendiente,
    id: 101,
    codigoSeguimiento: 'RAM-20260712-0002',
    estado: 'APROBADO',
    destinatarioNombre: 'Pedro Soto'
  };

  const solicitudPreparacion: SolicitudEnvio = {
    ...solicitudPendiente,
    id: 102,
    codigoSeguimiento: 'RAM-20260712-0003',
    estado: 'EN_PREPARACION',
    destinatarioNombre: 'Ana Pérez'
  };

  const solicitudTransito: SolicitudEnvio = {
    ...solicitudPendiente,
    id: 103,
    codigoSeguimiento: 'RAM-20260712-0004',
    estado: 'EN_TRANSITO',
    destinatarioNombre: 'Carlos Muñoz'
  };

  const solicitudEntregada: SolicitudEnvio = {
    ...solicitudPendiente,
    id: 104,
    codigoSeguimiento: 'RAM-20260712-0005',
    estado: 'ENTREGADO',
    destinatarioNombre: 'Laura Silva'
  };

  const solicitudRechazada: SolicitudEnvio = {
    ...solicitudPendiente,
    id: 105,
    codigoSeguimiento: 'RAM-20260712-0006',
    estado: 'RECHAZADO',
    destinatarioNombre: 'Mario Rojas'
  };

  const todasLasSolicitudes: SolicitudEnvio[] = [
    solicitudPendiente,
    solicitudAprobada,
    solicitudPreparacion,
    solicitudTransito,
    solicitudEntregada,
    solicitudRechazada
  ];

  const respuestaSolicitudes:
    ApiResponse<SolicitudEnvio[]> = {
      success: true,
      message: 'Solicitudes obtenidas correctamente',
      data: todasLasSolicitudes,
      timestamp: '2026-07-12T12:00:00'
    };

  beforeEach(async () => {
    solicitudServiceMock = {
      listar: vi.fn().mockReturnValue(
        of(respuestaSolicitudes)
      ),
      cambiarEstado: vi.fn()
    };

    seguimientoServiceMock = {
      listarPorSolicitud: vi.fn()
    };

    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [
        UpdateShipmentStatus
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
      TestBed.createComponent(UpdateShipmentStatus);

    component =
      fixture.componentInstance;
  });

  describe('Creación del componente', () => {

    it('debe crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe iniciar sin solicitudes', () => {
      expect(component.shipments)
        .toEqual([]);

      expect(component.filteredShipments)
        .toEqual([]);
    });

    it('debe iniciar sin solicitud seleccionada', () => {
      expect(component.selectedShipment)
        .toBeNull();
    });

    it('debe iniciar sin seguimientos', () => {
      expect(component.seguimientos)
        .toEqual([]);
    });

    it('debe iniciar con la búsqueda vacía', () => {
      expect(component.search)
        .toBe('');
    });

    it('debe iniciar con los indicadores de carga desactivados', () => {
      expect(component.loading)
        .toBe(false);

      expect(component.loadingTimeline)
        .toBe(false);
    });

    it('debe iniciar con el modal cerrado', () => {
      expect(component.showDetailModal)
        .toBe(false);
    });

    it('debe usar operadorId igual a 1', () => {
      expect(component.operadorId)
        .toBe(1);
    });

    it('debe contener los seis estados operacionales', () => {
      expect(component.estados)
        .toEqual([
          'PENDIENTE_APROBACION',
          'APROBADO',
          'EN_PREPARACION',
          'EN_TRANSITO',
          'ENTREGADO',
          'RECHAZADO'
        ]);
    });

  });

  describe('ngOnInit', () => {

    it('debe llamar a cargarSolicitudes', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarSolicitudes'
        );

      component.ngOnInit();

      expect(cargarSpy)
        .toHaveBeenCalledOnce();
    });

  });

  describe('cargarSolicitudes', () => {

    it('debe llamar al servicio listar', () => {
      component.cargarSolicitudes();

      expect(solicitudServiceMock.listar)
        .toHaveBeenCalledOnce();
    });

    it('debe activar loading mientras espera la respuesta', () => {
      const subject =
        new Subject<ApiResponse<SolicitudEnvio[]>>();

      solicitudServiceMock.listar
        .mockReturnValue(
          subject.asObservable()
        );

      component.cargarSolicitudes();

      expect(component.loading)
        .toBe(true);

      subject.next(respuestaSolicitudes);
      subject.complete();

      expect(component.loading)
        .toBe(false);
    });

    it('debe cargar todas las solicitudes', () => {
      component.cargarSolicitudes();

      expect(component.shipments)
        .toEqual(todasLasSolicitudes);

      expect(component.shipments)
        .toHaveLength(6);
    });

    it('debe copiar las solicitudes a filteredShipments', () => {
      component.cargarSolicitudes();

      expect(component.filteredShipments)
        .toEqual(todasLasSolicitudes);
    });

    it('debe conservar los códigos y estados', () => {
      component.cargarSolicitudes();

      expect(
        component.shipments[0].codigoSeguimiento
      ).toBe('RAM-20260712-0001');

      expect(component.shipments[0].estado)
        .toBe('PENDIENTE_APROBACION');

      expect(component.shipments[5].estado)
        .toBe('RECHAZADO');
    });

    it('debe finalizar loading después del éxito', () => {
      component.cargarSolicitudes();

      expect(component.loading)
        .toBe(false);
    });

    it('debe manejar data nula como una lista vacía', () => {
      solicitudServiceMock.listar
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin solicitudes',
            data: null,
            timestamp: '2026-07-12T12:00:00'
          })
        );

      component.cargarSolicitudes();

      expect(component.shipments)
        .toEqual([]);

      expect(component.filteredShipments)
        .toEqual([]);
    });

    it('debe registrar el error de carga', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      const errorMock = {
        status: 500
      };

      solicitudServiceMock.listar
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.cargarSolicitudes();

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al cargar solicitudes',
          errorMock
        );

      consoleSpy.mockRestore();
    });

    it('debe finalizar loading cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      solicitudServiceMock.listar
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.cargarSolicitudes();

      expect(component.loading)
        .toBe(false);

      consoleSpy.mockRestore();
    });

  });

  describe('filtrar', () => {

    beforeEach(() => {
      component.shipments = todasLasSolicitudes;
      component.filteredShipments = todasLasSolicitudes;
    });

    it('debe retornar todos los registros con búsqueda vacía', () => {
      component.search = '';

      component.filtrar();

      expect(component.filteredShipments)
        .toHaveLength(6);
    });

    it('debe ignorar espacios en blanco', () => {
      component.search = '   ';

      component.filtrar();

      expect(component.filteredShipments)
        .toHaveLength(6);
    });

    it('debe filtrar por código de seguimiento', () => {
      component.search =
        'RAM-20260712-0003';

      component.filtrar();

      expect(component.filteredShipments)
        .toEqual([
          solicitudPreparacion
        ]);
    });

    it('debe filtrar por una parte del código', () => {
      component.search = '0004';

      component.filtrar();

      expect(component.filteredShipments)
        .toEqual([
          solicitudTransito
        ]);
    });

    it('debe filtrar por estado', () => {
      component.search = 'ENTREGADO';

      component.filtrar();

      expect(component.filteredShipments)
        .toEqual([
          solicitudEntregada
        ]);
    });

    it('debe filtrar por estado parcial', () => {
      component.search = 'preparacion';

      component.filtrar();

      expect(component.filteredShipments)
        .toEqual([
          solicitudPreparacion
        ]);
    });

    it('debe filtrar por nombre del destinatario', () => {
      component.search = 'Carlos Muñoz';

      component.filtrar();

      expect(component.filteredShipments)
        .toEqual([
          solicitudTransito
        ]);
    });

    it('debe ignorar mayúsculas y minúsculas', () => {
      component.search = 'mARÍA';

      component.filtrar();

      expect(component.filteredShipments)
        .toEqual([
          solicitudPendiente
        ]);
    });

    it('debe ignorar espacios al inicio y final', () => {
      component.search =
        '  Pedro Soto  ';

      component.filtrar();

      expect(component.filteredShipments)
        .toEqual([
          solicitudAprobada
        ]);
    });

    it('debe retornar lista vacía sin coincidencias', () => {
      component.search =
        'SOLICITUD INEXISTENTE';

      component.filtrar();

      expect(component.filteredShipments)
        .toEqual([]);
    });

  });

  describe('porEstado', () => {

    beforeEach(() => {
      component.filteredShipments =
        todasLasSolicitudes;
    });

    it('debe retornar solicitudes pendientes', () => {
      expect(
        component.porEstado(
          'PENDIENTE_APROBACION'
        )
      ).toEqual([
        solicitudPendiente
      ]);
    });

    it('debe retornar solicitudes aprobadas', () => {
      expect(
        component.porEstado('APROBADO')
      ).toEqual([
        solicitudAprobada
      ]);
    });

    it('debe retornar solicitudes en preparación', () => {
      expect(
        component.porEstado(
          'EN_PREPARACION'
        )
      ).toEqual([
        solicitudPreparacion
      ]);
    });

    it('debe retornar solicitudes en tránsito', () => {
      expect(
        component.porEstado(
          'EN_TRANSITO'
        )
      ).toEqual([
        solicitudTransito
      ]);
    });

    it('debe retornar solicitudes entregadas', () => {
      expect(
        component.porEstado('ENTREGADO')
      ).toEqual([
        solicitudEntregada
      ]);
    });

    it('debe retornar solicitudes rechazadas', () => {
      expect(
        component.porEstado('RECHAZADO')
      ).toEqual([
        solicitudRechazada
      ]);
    });

    it('debe retornar una lista vacía para un estado inexistente', () => {
      expect(
        component.porEstado(
          'ESTADO_INEXISTENTE'
        )
      ).toEqual([]);
    });

  });

  describe('siguienteEstado', () => {

    it('debe pasar de pendiente a aprobado', () => {
      expect(
        component.siguienteEstado(
          'PENDIENTE_APROBACION'
        )
      ).toBe('APROBADO');
    });

    it('debe pasar de aprobado a preparación', () => {
      expect(
        component.siguienteEstado(
          'APROBADO'
        )
      ).toBe('EN_PREPARACION');
    });

    it('debe pasar de preparación a tránsito', () => {
      expect(
        component.siguienteEstado(
          'EN_PREPARACION'
        )
      ).toBe('EN_TRANSITO');
    });

    it('debe pasar de tránsito a entregado', () => {
      expect(
        component.siguienteEstado(
          'EN_TRANSITO'
        )
      ).toBe('ENTREGADO');
    });

    it('debe retornar null para entregado', () => {
      expect(
        component.siguienteEstado(
          'ENTREGADO'
        )
      ).toBeNull();
    });

    it('debe retornar null para rechazado', () => {
      expect(
        component.siguienteEstado(
          'RECHAZADO'
        )
      ).toBeNull();
    });

    it('debe retornar null para un estado desconocido', () => {
      expect(
        component.siguienteEstado(
          'DESCONOCIDO'
        )
      ).toBeNull();
    });

  });

  describe('formatearEstado', () => {

    it('debe reemplazar guiones bajos por espacios', () => {
      expect(
        component.formatearEstado(
          'PENDIENTE_APROBACION'
        )
      ).toBe('PENDIENTE APROBACION');
    });

    it('debe reemplazar todos los guiones bajos', () => {
      expect(
        component.formatearEstado(
          'ESTADO_DE_PRUEBA'
        )
      ).toBe('ESTADO DE PRUEBA');
    });

    it('debe conservar estados sin guion bajo', () => {
      expect(
        component.formatearEstado(
          'ENTREGADO'
        )
      ).toBe('ENTREGADO');
    });

    it('debe permitir una cadena vacía', () => {
      expect(
        component.formatearEstado('')
      ).toBe('');
    });

  });

  describe('Plantilla inicial y tablero', () => {

    it('debe mostrar el título Centro de Operaciones', () => {
      fixture.detectChanges();

      const titulo =
        fixture.nativeElement
          .querySelector('h1') as HTMLElement;

      expect(titulo.textContent?.trim())
        .toBe('Centro de Operaciones');
    });

    it('debe mostrar la descripción', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Gestiona solicitudes, aprobación y avance de envíos.'
      );
    });

    it('debe mostrar el botón Actualizar', () => {
      fixture.detectChanges();

      const boton =
        fixture.nativeElement
          .querySelector(
            '.refresh-btn'
          ) as HTMLButtonElement;

      expect(boton.textContent?.trim())
        .toBe('Actualizar');
    });

    it('debe ejecutar cargarSolicitudes al presionar Actualizar', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarSolicitudes'
        ).mockImplementation(
          () => undefined
        );

      fixture.detectChanges();

      cargarSpy.mockClear();

      const boton =
        fixture.nativeElement
          .querySelector(
            '.refresh-btn'
          ) as HTMLButtonElement;

      boton.click();

      expect(cargarSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe mostrar el campo de búsqueda', () => {
      fixture.detectChanges();

      const input =
        fixture.nativeElement
          .querySelector(
            '.search-box input'
          ) as HTMLInputElement;

      expect(input)
        .not.toBeNull();

      expect(input.placeholder)
        .toBe(
          'Buscar por código, estado o destinatario...'
        );
    });

    it('debe mostrar Cargando solicitudes durante la carga', () => {
      const subject =
        new Subject<ApiResponse<SolicitudEnvio[]>>();

      solicitudServiceMock.listar
        .mockReturnValue(
          subject.asObservable()
        );

      component.loading = true;

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Cargando solicitudes...'
      );

      subject.next(respuestaSolicitudes);
      subject.complete();
    });

    it('debe mostrar seis columnas Kanban', () => {
      fixture.detectChanges();

      const columnas =
        fixture.nativeElement
          .querySelectorAll('.column');

      expect(columnas.length)
        .toBe(6);
    });

    it('debe mostrar los títulos de las columnas', () => {
      fixture.detectChanges();

      const contenido =
        fixture.nativeElement.textContent;

      expect(contenido)
        .toContain('PENDIENTE APROBACION');

      expect(contenido)
        .toContain('APROBADO');

      expect(contenido)
        .toContain('EN PREPARACION');

      expect(contenido)
        .toContain('EN TRANSITO');

      expect(contenido)
        .toContain('ENTREGADO');

      expect(contenido)
        .toContain('RECHAZADO');
    });

    it('debe mostrar las seis solicitudes', () => {
      fixture.detectChanges();

      const tarjetas =
        fixture.nativeElement
          .querySelectorAll(
            '.shipment-card'
          );

      expect(tarjetas.length)
        .toBe(6);
    });

    it('debe mostrar códigos de seguimiento', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'RAM-20260712-0001'
      );

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'RAM-20260712-0006'
      );
    });

    it('debe mostrar origen, destino y destinatario', () => {
      fixture.detectChanges();

      const contenido =
        fixture.nativeElement.textContent;

      expect(contenido)
        .toContain('San Antonio');

      expect(contenido)
        .toContain('Santiago');

      expect(contenido)
        .toContain('María González');
    });

    it('debe filtrar la plantilla al escribir', async () => {
      fixture.detectChanges();

      const input =
        fixture.nativeElement
          .querySelector(
            '.search-box input'
          ) as HTMLInputElement;

      input.value = 'Pedro Soto';

      input.dispatchEvent(
        new Event('input')
      );

      await fixture.whenStable();
      fixture.detectChanges();

      const tarjetas =
        fixture.nativeElement
          .querySelectorAll(
            '.shipment-card'
          );

      expect(component.search)
        .toBe('Pedro Soto');

      expect(tarjetas.length)
        .toBe(1);

      expect(
        fixture.nativeElement.textContent
      ).toContain('Pedro Soto');
    });

    it('debe mostrar Aprobar y Rechazar para una solicitud pendiente', () => {
      fixture.detectChanges();

      const tarjetas =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.shipment-card'
            )
        ) as HTMLElement[];

      expect(tarjetas[0].textContent)
        .toContain('Aprobar');

      expect(tarjetas[0].textContent)
        .toContain('Rechazar');
    });

    it('no debe mostrar avance para una solicitud entregada', () => {
      fixture.detectChanges();

      const tarjetas =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.shipment-card'
            )
        ) as HTMLElement[];

      const entregada =
        tarjetas.find(
          tarjeta =>
            tarjeta.textContent?.includes(
              'RAM-20260712-0005'
            )
        );

      expect(entregada)
        .toBeDefined();

      expect(entregada?.textContent)
        .not.toContain('Pasar a');
    });

  });

    describe('abrirDetalle', () => {

    const seguimientoCreado: Seguimiento = {
      id: 1,
      solicitudEnvioId: 100,
      codigoSeguimiento: 'RAM-20260712-0001',
      estado: 'PENDIENTE_APROBACION',
      descripcion: 'Solicitud creada correctamente',
      fechaEvento: '2026-07-12T09:00:00'
    };

    const seguimientoAprobado: Seguimiento = {
      id: 2,
      solicitudEnvioId: 100,
      codigoSeguimiento: 'RAM-20260712-0001',
      estado: 'APROBADO',
      descripcion: 'Solicitud aprobada por el operador',
      fechaEvento: '2026-07-12T10:00:00'
    };

    const respuestaSeguimientos:
      ApiResponse<Seguimiento[]> = {
        success: true,
        message: 'Seguimientos obtenidos correctamente',
        data: [
          seguimientoCreado,
          seguimientoAprobado
        ],
        timestamp: '2026-07-12T12:00:00'
      };

    beforeEach(() => {
      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          of(respuestaSeguimientos)
        );
    });

    it('debe seleccionar la solicitud recibida', () => {
      component.abrirDetalle(
        solicitudPendiente
      );

      expect(component.selectedShipment)
        .toBe(solicitudPendiente);
    });

    it('debe abrir el modal de detalle', () => {
      component.abrirDetalle(
        solicitudPendiente
      );

      expect(component.showDetailModal)
        .toBe(true);
    });

    it('debe activar loadingTimeline mientras espera la respuesta', () => {
      const subject =
        new Subject<
          ApiResponse<Seguimiento[]>
        >();

      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          subject.asObservable()
        );

      component.abrirDetalle(
        solicitudPendiente
      );

      expect(component.loadingTimeline)
        .toBe(true);

      subject.next(
        respuestaSeguimientos
      );

      subject.complete();

      expect(component.loadingTimeline)
        .toBe(false);
    });

    it('debe consultar seguimientos con el ID correcto', () => {
      component.abrirDetalle(
        solicitudPendiente
      );

      expect(
        seguimientoServiceMock
          .listarPorSolicitud
      ).toHaveBeenCalledOnce();

      expect(
        seguimientoServiceMock
          .listarPorSolicitud
      ).toHaveBeenCalledWith(100);
    });

    it('debe cargar los seguimientos recibidos', () => {
      component.abrirDetalle(
        solicitudPendiente
      );

      expect(component.seguimientos)
        .toEqual([
          seguimientoCreado,
          seguimientoAprobado
        ]);

      expect(component.seguimientos)
        .toHaveLength(2);
    });

    it('debe conservar el orden recibido desde el backend', () => {
      component.abrirDetalle(
        solicitudPendiente
      );

      expect(component.seguimientos[0].estado)
        .toBe('PENDIENTE_APROBACION');

      expect(component.seguimientos[1].estado)
        .toBe('APROBADO');
    });

    it('debe finalizar loadingTimeline después del éxito', () => {
      component.abrirDetalle(
        solicitudPendiente
      );

      expect(component.loadingTimeline)
        .toBe(false);
    });

    it('debe manejar data nula como lista vacía', () => {
      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin seguimientos',
            data: null,
            timestamp: '2026-07-12T12:00:00'
          })
        );

      component.abrirDetalle(
        solicitudPendiente
      );

      expect(component.seguimientos)
        .toEqual([]);

      expect(component.loadingTimeline)
        .toBe(false);
    });

    it('debe limpiar los seguimientos cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      const errorMock = {
        status: 500
      };

      component.seguimientos = [
        seguimientoCreado
      ];

      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.abrirDetalle(
        solicitudPendiente
      );

      expect(component.seguimientos)
        .toEqual([]);

      expect(component.loadingTimeline)
        .toBe(false);

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al cargar timeline',
          errorMock
        );

      consoleSpy.mockRestore();
    });

    it('debe mantener abierto el modal cuando falla el timeline', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.abrirDetalle(
        solicitudPendiente
      );

      expect(component.showDetailModal)
        .toBe(true);

      expect(component.selectedShipment)
        .toBe(solicitudPendiente);

      consoleSpy.mockRestore();
    });

  });

  describe('cerrarDetalle', () => {

    it('debe cerrar el modal', () => {
      component.showDetailModal = true;

      component.cerrarDetalle();

      expect(component.showDetailModal)
        .toBe(false);
    });

    it('debe limpiar la solicitud seleccionada', () => {
      component.selectedShipment =
        solicitudPendiente;

      component.cerrarDetalle();

      expect(component.selectedShipment)
        .toBeNull();
    });

    it('debe limpiar los seguimientos', () => {
      component.seguimientos = [
        {
          id: 1,
          solicitudEnvioId: 100,
          codigoSeguimiento:
            'RAM-20260712-0001',
          estado: 'APROBADO',
          descripcion: 'Aprobado',
          fechaEvento:
            '2026-07-12T10:00:00'
        }
      ];

      component.cerrarDetalle();

      expect(component.seguimientos)
        .toEqual([]);
    });

    it('debe cerrar completamente un detalle abierto', () => {
      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          of({
            success: true,
            message: 'OK',
            data: [],
            timestamp: ''
          })
        );

      component.abrirDetalle(
        solicitudPendiente
      );

      component.cerrarDetalle();

      expect(component.showDetailModal)
        .toBe(false);

      expect(component.selectedShipment)
        .toBeNull();

      expect(component.seguimientos)
        .toEqual([]);
    });

  });

  describe('cambiarEstado', () => {

    const solicitudActualizada:
      SolicitudEnvio = {
        ...solicitudPendiente,
        estado: 'APROBADO'
      };

    const respuestaActualizacion:
      ApiResponse<SolicitudEnvio> = {
        success: true,
        message: 'Estado actualizado correctamente',
        data: solicitudActualizada,
        timestamp: '2026-07-12T12:00:00'
      };

    beforeEach(() => {
      solicitudServiceMock.cambiarEstado
        .mockReturnValue(
          of(respuestaActualizacion)
        );
    });

    it('debe llamar al servicio con el ID correcto', () => {
      component.cambiarEstado(
        solicitudPendiente,
        'APROBADO'
      );

      expect(
        solicitudServiceMock.cambiarEstado
      ).toHaveBeenCalledOnce();
    });

    it('debe enviar el nuevo estado y operador', () => {
      component.operadorId = 25;

      component.cambiarEstado(
        solicitudPendiente,
        'APROBADO'
      );

      expect(
        solicitudServiceMock.cambiarEstado
      ).toHaveBeenCalledWith(
        100,
        {
          estado: 'APROBADO',
          aprobadoPorId: 25
        }
      );
    });

    it('debe permitir rechazar una solicitud', () => {
      component.cambiarEstado(
        solicitudPendiente,
        'RECHAZADO'
      );

      expect(
        solicitudServiceMock.cambiarEstado
      ).toHaveBeenCalledWith(
        100,
        {
          estado: 'RECHAZADO',
          aprobadoPorId: 1
        }
      );
    });

    it('debe permitir pasar a preparación', () => {
      component.cambiarEstado(
        solicitudAprobada,
        'EN_PREPARACION'
      );

      expect(
        solicitudServiceMock.cambiarEstado
      ).toHaveBeenCalledWith(
        101,
        {
          estado: 'EN_PREPARACION',
          aprobadoPorId: 1
        }
      );
    });

    it('debe permitir pasar a tránsito', () => {
      component.cambiarEstado(
        solicitudPreparacion,
        'EN_TRANSITO'
      );

      expect(
        solicitudServiceMock.cambiarEstado
      ).toHaveBeenCalledWith(
        102,
        {
          estado: 'EN_TRANSITO',
          aprobadoPorId: 1
        }
      );
    });

    it('debe permitir pasar a entregado', () => {
      component.cambiarEstado(
        solicitudTransito,
        'ENTREGADO'
      );

      expect(
        solicitudServiceMock.cambiarEstado
      ).toHaveBeenCalledWith(
        103,
        {
          estado: 'ENTREGADO',
          aprobadoPorId: 1
        }
      );
    });

    it('debe volver a cargar las solicitudes después del éxito', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarSolicitudes'
        ).mockImplementation(
          () => undefined
        );

      component.cambiarEstado(
        solicitudPendiente,
        'APROBADO'
      );

      expect(cargarSpy)
        .toHaveBeenCalledOnce();
    });

    it('no debe volver a abrir detalle si el modal está cerrado', () => {
      component.showDetailModal = false;

      const abrirSpy =
        vi.spyOn(
          component,
          'abrirDetalle'
        ).mockImplementation(
          () => undefined
        );

      component.cambiarEstado(
        solicitudPendiente,
        'APROBADO'
      );

      expect(abrirSpy)
        .not.toHaveBeenCalled();
    });

    it('debe volver a abrir el detalle con la respuesta actualizada si el modal está abierto', () => {
      component.showDetailModal = true;

      const abrirSpy =
        vi.spyOn(
          component,
          'abrirDetalle'
        ).mockImplementation(
          () => undefined
        );

      component.cambiarEstado(
        solicitudPendiente,
        'APROBADO'
      );

      expect(abrirSpy)
        .toHaveBeenCalledOnce();

      expect(abrirSpy)
        .toHaveBeenCalledWith(
          solicitudActualizada
        );
    });

    it('debe recargar solicitudes antes de abrir nuevamente el detalle', () => {
      component.showDetailModal = true;

      const cargarSpy =
        vi.spyOn(
          component,
          'cargarSolicitudes'
        ).mockImplementation(
          () => undefined
        );

      const abrirSpy =
        vi.spyOn(
          component,
          'abrirDetalle'
        ).mockImplementation(
          () => undefined
        );

      component.cambiarEstado(
        solicitudPendiente,
        'APROBADO'
      );

      expect(
        cargarSpy.mock.invocationCallOrder[0]
      ).toBeLessThan(
        abrirSpy.mock.invocationCallOrder[0]
      );
    });

    it('debe registrar el error recibido', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(
            () => undefined
          );

      const errorMock = {
        error: {
          message:
            'Transición de estado no permitida'
        }
      };

      solicitudServiceMock.cambiarEstado
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.cambiarEstado(
        solicitudEntregada,
        'APROBADO'
      );

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al cambiar estado',
          errorMock
        );

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('debe mostrar el mensaje entregado por el backend', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(
            () => undefined
          );

      solicitudServiceMock.cambiarEstado
        .mockReturnValue(
          throwError(() => ({
            error: {
              message:
                'Transición de estado no permitida'
            }
          }))
        );

      component.cambiarEstado(
        solicitudEntregada,
        'APROBADO'
      );

      expect(alertSpy)
        .toHaveBeenCalledWith(
          'Transición de estado no permitida'
        );

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('debe mostrar mensaje genérico si el backend no entrega detalle', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(
            () => undefined
          );

      solicitudServiceMock.cambiarEstado
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.cambiarEstado(
        solicitudPendiente,
        'APROBADO'
      );

      expect(alertSpy)
        .toHaveBeenCalledWith(
          'No se pudo actualizar el estado'
        );

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('no debe recargar las solicitudes cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(
            () => undefined
          );

      solicitudServiceMock.cambiarEstado
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      const cargarSpy =
        vi.spyOn(
          component,
          'cargarSolicitudes'
        ).mockImplementation(
          () => undefined
        );

      component.cambiarEstado(
        solicitudPendiente,
        'APROBADO'
      );

      expect(cargarSpy)
        .not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

  });

  describe('Plantilla: detalle del envío', () => {

    const seguimientoMock: Seguimiento = {
      id: 1,
      solicitudEnvioId: 100,
      codigoSeguimiento: 'RAM-20260712-0001',
      estado: 'PENDIENTE_APROBACION',
      descripcion: 'Solicitud registrada',
      fechaEvento: '2026-07-12T09:00:00'
    };

    beforeEach(() => {
      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          of({
            success: true,
            message: 'OK',
            data: [
              seguimientoMock
            ],
            timestamp: ''
          })
        );

      component.abrirDetalle(
        solicitudPendiente
      );

      fixture.detectChanges();
    });

    it('debe mostrar el modal de detalle', () => {
      expect(
        fixture.nativeElement
          .querySelector('.detail-modal')
      ).not.toBeNull();
    });

    it('debe mostrar el código de seguimiento', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'RAM-20260712-0001'
      );
    });

    it('debe mostrar el estado formateado', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'PENDIENTE APROBACION'
      );
    });

    it('debe mostrar origen y destino', () => {
      const contenido =
        fixture.nativeElement.textContent;

      expect(contenido)
        .toContain('San Antonio');

      expect(contenido)
        .toContain('Santiago');
    });

    it('debe mostrar destinatario y teléfono', () => {
      const contenido =
        fixture.nativeElement.textContent;

      expect(contenido)
        .toContain('María González');

      expect(contenido)
        .toContain('+569 1234 5678');
    });

    it('debe mostrar peso y valor declarado', () => {
      const contenido =
        fixture.nativeElement.textContent;

      expect(contenido)
        .toContain('2.5 kg');

      expect(contenido)
        .toContain('$50000');
    });

    it('debe mostrar el timeline', () => {
      expect(
        fixture.nativeElement
          .querySelector('.timeline')
      ).not.toBeNull();
    });

    it('debe mostrar los eventos del timeline', () => {
      const items =
        fixture.nativeElement
          .querySelectorAll(
            '.timeline-item'
          );

      expect(items.length)
        .toBe(1);

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Solicitud registrada'
      );
    });

    it('debe cerrar el detalle al presionar el botón cerrar', () => {
      const cerrarSpy =
        vi.spyOn(
          component,
          'cerrarDetalle'
        ).mockImplementation(
          () => undefined
        );

      const boton =
        fixture.nativeElement
          .querySelector(
            '.close-btn'
          ) as HTMLButtonElement;

      boton.click();

      expect(cerrarSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe mostrar Aprobar y Rechazar para una solicitud pendiente', () => {
      const contenido =
        fixture.nativeElement
          .querySelector(
            '.modal-actions'
          ).textContent;

      expect(contenido)
        .toContain('Aprobar');

      expect(contenido)
        .toContain('Rechazar');
    });

  });

  describe('Plantilla: timeline vacío y carga', () => {

    it('debe mostrar Cargando seguimiento durante la carga', () => {
      const subject =
        new Subject<
          ApiResponse<Seguimiento[]>
        >();

      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          subject.asObservable()
        );

      component.abrirDetalle(
        solicitudPendiente
      );

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Cargando seguimiento...'
      );

      subject.next({
        success: true,
        message: 'OK',
        data: [],
        timestamp: ''
      });

      subject.complete();
    });

    it('debe mostrar mensaje cuando no existen eventos', () => {
      seguimientoServiceMock.listarPorSolicitud
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin eventos',
            data: [],
            timestamp: ''
          })
        );

      component.abrirDetalle(
        solicitudPendiente
      );

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Este envío aún no tiene eventos de seguimiento.'
      );

      expect(
        fixture.nativeElement
          .querySelector('.timeline')
      ).toBeNull();
    });

  });

  describe('Plantilla: botones operacionales', () => {

    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debe ejecutar abrirDetalle al presionar Ver detalle', () => {
      const abrirSpy =
        vi.spyOn(
          component,
          'abrirDetalle'
        ).mockImplementation(
          () => undefined
        );

      const tarjetas =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.shipment-card'
            )
        ) as HTMLElement[];

      const boton =
        tarjetas[0].querySelector(
          '.detail'
        ) as HTMLButtonElement;

      boton.click();

      expect(abrirSpy)
        .toHaveBeenCalledOnce();

      expect(abrirSpy)
        .toHaveBeenCalledWith(
          solicitudPendiente
        );
    });

    it('debe ejecutar cambiarEstado al presionar Aprobar', () => {
      const cambiarSpy =
        vi.spyOn(
          component,
          'cambiarEstado'
        ).mockImplementation(
          () => undefined
        );

      const tarjetas =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.shipment-card'
            )
        ) as HTMLElement[];

      const boton =
        tarjetas[0].querySelector(
          '.approve'
        ) as HTMLButtonElement;

      boton.click();

      expect(cambiarSpy)
        .toHaveBeenCalledWith(
          solicitudPendiente,
          'APROBADO'
        );
    });

    it('debe ejecutar cambiarEstado al presionar Rechazar', () => {
      const cambiarSpy =
        vi.spyOn(
          component,
          'cambiarEstado'
        ).mockImplementation(
          () => undefined
        );

      const tarjetas =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.shipment-card'
            )
        ) as HTMLElement[];

      const boton =
        tarjetas[0].querySelector(
          '.reject'
        ) as HTMLButtonElement;

      boton.click();

      expect(cambiarSpy)
        .toHaveBeenCalledWith(
          solicitudPendiente,
          'RECHAZADO'
        );
    });

    it('debe pasar una solicitud aprobada a preparación', () => {
      const cambiarSpy =
        vi.spyOn(
          component,
          'cambiarEstado'
        ).mockImplementation(
          () => undefined
        );

      const tarjetas =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.shipment-card'
            )
        ) as HTMLElement[];

      const tarjetaAprobada =
        tarjetas.find(
          tarjeta =>
            tarjeta.textContent?.includes(
              'RAM-20260712-0002'
            )
        );

      const boton =
        tarjetaAprobada?.querySelector(
          '.next'
        ) as HTMLButtonElement;

      expect(boton)
        .toBeDefined();

      boton.click();

      expect(cambiarSpy)
        .toHaveBeenCalledWith(
          solicitudAprobada,
          'EN_PREPARACION'
        );
    });

    it('debe pasar una solicitud en preparación a tránsito', () => {
      const cambiarSpy =
        vi.spyOn(
          component,
          'cambiarEstado'
        ).mockImplementation(
          () => undefined
        );

      const tarjetas =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.shipment-card'
            )
        ) as HTMLElement[];

      const tarjetaPreparacion =
        tarjetas.find(
          tarjeta =>
            tarjeta.textContent?.includes(
              'RAM-20260712-0003'
            )
        );

      const boton =
        tarjetaPreparacion?.querySelector(
          '.next'
        ) as HTMLButtonElement;

      boton.click();

      expect(cambiarSpy)
        .toHaveBeenCalledWith(
          solicitudPreparacion,
          'EN_TRANSITO'
        );
    });

    it('debe pasar una solicitud en tránsito a entregado', () => {
      const cambiarSpy =
        vi.spyOn(
          component,
          'cambiarEstado'
        ).mockImplementation(
          () => undefined
        );

      const tarjetas =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.shipment-card'
            )
        ) as HTMLElement[];

      const tarjetaTransito =
        tarjetas.find(
          tarjeta =>
            tarjeta.textContent?.includes(
              'RAM-20260712-0004'
            )
        );

      const boton =
        tarjetaTransito?.querySelector(
          '.next'
        ) as HTMLButtonElement;

      boton.click();

      expect(cambiarSpy)
        .toHaveBeenCalledWith(
          solicitudTransito,
          'ENTREGADO'
        );
    });

  });

});