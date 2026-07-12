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
  AuthService
} from '../../../../core/services/auth.service';

import {
  ResenaService
} from '../../../../core/services/resena.service';

import {
  ApiResponse,
  Sucursal
} from '../../../../core/services/sucursal.service';

import {
  SolicitudEnvio,
  SolicitudService
} from '../../../../core/services/solicitud.service';

import {
  ShipmentHistory
} from './shipment-history';

describe('ShipmentHistory', () => {

  let component: ShipmentHistory;
  let fixture: ComponentFixture<ShipmentHistory>;

  let solicitudServiceMock: {
    listarPorUsuario: ReturnType<typeof vi.fn>;
  };

  let resenaServiceMock: {
    crear: ReturnType<typeof vi.fn>;
  };

  let authServiceMock: {
    getUserId: ReturnType<typeof vi.fn>;
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

  const envioEntregado: SolicitudEnvio = {
    id: 100,
    codigoSeguimiento: 'RAM-20260712-0001',
    estado: 'ENTREGADO',
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

  const envioEnTransito: SolicitudEnvio = {
    id: 101,
    codigoSeguimiento: 'RAM-20260712-0002',
    estado: 'EN_TRANSITO',
    descripcion: 'Documentos',
    peso: 1.2,
    valorDeclarado: 15000,
    sucursalOrigen,
    sucursalDestino,
    destinatarioNombre: 'Pedro Soto',
    destinatarioRutDni: '98765432-1',
    destinatarioTelefono: '+569 8765 4321',
    fechaCreacion: '2026-07-12T10:00:00'
  };

  const envioPendiente: SolicitudEnvio = {
    id: 102,
    codigoSeguimiento: 'RAM-20260712-0003',
    estado: 'PENDIENTE_APROBACION',
    descripcion: 'Caja pequeña',
    peso: 0.8,
    valorDeclarado: 10000,
    sucursalOrigen,
    sucursalDestino,
    destinatarioNombre: 'Ana Pérez',
    destinatarioRutDni: '11111111-1',
    destinatarioTelefono: '+569 1111 1111',
    fechaCreacion: '2026-07-12T11:00:00'
  };

  const respuestaHistorial:
    ApiResponse<SolicitudEnvio[]> = {
      success: true,
      message: 'Historial obtenido correctamente',
      data: [
        envioEntregado,
        envioEnTransito,
        envioPendiente
      ],
      timestamp: '2026-07-12T12:00:00'
    };

  beforeEach(async () => {
    solicitudServiceMock = {
      listarPorUsuario: vi.fn().mockReturnValue(
        of(respuestaHistorial)
      )
    };

    resenaServiceMock = {
      crear: vi.fn()
    };

    authServiceMock = {
      getUserId: vi.fn().mockReturnValue(10)
    };

    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [
        ShipmentHistory
      ],
      providers: [
        {
          provide: SolicitudService,
          useValue: solicitudServiceMock
        },
        {
          provide: ResenaService,
          useValue: resenaServiceMock
        },
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(ShipmentHistory);

    component =
      fixture.componentInstance;
  });

  describe('Creación del componente', () => {

    it('debe crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe iniciar sin envíos', () => {
      expect(component.shipments)
        .toEqual([]);
    });

    it('debe iniciar con el modal cerrado', () => {
      expect(component.showReviewModal)
        .toBe(false);
    });

    it('debe iniciar sin envío seleccionado', () => {
      expect(component.selectedShipment)
        .toBeNull();
    });

    it('debe iniciar con rating cero', () => {
      expect(component.rating)
        .toBe(0);
    });

    it('debe iniciar con comentario vacío', () => {
      expect(component.comment)
        .toBe('');
    });

    it('debe iniciar sin notificación visible', () => {
      expect(component.showNotification)
        .toBe(false);

      expect(component.notificationMessage)
        .toBe('');
    });

    it('debe iniciar con loading en false', () => {
      expect(component.loading)
        .toBe(false);
    });

  });

  describe('ngOnInit', () => {

    it('debe llamar a cargarHistorial', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarHistorial'
        );

      component.ngOnInit();

      expect(cargarSpy)
        .toHaveBeenCalledOnce();
    });

  });

  describe('usuarioId', () => {

    it('debe retornar el ID del usuario autenticado', () => {
      authServiceMock.getUserId
        .mockReturnValue(25);

      expect(component.usuarioId)
        .toBe(25);
    });

    it('debe retornar null cuando no existe usuario', () => {
      authServiceMock.getUserId
        .mockReturnValue(null);

      expect(component.usuarioId)
        .toBeNull();
    });

  });

  describe('cargarHistorial', () => {

    it('no debe llamar al servicio si no existe usuario autenticado', () => {
      authServiceMock.getUserId
        .mockReturnValue(null);

      component.cargarHistorial();

      expect(
        solicitudServiceMock.listarPorUsuario
      ).not.toHaveBeenCalled();

      expect(component.shipments)
        .toEqual([]);
    });

    it('debe llamar al servicio con el ID correcto', () => {
      component.cargarHistorial();

      expect(
        solicitudServiceMock.listarPorUsuario
      ).toHaveBeenCalledOnce();

      expect(
        solicitudServiceMock.listarPorUsuario
      ).toHaveBeenCalledWith(10);
    });

    it('debe activar loading mientras espera la respuesta', () => {
      const responseSubject =
        new Subject<
          ApiResponse<SolicitudEnvio[]>
        >();

      solicitudServiceMock.listarPorUsuario
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.cargarHistorial();

      expect(component.loading)
        .toBe(true);

      responseSubject.next(
        respuestaHistorial
      );

      responseSubject.complete();

      expect(component.loading)
        .toBe(false);
    });

    it('debe cargar los envíos recibidos', () => {
      component.cargarHistorial();

      expect(component.shipments)
        .toEqual([
          envioEntregado,
          envioEnTransito,
          envioPendiente
        ]);

      expect(component.shipments)
        .toHaveLength(3);
    });

    it('debe conservar los códigos de seguimiento', () => {
      component.cargarHistorial();

      expect(
        component.shipments[0]
          .codigoSeguimiento
      ).toBe('RAM-20260712-0001');

      expect(
        component.shipments[1]
          .codigoSeguimiento
      ).toBe('RAM-20260712-0002');
    });

    it('debe conservar los estados', () => {
      component.cargarHistorial();

      expect(component.shipments[0].estado)
        .toBe('ENTREGADO');

      expect(component.shipments[1].estado)
        .toBe('EN_TRANSITO');

      expect(component.shipments[2].estado)
        .toBe('PENDIENTE_APROBACION');
    });

    it('debe finalizar loading después del éxito', () => {
      component.cargarHistorial();

      expect(component.loading)
        .toBe(false);
    });

    it('debe manejar data nula como lista vacía', () => {
      solicitudServiceMock.listarPorUsuario
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin envíos',
            data: null,
            timestamp: '2026-07-12T12:00:00'
          })
        );

      component.cargarHistorial();

      expect(component.shipments)
        .toEqual([]);

      expect(component.loading)
        .toBe(false);
    });

    it('debe limpiar los envíos cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      const errorMock = {
        status: 500
      };

      component.shipments = [
        envioEntregado
      ];

      solicitudServiceMock.listarPorUsuario
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.cargarHistorial();

      expect(component.shipments)
        .toEqual([]);

      expect(component.loading)
        .toBe(false);

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al cargar historial',
          errorMock
        );

      consoleSpy.mockRestore();
    });

  });

  describe('puedeResenar', () => {

    it('debe retornar true para un envío ENTREGADO', () => {
      expect(
        component.puedeResenar(
          envioEntregado
        )
      ).toBe(true);
    });

    it('debe retornar false para un envío EN_TRANSITO', () => {
      expect(
        component.puedeResenar(
          envioEnTransito
        )
      ).toBe(false);
    });

    it('debe retornar false para un envío pendiente', () => {
      expect(
        component.puedeResenar(
          envioPendiente
        )
      ).toBe(false);
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
          'EN_PREPARACION_SUCURSAL'
        )
      ).toBe(
        'EN PREPARACION SUCURSAL'
      );
    });

    it('debe conservar un estado sin guiones bajos', () => {
      expect(
        component.formatearEstado(
          'ENTREGADO'
        )
      ).toBe('ENTREGADO');
    });

    it('debe aceptar una cadena vacía', () => {
      expect(
        component.formatearEstado('')
      ).toBe('');
    });

  });

  describe('estadoClase', () => {

    it('debe retornar badge-success para ENTREGADO', () => {
      expect(
        component.estadoClase(
          'ENTREGADO'
        )
      ).toBe('badge-success');
    });

    it('debe retornar badge-warning para EN_TRANSITO', () => {
      expect(
        component.estadoClase(
          'EN_TRANSITO'
        )
      ).toBe('badge-warning');
    });

    it('debe retornar badge-warning para EN_PREPARACION', () => {
      expect(
        component.estadoClase(
          'EN_PREPARACION'
        )
      ).toBe('badge-warning');
    });

    it('debe retornar badge-danger para RECHAZADO', () => {
      expect(
        component.estadoClase(
          'RECHAZADO'
        )
      ).toBe('badge-danger');
    });

    it('debe retornar badge-pending para otros estados', () => {
      expect(
        component.estadoClase(
          'PENDIENTE_APROBACION'
        )
      ).toBe('badge-pending');
    });

  });

  describe('progreso', () => {

    it('debe retornar 1 para PENDIENTE_APROBACION', () => {
      expect(
        component.progreso(
          'PENDIENTE_APROBACION'
        )
      ).toBe(1);
    });

    it('debe retornar 2 para APROBADO', () => {
      expect(
        component.progreso('APROBADO')
      ).toBe(2);
    });

    it('debe retornar 2 para EN_PREPARACION', () => {
      expect(
        component.progreso(
          'EN_PREPARACION'
        )
      ).toBe(2);
    });

    it('debe retornar 3 para EN_TRANSITO', () => {
      expect(
        component.progreso(
          'EN_TRANSITO'
        )
      ).toBe(3);
    });

    it('debe retornar 4 para ENTREGADO', () => {
      expect(
        component.progreso(
          'ENTREGADO'
        )
      ).toBe(4);
    });

    it('debe retornar 1 para un estado desconocido', () => {
      expect(
        component.progreso(
          'ESTADO_DESCONOCIDO'
        )
      ).toBe(1);
    });

  });

  describe('Plantilla inicial', () => {

    it('debe mostrar el título Historial de Envíos', () => {
      fixture.detectChanges();

      const titulo =
        fixture.nativeElement
          .querySelector('h1') as HTMLElement;

      expect(
        titulo.textContent?.trim()
      ).toBe('Historial de Envíos');
    });

    it('debe mostrar el texto descriptivo', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Consulta el estado de tus envíos registrados.'
      );
    });

    it('debe mostrar Cargando envíos durante la carga', () => {
      const responseSubject =
        new Subject<
          ApiResponse<SolicitudEnvio[]>
        >();

      solicitudServiceMock.listarPorUsuario
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.loading = true;

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Cargando envíos...'
      );

      responseSubject.next(
        respuestaHistorial
      );

      responseSubject.complete();
    });

    it('debe mostrar mensaje cuando no hay envíos', () => {
      solicitudServiceMock.listarPorUsuario
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin envíos',
            data: [],
            timestamp: '2026-07-12T12:00:00'
          })
        );

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'No tienes envíos registrados.'
      );
    });

    it('no debe mostrar la grilla cuando no hay envíos', () => {
      solicitudServiceMock.listarPorUsuario
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin envíos',
            data: [],
            timestamp: '2026-07-12T12:00:00'
          })
        );

      fixture.detectChanges();

      expect(
        fixture.nativeElement
          .querySelector('.shipment-grid')
      ).toBeNull();
    });

  });

  describe('Plantilla con envíos', () => {

    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debe mostrar la grilla de envíos', () => {
      expect(
        fixture.nativeElement
          .querySelector('.shipment-grid')
      ).not.toBeNull();
    });

    it('debe mostrar tres envíos', () => {
      const items =
        fixture.nativeElement
          .querySelectorAll(
            '.shipment-item'
          );

      expect(items.length)
        .toBe(3);
    });

    it('debe mostrar los códigos de seguimiento', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'RAM-20260712-0001'
      );

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'RAM-20260712-0002'
      );

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'RAM-20260712-0003'
      );
    });

    it('debe mostrar origen y destino', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('San Antonio');

      expect(
        fixture.nativeElement.textContent
      ).toContain('Santiago');
    });

    it('debe mostrar peso y valor declarado', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('2.5 kg');

      expect(
        fixture.nativeElement.textContent
      ).toContain('$50000');
    });

    it('debe mostrar los destinatarios', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'María González'
      );

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Pedro Soto'
      );
    });

    it('debe mostrar los estados formateados', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('ENTREGADO');

      expect(
        fixture.nativeElement.textContent
      ).toContain('EN TRANSITO');

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'PENDIENTE APROBACION'
      );
    });

    it('debe aplicar badge-success al envío entregado', () => {
      const badges =
        fixture.nativeElement
          .querySelectorAll('.badge');

      expect(
        badges[0].classList
          .contains('badge-success')
      ).toBe(true);
    });

    it('debe aplicar badge-warning al envío en tránsito', () => {
      const badges =
        fixture.nativeElement
          .querySelectorAll('.badge');

      expect(
        badges[1].classList
          .contains('badge-warning')
      ).toBe(true);
    });

    it('debe habilitar el botón Reseñar solo para el envío entregado', () => {
      const botones =
        fixture.nativeElement
          .querySelectorAll('.btn-review');

      expect(
        (botones[0] as HTMLButtonElement)
          .disabled
      ).toBe(false);

      expect(
        (botones[1] as HTMLButtonElement)
          .disabled
      ).toBe(true);

      expect(
        (botones[2] as HTMLButtonElement)
          .disabled
      ).toBe(true);
    });

    it('debe mostrar Reseñar en el envío entregado', () => {
      const botones =
        fixture.nativeElement
          .querySelectorAll('.btn-review');

      expect(
        botones[0].textContent?.trim()
      ).toBe('Reseñar');
    });

    it('debe mostrar el mensaje de disponibilidad futura en envíos no entregados', () => {
      const botones =
        fixture.nativeElement
          .querySelectorAll('.btn-review');

      expect(
        botones[1].textContent?.trim()
      ).toBe(
        'Reseña disponible al entregar'
      );
    });

  });

  describe('openReview', () => {

  it('debe abrir el modal', () => {
    component.openReview(envioEntregado);

    expect(component.showReviewModal)
      .toBe(true);
  });

  it('debe seleccionar el envío', () => {
    component.openReview(envioEntregado);

    expect(component.selectedShipment)
      .toBe(envioEntregado);
  });

  it('debe reiniciar el rating', () => {
    component.rating = 5;

    component.openReview(envioEntregado);

    expect(component.rating)
      .toBe(0);
  });

  it('debe limpiar el comentario', () => {
    component.comment = 'Excelente';

    component.openReview(envioEntregado);

    expect(component.comment)
      .toBe('');
  });

});

