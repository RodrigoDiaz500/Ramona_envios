import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

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
  Login
} from './login';

describe('Login', () => {

  let component: Login;
  let fixture: ComponentFixture<Login>;

  let authServiceMock: {
    loginMicrosoft: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    localStorage.clear();

    authServiceMock = {
      loginMicrosoft: vi.fn()
    };

    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [
        Login
      ],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(Login);

    component =
      fixture.componentInstance;
  });

  describe('Creación del componente', () => {

    it('debe crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe iniciar sin mensaje de error', () => {
      expect(component.errorMessage)
        .toBe('');
    });

    it('debe iniciar con el modal cerrado', () => {
      expect(component.showDisabledModal)
        .toBe(false);
    });

  });

  describe('ngOnInit', () => {

    it('debe consultar loginError en localStorage', () => {
      const getItemSpy =
        vi.spyOn(
          Storage.prototype,
          'getItem'
        );

      component.ngOnInit();

      expect(getItemSpy)
        .toHaveBeenCalledWith(
          'loginError'
        );

      getItemSpy.mockRestore();
    });

    it('debe abrir el modal cuando loginError es disabled', () => {
      localStorage.setItem(
        'loginError',
        'disabled'
      );

      component.ngOnInit();

      expect(component.showDisabledModal)
        .toBe(true);
    });

    it('debe eliminar loginError después de procesar disabled', () => {
      localStorage.setItem(
        'loginError',
        'disabled'
      );

      component.ngOnInit();

      expect(
        localStorage.getItem(
          'loginError'
        )
      ).toBeNull();
    });

    it('debe llamar removeItem con la clave correcta', () => {
      localStorage.setItem(
        'loginError',
        'disabled'
      );

      const removeItemSpy =
        vi.spyOn(
          Storage.prototype,
          'removeItem'
        );

      component.ngOnInit();

      expect(removeItemSpy)
        .toHaveBeenCalledWith(
          'loginError'
        );

      removeItemSpy.mockRestore();
    });

    it('no debe abrir el modal cuando loginError no existe', () => {
      component.ngOnInit();

      expect(component.showDisabledModal)
        .toBe(false);
    });

    it('no debe abrir el modal para otro valor de loginError', () => {
      localStorage.setItem(
        'loginError',
        'unknown'
      );

      component.ngOnInit();

      expect(component.showDisabledModal)
        .toBe(false);
    });

    it('no debe eliminar loginError cuando su valor no es disabled', () => {
      localStorage.setItem(
        'loginError',
        'unknown'
      );

      component.ngOnInit();

      expect(
        localStorage.getItem(
          'loginError'
        )
      ).toBe('unknown');
    });

    it('debe conservar el modal cerrado con una cadena vacía', () => {
      localStorage.setItem(
        'loginError',
        ''
      );

      component.ngOnInit();

      expect(component.showDisabledModal)
        .toBe(false);
    });

  });

  describe('loginMicrosoft', () => {

    it('debe llamar al login de Microsoft', () => {
      component.loginMicrosoft();

      expect(
        authServiceMock.loginMicrosoft
      ).toHaveBeenCalledOnce();
    });

    it('debe llamar una vez por cada intento', () => {
      component.loginMicrosoft();
      component.loginMicrosoft();

      expect(
        authServiceMock.loginMicrosoft
      ).toHaveBeenCalledTimes(2);
    });

    it('no debe modificar el mensaje de error', () => {
      component.errorMessage =
        'Error anterior';

      component.loginMicrosoft();

      expect(component.errorMessage)
        .toBe('Error anterior');
    });

    it('no debe abrir el modal de usuario deshabilitado', () => {
      component.loginMicrosoft();

      expect(component.showDisabledModal)
        .toBe(false);
    });

  });

  describe('cerrarModal', () => {

    it('debe cerrar el modal', () => {
      component.showDisabledModal =
        true;

      component.cerrarModal();

      expect(component.showDisabledModal)
        .toBe(false);
    });

    it('debe mantener el modal cerrado', () => {
      component.showDisabledModal =
        false;

      component.cerrarModal();

      expect(component.showDisabledModal)
        .toBe(false);
    });

  });

  describe('Plantilla inicial', () => {

    it('debe mostrar el logo de Ramona Express', () => {
      fixture.detectChanges();

      const logo =
        fixture.nativeElement
          .querySelector(
            '.logo'
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

    it('debe mostrar errorMessage cuando contiene texto', () => {
      component.errorMessage =
        'No se pudo iniciar sesión.';

      fixture.detectChanges();

      const error =
        fixture.nativeElement.querySelector(
          '.error'
        ) as HTMLElement | null;

      expect(error)
        .not.toBeNull();

      expect(
        error?.textContent?.trim()
      ).toBe(
        'No se pudo iniciar sesión.'
      );
    });

    it('debe mostrar el texto descriptivo', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Accede utilizando tu cuenta de Microsoft para ingresar al sistema.'
      );
    });

    it('debe mostrar el botón Continuar con Microsoft', () => {
      fixture.detectChanges();

      const boton =
        fixture.nativeElement
          .querySelector(
            '.microsoft-btn'
          ) as HTMLButtonElement;

      expect(boton)
        .not.toBeNull();

      expect(
        boton.textContent?.trim()
      ).toContain(
        'Continuar con Microsoft'
      );
    });

    it('debe mostrar el logo de Microsoft', () => {
      fixture.detectChanges();

      const imagen =
        fixture.nativeElement
          .querySelector(
            '.microsoft-btn img'
          ) as HTMLImageElement;

      expect(imagen)
        .not.toBeNull();

      expect(imagen.alt)
        .toBe('Microsoft');

      expect(imagen.src)
        .toContain(
          'images/microsoft.png'
        );
    });

    it('debe ejecutar loginMicrosoft al presionar el botón', () => {
      const loginSpy =
        vi.spyOn(
          component,
          'loginMicrosoft'
        ).mockImplementation(
          () => undefined
        );

      fixture.detectChanges();

      const boton =
        fixture.nativeElement
          .querySelector(
            '.microsoft-btn'
          ) as HTMLButtonElement;

      boton.click();

      expect(loginSpy)
        .toHaveBeenCalledOnce();
    });

    it('no debe mostrar el bloque de error inicialmente', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement
          .querySelector('.error')
      ).toBeNull();
    });

    it('no debe mostrar el modal inicialmente', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement
          .querySelector(
            '.disabled-modal'
          )
      ).toBeNull();
    });

  });

  describe('Plantilla del mensaje de error', () => {

    it('debe mostrar errorMessage cuando contiene texto', () => {
      component.errorMessage =
        'No se pudo iniciar sesión.';

      fixture.detectChanges();

      const error =
        fixture.nativeElement.querySelector(
          '.error'
        ) as HTMLElement | null;

      expect(error)
        .not.toBeNull();

      expect(
        error?.textContent?.trim()
      ).toBe(
        'No se pudo iniciar sesión.'
      );
    });

    it('debe limpiar el mensaje de error', () => {

      component.errorMessage =
        'Error temporal';

      expect(component.errorMessage)
        .toBe('Error temporal');

      component.errorMessage = '';

      expect(component.errorMessage)
        .toBe('');

});

  });

  describe('Plantilla del modal deshabilitado', () => {

    beforeEach(() => {
      component.showDisabledModal =
        true;

      fixture.detectChanges();
    });

    it('debe mostrar el modal', () => {
      expect(
        fixture.nativeElement
          .querySelector(
            '.disabled-modal'
          )
      ).not.toBeNull();
    });

    it('debe mostrar el título Acceso denegado', () => {
      const titulo =
        fixture.nativeElement.querySelector(
          '.disabled-card h2'
        ) as HTMLElement | null;

      expect(titulo)
        .not.toBeNull();

      expect(
        titulo?.textContent?.trim()
      ).toBe('Acceso denegado');
    });

    it('debe mostrar el icono de advertencia', () => {
      const icono =
        fixture.nativeElement
          .querySelector(
            '.disabled-icon'
          ) as HTMLElement;

      expect(
        icono.textContent?.trim()
      ).toBe('!');
    });

    it('debe informar que el usuario está deshabilitado', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Tu usuario se encuentra deshabilitado'
      );
    });

    it('debe indicar que contacte a un administrador', () => {
      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Contacta a un administrador para recuperar el acceso.'
      );
    });

    it('debe mostrar el botón Entendido', () => {
      const boton =
        fixture.nativeElement
          .querySelector(
            '.disabled-card button'
          ) as HTMLButtonElement;

      expect(
        boton.textContent?.trim()
      ).toBe('Entendido');
    });

    it('debe ejecutar cerrarModal al presionar Entendido', () => {
      const cerrarSpy =
        vi.spyOn(
          component,
          'cerrarModal'
        ).mockImplementation(
          () => undefined
        );

      const boton =
        fixture.nativeElement
          .querySelector(
            '.disabled-card button'
          ) as HTMLButtonElement;

      boton.click();

      expect(cerrarSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe ocultar el modal al presionar Entendido', () => {
      const boton =
        fixture.nativeElement
          .querySelector(
            '.disabled-card button'
          ) as HTMLButtonElement;

      boton.click();

      fixture.detectChanges();

      expect(component.showDisabledModal)
        .toBe(false);

      expect(
        fixture.nativeElement
          .querySelector(
            '.disabled-modal'
          )
      ).toBeNull();
    });

  });

  describe('Inicialización integrada con la plantilla', () => {

    it('debe mostrar el modal al detectar disabled en localStorage', () => {
      localStorage.setItem(
        'loginError',
        'disabled'
      );

      fixture.detectChanges();

      expect(component.showDisabledModal)
        .toBe(true);

      expect(
        fixture.nativeElement
          .querySelector(
            '.disabled-modal'
          )
      ).not.toBeNull();

      expect(
        localStorage.getItem(
          'loginError'
        )
      ).toBeNull();
    });

    it('debe mantener la pantalla normal sin loginError', () => {
      fixture.detectChanges();

      expect(component.showDisabledModal)
        .toBe(false);

      expect(
        fixture.nativeElement
          .querySelector(
            '.disabled-modal'
          )
      ).toBeNull();

      expect(
        fixture.nativeElement
          .querySelector(
            '.microsoft-btn'
          )
      ).not.toBeNull();
    });

  });

});