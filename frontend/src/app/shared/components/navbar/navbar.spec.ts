import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter,
  Router
} from '@angular/router';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  AuthService,
  UserRole
} from '../../../../core/services/auth.service';

import {
  Navbar
} from './navbar';

describe('Navbar', () => {

  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  let authServiceMock: {
    getRole: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  let router: Router;

  beforeEach(async () => {
    authServiceMock = {
      getRole: vi.fn().mockReturnValue('CLIENTE'),
      logout: vi.fn().mockResolvedValue(undefined)
    };

    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [
        Navbar
      ],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(Navbar);

    component =
      fixture.componentInstance;

    router =
      TestBed.inject(Router);
  });

  describe('Creación del componente', () => {

    it('debe crear el componente correctamente', () => {
      expect(component)
        .toBeTruthy();
    });

    it('debe exponer AuthService públicamente', () => {
      expect(component.authService)
        .toBe(authServiceMock);
    });

  });

  describe('role', () => {

    it('debe retornar CLIENTE', () => {
      authServiceMock.getRole
        .mockReturnValue('CLIENTE');

      expect(component.role)
        .toBe('CLIENTE');
    });

    it('debe retornar OPERADOR', () => {
      authServiceMock.getRole
        .mockReturnValue('OPERADOR');

      expect(component.role)
        .toBe('OPERADOR');
    });

    it('debe retornar ADMIN', () => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      expect(component.role)
        .toBe('ADMIN');
    });

    it('debe consultar AuthService cada vez que se obtiene el rol', () => {
      component.role;
      component.role;

      expect(authServiceMock.getRole)
        .toHaveBeenCalledTimes(2);
    });

  });

  describe('logout', () => {

    it('debe llamar a AuthService.logout', () => {
      const navigateSpy =
        vi.spyOn(router, 'navigate')
          .mockResolvedValue(true);

      component.logout();

      expect(authServiceMock.logout)
        .toHaveBeenCalledOnce();

      navigateSpy.mockRestore();
    });

    it('debe navegar a login', () => {
      const navigateSpy =
        vi.spyOn(router, 'navigate')
          .mockResolvedValue(true);

      component.logout();

      expect(navigateSpy)
        .toHaveBeenCalledWith([
          '/login'
        ]);

      navigateSpy.mockRestore();
    });

    it('debe llamar primero a logout y luego a navigate', () => {
      const navigateSpy =
        vi.spyOn(router, 'navigate')
          .mockResolvedValue(true);

      component.logout();

      expect(
        authServiceMock.logout
          .mock.invocationCallOrder[0]
      ).toBeLessThan(
        navigateSpy.mock.invocationCallOrder[0]
      );

      navigateSpy.mockRestore();
    });

    it('debe ejecutar una llamada por cada cierre de sesión', () => {
      const navigateSpy =
        vi.spyOn(router, 'navigate')
          .mockResolvedValue(true);

      component.logout();
      component.logout();

      expect(authServiceMock.logout)
        .toHaveBeenCalledTimes(2);

      expect(navigateSpy)
        .toHaveBeenCalledTimes(2);

      navigateSpy.mockRestore();
    });

  });

  describe('Plantilla general', () => {

    it('debe mostrar la barra de navegación', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement
          .querySelector('.navbar')
      ).not.toBeNull();
    });

    it('debe mostrar el logo de Ramona Express', () => {
      fixture.detectChanges();

      const logo =
        fixture.nativeElement
          .querySelector(
            '.navbar-logo img'
          ) as HTMLImageElement;

      expect(logo)
        .not.toBeNull();

      expect(logo.alt)
        .toBe('Ramona Express');

      expect(logo.src)
        .toContain(
          'images/ramona_express-log.png'
        );
    });

    it('debe mostrar el control del menú móvil', () => {
      fixture.detectChanges();

      const toggle =
        fixture.nativeElement
          .querySelector(
            '#nav-toggle'
          ) as HTMLInputElement;

      expect(toggle)
        .not.toBeNull();

      expect(toggle.type)
        .toBe('checkbox');
    });

    it('debe mostrar el botón hamburguesa', () => {
      fixture.detectChanges();

      const hamburger =
        fixture.nativeElement
          .querySelector('.hamburger');

      expect(hamburger)
        .not.toBeNull();

      expect(
        hamburger.querySelectorAll('span')
          .length
      ).toBe(3);
    });

    it('debe mostrar siempre Seguimiento', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('Seguimiento');
    });

    it('debe mostrar siempre Crear Envío', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('Crear Envío');
    });

    it('debe mostrar siempre Notificaciones', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('Notificaciones');
    });

    it('debe mostrar el rol actual', () => {
      authServiceMock.getRole
        .mockReturnValue('CLIENTE');

      fixture.detectChanges();

      expect(
        fixture.nativeElement
          .querySelector(
            '.user-role'
          )
          .textContent
      ).toContain('CLIENTE');
    });

    it('debe mostrar el botón Cerrar sesión', () => {
      fixture.detectChanges();

      const boton =
        fixture.nativeElement
          .querySelector(
            '.logout-btn'
          ) as HTMLButtonElement;

      expect(boton)
        .not.toBeNull();

      expect(
        boton.textContent?.trim()
      ).toBe('Cerrar sesión');
    });

    it('debe ejecutar logout al presionar Cerrar sesión', () => {
      const logoutSpy =
        vi.spyOn(
          component,
          'logout'
        ).mockImplementation(
          () => undefined
        );

      fixture.detectChanges();

      const boton =
        fixture.nativeElement
          .querySelector(
            '.logout-btn'
          ) as HTMLButtonElement;

      boton.click();

      expect(logoutSpy)
        .toHaveBeenCalledOnce();
    });

  });

  describe('Enlaces para CLIENTE', () => {

    beforeEach(() => {
      authServiceMock.getRole
        .mockReturnValue('CLIENTE');

      fixture.detectChanges();
    });

    it('debe mostrar Historial', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('Historial');
    });

    it('debe mostrar Mi Perfil', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('Mi Perfil');
    });

    it('no debe mostrar Dashboard', () => {
      expect(
        fixture.nativeElement.textContent
      ).not.toContain('Dashboard');
    });

    it('no debe mostrar Centro de Operaciones', () => {
      expect(
        fixture.nativeElement.textContent
      ).not.toContain(
        'Centro de Operaciones'
      );
    });

    it('no debe mostrar Usuarios', () => {
      expect(
        fixture.nativeElement.textContent
      ).not.toContain('Usuarios');
    });

    it('no debe mostrar Sucursales', () => {
      expect(
        fixture.nativeElement.textContent
      ).not.toContain('Sucursales');
    });

    it('no debe mostrar Incidencias', () => {
      expect(
        fixture.nativeElement.textContent
      ).not.toContain('Incidencias');
    });

    it('no debe mostrar Reseñas', () => {
      expect(
        fixture.nativeElement.textContent
      ).not.toContain('Reseñas');
    });

    it('debe mostrar cinco enlaces', () => {
      const enlaces =
        fixture.nativeElement
          .querySelectorAll(
            '.navbar-links a'
          );

      expect(enlaces.length)
        .toBe(5);
    });

    it('debe contener las rutas correctas del cliente', () => {
      const enlaces =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.navbar-links a'
            )
        ) as HTMLAnchorElement[];

      const hrefs =
        enlaces.map(
          enlace =>
            enlace.getAttribute('href')
        );

      expect(hrefs)
        .toContain('/tracking');

      expect(hrefs)
        .toContain('/shipment');

      expect(hrefs)
        .toContain('/history');

      expect(hrefs)
        .toContain('/profile');

      expect(hrefs)
        .toContain('/notifications');
    });

  });

  describe('Enlaces para OPERADOR', () => {

    beforeEach(() => {
      authServiceMock.getRole
        .mockReturnValue('OPERADOR');

      fixture.detectChanges();
    });

    it('debe mostrar Dashboard', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('Dashboard');
    });

    it('debe mostrar Centro de Operaciones', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Centro de Operaciones'
      );
    });

    it('debe mostrar Usuarios', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('Usuarios');
    });

    it('debe mostrar Incidencias', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('Incidencias');
    });

    it('debe mostrar Reseñas', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('Reseñas');
    });

    it('no debe mostrar Historial', () => {
      expect(
        fixture.nativeElement.textContent
      ).not.toContain('Historial');
    });

    it('no debe mostrar Mi Perfil', () => {
      expect(
        fixture.nativeElement.textContent
      ).not.toContain('Mi Perfil');
    });

    it('no debe mostrar Sucursales', () => {
      expect(
        fixture.nativeElement.textContent
      ).not.toContain('Sucursales');
    });

    it('debe mostrar ocho enlaces', () => {
      const enlaces =
        fixture.nativeElement
          .querySelectorAll(
            '.navbar-links a'
          );

      expect(enlaces.length)
        .toBe(8);
    });

    it('debe contener las rutas correctas del operador', () => {
      const enlaces =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.navbar-links a'
            )
        ) as HTMLAnchorElement[];

      const hrefs =
        enlaces.map(
          enlace =>
            enlace.getAttribute('href')
        );

      expect(hrefs)
        .toContain('/dashboard');

      expect(hrefs)
        .toContain('/tracking');

      expect(hrefs)
        .toContain('/shipment');

      expect(hrefs)
        .toContain('/shipments');

      expect(hrefs)
        .toContain('/users');

      expect(hrefs)
        .toContain('/incidents');

      expect(hrefs)
        .toContain('/reviews');

      expect(hrefs)
        .toContain('/notifications');

      expect(hrefs)
        .not.toContain('/branches');
    });

  });

  describe('Enlaces para ADMIN', () => {

    beforeEach(() => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      fixture.detectChanges();
    });

    it('debe mostrar Dashboard', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('Dashboard');
    });

    it('debe mostrar Centro de Operaciones', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Centro de Operaciones'
      );
    });

    it('debe mostrar Usuarios', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('Usuarios');
    });

    it('debe mostrar Sucursales', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('Sucursales');
    });

    it('debe mostrar Incidencias', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('Incidencias');
    });

    it('debe mostrar Reseñas', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain('Reseñas');
    });

    it('no debe mostrar Historial', () => {
      expect(
        fixture.nativeElement.textContent
      ).not.toContain('Historial');
    });

    it('no debe mostrar Mi Perfil', () => {
      expect(
        fixture.nativeElement.textContent
      ).not.toContain('Mi Perfil');
    });

    it('debe mostrar nueve enlaces', () => {
      const enlaces =
        fixture.nativeElement
          .querySelectorAll(
            '.navbar-links a'
          );

      expect(enlaces.length)
        .toBe(9);
    });

    it('debe contener la ruta de Sucursales', () => {
      const enlaces =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.navbar-links a'
            )
        ) as HTMLAnchorElement[];

      const hrefs =
        enlaces.map(
          enlace =>
            enlace.getAttribute('href')
        );

      expect(hrefs)
        .toContain('/branches');
    });

    it('debe mostrar ADMIN como rol actual', () => {
      expect(
        fixture.nativeElement
          .querySelector(
            '.user-role'
          )
          .textContent
      ).toContain('ADMIN');
    });

  });

  describe('Rutas permanentes', () => {

    it('Seguimiento debe apuntar a /tracking', () => {
      fixture.detectChanges();

      const enlace =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.navbar-links a'
            )
        ).find(
          item =>
            (
              item as HTMLElement
            ).textContent?.trim() ===
            'Seguimiento'
        ) as HTMLAnchorElement;

      expect(
        enlace.getAttribute('href')
      ).toBe('/tracking');
    });

    it('Crear Envío debe apuntar a /shipment', () => {
      fixture.detectChanges();

      const enlace =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.navbar-links a'
            )
        ).find(
          item =>
            (
              item as HTMLElement
            ).textContent?.trim() ===
            'Crear Envío'
        ) as HTMLAnchorElement;

      expect(
        enlace.getAttribute('href')
      ).toBe('/shipment');
    });

    it('Notificaciones debe apuntar a /notifications', () => {
      fixture.detectChanges();

      const enlace =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.navbar-links a'
            )
        ).find(
          item =>
            (
              item as HTMLElement
            ).textContent?.trim() ===
            'Notificaciones'
        ) as HTMLAnchorElement;

      expect(
        enlace.getAttribute('href')
      ).toBe('/notifications');
    });

  });

});