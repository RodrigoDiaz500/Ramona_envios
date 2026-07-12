import { TestBed } from '@angular/core/testing';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  AppNotification,
  NotificationService
} from './notification.service';

describe('NotificationService', () => {

  let service: NotificationService;

  beforeEach(() => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        NotificationService
      ]
    });

    service =
      TestBed.inject(NotificationService);
  });

  describe('Creación del servicio', () => {

    it('debe crearse correctamente', () => {
      expect(service).toBeTruthy();
    });

    it('debe exponer el observable de notificaciones', () => {
      expect(service.notifications$)
        .toBeDefined();
    });

  });

  describe('show', () => {

    it('debe emitir una notificación success por defecto', () => {
      let resultado:
        AppNotification | undefined;

      service.notifications$
        .subscribe(notification => {
          resultado = notification;
        });

      service.show(
        'Operación exitosa',
        'El registro fue guardado correctamente'
      );

      expect(resultado).toEqual({
        title: 'Operación exitosa',
        message:
          'El registro fue guardado correctamente',
        type: 'success'
      });
    });

    it('debe emitir una notificación success explícita', () => {
      let resultado:
        AppNotification | undefined;

      service.notifications$
        .subscribe(notification => {
          resultado = notification;
        });

      service.show(
        'Éxito',
        'La solicitud fue creada',
        'success'
      );

      expect(resultado?.type)
        .toBe('success');

      expect(resultado?.title)
        .toBe('Éxito');

      expect(resultado?.message)
        .toBe('La solicitud fue creada');
    });

    it('debe emitir una notificación warning', () => {
      let resultado:
        AppNotification | undefined;

      service.notifications$
        .subscribe(notification => {
          resultado = notification;
        });

      service.show(
        'Advertencia',
        'La solicitud requiere revisión',
        'warning'
      );

      expect(resultado).toEqual({
        title: 'Advertencia',
        message:
          'La solicitud requiere revisión',
        type: 'warning'
      });
    });

    it('debe emitir una notificación error', () => {
      let resultado:
        AppNotification | undefined;

      service.notifications$
        .subscribe(notification => {
          resultado = notification;
        });

      service.show(
        'Error',
        'No fue posible completar la operación',
        'error'
      );

      expect(resultado).toEqual({
        title: 'Error',
        message:
          'No fue posible completar la operación',
        type: 'error'
      });
    });

    it('debe emitir el título recibido sin modificarlo', () => {
      let titulo:
        string | undefined;

      service.notifications$
        .subscribe(notification => {
          titulo = notification.title;
        });

      service.show(
        'Título personalizado',
        'Mensaje',
        'success'
      );

      expect(titulo)
        .toBe('Título personalizado');
    });

    it('debe emitir el mensaje recibido sin modificarlo', () => {
      let mensaje:
        string | undefined;

      service.notifications$
        .subscribe(notification => {
          mensaje = notification.message;
        });

      service.show(
        'Título',
        'Mensaje personalizado',
        'success'
      );

      expect(mensaje)
        .toBe('Mensaje personalizado');
    });

    it('debe emitir una notificación por cada llamada', () => {
      const notificaciones:
        AppNotification[] = [];

      service.notifications$
        .subscribe(notification => {
          notificaciones.push(notification);
        });

      service.show(
        'Primera',
        'Primer mensaje',
        'success'
      );

      service.show(
        'Segunda',
        'Segundo mensaje',
        'warning'
      );

      service.show(
        'Tercera',
        'Tercer mensaje',
        'error'
      );

      expect(notificaciones)
        .toHaveLength(3);

      expect(notificaciones[0].type)
        .toBe('success');

      expect(notificaciones[1].type)
        .toBe('warning');

      expect(notificaciones[2].type)
        .toBe('error');
    });

    it('debe notificar a múltiples suscriptores', () => {
      const primerSuscriptor =
        vi.fn();

      const segundoSuscriptor =
        vi.fn();

      service.notifications$
        .subscribe(primerSuscriptor);

      service.notifications$
        .subscribe(segundoSuscriptor);

      service.show(
        'Notificación compartida',
        'Mensaje para todos',
        'success'
      );

      expect(primerSuscriptor)
        .toHaveBeenCalledOnce();

      expect(segundoSuscriptor)
        .toHaveBeenCalledOnce();

      expect(primerSuscriptor)
        .toHaveBeenCalledWith({
          title: 'Notificación compartida',
          message: 'Mensaje para todos',
          type: 'success'
        });

      expect(segundoSuscriptor)
        .toHaveBeenCalledWith({
          title: 'Notificación compartida',
          message: 'Mensaje para todos',
          type: 'success'
        });
    });

    it('no debe emitir valores antes de llamar a show', () => {
      const suscriptor =
        vi.fn();

      service.notifications$
        .subscribe(suscriptor);

      expect(suscriptor)
        .not.toHaveBeenCalled();
    });

    it('debe dejar de notificar cuando un suscriptor se desuscribe', () => {
      const suscriptor =
        vi.fn();

      const subscription =
        service.notifications$
          .subscribe(suscriptor);

      service.show(
        'Primera',
        'Antes de desuscribirse'
      );

      subscription.unsubscribe();

      service.show(
        'Segunda',
        'Después de desuscribirse'
      );

      expect(suscriptor)
        .toHaveBeenCalledTimes(1);

      expect(suscriptor)
        .toHaveBeenCalledWith({
          title: 'Primera',
          message: 'Antes de desuscribirse',
          type: 'success'
        });
    });

    it('debe permitir títulos y mensajes vacíos', () => {
      let resultado:
        AppNotification | undefined;

      service.notifications$
        .subscribe(notification => {
          resultado = notification;
        });

      service.show(
        '',
        '',
        'warning'
      );

      expect(resultado).toEqual({
        title: '',
        message: '',
        type: 'warning'
      });
    });

  });

});