import { TestBed } from '@angular/core/testing';
import { MsalService } from '@azure/msal-angular';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  AuthService,
  UserRole,
  UserSession
} from './auth.service';

describe('AuthService', () => {

  let service: AuthService;

  let initializeMock: ReturnType<typeof vi.fn>;
  let loginRedirectMock: ReturnType<typeof vi.fn>;
  let logoutRedirectMock: ReturnType<typeof vi.fn>;
  let getAllAccountsMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();

    initializeMock = vi
      .fn()
      .mockResolvedValue(undefined);

    loginRedirectMock = vi
      .fn()
      .mockResolvedValue(undefined);

    logoutRedirectMock = vi
      .fn()
      .mockResolvedValue(undefined);

    getAllAccountsMock = vi
      .fn()
      .mockReturnValue([]);

    const msalServiceMock = {
      instance: {
        initialize: initializeMock,
        getAllAccounts: getAllAccountsMock
      },

      loginRedirect: loginRedirectMock,
      logoutRedirect: logoutRedirectMock
    };

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: MsalService,
          useValue: msalServiceMock
        }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  describe('Creación', () => {

    it('debe crear el servicio correctamente', () => {
      expect(service).toBeTruthy();
    });

  });

  describe('login', () => {

    it('debe guardar una sesión CLIENTE', () => {
      service.login(
        10,
        'cliente@ramona.cl',
        'CLIENTE'
      );

      const storedValue =
        localStorage.getItem('ramona_user');

      expect(storedValue).not.toBeNull();

      expect(JSON.parse(storedValue!)).toEqual({
        id: 10,
        email: 'cliente@ramona.cl',
        role: 'CLIENTE'
      });
    });

    it('debe guardar una sesión OPERADOR', () => {
      service.login(
        20,
        'operador@ramona.cl',
        'OPERADOR'
      );

      expect(service.getUser()).toEqual({
        id: 20,
        email: 'operador@ramona.cl',
        role: 'OPERADOR'
      });
    });

    it('debe guardar una sesión ADMIN', () => {
      service.login(
        30,
        'admin@ramona.cl',
        'ADMIN'
      );

      expect(service.getUser()).toEqual({
        id: 30,
        email: 'admin@ramona.cl',
        role: 'ADMIN'
      });
    });

    it('debe sobrescribir una sesión anterior', () => {
      service.login(
        10,
        'cliente@ramona.cl',
        'CLIENTE'
      );

      service.login(
        30,
        'admin@ramona.cl',
        'ADMIN'
      );

      expect(service.getUser()).toEqual({
        id: 30,
        email: 'admin@ramona.cl',
        role: 'ADMIN'
      });
    });

    it('debe utilizar la clave ramona_user', () => {
      service.login(
        10,
        'cliente@ramona.cl',
        'CLIENTE'
      );

      expect(
        localStorage.getItem('ramona_user')
      ).not.toBeNull();
    });

  });

  describe('saveSessionFromBackend', () => {

    it('debe delegar el guardado al método login', () => {
      const loginSpy =
        vi.spyOn(service, 'login');

      service.saveSessionFromBackend(
        40,
        'backend@ramona.cl',
        'OPERADOR'
      );

      expect(loginSpy).toHaveBeenCalledOnce();

      expect(loginSpy).toHaveBeenCalledWith(
        40,
        'backend@ramona.cl',
        'OPERADOR'
      );
    });

    it('debe guardar la sesión recibida desde backend', () => {
      service.saveSessionFromBackend(
        50,
        'usuario@ramona.cl',
        'CLIENTE'
      );

      expect(service.getUser()).toEqual({
        id: 50,
        email: 'usuario@ramona.cl',
        role: 'CLIENTE'
      });
    });

  });

  describe('getUser', () => {

    it('debe retornar el usuario almacenado', () => {
      const session: UserSession = {
        id: 60,
        email: 'usuario@ramona.cl',
        role: 'CLIENTE'
      };

      localStorage.setItem(
        'ramona_user',
        JSON.stringify(session)
      );

      expect(service.getUser()).toEqual(session);
    });

    it('debe retornar null cuando no existe sesión', () => {
      expect(service.getUser()).toBeNull();
    });

    it('debe recuperar los tres roles admitidos', () => {
      const roles: UserRole[] = [
        'CLIENTE',
        'OPERADOR',
        'ADMIN'
      ];

      roles.forEach((role, index) => {
        service.login(
          index + 1,
          `${role.toLowerCase()}@ramona.cl`,
          role
        );

        expect(service.getUser()?.role)
          .toBe(role);
      });
    });

  });

  describe('getUserId', () => {

    it('debe retornar el ID del usuario', () => {
      service.login(
        70,
        'cliente@ramona.cl',
        'CLIENTE'
      );

      expect(service.getUserId()).toBe(70);
    });

    it('debe retornar null sin sesión', () => {
      expect(service.getUserId()).toBeNull();
    });

  });

  describe('getRole', () => {

    it('debe retornar OPERADOR', () => {
      service.login(
        80,
        'operador@ramona.cl',
        'OPERADOR'
      );

      expect(service.getRole())
        .toBe('OPERADOR');
    });

    it('debe retornar ADMIN', () => {
      service.login(
        90,
        'admin@ramona.cl',
        'ADMIN'
      );

      expect(service.getRole())
        .toBe('ADMIN');
    });

    it('debe retornar CLIENTE por defecto', () => {
      expect(service.getRole())
        .toBe('CLIENTE');
    });

  });

  describe('loginMicrosoft', () => {

    it('debe inicializar MSAL', async () => {
      await service.loginMicrosoft();

      expect(initializeMock)
        .toHaveBeenCalledOnce();
    });

    it('debe ejecutar loginRedirect', async () => {
      await service.loginMicrosoft();

      expect(loginRedirectMock)
        .toHaveBeenCalledOnce();
    });

    it('debe inicializar MSAL antes de redirigir', async () => {
      await service.loginMicrosoft();

      expect(
        initializeMock.mock.invocationCallOrder[0]
      ).toBeLessThan(
        loginRedirectMock.mock.invocationCallOrder[0]
      );
    });

    it('debe enviar el scope correcto', async () => {
      await service.loginMicrosoft();

      expect(loginRedirectMock)
        .toHaveBeenCalledWith({
          scopes: [
            'api://b82da08a-15ea-4bd6-902e-236d2d2e523a/Acceso.Total'
          ],
          prompt: 'select_account'
        });
    });

    it('debe solicitar selección de cuenta', async () => {
      await service.loginMicrosoft();

      const request =
        loginRedirectMock.mock.calls[0][0];

      expect(request.prompt)
        .toBe('select_account');
    });

  });

  describe('logout', () => {

    it('debe eliminar la sesión local', async () => {
      service.login(
        100,
        'cliente@ramona.cl',
        'CLIENTE'
      );

      await service.logout();

      expect(
        localStorage.getItem('ramona_user')
      ).toBeNull();
    });

    it('debe funcionar aunque no exista sesión', async () => {
      await expect(
        service.logout()
      ).resolves.toBeUndefined();

      expect(initializeMock)
        .toHaveBeenCalledOnce();

      expect(logoutRedirectMock)
        .toHaveBeenCalledOnce();
    });

    it('debe inicializar MSAL', async () => {
      await service.logout();

      expect(initializeMock)
        .toHaveBeenCalledOnce();
    });

    it('debe ejecutar logoutRedirect', async () => {
      await service.logout();

      expect(logoutRedirectMock)
        .toHaveBeenCalledOnce();
    });

    it('debe inicializar MSAL antes de cerrar sesión', async () => {
      await service.logout();

      expect(
        initializeMock.mock.invocationCallOrder[0]
      ).toBeLessThan(
        logoutRedirectMock.mock.invocationCallOrder[0]
      );
    });

    it('debe redirigir al login después del logout', async () => {
      await service.logout();

      expect(logoutRedirectMock)
        .toHaveBeenCalledWith({
          postLogoutRedirectUri:
            'http://localhost:4200/login'
        });
    });

    it('debe conservar otras claves del localStorage', async () => {
      localStorage.setItem(
        'ramona_user',
        JSON.stringify({
          id: 10,
          email: 'cliente@ramona.cl',
          role: 'CLIENTE'
        })
      );

      localStorage.setItem(
        'otra_configuracion',
        'valor'
      );

      await service.logout();

      expect(
        localStorage.getItem('ramona_user')
      ).toBeNull();

      expect(
        localStorage.getItem('otra_configuracion')
      ).toBe('valor');
    });

  });

  describe('isLoggedIn', () => {

    it('debe retornar false cuando no existen cuentas', () => {
      getAllAccountsMock.mockReturnValue([]);

      expect(service.isLoggedIn())
        .toBe(false);
    });

    it('debe retornar true cuando existe una cuenta', () => {
      getAllAccountsMock.mockReturnValue([
        {
          homeAccountId: 'home-id',
          environment:
            'login.microsoftonline.com',
          tenantId: 'tenant-id',
          username: 'cliente@ramona.cl',
          localAccountId: 'local-id',
          name: 'Cliente Ramona'
        }
      ]);

      expect(service.isLoggedIn())
        .toBe(true);
    });

    it('debe retornar true cuando existen varias cuentas', () => {
      getAllAccountsMock.mockReturnValue([
        {
          username: 'primero@ramona.cl'
        },
        {
          username: 'segundo@ramona.cl'
        }
      ]);

      expect(service.isLoggedIn())
        .toBe(true);
    });

    it('debe consultar MSAL en cada llamada', () => {
      service.isLoggedIn();
      service.isLoggedIn();

      expect(getAllAccountsMock)
        .toHaveBeenCalledTimes(2);
    });

  });

});