describe('closeReview', () => {

  it('debe cerrar el modal', () => {
    component.showReviewModal = true;

    component.closeReview();

    expect(component.showReviewModal)
      .toBe(false);
  });

});

describe('submitReview: validaciones', () => {

  beforeEach(() => {
    component.selectedShipment = envioEntregado;
  });

  it('debe impedir enviar cuando no existe usuario', () => {

    authServiceMock.getUserId
      .mockReturnValue(null);

    const notificacionSpy =
      vi.spyOn(
        component,
        'mostrarNotificacion'
      );

    component.submitReview();

    expect(notificacionSpy)
      .toHaveBeenCalledWith(
        'No se pudo identificar al usuario.'
      );

    expect(
      resenaServiceMock.crear
    ).not.toHaveBeenCalled();

  });

  it('debe impedir enviar cuando rating es cero', () => {

    component.rating = 0;

    const notificacionSpy =
      vi.spyOn(
        component,
        'mostrarNotificacion'
      );

    component.submitReview();

    expect(notificacionSpy)
      .toHaveBeenCalledWith(
        'Debes seleccionar una calificación.'
      );

    expect(
      resenaServiceMock.crear
    ).not.toHaveBeenCalled();

  });

  it('debe impedir enviar cuando no existe un envío seleccionado', () => {

    component.selectedShipment = null;

    component.rating = 5;

    const notificacionSpy =
      vi.spyOn(
        component,
        'mostrarNotificacion'
      );

    component.submitReview();

    expect(notificacionSpy)
      .toHaveBeenCalledWith(
        'Debes seleccionar una calificación.'
      );

    expect(
      resenaServiceMock.crear
    ).not.toHaveBeenCalled();

  });

});

