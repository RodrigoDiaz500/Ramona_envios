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
  NotificationService
} from '../../../../core/services/notification.service';

import {
  ApiResponse
} from '../../../../core/services/sucursal.service';

import {
  Usuario,
  UsuarioService
} from '../../../../core/services/usuario.service';

import {
  ProfilePage
} from './profile-page';

describe('ProfilePage', () => {

  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;

  let usuarioServiceMock: {
    obtenerPorId: ReturnType<typeof vi.fn>;
    actualizar: ReturnType<typeof vi.fn>;
  };

  let notificationServiceMock: {
    show: ReturnType<typeof vi.fn>;
  };

  let authServiceMock: {
    getUserId: ReturnType<typeof vi.fn>;
  };

  const usuarioMock: Usuario = {
    id: 10,
    nombre: 'Rodrigo',
    apellido: 'Díaz',
    correo: 'rodrigo@test.cl',
    telefono: '+56912345678',
    direccion: 'San Antonio',
    activo: true,
    entraId: 'entra-rodrigo',
    rol: {
      id: 1,
      nombre: 'CLIENTE'
    },
    fechaCreacion: '2026-07-01T10:00:00',
    fechaActualizacion: '2026-07-12T10:00:00'
  };

  const respuestaUsuario:
    ApiResponse<Usuario> = {
      success: true,
      message: 'Usuario obtenido correctamente',
      data: usuarioMock,
      timestamp: '2026-07-12T12:00:00'
    };

  beforeEach(async () => {
    usuarioServiceMock = {
      obtenerPorId: vi.fn().mockReturnValue(
        of(respuestaUsuario)
      ),
      actualizar: vi.fn()
    };

    notificationServiceMock = {
      show: vi.fn()
    };

    authServiceMock = {
      getUserId: vi.fn().mockReturnValue(10)
    };

    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [
        ProfilePage
      ],
      providers: [
        {
          provide: UsuarioService,
          useValue: usuarioServiceMock
        },
        {
          provide: NotificationService,
          useValue: notificationServiceMock
        },
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(ProfilePage);

    component =
      fixture.componentInstance;
  });

  describe('Creación del componente', () => {

    it('debe crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe iniciar con loading en false', () => {
      expect(component.loading)
        .toBe(false);
    });

    it('debe iniciar sin usuario actual', () => {
      expect(component.usuarioActual)
        .toBeNull();
    });

    it('debe iniciar con el nombre vacío', () => {
      expect(component.user.nombre)
        .toBe('');
    });

    it('debe iniciar con el apellido vacío', () => {
      expect(component.user.apellido)
        .toBe('');
    });

    it('debe iniciar con el correo vacío', () => {
      expect(component.user.correo)
        .toBe('');
    });

    it('debe iniciar con el teléfono vacío', () => {
      expect(component.user.telefono)
        .toBe('');
    });

    it('debe iniciar con la dirección vacía', () => {
      expect(component.user.direccion)
        .toBe('');
    });

    it('debe iniciar con entraId null', () => {
      expect(component.user.entraId)
        .toBeNull();
    });

    it('debe iniciar con roleId igual a 1', () => {
      expect(component.user.roleId)
        .toBe(1);
    });

  });

  describe('ngOnInit', () => {

    it('debe llamar a cargarPerfil', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarPerfil'
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

    it('debe retornar null cuando no existe usuario autenticado', () => {
      authServiceMock.getUserId
        .mockReturnValue(null);

      expect(component.usuarioId)
        .toBeNull();
    });

  });

  describe('cargarPerfil', () => {

    it('debe mostrar error cuando no existe usuario autenticado', () => {
      authServiceMock.getUserId
        .mockReturnValue(null);

      component.cargarPerfil();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Error',
          'No se pudo identificar al usuario autenticado.',
          'error'
        );
    });

    it('no debe llamar al servicio cuando no existe usuario autenticado', () => {
      authServiceMock.getUserId
        .mockReturnValue(null);

      component.cargarPerfil();

      expect(usuarioServiceMock.obtenerPorId)
        .not.toHaveBeenCalled();
    });

    it('no debe activar loading cuando no existe usuario autenticado', () => {
      authServiceMock.getUserId
        .mockReturnValue(null);

      component.cargarPerfil();

      expect(component.loading)
        .toBe(false);
    });

    it('debe llamar al servicio con el ID correcto', () => {
      component.cargarPerfil();

      expect(usuarioServiceMock.obtenerPorId)
        .toHaveBeenCalledOnce();

      expect(usuarioServiceMock.obtenerPorId)
        .toHaveBeenCalledWith(10);
    });

    it('debe activar loading mientras espera la respuesta', () => {
      const responseSubject =
        new Subject<
          ApiResponse<Usuario>
        >();

      usuarioServiceMock.obtenerPorId
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.cargarPerfil();

      expect(component.loading)
        .toBe(true);

      responseSubject.next(
        respuestaUsuario
      );

      responseSubject.complete();

      expect(component.loading)
        .toBe(false);
    });

    it('debe almacenar el usuario actual', () => {
      component.cargarPerfil();

      expect(component.usuarioActual)
        .toEqual(usuarioMock);
    });

    it('debe cargar el nombre', () => {
      component.cargarPerfil();

      expect(component.user.nombre)
        .toBe('Rodrigo');
    });

    it('debe cargar el apellido', () => {
      component.cargarPerfil();

      expect(component.user.apellido)
        .toBe('Díaz');
    });

    it('debe cargar el correo', () => {
      component.cargarPerfil();

      expect(component.user.correo)
        .toBe('rodrigo@test.cl');
    });

    it('debe formatear el teléfono recibido', () => {
      component.cargarPerfil();

      expect(component.user.telefono)
        .toBe('+569 1234 5678');
    });

    it('debe cargar la dirección', () => {
      component.cargarPerfil();

      expect(component.user.direccion)
        .toBe('San Antonio');
    });

    it('debe cargar entraId', () => {
      component.cargarPerfil();

      expect(component.user.entraId)
        .toBe('entra-rodrigo');
    });

    it('debe cargar el roleId', () => {
      component.cargarPerfil();

      expect(component.user.roleId)
        .toBe(1);
    });

    it('debe finalizar loading después de cargar el perfil', () => {
      component.cargarPerfil();

      expect(component.loading)
        .toBe(false);
    });

    it('debe usar valores predeterminados cuando faltan campos', () => {
    usuarioServiceMock.obtenerPorId
      .mockReturnValue(
        of({
          ...respuestaUsuario,
          data: {
            ...usuarioMock,
            nombre:
              null as unknown as string,
            apellido:
              null as unknown as string,
            correo:
              null as unknown as string,
            telefono:
              null as unknown as string,
            direccion:
              null as unknown as string,
            entraId: null,

            rol: {
              id:
                null as unknown as number,
              nombre: 'CLIENTE'
            }
          }
        })
      );

    component.cargarPerfil();

    expect(component.user)
      .toEqual({
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        direccion: '',
        entraId: null,
        roleId: 1
      });
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

      usuarioServiceMock.obtenerPorId
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.cargarPerfil();

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al cargar perfil',
          errorMock
        );

      consoleSpy.mockRestore();
    });

    it('debe mostrar notificación cuando falla la carga', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      usuarioServiceMock.obtenerPorId
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.cargarPerfil();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Error',
          'No se pudo cargar el perfil.',
          'error'
        );

      consoleSpy.mockRestore();
    });

    it('debe finalizar loading cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      usuarioServiceMock.obtenerPorId
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.cargarPerfil();

      expect(component.loading)
        .toBe(false);

      consoleSpy.mockRestore();
    });

  });

  describe('soloLetras', () => {

    it('debe conservar letras', () => {
      expect(
        component.soloLetras(
          'Rodrigo'
        )
      ).toBe('Rodrigo');
    });

    it('debe conservar espacios', () => {
      expect(
        component.soloLetras(
          'María José'
        )
      ).toBe('María José');
    });

    it('debe conservar tildes y la letra ñ', () => {
      expect(
        component.soloLetras(
          'ÁéÍóÚ ñ Ñ'
        )
      ).toBe('ÁéÍóÚ ñ Ñ');
    });

    it('debe eliminar números', () => {
      expect(
        component.soloLetras(
          'Rodrigo123'
        )
      ).toBe('Rodrigo');
    });

    it('debe eliminar símbolos', () => {
      expect(
        component.soloLetras(
          'Rodrigo@#$!'
        )
      ).toBe('Rodrigo');
    });

    it('debe eliminar números y símbolos mezclados', () => {
      expect(
        component.soloLetras(
          'María123 @González!'
        )
      ).toBe('María González');
    });

    it('debe retornar vacío cuando el valor es null', () => {
      expect(
        component.soloLetras(
          null as unknown as string
        )
      ).toBe('');
    });

    it('debe retornar vacío cuando no existen letras', () => {
      expect(
        component.soloLetras(
          '12345@#$'
        )
      ).toBe('');
    });

  });

  describe('formatearTelefono', () => {

    it('debe retornar vacío cuando no hay números', () => {
      expect(
        component.formatearTelefono('')
      ).toBe('');
    });

    it('debe retornar vacío cuando el valor es null', () => {
      expect(
        component.formatearTelefono(
          null as unknown as string
        )
      ).toBe('');
    });

    it('debe eliminar caracteres no numéricos', () => {
      expect(
        component.formatearTelefono(
          '+56 9 1234-5678'
        )
      ).toBe('+569 1234 5678');
    });

    it('debe eliminar el prefijo 56', () => {
      expect(
        component.formatearTelefono(
          '56912345678'
        )
      ).toBe('+569 1234 5678');
    });

    it('debe eliminar el 9 inicial', () => {
      expect(
        component.formatearTelefono(
          '912345678'
        )
      ).toBe('+569 1234 5678');
    });

    it('debe formatear ocho dígitos locales', () => {
      expect(
        component.formatearTelefono(
          '12345678'
        )
      ).toBe('+569 1234 5678');
    });

    it('debe formatear hasta cuatro dígitos', () => {
      expect(
        component.formatearTelefono(
          '1234'
        )
      ).toBe('+569 1234');
    });

    it('debe formatear menos de cuatro dígitos', () => {
      expect(
        component.formatearTelefono(
          '123'
        )
      ).toBe('+569 123');
    });

    it('debe limitar el teléfono a ocho dígitos locales', () => {
      expect(
        component.formatearTelefono(
          '123456789999'
        )
      ).toBe('+569 1234 5678');
    });

    it('debe aceptar un teléfono ya formateado', () => {
      expect(
        component.formatearTelefono(
          '+569 1234 5678'
        )
      ).toBe('+569 1234 5678');
    });

  });

  describe('Plantilla inicial', () => {

    it('debe mostrar el título Mi Perfil', () => {
      fixture.detectChanges();

      const titulo =
        fixture.nativeElement
          .querySelector('h1') as HTMLElement;

      expect(
        titulo.textContent?.trim()
      ).toBe('Mi Perfil');
    });

    it('debe mostrar el texto descriptivo', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Actualiza tu información personal.'
      );
    });

    it('debe mostrar Cargando perfil mientras loading está activo', () => {
      const responseSubject =
        new Subject<ApiResponse<Usuario>>();

      usuarioServiceMock.obtenerPorId
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.loading = true;

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Cargando perfil...'
      );

      responseSubject.next(
        respuestaUsuario
      );

      responseSubject.complete();
    });

    it('no debe mostrar el formulario durante la carga', () => {
      const responseSubject =
        new Subject<ApiResponse<Usuario>>();

      usuarioServiceMock.obtenerPorId
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.loading = true;

      fixture.detectChanges();

      expect(
        fixture.nativeElement
          .querySelector('form')
      ).toBeNull();

      responseSubject.next(
        respuestaUsuario
      );

      responseSubject.complete();
    });

    it('debe mostrar el formulario cuando termina la carga', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement
          .querySelector('form')
      ).not.toBeNull();
    });

    it('debe mostrar los cinco campos del perfil', () => {
      fixture.detectChanges();

      const inputs =
        fixture.nativeElement
          .querySelectorAll('input');

      expect(inputs.length)
        .toBe(5);
    });

    it('debe mostrar el botón Guardar Cambios', () => {
      fixture.detectChanges();

      const boton =
        fixture.nativeElement
          .querySelector(
            '.button-container button'
          ) as HTMLButtonElement;

      expect(
        boton.textContent?.trim()
      ).toBe('Guardar Cambios');
    });

    it('debe mostrar el rol actual', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('Rol actual');

      expect(
        fixture.nativeElement.textContent
      ).toContain('CLIENTE');
    });

    it('debe cargar los datos en los inputs', async () => {
      fixture.detectChanges();

      await fixture.whenStable();
      fixture.detectChanges();

      const nombreInput =
        fixture.nativeElement
          .querySelector(
            'input[name="nombre"]'
          ) as HTMLInputElement;

      const apellidoInput =
        fixture.nativeElement
          .querySelector(
            'input[name="apellido"]'
          ) as HTMLInputElement;

      const correoInput =
        fixture.nativeElement
          .querySelector(
            'input[name="correo"]'
          ) as HTMLInputElement;

      const telefonoInput =
        fixture.nativeElement
          .querySelector(
            'input[name="telefono"]'
          ) as HTMLInputElement;

      const direccionInput =
        fixture.nativeElement
          .querySelector(
            'input[name="direccion"]'
          ) as HTMLInputElement;

      expect(nombreInput.value)
        .toBe('Rodrigo');

      expect(apellidoInput.value)
        .toBe('Díaz');

      expect(correoInput.value)
        .toBe('rodrigo@test.cl');

      expect(telefonoInput.value)
        .toBe('+569 1234 5678');

      expect(direccionInput.value)
        .toBe('San Antonio');
    });

    it('debe ejecutar saveProfile al presionar Guardar Cambios', () => {
      const guardarSpy =
        vi.spyOn(
          component,
          'saveProfile'
        ).mockImplementation(
          () => undefined
        );

      fixture.detectChanges();

      const boton =
        fixture.nativeElement
          .querySelector(
            '.button-container button'
          ) as HTMLButtonElement;

      boton.click();

      expect(guardarSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe ocultar el formulario y el botón cuando loading es true', () => {
      const responseSubject =
        new Subject<ApiResponse<Usuario>>();

      usuarioServiceMock.obtenerPorId
        .mockReturnValue(
          responseSubject.asObservable()
        );

      fixture.detectChanges();

      expect(component.loading)
        .toBe(true);

      expect(
        fixture.nativeElement
          .querySelector('form')
      ).toBeNull();

      expect(
        fixture.nativeElement
          .querySelector(
            '.button-container button'
          )
      ).toBeNull();

      expect(
        fixture.nativeElement.textContent
      ).toContain('Cargando perfil...');

      responseSubject.next(
        respuestaUsuario
      );

      responseSubject.complete();
    });

  });

  describe('Interacción con inputs', () => {

    it('debe eliminar números del nombre al escribir', async () => {
      fixture.detectChanges();

      const input =
        fixture.nativeElement
          .querySelector(
            'input[name="nombre"]'
          ) as HTMLInputElement;

      input.value = 'Rodrigo123';

      input.dispatchEvent(
        new Event('input')
      );

      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.user.nombre)
        .toBe('Rodrigo');
    });

    it('debe eliminar símbolos del apellido al escribir', async () => {
      fixture.detectChanges();

      const input =
        fixture.nativeElement
          .querySelector(
            'input[name="apellido"]'
          ) as HTMLInputElement;

      input.value = 'Díaz@#!';

      input.dispatchEvent(
        new Event('input')
      );

      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.user.apellido)
        .toBe('Díaz');
    });

    it('debe formatear el teléfono al escribir', async () => {
      fixture.detectChanges();

      const input =
        fixture.nativeElement
          .querySelector(
            'input[name="telefono"]'
          ) as HTMLInputElement;

      input.value = '912345678';

      input.dispatchEvent(
        new Event('input')
      );

      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.user.telefono)
        .toBe('+569 1234 5678');
    });

    it('debe actualizar el correo mediante ngModel', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const input =
        fixture.nativeElement
          .querySelector(
            'input[name="correo"]'
          ) as HTMLInputElement;

      input.value = 'nuevo@test.cl';

      input.dispatchEvent(
        new Event('input', {
          bubbles: true
        })
      );

      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.user.correo)
        .toBe('nuevo@test.cl');
    });

    it('debe actualizar la dirección mediante ngModel', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const input =
        fixture.nativeElement
          .querySelector(
            'input[name="direccion"]'
          ) as HTMLInputElement;

      input.value = 'Nueva dirección 123';

      input.dispatchEvent(
        new Event('input', {
          bubbles: true
        })
      );

      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.user.direccion)
        .toBe('Nueva dirección 123');
    });

  });

    describe('saveProfile: validaciones de identificación', () => {

    beforeEach(() => {
      component.usuarioActual = usuarioMock;

      component.user = {
        nombre: 'Rodrigo',
        apellido: 'Díaz',
        correo: 'rodrigo@test.cl',
        telefono: '+569 1234 5678',
        direccion: 'San Antonio',
        entraId: 'entra-rodrigo',
        roleId: 1
      };
    });

    it('debe mostrar error cuando no existe usuario autenticado', () => {
      authServiceMock.getUserId
        .mockReturnValue(null);

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Error',
          'No se pudo identificar el perfil.',
          'error'
        );
    });

    it('no debe llamar a actualizar cuando no existe usuario autenticado', () => {
      authServiceMock.getUserId
        .mockReturnValue(null);

      component.saveProfile();

      expect(usuarioServiceMock.actualizar)
        .not.toHaveBeenCalled();
    });

    it('debe mostrar error cuando no existe usuarioActual', () => {
      component.usuarioActual = null;

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Error',
          'No se pudo identificar el perfil.',
          'error'
        );
    });

    it('no debe llamar a actualizar cuando no existe usuarioActual', () => {
      component.usuarioActual = null;

      component.saveProfile();

      expect(usuarioServiceMock.actualizar)
        .not.toHaveBeenCalled();
    });

    it('no debe activar loading cuando falta identificación', () => {
      component.usuarioActual = null;

      component.saveProfile();

      expect(component.loading)
        .toBe(false);
    });

  });

  describe('saveProfile: campos obligatorios', () => {

    beforeEach(() => {
      component.usuarioActual =
        usuarioMock;

      component.user = {
        nombre: 'Rodrigo',
        apellido: 'Díaz',
        correo: 'rodrigo@test.cl',
        telefono: '+569 1234 5678',
        direccion: 'San Antonio',
        entraId: 'entra-rodrigo',
        roleId: 1
      };
    });

    it('debe rechazar nombre vacío', () => {
      component.user.nombre = '';

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Campos obligatorios',
          'Debes completar todos los campos del perfil.',
          'warning'
        );

      expect(usuarioServiceMock.actualizar)
        .not.toHaveBeenCalled();
    });

    it('debe rechazar nombre con solo espacios', () => {
      component.user.nombre = '   ';

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Campos obligatorios',
          'Debes completar todos los campos del perfil.',
          'warning'
        );
    });

    it('debe rechazar apellido vacío', () => {
      component.user.apellido = '';

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Campos obligatorios',
          'Debes completar todos los campos del perfil.',
          'warning'
        );
    });

    it('debe rechazar correo vacío', () => {
      component.user.correo = '';

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Campos obligatorios',
          'Debes completar todos los campos del perfil.',
          'warning'
        );
    });

    it('debe rechazar teléfono vacío', () => {
      component.user.telefono = '';

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Campos obligatorios',
          'Debes completar todos los campos del perfil.',
          'warning'
        );
    });

    it('debe rechazar dirección vacía', () => {
      component.user.direccion = '';

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Campos obligatorios',
          'Debes completar todos los campos del perfil.',
          'warning'
        );
    });

    it('debe tratar nombre null como vacío', () => {
      component.user.nombre =
        null as unknown as string;

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Campos obligatorios',
          'Debes completar todos los campos del perfil.',
          'warning'
        );
    });

    it('debe tratar apellido null como vacío', () => {
      component.user.apellido =
        null as unknown as string;

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Campos obligatorios',
          'Debes completar todos los campos del perfil.',
          'warning'
        );
    });

    it('debe tratar correo null como vacío', () => {
      component.user.correo =
        null as unknown as string;

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Campos obligatorios',
          'Debes completar todos los campos del perfil.',
          'warning'
        );
    });

    it('debe tratar teléfono null como vacío', () => {
      component.user.telefono =
        null as unknown as string;

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Campos obligatorios',
          'Debes completar todos los campos del perfil.',
          'warning'
        );
    });

    it('debe tratar dirección null como vacía', () => {
      component.user.direccion =
        null as unknown as string;

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Campos obligatorios',
          'Debes completar todos los campos del perfil.',
          'warning'
        );
    });

    it('no debe activar loading cuando faltan campos', () => {
      component.user.correo = '';

      component.saveProfile();

      expect(component.loading)
        .toBe(false);
    });

  });

  describe('saveProfile: validación del teléfono', () => {

    beforeEach(() => {
      component.usuarioActual =
        usuarioMock;

      component.user = {
        nombre: 'Rodrigo',
        apellido: 'Díaz',
        correo: 'rodrigo@test.cl',
        telefono: '+569 1234 5678',
        direccion: 'San Antonio',
        entraId: 'entra-rodrigo',
        roleId: 1
      };
    });

    it('debe rechazar teléfono sin prefijo', () => {
      component.user.telefono =
        '912345678';

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Teléfono inválido',
          'El teléfono debe tener el formato +569 0000 0000.',
          'warning'
        );

      expect(usuarioServiceMock.actualizar)
        .not.toHaveBeenCalled();
    });

    it('debe rechazar teléfono sin espacios', () => {
      component.user.telefono =
        '+56912345678';

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Teléfono inválido',
          'El teléfono debe tener el formato +569 0000 0000.',
          'warning'
        );
    });

    it('debe rechazar teléfono incompleto', () => {
      component.user.telefono =
        '+569 1234';

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Teléfono inválido',
          'El teléfono debe tener el formato +569 0000 0000.',
          'warning'
        );
    });

    it('debe rechazar teléfono con letras', () => {
      component.user.telefono =
        '+569 1234 ABCD';

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Teléfono inválido',
          'El teléfono debe tener el formato +569 0000 0000.',
          'warning'
        );
    });

    it('debe aceptar teléfono con formato correcto', () => {
      usuarioServiceMock.actualizar
        .mockReturnValue(
          of({
            success: true,
            message: 'Perfil actualizado',
            data: usuarioMock,
            timestamp: '2026-07-12T12:00:00'
          })
        );

      const cargarSpy =
        vi.spyOn(
          component,
          'cargarPerfil'
        ).mockImplementation(
          () => undefined
        );

      component.saveProfile();

      expect(usuarioServiceMock.actualizar)
        .toHaveBeenCalledOnce();

      cargarSpy.mockRestore();
    });

  });

  describe('saveProfile: actualización exitosa', () => {

    beforeEach(() => {
      component.usuarioActual =
        usuarioMock;

      component.user = {
        nombre: '  Rodrigo  ',
        apellido: '  Díaz  ',
        correo: '  rodrigo@test.cl  ',
        telefono: '+569 1234 5678',
        direccion: '  San Antonio  ',
        entraId: 'entra-rodrigo',
        roleId: 1
      };

      usuarioServiceMock.actualizar
        .mockReturnValue(
          of({
            success: true,
            message: 'Perfil actualizado',
            data: usuarioMock,
            timestamp: '2026-07-12T12:00:00'
          })
        );
    });

    it('debe llamar al servicio actualizar con el ID correcto', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarPerfil'
        ).mockImplementation(
          () => undefined
        );

      component.saveProfile();

      expect(usuarioServiceMock.actualizar)
        .toHaveBeenCalledOnce();

      expect(usuarioServiceMock.actualizar)
        .toHaveBeenCalledWith(
          10,
          expect.any(Object)
        );

      cargarSpy.mockRestore();
    });

    it('debe enviar el request completo', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarPerfil'
        ).mockImplementation(
          () => undefined
        );

      component.saveProfile();

      expect(usuarioServiceMock.actualizar)
        .toHaveBeenCalledWith(
          10,
          {
            nombre: 'Rodrigo',
            apellido: 'Díaz',
            correo: 'rodrigo@test.cl',
            telefono: '+569 1234 5678',
            direccion: 'San Antonio',
            entraId: 'entra-rodrigo',
            roleId: 1
          }
        );

      cargarSpy.mockRestore();
    });

    it('debe aplicar trim a los campos de texto', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarPerfil'
        ).mockImplementation(
          () => undefined
        );

      component.saveProfile();

      const request =
        usuarioServiceMock.actualizar
          .mock.calls[0][1];

      expect(request.nombre)
        .toBe('Rodrigo');

      expect(request.apellido)
        .toBe('Díaz');

      expect(request.correo)
        .toBe('rodrigo@test.cl');

      expect(request.direccion)
        .toBe('San Antonio');

      cargarSpy.mockRestore();
    });

    it('debe conservar entraId null', () => {
      component.user.entraId = null;

      const cargarSpy =
        vi.spyOn(
          component,
          'cargarPerfil'
        ).mockImplementation(
          () => undefined
        );

      component.saveProfile();

      expect(usuarioServiceMock.actualizar)
        .toHaveBeenCalledWith(
          10,
          expect.objectContaining({
            entraId: null
          })
        );

      cargarSpy.mockRestore();
    });

    it('debe conservar el roleId', () => {
      component.user.roleId = 3;

      const cargarSpy =
        vi.spyOn(
          component,
          'cargarPerfil'
        ).mockImplementation(
          () => undefined
        );

      component.saveProfile();

      expect(usuarioServiceMock.actualizar)
        .toHaveBeenCalledWith(
          10,
          expect.objectContaining({
            roleId: 3
          })
        );

      cargarSpy.mockRestore();
    });

    it('debe activar loading mientras espera la respuesta', () => {
      const responseSubject =
        new Subject<ApiResponse<Usuario>>();

      usuarioServiceMock.actualizar
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.saveProfile();

      expect(component.loading)
        .toBe(true);

      responseSubject.next({
        success: true,
        message: 'Perfil actualizado',
        data: usuarioMock,
        timestamp: '2026-07-12T12:00:00'
      });

      responseSubject.complete();

      expect(component.loading)
        .toBe(false);
    });

    it('debe finalizar loading después del éxito', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarPerfil'
        ).mockImplementation(
          () => undefined
        );

      component.saveProfile();

      expect(component.loading)
        .toBe(false);

      cargarSpy.mockRestore();
    });

    it('debe mostrar notificación de éxito', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarPerfil'
        ).mockImplementation(
          () => undefined
        );

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Perfil actualizado',
          'Tus datos fueron guardados correctamente.'
        );

      cargarSpy.mockRestore();
    });

    it('debe volver a cargar el perfil después del éxito', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarPerfil'
        ).mockImplementation(
          () => undefined
        );

      component.saveProfile();

      expect(cargarSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe mostrar notificación antes de recargar el perfil', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarPerfil'
        ).mockImplementation(
          () => undefined
        );

      component.saveProfile();

      expect(
        notificationServiceMock.show
          .mock.invocationCallOrder[0]
      ).toBeLessThan(
        cargarSpy.mock.invocationCallOrder[0]
      );
    });

  });

  describe('saveProfile: error de actualización', () => {

    beforeEach(() => {
      component.usuarioActual =
        usuarioMock;

      component.user = {
        nombre: 'Rodrigo',
        apellido: 'Díaz',
        correo: 'rodrigo@test.cl',
        telefono: '+569 1234 5678',
        direccion: 'San Antonio',
        entraId: 'entra-rodrigo',
        roleId: 1
      };
    });

    it('debe registrar el error recibido', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      const errorMock = {
        error: {
          message:
            'El correo ya se encuentra registrado'
        }
      };

      usuarioServiceMock.actualizar
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.saveProfile();

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al actualizar perfil',
          errorMock
        );

      consoleSpy.mockRestore();
    });

    it('debe mostrar el mensaje enviado por el backend', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      usuarioServiceMock.actualizar
        .mockReturnValue(
          throwError(() => ({
            error: {
              message:
                'El correo ya se encuentra registrado'
            }
          }))
        );

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Error',
          'El correo ya se encuentra registrado',
          'error'
        );

      consoleSpy.mockRestore();
    });

    it('debe mostrar mensaje genérico cuando el backend no entrega detalle', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      usuarioServiceMock.actualizar
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.saveProfile();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Error',
          'No se pudo actualizar el perfil.',
          'error'
        );

      consoleSpy.mockRestore();
    });

    it('debe finalizar loading cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      usuarioServiceMock.actualizar
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.saveProfile();

      expect(component.loading)
        .toBe(false);

      consoleSpy.mockRestore();
    });

    it('no debe volver a cargar el perfil cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      usuarioServiceMock.actualizar
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      const cargarSpy =
        vi.spyOn(
          component,
          'cargarPerfil'
        ).mockImplementation(
          () => undefined
        );

      component.saveProfile();

      expect(cargarSpy)
        .not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

  });

  describe('Plantilla: guardado del perfil', () => {

    beforeEach(() => {
      component.usuarioActual =
        usuarioMock;

      component.user = {
        nombre: 'Rodrigo',
        apellido: 'Díaz',
        correo: 'rodrigo@test.cl',
        telefono: '+569 1234 5678',
        direccion: 'San Antonio',
        entraId: 'entra-rodrigo',
        roleId: 1
      };
    });

    it('debe ejecutar saveProfile al presionar Guardar Cambios', () => {
      const guardarSpy =
        vi.spyOn(
          component,
          'saveProfile'
        ).mockImplementation(
          () => undefined
        );

      fixture.detectChanges();

      const boton =
        fixture.nativeElement
          .querySelector(
            '.button-container button'
          ) as HTMLButtonElement;

      boton.click();

      expect(guardarSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe ocultar el formulario mientras se guarda', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.usuarioActual =
        usuarioMock;

      component.user = {
        nombre: 'Rodrigo',
        apellido: 'Díaz',
        correo: 'rodrigo@test.cl',
        telefono: '+569 1234 5678',
        direccion: 'San Antonio',
        entraId: 'entra-rodrigo',
        roleId: 1
      };

      const responseSubject =
        new Subject<ApiResponse<Usuario>>();

      usuarioServiceMock.actualizar
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.saveProfile();

      expect(component.loading)
        .toBe(true);

      await fixture.whenStable();
      fixture.detectChanges();

      expect(
        fixture.nativeElement
          .querySelector('form')
      ).toBeNull();

      expect(
        fixture.nativeElement.textContent
      ).toContain('Cargando perfil...');

      responseSubject.next({
        success: true,
        message: 'Perfil actualizado',
        data: usuarioMock,
        timestamp: '2026-07-12T12:00:00'
      });

      responseSubject.complete();

      await fixture.whenStable();
    });

  });


});