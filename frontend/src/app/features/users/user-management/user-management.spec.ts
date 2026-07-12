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
  ApiResponse
} from '../../../../core/services/sucursal.service';

import {
  Usuario,
  UsuarioService
} from '../../../../core/services/usuario.service';

import {
  UserManagement
} from './user-management';

describe('UserManagement', () => {

  let component: UserManagement;
  let fixture: ComponentFixture<UserManagement>;

  let usuarioServiceMock: {
    listar: ReturnType<typeof vi.fn>;
    actualizar: ReturnType<typeof vi.fn>;
    cambiarEstado: ReturnType<typeof vi.fn>;
  };

  let authServiceMock: {
    getRole: ReturnType<typeof vi.fn>;
  };

  const usuarioCliente: Usuario = {
    id: 1,
    nombre: 'Rodrigo',
    apellido: 'Díaz',
    correo: 'rodrigo@test.cl',
    telefono: '+56911112222',
    direccion: 'San Antonio',
    activo: true,
    entraId: null,
    rol: {
      id: 1,
      nombre: 'CLIENTE'
    },
    fechaCreacion: '2026-07-01T10:00:00',
    fechaActualizacion: '2026-07-12T10:00:00'
  };

  const usuarioOperador: Usuario = {
    id: 2,
    nombre: 'Juan',
    apellido: 'Pérez',
    correo: 'juan@test.cl',
    telefono: '+56922223333',
    direccion: 'Santiago',
    activo: false,
    entraId: 'entra-juan',
    rol: {
      id: 2,
      nombre: 'OPERADOR'
    },
    fechaCreacion: '2026-07-02T10:00:00',
    fechaActualizacion: '2026-07-12T11:00:00'
  };

  const usuarioAdmin: Usuario = {
    id: 3,
    nombre: 'Admin',
    apellido: 'Sistema',
    correo: 'admin@test.cl',
    telefono: '+56933334444',
    direccion: 'Valparaíso',
    activo: true,
    entraId: 'entra-admin',
    rol: {
      id: 3,
      nombre: 'ADMIN'
    },
    fechaCreacion: '2026-07-03T10:00:00',
    fechaActualizacion: '2026-07-12T12:00:00'
  };

  const respuestaUsuarios:
    ApiResponse<Usuario[]> = {
      success: true,
      message: 'Usuarios obtenidos correctamente',
      data: [
        usuarioCliente,
        usuarioOperador,
        usuarioAdmin
      ],
      timestamp: '2026-07-12T12:00:00'
    };

  beforeEach(async () => {
    usuarioServiceMock = {
      listar: vi.fn().mockReturnValue(
        of(respuestaUsuarios)
      ),
      actualizar: vi.fn(),
      cambiarEstado: vi.fn()
    };

    authServiceMock = {
      getRole: vi.fn().mockReturnValue('ADMIN')
    };

    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [
        UserManagement
      ],
      providers: [
        {
          provide: UsuarioService,
          useValue: usuarioServiceMock
        },
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(UserManagement);

    component =
      fixture.componentInstance;
  });

  describe('Creación del componente', () => {

    it('debe crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe iniciar con la búsqueda vacía', () => {
      expect(component.searchText).toBe('');
    });

    it('debe iniciar sin usuarios cargados', () => {
      expect(component.users).toEqual([]);
    });

    it('debe iniciar con loading en false', () => {
      expect(component.loading).toBe(false);
    });

    it('debe iniciar con el modal de edición cerrado', () => {
      expect(component.showEditModal).toBe(false);
      expect(component.selectedUser).toBeNull();
    });

    it('debe iniciar con el diálogo de confirmación cerrado', () => {
      expect(component.showConfirmDialog).toBe(false);
      expect(component.pendingAction).toBeNull();
    });

    it('debe contener los tres roles del sistema', () => {
      expect(component.roles).toEqual([
        {
          id: 1,
          nombre: 'CLIENTE'
        },
        {
          id: 2,
          nombre: 'OPERADOR'
        },
        {
          id: 3,
          nombre: 'ADMIN'
        }
      ]);
    });

  });

  describe('ngOnInit', () => {

    it('debe llamar a cargarUsuarios', () => {
      const cargarSpy =
        vi.spyOn(component, 'cargarUsuarios');

      component.ngOnInit();

      expect(cargarSpy)
        .toHaveBeenCalledOnce();
    });

  });

  describe('Getters de rol', () => {

    it('role debe retornar ADMIN', () => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      expect(component.role)
        .toBe('ADMIN');
    });

    it('role debe retornar CLIENTE', () => {
      authServiceMock.getRole
        .mockReturnValue('CLIENTE');

      expect(component.role)
        .toBe('CLIENTE');
    });

    it('role debe retornar cadena vacía cuando no existe rol', () => {
      authServiceMock.getRole
        .mockReturnValue(null);

      expect(component.role)
        .toBe('');
    });

    it('esAdmin debe retornar true para ADMIN', () => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      expect(component.esAdmin)
        .toBe(true);
    });

    it('esAdmin debe retornar false para OPERADOR', () => {
      authServiceMock.getRole
        .mockReturnValue('OPERADOR');

      expect(component.esAdmin)
        .toBe(false);
    });

    it('esAdmin debe retornar false para CLIENTE', () => {
      authServiceMock.getRole
        .mockReturnValue('CLIENTE');

      expect(component.esAdmin)
        .toBe(false);
    });

  });

  describe('cargarUsuarios', () => {

    it('debe llamar al servicio de usuarios', () => {
      component.cargarUsuarios();

      expect(usuarioServiceMock.listar)
        .toHaveBeenCalledOnce();
    });

    it('debe activar loading mientras espera la respuesta', () => {
      const responseSubject =
        new Subject<ApiResponse<Usuario[]>>();

      usuarioServiceMock.listar
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.cargarUsuarios();

      expect(component.loading)
        .toBe(true);

      responseSubject.next(
        respuestaUsuarios
      );

      responseSubject.complete();

      expect(component.loading)
        .toBe(false);
    });

    it('debe cargar los usuarios recibidos', () => {
      component.cargarUsuarios();

      expect(component.users)
        .toEqual([
          usuarioCliente,
          usuarioOperador,
          usuarioAdmin
        ]);

      expect(component.users)
        .toHaveLength(3);
    });

    it('debe conservar los datos de cada usuario', () => {
      component.cargarUsuarios();

      expect(component.users[0].nombre)
        .toBe('Rodrigo');

      expect(component.users[1].correo)
        .toBe('juan@test.cl');

      expect(component.users[2].rol.nombre)
        .toBe('ADMIN');
    });

    it('debe finalizar loading después de una respuesta exitosa', () => {
      component.cargarUsuarios();

      expect(component.loading)
        .toBe(false);
    });

    it('debe manejar data nula como una lista vacía', () => {
      usuarioServiceMock.listar
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin usuarios',
            data: null,
            timestamp: '2026-07-12T12:00:00'
          })
        );

      component.cargarUsuarios();

      expect(component.users)
        .toEqual([]);

      expect(component.loading)
        .toBe(false);
    });

    it('debe limpiar la lista cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(() => undefined);

      component.users = [
        usuarioCliente
      ];

      const errorMock = {
        status: 500
      };

      usuarioServiceMock.listar
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.cargarUsuarios();

      expect(component.users)
        .toEqual([]);

      expect(component.loading)
        .toBe(false);

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al cargar usuarios',
          errorMock
        );

      consoleSpy.mockRestore();
    });

  });

  describe('usuariosFiltrados', () => {

    beforeEach(() => {
      component.users = [
        usuarioCliente,
        usuarioOperador,
        usuarioAdmin
      ];
    });

    it('debe retornar todos los usuarios cuando la búsqueda está vacía', () => {
      component.searchText = '';

      expect(
        component.usuariosFiltrados()
      ).toEqual([
        usuarioCliente,
        usuarioOperador,
        usuarioAdmin
      ]);
    });

    it('debe ignorar espacios en blanco en la búsqueda', () => {
      component.searchText = '   ';

      expect(
        component.usuariosFiltrados()
      ).toHaveLength(3);
    });

    it('debe buscar por nombre', () => {
      component.searchText = 'Rodrigo';

      const resultado =
        component.usuariosFiltrados();

      expect(resultado)
        .toEqual([
          usuarioCliente
        ]);
    });

    it('debe buscar por apellido', () => {
      component.searchText = 'Pérez';

      const resultado =
        component.usuariosFiltrados();

      expect(resultado)
        .toEqual([
          usuarioOperador
        ]);
    });

    it('debe buscar por nombre completo', () => {
      component.searchText = 'Admin Sistema';

      const resultado =
        component.usuariosFiltrados();

      expect(resultado)
        .toEqual([
          usuarioAdmin
        ]);
    });

    it('debe buscar por correo', () => {
      component.searchText =
        'juan@test.cl';

      const resultado =
        component.usuariosFiltrados();

      expect(resultado)
        .toEqual([
          usuarioOperador
        ]);
    });

    it('debe buscar por rol', () => {
      component.searchText = 'CLIENTE';

      const resultado =
        component.usuariosFiltrados();

      expect(resultado)
        .toEqual([
          usuarioCliente
        ]);
    });

    it('debe ignorar mayúsculas y minúsculas', () => {
      component.searchText = 'RODRIGO';

      const resultado =
        component.usuariosFiltrados();

      expect(resultado)
        .toEqual([
          usuarioCliente
        ]);
    });

    it('debe ignorar espacios al inicio y al final', () => {
      component.searchText =
        '   Rodrigo   ';

      const resultado =
        component.usuariosFiltrados();

      expect(resultado)
        .toEqual([
          usuarioCliente
        ]);
    });

    it('debe retornar una lista vacía cuando no hay coincidencias', () => {
      component.searchText =
        'usuario inexistente';

      expect(
        component.usuariosFiltrados()
      ).toEqual([]);
    });

    it('debe retornar una lista vacía si no hay usuarios cargados', () => {
      component.users = [];
      component.searchText = 'Rodrigo';

      expect(
        component.usuariosFiltrados()
      ).toEqual([]);
    });

  });

  describe('Plantilla inicial', () => {

    it('debe mostrar el título Gestión de Usuarios', () => {
      fixture.detectChanges();

      const titulo =
        fixture.nativeElement
          .querySelector('h1') as HTMLElement;

      expect(titulo.textContent?.trim())
        .toBe('Gestión de Usuarios');
    });

    it('debe mostrar el texto descriptivo', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Administra usuarios del sistema.'
      );
    });

    it('debe mostrar Cargando usuarios mientras loading es true', () => {
      const responseSubject =
        new Subject<ApiResponse<Usuario[]>>();

      usuarioServiceMock.listar
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.loading = true;

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Cargando usuarios...'
      );

      responseSubject.next(
        respuestaUsuarios
      );

      responseSubject.complete();
    });

    it('debe mostrar un mensaje cuando no existen usuarios', () => {
      usuarioServiceMock.listar
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin usuarios',
            data: [],
            timestamp: '2026-07-12T12:00:00'
          })
        );

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'No hay usuarios para mostrar.'
      );
    });

    it('debe mostrar los usuarios cargados', () => {
      fixture.detectChanges();

      const items =
        fixture.nativeElement
          .querySelectorAll('.user-item');

      expect(items.length)
        .toBe(3);

      expect(
        fixture.nativeElement.textContent
      ).toContain('Rodrigo Díaz');

      expect(
        fixture.nativeElement.textContent
      ).toContain('Juan Pérez');

      expect(
        fixture.nativeElement.textContent
      ).toContain('Admin Sistema');
    });

    it('debe mostrar los roles de los usuarios', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('CLIENTE');

      expect(
        fixture.nativeElement.textContent
      ).toContain('OPERADOR');

      expect(
        fixture.nativeElement.textContent
      ).toContain('ADMIN');
    });

    it('debe mostrar Activo para usuarios habilitados', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('Activo');
    });

    it('debe mostrar Deshabilitado para usuarios inactivos', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('Deshabilitado');
    });

    it('debe filtrar la plantilla según el texto de búsqueda', () => {
    component.searchText = 'Rodrigo';

    fixture.detectChanges();

    const items =
      fixture.nativeElement
        .querySelectorAll('.user-item');

    expect(items.length)
      .toBe(1);

    expect(
      fixture.nativeElement.textContent
    ).toContain('Rodrigo Díaz');

    expect(
      fixture.nativeElement.textContent
    ).not.toContain('Juan Pérez');
  });

  });

    describe('abrirEditar', () => {

    it('debe seleccionar el usuario recibido', () => {
      component.abrirEditar(usuarioCliente);

      expect(component.selectedUser)
        .toBe(usuarioCliente);
    });

    it('debe abrir el modal de edición', () => {
      component.abrirEditar(usuarioCliente);

      expect(component.showEditModal)
        .toBe(true);
    });

    it('debe cargar el nombre del usuario en el formulario', () => {
      component.abrirEditar(usuarioCliente);

      expect(component.editForm.nombre)
        .toBe('Rodrigo');
    });

    it('debe cargar el apellido del usuario en el formulario', () => {
      component.abrirEditar(usuarioCliente);

      expect(component.editForm.apellido)
        .toBe('Díaz');
    });

    it('debe cargar el correo del usuario en el formulario', () => {
      component.abrirEditar(usuarioCliente);

      expect(component.editForm.correo)
        .toBe('rodrigo@test.cl');
    });

    it('debe cargar el teléfono del usuario en el formulario', () => {
      component.abrirEditar(usuarioCliente);

      expect(component.editForm.telefono)
        .toBe('+56911112222');
    });

    it('debe cargar la dirección del usuario en el formulario', () => {
      component.abrirEditar(usuarioCliente);

      expect(component.editForm.direccion)
        .toBe('San Antonio');
    });

    it('debe cargar entraId cuando existe', () => {
      component.abrirEditar(usuarioOperador);

      expect(component.editForm.entraId)
        .toBe('entra-juan');
    });

    it('debe cargar entraId null cuando el usuario no posee uno', () => {
      component.abrirEditar(usuarioCliente);

      expect(component.editForm.entraId)
        .toBeNull();
    });

    it('debe cargar el roleId actual del usuario', () => {
      component.abrirEditar(usuarioOperador);

      expect(component.editForm.roleId)
        .toBe(2);
    });

    it('debe crear una copia editable de los datos', () => {
      component.abrirEditar(usuarioCliente);

      component.editForm.nombre = 'Nombre modificado';

      expect(usuarioCliente.nombre)
        .toBe('Rodrigo');

      expect(component.editForm.nombre)
        .toBe('Nombre modificado');
    });

  });

  describe('cerrarEditar', () => {

    it('debe cerrar el modal de edición', () => {
      component.showEditModal = true;

      component.cerrarEditar();

      expect(component.showEditModal)
        .toBe(false);
    });

    it('debe limpiar el usuario seleccionado', () => {
      component.selectedUser =
        usuarioCliente;

      component.cerrarEditar();

      expect(component.selectedUser)
        .toBeNull();
    });

    it('debe cerrar completamente una edición activa', () => {
      component.abrirEditar(usuarioCliente);

      expect(component.showEditModal)
        .toBe(true);

      expect(component.selectedUser)
        .toBe(usuarioCliente);

      component.cerrarEditar();

      expect(component.showEditModal)
        .toBe(false);

      expect(component.selectedUser)
        .toBeNull();
    });

  });

  describe('guardarCambios', () => {

    it('no debe realizar ninguna acción si no existe usuario seleccionado', () => {
      component.selectedUser = null;

      const actualizarSpy =
        vi.spyOn(
          component,
          'actualizarUsuario'
        );

      const confirmacionSpy =
        vi.spyOn(
          component,
          'abrirConfirmacion'
        );

      component.guardarCambios();

      expect(actualizarSpy)
        .not.toHaveBeenCalled();

      expect(confirmacionSpy)
        .not.toHaveBeenCalled();
    });

    it('debe actualizar directamente cuando no cambia el rol', () => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      component.abrirEditar(usuarioCliente);

      component.editForm.nombre =
        'Rodrigo Andrés';

      const actualizarSpy =
        vi.spyOn(
          component,
          'actualizarUsuario'
        ).mockImplementation(() => undefined);

      component.guardarCambios();

      expect(actualizarSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe actualizar directamente cuando el usuario no es ADMIN', () => {
      authServiceMock.getRole
        .mockReturnValue('OPERADOR');

      component.abrirEditar(usuarioCliente);

      component.editForm.roleId = 2;

      const actualizarSpy =
        vi.spyOn(
          component,
          'actualizarUsuario'
        ).mockImplementation(() => undefined);

      const confirmacionSpy =
        vi.spyOn(
          component,
          'abrirConfirmacion'
        );

      component.guardarCambios();

      expect(actualizarSpy)
        .toHaveBeenCalledOnce();

      expect(confirmacionSpy)
        .not.toHaveBeenCalled();
    });

    it('debe solicitar confirmación cuando un ADMIN cambia el rol', () => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      component.abrirEditar(usuarioCliente);

      component.editForm.roleId = 2;

      const confirmacionSpy =
        vi.spyOn(
          component,
          'abrirConfirmacion'
        );

      component.guardarCambios();

      expect(confirmacionSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe configurar correctamente la confirmación de cambio de rol', () => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      component.abrirEditar(usuarioCliente);

      component.editForm.roleId = 2;

      component.guardarCambios();

      expect(component.showConfirmDialog)
        .toBe(true);

      expect(component.confirmTitle)
        .toBe('Cambiar rol del usuario');

      expect(component.confirmText)
        .toBe('Confirmar cambio');

      expect(component.confirmType)
        .toBe('warning');
    });

    it('debe incluir el nombre completo del usuario en el mensaje', () => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      component.abrirEditar(usuarioCliente);

      component.editForm.roleId = 2;

      component.guardarCambios();

      expect(component.confirmMessage)
        .toContain('Rodrigo Díaz');
    });

    it('debe incluir el rol anterior en el mensaje', () => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      component.abrirEditar(usuarioCliente);

      component.editForm.roleId = 2;

      component.guardarCambios();

      expect(component.confirmMessage)
        .toContain('CLIENTE');
    });

    it('debe incluir el nuevo rol en el mensaje', () => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      component.abrirEditar(usuarioCliente);

      component.editForm.roleId = 2;

      component.guardarCambios();

      expect(component.confirmMessage)
        .toContain('OPERADOR');
    });

    it('debe usar NUEVO ROL cuando el roleId no existe', () => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      component.abrirEditar(usuarioCliente);

      component.editForm.roleId = 999;

      component.guardarCambios();

      expect(component.confirmMessage)
        .toContain('NUEVO ROL');
    });

    it('debe guardar una acción pendiente para actualizar el usuario', () => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      component.abrirEditar(usuarioCliente);

      component.editForm.roleId = 3;

      component.guardarCambios();

      expect(component.pendingAction)
        .toEqual(expect.any(Function));
    });

    it('la acción pendiente debe llamar a actualizarUsuario', () => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      component.abrirEditar(usuarioCliente);

      component.editForm.roleId = 3;

      const actualizarSpy =
        vi.spyOn(
          component,
          'actualizarUsuario'
        ).mockImplementation(() => undefined);

      component.guardarCambios();

      component.pendingAction?.();

      expect(actualizarSpy)
        .toHaveBeenCalledOnce();
    });

  });

  describe('actualizarUsuario', () => {

    it('no debe llamar al servicio cuando no existe usuario seleccionado', () => {
      component.selectedUser = null;

      component.actualizarUsuario();

      expect(usuarioServiceMock.actualizar)
        .not.toHaveBeenCalled();
    });

    it('debe llamar al servicio con el ID y formulario correctos', () => {
      usuarioServiceMock.actualizar
        .mockReturnValue(
          of({
            success: true,
            message: 'Usuario actualizado correctamente',
            data: usuarioCliente,
            timestamp: '2026-07-12T12:00:00'
          })
        );

      component.abrirEditar(usuarioCliente);

      component.editForm.nombre =
        'Rodrigo Andrés';

      component.actualizarUsuario();

      expect(usuarioServiceMock.actualizar)
        .toHaveBeenCalledOnce();

      expect(usuarioServiceMock.actualizar)
        .toHaveBeenCalledWith(
          1,
          {
            nombre: 'Rodrigo Andrés',
            apellido: 'Díaz',
            correo: 'rodrigo@test.cl',
            telefono: '+56911112222',
            direccion: 'San Antonio',
            entraId: null,
            roleId: 1
          }
        );
    });

    it('debe volver a cargar los usuarios después de actualizar', () => {
      usuarioServiceMock.actualizar
        .mockReturnValue(
          of({
            success: true,
            message: 'Usuario actualizado correctamente',
            data: usuarioCliente,
            timestamp: '2026-07-12T12:00:00'
          })
        );

      component.abrirEditar(usuarioCliente);

      const cargarSpy =
        vi.spyOn(
          component,
          'cargarUsuarios'
        ).mockImplementation(() => undefined);

      component.actualizarUsuario();

      expect(cargarSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe cerrar el modal después de actualizar', () => {
      usuarioServiceMock.actualizar
        .mockReturnValue(
          of({
            success: true,
            message: 'Usuario actualizado correctamente',
            data: usuarioCliente,
            timestamp: '2026-07-12T12:00:00'
          })
        );

      component.abrirEditar(usuarioCliente);

      const cerrarSpy =
        vi.spyOn(
          component,
          'cerrarEditar'
        );

      component.actualizarUsuario();

      expect(cerrarSpy)
        .toHaveBeenCalledOnce();

      expect(component.showEditModal)
        .toBe(false);

      expect(component.selectedUser)
        .toBeNull();
    });

    it('debe ejecutar primero cargarUsuarios y luego cerrarEditar', () => {
      usuarioServiceMock.actualizar
        .mockReturnValue(
          of({
            success: true,
            message: 'Usuario actualizado correctamente',
            data: usuarioCliente,
            timestamp: '2026-07-12T12:00:00'
          })
        );

      component.abrirEditar(usuarioCliente);

      const cargarSpy =
        vi.spyOn(
          component,
          'cargarUsuarios'
        ).mockImplementation(() => undefined);

      const cerrarSpy =
        vi.spyOn(
          component,
          'cerrarEditar'
        );

      component.actualizarUsuario();

      expect(
        cargarSpy.mock.invocationCallOrder[0]
      ).toBeLessThan(
        cerrarSpy.mock.invocationCallOrder[0]
      );
    });

    it('debe registrar el error cuando falla la actualización', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(() => undefined);

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(() => undefined);

      const errorMock = {
        error: {
          message:
            'El correo ya está registrado'
        }
      };

      usuarioServiceMock.actualizar
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.abrirEditar(usuarioCliente);

      component.actualizarUsuario();

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al actualizar usuario',
          errorMock
        );

      expect(alertSpy)
        .toHaveBeenCalledWith(
          'El correo ya está registrado'
        );

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('debe mostrar un mensaje genérico cuando el backend no entrega detalle', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(() => undefined);

      const alertSpy =
        vi.spyOn(window, 'alert')
          .mockImplementation(() => undefined);

      const errorMock = {
        status: 500
      };

      usuarioServiceMock.actualizar
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.abrirEditar(usuarioCliente);

      component.actualizarUsuario();

      expect(alertSpy)
        .toHaveBeenCalledWith(
          'No se pudo actualizar el usuario'
        );

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

      usuarioServiceMock.actualizar
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.abrirEditar(usuarioCliente);

      component.actualizarUsuario();

      expect(component.showEditModal)
        .toBe(true);

      expect(component.selectedUser)
        .toBe(usuarioCliente);

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

  });

  describe('Plantilla del modal de edición', () => {

    it('no debe mostrar el modal inicialmente', () => {
      fixture.detectChanges();

      const modal =
        fixture.nativeElement
          .querySelector('.edit-modal');

      expect(modal)
        .toBeNull();
    });

    it('debe mostrar el modal al editar un usuario', () => {
      component.abrirEditar(usuarioCliente);

      fixture.detectChanges();

      const modal =
        fixture.nativeElement
          .querySelector('.edit-modal');

      expect(modal)
        .not.toBeNull();

      expect(
        fixture.nativeElement.textContent
      ).toContain('Editar Usuario');
    });

    it('debe mostrar los datos del usuario en los inputs', async () => {
      component.abrirEditar(usuarioCliente);

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

      expect(nombreInput.value)
        .toBe('Rodrigo');

      expect(apellidoInput.value)
        .toBe('Díaz');

      expect(correoInput.value)
        .toBe('rodrigo@test.cl');
    });
    it('debe mostrar el selector de roles para un ADMIN', () => {
      authServiceMock.getRole
        .mockReturnValue('ADMIN');

      component.abrirEditar(usuarioCliente);

      fixture.detectChanges();

      const select =
        fixture.nativeElement
          .querySelector(
            'select[name="roleId"]'
          );

      expect(select)
        .not.toBeNull();
    });

    it('no debe mostrar el selector de roles para un OPERADOR', () => {
      authServiceMock.getRole
        .mockReturnValue('OPERADOR');

      component.abrirEditar(usuarioCliente);

      fixture.detectChanges();

      const select =
        fixture.nativeElement
          .querySelector(
            'select[name="roleId"]'
          );

      expect(select)
        .toBeNull();
    });

    it('debe cerrar el modal al presionar Cancelar', () => {
      component.abrirEditar(usuarioCliente);

      fixture.detectChanges();

      const botones =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.modal-actions button'
            )
        ) as HTMLButtonElement[];

      const cancelar =
        botones.find(
          button =>
            button.textContent?.trim() ===
            'Cancelar'
        );

      cancelar?.click();

      fixture.detectChanges();

      expect(component.showEditModal)
        .toBe(false);

      expect(
        fixture.nativeElement
          .querySelector('.edit-modal')
      ).toBeNull();
    });

    it('debe ejecutar guardarCambios al presionar el botón correspondiente', () => {
      component.abrirEditar(usuarioCliente);

      const guardarSpy =
        vi.spyOn(
          component,
          'guardarCambios'
        ).mockImplementation(() => undefined);

      fixture.detectChanges();

      const botones =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.modal-actions button'
            )
        ) as HTMLButtonElement[];

      const guardar =
        botones.find(
          button =>
            button.textContent?.trim() ===
            'Guardar cambios'
        );

      expect(guardar)
        .toBeDefined();

      guardar?.click();

      expect(guardarSpy)
        .toHaveBeenCalledOnce();
    });

  });

    describe('solicitarCambioEstado', () => {

    it('debe solicitar confirmación para deshabilitar un usuario activo', () => {
      const abrirSpy =
        vi.spyOn(
          component,
          'abrirConfirmacion'
        );

      component.solicitarCambioEstado(
        usuarioCliente
      );

      expect(abrirSpy)
        .toHaveBeenCalledOnce();

      expect(abrirSpy)
        .toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Deshabilitar usuario',
            confirmText: 'Deshabilitar',
            type: 'danger'
          })
        );
    });

    it('debe configurar el título para deshabilitar', () => {
      component.solicitarCambioEstado(
        usuarioCliente
      );

      expect(component.confirmTitle)
        .toBe('Deshabilitar usuario');

      expect(component.confirmText)
        .toBe('Deshabilitar');

      expect(component.confirmType)
        .toBe('danger');

      expect(component.showConfirmDialog)
        .toBe(true);
    });

    it('debe incluir el nombre completo al solicitar deshabilitación', () => {
      component.solicitarCambioEstado(
        usuarioCliente
      );

      expect(component.confirmMessage)
        .toContain('Rodrigo Díaz');
    });

    it('debe advertir que el usuario perderá acceso', () => {
      component.solicitarCambioEstado(
        usuarioCliente
      );

      expect(component.confirmMessage)
        .toContain(
          'dejará de poder acceder al sistema'
        );
    });

    it('debe indicar que el historial se conservará', () => {
      component.solicitarCambioEstado(
        usuarioCliente
      );

      expect(component.confirmMessage)
        .toContain(
          'Su historial se conservará'
        );
    });

    it('debe guardar una acción pendiente para deshabilitar', () => {
      component.solicitarCambioEstado(
        usuarioCliente
      );

      expect(component.pendingAction)
        .toEqual(expect.any(Function));
    });

    it('la acción pendiente debe cambiar el estado del usuario activo', () => {
      const cambiarSpy =
        vi.spyOn(
          component,
          'cambiarEstado'
        ).mockImplementation(() => undefined);

      component.solicitarCambioEstado(
        usuarioCliente
      );

      component.pendingAction?.();

      expect(cambiarSpy)
        .toHaveBeenCalledOnce();

      expect(cambiarSpy)
        .toHaveBeenCalledWith(
          usuarioCliente
        );
    });

    it('debe solicitar confirmación para reactivar un usuario inactivo', () => {
      const abrirSpy =
        vi.spyOn(
          component,
          'abrirConfirmacion'
        );

      component.solicitarCambioEstado(
        usuarioOperador
      );

      expect(abrirSpy)
        .toHaveBeenCalledOnce();

      expect(abrirSpy)
        .toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Reactivar usuario',
            confirmText: 'Reactivar',
            type: 'success'
          })
        );
    });

    it('debe configurar el título para reactivar', () => {
      component.solicitarCambioEstado(
        usuarioOperador
      );

      expect(component.confirmTitle)
        .toBe('Reactivar usuario');

      expect(component.confirmText)
        .toBe('Reactivar');

      expect(component.confirmType)
        .toBe('success');

      expect(component.showConfirmDialog)
        .toBe(true);
    });

    it('debe incluir el nombre completo al solicitar reactivación', () => {
      component.solicitarCambioEstado(
        usuarioOperador
      );

      expect(component.confirmMessage)
        .toContain('Juan Pérez');
    });

    it('debe indicar que el usuario podrá volver a utilizar el sistema', () => {
      component.solicitarCambioEstado(
        usuarioOperador
      );

      expect(component.confirmMessage)
        .toContain(
          'podrá volver a utilizar el sistema'
        );
    });

    it('la acción pendiente debe cambiar el estado del usuario inactivo', () => {
      const cambiarSpy =
        vi.spyOn(
          component,
          'cambiarEstado'
        ).mockImplementation(() => undefined);

      component.solicitarCambioEstado(
        usuarioOperador
      );

      component.pendingAction?.();

      expect(cambiarSpy)
        .toHaveBeenCalledWith(
          usuarioOperador
        );
    });

  });

  describe('cambiarEstado', () => {

    it('debe deshabilitar un usuario activo', () => {
      usuarioServiceMock.cambiarEstado
        .mockReturnValue(
          of({
            success: true,
            message:
              'Estado actualizado correctamente',
            data: {
              ...usuarioCliente,
              activo: false
            },
            timestamp:
              '2026-07-12T12:00:00'
          })
        );

      component.cambiarEstado(
        usuarioCliente
      );

      expect(
        usuarioServiceMock.cambiarEstado
      ).toHaveBeenCalledOnce();

      expect(
        usuarioServiceMock.cambiarEstado
      ).toHaveBeenCalledWith(
        1,
        false
      );
    });

    it('debe reactivar un usuario inactivo', () => {
      usuarioServiceMock.cambiarEstado
        .mockReturnValue(
          of({
            success: true,
            message:
              'Estado actualizado correctamente',
            data: {
              ...usuarioOperador,
              activo: true
            },
            timestamp:
              '2026-07-12T12:00:00'
          })
        );

      component.cambiarEstado(
        usuarioOperador
      );

      expect(
        usuarioServiceMock.cambiarEstado
      ).toHaveBeenCalledWith(
        2,
        true
      );
    });

    it('debe volver a cargar usuarios después de cambiar el estado', () => {
      usuarioServiceMock.cambiarEstado
        .mockReturnValue(
          of({
            success: true,
            message:
              'Estado actualizado correctamente',
            data: {
              ...usuarioCliente,
              activo: false
            },
            timestamp:
              '2026-07-12T12:00:00'
          })
        );

      const cargarSpy =
        vi.spyOn(
          component,
          'cargarUsuarios'
        ).mockImplementation(
          () => undefined
        );

      component.cambiarEstado(
        usuarioCliente
      );

      expect(cargarSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe registrar el error cuando falla el cambio de estado', () => {
      const consoleSpy =
        vi.spyOn(
          console,
          'error'
        ).mockImplementation(
          () => undefined
        );

      const errorMock = {
        status: 500
      };

      usuarioServiceMock.cambiarEstado
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.cambiarEstado(
        usuarioCliente
      );

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al cambiar estado',
          errorMock
        );

      consoleSpy.mockRestore();
    });

    it('no debe volver a cargar usuarios cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(
          console,
          'error'
        ).mockImplementation(
          () => undefined
        );

      usuarioServiceMock.cambiarEstado
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      const cargarSpy =
        vi.spyOn(
          component,
          'cargarUsuarios'
        ).mockImplementation(
          () => undefined
        );

      component.cambiarEstado(
        usuarioCliente
      );

      expect(cargarSpy)
        .not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

  });

  describe('abrirConfirmacion', () => {

    it('debe abrir el diálogo de confirmación', () => {
      const action = vi.fn();

      component.abrirConfirmacion({
        title: 'Título de prueba',
        message: 'Mensaje de prueba',
        confirmText: 'Aceptar',
        type: 'warning',
        action
      });

      expect(component.showConfirmDialog)
        .toBe(true);
    });

    it('debe almacenar el título recibido', () => {
      component.abrirConfirmacion({
        title: 'Confirmar operación',
        message: 'Mensaje',
        confirmText: 'Confirmar',
        type: 'warning',
        action: vi.fn()
      });

      expect(component.confirmTitle)
        .toBe('Confirmar operación');
    });

    it('debe almacenar el mensaje recibido', () => {
      component.abrirConfirmacion({
        title: 'Título',
        message:
          'Esta es una operación importante',
        confirmText: 'Confirmar',
        type: 'warning',
        action: vi.fn()
      });

      expect(component.confirmMessage)
        .toBe(
          'Esta es una operación importante'
        );
    });

    it('debe almacenar el texto del botón', () => {
      component.abrirConfirmacion({
        title: 'Título',
        message: 'Mensaje',
        confirmText: 'Continuar',
        type: 'success',
        action: vi.fn()
      });

      expect(component.confirmText)
        .toBe('Continuar');
    });

    it('debe almacenar el tipo warning', () => {
      component.abrirConfirmacion({
        title: 'Título',
        message: 'Mensaje',
        confirmText: 'Confirmar',
        type: 'warning',
        action: vi.fn()
      });

      expect(component.confirmType)
        .toBe('warning');
    });

    it('debe almacenar el tipo danger', () => {
      component.abrirConfirmacion({
        title: 'Título',
        message: 'Mensaje',
        confirmText: 'Eliminar',
        type: 'danger',
        action: vi.fn()
      });

      expect(component.confirmType)
        .toBe('danger');
    });

    it('debe almacenar el tipo success', () => {
      component.abrirConfirmacion({
        title: 'Título',
        message: 'Mensaje',
        confirmText: 'Reactivar',
        type: 'success',
        action: vi.fn()
      });

      expect(component.confirmType)
        .toBe('success');
    });

    it('debe almacenar la acción pendiente', () => {
      const action = vi.fn();

      component.abrirConfirmacion({
        title: 'Título',
        message: 'Mensaje',
        confirmText: 'Confirmar',
        type: 'warning',
        action
      });

      expect(component.pendingAction)
        .toBe(action);
    });

  });

  describe('confirmarAccion', () => {

    it('debe ejecutar la acción pendiente', () => {
      const action = vi.fn();

      component.pendingAction = action;

      component.confirmarAccion();

      expect(action)
        .toHaveBeenCalledOnce();
    });

    it('debe cerrar la confirmación después de ejecutar la acción', () => {
      component.showConfirmDialog = true;
      component.pendingAction = vi.fn();

      component.confirmarAccion();

      expect(component.showConfirmDialog)
        .toBe(false);

      expect(component.pendingAction)
        .toBeNull();
    });

    it('debe ejecutar la acción antes de cerrar la confirmación', () => {
      const action = vi.fn();

      component.pendingAction = action;

      const cerrarSpy =
        vi.spyOn(
          component,
          'cerrarConfirmacion'
        );

      component.confirmarAccion();

      expect(
        action.mock.invocationCallOrder[0]
      ).toBeLessThan(
        cerrarSpy.mock.invocationCallOrder[0]
      );
    });

    it('debe cerrar la confirmación aunque no exista acción pendiente', () => {
      component.showConfirmDialog = true;
      component.pendingAction = null;

      component.confirmarAccion();

      expect(component.showConfirmDialog)
        .toBe(false);

      expect(component.pendingAction)
        .toBeNull();
    });

  });

  describe('cerrarConfirmacion', () => {

    it('debe cerrar el diálogo', () => {
      component.showConfirmDialog = true;

      component.cerrarConfirmacion();

      expect(component.showConfirmDialog)
        .toBe(false);
    });

    it('debe limpiar la acción pendiente', () => {
      component.pendingAction = vi.fn();

      component.cerrarConfirmacion();

      expect(component.pendingAction)
        .toBeNull();
    });

    it('debe conservar los textos configurados', () => {
      component.confirmTitle =
        'Título existente';

      component.confirmMessage =
        'Mensaje existente';

      component.confirmText =
        'Aceptar';

      component.cerrarConfirmacion();

      expect(component.confirmTitle)
        .toBe('Título existente');

      expect(component.confirmMessage)
        .toBe('Mensaje existente');

      expect(component.confirmText)
        .toBe('Aceptar');
    });

  });

  describe('Plantilla de acciones de usuario', () => {

    it('debe mostrar el botón Deshabilitar para un usuario activo', () => {
      fixture.detectChanges();

      const items =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.user-item'
            )
        ) as HTMLElement[];

      const primerItem =
        items[0];

      expect(primerItem.textContent)
        .toContain('Deshabilitar');

      expect(primerItem.textContent)
        .not.toContain('Activar');
    });

    it('debe mostrar el botón Activar para un usuario inactivo', () => {
      fixture.detectChanges();

      const items =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.user-item'
            )
        ) as HTMLElement[];

      const segundoItem =
        items[1];

      expect(segundoItem.textContent)
        .toContain('Activar');

      expect(segundoItem.textContent)
        .not.toContain('Deshabilitar');
    });

    it('debe ejecutar solicitarCambioEstado al presionar Deshabilitar', () => {
    const solicitarSpy =
      vi.spyOn(
        component,
        'solicitarCambioEstado'
      ).mockImplementation(
        () => undefined
      );

    fixture.detectChanges();

    const items =
      Array.from(
        fixture.nativeElement
          .querySelectorAll(
            '.user-item'
          )
      ) as HTMLElement[];

    expect(items.length)
      .toBeGreaterThan(0);

    const primerUsuario =
      items[0];

    const botones =
      Array.from(
        primerUsuario.querySelectorAll(
          '.actions button'
        )
      ) as HTMLButtonElement[];

    const deshabilitar =
      botones.find(
        button =>
          button.textContent?.trim() ===
          'Deshabilitar'
      );

    expect(deshabilitar)
      .toBeDefined();

    deshabilitar!.click();

    expect(solicitarSpy)
      .toHaveBeenCalledOnce();

    expect(solicitarSpy)
      .toHaveBeenCalledWith(
        usuarioCliente
      );
  });

    it('debe ejecutar solicitarCambioEstado al presionar Activar', () => {
      const solicitarSpy =
        vi.spyOn(
          component,
          'solicitarCambioEstado'
        ).mockImplementation(
          () => undefined
        );

      fixture.detectChanges();

      const items =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.user-item'
            )
        ) as HTMLElement[];

      const botones =
        Array.from(
          items[1].querySelectorAll(
            '.actions button'
          )
        ) as HTMLButtonElement[];

      const activar =
        botones.find(
          button =>
            button.textContent?.trim() ===
            'Activar'
        );

      expect(activar)
        .toBeDefined();

      activar?.click();

      expect(solicitarSpy)
        .toHaveBeenCalledOnce();

      expect(solicitarSpy)
        .toHaveBeenCalledWith(
          usuarioOperador
        );
    });

    it('debe ejecutar abrirEditar al presionar Editar', () => {
      const editarSpy =
        vi.spyOn(
          component,
          'abrirEditar'
        ).mockImplementation(
          () => undefined
        );

      fixture.detectChanges();

      const items =
        Array.from(
          fixture.nativeElement
            .querySelectorAll(
              '.user-item'
            )
        ) as HTMLElement[];

      const botones =
        Array.from(
          items[0].querySelectorAll(
            '.actions button'
          )
        ) as HTMLButtonElement[];

      const editar =
        botones.find(
          button =>
            button.textContent?.trim() ===
            'Editar'
        );

      expect(editar)
        .toBeDefined();

      editar?.click();

      expect(editarSpy)
        .toHaveBeenCalledOnce();

      expect(editarSpy)
        .toHaveBeenCalledWith(
          usuarioCliente
        );
    });

  });

  describe('Plantilla del diálogo de confirmación', () => {

    it('debe enviar los datos configurados al componente de confirmación', () => {
      component.abrirConfirmacion({
        title: 'Deshabilitar usuario',
        message:
          'El usuario dejará de acceder.',
        confirmText: 'Deshabilitar',
        type: 'danger',
        action: vi.fn()
      });

      fixture.detectChanges();

      const dialogDebug =
        fixture.debugElement.query(
          debugElement =>
            debugElement.name ===
            'app-confirmation-dialog'
        );

      expect(dialogDebug)
        .not.toBeNull();

      const dialog =
        dialogDebug.componentInstance;

      expect(dialog.visible)
        .toBe(true);

      expect(dialog.title)
        .toBe('Deshabilitar usuario');

      expect(dialog.message)
        .toBe(
          'El usuario dejará de acceder.'
        );

      expect(dialog.confirmText)
        .toBe('Deshabilitar');

      expect(dialog.type)
        .toBe('danger');
    });

  });
});