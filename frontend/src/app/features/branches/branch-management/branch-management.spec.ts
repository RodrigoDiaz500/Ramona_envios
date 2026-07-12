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
  ApiResponse,
  Sucursal,
  SucursalService
} from '../../../../core/services/sucursal.service';

import {
  BranchManagement
} from './branch-management';

describe('BranchManagement', () => {

  let component: BranchManagement;
  let fixture: ComponentFixture<BranchManagement>;

  let sucursalServiceMock: {
    listar: ReturnType<typeof vi.fn>;
    crear: ReturnType<typeof vi.fn>;
    actualizar: ReturnType<typeof vi.fn>;
    cambiarEstado: ReturnType<typeof vi.fn>;
  };

  const sucursalActiva: Sucursal = {
    id: 1,
    nombre: 'Sucursal San Antonio',
    direccion: 'Barros Luco 123',
    ciudad: 'San Antonio',
    telefono: '+56352223344',
    habilitada: true,
    fechaCreacion: '2026-07-01T10:00:00'
  };

  const sucursalInactiva: Sucursal = {
    id: 2,
    nombre: 'Sucursal Santiago',
    direccion: 'Alameda 456',
    ciudad: 'Santiago',
    telefono: '+56222223333',
    habilitada: false,
    fechaCreacion: '2026-07-02T11:00:00'
  };

  const sucursalValparaiso: Sucursal = {
    id: 3,
    nombre: 'Sucursal Valparaíso',
    direccion: 'Pedro Montt 789',
    ciudad: 'Valparaíso',
    telefono: '+56322445566',
    habilitada: true,
    fechaCreacion: '2026-07-03T12:00:00'
  };

  const respuestaSucursales:
    ApiResponse<Sucursal[]> = {
      success: true,
      message: 'Sucursales obtenidas correctamente',
      data: [
        sucursalActiva,
        sucursalInactiva,
        sucursalValparaiso
      ],
      timestamp: '2026-07-12T12:00:00'
    };

  beforeEach(async () => {
    sucursalServiceMock = {
      listar: vi.fn().mockReturnValue(
        of(respuestaSucursales)
      ),
      crear: vi.fn(),
      actualizar: vi.fn(),
      cambiarEstado: vi.fn()
    };

    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [
        BranchManagement
      ],
      providers: [
        {
          provide: SucursalService,
          useValue: sucursalServiceMock
        }
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(BranchManagement);

    component =
      fixture.componentInstance;
  });

  describe('Creación del componente', () => {

    it('debe crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe iniciar sin sucursales', () => {
      expect(component.branches)
        .toEqual([]);
    });

    it('debe iniciar con loading en false', () => {
      expect(component.loading)
        .toBe(false);
    });

    it('debe iniciar con el modal cerrado', () => {
      expect(component.showModal)
        .toBe(false);
    });

    it('debe iniciar sin sucursal seleccionada', () => {
      expect(component.selectedBranch)
        .toBeNull();
    });

    it('debe iniciar con el diálogo de confirmación cerrado', () => {
      expect(component.showConfirmDialog)
        .toBe(false);

      expect(component.pendingAction)
        .toBeNull();
    });

    it('debe iniciar con el formulario vacío', () => {
      expect(component.form)
        .toEqual({
          nombre: '',
          direccion: '',
          ciudad: '',
          telefono: ''
        });
    });

    it('debe iniciar con los valores predeterminados de confirmación', () => {
      expect(component.confirmTitle)
        .toBe('');

      expect(component.confirmMessage)
        .toBe('');

      expect(component.confirmText)
        .toBe('Confirmar');

      expect(component.confirmType)
        .toBe('warning');
    });

  });

  describe('ngOnInit', () => {

    it('debe llamar a cargarSucursales', () => {
      const cargarSpy =
        vi.spyOn(
          component,
          'cargarSucursales'
        );

      component.ngOnInit();

      expect(cargarSpy)
        .toHaveBeenCalledOnce();
    });

  });

  describe('cargarSucursales', () => {

    it('debe llamar al servicio de sucursales', () => {
      component.cargarSucursales();

      expect(sucursalServiceMock.listar)
        .toHaveBeenCalledOnce();
    });

    it('debe activar loading mientras espera la respuesta', () => {
      const responseSubject =
        new Subject<ApiResponse<Sucursal[]>>();

      sucursalServiceMock.listar
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.cargarSucursales();

      expect(component.loading)
        .toBe(true);

      responseSubject.next(
        respuestaSucursales
      );

      responseSubject.complete();

      expect(component.loading)
        .toBe(false);
    });

    it('debe cargar las sucursales recibidas', () => {
      component.cargarSucursales();

      expect(component.branches)
        .toEqual([
          sucursalActiva,
          sucursalInactiva,
          sucursalValparaiso
        ]);

      expect(component.branches)
        .toHaveLength(3);
    });

    it('debe conservar los datos de las sucursales', () => {
      component.cargarSucursales();

      expect(component.branches[0].nombre)
        .toBe('Sucursal San Antonio');

      expect(component.branches[1].ciudad)
        .toBe('Santiago');

      expect(component.branches[2].telefono)
        .toBe('+56322445566');
    });

    it('debe conservar el estado de cada sucursal', () => {
      component.cargarSucursales();

      expect(component.branches[0].habilitada)
        .toBe(true);

      expect(component.branches[1].habilitada)
        .toBe(false);

      expect(component.branches[2].habilitada)
        .toBe(true);
    });

    it('debe finalizar loading después de una respuesta exitosa', () => {
      component.cargarSucursales();

      expect(component.loading)
        .toBe(false);
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

      expect(component.loading)
        .toBe(false);
    });

    it('debe limpiar la lista cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(() => undefined);

      const errorMock = {
        status: 500
      };

      component.branches = [
        sucursalActiva
      ];

      sucursalServiceMock.listar
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.cargarSucursales();

      expect(component.branches)
        .toEqual([]);

      expect(component.loading)
        .toBe(false);

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al cargar sucursales',
          errorMock
        );

      consoleSpy.mockRestore();
    });

  });

  describe('abrirNuevaSucursal', () => {

    it('debe abrir el modal', () => {
      component.abrirNuevaSucursal();

      expect(component.showModal)
        .toBe(true);
    });

    it('debe limpiar la sucursal seleccionada', () => {
      component.selectedBranch =
        sucursalActiva;

      component.abrirNuevaSucursal();

      expect(component.selectedBranch)
        .toBeNull();
    });

    it('debe reiniciar completamente el formulario', () => {
      component.form = {
        nombre: 'Nombre anterior',
        direccion: 'Dirección anterior',
        ciudad: 'Ciudad anterior',
        telefono: '123456789'
      };

      component.abrirNuevaSucursal();

      expect(component.form)
        .toEqual({
          nombre: '',
          direccion: '',
          ciudad: '',
          telefono: ''
        });
    });

    it('debe preparar el componente para crear una nueva sucursal', () => {
      component.abrirEditar(
        sucursalActiva
      );

      expect(component.selectedBranch)
        .toBe(sucursalActiva);

      component.abrirNuevaSucursal();

      expect(component.selectedBranch)
        .toBeNull();

      expect(component.showModal)
        .toBe(true);

      expect(component.form.nombre)
        .toBe('');
    });

  });

  describe('abrirEditar', () => {

    it('debe seleccionar la sucursal recibida', () => {
      component.abrirEditar(
        sucursalActiva
      );

      expect(component.selectedBranch)
        .toBe(sucursalActiva);
    });

    it('debe abrir el modal de edición', () => {
      component.abrirEditar(
        sucursalActiva
      );

      expect(component.showModal)
        .toBe(true);
    });

    it('debe cargar el nombre de la sucursal', () => {
      component.abrirEditar(
        sucursalActiva
      );

      expect(component.form.nombre)
        .toBe('Sucursal San Antonio');
    });

    it('debe cargar la dirección de la sucursal', () => {
      component.abrirEditar(
        sucursalActiva
      );

      expect(component.form.direccion)
        .toBe('Barros Luco 123');
    });

    it('debe cargar la ciudad de la sucursal', () => {
      component.abrirEditar(
        sucursalActiva
      );

      expect(component.form.ciudad)
        .toBe('San Antonio');
    });

    it('debe cargar el teléfono de la sucursal', () => {
      component.abrirEditar(
        sucursalActiva
      );

      expect(component.form.telefono)
        .toBe('+56352223344');
    });

    it('debe crear una copia editable de los datos', () => {
      component.abrirEditar(
        sucursalActiva
      );

      component.form.nombre =
        'Nombre modificado';

      expect(sucursalActiva.nombre)
        .toBe('Sucursal San Antonio');

      expect(component.form.nombre)
        .toBe('Nombre modificado');
    });

    it('debe reemplazar datos de una edición anterior', () => {
      component.abrirEditar(
        sucursalActiva
      );

      component.abrirEditar(
        sucursalValparaiso
      );

      expect(component.selectedBranch)
        .toBe(sucursalValparaiso);

      expect(component.form.nombre)
        .toBe('Sucursal Valparaíso');

      expect(component.form.ciudad)
        .toBe('Valparaíso');
    });

  });

  describe('cerrarModal', () => {

    it('debe cerrar el modal', () => {
      component.showModal = true;

      component.cerrarModal();

      expect(component.showModal)
        .toBe(false);
    });

    it('debe limpiar la sucursal seleccionada', () => {
      component.selectedBranch =
        sucursalActiva;

      component.cerrarModal();

      expect(component.selectedBranch)
        .toBeNull();
    });

    it('debe cerrar completamente una edición activa', () => {
      component.abrirEditar(
        sucursalActiva
      );

      expect(component.showModal)
        .toBe(true);

      expect(component.selectedBranch)
        .toBe(sucursalActiva);

      component.cerrarModal();

      expect(component.showModal)
        .toBe(false);

      expect(component.selectedBranch)
        .toBeNull();
    });

    it('no debe limpiar el formulario al cerrar', () => {
      component.abrirEditar(
        sucursalActiva
      );

      component.cerrarModal();

      expect(component.form.nombre)
        .toBe('Sucursal San Antonio');

      expect(component.form.ciudad)
        .toBe('San Antonio');
    });

  });

  describe('Plantilla inicial', () => {

    it('debe mostrar el título Gestión de Sucursales', () => {
      fixture.detectChanges();

      const titulo =
        fixture.nativeElement
          .querySelector('h1') as HTMLElement;

      expect(titulo.textContent?.trim())
        .toBe('Gestión de Sucursales');
    });

    it('debe mostrar el texto descriptivo', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Administra las sucursales del sistema.'
      );
    });

    it('debe mostrar el botón Nueva Sucursal', () => {
      fixture.detectChanges();

      const botones =
        Array.from(
          fixture.nativeElement
            .querySelectorAll('button')
        ) as HTMLButtonElement[];

      const nuevaSucursal =
        botones.find(
          button =>
            button.textContent?.trim() ===
            'Nueva Sucursal'
        );

      expect(nuevaSucursal)
        .toBeDefined();
    });

    it('debe mostrar Cargando sucursales durante la carga', () => {
      const responseSubject =
        new Subject<ApiResponse<Sucursal[]>>();

      sucursalServiceMock.listar
        .mockReturnValue(
          responseSubject.asObservable()
        );

      component.loading = true;

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Cargando sucursales...'
      );

      responseSubject.next(
        respuestaSucursales
      );

      responseSubject.complete();
    });

    it('debe mostrar mensaje cuando no existen sucursales', () => {
      sucursalServiceMock.listar
        .mockReturnValue(
          of({
            success: true,
            message: 'Sin sucursales',
            data: [],
            timestamp: '2026-07-12T12:00:00'
          })
        );

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'No hay sucursales para mostrar.'
      );
    });

    it('debe mostrar las sucursales cargadas', () => {
      fixture.detectChanges();

      const items =
        fixture.nativeElement
          .querySelectorAll('.branch-item');

      expect(items.length)
        .toBe(3);

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Sucursal San Antonio'
      );

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Sucursal Santiago'
      );

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Sucursal Valparaíso'
      );
    });

    it('debe mostrar dirección, ciudad y teléfono', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('Barros Luco 123');

      expect(
        fixture.nativeElement.textContent
      ).toContain('San Antonio');

      expect(
        fixture.nativeElement.textContent
      ).toContain('+56352223344');
    });

    it('debe mostrar Activa para una sucursal habilitada', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('Activa');
    });

    it('debe mostrar Inactiva para una sucursal deshabilitada', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('Inactiva');
    });

    it('debe mostrar Deshabilitar para una sucursal activa', () => {
      fixture.detectChanges();

      const items =
        Array.from(
          fixture.nativeElement
            .querySelectorAll('.branch-item')
        ) as HTMLElement[];

      expect(items[0].textContent)
        .toContain('Deshabilitar');
    });

    it('debe mostrar Activar para una sucursal inactiva', () => {
      fixture.detectChanges();

      const items =
        Array.from(
          fixture.nativeElement
            .querySelectorAll('.branch-item')
        ) as HTMLElement[];

      expect(items[1].textContent)
        .toContain('Activar');
    });

  });

  describe('Plantilla del modal', () => {

    it('no debe mostrar el modal inicialmente', () => {
      fixture.detectChanges();

      expect(
        fixture.nativeElement
          .querySelector('.edit-modal')
      ).toBeNull();
    });

    it('debe mostrar Nueva Sucursal al abrir el modal de creación', () => {
      component.abrirNuevaSucursal();

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('Nueva Sucursal');

      expect(
        fixture.nativeElement
          .querySelector('.edit-modal')
      ).not.toBeNull();
    });

    it('debe mostrar Editar Sucursal al editar', () => {
      component.abrirEditar(
        sucursalActiva
      );

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain('Editar Sucursal');
    });

    it('debe mostrar Crear sucursal en modo creación', () => {
      component.abrirNuevaSucursal();

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
            'Crear sucursal'
        );

      expect(guardar)
        .toBeDefined();
    });

    it('debe mostrar Guardar cambios en modo edición', () => {
      component.abrirEditar(
        sucursalActiva
      );

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
    });

    it('debe abrir el modal al presionar Nueva Sucursal', () => {
      const abrirSpy =
        vi.spyOn(
          component,
          'abrirNuevaSucursal'
        ).mockImplementation(() => {
          component.showModal = true;
        });

      fixture.detectChanges();

      const botones =
        Array.from(
          fixture.nativeElement
            .querySelectorAll('button')
        ) as HTMLButtonElement[];

      const nuevaSucursal =
        botones.find(
          button =>
            button.textContent?.trim() ===
            'Nueva Sucursal'
        );

      nuevaSucursal?.click();

      expect(abrirSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe cerrar el modal al presionar Cancelar', () => {
      component.abrirNuevaSucursal();

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

      expect(component.showModal)
        .toBe(false);

      expect(
        fixture.nativeElement
          .querySelector('.edit-modal')
      ).toBeNull();
    });

  });
  describe('guardarSucursal', () => {

  describe('Creación de sucursal', () => {

    beforeEach(() => {
      component.abrirNuevaSucursal();

      component.form = {
        nombre: 'Sucursal Viña del Mar',
        direccion: 'Av. Libertad 100',
        ciudad: 'Viña del Mar',
        telefono: '+56323334444'
      };
    });

    it('debe llamar al servicio crear', () => {

      sucursalServiceMock.crear.mockReturnValue(
        of({
          success: true,
          message: 'Sucursal creada',
          data: sucursalActiva,
          timestamp: '2026-07-12'
        })
      );

      component.guardarSucursal();

      expect(
        sucursalServiceMock.crear
      ).toHaveBeenCalledOnce();

    });

    it('debe enviar el formulario correctamente', () => {

      sucursalServiceMock.crear.mockReturnValue(
        of({
          success: true,
          message: '',
          data: sucursalActiva,
          timestamp: ''
        })
      );

      component.guardarSucursal();

      expect(
        sucursalServiceMock.crear
      ).toHaveBeenCalledWith({

        nombre: 'Sucursal Viña del Mar',

        direccion: 'Av. Libertad 100',

        ciudad: 'Viña del Mar',

        telefono: '+56323334444'

      });

    });

    it('debe volver a cargar las sucursales', () => {

      sucursalServiceMock.crear.mockReturnValue(
        of({
          success: true,
          message: '',
          data: sucursalActiva,
          timestamp: ''
        })
      );

      const cargarSpy =
        vi.spyOn(
          component,
          'cargarSucursales'
        ).mockImplementation(() => {});

      component.guardarSucursal();

      expect(cargarSpy)
        .toHaveBeenCalledOnce();

    });

    it('debe cerrar el modal', () => {

      sucursalServiceMock.crear.mockReturnValue(
        of({
          success: true,
          message: '',
          data: sucursalActiva,
          timestamp: ''
        })
      );

      const cerrarSpy =
        vi.spyOn(
          component,
          'cerrarModal'
        );

      component.guardarSucursal();

      expect(cerrarSpy)
        .toHaveBeenCalledOnce();

    });

    it('debe ejecutar cargarSucursales antes de cerrarModal', () => {

      sucursalServiceMock.crear.mockReturnValue(
        of({
          success: true,
          message: '',
          data: sucursalActiva,
          timestamp: ''
        })
      );

      const cargarSpy =
        vi.spyOn(
          component,
          'cargarSucursales'
        ).mockImplementation(() => {});

      const cerrarSpy =
        vi.spyOn(
          component,
          'cerrarModal'
        );

      component.guardarSucursal();

      expect(
        cargarSpy.mock.invocationCallOrder[0]
      ).toBeLessThan(

        cerrarSpy.mock.invocationCallOrder[0]

      );

    });

    it('debe mostrar el mensaje del backend cuando falla', () => {

      const consoleSpy =
        vi.spyOn(console,'error')
        .mockImplementation(()=>{});

      const alertSpy =
        vi.spyOn(window,'alert')
        .mockImplementation(()=>{});

      const error = {

        error:{

          message:'La sucursal ya existe'

        }

      };

      sucursalServiceMock.crear.mockReturnValue(

        throwError(()=>error)

      );

      component.guardarSucursal();

      expect(alertSpy)

        .toHaveBeenCalledWith(

          'La sucursal ya existe'

        );

      expect(consoleSpy)

        .toHaveBeenCalled();

      consoleSpy.mockRestore();

      alertSpy.mockRestore();

    });

    it('debe mostrar mensaje genérico cuando el backend no entrega detalle', () => {

      const consoleSpy =
        vi.spyOn(console,'error')
        .mockImplementation(()=>{});

      const alertSpy =
        vi.spyOn(window,'alert')
        .mockImplementation(()=>{});

      sucursalServiceMock.crear.mockReturnValue(

        throwError(()=>({

          status:500

        }))

      );

      component.guardarSucursal();

      expect(alertSpy)

        .toHaveBeenCalledWith(

          'No se pudo crear la sucursal'

        );

      consoleSpy.mockRestore();

      alertSpy.mockRestore();

    });

    it('no debe cerrar el modal cuando ocurre un error', () => {

      vi.spyOn(console,'error')
        .mockImplementation(()=>{});

      vi.spyOn(window,'alert')
        .mockImplementation(()=>{});

      sucursalServiceMock.crear.mockReturnValue(

        throwError(()=>({

          status:500

        }))

      );

      component.guardarSucursal();

      expect(component.showModal)

        .toBe(true);

    });

  });

  describe('Actualización de sucursal', () => {

    beforeEach(() => {

      component.abrirEditar(

        sucursalActiva

      );

      component.form.nombre =
        'Sucursal Actualizada';

    });

    it('debe llamar al servicio actualizar', () => {

      sucursalServiceMock.actualizar.mockReturnValue(

        of({

          success:true,

          message:'',

          data:sucursalActiva,

          timestamp:''

        })

      );

      component.guardarSucursal();

      expect(

        sucursalServiceMock.actualizar

      ).toHaveBeenCalledOnce();

    });

    it('debe enviar el id correcto', () => {

      sucursalServiceMock.actualizar.mockReturnValue(

        of({

          success:true,

          message:'',

          data:sucursalActiva,

          timestamp:''

        })

      );

      component.guardarSucursal();

      expect(

        sucursalServiceMock.actualizar

      ).toHaveBeenCalledWith(

        1,

        {

          nombre:'Sucursal Actualizada',

          direccion:'Barros Luco 123',

          ciudad:'San Antonio',

          telefono:'+56352223344'

        }

      );

    });

    it('debe recargar sucursales después de actualizar', () => {

      sucursalServiceMock.actualizar.mockReturnValue(

        of({

          success:true,

          message:'',

          data:sucursalActiva,

          timestamp:''

        })

      );

      const cargarSpy=

        vi.spyOn(

          component,

          'cargarSucursales'

        ).mockImplementation(()=>{});

      component.guardarSucursal();

      expect(cargarSpy)

        .toHaveBeenCalledOnce();

    });

    it('debe cerrar el modal después de actualizar', () => {

      sucursalServiceMock.actualizar.mockReturnValue(

        of({

          success:true,

          message:'',

          data:sucursalActiva,

          timestamp:''

        })

      );

      const cerrarSpy=

        vi.spyOn(

          component,

          'cerrarModal'

        );

      component.guardarSucursal();

      expect(cerrarSpy)

        .toHaveBeenCalledOnce();

    });

    it('debe mostrar el mensaje recibido cuando ocurre un error', () => {

      const consoleSpy=

        vi.spyOn(console,'error')

        .mockImplementation(()=>{});

      const alertSpy=

        vi.spyOn(window,'alert')

        .mockImplementation(()=>{});

      sucursalServiceMock.actualizar.mockReturnValue(

        throwError(()=>({

          error:{

            message:'Nombre duplicado'

          }

        }))

      );

      component.guardarSucursal();

      expect(alertSpy)

        .toHaveBeenCalledWith(

          'Nombre duplicado'

        );

      consoleSpy.mockRestore();

      alertSpy.mockRestore();

    });

    it('debe mostrar mensaje genérico cuando el backend no entrega detalle', () => {

      vi.spyOn(console,'error')

        .mockImplementation(()=>{});

      const alertSpy=

        vi.spyOn(window,'alert')

        .mockImplementation(()=>{});

      sucursalServiceMock.actualizar.mockReturnValue(

        throwError(()=>({

          status:500

        }))

      );

      component.guardarSucursal();

      expect(alertSpy)

        .toHaveBeenCalledWith(

          'No se pudo actualizar la sucursal'

        );

    });

    it('no debe cerrar el modal cuando falla la actualización', () => {

      vi.spyOn(console,'error')

        .mockImplementation(()=>{});

      vi.spyOn(window,'alert')

        .mockImplementation(()=>{});

      sucursalServiceMock.actualizar.mockReturnValue(

        throwError(()=>({

          status:500

        }))

      );

      component.guardarSucursal();

      expect(component.showModal)

        .toBe(true);

      expect(component.selectedBranch)

        .toBe(sucursalActiva);

    });

  });

  });
    describe('solicitarCambioEstado', () => {

    it('debe solicitar confirmación para deshabilitar una sucursal activa', () => {
      const confirmarSpy =
        vi.spyOn(
          component,
          'abrirConfirmacion'
        );

      component.solicitarCambioEstado(
        sucursalActiva
      );

      expect(confirmarSpy)
        .toHaveBeenCalledOnce();

      expect(confirmarSpy)
        .toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Deshabilitar sucursal',
            confirmText: 'Deshabilitar',
            type: 'danger'
          })
        );
    });

    it('debe configurar correctamente la confirmación de deshabilitación', () => {
      component.solicitarCambioEstado(
        sucursalActiva
      );

      expect(component.showConfirmDialog)
        .toBe(true);

      expect(component.confirmTitle)
        .toBe('Deshabilitar sucursal');

      expect(component.confirmText)
        .toBe('Deshabilitar');

      expect(component.confirmType)
        .toBe('danger');
    });

    it('debe incluir el nombre de la sucursal activa en el mensaje', () => {
      component.solicitarCambioEstado(
        sucursalActiva
      );

      expect(component.confirmMessage)
        .toContain(
          'Sucursal San Antonio'
        );
    });

    it('debe indicar que la sucursal dejará de estar disponible', () => {
      component.solicitarCambioEstado(
        sucursalActiva
      );

      expect(component.confirmMessage)
        .toContain(
          'dejará de estar disponible para nuevos envíos'
        );
    });

    it('debe almacenar una acción pendiente al deshabilitar', () => {
      component.solicitarCambioEstado(
        sucursalActiva
      );

      expect(component.pendingAction)
        .toEqual(
          expect.any(Function)
        );
    });

    it('la acción pendiente debe llamar a cambiarEstado con la sucursal activa', () => {
      const cambiarSpy =
        vi.spyOn(
          component,
          'cambiarEstado'
        ).mockImplementation(
          () => undefined
        );

      component.solicitarCambioEstado(
        sucursalActiva
      );

      component.pendingAction?.();

      expect(cambiarSpy)
        .toHaveBeenCalledOnce();

      expect(cambiarSpy)
        .toHaveBeenCalledWith(
          sucursalActiva
        );
    });

    it('debe solicitar confirmación para reactivar una sucursal inactiva', () => {
      const confirmarSpy =
        vi.spyOn(
          component,
          'abrirConfirmacion'
        );

      component.solicitarCambioEstado(
        sucursalInactiva
      );

      expect(confirmarSpy)
        .toHaveBeenCalledOnce();

      expect(confirmarSpy)
        .toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Reactivar sucursal',
            confirmText: 'Reactivar',
            type: 'success'
          })
        );
    });

    it('debe configurar correctamente la confirmación de reactivación', () => {
      component.solicitarCambioEstado(
        sucursalInactiva
      );

      expect(component.showConfirmDialog)
        .toBe(true);

      expect(component.confirmTitle)
        .toBe('Reactivar sucursal');

      expect(component.confirmText)
        .toBe('Reactivar');

      expect(component.confirmType)
        .toBe('success');
    });

    it('debe incluir el nombre de la sucursal inactiva en el mensaje', () => {
      component.solicitarCambioEstado(
        sucursalInactiva
      );

      expect(component.confirmMessage)
        .toContain(
          'Sucursal Santiago'
        );
    });

    it('debe indicar que la sucursal volverá a estar disponible', () => {
      component.solicitarCambioEstado(
        sucursalInactiva
      );

      expect(component.confirmMessage)
        .toContain(
          'volverá a estar disponible para nuevos envíos'
        );
    });

    it('la acción pendiente debe llamar a cambiarEstado con la sucursal inactiva', () => {
      const cambiarSpy =
        vi.spyOn(
          component,
          'cambiarEstado'
        ).mockImplementation(
          () => undefined
        );

      component.solicitarCambioEstado(
        sucursalInactiva
      );

      component.pendingAction?.();

      expect(cambiarSpy)
        .toHaveBeenCalledOnce();

      expect(cambiarSpy)
        .toHaveBeenCalledWith(
          sucursalInactiva
        );
    });

  });

  describe('cambiarEstado', () => {

    it('debe deshabilitar una sucursal activa', () => {
      sucursalServiceMock.cambiarEstado
        .mockReturnValue(
          of({
            success: true,
            message:
              'Estado actualizado correctamente',
            data: {
              ...sucursalActiva,
              habilitada: false
            },
            timestamp:
              '2026-07-12T12:00:00'
          })
        );

      component.cambiarEstado(
        sucursalActiva
      );

      expect(
        sucursalServiceMock.cambiarEstado
      ).toHaveBeenCalledOnce();

      expect(
        sucursalServiceMock.cambiarEstado
      ).toHaveBeenCalledWith(
        1,
        false
      );
    });

    it('debe reactivar una sucursal inactiva', () => {
      sucursalServiceMock.cambiarEstado
        .mockReturnValue(
          of({
            success: true,
            message:
              'Estado actualizado correctamente',
            data: {
              ...sucursalInactiva,
              habilitada: true
            },
            timestamp:
              '2026-07-12T12:00:00'
          })
        );

      component.cambiarEstado(
        sucursalInactiva
      );

      expect(
        sucursalServiceMock.cambiarEstado
      ).toHaveBeenCalledWith(
        2,
        true
      );
    });

    it('debe volver a cargar las sucursales después de cambiar el estado', () => {
      sucursalServiceMock.cambiarEstado
        .mockReturnValue(
          of({
            success: true,
            message:
              'Estado actualizado correctamente',
            data: {
              ...sucursalActiva,
              habilitada: false
            },
            timestamp:
              '2026-07-12T12:00:00'
          })
        );

      const cargarSpy =
        vi.spyOn(
          component,
          'cargarSucursales'
        ).mockImplementation(
          () => undefined
        );

      component.cambiarEstado(
        sucursalActiva
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

      sucursalServiceMock.cambiarEstado
        .mockReturnValue(
          throwError(() => errorMock)
        );

      component.cambiarEstado(
        sucursalActiva
      );

      expect(consoleSpy)
        .toHaveBeenCalledWith(
          'Error al cambiar estado de sucursal',
          errorMock
        );

      consoleSpy.mockRestore();
    });

    it('no debe recargar las sucursales cuando ocurre un error', () => {
      const consoleSpy =
        vi.spyOn(
          console,
          'error'
        ).mockImplementation(
          () => undefined
        );

      sucursalServiceMock.cambiarEstado
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      const cargarSpy =
        vi.spyOn(
          component,
          'cargarSucursales'
        ).mockImplementation(
          () => undefined
        );

      component.cambiarEstado(
        sucursalActiva
      );

      expect(cargarSpy)
        .not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

  });

  describe('abrirConfirmacion', () => {

    it('debe abrir el diálogo', () => {
      component.abrirConfirmacion({
        title: 'Título',
        message: 'Mensaje',
        confirmText: 'Aceptar',
        type: 'warning',
        action: vi.fn()
      });

      expect(component.showConfirmDialog)
        .toBe(true);
    });

    it('debe almacenar el título', () => {
      component.abrirConfirmacion({
        title: 'Confirmar cambio',
        message: 'Mensaje',
        confirmText: 'Aceptar',
        type: 'warning',
        action: vi.fn()
      });

      expect(component.confirmTitle)
        .toBe('Confirmar cambio');
    });

    it('debe almacenar el mensaje', () => {
      component.abrirConfirmacion({
        title: 'Título',
        message:
          'Esta acción modificará la sucursal',
        confirmText: 'Aceptar',
        type: 'warning',
        action: vi.fn()
      });

      expect(component.confirmMessage)
        .toBe(
          'Esta acción modificará la sucursal'
        );
    });

    it('debe almacenar el texto de confirmación', () => {
      component.abrirConfirmacion({
        title: 'Título',
        message: 'Mensaje',
        confirmText: 'Continuar',
        type: 'warning',
        action: vi.fn()
      });

      expect(component.confirmText)
        .toBe('Continuar');
    });

    it('debe almacenar el tipo warning', () => {
      component.abrirConfirmacion({
        title: 'Título',
        message: 'Mensaje',
        confirmText: 'Aceptar',
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
        confirmText: 'Deshabilitar',
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
        confirmText: 'Aceptar',
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

      component.pendingAction =
        action;

      component.confirmarAccion();

      expect(action)
        .toHaveBeenCalledOnce();
    });

    it('debe cerrar el diálogo después de ejecutar la acción', () => {
      component.showConfirmDialog =
        true;

      component.pendingAction =
        vi.fn();

      component.confirmarAccion();

      expect(component.showConfirmDialog)
        .toBe(false);

      expect(component.pendingAction)
        .toBeNull();
    });

    it('debe ejecutar la acción antes de cerrar el diálogo', () => {
      const action = vi.fn();

      component.pendingAction =
        action;

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

    it('debe cerrar el diálogo aunque no exista una acción pendiente', () => {
      component.showConfirmDialog =
        true;

      component.pendingAction =
        null;

      component.confirmarAccion();

      expect(component.showConfirmDialog)
        .toBe(false);

      expect(component.pendingAction)
        .toBeNull();
    });

  });

  describe('cerrarConfirmacion', () => {

    it('debe cerrar el diálogo', () => {
      component.showConfirmDialog =
        true;

      component.cerrarConfirmacion();

      expect(component.showConfirmDialog)
        .toBe(false);
    });

    it('debe limpiar la acción pendiente', () => {
      component.pendingAction =
        vi.fn();

      component.cerrarConfirmacion();

      expect(component.pendingAction)
        .toBeNull();
    });

    it('debe conservar los textos configurados', () => {
      component.confirmTitle =
        'Título previo';

      component.confirmMessage =
        'Mensaje previo';

      component.confirmText =
        'Aceptar';

      component.cerrarConfirmacion();

      expect(component.confirmTitle)
        .toBe('Título previo');

      expect(component.confirmMessage)
        .toBe('Mensaje previo');

      expect(component.confirmText)
        .toBe('Aceptar');
    });

  });

  describe('Plantilla de acciones', () => {

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
              '.branch-item'
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

      editar!.click();

      expect(editarSpy)
        .toHaveBeenCalledOnce();

      expect(editarSpy)
        .toHaveBeenCalledWith(
          sucursalActiva
        );
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
              '.branch-item'
            )
        ) as HTMLElement[];

      const botones =
        Array.from(
          items[0].querySelectorAll(
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
          sucursalActiva
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
              '.branch-item'
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

      activar!.click();

      expect(solicitarSpy)
        .toHaveBeenCalledOnce();

      expect(solicitarSpy)
        .toHaveBeenCalledWith(
          sucursalInactiva
        );
    });

  });

  describe('Plantilla del diálogo de confirmación', () => {

    it('debe enviar las propiedades configuradas al componente hijo', () => {
      component.abrirConfirmacion({
        title:
          'Deshabilitar sucursal',
        message:
          'La sucursal dejará de estar disponible.',
        confirmText:
          'Deshabilitar',
        type:
          'danger',
        action:
          vi.fn()
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
        .toBe(
          'Deshabilitar sucursal'
        );

      expect(dialog.message)
        .toBe(
          'La sucursal dejará de estar disponible.'
        );

      expect(dialog.confirmText)
        .toBe('Deshabilitar');

      expect(dialog.type)
        .toBe('danger');
    });

    it('debe ejecutar confirmarAccion cuando el diálogo emite confirmed', () => {
      const confirmarSpy =
        vi.spyOn(
          component,
          'confirmarAccion'
        ).mockImplementation(
          () => undefined
        );

      fixture.detectChanges();

      const dialogDebug =
        fixture.debugElement.query(
          debugElement =>
            debugElement.name ===
            'app-confirmation-dialog'
        );

      dialogDebug.componentInstance.confirmed.emit();

      expect(confirmarSpy)
        .toHaveBeenCalledOnce();
    });

    it('debe ejecutar cerrarConfirmacion cuando el diálogo emite cancelled', () => {
      const cerrarSpy =
        vi.spyOn(
          component,
          'cerrarConfirmacion'
        ).mockImplementation(
          () => undefined
        );

      fixture.detectChanges();

      const dialogDebug =
        fixture.debugElement.query(
          debugElement =>
            debugElement.name ===
            'app-confirmation-dialog'
        );

      dialogDebug.componentInstance.cancelled.emit();

      expect(cerrarSpy)
        .toHaveBeenCalledOnce();
    });

  });

  


});