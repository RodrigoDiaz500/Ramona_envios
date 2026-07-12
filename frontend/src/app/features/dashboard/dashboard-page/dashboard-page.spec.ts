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
  DashboardResponse,
  DashboardService
} from '../../../../core/services/dashboard.service';

import {
  ApiResponse
} from '../../../../core/services/sucursal.service';

import {
  DashboardPage
} from './dashboard-page';

describe('DashboardPage', () => {

  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  let dashboardServiceMock: {
    obtenerResumen: ReturnType<typeof vi.fn>;
  };

  const dashboardMock: DashboardResponse = {
    totalSolicitudes: 100,
    pendientes: 10,
    aprobadas: 20,
    enPreparacion: 15,
    enTransito: 25,
    entregadas: 35,
    rechazadas: 5,
    totalUsuarios: 48,
    totalSucursales: 6,
    incidenciasAbiertas: 4,
    promedioResenas: 4.6,
    ultimasSolicitudes: [
      {
        id: 1,
        codigoSeguimiento: 'RAM-20260712-0001',
        estado: 'EN_TRANSITO',
        origen: 'San Antonio',
        destino: 'Santiago',
        destinatario: 'María González'
      },
      {
        id: 2,
        codigoSeguimiento: 'RAM-20260712-0002',
        estado: 'PENDIENTE_APROBACION',
        origen: 'Cartagena',
        destino: 'Valparaíso',
        destinatario: 'Pedro Soto'
      }
    ]
  };

  const respuestaDashboard:
    ApiResponse<DashboardResponse> = {
      success: true,
      message:
        'Resumen del dashboard obtenido correctamente',
      data: dashboardMock,
      timestamp: '2026-07-12T12:00:00'
    };

  beforeEach(async () => {
    dashboardServiceMock = {
      obtenerResumen: vi.fn().mockReturnValue(
        of(respuestaDashboard)
      )
    };

    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [
        DashboardPage
      ],
      providers: [
        {
          provide: DashboardService,
          useValue: dashboardServiceMock
        }
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(DashboardPage);

    component =
      fixture.componentInstance;
  });

  describe('Creación e inicialización', () => {

    it('debe crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe iniciar sin datos de dashboard', () => {
      expect(component.dashboard)
        .toBeUndefined();
    });

    it('debe iniciar con loading en false', () => {
      expect(component.loading)
        .toBe(false);
    });

    it('ngOnInit debe llamar a cargarDashboard', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarDashboard'
        );

      component.ngOnInit();

      expect(cargarSpy)
        .toHaveBeenCalledOnce();
    });

  });

  describe('cargarDashboard', () => {

    it('debe llamar al servicio de dashboard', () => {
      component.cargarDashboard();

      expect(
        dashboardServiceMock.obtenerResumen
      ).toHaveBeenCalledOnce();
    });

    it('debe activar loading mientras espera la respuesta', () => {
      const responseSubject =
        new Subject<
          ApiResponse<DashboardResponse>
        >();

      dashboardServiceMock.obtenerResumen
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.cargarDashboard();

      expect(component.loading)
        .toBe(true);

      responseSubject.next(
        respuestaDashboard
      );

      responseSubject.complete();

      expect(component.loading)
        .toBe(false);
    });

    it('debe almacenar la respuesta del dashboard', () => {
      component.cargarDashboard();

      expect(component.dashboard)
        .toEqual(dashboardMock);
    });

    it('debe conservar las métricas principales', () => {
      component.cargarDashboard();

      expect(
        component.dashboard?.totalSolicitudes
      ).toBe(100);

      expect(
        component.dashboard?.enPreparacion
      ).toBe(15);

      expect(
        component.dashboard?.enTransito
      ).toBe(25);

      expect(
        component.dashboard?.entregadas
      ).toBe(35);
    });

    it('debe conservar incidencias y promedio de reseñas', () => {
      component.cargarDashboard();

      expect(
        component.dashboard?.incidenciasAbiertas
      ).toBe(4);

      expect(
        component.dashboard?.promedioResenas
      ).toBe(4.6);
    });

    it('debe conservar las últimas solicitudes', () => {
      component.cargarDashboard();

      expect(
        component.dashboard?.ultimasSolicitudes
      ).toHaveLength(2);

      expect(
        component.dashboard
          ?.ultimasSolicitudes[0]
          .codigoSeguimiento
      ).toBe('RAM-20260712-0001');
    });

    it('debe finalizar loading después de una respuesta exitosa', () => {
      component.cargarDashboard();

      expect(component.loading)
        .toBe(false);
    });

    it('debe registrar el error cuando falla la carga', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      const errorMock = {
        status: 500
      };

      dashboardServiceMock.obtenerResumen
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.cargarDashboard();

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al cargar dashboard',
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

      dashboardServiceMock.obtenerResumen
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.cargarDashboard();

      expect(component.loading)
        .toBe(false);

      consoleSpy.mockRestore();
    });

    it('debe conservar el dashboard anterior cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      component.dashboard =
        dashboardMock;

      dashboardServiceMock.obtenerResumen
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.cargarDashboard();

      expect(component.dashboard)
        .toEqual(dashboardMock);

      consoleSpy.mockRestore();
    });

  });

  describe('porcentaje', () => {

    it('debe retornar 0 cuando no existe dashboard', () => {
      component.dashboard =
        undefined;

      expect(
        component.porcentaje(20)
      ).toBe(0);
    });

    it('debe retornar 0 cuando totalSolicitudes es cero', () => {
      component.dashboard = {
        ...dashboardMock,
        totalSolicitudes: 0
      };

      expect(
        component.porcentaje(20)
      ).toBe(0);
    });

    it('debe calcular correctamente el porcentaje', () => {
      component.dashboard =
        dashboardMock;

      expect(
        component.porcentaje(20)
      ).toBe(20);
    });

    it('debe redondear el porcentaje', () => {
      component.dashboard = {
        ...dashboardMock,
        totalSolicitudes: 3
      };

      expect(
        component.porcentaje(1)
      ).toBe(33);
    });

    it('debe retornar 100 cuando el valor coincide con el total', () => {
      component.dashboard =
        dashboardMock;

      expect(
        component.porcentaje(100)
      ).toBe(100);
    });

    it('debe retornar 0 cuando el valor es cero', () => {
      component.dashboard =
        dashboardMock;

      expect(
        component.porcentaje(0)
      ).toBe(0);
    });

  });

  describe('estadoTexto', () => {

    it('debe reemplazar guiones bajos por espacios', () => {
      expect(
        component.estadoTexto(
          'PENDIENTE_APROBACION'
        )
      ).toBe('PENDIENTE APROBACION');
    });

    it('debe reemplazar todos los guiones bajos', () => {
      expect(
        component.estadoTexto(
          'EN_PREPARACION_SUCURSAL'
        )
      ).toBe(
        'EN PREPARACION SUCURSAL'
      );
    });

    it('debe conservar un estado sin guiones bajos', () => {
      expect(
        component.estadoTexto(
          'ENTREGADO'
        )
      ).toBe('ENTREGADO');
    });

    it('debe permitir una cadena vacía', () => {
      expect(
        component.estadoTexto('')
      ).toBe('');
    });

  });

  describe('Plantilla inicial', () => {

    it('debe mostrar el título Dashboard Operacional', () => {
      fixture.detectChanges();

      const titulo = fixture.nativeElement.querySelector('h1') as HTMLElement;

      expect(
        titulo.textContent?.trim()
      ).toBe(
        'Dashboard Operacional'
      );
    });

    it('debe mostrar el texto descriptivo', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Resumen general de Ramona Express.'
      );
    });

    it('debe mostrar el botón Actualizar', () => {
      fixture.detectChanges();

      const boton =
        fixture.nativeElement
          .querySelector(
            '.dashboard-header button'
          ) as HTMLButtonElement;

      expect(
        boton.textContent?.trim()
      ).toBe('Actualizar');
    });

    it('debe ejecutar cargarDashboard al presionar Actualizar', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarDashboard'
        ).mockImplementation(
          () => undefined
        );

      fixture.detectChanges();
      cargarSpy.mockClear();

      const boton =
        fixture.nativeElement
          .querySelector(
            '.dashboard-header button'
          ) as HTMLButtonElement;

      boton.click();

      expect(cargarSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe mostrar Cargando dashboard durante la carga', () => {
      const responseSubject =
        new Subject<
          ApiResponse<DashboardResponse>
        >();

      dashboardServiceMock.obtenerResumen
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.loading = true;

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Cargando dashboard...'
      );

      responseSubject.next(
        respuestaDashboard
      );

      responseSubject.complete();
    });

    it('no debe mostrar las métricas mientras loading es true', () => {
      const responseSubject =
        new Subject<
          ApiResponse<DashboardResponse>
        >();

      dashboardServiceMock.obtenerResumen
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.loading = true;
      component.dashboard =
        dashboardMock;

      fixture.detectChanges();

      expect(
        fixture.nativeElement
          .querySelector('.stats-grid')
      ).toBeNull();

      responseSubject.next(
        respuestaDashboard
      );

      responseSubject.complete();
    });

  });

  describe('Plantilla con datos', () => {

    it('debe mostrar las seis tarjetas de estadísticas', () => {
      fixture.detectChanges();

      const tarjetas =
        fixture.nativeElement
          .querySelectorAll('.stat-card');

      expect(tarjetas.length)
        .toBe(6);
    });

    it('debe mostrar el total de envíos', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('100');

      expect(
        fixture.nativeElement.textContent
      ).toContain('Total envíos');
    });

    it('debe mostrar envíos en preparación', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('15');

      expect(
        fixture.nativeElement.textContent
      ).toContain('En preparación');
    });

    it('debe mostrar envíos en tránsito', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('25');

      expect(
        fixture.nativeElement.textContent
      ).toContain('En tránsito');
    });

    it('debe mostrar entregadas', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('35');

      expect(
        fixture.nativeElement.textContent
      ).toContain('Entregadas');
    });

    it('debe mostrar incidencias abiertas', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('4');

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Incidencias abiertas'
      );
    });

    it('debe mostrar promedio de reseñas', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('4.6');

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Promedio reseñas'
      );
    });

    it('debe mostrar 0 cuando promedioResenas es cero', () => {
      dashboardServiceMock.obtenerResumen
        .mockReturnValue(
          of({
            ...respuestaDashboard,
            data: {
              ...dashboardMock,
              promedioResenas: 0
            }
          })
        );

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Promedio reseñas'
      );

      const tarjetaResenas =
        fixture.nativeElement
          .querySelector(
            '.stat-card.secondary h2'
          ) as HTMLElement;

      expect(
        tarjetaResenas.textContent?.trim()
      ).toBe('0');
    });

    it('debe mostrar usuarios registrados', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Usuarios registrados'
      );

      expect(
        fixture.nativeElement.textContent
      ).toContain('48');
    });

    it('debe mostrar sucursales activas', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Sucursales activas'
      );

      expect(
        fixture.nativeElement.textContent
      ).toContain('6');
    });

    it('debe mostrar rechazadas', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('Rechazadas');

      expect(
        fixture.nativeElement.textContent
      ).toContain('5');
    });

  });

  describe('Distribución de estados', () => {

    it('debe mostrar cinco barras de progreso', () => {
      fixture.detectChanges();

      const barras =
        fixture.nativeElement
          .querySelectorAll(
            '.progress-item'
          );

      expect(barras.length)
        .toBe(5);
    });

    it('debe mostrar 20% para aprobadas', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('20%');
    });

    it('debe aplicar el ancho correcto a la barra de aprobadas', () => {
      fixture.detectChanges();

      const barra =
        fixture.nativeElement
          .querySelector(
            '.progress-item .bar span'
          ) as HTMLElement;

      expect(barra.style.width)
        .toBe('20%');
    });

    it('debe mostrar 15% para en preparación', () => {
      fixture.detectChanges();

      const items =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.progress-item'
            )
        ) as HTMLElement[];

      expect(items[1].textContent)
        .toContain('15%');
    });

    it('debe mostrar 25% para en tránsito', () => {
      fixture.detectChanges();

      const items =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.progress-item'
            )
        ) as HTMLElement[];

      expect(items[2].textContent)
        .toContain('25%');
    });

    it('debe mostrar 35% para entregadas', () => {
      fixture.detectChanges();

      const items =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.progress-item'
            )
        ) as HTMLElement[];

      expect(items[3].textContent)
        .toContain('35%');
    });

    it('debe mostrar 5% para rechazadas', () => {
      fixture.detectChanges();

      const items =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.progress-item'
            )
        ) as HTMLElement[];

      expect(items[4].textContent)
        .toContain('5%');
    });

  });

  describe('Últimas solicitudes', () => {

    it('debe mostrar el título Últimas Solicitudes', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Últimas Solicitudes'
      );
    });

    it('debe mostrar las solicitudes recientes', () => {
      fixture.detectChanges();

      const items =
        fixture.nativeElement
          .querySelectorAll(
            '.shipment-item'
          );

      expect(items.length)
        .toBe(2);
    });

    it('debe mostrar los códigos de seguimiento', () => {
      fixture.detectChanges();

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
    });

    it('debe mostrar origen y destino', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'San Antonio → Santiago'
      );

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Cartagena → Valparaíso'
      );
    });

    it('debe mostrar los destinatarios', () => {
      fixture.detectChanges();

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

    it('debe mostrar el estado sin guiones bajos', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('EN TRANSITO');

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'PENDIENTE APROBACION'
      );
    });

    it('debe mostrar mensaje cuando no existen solicitudes recientes', () => {
      dashboardServiceMock.obtenerResumen
        .mockReturnValue(
          of({
            ...respuestaDashboard,
            data: {
              ...dashboardMock,
              ultimasSolicitudes: []
            }
          })
        );

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'No hay solicitudes recientes.'
      );

      expect(
        fixture.nativeElement
          .querySelectorAll(
            '.shipment-item'
          ).length
      ).toBe(0);
    });

  });

});