describe('submitReview: éxito', () => {

  beforeEach(() => {

    component.selectedShipment =
      envioEntregado;

    component.rating = 5;

    component.comment =
      'Excelente servicio';

    component.showReviewModal =
      true;

  });

  it('debe llamar al servicio crear', () => {

    resenaServiceMock.crear
      .mockReturnValue(
        of({})
      );

    component.submitReview();

    expect(
      resenaServiceMock.crear
    ).toHaveBeenCalledOnce();

  });

  it('debe enviar los datos correctos', () => {

    resenaServiceMock.crear
      .mockReturnValue(
        of({})
      );

    component.submitReview();

    expect(
      resenaServiceMock.crear
    ).toHaveBeenCalledWith({

      solicitudEnvioId: 100,

      usuarioId: 10,

      calificacion: 5,

      comentario:
        'Excelente servicio'

    });

  });

  it('debe cerrar el modal', () => {

    resenaServiceMock.crear
      .mockReturnValue(
        of({})
      );

    component.submitReview();

    expect(component.showReviewModal)
      .toBe(false);

  });

  it('debe mostrar la notificación de éxito', () => {

    resenaServiceMock.crear
      .mockReturnValue(
        of({})
      );

    const notificacionSpy =
      vi.spyOn(
        component,
        'mostrarNotificacion'
      );

    component.submitReview();

    expect(notificacionSpy)
      .toHaveBeenCalledWith(
        'Reseña enviada correctamente'
      );

  });

});

