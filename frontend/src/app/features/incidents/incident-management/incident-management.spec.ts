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
  Incidencia,
  IncidenciaService
} from '../../../../core/services/incidencia.service';

import {
  ApiResponse,
  Sucursal
} from '../../../../core/services/sucursal.service';

import {
  SolicitudEnvio,
  SolicitudService
} from '../../../../core/services/solicitud.service';

import {
  IncidentManagement
} from './incident-management';

describe('IncidentManagement', () => {

  let component: IncidentManagement;
  let fixture: ComponentFixture<IncidentManagement>;

  let incidenciaServiceMock: {
    listar: ReturnType<typeof vi.fn>;
    crear: ReturnType<typeof vi.fn>;
    actualizarEstado: ReturnType<typeof vi.fn>;
  };

  let solicitudServiceMock: {
    listar: ReturnType<typeof vi.fn>;
  };

  let authServiceMock: {
    getRole: ReturnType<typeof vi.fn>;
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
    descripcion: 'Paquete delicado',
    peso: 2.5,
    valorDeclarado: 50000,
    sucursalOrigen,
    sucursalDestino,
    destinatarioNombre: 'María González',
    destinatarioRutDni: '12345678-9',
    destinatarioTelefono: '+569 1234 5678',
    fechaCreacion: '2026-07-12T09:00:00'
  };

  const solicitudTransito: SolicitudEnvio = {
    ...solicitudPendiente,
    id: 101,
    codigoSeguimiento: 'RAM-20260712-0002',
    estado: 'EN_TRANSITO',
    destinatarioNombre: 'Pedro Soto'
  };

  const incidenciaAbierta: Incidencia = {
    id: 1,
    solicitudEnvioId: 100,
    codigoSeguimiento: 'RAM-20260712-0001',
    titulo: 'Paquete retrasado',
    descripcion: 'El envío no ha avanzado desde ayer.',
    estado: 'ABIERTA',
    fechaCreacion: '2026-07-12T09:00:00',
    fechaActualizacion: '2026-07-12T09:00:00'
  };

  const incidenciaProceso: Incidencia = {
    id: 2,
    solicitudEnvioId: 101,
    codigoSeguimiento: 'RAM-20260712-0002',
    titulo: 'Dirección incorrecta',
    descripcion: 'Se requiere confirmar la dirección.',
    estado: 'EN_PROCESO',
    fechaCreacion: '2026-07-12T10:00:00',
    fechaActualizacion: '2026-07-12T11:00:00'
  };

  const incidenciaResuelta: Incidencia = {
    id: 3,
    solicitudEnvioId: 100,
    codigoSeguimiento: 'RAM-20260712-0001',
    titulo: 'Daño exterior',
    descripcion: 'Se verificó que el contenido está intacto.',
    estado: 'RESUELTA',
    fechaCreacion: '2026-07-12T11:00:00',
    fechaActualizacion: '2026-07-12T12:00:00'
  };

  const incidenciaCerrada: Incidencia = {
    id: 4,
    solicitudEnvioId: 101,
    codigoSeguimiento: 'RAM-20260712-0002',
    titulo: 'Reclamo finalizado',
    descripcion: 'El caso fue cerrado correctamente.',
    estado: 'CERRADA',
    fechaCreacion: '2026-07-12T12:00:00',
    fechaActualizacion: '2026-07-12T13:00:00'
  };

  const todasLasIncidencias: Incidencia[] = [
    incidenciaAbierta,
    incidenciaProceso,
    incidenciaResuelta,
    incidenciaCerrada
  ];

  const respuestaIncidencias:
    ApiResponse<Incidencia[]> = {
      success: true,
      message: 'Incidencias obtenidas correctamente',
      data: todasLasIncidencias,
      timestamp: '2026-07-12T13:00:00'
    };

  const respuestaSolicitudes:
    ApiResponse<SolicitudEnvio[]> = {
      success: true,
      message: 'Solicitudes obtenidas correctamente',
      data: [
        solicitudPendiente,
        solicitudTransito
      ],
      timestamp: '2026-07-12T13:00:00'
    };

  beforeEach(async () => {
    incidenciaServiceMock = {
      listar: vi.fn().mockReturnValue(
        of(respuestaIncidencias)
      ),
      crear: vi.fn(),
      actualizarEstado: vi.fn()
    };

    solicitudServiceMock = {
      listar: vi.fn().mockReturnValue(
        of(respuestaSolicitudes)
      )
    };

    authServiceMock = {
      getRole: vi.fn().mockReturnValue('ADMIN')
    };

    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [
        IncidentManagement
      ],
      providers: [
        {
          provide: IncidenciaService,
          useValue: incidenciaServiceMock
        },
        {
          provide: SolicitudService,
          useValue: solicitudServiceMock
        },
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(IncidentManagement);

    component =
      fixture.componentInstance;
  });

  describe('Creación e inicialización', () => {

    it('debe crear el componente correctamente', () => {
      expect(component)
        .toBeTruthy();
    });

    it('debe iniciar sin incidencias', () => {
      expect(component.incidents)
        .toEqual([]);
    });

    it('debe iniciar sin solicitudes', () => {
      expect(component.solicitudes)
        .toEqual([]);
    });

    it('debe iniciar con loading en false', () => {
      expect(component.loading)
        .toBe(false);
    });

    it('debe iniciar con el modal cerrado', () => {
      expect(component.showCreateModal)
        .toBe(false);
    });

    it('debe iniciar con operadorId igual a 1', () => {
      expect(component.operadorId)
        .toBe(1);
    });

    it('debe iniciar con el formulario vacío', () => {
      expect(component.form)
        .toEqual({
          solicitudEnvioId: 0,
          titulo: '',
          descripcion: '',
          creadaPorId: 1,
          asignadaAId: null
        });
    });

    it('debe exponer AuthService públicamente', () => {
      expect(component.authService)
        .toBe(authServiceMock);
    });

  });

  describe('ngOnInit', () => {

    it('debe llamar a cargarIncidencias', () => {
      const incidenciasSpy =
        vi.spyOn(
          component,
          'cargarIncidencias'
        ).mockImplementation(
          () => undefined
        );

      const solicitudesSpy =
        vi.spyOn(
          component,
          'cargarSolicitudes'
        ).mockImplementation(
          () => undefined
        );

      component.ngOnInit();

      expect(incidenciasSpy)
        .toHaveBeenCalledOnce();

      expect(solicitudesSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe cargar primero incidencias y luego solicitudes', () => {
      const incidenciasSpy =
        vi.spyOn(
          component,
          'cargarIncidencias'
        ).mockImplementation(
          () => undefined
        );

      const solicitudesSpy =
        vi.spyOn(
          component,
          'cargarSolicitudes'
        ).mockImplementation(
          () => undefined
        );

      component.ngOnInit();

      expect(
        incidenciasSpy.mock.invocationCallOrder[0]
      ).toBeLessThan(
        solicitudesSpy.mock.invocationCallOrder[0]
      );
    });

  });

  describe('esAdmin', () => {

    it('debe retornar true para ADMIN', () => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      expect(component.esAdmin)
        .toBe(true);
    });

    it('debe retornar false para OPERADOR', () => {
      authServiceMock.getRole
        .mockReturnValue('OPERADOR');

      expect(component.esAdmin)
        .toBe(false);
    });

    it('debe retornar false para CLIENTE', () => {
      authServiceMock.getRole
        .mockReturnValue('CLIENTE');

      expect(component.esAdmin)
        .toBe(false);
    });

    it('debe consultar el rol cada vez que se obtiene esAdmin', () => {
      component.esAdmin;
      component.esAdmin;

      expect(authServiceMock.getRole)
        .toHaveBeenCalledTimes(2);
    });

  });

  describe('cargarIncidencias', () => {

    it('debe llamar al servicio listar', () => {
      component.cargarIncidencias();

      expect(incidenciaServiceMock.listar)
        .toHaveBeenCalledOnce();
    });

    it('debe activar loading mientras espera', () => {
      const subject =
        new Subject<
          ApiResponse<Incidencia[]>
        >();

      incidenciaServiceMock.listar
        .mockReturnValue(
          subject.asObservable()
        );

      component.cargarIncidencias();

      expect(component.loading)
        .toBe(true);

      subject.next(
        respuestaIncidencias
      );

      subject.complete();

      expect(component.loading)
        .toBe(false);
    });

    it('debe cargar las incidencias recibidas', () => {
      component.cargarIncidencias();

      expect(component.incidents)
        .toEqual(todasLasIncidencias);

      expect(component.incidents)
        .toHaveLength(4);
    });

    it('debe conservar los códigos de seguimiento', () => {
      component.cargarIncidencias();

      expect(
        component.incidents[0]
          .codigoSeguimiento
      ).toBe('RAM-20260712-0001');

      expect(
        component.incidents[1]
          .codigoSeguimiento
      ).toBe('RAM-20260712-0002');
    });

    it('debe conservar los cuatro estados', () => {
      component.cargarIncidencias();

      expect(
        component.incidents.map(
          incident => incident.estado
        )
      ).toEqual([
        'ABIERTA',
        'EN_PROCESO',
        'RESUELTA',
        'CERRADA'
      ]);
    });

    it('debe finalizar loading después del éxito', () => {
      component.cargarIncidencias();

      expect(component.loading)
        .toBe(false);
    });

    it('debe manejar data nula como una lista vacía', () => {
      incidenciaServiceMock.listar
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin incidencias',
            data: null,
            timestamp: '2026-07-12T13:00:00'
          })
        );

      component.cargarIncidencias();

      expect(component.incidents)
        .toEqual([]);

      expect(component.loading)
        .toBe(false);
    });

    it('debe limpiar las incidencias cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      const errorMock = {
        status: 500
      };

      component.incidents = [
        incidenciaAbierta
      ];

      incidenciaServiceMock.listar
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.cargarIncidencias();

      expect(component.incidents)
        .toEqual([]);

      expect(component.loading)
        .toBe(false);

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al cargar incidencias',
          errorMock
        );

      consoleSpy.mockRestore();
    });

  });

  describe('cargarSolicitudes', () => {

    it('debe llamar al servicio listar solicitudes', () => {
      component.cargarSolicitudes();

      expect(solicitudServiceMock.listar)
        .toHaveBeenCalledOnce();
    });

    it('debe cargar las solicitudes recibidas', () => {
      component.cargarSolicitudes();

      expect(component.solicitudes)
        .toEqual([
          solicitudPendiente,
          solicitudTransito
        ]);

      expect(component.solicitudes)
        .toHaveLength(2);
    });

    it('debe conservar ID y código de las solicitudes', () => {
      component.cargarSolicitudes();

      expect(component.solicitudes[0].id)
        .toBe(100);

      expect(
        component.solicitudes[1]
          .codigoSeguimiento
      ).toBe('RAM-20260712-0002');
    });

    it('debe manejar data nula como una lista vacía', () => {
      solicitudServiceMock.listar
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin solicitudes',
            data: null,
            timestamp: '2026-07-12T13:00:00'
          })
        );

      component.cargarSolicitudes();

      expect(component.solicitudes)
        .toEqual([]);
    });

    it('debe limpiar las solicitudes cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      const errorMock = {
        status: 500
      };

      component.solicitudes = [
        solicitudPendiente
      ];

      solicitudServiceMock.listar
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.cargarSolicitudes();

      expect(component.solicitudes)
        .toEqual([]);

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al cargar solicitudes',
          errorMock
        );

      consoleSpy.mockRestore();
    });

  });

  describe('abrirCrear', () => {

    it('debe abrir el modal', () => {
      component.abrirCrear();

      expect(component.showCreateModal)
        .toBe(true);
    });

    it('debe reiniciar el formulario', () => {
      component.form = {
        solicitudEnvioId: 100,
        titulo: 'Título anterior',
        descripcion: 'Descripción anterior',
        creadaPorId: 99,
        asignadaAId: 50
      };

      component.abrirCrear();

      expect(component.form)
        .toEqual({
          solicitudEnvioId: 0,
          titulo: '',
          descripcion: '',
          creadaPorId: 1,
          asignadaAId: null
        });
    });

    it('debe usar operadorId como creador', () => {
      component.operadorId = 25;

      component.abrirCrear();

      expect(component.form.creadaPorId)
        .toBe(25);
    });

    it('debe limpiar asignadaAId', () => {
      component.form.asignadaAId = 20;

      component.abrirCrear();

      expect(component.form.asignadaAId)
        .toBeNull();
    });

  });

  describe('cerrarCrear', () => {

    it('debe cerrar el modal', () => {
      component.showCreateModal = true;

      component.cerrarCrear();

      expect(component.showCreateModal)
        .toBe(false);
    });

    it('debe mantener cerrado el modal', () => {
      component.showCreateModal = false;

      component.cerrarCrear();

      expect(component.showCreateModal)
        .toBe(false);
    });

    it('no debe limpiar el formulario al cerrar', () => {
      component.form = {
        solicitudEnvioId: 100,
        titulo: 'Paquete retrasado',
        descripcion: 'Sin movimiento',
        creadaPorId: 1,
        asignadaAId: null
      };

      component.cerrarCrear();

      expect(component.form.titulo)
        .toBe('Paquete retrasado');

      expect(component.form.solicitudEnvioId)
        .toBe(100);
    });

  });

  describe('formatearEstado', () => {

    it('debe reemplazar guiones bajos', () => {
      expect(
        component.formatearEstado(
          'EN_PROCESO'
        )
      ).toBe('EN PROCESO');
    });

    it('debe conservar ABIERTA', () => {
      expect(
        component.formatearEstado(
          'ABIERTA'
        )
      ).toBe('ABIERTA');
    });

    it('debe conservar RESUELTA', () => {
      expect(
        component.formatearEstado(
          'RESUELTA'
        )
      ).toBe('RESUELTA');
    });

    it('debe aceptar cadena vacía', () => {
      expect(
        component.formatearEstado('')
      ).toBe('');
    });

    it('debe reemplazar varios guiones bajos', () => {
      expect(
        component.formatearEstado(
          'ESTADO_DE_PRUEBA'
        )
      ).toBe('ESTADO DE PRUEBA');
    });

  });

  describe('Plantilla para ADMIN', () => {

    beforeEach(() => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      fixture.detectChanges();
    });

    it('debe mostrar el título Gestión de Incidencias', () => {
      const titulo =
        fixture.nativeElement
          .querySelector('h1') as HTMLElement;

      expect(titulo.textContent?.trim())
        .toBe('Gestión de Incidencias');
    });

    it('debe mostrar el texto descriptivo', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Administra problemas y reclamos asociados a envíos.'
      );
    });

    it('debe mostrar el botón Nueva Incidencia', () => {
      const botones =
        Array.from(
          fixture.nativeElement
            .querySelectorAll('button')
        ) as HTMLButtonElement[];

      const boton =
        botones.find(
          item =>
            item.textContent?.trim() ===
            'Nueva Incidencia'
        );

      expect(boton)
        .toBeDefined();
    });

    it('debe mostrar cuatro incidencias', () => {
      const filas =
        fixture.nativeElement
          .querySelectorAll(
            'tbody tr'
          );

      expect(filas.length)
        .toBe(4);
    });

    it('debe mostrar códigos, títulos y descripciones', () => {
      const contenido =
        fixture.nativeElement.textContent;

      expect(contenido)
        .toContain('RAM-20260712-0001');

      expect(contenido)
        .toContain('Paquete retrasado');

      expect(contenido)
        .toContain(
          'El envío no ha avanzado desde ayer.'
        );
    });

    it('debe mostrar los estados formateados', () => {
      const contenido =
        fixture.nativeElement.textContent;

      expect(contenido)
        .toContain('ABIERTA');

      expect(contenido)
        .toContain('EN PROCESO');

      expect(contenido)
        .toContain('RESUELTA');

      expect(contenido)
        .toContain('CERRADA');
    });

    it('debe aplicar badge-warning a ABIERTA', () => {
      const badges =
        fixture.nativeElement
          .querySelectorAll('.badge');

      expect(
        badges[0].classList
          .contains('badge-warning')
      ).toBe(true);
    });

    it('debe aplicar badge-danger a EN_PROCESO', () => {
      const badges =
        fixture.nativeElement
          .querySelectorAll('.badge');

      expect(
        badges[1].classList
          .contains('badge-danger')
      ).toBe(true);
    });

    it('debe aplicar badge-success a RESUELTA', () => {
      const badges =
        fixture.nativeElement
          .querySelectorAll('.badge');

      expect(
        badges[2].classList
          .contains('badge-success')
      ).toBe(true);
    });

    it('debe aplicar badge-closed a CERRADA', () => {
      const badges =
        fixture.nativeElement
          .querySelectorAll('.badge');

      expect(
        badges[3].classList
          .contains('badge-closed')
      ).toBe(true);
    });

    it('debe mostrar Tomar para ABIERTA', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('Tomar');
    });

    it('debe mostrar Resolver para EN_PROCESO', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('Resolver');
    });

    it('debe mostrar Cerrar para RESUELTA', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('Cerrar');
    });

    it('no debe mostrar acción para una incidencia cerrada', () => {
      const filas =
        Array.from(
          fixture.nativeElement
            .querySelectorAll('tbody tr')
        ) as HTMLElement[];

      expect(filas[3].textContent)
        .not.toContain('Tomar');

      expect(filas[3].textContent)
        .not.toContain('Resolver');

      expect(filas[3].textContent)
        .not.toContain('Cerrar');
    });

  });

  describe('Plantilla según rol', () => {

    it('OPERADOR no debe ver Nueva Incidencia', () => {
      authServiceMock.getRole
        .mockReturnValue('OPERADOR');

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).not.toContain('Nueva Incidencia');
    });

    it('CLIENTE no debe ver Nueva Incidencia', () => {
      authServiceMock.getRole
        .mockReturnValue('CLIENTE');

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).not.toContain('Nueva Incidencia');
    });

    it('OPERADOR no debe ver la columna Acción', () => {
      authServiceMock.getRole
        .mockReturnValue('OPERADOR');

      fixture.detectChanges();

      const encabezados =
        Array.from(
          fixture.nativeElement
            .querySelectorAll('th')
        ) as HTMLElement[];

      const textos =
        encabezados.map(
          item => item.textContent?.trim()
        );

      expect(textos)
        .not.toContain('Acción');
    });

    it('ADMIN debe ver la columna Acción', () => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      fixture.detectChanges();

      const encabezados =
        Array.from(
          fixture.nativeElement
            .querySelectorAll('th')
        ) as HTMLElement[];

      const textos =
        encabezados.map(
          item => item.textContent?.trim()
        );

      expect(textos)
        .toContain('Acción');
    });

  });

  describe('Estados de carga y lista vacía', () => {

    it('debe mostrar Cargando incidencias mientras espera', () => {
      const subject =
        new Subject<
          ApiResponse<Incidencia[]>
        >();

      incidenciaServiceMock.listar
        .mockReturnValue(
          subject.asObservable()
        );

      fixture.detectChanges();

      expect(component.loading)
        .toBe(true);

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Cargando incidencias...'
      );

      subject.next(
        respuestaIncidencias
      );

      subject.complete();
    });

    it('debe mostrar mensaje cuando no hay incidencias', () => {
      incidenciaServiceMock.listar
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin incidencias',
            data: [],
            timestamp: '2026-07-12T13:00:00'
          })
        );

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'No hay incidencias registradas.'
      );
    });

    it('no debe mostrar la tabla cuando no hay incidencias', () => {
      incidenciaServiceMock.listar
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin incidencias',
            data: [],
            timestamp: '2026-07-12T13:00:00'
          })
        );

      fixture.detectChanges();

      expect(
        fixture.nativeElement
          .querySelector('table')
      ).toBeNull();
    });

  });

  describe('Plantilla del modal de creación', () => {

    beforeEach(() => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      component.abrirCrear();

      component.solicitudes = [
        solicitudPendiente,
        solicitudTransito
      ];

      fixture.detectChanges();
    });

    it('debe mostrar el modal', () => {
      expect(
        fixture.nativeElement
          .querySelector('.edit-modal')
      ).not.toBeNull();
    });

    it('debe mostrar el título Nueva Incidencia', () => {
      const titulo =
        fixture.nativeElement
          .querySelector(
            '.modal-header h2'
          ) as HTMLElement;

      expect(titulo.textContent?.trim())
        .toBe('Nueva Incidencia');
    });

    it('debe mostrar dos solicitudes en el selector', () => {
      const opciones =
        fixture.nativeElement
          .querySelectorAll(
            'select option'
          );

      /*
       * Una opción placeholder y dos solicitudes.
       */
      expect(opciones.length)
        .toBe(3);
    });

    it('debe mostrar códigos y rutas en el selector', () => {
      const contenido =
        fixture.nativeElement.textContent;

      expect(contenido)
        .toContain('RAM-20260712-0001');

      expect(contenido)
        .toContain('San Antonio');

      expect(contenido)
        .toContain('Santiago');
    });

    it('debe mostrar campo de título', () => {
      expect(
        fixture.nativeElement
          .querySelector(
            'input[name="titulo"]'
          )
      ).not.toBeNull();
    });

    it('debe mostrar campo de descripción', () => {
      expect(
        fixture.nativeElement
          .querySelector(
            'textarea[name="descripcion"]'
          )
      ).not.toBeNull();
    });

    it('debe mostrar botones Cancelar y Crear Incidencia', () => {
      const botones =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.modal-actions button'
            )
        ) as HTMLButtonElement[];

      const textos =
        botones.map(
          boton =>
            boton.textContent?.trim()
        );

      expect(textos)
        .toContain('Cancelar');

      expect(textos)
        .toContain('Crear Incidencia');
    });

    it('no debe mostrar modal para OPERADOR aunque showCreateModal sea true', () => {
      authServiceMock.getRole
        .mockReturnValue('OPERADOR');

      fixture.detectChanges();

      expect(
        fixture.nativeElement
          .querySelector('.edit-modal')
      ).toBeNull();
    });

  });

    describe('crearIncidencia: validaciones', () => {

    beforeEach(() => {
      component.form = {
        solicitudEnvioId: 100,
        titulo: 'Paquete retrasado',
        descripcion: 'El envío no presenta movimiento.',
        creadaPorId: 1,
        asignadaAId: null
      };
    });

    it('debe rechazar solicitudEnvioId igual a cero', () => {
      component.form.solicitudEnvioId = 0;

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(() => undefined);

      component.crearIncidencia();

      expect(alertSpy)
        .toHaveBeenCalledWith(
          'Debes seleccionar una solicitud e ingresar título y descripción.'
        );

      expect(incidenciaServiceMock.crear)
        .not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('debe rechazar solicitudEnvioId negativo', () => {
      component.form.solicitudEnvioId = -1;

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(() => undefined);

      component.crearIncidencia();

      expect(incidenciaServiceMock.crear)
        .not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('debe rechazar título vacío', () => {
      component.form.titulo = '';

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(() => undefined);

      component.crearIncidencia();

      expect(alertSpy)
        .toHaveBeenCalledWith(
          'Debes seleccionar una solicitud e ingresar título y descripción.'
        );

      expect(incidenciaServiceMock.crear)
        .not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('debe rechazar título con solo espacios', () => {
      component.form.titulo = '   ';

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(() => undefined);

      component.crearIncidencia();

      expect(incidenciaServiceMock.crear)
        .not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('debe rechazar descripción vacía', () => {
      component.form.descripcion = '';

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(() => undefined);

      component.crearIncidencia();

      expect(alertSpy)
        .toHaveBeenCalledWith(
          'Debes seleccionar una solicitud e ingresar título y descripción.'
        );

      expect(incidenciaServiceMock.crear)
        .not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('debe rechazar descripción con solo espacios', () => {
      component.form.descripcion = '   ';

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(() => undefined);

      component.crearIncidencia();

      expect(incidenciaServiceMock.crear)
        .not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('no debe cerrar el modal cuando la validación falla', () => {
      component.showCreateModal = true;
      component.form.titulo = '';

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(() => undefined);

      component.crearIncidencia();

      expect(component.showCreateModal)
        .toBe(true);

      alertSpy.mockRestore();
    });

  });

  describe('crearIncidencia: éxito', () => {

    const incidenciaCreada: Incidencia = {
      id: 10,
      solicitudEnvioId: 100,
      codigoSeguimiento: 'RAM-20260712-0001',
      titulo: 'Paquete retrasado',
      descripcion: 'El envío no presenta movimiento.',
      estado: 'ABIERTA',
      fechaCreacion: '2026-07-12T14:00:00',
      fechaActualizacion: '2026-07-12T14:00:00'
    };

    beforeEach(() => {
      component.form = {
        solicitudEnvioId: 100,
        titulo: 'Paquete retrasado',
        descripcion: 'El envío no presenta movimiento.',
        creadaPorId: 1,
        asignadaAId: null
      };

      component.showCreateModal = true;

      incidenciaServiceMock.crear
        .mockReturnValue(
          of({
            success: true,
            message: 'Incidencia creada correctamente',
            data: incidenciaCreada,
            timestamp: '2026-07-12T14:00:00'
          })
        );
    });

    it('debe llamar al servicio crear', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarIncidencias'
        ).mockImplementation(() => undefined);

      const cerrarSpy =
        vi.spyOn(
          component,
          'cerrarCrear'
        ).mockImplementation(() => undefined);

      component.crearIncidencia();

      expect(incidenciaServiceMock.crear)
        .toHaveBeenCalledOnce();

      cargarSpy.mockRestore();
      cerrarSpy.mockRestore();
    });

    it('debe enviar el formulario completo', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarIncidencias'
        ).mockImplementation(() => undefined);

      const cerrarSpy =
        vi.spyOn(
          component,
          'cerrarCrear'
        ).mockImplementation(() => undefined);

      component.crearIncidencia();

      expect(incidenciaServiceMock.crear)
        .toHaveBeenCalledWith({
          solicitudEnvioId: 100,
          titulo: 'Paquete retrasado',
          descripcion: 'El envío no presenta movimiento.',
          creadaPorId: 1,
          asignadaAId: null
        });

      cargarSpy.mockRestore();
      cerrarSpy.mockRestore();
    });

    it('debe volver a cargar las incidencias', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarIncidencias'
        ).mockImplementation(() => undefined);

      const cerrarSpy =
        vi.spyOn(
          component,
          'cerrarCrear'
        ).mockImplementation(() => undefined);

      component.crearIncidencia();

      expect(cargarSpy)
        .toHaveBeenCalledOnce();

      cargarSpy.mockRestore();
      cerrarSpy.mockRestore();
    });

    it('debe cerrar el modal después de crear', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarIncidencias'
        ).mockImplementation(() => undefined);

      component.crearIncidencia();

      expect(component.showCreateModal)
        .toBe(false);

      cargarSpy.mockRestore();
    });

    it('debe cargar incidencias antes de cerrar el modal', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarIncidencias'
        ).mockImplementation(() => undefined);

      const cerrarSpy =
        vi.spyOn(
          component,
          'cerrarCrear'
        ).mockImplementation(() => undefined);

      component.crearIncidencia();

      expect(
        cargarSpy.mock.invocationCallOrder[0]
      ).toBeLessThan(
        cerrarSpy.mock.invocationCallOrder[0]
      );

      cargarSpy.mockRestore();
      cerrarSpy.mockRestore();
    });

  });

  describe('crearIncidencia: error', () => {

    beforeEach(() => {
      component.form = {
        solicitudEnvioId: 100,
        titulo: 'Paquete retrasado',
        descripcion: 'El envío no presenta movimiento.',
        creadaPorId: 1,
        asignadaAId: null
      };
    });

    it('debe registrar el error recibido', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(() => undefined);

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(() => undefined);

      const errorMock = {
        error: {
          message: 'Ya existe una incidencia abierta'
        }
      };

      incidenciaServiceMock.crear
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.crearIncidencia();

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al crear incidencia',
          errorMock
        );

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('debe mostrar el mensaje enviado por el backend', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(() => undefined);

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(() => undefined);

      incidenciaServiceMock.crear
        .mockReturnValue(
          throwError(() => ({
            error: {
              message: 'Ya existe una incidencia abierta'
            }
          }))
        );

      component.crearIncidencia();

      expect(alertSpy)
        .toHaveBeenCalledWith(
          'Ya existe una incidencia abierta'
        );

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('debe mostrar mensaje genérico sin detalle del backend', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(() => undefined);

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(() => undefined);

      incidenciaServiceMock.crear
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.crearIncidencia();

      expect(alertSpy)
        .toHaveBeenCalledWith(
          'No se pudo crear la incidencia'
        );

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('no debe cargar incidencias cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(() => undefined);

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(() => undefined);

      incidenciaServiceMock.crear
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      const cargarSpy =
        vi.spyOn(
          component,
          'cargarIncidencias'
        ).mockImplementation(() => undefined);

      component.crearIncidencia();

      expect(cargarSpy)
        .not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('no debe cerrar el modal cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(() => undefined);

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(() => undefined);

      component.showCreateModal = true;

      incidenciaServiceMock.crear
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.crearIncidencia();

      expect(component.showCreateModal)
        .toBe(true);

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

  });

  describe('cambiarEstado', () => {

    beforeEach(() => {
      incidenciaServiceMock.actualizarEstado
        .mockReturnValue(
          of({
            success: true,
            message: 'Estado actualizado correctamente',
            data: {
              ...incidenciaAbierta,
              estado: 'EN_PROCESO'
            },
            timestamp: '2026-07-12T14:00:00'
          })
        );
    });

    it('debe llamar al servicio actualizarEstado', () => {
      component.cambiarEstado(
        incidenciaAbierta,
        'EN_PROCESO'
      );

      expect(
        incidenciaServiceMock.actualizarEstado
      ).toHaveBeenCalledOnce();
    });

    it('debe enviar el ID correcto', () => {
      component.cambiarEstado(
        incidenciaAbierta,
        'EN_PROCESO'
      );

      expect(
        incidenciaServiceMock.actualizarEstado
      ).toHaveBeenCalledWith(
        1,
        expect.any(Object)
      );
    });

    it('debe enviar estado y operador', () => {
      component.operadorId = 25;

      component.cambiarEstado(
        incidenciaAbierta,
        'EN_PROCESO'
      );

      expect(
        incidenciaServiceMock.actualizarEstado
      ).toHaveBeenCalledWith(
        1,
        {
          estado: 'EN_PROCESO',
          asignadaAId: 25
        }
      );
    });

    it('debe permitir pasar de ABIERTA a EN_PROCESO', () => {
      component.cambiarEstado(
        incidenciaAbierta,
        'EN_PROCESO'
      );

      expect(
        incidenciaServiceMock.actualizarEstado
      ).toHaveBeenCalledWith(
        1,
        {
          estado: 'EN_PROCESO',
          asignadaAId: 1
        }
      );
    });

    it('debe permitir pasar de EN_PROCESO a RESUELTA', () => {
      component.cambiarEstado(
        incidenciaProceso,
        'RESUELTA'
      );

      expect(
        incidenciaServiceMock.actualizarEstado
      ).toHaveBeenCalledWith(
        2,
        {
          estado: 'RESUELTA',
          asignadaAId: 1
        }
      );
    });

    it('debe permitir pasar de RESUELTA a CERRADA', () => {
      component.cambiarEstado(
        incidenciaResuelta,
        'CERRADA'
      );

      expect(
        incidenciaServiceMock.actualizarEstado
      ).toHaveBeenCalledWith(
        3,
        {
          estado: 'CERRADA',
          asignadaAId: 1
        }
      );
    });

    it('debe recargar incidencias después del éxito', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarIncidencias'
        ).mockImplementation(() => undefined);

      component.cambiarEstado(
        incidenciaAbierta,
        'EN_PROCESO'
      );

      expect(cargarSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe registrar el error de actualización', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(() => undefined);

      const errorMock = {
        status: 500
      };

      incidenciaServiceMock.actualizarEstado
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.cambiarEstado(
        incidenciaAbierta,
        'EN_PROCESO'
      );

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al actualizar incidencia',
          errorMock
        );

      consoleSpy.mockRestore();
    });

    it('no debe recargar incidencias cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(() => undefined);

      incidenciaServiceMock.actualizarEstado
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      const cargarSpy =
        vi.spyOn(
          component,
          'cargarIncidencias'
        ).mockImplementation(() => undefined);

      component.cambiarEstado(
        incidenciaAbierta,
        'EN_PROCESO'
      );

      expect(cargarSpy)
        .not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

  });

  describe('Interacción del modal', () => {

    beforeEach(() => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      component.solicitudes = [
        solicitudPendiente,
        solicitudTransito
      ];

      component.abrirCrear();

      fixture.detectChanges();
    });

    it('debe ejecutar cerrarCrear al presionar X', () => {
      const cerrarSpy =
        vi.spyOn(
          component,
          'cerrarCrear'
        ).mockImplementation(() => undefined);

      const boton =
        fixture.nativeElement.querySelector(
          '.modal-header button'
        ) as HTMLButtonElement;

      boton.click();

      expect(cerrarSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe ejecutar cerrarCrear al presionar Cancelar', () => {
      const cerrarSpy =
        vi.spyOn(
          component,
          'cerrarCrear'
        ).mockImplementation(() => undefined);

      const botones =
        Array.from(
          fixture.nativeElement.querySelectorAll(
            '.modal-actions button'
          )
        ) as HTMLButtonElement[];

      const cancelar =
        botones.find(
          boton =>
            boton.textContent?.trim() ===
            'Cancelar'
        );

      expect(cancelar)
        .toBeDefined();

      cancelar!.click();

      expect(cerrarSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe ejecutar crearIncidencia al presionar Crear Incidencia', () => {
      const crearSpy =
        vi.spyOn(
          component,
          'crearIncidencia'
        ).mockImplementation(() => undefined);

      const botones =
        Array.from(
          fixture.nativeElement.querySelectorAll(
            '.modal-actions button'
          )
        ) as HTMLButtonElement[];

      const crear =
        botones.find(
          boton =>
            boton.textContent?.trim() ===
            'Crear Incidencia'
        );

      expect(crear)
        .toBeDefined();

      crear!.click();

      expect(crearSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe actualizar solicitudEnvioId mediante ngModel', async () => {
      const select =
        fixture.nativeElement.querySelector(
          'select[name="solicitudEnvioId"]'
        ) as HTMLSelectElement;

      select.value = '101';

      select.dispatchEvent(
        new Event('change', {
          bubbles: true
        })
      );

      await fixture.whenStable();

      expect(
        Number(component.form.solicitudEnvioId)
      ).toBe(101);
    });

    it('debe actualizar el título mediante ngModel', async () => {
      const input =
        fixture.nativeElement.querySelector(
          'input[name="titulo"]'
        ) as HTMLInputElement;

      input.value =
        'Nueva incidencia';

      input.dispatchEvent(
        new Event('input', {
          bubbles: true
        })
      );

      await fixture.whenStable();

      expect(component.form.titulo)
        .toBe('Nueva incidencia');
    });

    it('debe actualizar la descripción mediante ngModel', async () => {
      const textarea =
        fixture.nativeElement.querySelector(
          'textarea[name="descripcion"]'
        ) as HTMLTextAreaElement;

      textarea.value =
        'Descripción detallada del problema';

      textarea.dispatchEvent(
        new Event('input', {
          bubbles: true
        })
      );

      await fixture.whenStable();

      expect(component.form.descripcion)
        .toBe(
          'Descripción detallada del problema'
        );
    });

  });

  describe('Interacción de acciones de tabla', () => {

    beforeEach(() => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      fixture.detectChanges();
    });

    it('debe cambiar ABIERTA a EN_PROCESO al presionar Tomar', () => {
      const cambiarSpy =
        vi.spyOn(
          component,
          'cambiarEstado'
        ).mockImplementation(() => undefined);

      const filas =
        Array.from(
          fixture.nativeElement.querySelectorAll(
            'tbody tr'
          )
        ) as HTMLElement[];

      const boton =
        Array.from(
          filas[0].querySelectorAll('button')
        ).find(
          item =>
            item.textContent?.trim() ===
            'Tomar'
        ) as HTMLButtonElement;

      boton.click();

      expect(cambiarSpy)
        .toHaveBeenCalledWith(
          incidenciaAbierta,
          'EN_PROCESO'
        );
    });

    it('debe cambiar EN_PROCESO a RESUELTA al presionar Resolver', () => {
      const cambiarSpy =
        vi.spyOn(
          component,
          'cambiarEstado'
        ).mockImplementation(() => undefined);

      const filas =
        Array.from(
          fixture.nativeElement.querySelectorAll(
            'tbody tr'
          )
        ) as HTMLElement[];

      const boton =
        Array.from(
          filas[1].querySelectorAll('button')
        ).find(
          item =>
            item.textContent?.trim() ===
            'Resolver'
        ) as HTMLButtonElement;

      boton.click();

      expect(cambiarSpy)
        .toHaveBeenCalledWith(
          incidenciaProceso,
          'RESUELTA'
        );
    });

    it('debe cambiar RESUELTA a CERRADA al presionar Cerrar', () => {
      const cambiarSpy =
        vi.spyOn(
          component,
          'cambiarEstado'
        ).mockImplementation(() => undefined);

      const filas =
        Array.from(
          fixture.nativeElement.querySelectorAll(
            'tbody tr'
          )
        ) as HTMLElement[];

      const boton =
        Array.from(
          filas[2].querySelectorAll('button')
        ).find(
          item =>
            item.textContent?.trim() ===
            'Cerrar'
        ) as HTMLButtonElement;

      boton.click();

      expect(cambiarSpy)
        .toHaveBeenCalledWith(
          incidenciaResuelta,
          'CERRADA'
        );
    });

    it('no debe existir botón de acción en una incidencia cerrada', () => {
      const filas =
        Array.from(
          fixture.nativeElement.querySelectorAll(
            'tbody tr'
          )
        ) as HTMLElement[];

      expect(
        filas[3].querySelector('button')
      ).toBeNull();
    });

  });

});