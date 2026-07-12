import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { ReviewManagement } from './review-management';
import {
  Resena,
  ResenaService
} from '../../../../core/services/resena.service';

describe('ReviewManagement', () => {

  let component: ReviewManagement;
  let fixture: ComponentFixture<ReviewManagement>;

  let serviceMock: {
    listar: ReturnType<typeof vi.fn>;
  };

  const review1: Resena = {
    id: 1,
    codigoSeguimiento: 'RAM-000001',
    usuarioNombre: 'Rodrigo Díaz',
    comentario: 'Excelente servicio.',
    calificacion: 5,
    fechaCreacion: '2026-07-12T10:00:00'
  };

  const review2: Resena = {
    id: 2,
    codigoSeguimiento: 'RAM-000002',
    usuarioNombre: 'María Soto',
    comentario: 'Llegó con retraso.',
    calificacion: 2,
    fechaCreacion: '2026-07-12T11:00:00'
  };

  beforeEach(async () => {

    serviceMock = {
      listar: vi.fn().mockReturnValue(
        of({
          success: true,
          data: [
            review1,
            review2
          ]
        })
      )
    };

    await TestBed.configureTestingModule({
      imports: [
        ReviewManagement
      ],
      providers: [
        {
          provide: ResenaService,
          useValue: serviceMock
        }
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        ReviewManagement
      );

    component =
      fixture.componentInstance;
  });

  describe('Creación', () => {

    it('debe crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debe iniciar sin reseñas', () => {
      expect(component.reviews)
        .toEqual([]);
    });

    it('debe iniciar loading en false', () => {
      expect(component.loading)
        .toBe(false);
    });

  });

  describe('ngOnInit', () => {

    it('debe llamar cargarResenas', () => {

      const spy =
        vi.spyOn(
          component,
          'cargarResenas'
        );

      component.ngOnInit();

      expect(spy)
        .toHaveBeenCalledOnce();

    });

  });

  describe('cargarResenas', () => {

    it('debe llamar al servicio', () => {

      component.cargarResenas();

      expect(serviceMock.listar)
        .toHaveBeenCalledOnce();

    });

    it('debe activar loading mientras espera', () => {

      const subject =
        new Subject<any>();

      serviceMock.listar
        .mockReturnValue(
          subject.asObservable()
        );

      component.cargarResenas();

      expect(component.loading)
        .toBe(true);

      subject.next({
        success: true,
        data: []
      });

      subject.complete();

      expect(component.loading)
        .toBe(false);

    });

    it('debe guardar las reseñas', () => {

      component.cargarResenas();

      expect(component.reviews)
        .toHaveLength(2);

    });

    it('debe conservar códigos de seguimiento', () => {

      component.cargarResenas();

      expect(
        component.reviews[0]
          .codigoSeguimiento
      ).toBe('RAM-000001');

    });

    it('debe manejar data nula', () => {

      serviceMock.listar
        .mockReturnValue(
          of({
            success: true,
            data: null
          })
        );

      component.cargarResenas();

      expect(component.reviews)
        .toEqual([]);

    });

    it('debe limpiar reseñas cuando ocurre error', () => {

      const consoleSpy =
        vi.spyOn(console, 'error')
          .mockImplementation(
            () => undefined
          );

      serviceMock.listar
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.reviews = [
        review1
      ];

      component.cargarResenas();

      expect(component.reviews)
        .toEqual([]);

      expect(component.loading)
        .toBe(false);

      consoleSpy.mockRestore();

    });

  });

  describe('Plantilla', () => {

    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debe mostrar el título', () => {

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Gestión de Reseñas'
      );

    });

    it('debe mostrar el subtítulo', () => {

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Opiniones y evaluaciones realizadas por los clientes.'
      );

    });

    it('debe mostrar dos reseñas', () => {

      const cards =
        fixture.nativeElement
          .querySelectorAll(
            '.review-item'
          );

      expect(cards.length)
        .toBe(2);

    });

    it('debe mostrar los códigos', () => {

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'RAM-000001'
      );

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'RAM-000002'
      );

    });

    it('debe mostrar usuarios', () => {

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Rodrigo Díaz'
      );

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'María Soto'
      );

    });

    it('debe mostrar comentarios', () => {

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Excelente servicio.'
      );

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Llegó con retraso.'
      );

    });

    it('debe mostrar cinco estrellas para la primera reseña', () => {
      const stars =
        fixture.nativeElement
          .querySelectorAll('.stars')[0];

      const contenido =
        stars.textContent
          ?.replace(/\s+/g, '');

      expect(contenido)
        .toBe('★★★★★');
    });

    it('debe mostrar dos estrellas llenas para la segunda reseña', () => {
      const stars =
        fixture.nativeElement
          .querySelectorAll('.stars')[1];

      const contenido =
        stars.textContent
          ?.replace(/\s+/g, '');

      expect(contenido)
        .toBe('★★☆☆☆');
    });

  });

  describe('Estados vacíos', () => {

    it('debe mostrar loading', () => {

      const subject =
        new Subject<any>();

      serviceMock.listar
        .mockReturnValue(
          subject.asObservable()
        );

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'Cargando reseñas...'
      );

    });

    it('debe mostrar mensaje cuando no existen reseñas', () => {

      serviceMock.listar
        .mockReturnValue(
          of({
            success: true,
            data: []
          })
        );

      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'No hay reseñas registradas.'
      );

    });

  });

});