describe('submitReview: error', () => {

  beforeEach(() => {

    component.selectedShipment =
      envioEntregado;

    component.rating = 5;

  });

  it('debe mostrar el mensaje recibido desde el backend', () => {

    const notificacionSpy =
      vi.spyOn(
        component,
        'mostrarNotificacion'
      );

    resenaServiceMock.crear
      .mockReturnValue(

        throwError(() => ({

          error: {

            message:
              'Ya existe una reseña.'

          }

        }))

      );

    component.submitReview();

    expect(notificacionSpy)
      .toHaveBeenCalledWith(
        'Ya existe una reseña.'
      );

  });

  it('debe mostrar mensaje genérico cuando el backend no entrega detalle', () => {

    const notificacionSpy =
      vi.spyOn(
        component,
        'mostrarNotificacion'
      );

    resenaServiceMock.crear
      .mockReturnValue(

        throwError(() => ({}))

      );

    component.submitReview();

    expect(notificacionSpy)
      .toHaveBeenCalledWith(
        'No se pudo enviar la reseña'
      );

  });

});

describe('mostrarNotificacion', () => {

  beforeEach(() => {

    vi.useFakeTimers();

  });

  afterEach(() => {

    vi.useRealTimers();

  });

  it('debe mostrar la notificación', () => {

    component.mostrarNotificacion(
      'Mensaje'
    );

    expect(component.showNotification)
      .toBe(true);

    expect(component.notificationMessage)
      .toBe('Mensaje');

  });

  it('debe ocultarla automáticamente después de tres segundos', () => {

    component.mostrarNotificacion(
      'Mensaje'
    );

    vi.advanceTimersByTime(
      3000
    );

    expect(component.showNotification)
      .toBe(false);

  });

});

