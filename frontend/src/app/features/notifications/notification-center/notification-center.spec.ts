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
  Notificacion,
  NotificacionApiService
} from '../../../../core/services/notificacion-api.service';

import {
  ApiResponse
} from '../../../../core/services/sucursal.service';

import {
  NotificationCenter
} from './notification-center';

describe('NotificationCenter', () => {

  let component: NotificationCenter;
  let fixture: ComponentFixture<NotificationCenter>;

  let notificacionServiceMock: {
    listarPorUsuario: ReturnType<typeof vi.fn>;
    marcarComoLeida: ReturnType<typeof vi.fn>;
  };

  let authServiceMock: {
    getUserId: ReturnType<typeof vi.fn>;
  };

  const notificacionNoLeida: Notificacion = {
    id: 1,
    titulo: 'Envío creado',
    mensaje:
      'Tu solicitud RAM-20260712-0001 fue creada correctamente.',
    leida: false,
    fechaCreacion: '2026-07-12T10:30:00'
  };

  const notificacionLeida: Notificacion = {
    id: 2,
    titulo: 'Estado actualizado',
    mensaje:
      'Tu envío ahora se encuentra en tránsito.',
    leida: true,
    fechaCreacion: '2026-07-12T11:00:00'
  };

  const notificacionIncidencia: Notificacion = {
    id: 3,
    titulo: 'Incidencia resuelta',
    mensaje:
      'La incidencia asociada al envío fue resuelta.',
    leida: false,
    fechaCreacion: '2026-07-12T12:00:00'
  };

  const respuestaNotificaciones:
    ApiResponse<Notificacion[]> = {
      success: true,
      message:
        'Notificaciones obtenidas correctamente',
      data: [
        notificacionNoLeida,
        notificacionLeida,
        notificacionIncidencia
      ],
      timestamp: '2026-07-12T12:30:00'
    };

  beforeEach(async () => {
    /*
     * Se crean copias nuevas en cada prueba porque el componente
     * modifica directamente la propiedad leida.
     */
    respuestaNotificaciones.data = [
      {
        ...notificacionNoLeida
      },
      {
        ...notificacionLeida
      },
      {
        ...notificacionIncidencia
      }
    ];

    notificacionServiceMock = {
      listarPorUsuario: vi.fn().mockReturnValue(
        of(respuestaNotificaciones)
      ),

      marcarComoLeida: vi.fn().mockReturnValue(
        of({
          success: true,
          message:
            'Notificación marcada como leída',
          data: {
            ...notificacionNoLeida,
            leida: true
          },
          timestamp: '2026-07-12T13:00:00'
        })
      )
    };

    authServiceMock = {
      getUserId: vi.fn().mockReturnValue(10)
    };

    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [
        NotificationCenter
      ],
      providers: [
        {
          provide: NotificacionApiService,
          useValue: notificacionServiceMock
        },
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(NotificationCenter);

    component =
      fixture.componentInstance;
  });

  describe('Creación del componente', () => {

    it('debe crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe iniciar sin notificaciones', () => {
      expect(component.notifications)
        .toEqual([]);
    });

    it('debe iniciar con loading en false', () => {
      expect(component.loading)
        .toBe(false);
    });

  });

  describe('ngOnInit', () => {

    it('debe llamar a cargarNotificaciones', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarNotificaciones'
        ).mockImplementation(
          () => undefined
        );

      component.ngOnInit();

      expect(cargarSpy)
        .toHaveBeenCalledOnce();
    });

  });

  describe('usuarioId', () => {

    it('debe retornar el ID autenticado', () => {
      authServiceMock.getUserId
        .mockReturnValue(25);

      expect(component.usuarioId)
        .toBe(25);
    });

    it('debe retornar null cuando no existe sesión', () => {
      authServiceMock.getUserId
        .mockReturnValue(null);

      expect(component.usuarioId)
        .toBeNull();
    });

  });

  describe('cargarNotificaciones', () => {

    it('no debe llamar al servicio sin usuario autenticado', () => {
      authServiceMock.getUserId
        .mockReturnValue(null);

      component.cargarNotificaciones();

      expect(
        notificacionServiceMock
          .listarPorUsuario
      ).not.toHaveBeenCalled();
    });

    it('debe limpiar las notificaciones sin usuario autenticado', () => {
      authServiceMock.getUserId
        .mockReturnValue(null);

      component.notifications = [
        {
          ...notificacionNoLeida
        }
      ];

      component.cargarNotificaciones();

      expect(component.notifications)
        .toEqual([]);
    });

    it('no debe activar loading sin usuario autenticado', () => {
      authServiceMock.getUserId
        .mockReturnValue(null);

      component.cargarNotificaciones();

      expect(component.loading)
        .toBe(false);
    });

    it('debe llamar al servicio con el ID correcto', () => {
      component.cargarNotificaciones();

      expect(
        notificacionServiceMock
          .listarPorUsuario
      ).toHaveBeenCalledOnce();

      expect(
        notificacionServiceMock
          .listarPorUsuario
      ).toHaveBeenCalledWith(10);
    });

    it('debe activar loading mientras espera la respuesta', () => {
      const responseSubject =
        new Subject<
          ApiResponse<Notificacion[]>
        >();

      notificacionServiceMock.listarPorUsuario
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.cargarNotificaciones();

      expect(component.loading)
        .toBe(true);

      responseSubject.next(
        respuestaNotificaciones
      );

      responseSubject.complete();

      expect(component.loading)
        .toBe(false);
    });

    it('debe cargar las notificaciones recibidas', () => {
      component.cargarNotificaciones();

      expect(component.notifications)
        .toEqual(
          respuestaNotificaciones.data
        );

      expect(component.notifications)
        .toHaveLength(3);
    });

    it('debe conservar títulos y mensajes', () => {
      component.cargarNotificaciones();

      expect(
        component.notifications[0].titulo
      ).toBe('Envío creado');

      expect(
        component.notifications[1].mensaje
      ).toContain('en tránsito');
    });

    it('debe conservar el estado leído de cada notificación', () => {
      component.cargarNotificaciones();

      expect(
        component.notifications[0].leida
      ).toBe(false);

      expect(
        component.notifications[1].leida
      ).toBe(true);
    });

    it('debe finalizar loading después del éxito', () => {
      component.cargarNotificaciones();

      expect(component.loading)
        .toBe(false);
    });

    it('debe manejar data nula como lista vacía', () => {
      notificacionServiceMock.listarPorUsuario
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin notificaciones',
            data: null,
            timestamp: '2026-07-12T12:00:00'
          })
        );

      component.cargarNotificaciones();

      expect(component.notifications)
        .toEqual([]);

      expect(component.loading)
        .toBe(false);
    });

    it('debe limpiar la lista cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      const errorMock = {
        status: 500
      };

      component.notifications = [
        {
          ...notificacionNoLeida
        }
      ];

      notificacionServiceMock.listarPorUsuario
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.cargarNotificaciones();

      expect(component.notifications)
        .toEqual([]);

      expect(component.loading)
        .toBe(false);

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al cargar notificaciones',
          errorMock
        );

      consoleSpy.mockRestore();
    });

  });

  describe('marcarComoLeida', () => {

    it('no debe llamar al servicio si ya está leída', () => {
      const notification = {
        ...notificacionLeida
      };

      component.marcarComoLeida(
        notification
      );

      expect(
        notificacionServiceMock
          .marcarComoLeida
      ).not.toHaveBeenCalled();
    });

    it('debe llamar al servicio para una notificación no leída', () => {
      const notification = {
        ...notificacionNoLeida
      };

      component.marcarComoLeida(
        notification
      );

      expect(
        notificacionServiceMock
          .marcarComoLeida
      ).toHaveBeenCalledOnce();
    });

    it('debe enviar el ID correcto', () => {
      const notification = {
        ...notificacionNoLeida
      };

      component.marcarComoLeida(
        notification
      );

      expect(
        notificacionServiceMock
          .marcarComoLeida
      ).toHaveBeenCalledWith(1);
    });

    it('debe cambiar leida a true después del éxito', () => {
      const notification = {
        ...notificacionNoLeida
      };

      expect(notification.leida)
        .toBe(false);

      component.marcarComoLeida(
        notification
      );

      expect(notification.leida)
        .toBe(true);
    });

    it('debe conservar los demás datos después del éxito', () => {
      const notification = {
        ...notificacionNoLeida
      };

      component.marcarComoLeida(
        notification
      );

      expect(notification.id)
        .toBe(1);

      expect(notification.titulo)
        .toBe('Envío creado');

      expect(notification.mensaje)
        .toContain(
          'fue creada correctamente'
        );
    });

    it('debe mantener leida en false cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      const notification = {
        ...notificacionNoLeida
      };

      notificacionServiceMock.marcarComoLeida
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.marcarComoLeida(
        notification
      );

      expect(notification.leida)
        .toBe(false);

      consoleSpy.mockRestore();
    });

    it('debe registrar el error al marcar como leída', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      const errorMock = {
        status: 500
      };

      notificacionServiceMock.marcarComoLeida
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.marcarComoLeida({
        ...notificacionNoLeida
      });

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al marcar como leída',
          errorMock
        );

      consoleSpy.mockRestore();
    });

  });

  describe('Plantilla inicial', () => {

    it('debe mostrar el título Centro de Notificaciones', () => {
      fixture.detectChanges();

      const titulo =
        fixture.nativeElement
          .querySelector('h1') as HTMLElement;

      expect(
        titulo.textContent?.trim()
      ).toBe(
        'Centro de Notificaciones'
      );
    });

    it('debe mostrar el texto descriptivo', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Historial de eventos generados por el sistema.'
      );
    });

    it('debe mostrar Cargando notificaciones mientras espera', () => {
      const responseSubject =
        new Subject<
          ApiResponse<Notificacion[]>
        >();

      notificacionServiceMock.listarPorUsuario
        .mockReturnValue(
          responseSubject.asObservable()
        );

      fixture.detectChanges();

      expect(component.loading)
        .toBe(true);

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Cargando notificaciones...'
      );

      expect(
        fixture.nativeElement
          .querySelectorAll(
            '.notification-card'
          ).length
      ).toBe(0);

      responseSubject.next(
        respuestaNotificaciones
      );

      responseSubject.complete();
    });

    it('debe mostrar mensaje cuando no hay notificaciones', () => {
      notificacionServiceMock.listarPorUsuario
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin notificaciones',
            data: [],
            timestamp: '2026-07-12T12:00:00'
          })
        );

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'No tienes notificaciones.'
      );
    });

    it('no debe mostrar tarjetas cuando la lista está vacía', () => {
      notificacionServiceMock.listarPorUsuario
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin notificaciones',
            data: [],
            timestamp: '2026-07-12T12:00:00'
          })
        );

      fixture.detectChanges();

      expect(
        fixture.nativeElement
          .querySelectorAll(
            '.notification-card'
          ).length
      ).toBe(0);
    });

  });

  describe('Plantilla con notificaciones', () => {

    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debe mostrar tres tarjetas', () => {
      const cards =
        fixture.nativeElement
          .querySelectorAll(
            '.notification-card'
          );

      expect(cards.length)
        .toBe(3);
    });

    it('debe mostrar los títulos', () => {
      const contenido =
        fixture.nativeElement.textContent;

      expect(contenido)
        .toContain('Envío creado');

      expect(contenido)
        .toContain('Estado actualizado');

      expect(contenido)
        .toContain('Incidencia resuelta');
    });

    it('debe mostrar los mensajes', () => {
      const contenido =
        fixture.nativeElement.textContent;

      expect(contenido)
        .toContain(
          'RAM-20260712-0001'
        );

      expect(contenido)
        .toContain(
          'ahora se encuentra en tránsito'
        );
    });

    it('debe mostrar la fecha de creación', () => {
      const cards =
        fixture.nativeElement
          .querySelectorAll(
            '.notification-card'
          );

      expect(cards[0].textContent)
        .toContain('12/07/2026');
    });

    it('debe aplicar unread a las notificaciones no leídas', () => {
      const cards =
        fixture.nativeElement
          .querySelectorAll(
            '.notification-card'
          );

      expect(
        cards[0].classList
          .contains('unread')
      ).toBe(true);

      expect(
        cards[2].classList
          .contains('unread')
      ).toBe(true);
    });

    it('no debe aplicar unread a una notificación leída', () => {
      const cards =
        fixture.nativeElement
          .querySelectorAll(
            '.notification-card'
          );

      expect(
        cards[1].classList
          .contains('unread')
      ).toBe(false);
    });

    it('debe mostrar Nueva para notificaciones no leídas', () => {
      const badges =
        fixture.nativeElement
          .querySelectorAll(
            '.notification-badge'
          );

      expect(badges.length)
        .toBe(2);

      expect(
        badges[0].textContent?.trim()
      ).toBe('Nueva');
    });

    it('no debe mostrar Nueva en una notificación leída', () => {
      const cards =
        fixture.nativeElement
          .querySelectorAll(
            '.notification-card'
          );

      expect(
        cards[1].querySelector(
          '.notification-badge'
        )
      ).toBeNull();
    });

  });

  describe('Interacción con las tarjetas', () => {

    it('debe llamar a marcarComoLeida al hacer clic', () => {
      const marcarSpy =
        vi.spyOn(
          component,
          'marcarComoLeida'
        ).mockImplementation(
          () => undefined
        );

      fixture.detectChanges();

      const cards =
        fixture.nativeElement
          .querySelectorAll(
            '.notification-card'
          );

      cards[0].click();

      expect(marcarSpy)
        .toHaveBeenCalledOnce();

      expect(marcarSpy)
        .toHaveBeenCalledWith(
          component.notifications[0]
        );
    });

    it('debe marcar una tarjeta como leída al hacer clic', () => {
      fixture.detectChanges();

      const cards =
        fixture.nativeElement
          .querySelectorAll(
            '.notification-card'
          );

      expect(
        component.notifications[0].leida
      ).toBe(false);

      cards[0].click();

      expect(
        component.notifications[0].leida
      ).toBe(true);

      expect(
        notificacionServiceMock
          .marcarComoLeida
      ).toHaveBeenCalledWith(1);
    });

    it('no debe llamar al backend al hacer clic sobre una tarjeta leída', () => {
      fixture.detectChanges();

      const cards =
        fixture.nativeElement
          .querySelectorAll(
            '.notification-card'
          );

      cards[1].click();

      expect(
        notificacionServiceMock
          .marcarComoLeida
      ).not.toHaveBeenCalled();
    });

  });

});