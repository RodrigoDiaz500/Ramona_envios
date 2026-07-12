import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  By
} from '@angular/platform-browser';

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
  SolicitudEnvio,
  SolicitudService
} from '../../../../core/services/solicitud.service';

import {
  ApiResponse,
  Sucursal,
  SucursalService
} from '../../../../core/services/sucursal.service';

import {
  Usuario,
  UsuarioService
} from '../../../../core/services/usuario.service';

import {
  CreateShipment
} from './create-shipment';

describe('CreateShipment', () => {

  let component: CreateShipment;
  let fixture: ComponentFixture<CreateShipment>;

  let notificationServiceMock: {
    show: ReturnType<typeof vi.fn>;
  };

  let sucursalServiceMock: {
    listar: ReturnType<typeof vi.fn>;
  };

  let solicitudServiceMock: {
    crear: ReturnType<typeof vi.fn>;
  };

  let authServiceMock: {
    getUserId: ReturnType<typeof vi.fn>;
    getRole: ReturnType<typeof vi.fn>;
  };

  let usuarioServiceMock: {
    obtenerPorId: ReturnType<typeof vi.fn>;
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

  const sucursalDeshabilitada: Sucursal = {
    id: 3,
    nombre: 'Sucursal Cerrada',
    direccion: 'Dirección 789',
    ciudad: 'Valparaíso',
    telefono: '+56322223333',
    habilitada: false,
    fechaCreacion: '2026-07-03T10:00:00'
  };

  const usuarioCliente: Usuario = {
    id: 10,
    nombre: 'Rodrigo',
    apellido: 'Díaz',
    correo: 'rodrigo@ramona.cl',
    telefono: '+56911112222',
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

  const solicitudCreada: SolicitudEnvio = {
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
    fechaCreacion: '2026-07-12T12:00:00'
  };

  const respuestaSucursales:
    ApiResponse<Sucursal[]> = {
      success: true,
      message: 'Sucursales obtenidas correctamente',
      data: [
        sucursalOrigen,
        sucursalDestino,
        sucursalDeshabilitada
      ],
      timestamp: '2026-07-12T12:00:00'
    };

  const respuestaUsuario:
    ApiResponse<Usuario> = {
      success: true,
      message: 'Usuario obtenido correctamente',
      data: usuarioCliente,
      timestamp: '2026-07-12T12:00:00'
    };

  const respuestaSolicitud:
    ApiResponse<SolicitudEnvio> = {
      success: true,
      message: 'Solicitud creada correctamente',
      data: solicitudCreada,
      timestamp: '2026-07-12T12:00:00'
    };

  beforeEach(async () => {
    notificationServiceMock = {
      show: vi.fn()
    };

    sucursalServiceMock = {
      listar: vi.fn().mockReturnValue(
        of(respuestaSucursales)
      )
    };

    solicitudServiceMock = {
      crear: vi.fn().mockReturnValue(
        of(respuestaSolicitud)
      )
    };

    authServiceMock = {
      getUserId: vi.fn().mockReturnValue(10),
      getRole: vi.fn().mockReturnValue('CLIENTE')
    };

    usuarioServiceMock = {
      obtenerPorId: vi.fn().mockReturnValue(
        of(respuestaUsuario)
      )
    };

    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [
        CreateShipment
      ],
      providers: [
        {
          provide: NotificationService,
          useValue: notificationServiceMock
        },
        {
          provide: SucursalService,
          useValue: sucursalServiceMock
        },
        {
          provide: SolicitudService,
          useValue: solicitudServiceMock
        },
        {
          provide: AuthService,
          useValue: authServiceMock
        },
        {
          provide: UsuarioService,
          useValue: usuarioServiceMock
        }
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(CreateShipment);

    component =
      fixture.componentInstance;
  });

  function completarFormularioValido(): void {
    component.senderName = 'Rodrigo Díaz';
    component.receiverName = 'María González';
    component.receiverRutDni = '12345678-9';
    component.receiverPhone = '+569 1234 5678';
    component.originBranch = '1';
    component.destinationBranch = '2';
    component.weight = 2.5;
    component.declaredValue = 50000;
    component.observations = 'Paquete delicado';
  }

  describe('Creación e inicialización', () => {

    it('debe crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe cargar sucursales al inicializar', () => {
      fixture.detectChanges();

      expect(sucursalServiceMock.listar)
        .toHaveBeenCalledOnce();
    });

    it('debe cargar el remitente cuando el usuario es CLIENTE', () => {
      fixture.detectChanges();

      expect(usuarioServiceMock.obtenerPorId)
        .toHaveBeenCalledWith(10);

      expect(component.senderName)
        .toBe('Rodrigo Díaz');
    });

    it('no debe cargar el remitente automáticamente para un OPERADOR', () => {
      authServiceMock.getRole
        .mockReturnValue('OPERADOR');

      fixture.detectChanges();

      expect(usuarioServiceMock.obtenerPorId)
        .not.toHaveBeenCalled();
    });

  });

  describe('Getters de autenticación', () => {

    it('usuarioId debe retornar el ID autenticado', () => {
      authServiceMock.getUserId
        .mockReturnValue(25);

      expect(component.usuarioId)
        .toBe(25);
    });

    it('usuarioId debe retornar null cuando no hay sesión', () => {
      authServiceMock.getUserId
        .mockReturnValue(null);

      expect(component.usuarioId)
        .toBeNull();
    });

    it('esCliente debe retornar true para CLIENTE', () => {
      authServiceMock.getRole
        .mockReturnValue('CLIENTE');

      expect(component.esCliente)
        .toBe(true);
    });

    it('esCliente debe retornar false para ADMIN', () => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      expect(component.esCliente)
        .toBe(false);
    });

  });

  describe('cargarRemitenteCliente', () => {

    it('no debe consultar el usuario cuando no existe ID', () => {
      authServiceMock.getUserId
        .mockReturnValue(null);

      component.cargarRemitenteCliente();

      expect(usuarioServiceMock.obtenerPorId)
        .not.toHaveBeenCalled();
    });

    it('debe construir el nombre completo del remitente', () => {
      component.cargarRemitenteCliente();

      expect(component.senderName)
        .toBe('Rodrigo Díaz');
    });

    it('debe eliminar espacios sobrantes del nombre completo', () => {
      usuarioServiceMock.obtenerPorId
        .mockReturnValue(
          of({
            ...respuestaUsuario,
            data: {
              ...usuarioCliente,
              apellido: ''
            }
          })
        );

      component.cargarRemitenteCliente();

      expect(component.senderName)
        .toBe('Rodrigo');
    });

    it('debe registrar el error cuando falla la carga del remitente', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(() => undefined);

      const errorMock = {
        status: 500
      };

      usuarioServiceMock.obtenerPorId
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.cargarRemitenteCliente();

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al cargar remitente',
          errorMock
        );

      consoleSpy.mockRestore();
    });

  });

  describe('cargarSucursales', () => {

    it('debe conservar únicamente las sucursales habilitadas', () => {
      component.cargarSucursales();

      expect(component.branches)
        .toHaveLength(2);

      expect(component.branches)
        .toEqual([
          sucursalOrigen,
          sucursalDestino
        ]);

      expect(
        component.branches.every(
          branch => branch.habilitada
        )
      ).toBe(true);
    });

    it('debe manejar data nula como una lista vacía', () => {
      sucursalServiceMock.listar
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin sucursales',
            data: null,
            timestamp: '2026-07-12T12:00:00'
          })
        );

      component.cargarSucursales();

      expect(component.branches)
        .toEqual([]);
    });

    it('debe limpiar la lista cuando la carga falla', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(() => undefined);

      component.branches = [
        sucursalOrigen
      ];

      const errorMock = {
        status: 500
      };

      sucursalServiceMock.listar
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.cargarSucursales();

      expect(component.branches)
        .toEqual([]);

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al cargar sucursales',
          errorMock
        );

      consoleSpy.mockRestore();
    });

  });

  describe('soloLetras', () => {

    it('debe conservar letras, espacios y caracteres acentuados', () => {
      expect(
        component.soloLetras(
          'María José Ñandú'
        )
      ).toBe('María José Ñandú');
    });

    it('debe eliminar números y símbolos', () => {
      expect(
        component.soloLetras(
          'María123 @González!'
        )
      ).toBe('María González');
    });

    it('debe retornar una cadena vacía si no hay letras', () => {
      expect(
        component.soloLetras('12345@#$')
      ).toBe('');
    });

  });

  describe('formatearRut', () => {

    it('debe eliminar caracteres no permitidos', () => {
      expect(
        component.formatearRut(
          '12.345.678-9'
        )
      ).toBe('12345678-9');
    });

    it('debe aceptar la letra K como dígito verificador', () => {
      expect(
        component.formatearRut(
          '12345678k'
        )
      ).toBe('12345678-K');
    });

    it('debe retornar un único carácter sin guion', () => {
      expect(
        component.formatearRut('1')
      ).toBe('1');
    });

    it('debe limitar el RUT a nueve caracteres limpios', () => {
      expect(
        component.formatearRut(
          '123456789999'
        )
      ).toBe('12345678-9');
    });

  });

  describe('formatearTelefono', () => {

    it('debe formatear un teléfono chileno completo', () => {
      expect(
        component.formatearTelefono(
          '12345678'
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

    it('debe eliminar caracteres no numéricos', () => {
      expect(
        component.formatearTelefono(
          '+56 9 1234-5678'
        )
      ).toBe('+569 1234 5678');
    });

    it('debe formatear números parciales', () => {
      expect(
        component.formatearTelefono(
          '1234'
        )
      ).toBe('+569 1234');
    });

    it('debe limitar el teléfono a ocho dígitos locales', () => {
      expect(
        component.formatearTelefono(
          '123456789999'
        )
      ).toBe('+569 1234 5678');
    });

  });

  describe('createShipment: validaciones', () => {

    it('debe detenerse cuando no existe usuario autenticado', () => {
      authServiceMock.getUserId
        .mockReturnValue(null);

      completarFormularioValido();

      component.createShipment();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Usuario no identificado',
          'No se pudo identificar al usuario autenticado.',
          'error'
        );

      expect(solicitudServiceMock.crear)
        .not.toHaveBeenCalled();
    });

    it('debe advertir cuando faltan campos obligatorios', () => {
      component.createShipment();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Campos obligatorios',
          'Se deben completar todos los campos marcados con (*) para crear el envío.',
          'warning'
        );

      expect(solicitudServiceMock.crear)
        .not.toHaveBeenCalled();
    });

    it('debe rechazar un peso igual a cero', () => {
      completarFormularioValido();
      component.weight = 0;

      component.createShipment();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Campos obligatorios',
          expect.any(String),
          'warning'
        );
    });

    it('debe rechazar un valor declarado igual a cero', () => {
      completarFormularioValido();
      component.declaredValue = 0;

      component.createShipment();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Campos obligatorios',
          expect.any(String),
          'warning'
        );
    });

    it('debe rechazar un RUT con formato inválido', () => {
      completarFormularioValido();
      component.receiverRutDni = '1234';

      component.createShipment();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'RUT inválido',
          'El RUT debe tener un formato válido, por ejemplo: 12345678-9.',
          'warning'
        );

      expect(solicitudServiceMock.crear)
        .not.toHaveBeenCalled();
    });

    it('debe rechazar un teléfono con formato inválido', () => {
      completarFormularioValido();
      component.receiverPhone = '12345678';

      component.createShipment();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Teléfono inválido',
          'El teléfono debe tener el formato +569 0000 0000.',
          'warning'
        );

      expect(solicitudServiceMock.crear)
        .not.toHaveBeenCalled();
    });

    it('debe rechazar sucursales de origen y destino iguales', () => {
      completarFormularioValido();
      component.destinationBranch = '1';

      component.createShipment();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Sucursal inválida',
          'La sucursal de origen y destino no pueden ser la misma.',
          'warning'
        );

      expect(solicitudServiceMock.crear)
        .not.toHaveBeenCalled();
    });

  });

  describe('createShipment: creación exitosa', () => {

    it('debe enviar la solicitud con los datos correctos', () => {
  completarFormularioValido();
  
  component.receiverName = '  María González  ';
  component.receiverRutDni = '12345678-9';
  component.receiverPhone = '+569 1234 5678';

  component.createShipment();

  expect(solicitudServiceMock.crear)
    .toHaveBeenCalledOnce();

  expect(solicitudServiceMock.crear)
    .toHaveBeenCalledWith({
      usuarioId: 10,
      sucursalOrigenId: 1,
      sucursalDestinoId: 2,
      descripcion: 'Paquete delicado',
      peso: 2.5,
      valorDeclarado: 50000,
      destinatarioNombre: 'María González',
      destinatarioRutDni: '12345678-9',
      destinatarioTelefono: '+569 1234 5678'
    });
});

    it('debe activar loading mientras espera la respuesta', () => {
      const responseSubject =
        new Subject<ApiResponse<SolicitudEnvio>>();

      solicitudServiceMock.crear
        .mockReturnValue(
          responseSubject.asObservable()
        );

      completarFormularioValido();

      component.createShipment();

      expect(component.loading)
        .toBe(true);

      responseSubject.next(
        respuestaSolicitud
      );

      responseSubject.complete();

      expect(component.loading)
        .toBe(false);
    });

    it('debe mostrar una notificación con el código de seguimiento', () => {
      completarFormularioValido();

      component.createShipment();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Envío Creado',
          'El envío RAM-20260712-0001 fue registrado correctamente.'
        );
    });

    it('debe limpiar el formulario después de crear el envío', () => {
      authServiceMock.getRole
        .mockReturnValue('OPERADOR');

      completarFormularioValido();

      component.createShipment();

      expect(component.senderName)
        .toBe('');

      expect(component.receiverName)
        .toBe('');

      expect(component.receiverRutDni)
        .toBe('');

      expect(component.receiverPhone)
        .toBe('');

      expect(component.originBranch)
        .toBe('');

      expect(component.destinationBranch)
        .toBe('');

      expect(component.weight)
        .toBe(0);

      expect(component.declaredValue)
        .toBe(0);

      expect(component.observations)
        .toBe('');
    });

  });

  describe('createShipment: errores', () => {

    it('debe mostrar el mensaje recibido desde el backend', () => {
      solicitudServiceMock.crear
        .mockReturnValue(
          throwError(() => ({
            error: {
              message:
                'La sucursal de destino no está habilitada'
            }
          }))
        );

      completarFormularioValido();

      component.createShipment();

      expect(component.loading)
        .toBe(false);

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Error',
          'La sucursal de destino no está habilitada',
          'error'
        );
    });

    it('debe mostrar un mensaje genérico cuando el backend no envía detalle', () => {
      solicitudServiceMock.crear
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      completarFormularioValido();

      component.createShipment();

      expect(notificationServiceMock.show)
        .toHaveBeenCalledWith(
          'Error',
          'No se pudo crear el envío.',
          'error'
        );
    });

  });

  describe('limpiarFormulario', () => {

    it('debe limpiar el remitente cuando el usuario no es CLIENTE', () => {
      authServiceMock.getRole
        .mockReturnValue('OPERADOR');

      component.senderName = 'Operador Manual';
      component.receiverName = 'Destinatario';
      component.weight = 5;

      component.limpiarFormulario();

      expect(component.senderName)
        .toBe('');

      expect(component.receiverName)
        .toBe('');

      expect(component.weight)
        .toBe(0);
    });

    it('debe volver a cargar el remitente cuando el usuario es CLIENTE', () => {
      authServiceMock.getRole
        .mockReturnValue('CLIENTE');

      const cargarSpy =
        vi.spyOn(
          component,
          'cargarRemitenteCliente'
        );

      component.limpiarFormulario();

      expect(cargarSpy)
        .toHaveBeenCalledOnce();
    });

  });

  describe('Plantilla HTML', () => {

    it('debe mostrar el título Crear Envío', () => {
      fixture.detectChanges();

      const titulo =
        fixture.nativeElement
          .querySelector('h1') as HTMLElement;

      expect(titulo.textContent?.trim())
        .toBe('Crear Envío');
    });

    it('debe mostrar solamente sucursales habilitadas en los select', () => {
      fixture.detectChanges();

      const opciones =
        fixture.nativeElement
          .querySelectorAll('select option');

      /*
       * Cada select contiene:
       * 1 opción inicial + 2 sucursales habilitadas.
       * Hay dos select, por lo tanto son 6 opciones.
       */
      expect(opciones.length)
        .toBe(6);

      expect(
        fixture.nativeElement.textContent
      ).not.toContain('Sucursal Cerrada');
    });

    it('debe dejar readonly el remitente para un CLIENTE', () => {
      authServiceMock.getRole
        .mockReturnValue('CLIENTE');

      fixture.detectChanges();

      const input =
        fixture.debugElement.query(
          By.css(
            'input[name="senderName"]'
          )
        ).nativeElement as HTMLInputElement;

      expect(input.readOnly)
        .toBe(true);
    });

    it('debe permitir editar el remitente para un OPERADOR', () => {
      authServiceMock.getRole
        .mockReturnValue('OPERADOR');

      fixture.detectChanges();

      const input =
        fixture.debugElement.query(
          By.css(
            'input[name="senderName"]'
          )
        ).nativeElement as HTMLInputElement;

      expect(input.readOnly)
        .toBe(false);
    });

    it('debe mostrar Crear Envío cuando no está cargando', () => {
      component.loading = false;

      fixture.detectChanges();

      const boton =
        fixture.nativeElement
          .querySelector(
            'button[type="submit"]'
          ) as HTMLButtonElement;

      expect(boton.textContent?.trim())
        .toBe('Crear Envío');

      expect(boton.disabled)
        .toBe(false);
    });

    it('debe mostrar Creando y deshabilitar el botón durante la carga', () => {
      component.loading = true;

      fixture.detectChanges();

      const boton =
        fixture.nativeElement
          .querySelector(
            'button[type="submit"]'
          ) as HTMLButtonElement;

      expect(boton.textContent?.trim())
        .toBe('Creando...');

      expect(boton.disabled)
        .toBe(true);
    });

    it('debe ejecutar createShipment al enviar el formulario', () => {
      fixture.detectChanges();

      const createSpy =
        vi.spyOn(
          component,
          'createShipment'
        );

      const formulario =
        fixture.nativeElement
          .querySelector('form') as HTMLFormElement;

      formulario.dispatchEvent(
        new Event(
          'submit',
          {
            bubbles: true,
            cancelable: true
          }
        )
      );

      expect(createSpy)
        .toHaveBeenCalledOnce();
    });

  });

});