describe('Plantilla del modal', () => {

  beforeEach(() => {

    component.openReview(
      envioEntregado
    );

    fixture.detectChanges();

  });

  it('debe mostrar el modal', () => {

    expect(
      fixture.nativeElement
        .querySelector(
          '.review-modal'
        )
    ).not.toBeNull();

  });

  it('debe mostrar el código del envío', () => {

    expect(
      fixture.nativeElement.textContent
    ).toContain(
      'RAM-20260712-0001'
    );

  });

  it('debe mostrar cinco estrellas', () => {

    const estrellas =
      fixture.nativeElement
        .querySelectorAll(
          '.stars span'
        );

    expect(estrellas.length)
      .toBe(5);

  });

  it('debe actualizar el rating al hacer clic en una estrella', () => {

    const estrellas =
      fixture.nativeElement
        .querySelectorAll(
          '.stars span'
        );

    estrellas[3].click();

    fixture.detectChanges();

    expect(component.rating)
      .toBe(4);

  });

  it('debe permitir escribir un comentario', async () => {

    const textarea =
      fixture.nativeElement
        .querySelector(
          'textarea'
        ) as HTMLTextAreaElement;

    textarea.value =
      'Muy buen servicio';

    textarea.dispatchEvent(
      new Event('input')
    );

    await fixture.whenStable();

    expect(component.comment)
      .toBe(
        'Muy buen servicio'
      );

  });

  it('debe ejecutar closeReview al presionar Cancelar', () => {

    const cerrarSpy =
      vi.spyOn(
        component,
        'closeReview'
      ).mockImplementation(() => {});

    const botones =
      fixture.nativeElement
        .querySelectorAll(
          '.actions button'
        );

    botones[0].click();

    expect(cerrarSpy)
      .toHaveBeenCalledOnce();

  });

  it('debe ejecutar submitReview al presionar Enviar', () => {

    const enviarSpy =
      vi.spyOn(
        component,
        'submitReview'
      ).mockImplementation(() => {});

    const botones =
      fixture.nativeElement
        .querySelectorAll(
          '.actions button'
        );

    botones[1].click();

    expect(enviarSpy)
      .toHaveBeenCalledOnce();

  });

});

describe('Plantilla de notificación', () => {

  it('debe mostrar el mensaje cuando la notificación está activa', () => {

    component.showNotification =
      true;

    component.notificationMessage =
      'Reseña enviada correctamente';

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent
    ).toContain(
      'Reseña enviada correctamente'
    );

  });

  });

});